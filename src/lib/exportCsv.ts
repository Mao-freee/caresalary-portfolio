import type { StaffResult } from './ruleEngine'
import { statusLabel } from './status'

/** CSVの1セルをエスケープ。 */
function cell(v: string | number): string {
  const s = String(v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

/** 照合結果をCSV文字列にする（担当者が結果を確認・再実行できるように）。 */
export function resultsToCsv(results: StaffResult[]): string {
  const header = [
    '職員ID', '氏名', '施設', '職種', '判定',
    '現行配分額', '再計算額', '差異', '理由候補・保留理由',
  ]
  const rows = results.map((r) => [
    r.staff.id,
    r.staff.name,
    r.facility.name,
    r.staff.jobType,
    statusLabel[r.status],
    r.staff.currentAllocation,
    r.recalculated ?? '',
    r.diff ?? '',
    r.reasons.join(' / '),
  ])
  // Excel が UTF-8 を正しく開けるよう BOM を付ける
  return '﻿' + [header, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
}

/** ブラウザでCSVをダウンロードさせる。 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
