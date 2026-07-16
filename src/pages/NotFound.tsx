import { Container } from '../components/layout/Container'
import { Button } from '../components/ui/Button'

export default function NotFound() {
  return (
    <Container className="py-24 text-center sm:py-32">
      <span className="font-mono text-sm tracking-wider text-brand">404</span>
      <h1 className="mt-4 text-2xl font-semibold text-ink sm:text-3xl">
        ページが見つかりませんでした
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        お探しのページは移動または削除された可能性があります。トップページからお進みください。
      </p>
      <div className="mt-8">
        <Button to="/" size="lg">
          トップへ戻る
        </Button>
      </div>
    </Container>
  )
}
