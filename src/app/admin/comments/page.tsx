'use client'

import { useEffect, useState, useCallback } from 'react'

interface AdminComment {
  id: string
  dayId: number
  parentId: string | null
  body: string
  status: string
  createdAt: string
  userId: string
  userName: string | null
  userEmail: string | null
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([])
  const [filter, setFilter] = useState<'all' | 'approved' | 'hidden'>('all')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const qs = filter !== 'all' ? `?status=${filter}` : ''
    const res = await fetch(`/api/v1/admin/comments${qs}`)
    if (res.ok) {
      const json = await res.json()
      setComments(json.data)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function toggleStatus(comment: AdminComment) {
    const newStatus = comment.status === 'approved' ? 'hidden' : 'approved'
    setToggling(comment.id)
    const res = await fetch(`/api/v1/comments/${comment.id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: newStatus } : c))
      )
    }
    setToggling(null)
  }

  const filtered = filter === 'all' ? comments : comments.filter((c) => c.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Comments</h1>
        <div className="flex gap-2">
          {(['all', 'approved', 'hidden'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No comments.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Day</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">User</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Body</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {filtered.map((c) => (
                <tr key={c.id} className={c.status === 'hidden' ? 'opacity-50' : ''}>
                  <td className="px-4 py-3 font-mono text-xs">{c.dayId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.userName ?? '—'}</p>
                    <p className="text-xs text-gray-400">{c.userEmail ?? ''}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="line-clamp-2 text-gray-700 dark:text-gray-300">{c.body}</p>
                    {c.parentId && (
                      <span className="text-xs text-gray-400">↳ reply</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === 'approved'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(c)}
                      disabled={toggling === c.id}
                      className="rounded px-2 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {toggling === c.id ? '…' : c.status === 'approved' ? 'Hide' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
