import { useMemo, useState } from 'react'
import { DemoHero } from '../../components/demo/DemoHero'
import { Section, SectionHeading } from '../../components/layout/Section'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatusChip } from '../../components/ui/Badge'
import { AuditRecordView } from '../../components/demo/AuditRecordView'
import { demoBySlug } from '../../lib/demos'
import { site } from '../../lib/site'
import { cn } from '../../lib/cn'
import { reconcile, type Dataset } from '../../lib/ruleEngine'
import { buildAuditRecords, auditToCsv } from '../../lib/audit'
import { downloadCsv } from '../../lib/exportCsv'
import demo1 from '../../data/demo1.json'

const strengths = [
  { t: '入力→ルール→計算→履歴が一続き', d: 'その金額が、どの入力とどのルールから出たのかを1画面でたどれる。' },
  { t: '担当者が変わっても引き継げる', d: 'Excelの中の暗黙知に頼らず、証跡そのものが引き継ぎ資料になる。' },
  { t: '監査・行政にその場で答えられる', d: '「なぜこの額か」を、計算過程と修正履歴で即座に説明できる。' },
]

export default function KanshiShoko() {
  const demo = demoBySlug('kanshi-shoko')!
  const records = useMemo(() => buildAuditRecords(reconcile(demo1 as unknown as Dataset)), [])
  const firstDiff = records.find((r) => r.result.status === 'diff') ?? records[0]
  const [selectedId, setSelectedId] = useState(firstDiff.result.staff.id)
  const selected = records.find((r) => r.result.staff.id === selectedId) ?? records[0]

  const handleCsv = () => downloadCsv('監査証跡_2025-06.csv', auditToCsv(records))
  const handlePrint = () => window.print()

  return (
    <>
      <DemoHero demo={demo} />

      {/* 強み */}
      <Section className="bg-panel no-print">
        <SectionHeading
          eyebrow="このソフトならではの強み"
          title="その数字が、どこから来たのかを全部たどれる"
          lead="デモ1・2の計算は、結果だけを出して終わりにしません。入力値・適用したルール・計算過程・修正履歴を職員単位で残すので、ブラックボックスになりません。"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {strengths.map((x) => (
            <Card key={x.t} className="p-5">
              <h3 className="font-semibold text-ink">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{x.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* 監査ログビューア */}
      <Section id="viewer">
        <div className="no-print">
          <SectionHeading
            eyebrow="監査ログビューア"
            title="職員を選ぶと、証跡が1枚にまとまる"
            lead="デモ1で照合した令和7年6月の結果です。職員ごとの証跡は、CSVでの書き出しと、ブラウザの印刷からのPDF保存に対応します。"
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={handleCsv}>
              監査ログをCSVで書き出す
            </Button>
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              この証跡を印刷（PDF保存）
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* 職員リスト */}
          <div className="no-print lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-line bg-panel">
              <div className="border-b border-line-strong bg-panel-2 px-4 py-2.5 text-xs font-medium text-muted">
                職員（{records.length}名）
              </div>
              <ul className="max-h-[560px] overflow-y-auto">
                {records.map((rec) => {
                  const isSel = rec.result.staff.id === selectedId
                  return (
                    <li key={rec.result.staff.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(rec.result.staff.id)}
                        aria-pressed={isSel}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 border-b border-line px-4 py-2.5 text-left transition-colors',
                          isSel ? 'bg-brand-50' : 'hover:bg-panel-2',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">
                            {rec.result.staff.name}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {rec.result.facility.name}
                          </span>
                        </span>
                        <StatusChip status={rec.result.status} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* 証跡 */}
          <div className="print-full">
            <AuditRecordView record={selected} />
          </div>
        </div>
      </Section>

      {/* 注記 + CTA */}
      <Section className="no-print">
        <div className="rounded-xl border border-line bg-panel p-6 sm:p-8">
          <h3 className="font-semibold text-ink">このデモについて</h3>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted">
            <li className="flex gap-2.5">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
              修正履歴は、デモ用に典型的な確認・修正の流れを再現したものです。実運用では、実際の操作がそのまま記録されます。
            </li>
            <li className="flex gap-2.5">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
              証跡は計算・確認の記録であり、行政提出書類や法定帳簿そのものではありません。提出書類の作成・法的判断は担当者・社労士が行います。
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={site.contactUrl} size="lg">
              引き継ぎ・監査対応の相談をする
            </Button>
            <Button to={demoBySlug('jinkenhi-sim')!.path} variant="secondary" size="lg">
              次へ：人件費シミュレーションを見る
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
