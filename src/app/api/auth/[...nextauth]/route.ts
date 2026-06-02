// force-dynamic prevents Next.js from statically evaluating this route at build time.
// Dynamic imports ensure @/auth (and its DrizzleAdapter + DB connection) are
// never loaded during the build phase — only at runtime when env vars exist.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { handlers } = await import('@/auth')
  return handlers.GET(req as never)
}

export async function POST(req: Request) {
  const { handlers } = await import('@/auth')
  return handlers.POST(req as never)
}
