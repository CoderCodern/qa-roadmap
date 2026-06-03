import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { users, comments, ratings } from '@/db/schema'
import { count, avg } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const [[userRow], [commentRow], [ratingRow]] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(comments),
    db.select({ count: count(), avg: avg(ratings.stars) }).from(ratings),
  ])

  return NextResponse.json({
    success: true,
    data: {
      users: userRow.count,
      comments: commentRow.count,
      ratings: ratingRow.count,
      avgStars: ratingRow.avg ? Number(ratingRow.avg).toFixed(2) : null,
    },
  })
}
