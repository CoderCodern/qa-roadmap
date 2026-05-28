'use client'

import { useEffect, useState } from 'react'
import { useProgressStore } from '@/lib/store'
import { PHASES } from '@/data/roadmap'
import { PHASE_REWARD_PRODUCTS } from '@/data/shopProducts'
import { PhaseRewardModal } from './PhaseRewardModal'

export function PhaseRewardChecker() {
  const { completed, phaseRewards, hydrated } = useProgressStore()
  const [pendingPhaseId, setPendingPhaseId] = useState<number | null>(null)

  useEffect(() => {
    if (!hydrated) return

    // Find the lowest-numbered phase that is fully complete but reward not yet settled
    for (const phase of PHASES) {
      // Only show rewards for phases that have a mapped product
      if (!PHASE_REWARD_PRODUCTS[phase.id]) continue

      const alreadySettled = phaseRewards[phase.id] === 'claimed' || phaseRewards[phase.id] === 'declined'
      if (alreadySettled) continue

      const phaseDayIds = phase.days.map((d) => d.id)
      const allDone = phaseDayIds.every((id) => completed.includes(id))
      if (allDone) {
        setPendingPhaseId(phase.id)
        break
      }
    }
  }, [completed, phaseRewards, hydrated])

  if (!pendingPhaseId) return null

  return (
    <PhaseRewardModal
      phaseId={pendingPhaseId}
      onClose={() => setPendingPhaseId(null)}
    />
  )
}
