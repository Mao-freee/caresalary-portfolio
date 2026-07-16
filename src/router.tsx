import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
// 遅延ロードするページ（Chart.js を含むデモ4などを分割）
import {
  StyleGuide,
  ShoguKaizen,
  TeateTsugo,
  KanshiShoko,
  JinkenhiSim,
} from './pages/lazy'

// import.meta.env.BASE_URL は vite.config.ts の base（末尾に "/" を含む）。
// react-router の basename は末尾スラッシュ無しが安全なので落とす。
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'styleguide', element: <StyleGuide /> },
        { path: 'demos/shogu-kaizen', element: <ShoguKaizen /> },
        { path: 'demos/teate-tsugo', element: <TeateTsugo /> },
        { path: 'demos/kanshi-shoko', element: <KanshiShoko /> },
        { path: 'demos/jinkenhi-sim', element: <JinkenhiSim /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename },
)
