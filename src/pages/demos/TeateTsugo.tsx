import { useMemo } from 'react'
import { DemoHero } from '../../components/demo/DemoHero'
import { Section, SectionHeading } from '../../components/layout/Section'
import { StatTile } from '../../components/demo/StatTile'
import { StatusChip } from '../../components/ui/Badge'
import { Table, TH, TD } from '../../components/ui/Table'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { demoBySlug } from '../../lib/demos'
import { site } from '../../lib/site'
import { cn } from '../../lib/cn'
import { yen, percent } from '../../lib/format'
import { reconcileTeate, canonicalLabel, type Demo2Dataset } from '../../lib/teate'
import demo2 from '../../data/demo2.json'

export default function TeateTsugo() {
  const demo = demoBySlug('teate-tsugo')!
  const { mappings, results, summary } = useMemo(
    () => reconcileTeate(demo2 as unknown as Demo2Dataset),
    [],
  )
  const prorated = results.filter((r) => r.proration)
  const holds = results.filter((r) => r.status === 'hold')

  return (
    <>
      <DemoHero demo={demo} />

      {/* 強み */}
      <Section className="bg-panel">
        <SectionHeading
          eyebrow="このソフトならではの強み"
          title="バラバラな施設データを、そのまま取り込んで揃える"
          lead="施設ごとに列名も書式も違う勤怠データ。ここでの手作業の突合こそ、締め日前に時間を奪う工程です。照合台帳は、まず列の対応づけから自動で行い、そのうえで夜勤・資格・兼務按分まで一気に計算します。"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { t: '列名のゆらぎを吸収', d: '「氏名／職員氏名／name」も、同じ項目として自動で対応づけ。' },
            { t: '兼務を時間比で按分', d: '複数施設をまたぐ職員の資格手当を、勤務時間の比で自動配分。' },
            { t: '足りなければ止める', d: '兼務先の時間が未確定なら、推測せず保留にして確認を促す。' },
          ].map((x) => (
            <Card key={x.t} className="p-5">
              <h3 className="font-semibold text-ink">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* STEP 1 自動マッピング */}
      <Section id="mapping">
        <SectionHeading
          eyebrow="STEP 1"
          title="取り込み・自動マッピング"
          lead="3施設ぶんの勤怠データを取り込みました。元の列名を、計算に使う正規の項目へ自動で対応づけます。確信度が低いものは「要確認」として担当者に確認を促します。"
        />

        <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-match-line bg-match-bg px-4 py-2.5 text-sm text-match-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-match" aria-hidden />
          <span className="tnum font-medium">
            {summary.autoColumns}/{summary.totalColumns}
          </span>
          列を自動でマッピングしました
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {mappings.map(({ facility, mapping }) => (
            <Card key={facility.id} className="overflow-hidden">
              <div className="border-b border-line bg-panel-2 px-4 py-3">
                <div className="font-semibold text-ink">{facility.name}</div>
                <div className="mt-0.5 font-mono text-xs text-muted">{facility.source}</div>
              </div>
              <ul className="divide-y divide-line">
                {mapping.map((m) => (
                  <li key={m.rawHeader} className="flex items-center gap-2 px-4 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate font-mono text-muted">
                      {m.rawHeader}
                    </span>
                    <span className="text-faint" aria-hidden>→</span>
                    <span className="min-w-0 flex-1 truncate text-right text-ink">
                      {m.field ? canonicalLabel[m.field] : '未対応'}
                    </span>
                    {m.auto ? (
                      <StatusChip status="match">自動</StatusChip>
                    ) : (
                      <StatusChip status="diff">要確認</StatusChip>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          対応づけの候補を出すところまでが自動です。最終的に「この列＝この項目」で確定するのは担当者。想定外の列は必ず人の目を通します。
        </p>
      </Section>

      {/* STEP 2 統合結果 */}
      <Section id="result" className="bg-panel">
        <SectionHeading
          eyebrow="STEP 2"
          title="統合結果"
          lead="対応づけた項目をもとに、夜勤手当・資格手当・兼務按分を計算し、施設をまたいで1つの表にまとめました。"
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="対象人数" value={`${summary.total}名`} tone="brand" />
          <StatTile label="兼務按分" value={`${summary.prorated}名`} tone="match" sub="時間比で自動配分" />
          <StatTile label="保留" value={`${summary.hold}名`} tone="hold" sub="要確認で停止" />
          <StatTile label="手当合計" value={yen(summary.grandTotal)} tone="brand" sub="自施設計上分" />
        </div>

        <div className="mt-6">
          <Table>
            <thead>
              <tr>
                <TH>職員</TH>
                <TH>施設</TH>
                <TH numeric>夜勤手当</TH>
                <TH numeric>資格手当</TH>
                <TH>兼務按分</TH>
                <TH numeric>合計</TH>
                <TH>判定</TH>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={`${r.row.facilityId}-${r.row.name}`} className={cn(r.status === 'hold' && 'bg-hold-bg/40')}>
                  <TD>
                    <span className="font-medium text-ink">{r.row.name}</span>
                    <span className="ml-2 text-xs text-muted">{r.row.qualification}</span>
                  </TD>
                  <TD className="text-muted">{r.row.facilityName}</TD>
                  <TD numeric>{yen(r.nightAllowance)}</TD>
                  <TD numeric>
                    {r.proration ? yen(r.proration.homeShare) : yen(r.qualAllowance)}
                  </TD>
                  <TD>
                    {r.proration ? (
                      <span className="text-xs text-muted">
                        自施設 {percent(r.proration.homeRatio)} / {r.proration.awayFacility}{' '}
                        {percent(r.proration.awayRatio)}
                      </span>
                    ) : r.status === 'hold' ? (
                      <span className="text-xs text-hold-ink">兼務先の時間 未確定</span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </TD>
                  <TD numeric className="font-semibold">
                    {r.homeTotal === null ? '—' : yen(r.homeTotal)}
                  </TD>
                  <TD>
                    {r.status === 'hold' ? (
                      <StatusChip status="hold" />
                    ) : r.proration ? (
                      <StatusChip status="neutral">按分</StatusChip>
                    ) : (
                      <StatusChip status="match">計上</StatusChip>
                    )}
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* 按分の内訳 */}
        {prorated.length > 0 && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 font-semibold text-ink">
              <span className="h-2 w-2 rounded-full bg-match" aria-hidden />
              兼務按分の内訳
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {prorated.map((r) => (
                <Card key={`${r.row.facilityId}-${r.row.name}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ink">{r.row.name}</span>
                    <span className="tnum text-sm text-muted">
                      資格手当 {yen(r.qualAllowance)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">
                        {r.row.facilityName}（{r.row.baseHours}h・{percent(r.proration!.homeRatio)}）
                      </span>
                      <span className="tnum font-medium text-ink">{yen(r.proration!.homeShare)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">
                        {r.proration!.awayFacility}（{r.row.concurrentHours}h・{percent(r.proration!.awayRatio)}）
                      </span>
                      <span className="tnum font-medium text-ink">{yen(r.proration!.awayShare)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 保留 */}
        {holds.length > 0 && (
          <div className="mt-8 rounded-xl border border-hold-line bg-hold-bg p-5">
            <h3 className="flex items-center gap-2 font-semibold text-hold-ink">
              <span className="h-2 w-2 rounded-full bg-hold" aria-hidden />
              保留（{holds.length}名）
            </h3>
            <ul className="mt-3 space-y-2">
              {holds.map((r) => (
                <li key={`${r.row.facilityId}-${r.row.name}`} className="text-sm text-hold-ink">
                  <span className="font-medium">{r.row.name}</span>
                  <span className="text-muted"> / {r.row.facilityName}</span> — {r.reasons[0]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* 注記 + CTA */}
      <Section>
        <div className="rounded-xl border border-line bg-panel p-6 sm:p-8">
          <h3 className="font-semibold text-ink">このデモについて</h3>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted">
            <li className="flex gap-2.5">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
              データはすべて架空です。3施設の列名・書式の違いは、実際の現場でよくあるゆらぎを模したものです。
            </li>
            <li className="flex gap-2.5">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
              列の対応づけは候補提示までを自動化し、確定は担当者が行います。手当単価・按分方法は法人ごとの規程に合わせて調整します。
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={site.contactUrl} size="lg">
              自社のフォーマットで試したい
            </Button>
            <Button to={demoBySlug('kanshi-shoko')!.path} variant="secondary" size="lg">
              次へ：計算根拠・監査証跡を見る
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
