import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Container } from './Container'
import { Eyebrow } from '../ui/Badge'

export function Section({
  children,
  className,
  id,
  bleed = false,
}: {
  children: ReactNode
  className?: string
  id?: string
  /** true のとき Container で包まない（全幅レイアウト用） */
  bleed?: boolean
}) {
  const inner = bleed ? children : <Container>{children}</Container>
  return (
    <section id={id} className={cn('scroll-mt-20 py-16 sm:py-20 lg:py-24', className)}>
      {inner}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <div className={cn('mb-4', align === 'center' && 'flex justify-center')}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base">
          {lead}
        </p>
      )}
    </div>
  )
}
