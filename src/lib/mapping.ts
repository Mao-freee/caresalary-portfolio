/*
  列名の自動マッピング（デモ2の中核・このソフトならではの強み）
  ------------------------------------------------------------------
  施設ごとにバラバラな列名（「氏名」「職員氏名」「name」…）を、正規の項目へ対応づける。
  同義語辞書 + 部分一致 + 文字bigramの類似度で候補を出し、確信度で「自動」か「要確認」を分ける。
  ※ AIが担うのはあくまで候補提示まで。最終的な対応の確定は人間が行う前提の設計。
*/

export type CanonicalField =
  | 'name'
  | 'qualification'
  | 'role'
  | 'nightShifts'
  | 'baseHours'
  | 'concurrentFacility'
  | 'concurrentHours'

export const canonicalLabel: Record<CanonicalField, string> = {
  name: '氏名',
  qualification: '資格',
  role: '役職',
  nightShifts: '夜勤回数',
  baseHours: '当月勤務時間',
  concurrentFacility: '兼務先',
  concurrentHours: '兼務先勤務時間',
}

const synonyms: Record<CanonicalField, string[]> = {
  name: ['氏名', '職員氏名', '職員名', '名前', 'name', '氏名漢字'],
  qualification: ['資格', '保有資格', '資格区分', '資格名', 'shikaku', 'qualification'],
  role: ['役職', '職位', '役割', 'role', 'position'],
  nightShifts: ['夜勤回数', '夜勤日数', '夜勤', '夜勤回', 'night', 'night_count', 'nights'],
  baseHours: ['当月勤務時間', '勤務時間', '総労働時間', '労働時間', '当月時間', 'hours', 'work_hours'],
  concurrentFacility: ['兼務先', '兼務', '兼務施設', 'concurrent', 'kenmu'],
  concurrentHours: ['兼務先勤務時間', '兼務時間', '兼務先時間', 'concurrent_hours', 'kenmu_hours'],
}

/** 記号・空白・単位を落として素朴に正規化する。 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '') // 「夜勤(回)」→「夜勤」
    .replace(/[\s　_\-/]/g, '')
    .replace(/[()（）]/g, '')
    .trim()
}

/** 文字bigramのDice係数（0〜1）。 */
function diceSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0
  const bigrams = (s: string) => {
    const m = new Map<string, number>()
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2)
      m.set(g, (m.get(g) ?? 0) + 1)
    }
    return m
  }
  const ma = bigrams(a)
  const mb = bigrams(b)
  let overlap = 0
  for (const [g, ca] of ma) {
    const cb = mb.get(g)
    if (cb) overlap += Math.min(ca, cb)
  }
  return (2 * overlap) / (a.length - 1 + (b.length - 1))
}

/** 生ヘッダ1つと正規項目1つの一致スコア（0〜1）。 */
function scoreField(rawHeader: string, field: CanonicalField): number {
  const h = normalize(rawHeader)
  let best = 0
  for (const syn of synonyms[field]) {
    const n = normalize(syn)
    let score = 0
    if (h === n) score = 1
    else if (h.includes(n) || n.includes(h)) score = 0.82
    else score = diceSimilarity(h, n) * 0.9
    best = Math.max(best, score)
  }
  return best
}

export type ColumnMapping = {
  rawHeader: string
  field: CanonicalField | null
  confidence: number
  /** 確信度が高く自動採用できるか（false は「要確認」） */
  auto: boolean
}

const AUTO_THRESHOLD = 0.9
const CANDIDATE_THRESHOLD = 0.5

/**
 * 生ヘッダ配列を正規項目へ対応づける。
 * 1項目=1列になるよう、スコアの高い組から貪欲に確定する。
 */
export function mapHeaders(rawHeaders: string[]): ColumnMapping[] {
  const fields = Object.keys(synonyms) as CanonicalField[]

  // すべての (ヘッダ, 項目) の組をスコア化
  const pairs: { hi: number; field: CanonicalField; score: number }[] = []
  rawHeaders.forEach((raw, hi) => {
    for (const field of fields) {
      const score = scoreField(raw, field)
      if (score >= CANDIDATE_THRESHOLD) pairs.push({ hi, field, score })
    }
  })
  pairs.sort((a, b) => b.score - a.score)

  const usedHeader = new Set<number>()
  const usedField = new Set<CanonicalField>()
  const assigned = new Map<number, { field: CanonicalField; score: number }>()
  for (const p of pairs) {
    if (usedHeader.has(p.hi) || usedField.has(p.field)) continue
    usedHeader.add(p.hi)
    usedField.add(p.field)
    assigned.set(p.hi, { field: p.field, score: p.score })
  }

  return rawHeaders.map((raw, hi) => {
    const a = assigned.get(hi)
    if (!a) return { rawHeader: raw, field: null, confidence: 0, auto: false }
    return {
      rawHeader: raw,
      field: a.field,
      confidence: a.score,
      auto: a.score >= AUTO_THRESHOLD,
    }
  })
}
