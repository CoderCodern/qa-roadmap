'use client'

import Link from 'next/link'
import { Bookmark, ChevronRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useProgressStore } from '@/lib/store'
import { getDayById, getPhaseForDay } from '@/data/roadmap'
import { Badge } from '@/components/ui/Badge'
import { SignInButton } from '@/components/auth/SignInButton'

export function SavedView() {
  const { data: session, status } = useSession()
  const { bookmarks, hydrated } = useProgressStore()

  if (status === 'loading' || !hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 text-center">
        <Bookmark className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          <span className="lang-en">Saved Lessons</span>
          <span className="lang-vi">Bài học đã lưu</span>
        </h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          <span className="lang-en">Sign in to save lessons and access them across devices.</span>
          <span className="lang-vi">Đăng nhập để lưu bài học và truy cập trên mọi thiết bị.</span>
        </p>
        <SignInButton />
      </div>
    )
  }

  const savedDays = bookmarks
    .map((id) => ({ day: getDayById(id), phase: getPhaseForDay(id) }))
    .filter((entry): entry is { day: NonNullable<typeof entry.day>; phase: NonNullable<typeof entry.phase> } =>
      entry.day !== undefined && entry.phase !== undefined
    )
    .sort((a, b) => a.day.id - b.day.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          <span className="lang-en">Saved Lessons</span>
          <span className="lang-vi">Bài học đã lưu</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="lang-en">{savedDays.length} lesson{savedDays.length !== 1 ? 's' : ''} saved</span>
          <span className="lang-vi">{savedDays.length} bài đã lưu</span>
        </p>
      </div>

      {savedDays.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Bookmark className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            <span className="lang-en">No saved lessons yet. Bookmark lessons to find them here.</span>
            <span className="lang-vi">Chưa có bài học nào được lưu. Đánh dấu bài học để tìm lại ở đây.</span>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedDays.map(({ day, phase }) => (
            <Link
              key={day.id}
              href={`/day/${day.id}`}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-700 dark:hover:bg-brand-950/20"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {day.id}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <Badge variant={phase.color as 'blue' | 'yellow' | 'green' | 'orange' | 'purple'} >
                    <span className="lang-en">{phase.title}</span>
                    <span className="lang-vi">{phase.titleVi}</span>
                  </Badge>
                </div>
                <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                  <span className="lang-en">{day.title}</span>
                  <span className="lang-vi">{day.titleVi}</span>
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  <span className="lang-en">{day.blurb}</span>
                  <span className="lang-vi">{day.blurbVi}</span>
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
