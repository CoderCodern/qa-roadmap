import { HeroSection } from '@/components/home/HeroSection'
import { PhaseOverview } from '@/components/home/PhaseOverview'
import { FeatureStrip } from '@/components/home/FeatureStrip'
import { StreakCallout } from '@/components/home/StreakCallout'
import { PHASES } from '@/data/roadmap'

export default function HomePage() {
  return (
    <>
      <StreakCallout />
      <HeroSection />
      <PhaseOverview phases={PHASES} />
      <FeatureStrip />
    </>
  )
}
