'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  streak: number
  longestStreak: number
}

export function StreakBadge({ streak, longestStreak }: StreakBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        'flex items-center gap-3 rounded-2xl border p-5',
        streak >= 7
          ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/30'
          : streak > 0
            ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20'
            : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'
      )}>
        <Flame className={cn(
          'h-8 w-8',
          streak >= 7 ? 'text-orange-500 animate-pulse' : streak > 0 ? 'text-orange-400' : 'text-gray-300 dark:text-gray-600'
        )} />
        <div>
          <p className={cn(
            'text-3xl font-bold',
            streak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'
          )}>
            {streak}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="lang-en">day streak</span>
            <span className="lang-vi">ngày liên tiếp</span>
          </p>
        </div>
      </div>
      {longestStreak > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="lang-en">Longest: {longestStreak} days</span>
          <span className="lang-vi">Dài nhất: {longestStreak} ngày</span>
        </p>
      )}
    </div>
  )
}
