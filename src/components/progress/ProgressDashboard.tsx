'use client'

import { useState } from 'react'
import { RefreshCcw, Calendar } from 'lucide-react'
import { useProgressStore } from '@/lib/store'
import { getDayById } from '@/data/roadmap'
import { formatDate } from '@/lib/utils'
import { ProgressRing } from './ProgressRing'
import { StreakBadge } from './StreakBadge'
import { MilestoneGrid } from './MilestoneGrid'
import { Button } from '@/components/ui/Button'

const TOTAL_DAYS = 56

export function ProgressDashboard() {
  const { completed, completedDates, streak, longestStreak, reset } = useProgressStore()
  const [confirming, setConfirming] = useState(false)

  const handleReset = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    reset()
    setConfirming(false)
  }

  const recentActivity = Object.entries(completedDates)
    .map(([idStr, date]) => ({ id: Number(idStr), date }))
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, 7)

  return (
    <div className="space-y-8">
      {/* Progress ring + streak */}
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
        <div className="flex flex-col items-center gap-3">
          <ProgressRing completed={completed.length} total={TOTAL_DAYS} />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="lang-en">{TOTAL_DAYS - completed.length} lessons remaining</span>
            <span className="lang-vi">{TOTAL_DAYS - completed.length} bài học còn lại</span>
          </p>
        </div>
        <StreakBadge streak={streak} longestStreak={longestStreak} />
      </div>

      {/* Milestones */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
          <span className="lang-en">Milestones</span>
          <span className="lang-vi">Cột mốc</span>
        </h2>
        <MilestoneGrid completedCount={completed.length} />
      </section>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
            <span className="lang-en">Recent Activity</span>
            <span className="lang-vi">Hoạt động gần đây</span>
          </h2>
          <ul className="space-y-2">
            {recentActivity.map(({ id, date }) => {
              const day = getDayById(id)
              if (!day) return null
              return (
                <li key={id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {id}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                      <span className="lang-en">{day.title}</span>
                      <span className="lang-vi">{day.titleVi}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(date)}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Reset */}
      <section className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            variant={confirming ? 'danger' : 'secondary'}
            size="sm"
            onClick={handleReset}
          >
            <RefreshCcw className="h-4 w-4" />
            {confirming
              ? <><span className="lang-en">Confirm Reset</span><span className="lang-vi">Xác nhận đặt lại</span></>
              : <><span className="lang-en">Reset Progress</span><span className="lang-vi">Đặt lại tiến độ</span></>
            }
          </Button>
          {confirming && (
            <button
              onClick={() => setConfirming(false)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <span className="lang-en">Cancel</span>
              <span className="lang-vi">Huỷ</span>
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
