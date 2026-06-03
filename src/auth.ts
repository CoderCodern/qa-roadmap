import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getDb } from '@/db'
import { accounts, sessions, users, verificationTokens } from '@/db/schema'
import { authConfig } from './auth.config'

// Pass a config-resolver function instead of a plain object.
// NextAuth calls this function per-request, so DrizzleAdapter(getDb(), ...)
// is constructed at runtime — not at build time when DATABASE_URL may be absent.
export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  ...authConfig,
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
}))
