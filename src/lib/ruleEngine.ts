/*
  照合台帳 ルールエンジン（共通の計算ロジック基盤）
  ------------------------------------------------------------------
  処遇改善加算の職員別配分額を「基本点 × 資格 × 勤続 × 役職 × 常勤換算」で算定する。
  ※ 本エンジンの重みや配分方式は【架空の配分ルール】であり、特定制度の正式な計算式では
    ありません。デモとして「再計算 → 差異検出 → 根拠提示 → 保留で停止」を示すためのものです。

  設計方針（PoCの受入条件に対応）:
    - 全対象者に「結果」か「例外（保留）」を必ず出す
    - 計算不能なケースは推測せず status='hold' で停止する
    - 入力値・適用ルール・計算過程（breakdown）を職員単位で残す
    - 現行との差異は理由候補を添えて分類する
*/

import type { ReconStatus } from './status'
export type { ReconStatus }

export type Qualification = '介護福祉士' | '実務者研修' | '初任者研修' | '無資格'
export type Employment = '常勤' | '非常勤'
export type Role = '一般' | 'リーダー' | '主任' | '管理者'

export type Staff = {
  id: string
  name: string
  facilityId: string
  jobType: string
  /** 資格。未確認は null（→ 保留） */
  qualification: Qualification | null
  /** 入職年月日（ISO: YYYY-MM-DD） */
  hireDate: string
  employment: Employment
  /** 常勤換算比率（0〜1） */
  fteRatio: number
  role: Role
  /** キャリアパス要件。true=充足 / false=未充足（対象外） / null=未入力（→ 保留） */
  careerPathMet: boolean | null
  /** 月額賃金改善要件を満たすか（false は対象外） */
  wageReqMet: boolean
  /** 兼務か */
  concurrent: boolean
  /** 兼務先の所定労働時間が確定しているか（兼務かつ未確定は → 保留） */
  concurrentHoursConfirmed: boolean
  /** 現行の確定配分額（検算の対象） */
  currentAllocation: number
}

export type Facility = {
  id: string
  name: string
  /** 1点あたりの配分単価（円）。架空の設定値。 */
  rate: number
  /** 月間の加算原資（円、参考表示用） */
  pool: number
}

export type Dataset = {
  corpName: string
  targetMonth: string // 'YYYY-MM'
  facilities: Facility[]
  staff: Staff[]
}

export type Breakdown = {
  basePoints: number
  qualification: Qualification
  qualWeight: number
  tenureYears: number
  tenureLabel: string
  tenureWeight: number
  role: Role
  roleWeight: number
  fteRatio: number
  rate: number
  /** 端数処理前の理論額 */
  rawAmount: number
}

export type StaffResult = {
  staff: Staff
  facility: Facility
  status: ReconStatus
  /** 再計算額。保留のときは null */
  recalculated: number | null
  /** 再計算 − 現行。保留のときは null */
  diff: number | null
  /** 差異の理由候補、または保留の理由 */
  reasons: string[]
  /** 計算根拠。保留で算定できないときは null */
  breakdown: Breakdown | null
}

// ── 重み（すべて架空の設定値。透明性のため公開して画面にも出す） ──

export const BASE_POINTS = 100

export const QUAL_WEIGHT: Record<Qualification, number> = {
  介護福祉士: 1.4,
  実務者研修: 1.2,
  初任者研修: 1.05,
  無資格: 1.0,
}

export const ROLE_WEIGHT: Record<Role, number> = {
  一般: 1.0,
  リーダー: 1.15,
  主任: 1.35,
  管理者: 1.6,
}

export const TENURE_BRACKETS: { maxYears: number; weight: number; label: string }[] = [
  { maxYears: 3, weight: 1.0, label: '3年未満' },
  { maxYears: 7, weight: 1.15, label: '3〜7年' },
  { maxYears: 15, weight: 1.3, label: '7〜15年' },
  { maxYears: Infinity, weight: 1.45, label: '15年以上' },
]

// ── 基本計算 ──

