/*
  監査証跡（デモ3）
  ------------------------------------------------------------------
  デモ1の照合結果に、入力値・適用ルール・計算過程・修正履歴を付けて職員単位で追跡できるようにする。
  「すべての数字が、どの入力とどのルールから出たのかを後からたどれる」＝ブラックボックスにしない、
  というこのソフトの強みを形にする。担当者の引き継ぎ資料・監査対応資料としてそのまま使える。
*/
import type { ReconResult, StaffResult } from './ruleEngine'
import { tenureYears } from './ruleEngine'
import { yen, signedYen } from './format'
import { statusLabel } from './status'

export type AuditEvent = {
  at: string
  actor: 'システム' | '担当者'
  action: string
  detail?: string
}

export type AuditField = { label: string; value: string }

export type AuditRecord = {
  result: StaffResult
  inputs: AuditField[]
  appliedRules: AuditField[]
  calcSteps: string[]
  history: AuditEvent[]
}

/** 対象月から取込日を作る（末日近辺の締め処理を想定）。決定的。 */
function baseDates(targetMonth: string, index: number) {
  const min = 30 + (index % 20)
  const importAt = `${targetMonth}-25 18:${String(min).padStart(2, '0')}`
  const reviewDay = 26 + (index % 2)
  const reviewAt = `${targetMonth}-${reviewDay} 1${index % 6}:${String(15 + (index % 40)).padStart(2, '0')}`
  const fixAt = `${targetMonth}-28 09:${String(5 + (index % 50)).padStart(2, '0')}`
  return { importAt, reviewAt, fixAt }
}

function buildHistory(r: StaffResult, index: number, targetMonth: string): AuditEvent[] {
  const { importAt, reviewAt, fixAt } = baseDates(targetMonth, index)
  const events: AuditEvent[] = [
    { at: importAt, actor: 'システム', action: '現行データを取込', detail: `現行配分額 ${yen(r.staff.currentAllocation)}` },
    { at: importAt, actor: 'システム', action: 'ルールに基づき自動再計算' },
  ]

  if (r.status === 'match') {
    events.push({ at: importAt, actor: 'システム', action: '照合：一致', detail: '現行と再計算が一致' })
    events.push({ at: reviewAt, actor: '担当者', action: '内容を確認し確定' })
  } else if (r.status === 'diff') {
    events.push({
      at: importAt,
      actor: 'システム',
      action: '照合：差異を検出',
      detail: `差異 ${signedYen(r.diff ?? 0)} / 理由候補: ${r.reasons.join(' , ')}`,
    })
    events.push({ at: reviewAt, actor: '担当者', action: '理由候補を確認' })
    events.push({
      at: fixAt,
      actor: '担当者',
      action: '再計算額を採用して修正',
      detail: `${yen(r.staff.currentAllocation)} → ${yen(r.recalculated ?? 0)}`,
    })
  } else {
    events.push({ at: importAt, actor: 'システム', action: '照合：保留（計算を停止）', detail: r.reasons[0] })
    events.push({ at: reviewAt, actor: '担当者', action: '確認を依頼（未入力項目の補完待ち）' })
  }
  return events
}

function buildInputs(r: StaffResult, targetMonth: string): AuditField[] {
  const s = r.staff
  const years = tenureYears(s.hireDate, targetMonth)
  return [
    { label: '施設', value: r.facility.name },
    { label: '職種', value: s.jobType },
    { label: '資格', value: s.qualification ?? '未確認' },
    { label: '入職年月日', value: s.hireDate },
    { label: '勤続年数', value: `${years}年` },
    { label: '役職', value: s.role },
    { label: '雇用形態', value: `${s.employment}（常勤換算 ${s.fteRatio.toFixed(2)}）` },
    { label: 'キャリアパス要件', value: s.careerPathMet === null ? '未入力' : s.careerPathMet ? '充足' : '未充足' },
    { label: '月額賃金改善要件', value: s.wageReqMet ? '充足' : '未充足' },
    { label: '兼務', value: s.concurrent ? (s.concurrentHoursConfirmed ? '所定時間確定済み' : '所定時間 未確定') : 'なし' },
    { label: '現行配分額', value: yen(s.currentAllocation) },
  ]
}

function buildAppliedRules(r: StaffResult): AuditField[] {
  const b = r.breakdown
  if (!b) return [{ label: '適用ルール', value: '入力不足のため未適用（保留）' }]
  return [
    { label: '配分単価', value: `${yen(b.rate)} / 点` },
    { label: '基本点数', value: `${b.basePoints} 点` },
    { label: '資格係数', value: `${b.qualification} ×${b.qualWeight.toFixed(2)}` },
    { label: '勤続係数', value: `${b.tenureLabel} ×${b.tenureWeight.toFixed(2)}` },
    { label: '役職係数', value: `${b.role} ×${b.roleWeight.toFixed(2)}` },
    { label: '常勤換算', value: `×${b.fteRatio.toFixed(2)}` },
    { label: '端数処理', value: '円未満 四捨五入' },
  ]
}

function buildCalcSteps(r: StaffResult): string[] {
  const b = r.breakdown
  if (!b) return ['入力が不足しているため計算を停止しました（保留）。']
  let pts = b.basePoints
  const steps: string[] = []
  steps.push(`基本点数 ${b.basePoints} 点`)
  pts *= b.qualWeight
  steps.push(`× 資格係数 ${b.qualWeight.toFixed(2)}（${b.qualification}） → ${pts.toFixed(1)} 点`)
  pts *= b.tenureWeight
  steps.push(`× 勤続係数 ${b.tenureWeight.toFixed(2)}（${b.tenureLabel}） → ${pts.toFixed(1)} 点`)
  pts *= b.roleWeight
  steps.push(`× 役職係数 ${b.roleWeight.toFixed(2)}（${b.role}） → ${pts.toFixed(1)} 点`)
  pts *= b.fteRatio
  steps.push(`× 常勤換算 ${b.fteRatio.toFixed(2)} → ${pts.toFixed(1)} 点`)
  steps.push(`× 配分単価 ${yen(b.rate)} = ¥${b.rawAmount.toFixed(1)}`)
  steps.push(`円未満を四捨五入 → ${yen(r.recalculated ?? 0)}`)
  return steps
}

export function buildAuditRecords(result: ReconResult): AuditRecord[] {
  const { targetMonth } = result.dataset
  return result.results.map((r, i) => ({
    result: r,
    inputs: buildInputs(r, targetMonth),
    appliedRules: buildAppliedRules(r),
    calcSteps: buildCalcSteps(r),
    history: buildHistory(r, i, targetMonth),
  }))
}

/** 監査ログをイベント単位でCSVに（引き継ぎ・監査提出用）。 */
export function auditToCsv(records: AuditRecord[]): string {
  const cell = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const header = ['職員ID', '氏名', '施設', '判定', '日時', '実施者', '操作', '詳細']
  const rows: (string | number)[][] = []
  for (const rec of records) {
    for (const ev of rec.history) {
      rows.push([
        rec.result.staff.id,
        rec.result.staff.name,
        rec.result.facility.name,
        statusLabel[rec.result.status],
        ev.at,
        ev.actor,
        ev.action,
        ev.detail ?? '',
      ])
    }
  }
  return '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')
}
