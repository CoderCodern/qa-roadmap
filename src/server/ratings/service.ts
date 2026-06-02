import { eq, and, sql } from 'drizzle-orm'
import { db } from '@/db'
import { ratings, lessonStats } from '@/db/schema'

export interface RatingSummary {
  dayId: number
  average: number
  count: number
  distribution: Record<string, number> // '1'–'5' → count
  myRating: { stars: number; review: string | null } | null
}

/** Get rating summary for a lesson. myUserId is optional (public endpoint). */
export async function getRatingSummary(
  dayId: number,
  myUserId?: string,
): Promise<RatingSummary> {
  // Aggregate from ratings table directly (lesson_stats is the write-path cache)
  const rows = await db
    .select({ stars: ratings.stars, count: sql<number>`count(*)` })
    .from(ratings)
    .where(eq(ratings.dayId, dayId))
    .groupBy(ratings.stars)

  const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
  let total = 0
  let weightedSum = 0
  for (const row of rows) {
    const c = Number(row.count)
    distribution[String(row.stars)] = c
    total += c
    weightedSum += row.stars * c
  }
  const average = total > 0 ? Math.round((weightedSum / total) * 10) / 10 : 0

  let myRating: RatingSummary['myRating'] = null
  if (myUserId) {
    const [mine] = await db
      .select({ stars: ratings.stars, review: ratings.review })
      .from(ratings)
      .where(and(eq(ratings.dayId, dayId), eq(ratings.userId, myUserId)))
      .limit(1)
    if (mine) myRating = { stars: mine.stars, review: mine.review }
  }

  return { dayId, average, count: total, distribution, myRating }
}

/** Upsert a rating (one per user per lesson). Returns the new summary. */
export async function upsertRating(
  userId: string,
  dayId: number,
  stars: number,
  review?: string,
): Promise<RatingSummary> {
  await db
    .insert(ratings)
    .values({
      userId,
      dayId,
      stars,
      review: review?.trim().slice(0, 500) ?? null,
    })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.dayId],
      set: {
        stars,
        review: review?.trim().slice(0, 500) ?? null,
        updatedAt: new Date(),
      },
    })

  // Recompute and cache aggregate in lesson_stats
  const [agg] = await db
    .select({
      avg: sql<number>`AVG(${ratings.stars})::float`,
      cnt: sql<number>`COUNT(*)`,
    })
    .from(ratings)
    .where(eq(ratings.dayId, dayId))

  const newAvg = agg?.avg ? Math.round(Number(agg.avg) * 10) / 10 : stars
  const newCount = Number(agg?.cnt ?? 1)

  await db
    .insert(lessonStats)
    .values({ dayId, avgStars: newAvg, ratingsCount: newCount, commentsCount: 0 })
    .onConflictDoUpdate({
      target: lessonStats.dayId,
      set: { avgStars: newAvg, ratingsCount: newCount, updatedAt: new Date() },
    })

  return getRatingSummary(dayId, userId)
}
