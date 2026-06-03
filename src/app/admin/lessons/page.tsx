'use client'

import { useEffect, useState, useCallback } from 'react'

interface AdminLesson {
  dayId: number
  title: string
  phaseId: number
  available: boolean
  hasOverride: boolean
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<AdminLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/v1/admin/lessons')
    if (res.ok) {
      const json = await res.json()
      setLessons(json.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggle(lesson: AdminLesson) {
    setToggling(lesson.dayId)
    const res = await fetch(`/api/v1/admin/lessons/${lesson.dayId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !lesson.available }),
    })
    if (res.ok) {
      setLessons((prev) =>
        prev.map((l) =>
          l.dayId === lesson.dayId
            ? { ...l, available: !lesson.available, hasOverride: true }
            : l,
        ),
      )
    }
    setToggling(null)
  }

  // Group by phase
  const byPhase = lessons.reduce<Record<number, AdminLesson[]>>((acc, l) => {
    if (!acc[l.phaseId]) acc[l.phaseId] = []
    acc[l.phaseId].push(l)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <span className="text-sm text-gray-500">
          {lessons.filter((l) => l.available).length} / {lessons.length} published
        </span>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(byPhase).map(([phaseId, days]) => (
            <div key={phaseId} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Phase {phaseId}
                </p>
              </div>
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {days.map((l) => (
                    <tr key={l.dayId} className={!l.available ? 'opacity-50' : ''}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 w-12">
                        {l.dayId}
                      </td>
                      <td className="px-4 py-3 flex-1">
                        <span className="font-medium">{l.title}</span>
                        {l.hasOverride && (
                          <span className="ml-2 text-xs text-indigo-500 dark:text-indigo-400">
                            (overridden)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 w-28 text-right">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            l.available
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {l.available ? 'Published' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3 w-24 text-right">
                        <button
                          onClick={() => toggle(l)}
                          disabled={toggling === l.dayId}
                          className="rounded px-2 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                          {toggling === l.dayId
                            ? '…'
                            : l.available
                            ? 'Hide'
                            : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
