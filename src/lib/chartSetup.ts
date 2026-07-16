/*
  Chart.js のグローバル登録と共通設定（デモ4で使用）。
  必要な要素だけ登録し、既定のフォント・色をデザインシステムに合わせる。
*/
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
)

// デザインシステムに合わせた既定値
Chart.defaults.font.family =
  "'IBM Plex Sans JP', system-ui, -apple-system, 'Segoe UI', sans-serif"
Chart.defaults.font.size = 12
Chart.defaults.color = '#6c7873' // --color-muted

/** グラフで使う色（トークンと対応） */
export const chartColors = {
  brand: '#1e5245',
  brandSoft: '#8fb3a8',
  addend: '#b9721a', // 加算 = 差異アンバー
  addendSoft: '#e3c48a',
  line: '#e5e3da',
  muted: '#6c7873',
  ink: '#16241f',
}
