/** 照合の判定ステータス。全体で共有する単一の定義。 */
export type ReconStatus = 'match' | 'diff' | 'hold'

export const statusLabel: Record<ReconStatus, string> = {
  match: '一致',
  diff: '差異',
  hold: '保留',
}
