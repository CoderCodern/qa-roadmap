'use client'

import { useState } from 'react'
import { CloudUpload, X } from 'lucide-react'
import { useProgressStore } from '@/lib/store'

/**
 * One-time banner shown when the user signs in for the first time
 * and has existing progress in localStorage but none on the server.
 *
 * Offers to import localStorage progress into the cloud.
 */
export function ProgressSyncBanner() {
  const { pendingSync, markPendingSync, completed, completedDates, totalPoints, setCloudProgress } =
    useProgressStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!pendingSync) return null

  async function handleImport() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/me/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed, completedDates, totalPoints }),
      })
      if (!res.ok) throw new Error('Import failed')
      const data = await res.json()
      setCloudProgress(data)
    } catch {
      setError('Import failed — please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="border-b border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-800 dark:bg-brand-950/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CloudUpload className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
          <p className="text-sm text-brand-800 dark:text-brand-200">
            <span className="lang-en">
              You have local progress ({completed.length} day{completed.length !== 1 ? 's' : ''}).{' '}
              <strong>Sync it to your account</strong> to keep it safe across devices.
            </span>
            <span className="lang-vi">
              Bạn có tiến độ cục bộ ({completed.length} ngày). <strong>Đồng bộ lên tài khoản</strong> để lưu giữ trên mọi thiết bị.
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {error && (
            <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
          )}
          <button
            onClick={handleImport}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? (
              <span className="lang-en">Importing…</span>
            ) : (
              <>
                <span className="lang-en">Import Progress</span>
                <span className="lang-vi">Nhập tiến độ</span>
              </>
            )}
          </button>
          <button
            onClick={() => markPendingSync(false)}
            className="rounded-lg p-1 text-brand-600 hover:bg-brand-100 dark:text-brand-400 dark:hover:bg-brand-900/40"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
