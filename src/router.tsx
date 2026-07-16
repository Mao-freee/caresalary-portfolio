import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import StyleGuide from './pages/StyleGuide'
import NotFound from './pages/NotFound'
import ShoguKaizen from './pages/demos/ShoguKaizen'
import TeateTsugo from './pages/demos/TeateTsugo'
import KanshiShoko from './pages/demos/KanshiShoko'
import JinkenhiSim from './pages/demos/JinkenhiSim'

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
