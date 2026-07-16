/*
  手当・勤怠突合（デモ2）
  ------------------------------------------------------------------
  施設ごとにフォーマットの違う勤怠データを取り込み、列名を自動マッピングして正規化し、
  夜勤手当・資格手当・兼務按分を計算する。兼務先の時間が未確定なら按分せず保留で止める。
*/
import { mapHeaders, canonicalLabel, type CanonicalField, type ColumnMapping } from './mapping'
import { roundYen } from './ruleEngine'

export type Demo2Facility = {
  id: string
  name: string
  /** データの出所（Excel手入力・勤怠システムCSV 等） */
  source: string
  /** 生のヘッダ（施設ごとにバラバラ） */
  columns: string[]
  /** 生ヘッダをキーにした行データ */
  rows: Record<string, string | number>[]
}

export type Demo2Dataset = {
  corpName: string
  targetMonth: string
  allowances: {
    nightRate: number
    qual: Record<string, number>
  }
  facilities: Demo2Facility[]
}

export type CanonRow = {
  facilityId: string
  facilityName: string
  name: string
  qualification: string
  role: string
  nightShifts: number
  baseHours: number
  concurrentFacility: string | null
  /** 兼務先の勤務時間。兼務ありで未入力なら null（→ 保留） */
  concurrentHours: number | null
}

/** マッピング結果を使って生行を正規行に変換する。 */
export function parseFacility(facility: Demo2Facility, mapping: ColumnMapping[]): CanonRow[] {
  const byField = new Map<CanonicalField, string>()
  for (const m of mapping) {
    if (m.field) byField.set(m.field, m.rawHeader)
  }
  const get = (row: Record<string, string | number>, field: CanonicalField) => {
    const key = byField.get(field)
    return key === undefined ? undefined : row[key]
  }
  const numOrNull = (v: string | number | undefined): number | null => {
    if (v === undefined || v === '' || v === null) return null
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''))
    return Number.isFinite(n) ? n : null
  }

  return facility.rows.map((row) => {
    const concurrentFacilityRaw = get(row, 'concurrentFacility')
    const concurrentFacility =
      concurrentFacilityRaw === undefined || concurrentFacilityRaw === ''
        ? null
        : String(concurrentFacilityRaw)
    return {
      facilityId: facility.id,
      facilityName: facility.name,
      name: String(get(row, 'name') ?? '（氏名不明）'),
      qualification: String(get(row, 'qualification') ?? '無資格'),
      role: String(get(row, 'role') ?? '一般'),
      nightShifts: numOrNull(get(row, 'nightShifts')) ?? 0,
      baseHours: numOrNull(get(row, 'baseHours')) ?? 0,
      concurrentFacility,
      concurrentHours: concurrentFacility ? numOrNull(get(row, 'concurrentHours')) : null,
    }
  })
}

export type Proration = {
  awayFacility: string
  homeRatio: number
  awayRatio: number
  homeShare: number
  awayShare: number
}

export type TeateResult = {
  row: CanonRow
  status: 'ok' | 'hold'
  nightAllowance: number
  /** 資格手当（按分前の総額） */
  qualAllowance: number
  proration: Proration | null
  /** 自施設に計上する合計（夜勤手当 + 資格手当の自施設分）。保留のときは null */
  homeTotal: number | null
  reasons: string[]
}

export function evaluateTeate(row: CanonRow, ds: Demo2Dataset): TeateResult {
  const nightAllowance = row.nightShifts * ds.allowances.nightRate
  const qualAllowance = ds.allowances.qual[row.qualification] ?? 0

  // 兼務なし
  if (!row.concurrentFacility) {
    return {
      row,
      status: 'ok',
      nightAllowance,
      qualAllowance,
      proration: null,
      homeTotal: nightAllowance + qualAllowance,
      reasons: [],
    }
  }

  // 兼務ありだが兼務先時間が未確定 → 保留
  if (row.concurrentHours === null || row.baseHours <= 0) {
    return {
      row,
      status: 'hold',
      nightAllowance,
      qualAllowance,
      proration: null,
      homeTotal: null,
      reasons: ['兼務先の勤務時間が未確定のため、資格手当を按分できません。'],
    }
  }

  // 兼務按分（資格手当を勤務時間比で分ける。夜勤手当は自施設に計上）
  const total = row.baseHours + row.concurrentHours
  const homeRatio = row.baseHours / total
  const homeShare = roundYen(qualAllowance * homeRatio)
  const awayShare = qualAllowance - homeShare
  return {
    row,
    status: 'ok',
    nightAllowance,
    qualAllowance,
    proration: {
      awayFacility: row.concurrentFacility,
      homeRatio,
      awayRatio: 1 - homeRatio,
      homeShare,
      awayShare,
    },
    homeTotal: nightAllowance + homeShare,
    reasons: [],
  }
}

export type FacilityMapping = {
  facility: Demo2Facility
  mapping: ColumnMapping[]
  autoCount: number
  reviewCount: number
}

export type Demo2Result = {
  dataset: Demo2Dataset
  mappings: FacilityMapping[]
  results: TeateResult[]
  summary: {
    total: number
    hold: number
    prorated: number
    nightTotal: number
    qualTotal: number
    grandTotal: number
    /** 自動でマッピングできた列数 / 全列数 */
    autoColumns: number
    totalColumns: number
  }
}

export function reconcileTeate(ds: Demo2Dataset): Demo2Result {
  const mappings: FacilityMapping[] = ds.facilities.map((facility) => {
    const mapping = mapHeaders(facility.columns)
    return {
      facility,
      mapping,
      autoCount: mapping.filter((m) => m.auto).length,
      reviewCount: mapping.filter((m) => !m.auto).length,
    }
  })

  const results: TeateResult[] = []
  for (const fm of mappings) {
    const rows = parseFacility(fm.facility, fm.mapping)
    for (const r of rows) results.push(evaluateTeate(r, ds))
  }

  const ok = results.filter((r) => r.status === 'ok')
  const summary = {
    total: results.length,
    hold: results.filter((r) => r.status === 'hold').length,
    prorated: results.filter((r) => r.proration).length,
    nightTotal: ok.reduce((s, r) => s + r.nightAllowance, 0),
    qualTotal: ok.reduce((s, r) => s + (r.proration ? r.proration.homeShare : r.qualAllowance), 0),
    grandTotal: ok.reduce((s, r) => s + (r.homeTotal ?? 0), 0),
    autoColumns: mappings.reduce((s, m) => s + m.autoCount, 0),
    totalColumns: mappings.reduce((s, m) => s + m.mapping.length, 0),
  }

  return { dataset: ds, mappings, results, summary }
}

export { canonicalLabel }
