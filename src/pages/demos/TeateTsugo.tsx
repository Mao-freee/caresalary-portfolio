import { DemoHero } from '../../components/demo/DemoHero'
import { ComingSoon } from '../../components/demo/ComingSoon'
import { demoBySlug } from '../../lib/demos'

export default function TeateTsugo() {
  const demo = demoBySlug('teate-tsugo')!
  return (
    <>
      <DemoHero demo={demo} />
      <ComingSoon demo={demo} />
    </>
  )
}
