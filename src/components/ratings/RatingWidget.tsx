'use client'

import { useEffect, useState, useCallback } from 'react'
import { Star } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface RatingSummary {
  dayId: number
  average: number
  count: number
  distribution: Record<string, number>
  myRating: { stars: number; review: string | null } | null
}

interface RatingWidgetProps {
  dayId: number
}

export function RatingWidget({ dayId }: RatingWidgetProps) {
  const { data: session } = useSession()
  const [summary, setSummary] = useState<RatingSummary | null>(null)
  const [hovered, setHovered] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [review, setReview] = useState('')

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/lessons/${dayId}/rating`)
      if (res.ok) setSummary(await res.json())
    } catch {
      // non-critical
    }
  }, [dayId])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  // Pre-fill review textarea when user already has a rating
  useEffect(() => {
    if (summary?.myRating?.review) setReview(summary.myRating.review)
  }, [summary?.myRating?.review])

  const handleStar = async (stars: number) => {
    if (!session?.user || submitting) return
    setSubmitting(true)

    // Optimistic update
    setSummary((prev) =>
      prev
        ? {
            ...prev,
            myRating: { stars, review: prev.myRating?.review ?? null },
          }
        : prev,
    )

    try {
      const res = await fetch(`/api/v1/lessons/${dayId}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, review: review || undefined }),
      })
      if (res.ok) {
        setSummary(await res.json())
        if (stars > 0) setShowReview(true)
      }
    } catch {
      // revert on error
      fetchSummary()
    } finally {
      setSubmitting(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (!session?.user || submitting || !summary?.myRating) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/v1/lessons/${dayId}/rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars: summary.myRating.stars, review: review || undefined }),
      })
      if (res.ok) {
        setSummary(await res.json())
        setShowReview(false)
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  const displayStars = hovered || summary?.myRating?.stars || 0

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <span className="lang-en">Rate this lesson</span>
        <span className="lang-vi">Đánh giá bài học</span>
      </p>

      {/* Star selector (authenticated) or display (guest) */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!session?.user || submitting}
            onMouseEnter={() => session?.user && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleStar(star)}
            className={cn(
              'transition-transform',
              session?.user ? 'cursor-pointer hover:scale-110' : 'cursor-default',
            )}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'h-5 w-5',
                star <= displayStars
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-gray-300 dark:text-gray-600',
              )}
            />
          </button>
        ))}
      </div>

      {/* Summary row */}
      {summary && summary.count > 0 && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {summary.average} · {summary.count} rating{summary.count !== 1 ? 's' : ''}
        </p>
      )}

      {/* Sign-in prompt */}
      {!session?.user && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          <span className="lang-en">Sign in to rate</span>
          <span className="lang-vi">Đăng nhập để đánh giá</span>
        </p>
      )}

      {/* Inline review textarea (shown after rating) */}
      {session?.user && showReview && (
        <div className="mt-2">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value.slice(0, 280))}
            placeholder="Leave a short review… (optional)"
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-400">{review.length}/280</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReview(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="lang-en">Skip</span>
                <span className="lang-vi">Bỏ qua</span>
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submitting}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 dark:text-brand-400"
              >
                <span className="lang-en">Save</span>
                <span className="lang-vi">Lưu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
