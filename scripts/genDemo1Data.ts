/*
  デモ1の架空データ（50名）を生成して src/data/demo1.json に書き出す。
  実行: npm run gen:demo1  （= node scripts/genDemo1Data.ts）

  差異シナリオは「現行額を “誤った前提” で作る」ことで、ルールエンジンの
  理由候補推定（再現による推定）が確実に効くようにしている。実データは一切使わない。
*/
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import {
  BASE_POINTS,
  QUAL_WEIGHT,
  ROLE_WEIGHT,
  TENURE_BRACKETS,
  tenureYears,
  roundYen,
  type Staff,
  type Facility,
  type Dataset,
  type Qualification,
  type Role,
} from '../src/lib/ruleEngine.ts'

const TARGET_MONTH = '2025-06'

const facilities: Facility[] = [
  { id: 'sakura', name: '桜ケ丘の家', rate: 250, pool: 1_650_000 },
  { id: 'midori', name: 'みどり苑', rate: 240, pool: 1_280_000 },
  { id: 'aoba', name: 'あおばデイサービス', rate: 235, pool: 720_000 },
]

// ── 決定的な擬似乱数（再現性のため seed 固定） ──
let seed = 20250601
function rand() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

const surnames = [
  '佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤',
  '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水',
  '森', '池田', '橋本', '石川', '前田', '藤田', '後藤', '岡田', '長谷川', '村上',
]
const givenF = ['美咲', '結衣', '里佳', '陽子', '直美', '彩', '愛', '真由美', '香織', '瞳', '恵', '智子']
const givenM = ['一郎', '健太', '大輔', '翔', '拓也', '慎一', '亮', '和也', '誠', '直樹', '悟', '隆']
const jobTypes = ['介護職員', '介護職員', '介護職員', '介護職員', '看護職員', '生活相談員']

function nameGen(): string {
  const s = pick(surnames)
  const g = rand() < 0.62 ? pick(givenF) : pick(givenM)
  return `${s} ${g}`
}

/** 目標の勤続年数にちょうど収まる入職日を作る（適用月2025-06より前の月に固定して満年数を安定させる）。 */
function hireDateForYears(years: number): string {
  const y = 2025 - years
  const m = 1 + Math.floor(rand() * 5) // 1〜5月（6月より前 → 満年数が years に一致）
  const d = 1 + Math.floor(rand() * 27)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function rawAmount(rate: number, qualW: number, tenureW: number, roleW: number, fte: number): number {
  return rate * BASE_POINTS * qualW * tenureW * roleW * fte
}

type Scenario =
  | 'match'
  | 'diff-tenure'
  | 'diff-qual'
  | 'diff-role'
  | 'diff-fte'
  | 'diff-round'
  | 'diff-taigai'
  | 'hold-qual'
  | 'hold-career'
  | 'hold-concurrent'

// 50名の内訳（合計50）
const plan: Scenario[] = [
  ...Array(33).fill('match'),
  ...Array(3).fill('diff-tenure'),
  ...Array(3).fill('diff-qual'),
  ...Array(2).fill('diff-role'),
  ...Array(2).fill('diff-fte'),
  ...Array(1).fill('diff-round'),
  ...Array(1).fill('diff-taigai'),
  ...Array(2).fill('hold-qual'),
  ...Array(2).fill('hold-career'),
  ...Array(1).fill('hold-concurrent'),
] as Scenario[]

// シャッフル（決定的）
for (let i = plan.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1))
  ;[plan[i], plan[j]] = [plan[j], plan[i]]
}

const quals: Qualification[] = ['介護福祉士', '実務者研修', '初任者研修', '無資格']
const roles: Role[] = ['一般', '一般', '一般', 'リーダー', '主任']

