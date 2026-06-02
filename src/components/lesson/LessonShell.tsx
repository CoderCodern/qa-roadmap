'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, Clock, ArrowLeft, ArrowRight, ChevronLeft, Lock, Construction } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useProgressStore } from '@/lib/store'
import { getDayById, getPhaseForDay, getPrevDay, getNextDay } from '@/data/roadmap'
import { getCompletionMotivation } from '@/data/motivation'
import { getDayLockInfo } from '@/lib/unlock'
import { Badge } from '@/components/ui/Badge'
import { BookmarkButton } from '@/components/lesson/BookmarkButton'
import { RatingWidget } from '@/components/ratings/RatingWidget'
import { CommentsSection } from '@/components/comments/CommentsSection'
import { cn } from '@/lib/utils'

interface LessonShellProps {
  dayId: number
  children: ReactNode
}

export function LessonShell({ dayId, children }: LessonShellProps) {
  const { completed, hydrated, toggleDay, setServerStats, language, devPreview } = useProgressStore()
  const { data: session } = useSession()
  const [justCompleted, setJustCompleted] = useState(false)

  const day = getDayById(dayId)
  const phase = getPhaseForDay(dayId)
  const prevDay = getPrevDay(dayId)
  const nextDay = getNextDay(dayId)
  const isCompleted = completed.includes(dayId)

  const handleToggle = async () => {
    // Optimistic local update first — instant UI feedback
    toggleDay(dayId)
    if (!isCompleted) setJustCompleted(true)
    else setJustCompleted(false)

    // If signed in, also persist to the server
    if (!session?.user?.id) return

    const willBeCompleted = !isCompleted
    try {
      if (willBeCompleted) {
        const res = await fetch(`/api/v1/me/progress/lessons/${dayId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        })
        if (res.ok) {
          const data = await res.json()
          setServerStats({
            streak: data.currentStreak,
            longestStreak: data.longestStreak,
            pointsBalance: data.pointsBalance,
          })
        }
      } else {
        const res = await fetch(`/api/v1/me/progress/lessons/${dayId}`, { method: 'DELETE' })
        if (res.ok) {
          const data = await res.json()
          setServerStats({
            streak: data.currentStreak,
            longestStreak: data.longestStreak,
            pointsBalance: data.pointsBalance,
          })
        }
      }
    } catch {
      // Fire-and-forget — local state already updated; server will reconcile on next load
    }
  }

  if (!day || !phase) return <>{children}</>

  // Lock check — only enforce after store is hydrated to avoid pre-hydration flash.
  const lockInfo = hydrated ? getDayLockInfo(dayId, completed, devPreview) : { locked: false as const }

  if (lockInfo.locked) {
    const isComingSoon = lockInfo.type === 'coming-soon'

    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/roadmap" className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span className="lang-en">Back to Roadmap</span>
            <span className="lang-vi">Về lộ trình</span>
          </Link>
          <span>·</span>
          <Badge variant={phase.color as 'blue' | 'yellow' | 'green' | 'orange' | 'purple'}>
            <span className="lang-en">{phase.title}</span>
            <span className="lang-vi">{phase.titleVi}</span>
          </Badge>
        </nav>

        {/* Lock screen */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className={cn(
            'mb-6 flex h-24 w-24 items-center justify-center rounded-full',
            isComingSoon ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'
          )}>
            {isComingSoon
              ? <Construction className="h-12 w-12 text-amber-500 dark:text-amber-400" />
              : <Lock className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            }
          </div>

          <p className="mb-2 text-sm font-semibold text-brand-600 dark:text-brand-400">
            Day {dayId}
          </p>
          <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            <span className="lang-en">{day.title}</span>
            <span className="lang-vi">{day.titleVi}</span>
          </h1>

          {isComingSoon ? (
            <>
              <p className="mb-2 text-lg font-semibold text-amber-600 dark:text-amber-400">
                <span className="lang-en">Coming Soon</span>
                <span className="lang-vi">Sắp Ra Mắt</span>
              </p>
              <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
                <span className="lang-en">This lesson is being prepared. Check back soon!</span>
                <span className="lang-vi">Bài học này đang được chuẩn bị. Hãy quay lại sau nhé!</span>
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                <span className="lang-en">This lesson is locked</span>
                <span className="lang-vi">Bài học này đang bị khóa</span>
              </p>
              {lockInfo.type === 'prev-day' ? (
                <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
                  <span className="lang-en">
                    You need to complete <strong>Day {lockInfo.prevDayId}</strong> before unlocking this lesson.
                  </span>
                  <span className="lang-vi">
                    Bạn cần hoàn thành <strong>Ngày {lockInfo.prevDayId}</strong> trước khi mở khóa bài học này.
                  </span>
                </p>
              ) : (
                <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
                  <span className="lang-en">
                    Complete {lockInfo.needed - lockInfo.done} more lesson{lockInfo.needed - lockInfo.done !== 1 ? 's' : ''} in{' '}
                    <strong>{lockInfo.phaseTitle}</strong> to unlock this phase.{' '}
                    ({lockInfo.done}/{lockInfo.needed} done)
                  </span>
                  <span className="lang-vi">
                    Hoàn thành thêm {lockInfo.needed - lockInfo.done} bài trong{' '}
                    <strong>{lockInfo.phaseTitleVi}</strong> để mở khóa giai đoạn này.{' '}
                    ({lockInfo.done}/{lockInfo.needed} đã làm)
                  </span>
                </p>
              )}
            </>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {!isComingSoon && lockInfo.type === 'prev-day' && (
              <Link
                href={`/day/${lockInfo.prevDayId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="lang-en">Go to Day {lockInfo.prevDayId}</span>
                <span className="lang-vi">Đến Ngày {lockInfo.prevDayId}</span>
              </Link>
            )}
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <span className="lang-en">View Roadmap</span>
              <span className="lang-vi">Xem lộ trình</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/roadmap" className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <span className="lang-en">Back to Roadmap</span>
          <span className="lang-vi">Về lộ trình</span>
        </Link>
        <span>·</span>
        <Badge variant={phase.color as 'blue' | 'yellow' | 'green' | 'orange' | 'purple'}>
          <span className="lang-en">{phase.title}</span>
          <span className="lang-vi">{phase.titleVi}</span>
        </Badge>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <p className="mb-1 text-sm font-semibold text-brand-600 dark:text-brand-400">
              Day {dayId}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
              <span className="lang-en">{day.title}</span>
              <span className="lang-vi">{day.titleVi}</span>
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {day.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Completion message */}
          {justCompleted && isCompleted && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              {getCompletionMotivation(language)}
            </div>
          )}

          {children}
        </div>

        {/* Sticky right rail */}
        <aside className="w-full lg:w-64 lg:shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Mark complete */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <button
                onClick={handleToggle}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-sm font-medium transition-all',
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-dashed border-gray-300 text-gray-600 hover:border-brand-400 hover:text-brand-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-brand-500'
                )}
              >
                {isCompleted
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  : <Circle className="h-5 w-5" />}
                <span>
                  {isCompleted
                    ? <><span className="lang-en">Completed!</span><span className="lang-vi">Đã hoàn thành!</span></>
                    : <><span className="lang-en">Mark as Complete</span><span className="lang-vi">Đánh dấu hoàn thành</span></>
                  }
                </span>
              </button>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  <span className="lang-en">~{day.estMinutes} min</span>
                  <span className="lang-vi">~{day.estMinutes} phút</span>
                </span>
              </div>
            </div>

            {/* Bookmark */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <BookmarkButton dayId={dayId} />
            </div>

            {/* Rating */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <RatingWidget dayId={dayId} />
            </div>

            {/* Navigation */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <span className="lang-en">Navigation</span>
                <span className="lang-vi">Điều hướng</span>
              </p>
              <div className="flex flex-col gap-2">
                {prevDay && (
                  <Link
                    href={`/day/${prevDay.id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      <span className="lang-en">Day {prevDay.id}: {prevDay.title}</span>
                      <span className="lang-vi">Ngày {prevDay.id}: {prevDay.titleVi}</span>
                    </span>
                  </Link>
                )}
                {nextDay && (
                  <Link
                    href={`/day/${nextDay.id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      <span className="lang-en">Day {nextDay.id}: {nextDay.title}</span>
                      <span className="lang-vi">Ngày {nextDay.id}: {nextDay.titleVi}</span>
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Comments */}
      <CommentsSection dayId={dayId} />

      {/* Bottom navigation */}
      <div className="mt-12 flex justify-between border-t border-gray-200 pt-8 dark:border-gray-800">
        {prevDay ? (
          <Link
            href={`/day/${prevDay.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="lang-en">Day {prevDay.id}</span>
            <span className="lang-vi">Ngày {prevDay.id}</span>
          </Link>
        ) : <span />}
        {nextDay && (
          <Link
            href={`/day/${nextDay.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            <span className="lang-en">Day {nextDay.id}</span>
            <span className="lang-vi">Ngày {nextDay.id}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
