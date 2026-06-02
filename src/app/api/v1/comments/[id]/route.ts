import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { editComment, deleteComment } from '@/server/comments/service'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { id: string }
}

const isAdmin = (email: string | null | undefined) =>
  !!email && email === process.env.ADMIN_EMAIL

/** PATCH /api/v1/comments/[id] — edit own comment body */
export async function PATCH(req: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const text =
    body !== null &&
    typeof body === 'object' &&
    'body' in body &&
    typeof (body as Record<string, unknown>).body === 'string'
      ? ((body as Record<string, unknown>).body as string)
      : null

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }

  const updated = await editComment(params.id, session.user.id, text)
  if (!updated) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}

/** DELETE /api/v1/comments/[id] — delete own comment (or any comment if admin) */
export async function DELETE(_req: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const deleted = await deleteComment(params.id, session.user.id, isAdmin(session.user.email))
  if (!deleted) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })

  return new NextResponse(null, { status: 204 })
}
