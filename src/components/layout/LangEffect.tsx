'use client'

import { useLayoutEffect } from 'react'
import { useProgressStore } from '@/lib/store'

export function LangEffect() {
  const language = useProgressStore((s) => s.language)

  // useLayoutEffect fires synchronously before paint, so toggling the language
  // never shows a frame with the wrong language visible.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-lang', language)
  }, [language])

  return null
}
