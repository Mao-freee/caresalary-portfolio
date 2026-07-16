import { useMemo, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import type { ChartOptions } from 'chart.js'
import { DemoHero } from '../../components/demo/DemoHero'
import { Section, SectionHeading } from '../../components/layout/Section'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { StatTile } from '../../components/demo/StatTile'
import { demoBySlug } from '../../lib/demos'
import { site } from '../../lib/site'
import { yen, signedYen, manYen, percent } from '../../lib/format'
import { buildBaseline, simulate, type Scenario } from '../../lib/simulate'
import { chartColors } from '../../lib/chartSetup'
import type { Dataset } from '../../lib/ruleEngine'
import demo1 from '../../data/demo1.json'

const presets: { label: string; scenario: Scenario }[] = [
  { label: 'リセット', scenario: { kasanDelta: 0, hires: 0, leaves: 0 } },
  { label: '加算率 +2.5%', scenario: { kasanDelta: 0.025, hires: 0, leaves: 0 } },
  { label: '介護福祉士を3名採用', scenario: { kasanDelta: 0, hires: 3, leaves: 0 } },
  { label: '加算+2.5% & 2名採用 & 1名退職', scenario: { kasanDelta: 0.025, hires: 2, leaves: 1 } },
]

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink">{label}</label>
        <span className="tnum text-sm font-semibold text-brand">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand"
        aria-label={label}
      />
    </div>
  )
}

export default function JinkenhiSim() {
  const demo = demoBySlug('jinkenhi-sim')!
  const baseline = useMemo(() => buildBaseline(demo1 as unknown as Dataset), [])
  const [scenario, setScenario] = useState<Scenario>({ kasanDelta: 0, hires: 0, leaves: 0 })
  const sim = useMemo(() => simulate(baseline, scenario), [baseline, scenario])

  const set = (patch: Partial<Scenario>) => setScenario((s) => ({ ...s, ...patch }))
  const costTone = sim.monthlyDiff > 0 ? 'diff' : sim.monthlyDiff < 0 ? 'match' : 'neutral'

  const barData = {
    labels: ['現状', 'シナリオ'],
    datasets: [
      {
        label: '基本給',
        data: [sim.composition.baseSalary.base, sim.composition.baseSalary.scenario],
        backgroundColor: chartColors.brand,
        stack: 'a',
        borderRadius: 4,
      },
      {
        label: '処遇改善加算',
        data: [sim.composition.addend.base, sim.composition.addend.scenario],
        backgroundColor: chartColors.addend,
        stack: 'a',
        borderRadius: 4,
      },
    ],
  }

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true } },
      tooltip: {
        callbacks: { label: (c) => `${c.dataset.label}: ${yen(c.parsed.y ?? 0)}` },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: {
        stacked: true,
        ticks: { callback: (v) => manYen(Number(v)) },
        grid: { color: chartColors.line },
      },
    },
  }

  const lineData = {
    labels: sim.series.map((s) => s.month),
    datasets: [
      {
        label: '現状',
        data: sim.series.map((s) => s.baseline),
        borderColor: chartColors.muted,
        backgroundColor: 'transparent',
        borderDash: [5, 4],
        pointRadius: 0,
        borderWidth: 1.5,
        tension: 0.2,
      },
      {
        label: 'シナリオ',
        data: sim.series.map((s) => s.scenario),
        borderColor: chartColors.brand,
        backgroundColor: 'rgba(30, 82, 69, 0.06)',
        fill: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.2,
      },
    ],
  }

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, boxHeight: 12, usePointStyle: true } },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${yen(c.parsed.y ?? 0)}` } },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        ticks: { callback: (v) => manYen(Number(v)) },
        grid: { color: chartColors.line },
      },
    },
  }

  return (
    <>
      <DemoHero demo={demo} />

      {/* 価値 */}
      <Section className="bg-panel">
        <SectionHeading
          eyebrow="決裁者向け"
          title="加算率の改定や採用計画が、人件費にいくら効くか"
          lead="デモ1のデータを土台に、加算率の変更・増員・退職をその場で試算します。数字の裏付けがあれば、経営の意思決定は後手に回りません。"
        />
      </Section>

      {/* シミュレーター */}
      <Section id="sim">
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* 操作パネル */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <h3 className="font-semibold text-ink">シナリオを動かす</h3>
              <p className="mt-1 text-xs text-muted">スライダーを動かすと、右のグラフが即時に更新されます。</p>
              <div className="mt-5 space-y-5">
                <Slider
                  label="加算率の増減"
                  value={scenario.kasanDelta}
                  min={-0.1}
                  max={0.3}
                  step={0.005}
                  onChange={(v) => set({ kasanDelta: v })}
                  display={(scenario.kasanDelta >= 0 ? '+' : '−') + percent(Math.abs(scenario.kasanDelta))}
                />
                <Slider
                  label="増員"
                  value={scenario.hires}
                  min={0}
                  max={20}
                  step={1}
                  onChange={(v) => set({ hires: v })}
                  display={`${scenario.hires}名`}
                />
                <Slider
                  label="退職"
                  value={scenario.leaves}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(v) => set({ leaves: v })}
                  display={`${scenario.leaves}名`}
                />
              </div>

              <div className="mt-6 border-t border-line pt-4">
                <div className="text-xs text-faint">クイック設定</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setScenario(p.scenario)}
                      className="rounded-full border border-line-strong bg-panel px-3 py-1.5 text-xs text-body transition-colors hover:border-brand hover:text-brand"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 結果 */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile
                label="月間人件費"
                value={yen(sim.scenarioMonthly)}
                tone={costTone === 'neutral' ? 'brand' : costTone}
                sub={`現状 ${yen(sim.baselineMonthly)} / ${signedYen(sim.monthlyDiff)}`}
              />
              <StatTile
                label="年間人件費"
                value={yen(sim.scenarioAnnual)}
                tone={costTone === 'neutral' ? 'brand' : costTone}
                sub={`年間差 ${signedYen(sim.annualDiff)}`}
              />
              <StatTile
                label="人数"
                value={`${sim.scenarioHeadcount}名`}
                tone="neutral"
                sub={`現状 ${sim.headcount}名 / ${sim.scenarioHeadcount - sim.headcount >= 0 ? '+' : ''}${sim.scenarioHeadcount - sim.headcount}名`}
              />
            </div>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-ink">人件費の内訳（現状 / シナリオ）</h3>
              <div className="mt-4 h-64">
                <Bar data={barData} options={barOptions} />
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-ink">月間人件費の12ヶ月推移</h3>
              <p className="mt-1 text-xs text-muted">増員・退職は年内に段階的に反映、加算率改定は即時反映として試算。</p>
              <div className="mt-4 h-64">
                <Line data={lineData} options={lineOptions} />
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* 注記 + CTA */}
      <Section className="bg-panel">
        <div className="rounded-xl border border-line bg-panel p-6 sm:p-8">
          <h3 className="font-semibold text-ink">このデモについて</h3>
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted">
            <li className="flex gap-2.5">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
              基本給は役職・勤続・資格・常勤換算から組み立てた架空モデルです。実際は法人の給与規程に合わせて算定します。
            </li>
            <li className="flex gap-2.5">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
              増員・退職は平均的な職員像で試算しています。実運用では採用計画の職種・時期を反映してより精緻に見積もれます。
            </li>
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={site.contactUrl} size="lg">
              自社の計画で試算したい
            </Button>
            <Button to="/#demos" variant="secondary" size="lg">
              デモ一覧に戻る
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}
