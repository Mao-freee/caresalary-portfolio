import { Link } from 'react-router-dom'
import { Container } from '../components/layout/Container'
import { Section, SectionHeading } from '../components/layout/Section'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { StatusChip, Eyebrow } from '../components/ui/Badge'
import { ReconLedger, type ReconEntry } from '../components/ui/ReconLedger'
import { demos } from '../lib/demos'
import { site } from '../lib/site'

const heroEntries: ReconEntry[] = [
  { id: '1', name: '佐藤 美咲', meta: '桜ケ丘の家 / 介護福祉士', current: 41200, recalculated: 41200, status: 'match' },
  { id: '2', name: '鈴木 一郎', meta: 'みどり苑 / 実務者研修', current: 33800, recalculated: 36500, status: 'diff' },
  { id: '3', name: '田村 里佳', meta: 'あおば / 初任者研修', current: 28500, recalculated: 28500, status: 'match' },
  { id: '4', name: '高橋 結衣', meta: '兼務2施設 / 介護福祉士', current: 38000, recalculated: 0, status: 'hold' },
]

const workflow = [
  { t: '収集', d: '各事業所から勤怠・夜勤・資格・兼務を集める' },
  { t: '集約・突合', d: '本部で1つのExcelにまとめる' },
  { t: '加算・手当の計算', d: '処遇改善加算・夜勤・資格・兼務按分を手計算' },
  { t: '給与ソフトへ転記', d: '結果を1件ずつ入力' },
  { t: '差異の目視チェック', d: '前月結果と目で見比べる' },
  { t: '給与確定', d: '締め日前の数日に作業が集中' },
]

const genzai = [
  '締め日前の業務集中による残業',
  'Excel手計算・転記ミスによる差し戻し',
  '施設間でフォーマットが不統一で集計に時間がかかる',
  '処遇改善加算の配分ルールが複雑で不安',
  '担当者が1〜3人で属人化（休めない・引き継げない）',
]

const senzai = [
  '加算要件の改定に追随できず、加算率を取りこぼす／未達で申請してしまう',
  '担当者の退職でExcelの計算ロジックがブラックボックス化する',
  '計算根拠が残らず、監査・行政の指摘に説明できない',
  '兼務・異動の按分漏れで施設間の待遇に不公平が生じる',
  '加算率改定や採用計画の人件費影響を経営層が試算できていない',
]

const promises = [
  {
    k: '01',
    t: '架空・匿名化データで検証',
    d: '公開デモは実データを一切含みません。実案件でも、匿名化・仮名化と「実データを持ち出さない運用」を前提に設計します。',
  },
  {
    k: '02',
    t: '最終確定は必ず人間',
    d: 'AIが担うのは規程の構造化・列の対応付け・例外候補の提示まで。計算の確定は担当者が行います。判断できないケースは推測せず止めます。',
  },
  {
    k: '03',
    t: '計算根拠が残る',
    d: '入力値・適用したルール・計算過程を職員単位で記録します。監査対応や担当者の引き継ぎ資料として、そのまま使えます。',
  },
]

const flow = [
  { k: '01', t: '無料ヒアリング', d: '「何人が・月何時間・ミスが出たら何時間の手戻りか」を具体的な数字で伺います。' },
  { k: '02', t: '有償業務診断（必要な場合）', d: '対象業務を1枚に整理し、どこを・どの順で効率化できるかを見立てます。' },
  { k: '03', t: '有償PoC', d: '全対象者に結果か例外が出る・計算不能は停止する等、6つの受入条件で合否を判定します。' },
]

