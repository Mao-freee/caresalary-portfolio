import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode
  className?: string
  /** ホバーで浮かせる（クリック可能なカード用） */
  interactive?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-panel',
        interactive &&
          'transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  )
}
