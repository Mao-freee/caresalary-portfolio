import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { site } from '../../lib/site'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'

const links = [
  { label: 'サービス', to: '/#service' },
  { label: '課題', to: '/#kadai' },
  { label: 'デモ', to: '/#demos' },
  { label: '進め方', to: '/#flow' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // ルート遷移・ハッシュ移動でモバイルメニューを閉じる
  useEffect(() => {
    setOpen(false)
  }, [location])

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-page items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link to="/" aria-label="照合台帳 トップへ" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm text-body transition-colors hover:text-brand"
            >
              {l.label}
            </Link>
          ))}
          <Button href={site.contactUrl} size="sm" className="ml-2">
            無料ヒアリング
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-panel-2 md:hidden"
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* モバイルメニュー */}
      <div
        className={cn(
          'overflow-hidden border-t border-line bg-paper transition-[max-height] duration-300 md:hidden',
          open ? 'max-h-80' : 'max-h-0 border-t-0',
        )}
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2.5 text-body transition-colors hover:bg-panel-2 hover:text-brand"
            >
              {l.label}
            </Link>
          ))}
          <Button href={site.contactUrl} className="mt-2 w-full">
            無料ヒアリング
          </Button>
        </div>
      </div>
    </header>
  )
}
