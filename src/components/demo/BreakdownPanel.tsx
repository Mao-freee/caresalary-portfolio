import type { StaffResult } from '../../lib/ruleEngine'
import { StatusChip } from '../ui/Badge'
import { statusLabel } from '../../lib/status'
import { yen, signedYen, num } from '../../lib/format'
import { cn } from '../../lib/cn'

function Row({ label, value, weight }: { label: string; value: string; weight?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-b-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="flex items-baseline gap-2">
        <span className="text-sm text-body">{value}</span>
        {weight && <span className="tnum text-sm font-medium text-ink">×{weight}</span>}
      </span>
    </div>
  )
}

export function BreakdownPanel({ result }: { result: StaffResult }) {
  const { staff, facility, status, breakdown, recalculated, diff, reasons } = result

  return (
    <div className="rounded-xl border border-line bg-panel">
      {/* ヘッダ */}
      <div className="flex items-start justify-between gap-3 border-b border-line p-5">
        <div className="min-w-0">
          <div className="font-mono text-xs text-faint">{staff.id}</div>
          <h3 className="mt-0.5 text-lg font-semibold text-ink">{staff.name}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {facility.name} / {staff.jobType} / {staff.employment}
          </p>
        </div>
        <StatusChip status={status} />
      </div>

      {status === 'hold' ? (
        // ── 保留：計算を止めている ──
        <div className="p-5">
          <div className="rounded-lg border border-hold-line bg-hold-bg p-4">
            <div className="flex items-center gap-2 font-medium text-hold-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-hold" aria-hidden />
              計算を止めています
            </div>
            <p className="mt-2 text-sm leading-relaxed text-hold-ink/90">{reasons[0]}</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            推測で数字を作らず、担当者の確認を待ちます。確認後に入力を補うと、再計算の対象に戻ります。
          </p>
          <dl className="mt-4 space-y-0">
            <Row label="資格" value={staff.qualification ?? '未確認'} />
            <Row label="キャリアパス要件" value={staff.careerPathMet === null ? '未入力' : staff.careerPathMet ? '充足' : '未充足'} />
            <Row label="兼務" value={staff.concurrent ? (staff.concurrentHoursConfirmed ? '所定時間確定済み' : '所定時間 未確定') : 'なし'} />
            <Row label="現行の配分額" value={yen(staff.currentAllocation)} />
          </dl>
        </div>
      ) : (
        // ── 一致・差異：再計算の内訳を出す ──
        <div className="p-5">
          {/* 現行 → 再計算 → 差異 */}
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-paper p-3 text-center">
            <div>
              <div className="text-xs text-muted">現行</div>
              <div className="tnum mt-1 text-base text-body">{yen(staff.currentAllocation)}</div>
            </div>
            <div className="border-x border-line">
              <div className="text-xs text-muted">再計算</div>
              <div className="tnum mt-1 text-base font-semibold text-ink">{yen(recalculated ?? 0)}</div>
            </div>
            <div>
              <div className="text-xs text-muted">差異</div>
              <div
                className={cn(
                  'tnum mt-1 text-base font-semibold',
                  status === 'diff' ? 'text-diff-ink' : 'text-muted',
                )}
              >
                {signedYen(diff ?? 0)}
              </div>
            </div>
          </div>

          {/* 計算根拠 */}
          {breakdown && (
            <div className="mt-5">
              <div className="font-mono text-xs tracking-wide text-faint">計算根拠</div>
              <dl className="mt-2">
                <Row label={`配分単価（${facility.name}）`} value={`${yen(breakdown.rate)} / 点`} />
                <Row label="基本点数" value={`${num(breakdown.basePoints)} 点`} />
                <Row label="資格" value={breakdown.qualification} weight={breakdown.qualWeight.toFixed(2)} />
                <Row
                  label="勤続年数"
                  value={`${breakdown.tenureYears}年（${breakdown.tenureLabel}）`}
                  weight={breakdown.tenureWeight.toFixed(2)}
                />
                <Row label="役職" value={breakdown.role} weight={breakdown.roleWeight.toFixed(2)} />
                <Row
                  label="常勤換算"
                  value={staff.employment}
                  weight={breakdown.fteRatio.toFixed(2)}
                />
              </dl>
              <div className="mt-3 rounded-lg bg-panel-2 p-3">
                <div className="tnum text-xs leading-relaxed text-muted">
                  {yen(breakdown.rate)} × {breakdown.basePoints} × {breakdown.qualWeight} ×{' '}
                  {breakdown.tenureWeight} × {breakdown.roleWeight} × {breakdown.fteRatio.toFixed(2)}
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-xs text-muted">理論額（四捨五入前）</span>
                  <span className="tnum text-sm text-body">
                    ¥{breakdown.rawAmount.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs text-muted">再計算額（円未満四捨五入）</span>
                  <span className="tnum text-sm font-semibold text-ink">{yen(recalculated ?? 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 理由候補 */}
          {status === 'diff' && (
            <div className="mt-5">
              <div className="font-mono text-xs tracking-wide text-faint">
                差異の理由候補
              </div>
              <ul className="mt-2 space-y-2">
                {reasons.map((r, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 rounded-lg border border-diff-line bg-diff-bg px-3 py-2.5 text-sm leading-relaxed text-diff-ink"
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-xs">候補{i + 1}</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                候補は現行額を別の前提で再現して推定したものです。最終的な判断は担当者が行います。
              </p>
            </div>
          )}

          {status === 'match' && (
            <p className="mt-5 flex items-center gap-2 text-sm text-match-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-match" aria-hidden />
              現行と再計算が一致しています（{statusLabel.match}）。
            </p>
          )}
        </div>
      )}
    </div>
  )
}
