import type { AuditRecord } from '../../lib/audit'
import { StatusChip } from '../ui/Badge'
import { yen, signedYen } from '../../lib/format'
import { cn } from '../../lib/cn'

function FieldGrid({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
      {fields.map((f) => (
        <div
          key={f.label}
          className="flex items-baseline justify-between gap-3 border-b border-line py-2"
        >
          <dt className="shrink-0 text-sm text-muted">{f.label}</dt>
          <dd className="text-right text-sm text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function SectionTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5">
      <span className="font-mono text-xs text-brand">{n}</span>
      <span className="font-semibold text-ink">{children}</span>
    </h3>
  )
}

export function AuditRecordView({ record }: { record: AuditRecord }) {
  const { result, inputs, appliedRules, calcSteps, history } = record

  return (
    <div className="rounded-xl border border-line bg-panel">
      {/* ヘッダ */}
      <div className="flex items-start justify-between gap-3 border-b border-line p-5">
        <div>
          <div className="font-mono text-xs text-faint">
            監査証跡 / {result.staff.id}
          </div>
          <h2 className="mt-0.5 text-lg font-semibold text-ink">{result.staff.name}</h2>
          <p className="mt-0.5 text-sm text-muted">
            {result.facility.name} / {result.staff.jobType}
          </p>
        </div>
        <div className="text-right">
          <StatusChip status={result.status} />
          {result.status !== 'hold' && (
            <div className="mt-2 tnum text-sm text-ink">
              {yen(result.recalculated ?? 0)}
              {result.status === 'diff' && (
                <span className="ml-1 text-diff-ink">（{signedYen(result.diff ?? 0)}）</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-7 p-5">
        {/* 入力値 */}
        <section>
          <SectionTitle n="01">入力値</SectionTitle>
          <div className="mt-3">
            <FieldGrid fields={inputs} />
          </div>
        </section>

        {/* 適用ルール */}
        <section>
          <SectionTitle n="02">適用ルール</SectionTitle>
          <div className="mt-3">
            <FieldGrid fields={appliedRules} />
          </div>
        </section>

        {/* 計算過程 */}
        <section>
          <SectionTitle n="03">計算過程</SectionTitle>
          <ol className="mt-3 space-y-1.5">
            {calcSteps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="tnum shrink-0 text-faint">{String(i + 1).padStart(2, '0')}</span>
                <span className="tnum text-body">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 修正履歴 */}
        <section>
          <SectionTitle n="04">修正履歴</SectionTitle>
          <ol className="mt-4 space-y-0">
            {history.map((ev, i) => (
              <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                {/* タイムライン軸 */}
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'mt-1 h-2 w-2 shrink-0 rounded-full',
                      ev.actor === '担当者' ? 'bg-brand' : 'bg-line-strong',
                    )}
                    aria-hidden
                  />
                  {i < history.length - 1 && <span className="w-px flex-1 bg-line" aria-hidden />}
                </div>
                <div className="-mt-0.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="tnum text-xs text-faint">{ev.at}</span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px]',
                        ev.actor === '担当者'
                          ? 'bg-brand-50 text-brand'
                          : 'bg-panel-2 text-muted',
                      )}
                    >
                      {ev.actor}
                    </span>
                    <span className="text-sm font-medium text-ink">{ev.action}</span>
                  </div>
                  {ev.detail && (
                    <p className="mt-1 text-sm leading-relaxed text-muted">{ev.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
