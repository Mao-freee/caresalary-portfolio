# 照合台帳 — 介護法人向け 給与計算・検算支援デモ

介護福祉法人の給与担当者向けに、**処遇改善加算の再計算・差異検出**を中核とした業務効率化サービスのデモポートフォリオサイトです。商談で見せる公開用サイトとして、架空・匿名化データによる画面のみを掲載します。

> **データについて**
> 本リポジトリは架空・匿名化データのみを扱います。実在の法人名・実データは一切含みません。運用ルールは [CLAUDE.md](./CLAUDE.md) を参照してください。

## 収録内容

| | 内容 | 状態 |
|---|---|---|
| トップ | サービス概要・課題の全体像・4デモ導線・進め方・CTA | 公開 |
| デモ1 | 処遇改善加算 再計算・差異検出（中核／照合の入口） | **公開** |
| デモ2 | 手当・勤怠突合（列名自動マッピング・兼務按分） | **公開** |
| デモ3 | 計算根拠・監査証跡の自動出力（引き継ぎ・監査対応） | **公開** |
| デモ4 | 人件費シミュレーション・経営レポート（Chart.js） | **公開** |
| スタイルガイド | デザインシステム確認用 `/styleguide` | 公開 |

デモ1は「照合の入口」、このソフトならではの強み（フォーマットのゆらぎ吸収・計算根拠の追跡）はデモ2・3で示す構成です。

## 技術スタック

Vite + React + TypeScript + Tailwind CSS v4 / ルーティングは react-router-dom / 可視化（デモ4予定）は react-chartjs-2。バックエンドは持たず、計算ロジックはすべてクライアントサイドの TypeScript（`src/lib/ruleEngine.ts`）で完結します。架空データは `src/data/` に JSON で同梱します。

## 開発

```bash
npm install
npm run dev        # 開発サーバー（http://localhost:5173/caresalary-portfolio/）
npm run build      # 型チェック + 本番ビルド + 404.html 生成
npm run preview    # 本番ビルドをローカル確認
npm test           # ルールエンジンの単体テスト（Vitest）
npm run lint       # oxlint
npm run gen:demo1  # デモ1の架空データ(50名)を再生成
```

## ディレクトリ構成

```
src/
  main.tsx / router.tsx          ルーティング
  pages/
    Home.tsx                     ポートフォリオトップ
    StyleGuide.tsx               デザインシステム
    demos/                       ShoguKaizen(1) / TeateTsugo(2) / KanshiShoko(3) / JinkenhiSim(4)
  components/
    ui/                          Button / Card / Table / Badge / ReconLedger など共通UI
    layout/                      Nav / Footer / Layout / Container / Section
    demo/                        DemoHero / StatTile / BreakdownPanel / ComingSoon
  lib/
    ruleEngine.ts                加算配分の計算・差異検出・保留判定（共通基盤）
    mapping.ts                   列名の自動マッピング（デモ2）
    teate.ts                     手当・兼務按分の計算（デモ2）
    audit.ts                     監査証跡の生成（デモ3）
    simulate.ts                  人件費シミュレーション（デモ4）
    chartSetup.ts                Chart.js の登録と配色
    status.ts / format.ts / demos.ts / site.ts / exportCsv.ts
  data/
    demo1.json                   架空50名分のデータ（scripts/genDemo1Data.ts で生成）
    demo2.json                   3施設・列名の異なる勤怠データ（架空）
scripts/
  genDemo1Data.ts                デモ1データ生成スクリプト
```

テスト（Vitest）は `src/lib/*.test.ts`。計算ロジックはすべてテスト付きです。

## デプロイ（GitHub Pages）

`main` ブランチへ push すると、GitHub Actions（`.github/workflows/deploy.yml`）が lint・テスト・ビルドを行い、GitHub Pages へ自動デプロイします。SPA の直リンク・リロード対策として、ビルド時に `dist/index.html` を `dist/404.html` にコピーしています。

**base パスについて**: プロジェクトサイトは `https://<user>.github.io/<repo>/` で配信されるため、`vite.config.ts` の `base` を `/caresalary-portfolio/` に設定しています。リポジトリ名を変える場合は、環境変数 `VITE_BASE` で上書きするか、`vite.config.ts` の既定値を書き換えてください。

### 初回セットアップ

1. GitHub でリポジトリを作成し、このプロジェクトを push
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定
3. `main` への push で自動デプロイされます

## 問い合わせ導線

無料ヒアリングは外部フォーム（Googleフォーム等）へのリンクです。`src/lib/site.ts` の `contactUrl` を実際のフォームURLに差し替えてください。個人情報を自前サーバーへ送信する実装は行っていません。
