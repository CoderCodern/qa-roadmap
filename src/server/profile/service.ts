import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { profiles, users, userStats, lessonProgress } from '@/db/schema'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  bio: string | null
  stats: {
    currentStreak: number
    longestStreak: number
    pointsBalance: number
    completedCount: number
  }
}

// ─── Public service API ───────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const [user, profile, stats, countResult] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.profiles.findFirst({ where: eq(profiles.userId, userId) }),
    db.query.userStats.findFirst({ where: eq(userStats.userId, userId) }),
    db
      .select({ count: lessonProgress.id })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId)),
  ])

  if (!user) return null

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    bio: profile?.bio ?? null,
    stats: {
      currentStreak: stats?.currentStreak ?? 0,
      longestStreak: stats?.longestStreak ?? 0,
      pointsBalance: stats?.pointsBalance ?? 0,
      completedCount: countResult.length,
    },
  }
}

export async function upsertProfile(
  userId: string,
  data: { bio?: string },
): Promise<void> {
  await db
    .insert(profiles)
    .values({ userId, bio: data.bio ?? null, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { bio: data.bio ?? null, updatedAt: new Date() },
    })
}
