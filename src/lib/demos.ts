/** 4つのデモの定義。ナビ・フッター・トップ・各ページで共有する単一の情報源。 */

export type DemoStatus = 'ready' | 'coming'

export type Demo = {
  n: number
  slug: string
  path: string
  title: string
  /** ナビ等で使う短い名前 */
  short: string
  role: '中核デモ' | '拡張デモ'
  roleNote: string
  /** カード等に出す一言 */
  tagline: string
  /** 主に対応する課題 */
  problem: string
  status: DemoStatus
}

export const demos: Demo[] = [
  {
    n: 1,
    slug: 'shogu-kaizen',
    path: '/demos/shogu-kaizen',
    title: '処遇改善加算 再計算・差異検出',
    short: '加算 再計算',
    role: '中核デモ',
    roleNote: '初回商談で必ず見せる核',
    tagline: '確定済みの加算配分を丸ごと検算し、職員ごとの差異を洗い出す。',
    problem: 'Excel手計算のミス／配分ルールの複雑さ／計算根拠が残らない',
    status: 'ready',
  },
  {
    n: 2,
    slug: 'teate-tsugo',
    path: '/demos/teate-tsugo',
    title: '手当・勤怠突合（夜勤・資格・兼務按分）',
    short: '手当・勤怠突合',
    role: '拡張デモ',
    roleNote: '横展開・アップセル',
    tagline: 'フォーマットの違う施設データを取り込み、手当と按分を自動で揃える。',
    problem: '施設間フォーマット不統一／按分漏れ／締め日前の業務集中',
    status: 'ready',
  },
  {
    n: 3,
    slug: 'kanshi-shoko',
    path: '/demos/kanshi-shoko',
    title: '計算根拠・監査証跡の自動出力',
    short: '監査証跡',
    role: '拡張デモ',
    roleNote: '信頼性の訴求',
    tagline: '入力値・適用ルール・計算過程を職員単位で残し、引き継ぎ資料にする。',
    problem: '属人化・引き継ぎ不能／監査対応力の不足',
    status: 'ready',
  },
  {
    n: 4,
    slug: 'jinkenhi-sim',
    path: '/demos/jinkenhi-sim',
    title: '人件費シミュレーション・経営レポート',
    short: '人件費シミュレーション',
    role: '拡張デモ',
    roleNote: '決裁者向け',
    tagline: '加算率の改定や採用計画が人件費に与える影響を、その場で試算する。',
    problem: '経営層の意思決定支援／加算率改定インパクトの可視化',
    status: 'ready',
  },
]

export const demoBySlug = (slug: string) => demos.find((d) => d.slug === slug)
