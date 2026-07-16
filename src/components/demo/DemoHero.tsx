import { Link } from 'react-router-dom'
import type { Demo } from '../../lib/demos'
import { Container } from '../layout/Container'

export function DemoHero({ demo }: { demo: Demo }) {
  return (
    <div className="border-b border-line bg-panel">
      <Container className="py-10 sm:py-12">
        {/* パンくず */}
        <nav className="mb-6 flex items-center gap-1.5 font-mono text-xs text-muted">
          <Link to="/" className="hover:text-brand">
            トップ
          </Link>
          <span className="text-faint">/</span>
          <Link to="/#demos" className="hover:text-brand">
            デモ
          </Link>
          <span className="text-faint">/</span>
          <span className="text-body">{demo.short}</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-brand">
            DEMO {String(demo.n).padStart(2, '0')}
          </span>
          <span className="inline-flex items-center rounded-full border border-line-strong bg-panel-2 px-2.5 py-0.5 text-xs text-muted">
            {demo.role}・{demo.roleNote}
          </span>
        </div>

        <h1 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
          {demo.title}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-body sm:text-base">
          {demo.tagline}
        </p>

        <div className="mt-6 inline-flex items-start gap-2 rounded-lg border border-line bg-paper px-4 py-3">
          <span className="mt-0.5 shrink-0 font-mono text-xs text-faint">対応する課題</span>
          <span className="text-sm text-body">{demo.problem}</span>
        </div>
      </Container>
    </div>
  )
}
