import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'brand' | 'match' | 'diff' | 'hold' | 'neutral'

const toneAccent: Record<Tone, string> = {
  brand: 'text-brand',
  match: 'text-match-ink',
  diff: 'text-diff-ink',
  hold: 'text-hold-ink',
  neutral: 'text-ink',
}

const toneBar: Record<Tone, string> = {
  brand: 'bg-brand',
  match: 'bg-match',
  diff: 'bg-diff',
  hold: 'bg-hold',
  neutral: 'bg-line-strong',
}

export function StatTile({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: Tone
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-panel p-4 sm:p-5">
      <span className={cn('absolute inset-y-0 left-0 w-1', toneBar[tone])} aria-hidden />
      <div className="text-xs text-muted">{label}</div>
      <div className={cn('mt-1.5 tnum text-2xl font-semibold sm:text-[28px]', toneAccent[tone])}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  )
}
