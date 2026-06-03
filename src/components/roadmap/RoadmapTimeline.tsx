'use client'

import { useProgressStore } from '@/lib/store'
import { PHASES } from '@/data/roadmap'
import { getPhaseLockInfo, isDayUnlocked, isDayAvailable } from '@/lib/unlock'
import { PhaseCard } from './PhaseCard'

interface RoadmapTimelineProps {
  /**
   * DB-level availability overrides keyed by dayId.
   * Passed from the server component so admin publish/hide changes are
   * reflected immediately after `revalidatePath('/roadmap')`, without
   * needing to update roadmap.ts.
   * Days without an entry fall back to the static `available` flag in roadmap.ts.
   */
  availabilityOverrides?: Record<number, boolean>
}

export function RoadmapTimeline({ availabilityOverrides = {} }: RoadmapTimelineProps) {
  const { completed, hydrated, devPreview } = useProgressStore()

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

        const comingSoonDayIds = new Set<number>(
          phase.days
            .filter((d) => {
              // DB override wins; fall back to static roadmap.ts flag
              const override = availabilityOverrides[d.id]
              return override !== undefined
                ? !override
                : !isDayAvailable(d.id, devPreview)
            })
            .map((d) => d.id)
        )

        return (
          <PhaseCard
            key={phase.id}
            phase={phase}
            completedDays={hydrated ? completed : []}
            lockInfo={lockInfo}
            lockedDayIds={lockedDayIds}
            comingSoonDayIds={comingSoonDayIds}
          />
        )
      })}
    </div>
  )
}
