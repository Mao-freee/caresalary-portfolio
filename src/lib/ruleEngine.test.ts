import { describe, it, expect } from 'vitest'
import {
  tenureYears,
  tenureBracket,
  evaluateStaff,
  inferDiffReasons,
  reconcile,
  QUAL_WEIGHT,
  ROLE_WEIGHT,
  BASE_POINTS,
  roundYen,
  type Staff,
  type Facility,
  type Dataset,
} from './ruleEngine'
import demo1 from '../data/demo1.json'

const facility: Facility = { id: 'f', name: 'テスト施設', rate: 250, pool: 0 }

function makeStaff(overrides: Partial<Staff> = {}): Staff {
  return {
    id: 'X001',
    name: 'テスト 太郎',
    facilityId: 'f',
    jobType: '介護職員',
    qualification: '介護福祉士',
    hireDate: '2020-04-01',
    employment: '常勤',
    fteRatio: 1.0,
    role: '一般',
    careerPathMet: true,
    wageReqMet: true,
    concurrent: false,
    concurrentHoursConfirmed: true,
    currentAllocation: 0,
    ...overrides,
  }
}

describe('勤続年数', () => {
  it('適用月時点の満年数を返す', () => {
    expect(tenureYears('2020-04-01', '2025-06')).toBe(5)
    expect(tenureYears('2025-01-01', '2025-06')).toBe(0)
    expect(tenureYears('2010-03-15', '2025-06')).toBe(15)
  })
  it('区分の境界', () => {
    expect(tenureBracket(2).label).toBe('3年未満')
    expect(tenureBracket(3).label).toBe('3〜7年')
    expect(tenureBracket(7).label).toBe('7〜15年')
    expect(tenureBracket(15).label).toBe('15年以上')
  })
})

describe('evaluateStaff', () => {
  it('現行が正しければ一致', () => {
    const s = makeStaff()
    const expected = roundYen(facility.rate * BASE_POINTS * QUAL_WEIGHT['介護福祉士'] * 1.15 * ROLE_WEIGHT['一般'] * 1.0)
    s.currentAllocation = expected
    const r = evaluateStaff(s, facility, '2025-06')
    expect(r.status).toBe('match')
    expect(r.recalculated).toBe(expected)
    expect(r.diff).toBe(0)
    expect(r.breakdown).not.toBeNull()
  })

  it('資格未確認は保留（計算を止める・根拠は出さない）', () => {
    const s = makeStaff({ qualification: null, currentAllocation: 40000 })
    const r = evaluateStaff(s, facility, '2025-06')
    expect(r.status).toBe('hold')
    expect(r.recalculated).toBeNull()
    expect(r.breakdown).toBeNull()
    expect(r.reasons[0]).toContain('資格')
  })

  it('キャリアパス要件が未入力なら保留', () => {
    const s = makeStaff({ careerPathMet: null, currentAllocation: 40000 })
    expect(evaluateStaff(s, facility, '2025-06').status).toBe('hold')
  })

  it('兼務で所定労働時間が未確定なら保留', () => {
    const s = makeStaff({ concurrent: true, concurrentHoursConfirmed: false, currentAllocation: 40000 })
    const r = evaluateStaff(s, facility, '2025-06')
    expect(r.status).toBe('hold')
    expect(r.reasons[0]).toContain('兼務')
  })

  it('キャリアパス要件未充足は対象外（再計算0）で差異', () => {
    const s = makeStaff({ careerPathMet: false, currentAllocation: 40000 })
    const r = evaluateStaff(s, facility, '2025-06')
    expect(r.status).toBe('diff')
    expect(r.recalculated).toBe(0)
    expect(r.reasons[0]).toContain('対象外')
  })
})

describe('差異の理由候補推定（再現による推定）', () => {
  it('勤続年数の更新漏れを検出', () => {
    const s = makeStaff({ hireDate: '2016-04-01' }) // 2025-06時点で9年 → 7〜15年
    // 現行は1つ前（3〜7年=1.15）で算定されている
    s.currentAllocation = roundYen(facility.rate * BASE_POINTS * QUAL_WEIGHT['介護福祉士'] * 1.15 * ROLE_WEIGHT['一般'] * 1.0)
    const reasons = inferDiffReasons(s, facility, '2025-06')
    expect(reasons.join()).toContain('勤続年数')
  })

  it('資格区分が旧区分のままを検出', () => {
    const s = makeStaff({ qualification: '介護福祉士', hireDate: '2020-04-01' })
    s.currentAllocation = roundYen(facility.rate * BASE_POINTS * QUAL_WEIGHT['実務者研修'] * 1.15 * ROLE_WEIGHT['一般'] * 1.0)
    expect(inferDiffReasons(s, facility, '2025-06').join()).toContain('資格区分')
  })

  it('役職変更の未反映を検出', () => {
    const s = makeStaff({ role: '主任', hireDate: '2020-04-01' })
    s.currentAllocation = roundYen(facility.rate * BASE_POINTS * QUAL_WEIGHT['介護福祉士'] * 1.15 * ROLE_WEIGHT['一般'] * 1.0)
    expect(inferDiffReasons(s, facility, '2025-06').join()).toContain('役職')
  })

  it('常勤換算（按分率）の取り違えを検出', () => {
    const s = makeStaff({ employment: '非常勤', fteRatio: 0.6, hireDate: '2020-04-01' })
    s.currentAllocation = roundYen(facility.rate * BASE_POINTS * QUAL_WEIGHT['介護福祉士'] * 1.15 * ROLE_WEIGHT['一般'] * 1.0)
    expect(inferDiffReasons(s, facility, '2025-06').join()).toContain('常勤換算')
  })
})

describe('データセット全体の照合（demo1.json / 架空50名）', () => {
  const result = reconcile(demo1 as unknown as Dataset)

  it('全員に結果か例外（保留）が付く', () => {
    expect(result.results).toHaveLength(50)
    for (const r of result.results) {
      expect(['match', 'diff', 'hold']).toContain(r.status)
    }
  })

  it('保留は再計算・根拠を出さず、理由を必ず持つ', () => {
    for (const r of result.results.filter((r) => r.status === 'hold')) {
      expect(r.recalculated).toBeNull()
      expect(r.breakdown).toBeNull()
      expect(r.reasons.length).toBeGreaterThan(0)
    }
  })

  it('差異には必ず理由候補が付く', () => {
    for (const r of result.results.filter((r) => r.status === 'diff')) {
      expect(r.reasons.length).toBeGreaterThan(0)
    }
  })

  it('一致・差異には再計算額と根拠が付く', () => {
    for (const r of result.results.filter((r) => r.status !== 'hold')) {
      expect(r.recalculated).not.toBeNull()
      expect(r.breakdown).not.toBeNull()
    }
  })

  it('内訳が想定どおり（一致33 / 差異12 / 保留5）', () => {
    expect(result.summary.match).toBe(33)
    expect(result.summary.diff).toBe(12)
    expect(result.summary.hold).toBe(5)
  })
})
