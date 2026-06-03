import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { users, comments, ratings } from '@/db/schema'
import { count, avg } from 'drizzle-orm'

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  const [[userRow], [commentRow], [ratingRow]] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(comments),
    db.select({ count: count(), avg: avg(ratings.stars) }).from(ratings),
  ])

  const cards = [
    { label: 'Total Users', value: userRow.count },
    { label: 'Total Comments', value: commentRow.count },
    { label: 'Total Ratings', value: ratingRow.count },
    { label: 'Avg Stars', value: ratingRow.avg ? Number(ratingRow.avg).toFixed(2) : '—' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
