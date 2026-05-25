'use client'

import { useEffect } from 'react'
import { useProgressStore } from '@/lib/store'

const DEV_PREVIEW_KEY = 'qa-roadmap-dev-preview'

export function StoreHydration() {
  useEffect(() => {
    useProgressStore.persist.rehydrate()
    useProgressStore.getState().setHydrated()

    // Developer preview mode: ?preview=1 enables it (persists in localStorage),
    // ?preview=0 disables it. Falls back to the stored flag on every reload.
    const params = new URLSearchParams(window.location.search)
    const param = params.get('preview')
    if (param === '1') {
      localStorage.setItem(DEV_PREVIEW_KEY, '1')
      useProgressStore.getState().setDevPreview(true)
    } else if (param === '0') {
      localStorage.removeItem(DEV_PREVIEW_KEY)
      useProgressStore.getState().setDevPreview(false)
    } else if (localStorage.getItem(DEV_PREVIEW_KEY) === '1') {
      useProgressStore.getState().setDevPreview(true)
    }
  }, [])
  return null
}
