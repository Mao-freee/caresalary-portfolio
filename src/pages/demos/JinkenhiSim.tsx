import { DemoHero } from '../../components/demo/DemoHero'
import { ComingSoon } from '../../components/demo/ComingSoon'
import { demoBySlug } from '../../lib/demos'

export default function JinkenhiSim() {
  const demo = demoBySlug('jinkenhi-sim')!
  return (
    <>
      <DemoHero demo={demo} />
      <ComingSoon demo={demo} />
    </>
  )
}
