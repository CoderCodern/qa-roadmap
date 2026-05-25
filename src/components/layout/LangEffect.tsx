'use client'

import { useEffect } from 'react'
import { useProgressStore } from '@/lib/store'

export function LangEffect() {
  const language = useProgressStore((s) => s.language)

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', language)
  }, [language])

  return null
}
