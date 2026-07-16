import { Link } from 'react-router-dom'
import { site } from '../../lib/site'
import { demos } from '../../lib/demos'
import { Logo } from '../ui/Logo'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-panel">
      <div className="mx-auto max-w-page px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {site.description}
            </p>
          </div>

          <nav aria-label="デモ一覧">
            <h3 className="font-mono text-xs tracking-wider text-faint">DEMOS</h3>
            <ul className="mt-4 space-y-2.5">
              {demos.map((d) => (
                <li key={d.slug}>
                  <Link
                    to={d.path}
                    className="text-sm text-body transition-colors hover:text-brand"
                  >
                    {d.n}. {d.short}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="サイト">
            <h3 className="font-mono text-xs tracking-wider text-faint">SITE</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/#kadai" className="text-sm text-body hover:text-brand">
                  対応する課題
                </Link>
              </li>
              <li>
                <Link to="/#flow" className="text-sm text-body hover:text-brand">
                  進め方
                </Link>
              </li>
              <li>
                <Link to="/styleguide" className="text-sm text-body hover:text-brand">
                  スタイルガイド
                </Link>
              </li>
              <li>
                <a
                  href={site.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-body hover:text-brand"
                >
                  無料ヒアリング
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* 誠実さの担保：架空データのみ使用する旨を明示 */}
        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl leading-relaxed">
            本サイトのデモはすべて架空・匿名化データを用いています。実在の法人名・実データは一切含みません。
          </p>
          <p className="shrink-0 font-mono text-faint">© {new Date().getFullYear()} 照合台帳</p>
        </div>
      </div>
    </footer>
  )
}
