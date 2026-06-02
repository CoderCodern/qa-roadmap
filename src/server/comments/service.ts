import { eq, and, isNull, inArray, desc, sql } from 'drizzle-orm'
import { db } from '@/db'
import { comments, users, lessonStats } from '@/db/schema'

export interface CommentAuthor {
  id: string
  name: string | null
  image: string | null
}

export interface CommentEntry {
  id: string
  dayId: number
  parentId: string | null
  body: string
  status: string
  createdAt: string
  updatedAt: string
  author: CommentAuthor
  replyCount: number
}

export interface CommentPage {
  comments: CommentEntry[]
  nextOffset: number | null
}

const COMMENT_LIMIT = 20

/** List approved top-level comments for a day, with reply counts. */
export async function listComments(
  dayId: number,
  offset: number = 0,
): Promise<CommentPage> {
  const rows = await db
    .select({
      id: comments.id,
      dayId: comments.dayId,
      parentId: comments.parentId,
      body: comments.body,
      status: comments.status,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      authorId: users.id,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(comments.dayId, dayId),
        eq(comments.status, 'approved'),
        isNull(comments.parentId),
      ),
    )
    .orderBy(desc(comments.createdAt))
    .limit(COMMENT_LIMIT + 1)
    .offset(offset)

  const hasMore = rows.length > COMMENT_LIMIT
  const page = hasMore ? rows.slice(0, COMMENT_LIMIT) : rows

  // Count replies for each top-level comment
  const ids = page.map((r) => r.id)
  const replyCounts: Record<string, number> = {}
  if (ids.length > 0) {
    const counts = await db
      .select({ parentId: comments.parentId, count: sql<number>`count(*)` })
      .from(comments)
      .where(
        and(
          eq(comments.status, 'approved'),
          inArray(comments.parentId, ids),
        ),
      )
      .groupBy(comments.parentId)
    for (const row of counts) {
      if (row.parentId) replyCounts[row.parentId] = Number(row.count)
    }
  }

  return {
    comments: page.map((r) => ({
      id: r.id,
      dayId: r.dayId,
      parentId: r.parentId,
      body: r.body,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      author: { id: r.authorId, name: r.authorName, image: r.authorImage },
      replyCount: replyCounts[r.id] ?? 0,
    })),
    nextOffset: hasMore ? offset + COMMENT_LIMIT : null,
  }
}

/** List approved replies for a parent comment. */
export async function listReplies(parentId: string): Promise<CommentEntry[]> {
  const rows = await db
    .select({
      id: comments.id,
      dayId: comments.dayId,
      parentId: comments.parentId,
      body: comments.body,
      status: comments.status,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      authorId: users.id,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.parentId, parentId), eq(comments.status, 'approved')))
    .orderBy(comments.createdAt)

  return rows.map((r) => ({
    id: r.id,
    dayId: r.dayId,
    parentId: r.parentId,
    body: r.body,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    author: { id: r.authorId, name: r.authorName, image: r.authorImage },
    replyCount: 0,
  }))
}

/** Post a new comment. Returns the created comment entry. */
export async function postComment(
  userId: string,
  dayId: number,
  body: string,
  parentId?: string,
): Promise<CommentEntry> {
  const [row] = await db
    .insert(comments)
    .values({
      userId,
      dayId,
      body: body.trim().slice(0, 2000),
      parentId: parentId ?? null,
      status: 'approved',
    })
    .returning()

  // Update comments_count in lesson_stats (only for top-level comments)
  if (!parentId) {
    await db
      .insert(lessonStats)
      .values({ dayId, commentsCount: 1, avgStars: 0, ratingsCount: 0 })
      .onConflictDoUpdate({
        target: lessonStats.dayId,
        set: {
          commentsCount: sql`${lessonStats.commentsCount} + 1`,
          updatedAt: new Date(),
        },
      })
  }

  const [author] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  return {
    id: row.id,
    dayId: row.dayId,
    parentId: row.parentId,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    author: { id: author.id, name: author.name, image: author.image },
    replyCount: 0,
  }
}

/** Edit a comment body. Only the owner may edit. */
export async function editComment(
  commentId: string,
  userId: string,
  body: string,
): Promise<boolean> {
  const result = await db
    .update(comments)
    .set({ body: body.trim().slice(0, 2000), updatedAt: new Date() })
    .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
    .returning({ id: comments.id })
  return result.length > 0
}

/** Delete a comment (owner or admin). Soft-delete by hiding or hard-delete. */
export async function deleteComment(
  commentId: string,
  userId: string,
  isAdmin: boolean,
): Promise<boolean> {
  const where = isAdmin
    ? eq(comments.id, commentId)
    : and(eq(comments.id, commentId), eq(comments.userId, userId))

  // Check if top-level before deleting (for stats update)
  const [existing] = await db
    .select({ parentId: comments.parentId, dayId: comments.dayId })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1)

  const result = await db.delete(comments).where(where).returning({ id: comments.id })
  if (result.length === 0) return false

  // Decrement comment count for top-level comments
  if (existing && !existing.parentId) {
    await db
      .update(lessonStats)
      .set({
        commentsCount: sql`GREATEST(${lessonStats.commentsCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(lessonStats.dayId, existing.dayId))
  }

  return true
}

/** Admin: set comment status to 'approved' or 'hidden'. */
export async function moderateComment(
  commentId: string,
  status: 'approved' | 'hidden',
): Promise<boolean> {
  const result = await db
    .update(comments)
    .set({ status, updatedAt: new Date() })
    .where(eq(comments.id, commentId))
    .returning({ id: comments.id })
  return result.length > 0
}
