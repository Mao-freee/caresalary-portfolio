import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages のプロジェクトサイトは https://<user>.github.io/<repo>/ で配信される。
// そのため base をリポジトリ名に合わせておく。リポジトリ名を変えたら VITE_BASE で上書きするか
// ここの既定値を書き換える。ローカル開発でも同じ base で動くので本番との差が出にくい。
const base = process.env.VITE_BASE ?? '/caresalary-portfolio/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
