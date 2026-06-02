'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useProgressStore } from '@/lib/store'
import type { CloudProgressData } from '@/lib/store'

/**
 * Fetches server-side progress when the user is signed in and hydrates the
 * Zustand store with the authoritative cloud data.
 *
 * If the server has no data but localStorage does, sets `pendingSync: true`
 * to show the one-time import banner.
 *
 * Renders nothing — purely a side-effect component.
 */
export function CloudSync() {
  const { data: session, status } = useSession()
  const { hydrated, setCloudProgress, markPendingSync, setBookmarks } = useProgressStore()

  useEffect(() => {
    // Wait until localStorage is hydrated and session is resolved
    if (!hydrated || status === 'loading') return
    if (!session?.user?.id) return

    let cancelled = false

    async function fetchCloud() {
      try {
        const [progressRes, bookmarksRes] = await Promise.all([
          fetch('/api/v1/me/progress'),
          fetch('/api/v1/me/bookmarks'),
        ])

        if (cancelled) return

        if (progressRes.ok) {
          const data: CloudProgressData & { completed: number[] } = await progressRes.json()
          if (!cancelled) {
            if (data.completed.length > 0) {
              setCloudProgress(data)
            } else {
              const localCompleted = useProgressStore.getState().completed
              if (localCompleted.length > 0) {
                markPendingSync(true)
              }
            }
          }
        }

        if (bookmarksRes.ok && !cancelled) {
          const { bookmarks } = await bookmarksRes.json() as { bookmarks: { dayId: number }[] }
          setBookmarks(bookmarks.map((b) => b.dayId))
        }
      } catch {
        // Network error — continue with local data silently
      }
    }

    fetchCloud()
    return () => {
      cancelled = true
    }
  }, [hydrated, status, session?.user?.id, setCloudProgress, markPendingSync, setBookmarks])

  return null
}