/** 適用月時点の勤続年数（満年数）。 */
export function tenureYears(hireDate: string, targetMonth: string): number {
  const hire = new Date(hireDate + 'T00:00:00')
  const [y, m] = targetMonth.split('-').map(Number)
  const ref = new Date(y, m - 1, 1)
  let years = ref.getFullYear() - hire.getFullYear()
  const monthDelta = ref.getMonth() - hire.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && ref.getDate() < hire.getDate())) {
    years -= 1
  }
  return Math.max(0, years)
}

export function tenureBracket(years: number) {
  return TENURE_BRACKETS.find((b) => years < b.maxYears) ?? TENURE_BRACKETS[TENURE_BRACKETS.length - 1]
}

/** 円未満は四捨五入（正式な配分ルール）。 */
export function roundYen(n: number): number {
  return Math.round(n)
}

/** 資格・勤続・役職・常勤換算から理論額を組み立てる（端数処理前）。 */
function buildBreakdown(staff: Staff, facility: Facility, targetMonth: string): Breakdown {
  const qualification = staff.qualification as Qualification // 呼び出し側で null を除外済み
  const qualWeight = QUAL_WEIGHT[qualification]
  const years = tenureYears(staff.hireDate, targetMonth)
  const bracket = tenureBracket(years)
  const roleWeight = ROLE_WEIGHT[staff.role]
  const rawAmount =
    facility.rate * BASE_POINTS * qualWeight * bracket.weight * roleWeight * staff.fteRatio
  return {
    basePoints: BASE_POINTS,
    qualification,
    qualWeight,
    tenureYears: years,
    tenureLabel: bracket.label,
    tenureWeight: bracket.weight,
    role: staff.role,
    roleWeight,
    fteRatio: staff.fteRatio,
    rate: facility.rate,
    rawAmount,
  }
}

/** 保留（計算不能）の理由を返す。無ければ null。 */
export function holdReason(staff: Staff): string | null {
  if (staff.qualification === null) {
    return '資格が未確認のため、適用する資格区分を判定できません。'
  }
  if (staff.careerPathMet === null) {
    return 'キャリアパス要件の充足状況が未入力のため、対象可否を判定できません。'
  }
  if (staff.concurrent && !staff.concurrentHoursConfirmed) {
    return '兼務先の所定労働時間が未確定で、按分の分母を確定できません。'
  }
  return null
}

/**
 * 差異の理由候補を推定する。
 * 「現行が別の前提（旧勤続区分・旧資格・按分違い・端数処理違い等）で計算されていないか」を
 * 実際に再計算して照合し、現行額に一致する前提を候補として返す。推測ではなく再現による推定。
 */
export function inferDiffReasons(
  staff: Staff,
  facility: Facility,
  targetMonth: string,
): string[] {
  if (staff.qualification === null) return []
  const b = buildBreakdown(staff, facility, targetMonth)
  const current = staff.currentAllocation
  const near = (amount: number) => Math.abs(roundYen(amount) - current) <= 100

  const factor = facility.rate * BASE_POINTS * b.fteRatio
  const reasons: string[] = []

  // 勤続年数の更新漏れ（1つ前の勤続区分で計算されている）
  const idx = TENURE_BRACKETS.findIndex((t) => t.label === b.tenureLabel)
  if (idx > 0) {
    const prev = TENURE_BRACKETS[idx - 1]
    if (near(factor * b.qualWeight * prev.weight * b.roleWeight)) {
      reasons.push(`勤続年数の更新漏れの可能性（現行は「${prev.label}」で算定）`)
    }
  }

  // 資格区分が旧区分のまま（1つ下の資格で計算されている）
  const qualOrder: Qualification[] = ['介護福祉士', '実務者研修', '初任者研修', '無資格']
  const qi = qualOrder.indexOf(b.qualification)
  if (qi >= 0 && qi < qualOrder.length - 1) {
    const lower = qualOrder[qi + 1]
    if (near(factor * QUAL_WEIGHT[lower] * b.tenureWeight * b.roleWeight)) {
      reasons.push(`資格区分が旧区分のままの可能性（現行は「${lower}」で算定）`)
    }
  }

  // 役職変更の未反映（役職手当ぶんが乗っていない＝一般で計算）
  if (b.role !== '一般' && near(factor * b.qualWeight * b.tenureWeight * ROLE_WEIGHT['一般'])) {
    reasons.push('役職変更の未反映の可能性（現行は「一般」で算定）')
  }

  // 常勤換算（按分率）の取り違え（フルタイム前提で計算）
  if (
    b.fteRatio < 1 &&
    Math.abs(
      roundYen(facility.rate * BASE_POINTS * 1.0 * b.qualWeight * b.tenureWeight * b.roleWeight) -
        current,
    ) <= 100
  ) {
    reasons.push('常勤換算（按分率）の取り違えの可能性（現行は常勤=1.0で算定）')
  }

  // 端数処理の相違（切り捨てで計算されている）
  if (Math.floor(b.rawAmount) === current && roundYen(b.rawAmount) !== current) {
    reasons.push('端数処理の相違の可能性（現行は円未満切り捨て）')
  }

  if (reasons.length === 0) {
    reasons.push('差額の原因を自動特定できませんでした。入力値の追加確認が必要です。')
  }
  return reasons.slice(0, 2)
}

