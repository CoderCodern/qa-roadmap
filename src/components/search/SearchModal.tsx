'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import { Search, X } from 'lucide-react'
import { PHASES } from '@/data/roadmap'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

// ─── Search index built from roadmap data ───────────────────────────────────

interface SearchItem {
  dayId: number
  title: string
  titleVi: string
  blurb: string
  blurbVi: string
  tags: string[]
  phaseTitle: string
  phaseTitleVi: string
  phaseColor: string
}

const searchItems: SearchItem[] = PHASES.flatMap((phase) =>
  phase.days
    .filter((d) => d.available !== false)
    .map((d) => ({
      dayId: d.id,
      title: d.title,
      titleVi: d.titleVi,
      blurb: d.blurb,
      blurbVi: d.blurbVi,
      tags: d.tags,
      phaseTitle: phase.title,
      phaseTitleVi: phase.titleVi,
      phaseColor: phase.color,
    }))
)

const fuse = new Fuse(searchItems, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'titleVi', weight: 3 },
    { name: 'blurb', weight: 2 },
    { name: 'blurbVi', weight: 2 },
    { name: 'tags', weight: 1 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
})

// ─── Component ───────────────────────────────────────────────────────────────

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(
    () => (query.trim().length >= 2 ? fuse.search(query.trim()).slice(0, 8).map((r) => r.item) : []),
    [query],
  )

  const navigate = useCallback(
    (dayId: number) => {
      router.push(`/day/${dayId}`)
      onClose()
      setQuery('')
    },
    [router, onClose],
  )

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && results[activeIndex]) {
        navigate(results[activeIndex].dayId)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, activeIndex, onClose, navigate])

  // Reset active index when results change
  useEffect(() => { setActiveIndex(0) }, [query])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed left-1/2 top-[10vh] z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-700">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons…"
            className="flex-1 py-4 text-sm bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
            esc
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((item, i) => (
              <li key={item.dayId}>
                <button
                  onClick={() => navigate(item.dayId)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                    i === activeIndex
                      ? 'bg-brand-50 dark:bg-brand-950/40'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {item.dayId}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate lang-en">
                        {item.title}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate lang-vi">
                        {item.titleVi}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.phaseColor as 'blue' | 'yellow' | 'green' | 'orange' | 'purple'}>
                        <span className="lang-en">{item.phaseTitle}</span>
                        <span className="lang-vi">{item.phaseTitleVi}</span>
                      </Badge>
                      {item.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-gray-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state */}
        {query.trim().length >= 2 && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            <span className="lang-en">No lessons found for &ldquo;{query}&rdquo;</span>
            <span className="lang-vi">Không tìm thấy bài học cho &ldquo;{query}&rdquo;</span>
          </div>
        )}

        {/* Hint */}
        {query.trim().length < 2 && (
          <div className="px-4 py-4 text-center text-xs text-gray-400">
            <span className="lang-en">Type at least 2 characters to search</span>
            <span className="lang-vi">Nhập ít nhất 2 ký tự để tìm kiếm</span>
          </div>
        )}
      </div>
    </>
  )
}
