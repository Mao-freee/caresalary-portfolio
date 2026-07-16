import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Nav from './Nav'
import Footer from './Footer'

/** ルート遷移時のスクロール制御。ハッシュがあればその要素へ、無ければ先頭へ。 */
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, hash])

  return null
}

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollManager />
      <Nav />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
              読み込み中…
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
