'use client'

import { useEffect } from 'react'
import { useProgressStore } from '@/lib/store'

export function StoreHydration() {
  useEffect(() => {
    useProgressStore.persist.rehydrate()
    // localStorage reads are synchronous, so state is fully loaded here.
    useProgressStore.getState().setHydrated()
  }, [])
  return null
}
