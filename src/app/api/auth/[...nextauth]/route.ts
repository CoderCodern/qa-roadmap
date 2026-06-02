import { handlers } from '@/auth'

// Required for NextAuth v5 with Next.js App Router — prevents static analysis
// of a route that depends on runtime env vars and DB connections.
export const dynamic = 'force-dynamic'

export const { GET, POST } = handlers
