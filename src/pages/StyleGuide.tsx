import { Container } from '../components/layout/Container'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatusChip, Eyebrow } from '../components/ui/Badge'
import { Table, TH, TD } from '../components/ui/Table'
import { ReconLedger, type ReconEntry } from '../components/ui/ReconLedger'
import { yen } from '../lib/format'

const swatches = [
  { name: 'paper', var: '--color-paper', note: '背景' },
  { name: 'panel', var: '--color-panel', note: 'カード面' },
  { name: 'ink', var: '--color-ink', note: '見出し' },
  { name: 'body', var: '--color-body', note: '本文' },
  { name: 'brand', var: '--color-brand', note: 'ブランド' },
  { name: 'match', var: '--color-match', note: '一致' },
  { name: 'diff', var: '--color-diff', note: '差異' },
  { name: 'hold', var: '--color-hold', note: '保留' },
]

const sampleEntries: ReconEntry[] = [
  { id: '1', name: '佐藤 美咲', meta: '桜ケ丘の家 / 介護福祉士', current: 41200, recalculated: 41200, status: 'match' },
  { id: '2', name: '鈴木 一郎', meta: 'みどり苑 / 実務者研修', current: 33800, recalculated: 36500, status: 'diff' },
  { id: '3', name: '高橋 結衣', meta: '兼務2施設 / 介護福祉士', current: 38000, recalculated: 0, status: 'hold' },
]

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-12 first:border-t-0">
      <h2 className="mb-6 text-lg font-semibold text-ink">{title}</h2>
      {children}
    </section>
  )
}

export default function StyleGuide() {
  return (
    <Container className="py-14">
      <Eyebrow>DESIGN SYSTEM</Eyebrow>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        スタイルガイド
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        照合台帳の配色・タイポグラフィ・共通コンポーネント。全ページ・全デモはこの部品を再利用します。
      </p>

      <Block title="配色">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {swatches.map((s) => (
            <div key={s.name} className="overflow-hidden rounded-lg border border-line">
              <div className="h-16" style={{ backgroundColor: `var(${s.var})` }} />
              <div className="px-3 py-2">
                <div className="font-mono text-xs text-ink">{s.name}</div>
                <div className="text-xs text-muted">{s.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="タイポグラフィ">
        <div className="space-y-4">
          <p className="text-4xl font-semibold text-ink">見出し Display / 40</p>
          <p className="text-2xl font-semibold text-ink">見出し Heading / 24</p>
          <p className="text-base text-body">
            本文 Body / 16 — Excel担当者が翌月からそのまま使える、誠実で実務的な文章のトーン。
          </p>
          <p className="text-sm text-muted">補助テキスト Muted / 14</p>
          <p className="tnum text-2xl text-ink">
            {yen(1234567)} <span className="text-muted">←</span> {yen(1210000)}
            <span className="ml-2 text-diff-ink">＋{yen(24567)}</span>
          </p>
          <p className="font-mono text-sm text-muted">
            金額・計算値は IBM Plex Mono / タブラー数字で桁を揃える
          </p>
        </div>
      </Block>

      <Block title="ボタン">
        <div className="flex flex-wrap items-center gap-3">
          <Button>プライマリ</Button>
          <Button variant="secondary">セカンダリ</Button>
          <Button variant="ghost">ゴースト</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Block>

      <Block title="ステータスチップ">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status="match" />
          <StatusChip status="diff" />
          <StatusChip status="hold" />
          <StatusChip status="neutral">未処理</StatusChip>
        </div>
      </Block>

      <Block title="カード">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold text-ink">標準カード</h3>
            <p className="mt-2 text-sm text-muted">border + panel の基本コンテナ。</p>
          </Card>
          <Card interactive className="p-6">
            <h3 className="font-semibold text-ink">インタラクティブ</h3>
            <p className="mt-2 text-sm text-muted">ホバーで浮く。クリック可能なカード用。</p>
          </Card>
        </div>
      </Block>

      <Block title="テーブル">
        <Table>
          <thead>
            <tr>
              <TH>職員</TH>
              <TH numeric>現行</TH>
              <TH numeric>再計算</TH>
              <TH>判定</TH>
            </tr>
          </thead>
          <tbody>
            {sampleEntries.map((e) => (
              <tr key={e.id}>
                <TD>{e.name}</TD>
                <TD numeric>{yen(e.current)}</TD>
                <TD numeric>{e.status === 'hold' ? '—' : yen(e.recalculated)}</TD>
                <TD>
                  <StatusChip status={e.status} />
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </Block>

      <Block title="照合台帳（署名要素）">
        <ReconLedger caption="令和7年6月 / 桜ケ丘福祉会（架空）" entries={sampleEntries} />
      </Block>
    </Container>
  )
}
