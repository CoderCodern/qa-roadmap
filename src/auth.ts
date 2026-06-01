import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/db'
import { accounts, sessions, users, verificationTokens } from '@/db/schema'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
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
  // JWT sessions — no per-request DB lookup, revocation-free at this stage
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      // On first sign-in, persist the DB user id into the token
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      // Make user.id available to all client and server session reads
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
  pages: {
    // Use built-in NextAuth sign-in page; customise in Phase 2 if needed
    signIn: '/api/auth/signin',
  },
})
