import { eq, and, asc, sql } from 'drizzle-orm'
import { db } from '@/db'
import { lessonProgress, pointsLedger, userStats } from '@/db/schema'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgressSummary {
  completed: number[]
  completedDates: Record<number, string>
  currentStreak: number
  longestStreak: number
  pointsBalance: number
}

export interface CompleteLessonResult {
  dayId: number
  status: 'completed' | 'already_completed'
  awardedPoints: number
  currentStreak: number
  longestStreak: number
  pointsBalance: number
}

export interface LocalProgressBlob {
  completed: number[]
  completedDates: Record<number, string>
  totalPoints?: number
}

// ─── Streak computation ───────────────────────────────────────────────────────

/**
 * Compute current and longest streaks from a sorted list of unique date strings (YYYY-MM-DD).
 * "Current" streak counts consecutive days ending today or yesterday.
 */
export function computeStreak(sortedUniqueDates: string[]): {
  current: number
  longest: number
} {
  if (sortedUniqueDates.length === 0) return { current: 0, longest: 0 }

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const last = sortedUniqueDates[sortedUniqueDates.length - 1]

  // Current streak — count consecutive days backwards from today/yesterday
  let current = 0
  if (last === today || last === yesterday) {
    let expected = last
    for (let i = sortedUniqueDates.length - 1; i >= 0; i--) {
      if (sortedUniqueDates[i] === expected) {
        current++
        const d = new Date(expected)
        d.setUTCDate(d.getUTCDate() - 1)
        expected = d.toISOString().slice(0, 10)
      } else {
        break
      }
    }
  }

  // Longest streak — maximum consecutive-day run
  let longest = 0
  let run = 1
  for (let i = 1; i < sortedUniqueDates.length; i++) {
    const prev = new Date(sortedUniqueDates[i - 1])
    const curr = new Date(sortedUniqueDates[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000)
    if (diffDays === 1) {
      run++
    } else {
      longest = Math.max(longest, run)
      run = 1
    }
  }
  longest = Math.max(longest, run, current)

  return { current, longest }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateStats(userId: string) {
  const existing = await db.query.userStats.findFirst({
    where: eq(userStats.userId, userId),
  })
  if (existing) return existing

  await db.insert(userStats).values({
    userId,
    currentStreak: 0,
    longestStreak: 0,
    pointsBalance: 0,
    updatedAt: new Date(),
  })
  return { userId, currentStreak: 0, longestStreak: 0, pointsBalance: 0, updatedAt: new Date() }
}

async function rebuildStats(userId: string): Promise<{
  currentStreak: number
  longestStreak: number
  pointsBalance: number
}> {
  // Recompute streak from raw completion dates
  const rows = await db
    .select({ completedAt: lessonProgress.completedAt })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId))
    .orderBy(asc(lessonProgress.completedAt))

  const uniqueDates = Array.from(
    new Set(rows.map((r) => r.completedAt.toISOString().slice(0, 10))),
  ).sort()

  const { current, longest } = computeStreak(uniqueDates)

  // Recompute points balance from ledger
  const result = await db
    .select({ total: sql<number>`COALESCE(SUM(${pointsLedger.delta}), 0)` })
    .from(pointsLedger)
    .where(eq(pointsLedger.userId, userId))

  const pointsBalance = Number(result[0]?.total ?? 0)

  // Update the cache
  await db
    .insert(userStats)
    .values({ userId, currentStreak: current, longestStreak: longest, pointsBalance, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userStats.userId,
      set: { currentStreak: current, longestStreak: longest, pointsBalance, updatedAt: new Date() },
    })

  return { currentStreak: current, longestStreak: longest, pointsBalance }
}

// ─── Public service API ───────────────────────────────────────────────────────

export async function getProgress(userId: string): Promise<ProgressSummary> {
  const [rows, stats] = await Promise.all([
    db
      .select({ dayId: lessonProgress.dayId, completedAt: lessonProgress.completedAt })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId))
      .orderBy(asc(lessonProgress.completedAt)),
    getOrCreateStats(userId),
  ])

  const completed = rows.map((r) => r.dayId)
  const completedDates: Record<number, string> = {}
  for (const r of rows) {
    completedDates[r.dayId] = r.completedAt.toISOString().slice(0, 10)
  }

  return {
    completed,
    completedDates,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    pointsBalance: stats.pointsBalance,
  }
}

/** Idempotent — safe to call multiple times for the same lesson. */
export async function completeLesson(
  userId: string,
  dayId: number,
): Promise<CompleteLessonResult> {
  // Check if already completed
  const existing = await db.query.lessonProgress.findFirst({
    where: and(eq(lessonProgress.userId, userId), eq(lessonProgress.dayId, dayId)),
  })

  if (existing) {
    const stats = await getOrCreateStats(userId)
    return {
      dayId,
      status: 'already_completed',
      awardedPoints: 0,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      pointsBalance: stats.pointsBalance,
    }
  }

  const completedAt = new Date()
  const dateKey = completedAt.toISOString().slice(0, 10)

  // Insert completion
  await db.insert(lessonProgress).values({ userId, dayId, completedAt })

  // Award streak points (5 pts, once per calendar day)
  const streakKey = `streak:${userId}:${dateKey}`
  let awardedPoints = 0
  try {
    await db.insert(pointsLedger).values({
      userId,
      delta: 5,
      reason: `Streak bonus – ${dateKey}`,
      idempotencyKey: streakKey,
      createdAt: completedAt,
    })
    awardedPoints = 5
  } catch {
    // Unique constraint violation = already awarded today — safe to ignore
  }

  // Rebuild and cache stats
  const stats = await rebuildStats(userId)

  return {
    dayId,
    status: 'completed',
    awardedPoints,
    ...stats,
  }
}

export async function uncompleteLesson(
  userId: string,
  dayId: number,
): Promise<{ currentStreak: number; longestStreak: number; pointsBalance: number }> {
  await db
    .delete(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.dayId, dayId)))

  return rebuildStats(userId)
}

/**
 * One-time import from the client localStorage blob.
 * No-op if the user already has server-side progress.
 * Returns the resulting server progress summary.
 */
export async function syncFromLocalStorage(
  userId: string,
  blob: LocalProgressBlob,
): Promise<ProgressSummary> {
  // Skip import if user already has server data
  const count = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId))

  if (Number(count[0]?.count ?? 0) > 0) {
    return getProgress(userId)
  }

  if (!blob.completed?.length) {
    return getProgress(userId)
  }

  // Insert all completions idempotently
  const now = new Date()
  const inserts = blob.completed.map((dayId) => {
    const dateStr = blob.completedDates?.[dayId]
    const completedAt = dateStr ? new Date(dateStr) : now
    return { userId, dayId, completedAt }
  })

  // Insert in batches of 50 to avoid query size limits
  for (let i = 0; i < inserts.length; i += 50) {
    await db
      .insert(lessonProgress)
      .values(inserts.slice(i, i + 50))
      .onConflictDoNothing()
  }

  // Award streak points for each unique date in the import
  const uniqueDates = Array.from(new Set(
    blob.completed
      .map((id) => blob.completedDates?.[id])
      .filter((d): d is string => !!d),
  ))

  for (const dateKey of uniqueDates) {
    const key = `streak:${userId}:${dateKey}`
    try {
      await db.insert(pointsLedger).values({
        userId,
        delta: 5,
        reason: `Streak bonus – ${dateKey} (import)`,
        idempotencyKey: key,
        createdAt: new Date(dateKey),
      })
    } catch {
      // Already exists — skip
    }
  }

  await rebuildStats(userId)
  return getProgress(userId)
}
