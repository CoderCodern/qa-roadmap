import { PHASES } from '@/data/roadmap'

/** Returns true if enough lessons were completed in the previous phase to start phase `phaseId`. */
export function isPhaseUnlocked(phaseId: number, completed: number[]): boolean {
  if (phaseId <= 1) return true
  const prevPhase = PHASES.find((p) => p.id === phaseId - 1)
  if (!prevPhase) return false
  const done = prevPhase.days.filter((d) => completed.includes(d.id)).length
  return done >= prevPhase.unlockThreshold
}

/**
 * Returns true if `dayId` is accessible given the current completed set.
 * - Day 1 is always open.
 * - First day of a phase: requires the previous phase to be unlocked (threshold met).
 * - All other days: require the immediately preceding day to be completed.
 */
export function isDayUnlocked(dayId: number, completed: number[]): boolean {
  if (dayId <= 1) return true
  const phase = PHASES.find((p) => p.days.some((d) => d.id === dayId))
  if (!phase) return false
  if (phase.days[0].id === dayId) {
    return isPhaseUnlocked(phase.id, completed)
  }
  return completed.includes(dayId - 1)
}

export type PhaseLockInfo =
  | { locked: false }
  | { locked: true; phaseTitle: string; phaseTitleVi: string; done: number; needed: number }

export type DayLockInfo =
  | { locked: false }
  | { locked: true; type: 'prev-day'; prevDayId: number }
  | { locked: true; type: 'phase'; phaseTitle: string; phaseTitleVi: string; done: number; needed: number }

export function getPhaseLockInfo(phaseId: number, completed: number[]): PhaseLockInfo {
  if (isPhaseUnlocked(phaseId, completed)) return { locked: false }
  const prevPhase = PHASES.find((p) => p.id === phaseId - 1)
  if (!prevPhase) return { locked: false }
  const done = prevPhase.days.filter((d) => completed.includes(d.id)).length
  return {
    locked: true,
    phaseTitle: prevPhase.title,
    phaseTitleVi: prevPhase.titleVi,
    done,
    needed: prevPhase.unlockThreshold,
  }
}

export function getDayLockInfo(dayId: number, completed: number[]): DayLockInfo {
  if (isDayUnlocked(dayId, completed)) return { locked: false }
  const phase = PHASES.find((p) => p.days.some((d) => d.id === dayId))
  if (!phase) return { locked: true, type: 'prev-day', prevDayId: dayId - 1 }

  if (phase.days[0].id === dayId) {
    const prevPhase = PHASES.find((p) => p.id === phase.id - 1)!
    const done = prevPhase.days.filter((d) => completed.includes(d.id)).length
    return {
      locked: true,
      type: 'phase',
      phaseTitle: prevPhase.title,
      phaseTitleVi: prevPhase.titleVi,
      done,
      needed: prevPhase.unlockThreshold,
    }
  }

  return { locked: true, type: 'prev-day', prevDayId: dayId - 1 }
}
