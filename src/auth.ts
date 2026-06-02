import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getDb } from '@/db'
import { accounts, sessions, users, verificationTokens } from '@/db/schema'

// Pass a config-resolver function instead of a plain object.
// NextAuth calls this function per-request, so DrizzleAdapter(getDb(), ...)
// is constructed at runtime — not at build time when DATABASE_URL may be absent.
export const { handlers, signIn, signOut, auth } = NextAuth(() => ({
  adapter: DrizzleAdapter(getDb(), {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  // JWT sessions — no per-request DB lookup for session reads
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
  pages: {
    signIn: '/api/auth/signin',
  },
}))
