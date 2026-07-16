import { cn } from '../../lib/cn'

/** ロゴマーク（台帳＋照合チェック）。favicon と同じモチーフ。 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('h-7 w-7', className)}
      role="img"
      aria-label="照合台帳"
    >
      <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="var(--color-brand)" />
      <line x1="9" y1="11" x2="23" y2="11" stroke="#fff" strokeOpacity="0.26" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="16" x2="23" y2="16" stroke="#fff" strokeOpacity="0.26" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="21" x2="23" y2="21" stroke="#fff" strokeOpacity="0.26" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.5 16.4 L14.2 20 L22 11.4" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          照合台帳
        </span>
        <span className="mt-0.5 font-mono text-[10px] tracking-wider text-muted">
          shogo-daicho
        </span>
      </span>
    </span>
  )
}
