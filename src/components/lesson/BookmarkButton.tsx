'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useProgressStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
  dayId: number
}

export function BookmarkButton({ dayId }: BookmarkButtonProps) {
  const { data: session } = useSession()
  const { bookmarks, toggleBookmarkLocal } = useProgressStore()
  const [busy, setBusy] = useState(false)

  const isBookmarked = bookmarks.includes(dayId)

  const handleToggle = async () => {
    if (!session?.user?.id || busy) return

    // Optimistic update
    toggleBookmarkLocal(dayId)
    setBusy(true)

    try {
      if (isBookmarked) {
        await fetch(`/api/v1/me/bookmarks/${dayId}`, { method: 'DELETE' })
      } else {
        await fetch(`/api/v1/me/bookmarks/${dayId}`, { method: 'PUT' })
      }
    } catch {
      // Revert on error
      toggleBookmarkLocal(dayId)
    } finally {
      setBusy(false)
    }
  }

  // Don't render if not signed in
  if (!session?.user?.id) return null

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this lesson'}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border-2 p-3 text-sm font-medium transition-all',
        isBookmarked
          ? 'border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
          : 'border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500',
        busy && 'opacity-60 cursor-not-allowed',
      )}
    >
      <Bookmark className={cn('h-5 w-5', isBookmarked && 'fill-current')} />
      <span>
        {isBookmarked
          ? <><span className="lang-en">Saved</span><span className="lang-vi">Đã lưu</span></>
          : <><span className="lang-en">Save lesson</span><span className="lang-vi">Lưu bài học</span></>
        }
      </span>
    </button>
  )
}
