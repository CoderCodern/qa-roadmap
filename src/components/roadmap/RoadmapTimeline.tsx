'use client'

import { useProgressStore } from '@/lib/store'
import { PHASES } from '@/data/roadmap'
import { getPhaseLockInfo, isDayUnlocked } from '@/lib/unlock'
import { PhaseCard } from './PhaseCard'

export function RoadmapTimeline() {
  const { completed, hydrated } = useProgressStore()

  // Before localStorage is rehydrated, treat everything as unlocked so the
  // UI doesn't flash a fully-locked state on first render.
  const effectiveCompleted = hydrated ? completed : Array.from({ length: 56 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {PHASES.map((phase) => {
        const lockInfo = getPhaseLockInfo(phase.id, effectiveCompleted)

        const lockedDayIds = new Set<number>(
          phase.days
            .filter((d) => !isDayUnlocked(d.id, effectiveCompleted))
            .map((d) => d.id)
        )

        return (
          <PhaseCard
            key={phase.id}
            phase={phase}
            completedDays={hydrated ? completed : []}
            lockInfo={lockInfo}
            lockedDayIds={lockedDayIds}
          />
        )
      })}
    </div>
  )
}
