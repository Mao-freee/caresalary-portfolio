import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { statusLabel, type ReconStatus } from '../../lib/status'

/**
 * ステータスチップ。このサービスの中核概念（照合の判定）を色で表す署名要素。
 *  match … 一致（現行と再計算が一致）  緑
 *  diff  … 差異（要確認）              アンバー
 *  hold  … 保留（人間の判断が必要）    インディゴ
 */
type ChipStatus = ReconStatus | 'neutral'

const chipStyles: Record<ChipStatus, { wrap: string; dot: string }> = {
  match: { wrap: 'bg-match-bg text-match-ink border-match-line', dot: 'bg-match' },
  diff: { wrap: 'bg-diff-bg text-diff-ink border-diff-line', dot: 'bg-diff' },
  hold: { wrap: 'bg-hold-bg text-hold-ink border-hold-line', dot: 'bg-hold' },
  neutral: { wrap: 'bg-panel-2 text-muted border-line-strong', dot: 'bg-faint' },
}

export function StatusChip({
  status,
  children,
  className,
}: {
  status: ChipStatus
  children?: ReactNode
  className?: string
}) {
  const s = chipStyles[status]
  const label =
    children ?? (status === 'neutral' ? '—' : statusLabel[status as ReconStatus])
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        s.wrap,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
      {label}
    </span>
  )
}

/** セクションの見出しに添える小さなラベル（構造の目印）。 */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-xs tracking-wider text-brand',
        className,
      )}
    >
      <span className="h-px w-6 bg-brand/50" aria-hidden />
      {children}
    </span>
  )
}
