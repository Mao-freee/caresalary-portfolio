import { lazy } from 'react'

// 遅延ロードするページ。ここにまとめることで router.tsx を設定だけに保つ。
export const StyleGuide = lazy(() => import('./StyleGuide'))
export const ShoguKaizen = lazy(() => import('./demos/ShoguKaizen'))
export const TeateTsugo = lazy(() => import('./demos/TeateTsugo'))
export const KanshiShoko = lazy(() => import('./demos/KanshiShoko'))
export const JinkenhiSim = lazy(() => import('./demos/JinkenhiSim'))
