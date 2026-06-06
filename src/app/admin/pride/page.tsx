'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { CheckCircle2, Clock, Star, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrideRow {
  id: string
  productName: string
  productNameVi: string
  price: string
  pointsSpent: number
  type: string
  phaseId: number | null
  delivered: boolean
  deliveredAt: string | null
  createdAt: string
  userName: string | null
  userEmail: string | null
  userImage: string | null
}

type Filter = 'all' | 'pending' | 'delivered'

export default function AdminPridePage() {
  const [rows, setRows] = useState<PrideRow[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/v1/admin/pride')
    if (res.ok) {
      const json = await res.json()
      setRows(json.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleDelivered(row: PrideRow) {
    setToggling(row.id)
    const res = await fetch(`/api/v1/admin/pride/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivered: !row.delivered }),
    })
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, delivered: !row.delivered, deliveredAt: !row.delivered ? new Date().toISOString() : null }
            : r
        )
      )
    }
    setToggling(null)
  }

  const filtered =
    filter === 'all'
      ? rows
      : filter === 'pending'
      ? rows.filter((r) => !r.delivered)
      : rows.filter((r) => r.delivered)

  const pendingCount = rows.filter((r) => !r.delivered).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pride Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track reward redemptions and mark deliveries
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
              {pendingCount} pending
            </span>
          )}
          <span className="text-sm text-gray-500">{rows.length} total</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'delivered'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
              filter === f
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-12 text-center">
          <Package className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500">
            {filter === 'pending' ? 'No pending deliveries.' : filter === 'delivered' ? 'No delivered items yet.' : 'No redemptions yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">User</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Points</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Requested</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors',
                    row.delivered && 'opacity-60'
                  )}
                >
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        {row.userImage && (
                          <Image
                            src={row.userImage}
                            alt={row.userName ?? ''}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium leading-tight">{row.userName ?? '—'}</p>
                        <p className="text-xs text-gray-400">{row.userEmail ?? ''}</p>
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.productName}</p>
                    <p className="text-xs text-gray-400">{row.productNameVi} · {row.price}</p>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    {row.type === 'phase' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/30 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400">
                        Phase {row.phaseId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                        <Star className="h-3 w-3" />
                        Shop
                      </span>
                    )}
                  </td>

                  {/* Points */}
                  <td className="px-4 py-3 tabular-nums text-gray-600 dark:text-gray-300">
                    {row.pointsSpent > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {row.pointsSpent}
                      </span>
                    ) : (
                      <span className="text-gray-400">Free</span>
                    )}
                  </td>

                  {/* Requested date */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                    {new Date(row.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                    <br />
                    {new Date(row.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {row.delivered ? (
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Delivered
                        </span>
                        {row.deliveredAt && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {new Date(row.deliveredAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleDelivered(row)}
                      disabled={toggling === row.id}
                      className={cn(
                        'rounded px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                        row.delivered
                          ? 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
                      )}
                    >
                      {toggling === row.id ? '…' : row.delivered ? 'Unmark' : 'Mark delivered'}
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
