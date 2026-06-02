import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { moderateComment } from '@/server/comments/service'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { id: string }
}

/** POST /api/v1/comments/[id]/moderate — admin only */
export async function POST(req: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = session.user.email === process.env.ADMIN_EMAIL
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const status =
    body !== null &&
    typeof body === 'object' &&
    'status' in body &&
    (body as Record<string, unknown>).status

  if (status !== 'approved' && status !== 'hidden') {
    return NextResponse.json(
      { error: 'status must be "approved" or "hidden"' },
      { status: 400 },
    )
  }

  const updated = await moderateComment(params.id, status)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