const staff: Staff[] = plan.map((scenario, i) => {
  const facility = facilities[i % 3]
  const id = `E${String(i + 1).padStart(3, '0')}`
  const name = nameGen()
  const jobType = pick(jobTypes)
  const employment = rand() < 0.72 ? '常勤' : '非常勤'
  const fteRatio = employment === '常勤' ? 1.0 : pick([0.5, 0.6, 0.75, 0.8])

  // 既定値
  let qualification: Qualification | null = pick(quals)
  let role: Role = pick(roles)
  let careerPathMet: boolean | null = true
  let wageReqMet = true
  let concurrent = false
  let concurrentHoursConfirmed = true
  let years = pick([1, 2, 4, 5, 6, 8, 10, 12, 16, 20])

  // シナリオごとに、現行額と入力値を組み立てる
  let currentAllocation = 0

  const rate = facility.rate

  const finalize = () => {
    const qi = quals.indexOf(qualification as Qualification)
    const qualW = QUAL_WEIGHT[qualification as Qualification]
    const bracket = TENURE_BRACKETS.find((b) => years < b.maxYears) ?? TENURE_BRACKETS[3]
    const roleW = ROLE_WEIGHT[role]
    return { qi, qualW, bracket, roleW }
  }

  switch (scenario) {
    case 'match': {
      const { qualW, bracket, roleW } = finalize()
      currentAllocation = roundYen(rawAmount(rate, qualW, bracket.weight, roleW, fteRatio))
      break
    }
    case 'diff-tenure': {
      // 現行は1つ前の勤続区分で算定されている
      years = pick([4, 5, 8, 10, 16]) // idx>0 の区分に入るように
      const { qualW, bracket, roleW } = finalize()
      const idx = TENURE_BRACKETS.findIndex((t) => t.label === bracket.label)
      const prev = TENURE_BRACKETS[Math.max(0, idx - 1)]
      currentAllocation = roundYen(rawAmount(rate, qualW, prev.weight, roleW, fteRatio))
      break
    }
    case 'diff-qual': {
      qualification = '介護福祉士' // 上位資格
      const { qualW, bracket, roleW } = finalize()
      // 現行は1つ下（実務者研修）で算定
      currentAllocation = roundYen(
        rawAmount(rate, QUAL_WEIGHT['実務者研修'], bracket.weight, roleW, fteRatio),
      )
      void qualW
      break
    }
    case 'diff-role': {
      role = pick(['リーダー', '主任'])
      const { qualW, bracket } = finalize()
      // 現行は一般で算定（役職未反映）
      currentAllocation = roundYen(
        rawAmount(rate, qualW, bracket.weight, ROLE_WEIGHT['一般'], fteRatio),
      )
      break
    }
    case 'diff-fte': {
      // 非常勤なのに常勤(1.0)で算定されている
      concurrent = false
      const forcedFte = pick([0.5, 0.6, 0.75])
      const { qualW, bracket, roleW } = finalize()
      currentAllocation = roundYen(rawAmount(rate, qualW, bracket.weight, roleW, 1.0))
      // fteRatio を強制的に按分値へ
      return {
        id, name, facilityId: facility.id, jobType,
        qualification, hireDate: hireDateForYears(years), employment: '非常勤',
        fteRatio: forcedFte, role, careerPathMet, wageReqMet,
        concurrent, concurrentHoursConfirmed, currentAllocation,
      }
    }
    case 'diff-round': {
      const { qualW, bracket, roleW } = finalize()
      const raw = rawAmount(rate, qualW, bracket.weight, roleW, fteRatio)
      // 原因を自動特定できない小さな差異（丸め順序の違い等）。
      // ツールが原因を推測せず「追加確認が必要」と提示する誠実なケースを1件用意する。
      currentAllocation = roundYen(raw) - pick([2, 3, 5])
      break
    }
    case 'diff-taigai': {
      // 現行は配分ありだが、キャリアパス要件未充足で対象外
      careerPathMet = false
      const { qualW, bracket, roleW } = finalize()
      currentAllocation = roundYen(rawAmount(rate, qualW, bracket.weight, roleW, fteRatio))
      break
    }
    case 'hold-qual': {
      const { qualW, bracket, roleW } = finalize()
      currentAllocation = roundYen(rawAmount(rate, qualW, bracket.weight, roleW, fteRatio))
      qualification = null // 資格未確認 → 保留
      break
    }
    case 'hold-career': {
      const { qualW, bracket, roleW } = finalize()
      currentAllocation = roundYen(rawAmount(rate, qualW, bracket.weight, roleW, fteRatio))
      careerPathMet = null // 未入力 → 保留
      break
    }
    case 'hold-concurrent': {
      concurrent = true
      concurrentHoursConfirmed = false
      const { qualW, bracket, roleW } = finalize()
      currentAllocation = roundYen(rawAmount(rate, qualW, bracket.weight, roleW, fteRatio))
      break
    }
  }

  return {
    id,
    name,
    facilityId: facility.id,
    jobType,
    qualification,
    hireDate: hireDateForYears(years),
    employment,
    fteRatio,
    role,
    careerPathMet,
    wageReqMet,
    concurrent,
    concurrentHoursConfirmed,
    currentAllocation,
  }
})

// 勤続年数の実測が想定ブラケットとズレないよう、hireDate は上で目標年数から作成済み。
// 生成結果の妥当性を軽く検証。
const badTenure = staff.filter((s) => {
  const y = tenureYears(s.hireDate, TARGET_MONTH)
  return y < 0 || y > 45
})
if (badTenure.length) {
  throw new Error('勤続年数が不正な職員がいます: ' + badTenure.map((s) => s.id).join(', '))
}

const dataset: Dataset = {
  corpName: '社会福祉法人 桜ケ丘福祉会（架空）',
  targetMonth: TARGET_MONTH,
  facilities,
  staff,
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '../src/data')
mkdirSync(outDir, { recursive: true })
const outPath = resolve(outDir, 'demo1.json')
writeFileSync(outPath, JSON.stringify(dataset, null, 2) + '\n', 'utf8')

console.log(`✓ 生成: ${outPath}`)
console.log(`  法人: ${dataset.corpName}`)
console.log(`  対象月: ${dataset.targetMonth} / 施設: ${facilities.length} / 職員: ${staff.length}名`)
