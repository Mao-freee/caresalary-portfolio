import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 select-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-600 shadow-card',
  secondary:
    'bg-panel text-ink border border-line-strong hover:border-brand hover:text-brand',
  ghost: 'text-brand hover:bg-brand-50',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2',
  md: 'text-[15px] px-5 py-2.5',
  lg: 'text-base px-6 py-3',
}

type ButtonProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  /** 内部遷移（react-router） */
  to?: string
  /** 外部リンク（自動で target=_blank） */
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  'aria-label'?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  to,
  href,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={classes} onClick={onClick} {...rest}>
      {children}
    </button>
  )
}
