import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/** 台帳らしい表組みのプリミティブ。横スクロールを内側で吸収する。 */
export function Table({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel">
      <table className={cn('w-full border-collapse text-sm', className)}>
        {children}
      </table>
    </div>
  )
}

export function TH({
  children,
  className,
  numeric = false,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-line-strong bg-panel-2 px-3.5 py-2.5 text-xs font-medium text-muted',
        numeric ? 'text-right' : 'text-left',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  )
}

export function TD({
  children,
  className,
  numeric = false,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        'border-b border-line px-3.5 py-2.5 align-middle text-body',
        numeric && 'tnum text-right',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  )
}
