import { describe, it, expect } from 'vitest'
import { mapHeaders } from './mapping'
import { reconcileTeate, type Demo2Dataset } from './teate'
import demo2 from '../data/demo2.json'

describe('列名の自動マッピング', () => {
  it('日本語のゆらぎを正規項目へ対応づける', () => {
    const m = mapHeaders(['職員氏名', '資格区分', '夜勤日数', '勤務時間'])
    const byRaw = Object.fromEntries(m.map((x) => [x.rawHeader, x.field]))
    expect(byRaw['職員氏名']).toBe('name')
    expect(byRaw['資格区分']).toBe('qualification')
    expect(byRaw['夜勤日数']).toBe('nightShifts')
    expect(byRaw['勤務時間']).toBe('baseHours')
  })

  it('英語ヘッダのエクスポートも対応づける', () => {
    const m = mapHeaders(['name', 'shikaku', 'night_count', 'work_hours', 'kenmu_hours'])
    const byRaw = Object.fromEntries(m.map((x) => [x.rawHeader, x.field]))
    expect(byRaw['name']).toBe('name')
    expect(byRaw['shikaku']).toBe('qualification')
    expect(byRaw['night_count']).toBe('nightShifts')
    expect(byRaw['work_hours']).toBe('baseHours')
    expect(byRaw['kenmu_hours']).toBe('concurrentHours')
  })

  it('1項目が複数列に重複割当されない', () => {
    const m = mapHeaders(['氏名', '職員氏名', '夜勤回数'])
    const fields = m.map((x) => x.field).filter(Boolean)
    expect(new Set(fields).size).toBe(fields.length)
  })
})

describe('手当・按分の計算（demo2.json）', () => {
  const result = reconcileTeate(demo2 as unknown as Demo2Dataset)

  it('全施設の全職員を処理する', () => {
    expect(result.results.length).toBe(17)
  })

  it('兼務先の時間が未確定なら保留で止める', () => {
    const held = result.results.filter((r) => r.status === 'hold')
    expect(held.length).toBe(1)
    expect(held[0].row.name).toBe('前田 誠')
    expect(held[0].homeTotal).toBeNull()
  })

  it('兼務ありは資格手当を勤務時間比で按分する', () => {
    const prorated = result.results.filter((r) => r.proration)
    expect(prorated.length).toBe(2)
    const takahashi = prorated.find((r) => r.row.name === '高橋 結衣')!
    // 当月120h / 兼務先40h → 自施設 3/4 = 11,250、兼務先 3,750（資格手当15,000）
    expect(takahashi.proration!.homeShare).toBe(11250)
    expect(takahashi.proration!.awayShare).toBe(3750)
  })

  it('夜勤手当 = 夜勤回数 × 単価', () => {
    const sato = result.results.find((r) => r.row.name === '佐藤 美咲')!
    expect(sato.nightAllowance).toBe(4 * 6000)
  })

  it('ほとんどの列が自動でマッピングされる', () => {
    expect(result.summary.autoColumns).toBeGreaterThanOrEqual(result.summary.totalColumns - 3)
  })
})
