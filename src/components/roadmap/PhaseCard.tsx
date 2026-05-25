import {
  BookOpen, Code2, Monitor, Globe, Trophy, Lock,
  type LucideIcon,
} from 'lucide-react'
import { type Phase } from '@/data/roadmap'
import { type PhaseLockInfo } from '@/lib/unlock'
import { DayCard } from './DayCard'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Code2,
  Monitor,
  Globe,
  Trophy,
}

interface PhaseCardProps {
  phase: Phase
  completedDays: number[]
  /** Pre-computed lock state for this phase (from RoadmapTimeline). */
  lockInfo: PhaseLockInfo
  /** Per-day locked IDs — a day is locked if its id is in this set. */
  lockedDayIds: Set<number>
}

export function PhaseCard({ phase, completedDays, lockInfo, lockedDayIds }: PhaseCardProps) {
  const Icon = iconMap[phase.iconName] ?? BookOpen
  const doneCount = phase.days.filter((d) => completedDays.includes(d.id)).length
  const total = phase.days.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <div className={cn(
      'rounded-2xl border bg-white dark:bg-gray-900',
      lockInfo.locked
        ? 'border-gray-200 opacity-80 dark:border-gray-800'
        : 'border-gray-200 dark:border-gray-700'
    )}>
      {/* Phase header */}
      <div className={cn(
        'flex items-center gap-3 rounded-t-2xl border-b p-5',
        lockInfo.locked
          ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60'
          : `${phase.borderClass} ${phase.bgClass}`
      )}>
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          lockInfo.locked ? 'bg-gray-100 dark:bg-gray-800' : phase.bgClass
        )}>
          {lockInfo.locked
            ? <Lock className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            : <Icon className={cn('h-5 w-5', phase.textClass)} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{phase.weekRange}</p>
          <h3 className={cn(
            'font-bold',
            lockInfo.locked ? 'text-gray-400 dark:text-gray-600' : phase.textClass
          )}>
            <span className="lang-en">{phase.title}</span>
            <span className="lang-vi">{phase.titleVi}</span>
          </h3>
          {lockInfo.locked && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">
              <span className="lang-en">
                Complete {lockInfo.needed - lockInfo.done} more lesson{lockInfo.needed - lockInfo.done !== 1 ? 's' : ''} in <strong>{lockInfo.phaseTitle}</strong> to unlock
              </span>
              <span className="lang-vi">
                Hoàn thành thêm {lockInfo.needed - lockInfo.done} bài trong <strong>{lockInfo.phaseTitleVi}</strong> để mở khóa
              </span>
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          {lockInfo.locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-600">
              <Lock className="h-3 w-3" />
              <span className="lang-en">Locked</span>
              <span className="lang-vi">Khóa</span>
            </span>
          ) : (
            <>
              <p className={cn('text-lg font-bold', phase.textClass)}>{doneCount}/{total}</p>
              <p className="text-xs text-gray-400">{pct}%</p>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
        {!lockInfo.locked && (
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        )}
      </div>

      {/* Day cards */}
      <div className="grid gap-2 p-4 sm:grid-cols-2">
        {phase.days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            phase={phase}
            isCompleted={completedDays.includes(day.id)}
            isLocked={lockedDayIds.has(day.id)}
          />
        ))}
      </div>
    </div>
  )
}
