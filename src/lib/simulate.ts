/*
  人件費シミュレーション（デモ4）
  ------------------------------------------------------------------
  デモ1のデータを土台に、加算率の改定・増員・退職が人件費総額に与える影響を試算する。
  基本給は役職・勤続・資格・常勤換算から組み立てる（架空モデル）。加算は再計算額を用いる。
*/
import { reconcile, tenureYears, type Dataset, type Staff } from './ruleEngine'

const ROLE_BONUS: Record<string, number> = {
  一般: 0,
  リーダー: 20000,
  主任: 45000,
  管理者: 90000,
}
const QUAL_BONUS: Record<string, number> = {
  介護福祉士: 20000,
  実務者研修: 10000,
  初任者研修: 5000,
  無資格: 0,
}
const BASE = 200000

/** 職員の月額基本給（架空モデル）。 */
export function baseSalary(staff: Staff, targetMonth: string): number {
  const years = tenureYears(staff.hireDate, targetMonth)
  const tenureBonus = Math.min(years, 20) * 3000
  const roleBonus = ROLE_BONUS[staff.role] ?? 0
  const qualBonus = staff.qualification ? (QUAL_BONUS[staff.qualification] ?? 0) : 0
  return Math.round((BASE + roleBonus + qualBonus + tenureBonus) * staff.fteRatio)
}

export type Baseline = {
  headcount: number
  salarySum: number
  addendSum: number
  avgSalary: number
  avgAddend: number
  monthly: number
}

/** 現状（ベースライン）の人件費を集計する。 */
export function buildBaseline(dataset: Dataset): Baseline {
  const { results } = reconcile(dataset)
  let salarySum = 0
  let addendSum = 0
  for (const r of results) {
    salarySum += baseSalary(r.staff, dataset.targetMonth)
    // 加算は再計算額（保留は現行額を暫定計上）
    addendSum += r.recalculated ?? r.staff.currentAllocation
  }
  const headcount = results.length
  return {
    headcount,
    salarySum,
    addendSum,
    avgSalary: Math.round(salarySum / headcount),
    avgAddend: Math.round(addendSum / headcount),
    monthly: salarySum + addendSum,
  }
}

export type Scenario = {
  /** 加算率の増減（-0.1 = -10%） */
  kasanDelta: number
  /** 増員（人） */
  hires: number
  /** 退職（人） */
  leaves: number
}

export type SimResult = {
  baselineMonthly: number
  scenarioMonthly: number
  baselineAnnual: number
  scenarioAnnual: number
  monthlyDiff: number
  annualDiff: number
  headcount: number
  scenarioHeadcount: number
  // 構成（現状 / シナリオ）
  composition: {
    baseSalary: { base: number; scenario: number }
    addend: { base: number; scenario: number }
  }
  /** 12ヶ月推移（採用・退職を年内で徐々に反映） */
  series: { month: string; baseline: number; scenario: number }[]
}

/** シナリオを適用して人件費への影響を試算する。 */
export function simulate(base: Baseline, sc: Scenario, startMonth = 4): SimResult {
  const perHead = base.avgSalary + Math.round(base.avgAddend * (1 + sc.kasanDelta))
  const netHead = sc.hires - sc.leaves

  const scSalary = base.salarySum + (sc.hires - sc.leaves) * base.avgSalary
  const scAddend = Math.round(base.addendSum * (1 + sc.kasanDelta)) + netHead * Math.round(base.avgAddend * (1 + sc.kasanDelta))

  const baselineMonthly = base.monthly
  const scenarioMonthly = scSalary + scAddend

  // 12ヶ月推移：加算率改定は即時、増員・退職は年内に等分で反映
  const series = Array.from({ length: 12 }, (_, i) => {
    const ratio = (i + 1) / 12
    const headThisMonth = Math.round(netHead * ratio)
    const monthlyScenario =
      base.salarySum +
      Math.round(base.addendSum * (1 + sc.kasanDelta)) +
      headThisMonth * perHead
    const monthNum = ((startMonth - 1 + i) % 12) + 1
    return {
      month: `${monthNum}月`,
      baseline: base.monthly,
      scenario: monthlyScenario,
    }
  })

  return {
    baselineMonthly,
    scenarioMonthly,
    baselineAnnual: series.reduce((s, m) => s + m.baseline, 0),
    scenarioAnnual: series.reduce((s, m) => s + m.scenario, 0),
    monthlyDiff: scenarioMonthly - baselineMonthly,
    annualDiff: series.reduce((s, m) => s + m.scenario - m.baseline, 0),
    headcount: base.headcount,
    scenarioHeadcount: base.headcount + netHead,
    composition: {
      baseSalary: { base: base.salarySum, scenario: scSalary },
      addend: { base: base.addendSum, scenario: scAddend },
    },
    series,
  }
}