/** 職員1名を評価する（照合の中核）。 */
export function evaluateStaff(
  staff: Staff,
  facility: Facility,
  targetMonth: string,
): StaffResult {
  const base = { staff, facility }

  // 1) まず保留（計算不能）かどうか
  const hold = holdReason(staff)
  if (hold) {
    return { ...base, status: 'hold', recalculated: null, diff: null, reasons: [hold], breakdown: null }
  }

  // 2) 対象外（要件未充足）→ 配分 0
  const eligible = staff.careerPathMet === true && staff.wageReqMet === true
  const breakdown = buildBreakdown(staff, facility, targetMonth)
  const recalculated = eligible ? roundYen(breakdown.rawAmount) : 0
  const diff = recalculated - staff.currentAllocation

  if (diff === 0) {
    return { ...base, status: 'match', recalculated, diff, reasons: [], breakdown }
  }

  if (!eligible) {
    const why = staff.wageReqMet === false ? '月額賃金改善要件' : 'キャリアパス要件'
    return {
      ...base,
      status: 'diff',
      recalculated,
      diff,
      reasons: [`${why}を満たさないため今回は対象外の可能性（現行は配分あり）`],
      breakdown,
    }
  }

  return {
    ...base,
    status: 'diff',
    recalculated,
    diff,
    reasons: inferDiffReasons(staff, facility, targetMonth),
    breakdown,
  }
}

export type ReconSummary = {
  total: number
  match: number
  diff: number
  hold: number
  /** 差異の純額合計（再計算 − 現行） */
  netDiff: number
  /** 現行の配分総額（保留を除く） */
  currentTotal: number
  /** 再計算の配分総額（保留を除く） */
  recalcTotal: number
}

export type ReconResult = {
  dataset: Dataset
  results: StaffResult[]
  summary: ReconSummary
}

/** データセット全体を照合する。 */
export function reconcile(dataset: Dataset): ReconResult {
  const facilityById = new Map(dataset.facilities.map((f) => [f.id, f]))
  const results = dataset.staff.map((s) => {
    const facility = facilityById.get(s.facilityId)
    if (!facility) {
      throw new Error(`未知の施設ID: ${s.facilityId}（職員 ${s.id}）`)
    }
    return evaluateStaff(s, facility, dataset.targetMonth)
  })

  const summary: ReconSummary = {
    total: results.length,
    match: results.filter((r) => r.status === 'match').length,
    diff: results.filter((r) => r.status === 'diff').length,
    hold: results.filter((r) => r.status === 'hold').length,
    netDiff: results.reduce((s, r) => s + (r.diff ?? 0), 0),
    currentTotal: results
      .filter((r) => r.status !== 'hold')
      .reduce((s, r) => s + r.staff.currentAllocation, 0),
    recalcTotal: results
      .filter((r) => r.status !== 'hold')
      .reduce((s, r) => s + (r.recalculated ?? 0), 0),
  }

  return { dataset, results, summary }
}
