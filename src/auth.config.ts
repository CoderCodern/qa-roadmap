import Google from 'next-auth/providers/google'
import type { NextAuthConfig } from 'next-auth'

// Edge-compatible config — no Node.js-only modules (no DrizzleAdapter, no Neon).
// Used by middleware for JWT session checks.
// src/auth.ts extends this with the DrizzleAdapter for server-side route handlers.
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      // Stamp isAdmin once at sign-in using the server-side ADMIN_EMAIL env var.
      // This avoids any client-side env var exposure.
      if (user?.email !== undefined) {
        token.isAdmin = user.email === process.env.ADMIN_EMAIL
      }
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      session.user.isAdmin = token.isAdmin === true
      return session
    },
  },
  pages: {
    signIn: '/api/auth/signin',
  },
}
