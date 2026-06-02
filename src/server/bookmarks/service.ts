import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { bookmarks } from '@/db/schema'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookmarkEntry {
  dayId: number
  createdAt: string
}

// ─── Public service API ───────────────────────────────────────────────────────

export async function getBookmarks(userId: string): Promise<BookmarkEntry[]> {
  const rows = await db
    .select({ dayId: bookmarks.dayId, createdAt: bookmarks.createdAt })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))

  return rows.map((r) => ({
    dayId: r.dayId,
    createdAt: r.createdAt.toISOString(),
  }))
}

/** Idempotent — safe to call if already bookmarked. */
export async function addBookmark(userId: string, dayId: number): Promise<void> {
  await db
    .insert(bookmarks)
    .values({ userId, dayId, createdAt: new Date() })
    .onConflictDoNothing()
}

export async function removeBookmark(userId: string, dayId: number): Promise<void> {
  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.dayId, dayId)))
}
