'use client'

import { Flame } from 'lucide-react'
import { useProgressStore } from '@/lib/store'

export function StreakCallout() {
  const streak = useProgressStore((s) => s.streak)
  if (streak === 0) return null

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
      <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 dark:border-orange-800/60 dark:bg-orange-950/30">
        <Flame className="h-5 w-5 shrink-0 text-orange-500" />
        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
          <span className="lang-en">
            🔥 Don&apos;t lose your streak! You&apos;re on a {streak}-day run. Keep it alive by completing today&apos;s lesson.
          </span>
          <span className="lang-vi">
            🔥 Đừng để mất streak! Bạn đang có {streak} ngày liên tiếp. Hãy hoàn thành bài học hôm nay để duy trì.
          </span>
        </p>
      </div>
    </div>
  )
}
