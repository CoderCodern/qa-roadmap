'use client'

import { Star, Zap, Award, Trophy, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const milestones = [
  { days: 7, labelEn: 'One Week', labelVi: 'Một Tuần', icon: Star, color: 'yellow' },
  { days: 21, labelEn: 'Three Weeks', labelVi: 'Ba Tuần', icon: Zap, color: 'blue' },
  { days: 35, labelEn: 'Five Weeks', labelVi: 'Năm Tuần', icon: Award, color: 'purple' },
  { days: 56, labelEn: 'Complete!', labelVi: 'Hoàn Thành!', icon: Trophy, color: 'green' },
]

const unlockedColors: Record<string, string> = {
  yellow: 'border-yellow-300 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-950/30',
  blue: 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30',
  purple: 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-950/30',
  green: 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30',
}

const unlockedText: Record<string, string> = {
  yellow: 'text-yellow-600 dark:text-yellow-400',
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
  green: 'text-emerald-600 dark:text-emerald-400',
}

interface MilestoneGridProps {
  completedCount: number
}

export function MilestoneGrid({ completedCount }: MilestoneGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {milestones.map((m) => {
        const unlocked = completedCount >= m.days
        const Icon = m.icon
        return (
          <div
            key={m.days}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all',
              unlocked
                ? unlockedColors[m.color]
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'
            )}
          >
            {unlocked
              ? <Icon className={cn('h-8 w-8', unlockedText[m.color])} />
              : <Lock className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            }
            <div>
              <p className={cn(
                'text-sm font-bold',
                unlocked ? unlockedText[m.color] : 'text-gray-400 dark:text-gray-600'
              )}>
                <span className="lang-en">{m.labelEn}</span>
                <span className="lang-vi">{m.labelVi}</span>
              </p>
              <p className="text-xs text-gray-400">{m.days} days</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
