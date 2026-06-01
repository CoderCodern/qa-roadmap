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
  const { hydrated, setCloudProgress, markPendingSync } = useProgressStore()

  useEffect(() => {
    // Wait until localStorage is hydrated and session is resolved
    if (!hydrated || status === 'loading') return
    if (!session?.user?.id) return

    let cancelled = false

    async function fetchCloud() {
      try {
        const res = await fetch('/api/v1/me/progress')
        if (!res.ok || cancelled) return

        const data: CloudProgressData & { completed: number[] } = await res.json()

        if (cancelled) return

        if (data.completed.length > 0) {
          // Server has data → it is the source of truth
          setCloudProgress(data)
        } else {
          // Server is empty — check if localStorage has progress to offer sync
          const localCompleted = useProgressStore.getState().completed
          if (localCompleted.length > 0) {
            markPendingSync(true)
          }
        }
      } catch {
        // Network error — continue with local data silently
      }
    }

    fetchCloud()
    return () => {
      cancelled = true
    }
  }, [hydrated, status, session?.user?.id, setCloudProgress, markPendingSync])

  return null
}
