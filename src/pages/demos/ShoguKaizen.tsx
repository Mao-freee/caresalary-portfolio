import { useMemo, useState } from 'react'
import { DemoHero } from '../../components/demo/DemoHero'
import { Container } from '../../components/layout/Container'
import { StatTile } from '../../components/demo/StatTile'
import { BreakdownPanel } from '../../components/demo/BreakdownPanel'
import { StatusChip } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { demoBySlug } from '../../lib/demos'
import { site } from '../../lib/site'
import { cn } from '../../lib/cn'
import { yen, signedYen } from '../../lib/format'
import { reconcile, type Dataset } from '../../lib/ruleEngine'
import { resultsToCsv, downloadCsv } from '../../lib/exportCsv'
import demo1 from '../../data/demo1.json'

type Filter = 'all' | 'diff' | 'hold' | 'match'

const filterTabs: { key: Filter; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'diff', label: '差異' },
  { key: 'hold', label: '保留' },
  { key: 'match', label: '一致' },
]

export default function ShoguKaizen() {
  const demo = demoBySlug('shogu-kaizen')!
  const { results, summary, dataset } = useMemo(
    () => reconcile(demo1 as unknown as Dataset),
    [],
  )

  const [filter, setFilter] = useState<Filter>('diff')
  const firstDiff = results.find((r) => r.status === 'diff') ?? results[0]
  const [selectedId, setSelectedId] = useState<string>(firstDiff.staff.id)

  const filtered = useMemo(
    () => (filter === 'all' ? results : results.filter((r) => r.status === filter)),
    [filter, results],
  )
  const selected = results.find((r) => r.staff.id === selectedId) ?? filtered[0] ?? results[0]
  const holds = results.filter((r) => r.status === 'hold')

  const counts: Record<Filter, number> = {
    all: summary.total,
    diff: summary.diff,
    hold: summary.hold,
    match: summary.match,
  }

  const handleExport = () => {
    downloadCsv(`照合結果_${dataset.targetMonth}.csv`, resultsToCsv(results))
  }

  return (
    <>
      <DemoHero demo={demo} />

      {/* ── 検算サマリー ── */}
      <section className="border-b border-line bg-panel">
        <Container className="py-10 sm:py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-match" aria-hidden />
                検算を実行しました
              </div>
              <h2 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
                {dataset.corpName}
              </h2>
              <p className="mt-1 text-sm text-muted">
                対象月 {dataset.targetMonth.replace('-', '年')}月 ・ 施設{' '}
                {dataset.facilities.length} ・ 職員 {summary.total}名 の確定済み配分を、
                ルール通りに再計算しました。
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              結果をCSVで書き出す
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile label="対象人数" value={`${summary.total}名`} tone="brand" />
            <StatTile label="一致" value={`${summary.match}名`} tone="match" sub="そのまま確定" />
            <StatTile label="差異" value={`${summary.diff}名`} tone="diff" sub="要確認" />
            <StatTile label="保留" value={`${summary.hold}名`} tone="hold" sub="計算を停止" />
            <StatTile
              label="差異の純額"
              value={signedYen(summary.netDiff)}
              tone="diff"
              sub="再計算 − 現行（保留除く）"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-line bg-paper px-4 py-3 text-sm">
            <span className="text-muted">配分総額（保留を除く）</span>
            <span className="tnum text-body">{yen(summary.currentTotal)}</span>
            <span className="text-faint">→</span>
            <span className="tnum font-semibold text-ink">{yen(summary.recalcTotal)}</span>
            <span className="tnum text-diff-ink">（{signedYen(summary.netDiff)}）</span>
          </div>
        </Container>
      </section>

      {/* ── 明細：照合台帳 + 計算根拠 ── */}
      <section id="meisai" className="scroll-mt-20 py-10 sm:py-12">
        <Container>
          {/* フィルタ */}
          <div className="mb-5 flex flex-wrap gap-2">
            {filterTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setFilter(t.key)}
                aria-pressed={filter === t.key}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                  filter === t.key
                    ? 'border-brand bg-brand text-white'
                    : 'border-line-strong bg-panel text-body hover:border-brand hover:text-brand',
                )}
              >
                {t.label}
                <span
                  className={cn(
                    'tnum text-xs',
                    filter === t.key ? 'text-white/80' : 'text-faint',
                  )}
                >
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* テーブル */}
            <div className="overflow-hidden rounded-xl border border-line bg-panel">
              <div className="hidden grid-cols-[1.7fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-line-strong bg-panel-2 px-4 py-2.5 text-xs font-medium text-muted sm:grid">
                <span>職員</span>
                <span className="text-right">現行</span>
                <span className="text-right">再計算</span>
                <span className="text-right">差異</span>
                <span className="text-right">判定</span>
              </div>

              <ul className="max-h-[560px] overflow-y-auto">
                {filtered.map((r) => {
                  const isSel = r.staff.id === selectedId
                  return (
                    <li key={r.staff.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(r.staff.id)}
                        aria-pressed={isSel}
                        className={cn(
                          'grid w-full grid-cols-2 items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3 text-left transition-colors sm:grid-cols-[1.7fr_1fr_1fr_1fr_auto]',
                          isSel ? 'bg-brand-50' : 'hover:bg-panel-2',
                        )}
                      >
                        <div className="col-span-2 min-w-0 sm:col-span-1">
                          <div className="truncate font-medium text-ink">{r.staff.name}</div>
                          <div className="truncate text-xs text-muted">
                            {r.facility.name} / {r.staff.jobType}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="mr-1 text-[10px] text-faint sm:hidden">現行</span>
                          <span className="tnum text-sm text-body">
                            {yen(r.staff.currentAllocation)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="mr-1 text-[10px] text-faint sm:hidden">再計算</span>
                          <span className="tnum text-sm font-medium text-ink">
                            {r.recalculated === null ? '—' : yen(r.recalculated)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="mr-1 text-[10px] text-faint sm:hidden">差異</span>
                          <span
                            className={cn(
                              'tnum text-sm font-medium',
                              r.status === 'diff' ? 'text-diff-ink' : 'text-muted',
                            )}
                          >
                            {r.diff === null ? '—' : signedYen(r.diff)}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-start pt-1 sm:col-span-1 sm:justify-end sm:pt-0">
                          <StatusChip status={r.status} />
                        </div>
                      </button>
                    </li>
                  )
                })}
                {filtered.length === 0 && (
                  <li className="px-4 py-10 text-center text-sm text-muted">
                    該当する職員はいません。
                  </li>
                )}
              </ul>
            </div>

            {/* 計算根拠パネル */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <BreakdownPanel result={selected} />
            </div>
          </div>
        </Container>
      </section>

      {/* ── 保留リスト ── */}
      <section className="border-t border-line bg-panel py-10 sm:py-12">
        <Container>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-hold" aria-hidden />
            <h2 className="text-lg font-semibold text-ink">保留リスト（{holds.length}名）</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            入力が不足していて計算できない職員です。推測で数字を作らず止めています。担当者が確認して入力を補うと、再計算の対象に戻ります。
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {holds.map((r) => (
              <li key={r.staff.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all')
                    setSelectedId(r.staff.id)
                    document.getElementById('meisai')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="flex w-full items-start gap-3 rounded-lg border border-hold-line bg-hold-bg p-4 text-left transition-colors hover:border-hold"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-ink">{r.staff.name}</div>
                    <div className="text-xs text-muted">
                      {r.facility.name} / {r.staff.jobType}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-hold-ink">{r.reasons[0]}</p>
                  </div>
                  <StatusChip status="hold" />
                </button>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── 注記 + CTA ── */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="rounded-xl border border-line bg-panel p-6 sm:p-8">
            <h3 className="font-semibold text-ink">このデモについて</h3>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
                データはすべて架空・匿名化されたものです。実在の法人名・実データは含みません。
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
                配分ルール（資格・勤続・役職・常勤換算の重み）は、デモ用に設定した架空のものです。実際の運用では、法人ごとの規程に合わせて調整します。
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
                本ツールが行うのは計算・差異検出・根拠提示までです。最終的な確定と、行政提出書類の作成・法的判断は担当者・社労士が行います。
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href={site.contactUrl} size="lg">
                自社のデータで試したい
              </Button>
              <Button to="/#demos" variant="secondary" size="lg">
                他のデモを見る
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
