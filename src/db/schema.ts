import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

// ─── NextAuth required tables ────────────────────────────────────────────────
// Table names are singular to match the DrizzleAdapter defaults.

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
)

// ─── Application tables ───────────────────────────────────────────────────────

/**
 * One row per (user, day) — idempotent completion record.
 * day_id is the integer from roadmap.ts (1–56).
 */
export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dayId: integer('day_id').notNull(),
    completedAt: timestamp('completed_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (lp) => ({
    uniqueUserDay: uniqueIndex('lesson_progress_user_day_idx').on(lp.userId, lp.dayId),
  }),
)

/**
 * Append-only points ledger — source of truth for the points balance.
 * idempotencyKey prevents duplicate awards (e.g. "streak:{userId}:{YYYY-MM-DD}").
 */
export const pointsLedger = pgTable('points_ledger', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  delta: integer('delta').notNull(),
  reason: text('reason').notNull(),
  idempotencyKey: text('idempotency_key').unique(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
})

/**
 * Denormalized per-user stats cache — updated transactionally on every
 * completion/uncompletion so dashboards and headers never aggregate at read time.
 */
export const userStats = pgTable('user_stats', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  pointsBalance: integer('points_balance').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

/**
 * Optional per-user profile data (bio, preferences).
 * Created lazily on first PATCH /api/v1/me.
 */
export const profiles = pgTable('profile', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

/**
 * One row per (user, day) — idempotent bookmark.
 */
export const bookmarks = pgTable(
  'bookmark',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dayId: integer('day_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (b) => ({
    uniqueUserDay: uniqueIndex('bookmark_user_day_idx').on(b.userId, b.dayId),
  }),
)

/**
 * User-generated comments on a lesson.
 * status: 'approved' (visible) | 'hidden' (admin-removed)
 * parentId: null = top-level, non-null = reply to another comment
 */
export const comments = pgTable('comment', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  dayId: integer('day_id').notNull(),
  parentId: text('parent_id'), // self-ref; no FK constraint to keep schema simple
  body: text('body').notNull(),
  status: text('status').notNull().default('approved'), // 'approved' | 'hidden'
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

/**
 * One rating per (user, day) — upsert on write.
 * stars: 1–5 integer. review: optional short text.
 */
export const ratings = pgTable(
  'rating',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dayId: integer('day_id').notNull(),
    stars: integer('stars').notNull(), // 1–5
    review: text('review'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (r) => ({
    uniqueUserDay: uniqueIndex('rating_user_day_idx').on(r.userId, r.dayId),
  }),
)

/**
 * Denormalized per-lesson stats — updated on every rating write so lesson
 * pages never run aggregations at read time.
 */
export const lessonStats = pgTable('lesson_stats', {
  dayId: integer('day_id').primaryKey(),
  avgStars: real('avg_stars').notNull().default(0),
  ratingsCount: integer('ratings_count').notNull().default(0),
  commentsCount: integer('comments_count').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})

/**
 * Admin overrides for the static roadmap.ts `available` flag.
 * When a row exists for a dayId, it takes precedence over roadmap.ts.
 * Toggled via /admin/lessons without requiring a code deploy.
 */
export const lessonAvailability = pgTable('lesson_availability', {
  dayId: integer('day_id').primaryKey(),
  available: boolean('available').notNull().default(true),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
})