export default function Home() {
  const core = demos.find((d) => d.status === 'ready')

  return (
    <>
      {/* ── ヒーロー：署名要素の照合台帳を実演する ── */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="ledger-grid absolute inset-0 opacity-70" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/30 to-transparent" aria-hidden />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <Eyebrow>介護福祉法人の給与担当者へ</Eyebrow>
              <h1 className="mt-5 text-[1.7rem] font-semibold leading-[1.35] tracking-tight text-ink sm:text-[2.5rem] sm:leading-[1.28]">
                <span className="block">合っているはずの給与を、</span>
                <span className="block">もう一度、突き合わせる。</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-body sm:text-lg">
                確定済みの処遇改善加算を、ルール通りに丸ごと再計算。
                現行結果との差異を職員ごとに洗い出し、判断できないケースは
                <span className="font-medium text-hold-ink">保留</span>
                として止めます。Excel担当者が、翌月からそのまま使えます。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={site.contactUrl} size="lg">
                  無料ヒアリングを申し込む
                </Button>
                {core && (
                  <Button to={core.path} variant="secondary" size="lg">
                    中核デモを見る
                  </Button>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-2">
                  <StatusChip status="match" /> 一致はそのまま
                </span>
                <span className="inline-flex items-center gap-2">
                  <StatusChip status="diff" /> 差異は理由候補つき
                </span>
                <span className="inline-flex items-center gap-2">
                  <StatusChip status="hold" /> 判断不能は止める
                </span>
              </div>
            </div>

            <div className="lg:pl-4">
              <ReconLedger
                caption="令和7年6月 / 桜ケ丘福祉会（架空データ）"
                entries={heroEntries}
              />
              <p className="mt-3 text-center font-mono text-xs text-faint">
                ↑ 実際の画面イメージ（架空の50名分データで動作）
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 毎月の給与締めで起きていること（As-Is、順序があるので番号を使う） ── */}
      <Section id="service" className="bg-panel">
        <SectionHeading
          eyebrow="毎月、給与締めの数日間に"
          title="ひとつのExcelに、施設も加算も手当も集まってくる"
          lead="法人本部の給与担当者は、施設ごとにバラバラな形式のデータを集め、加算と手当を手計算し、給与ソフトへ転記し、前月との差異を目視で確認しています。その一連が締め日前に集中します。"
        />
        <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {workflow.map((s, i) => (
            <li key={s.t} className="bg-panel p-5">
              <span className="font-mono text-xs text-brand">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-1 font-semibold text-ink">{s.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── 課題：顕在 / 潜在 ── */}
      <Section id="kadai">
        <SectionHeading
          eyebrow="対応する課題"
          title="「日々の作業を楽にしたい」と、「法人としてのリスク」"
          lead="担当者がすぐに口にする困りごとの奥に、経営目線でのリスクが隠れています。照合台帳は、まず前者を軽くしながら、後者の芽も同時に摘みます。"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-diff" aria-hidden />
              <h3 className="font-semibold text-ink">顕在的な課題</h3>
              <span className="text-xs text-muted">— 個人の困りごと</span>
            </div>
            <ul className="mt-5 space-y-3">
              {genzai.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-body">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-hold" aria-hidden />
              <h3 className="font-semibold text-ink">潜在的な課題</h3>
              <span className="text-xs text-muted">— 経営目線のリスク</span>
            </div>
            <ul className="mt-5 space-y-3">
              {senzai.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-relaxed text-body">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* ── デモ導線 ── */}
      <Section id="demos" className="bg-panel">
        <SectionHeading
          eyebrow="4つのデモ"
          title="共通の計算基盤に、入力データと画面だけを載せ替える"
          lead="すべて同じルールエンジン（金額計算・条件分岐・端数処理）が土台。中核デモを核に、法人ごとに刺さる課題へ引き出しを広げていきます。"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {demos.map((d) => (
            <Card key={d.slug} interactive={d.status === 'ready'} className="relative flex flex-col p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm text-brand">
                    DEMO {String(d.n).padStart(2, '0')}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-line-strong bg-paper px-2.5 py-0.5 text-xs text-muted">
                    {d.role}
                  </span>
                </div>
                {d.status === 'ready' ? (
                  <StatusChip status="match">公開中</StatusChip>
                ) : (
                  <StatusChip status="diff">準備中</StatusChip>
                )}
              </div>

              <h3 className="mt-4 text-lg font-semibold text-ink">{d.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{d.tagline}</p>

              <div className="mt-5 border-t border-line pt-4">
                <div className="text-xs text-faint">対応する課題</div>
                <div className="mt-1 text-sm text-body">{d.problem}</div>
              </div>

              <div className="mt-5">
                {d.status === 'ready' ? (
                  <Link
                    to={d.path}
                    className="inline-flex items-center gap-1.5 font-medium text-brand hover:gap-2.5 hover:underline"
                  >
                    デモを開く
                    <span aria-hidden>→</span>
                  </Link>
                ) : (
                  <Link
                    to={d.path}
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand"
                  >
                    概要を見る
                    <span aria-hidden>→</span>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── 3つの約束（信頼・AIガバナンス・社労士法の境界） ── */}
      <Section id="approach">
        <SectionHeading
          eyebrow="安心して任せられる理由"
          title="AIに全部やらせる、ではありません"
          lead="計算を速くすることより、間違えないこと・後から説明できることを優先しています。"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {promises.map((p) => (
            <Card key={p.k} className="p-6">
              <span className="font-mono text-sm text-brand">{p.k}</span>
              <h3 className="mt-2 font-semibold text-ink">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── 進め方 ── */}
      <Section id="flow" className="bg-panel">
        <SectionHeading
          eyebrow="進め方"
          title="小さく試してから、決めていただけます"
          lead="いきなり導入ではなく、無料のヒアリングから。効果が見込めるかを、具体的な数字で一緒に確かめます。"
        />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {flow.map((s) => (
            <li key={s.k}>
              <Card className="h-full p-6">
                <span className="font-mono text-sm text-brand">{s.k}</span>
                <h3 className="mt-2 font-semibold text-ink">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── CTA ── */}
      <Section>
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-brand px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl text-2xl font-semibold leading-snug text-white sm:text-3xl">
            まずは、いまの締め作業の「人数・時間・手戻り」を聞かせてください。
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-brand-50">
            効率化できそうかどうかから、一緒に確かめます。ヒアリングは無料です。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={site.contactUrl}
              size="lg"
              className="bg-white text-brand hover:bg-brand-50"
            >
              無料ヒアリングを申し込む
            </Button>
            {core && (
              <Button
                to={core.path}
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                先に中核デモを見る
              </Button>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
