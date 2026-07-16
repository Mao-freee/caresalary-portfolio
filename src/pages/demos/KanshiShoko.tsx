import { DemoHero } from '../../components/demo/DemoHero'
import { ComingSoon } from '../../components/demo/ComingSoon'
import { demoBySlug } from '../../lib/demos'

export default function KanshiShoko() {
  const demo = demoBySlug('kanshi-shoko')!
  return (
    <>
      <DemoHero demo={demo} />
      <ComingSoon demo={demo} />
    </>
  )
}
