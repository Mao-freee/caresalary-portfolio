import { cn } from '../../lib/cn'
import { yen, signedYen } from '../../lib/format'
import { StatusChip } from './Badge'
import type { ReconStatus } from '../../lib/status'

/**
 * 照合台帳（このサービスの署名要素）。
 * 「現行 → 再計算 → 差異 → 判定」を1行で示す。ヒーローと各デモで再利用する。
 */
export type ReconEntry = {
  id: string
  name: string
  meta?: string
  current: number
  recalculated: number
  status: ReconStatus
}

const diffColor: Record<ReconStatus, string> = {
  match: 'text-muted',
  diff: 'text-diff-ink',
  hold: 'text-hold-ink',
}

export function ReconLedger({
  entries,
  className,
  caption,
}: {
  entries: ReconEntry[]
  className?: string
  caption?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-line bg-panel shadow-card',
        className,
      )}
    >
      {caption && (
        <div className="flex items-center justify-between gap-3 border-b border-line bg-panel-2 px-4 py-2.5">
          <span className="font-mono text-xs tracking-wide text-muted">
            {caption}
          </span>
          <span className="font-mono text-xs text-faint">照合結果</span>
        </div>
      )}

      {/* 列見出し（sm以上で表示） */}
      <div className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-line-strong px-4 py-2 text-xs font-medium text-muted sm:grid">
        <span>職員</span>
        <span className="text-right">現行</span>
        <span className="text-right">再計算</span>
        <span className="text-right">差異</span>
        <span className="text-right">判定</span>
      </div>

      <ul>
        {entries.map((e) => {
          const isHold = e.status === 'hold'
          const diff = e.recalculated - e.current
          return (
            <li
              key={e.id}
              className="grid grid-cols-2 items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[1.6fr_1fr_1fr_1fr_auto]"
            >
              {/* 職員 */}
              <div className="col-span-2 min-w-0 sm:col-span-1">
                <div className="truncate font-medium text-ink">{e.name}</div>
                {e.meta && (
                  <div className="truncate text-xs text-muted">{e.meta}</div>
                )}
              </div>

              {/* 現行 */}
              <div className="text-right">
                <span className="mr-1 text-[10px] text-faint sm:hidden">現行</span>
                <span className="tnum text-sm text-body">{yen(e.current)}</span>
              </div>

              {/* 再計算 */}
              <div className="text-right">
                <span className="mr-1 text-[10px] text-faint sm:hidden">再計算</span>
                <span className="tnum text-sm font-medium text-ink">
                  {isHold ? '—' : yen(e.recalculated)}
                </span>
              </div>

              {/* 差異 */}
              <div className="text-right">
                <span className="mr-1 text-[10px] text-faint sm:hidden">差異</span>
                <span className={cn('tnum text-sm font-medium', diffColor[e.status])}>
                  {isHold ? '—' : signedYen(diff)}
                </span>
              </div>

              {/* 判定 */}
              <div className="col-span-2 flex justify-start pt-1 sm:col-span-1 sm:justify-end sm:pt-0">
                <StatusChip status={e.status} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
