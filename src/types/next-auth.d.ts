import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  /**
   * Augment the built-in Session.user type so that session.user.id is typed
   * as string everywhere (RSC, client components, API routes).
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
