import { Link } from 'react-router-dom'
import type { Demo } from '../../lib/demos'
import { demos } from '../../lib/demos'
import { Container } from '../layout/Container'
import { Button } from '../ui/Button'
import { site } from '../../lib/site'

/** 準備中デモの本文。中核デモ（デモ1）への導線を必ず置く。 */
export function ComingSoon({ demo }: { demo: Demo }) {
  const core = demos.find((d) => d.status === 'ready')

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-diff-line bg-diff-bg px-3 py-1 text-xs font-medium text-diff-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-diff" aria-hidden />
          準備中
        </span>

        <h2 className="mt-6 text-xl font-semibold text-ink sm:text-2xl">
          このデモは現在制作中です
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          「{demo.title}」は、中核デモの計算基盤を土台に順次公開していきます。
          先に動くものをご覧になりたい場合は、公開済みの中核デモをお試しください。
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {core && (
            <Button to={core.path} size="lg">
              {core.n}. {core.short} を見る
            </Button>
          )}
          <Button href={site.contactUrl} variant="secondary" size="lg">
            このデモの相談をする
          </Button>
        </div>

        <p className="mt-10">
          <Link to="/#demos" className="font-mono text-sm text-brand hover:underline">
            ← デモ一覧に戻る
          </Link>
        </p>
      </div>
    </Container>
  )
}
