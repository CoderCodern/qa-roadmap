import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { listComments, listReplies, postComment } from '@/server/comments/service'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { dayId: string }
}

/** GET /api/v1/lessons/[dayId]/comments?offset=0 — public, returns approved comments */
export async function GET(req: Request, { params }: RouteContext): Promise<NextResponse> {
  const dayId = parseInt(params.dayId, 10)
  if (isNaN(dayId)) return NextResponse.json({ error: 'Invalid dayId' }, { status: 400 })

  const url = new URL(req.url)
  const parentId = url.searchParams.get('parentId')

  // Replies request: return flat list of replies for a parent comment
  if (parentId) {
    const replies = await listReplies(parentId)
    return NextResponse.json({ comments: replies, nextOffset: null })
  }

  const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)
  const page = await listComments(dayId, isNaN(offset) ? 0 : offset)
  return NextResponse.json(page)
}

/** POST /api/v1/lessons/[dayId]/comments — auth required */
export async function POST(req: Request, { params }: RouteContext): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dayId = parseInt(params.dayId, 10)
  if (isNaN(dayId)) return NextResponse.json({ error: 'Invalid dayId' }, { status: 400 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { body: text, parentId } = body as Record<string, unknown>

  if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }
  if (text.trim().length > 2000) {
    return NextResponse.json({ error: 'body exceeds 2000 characters' }, { status: 400 })
  }
  if (parentId !== undefined && typeof parentId !== 'string') {
    return NextResponse.json({ error: 'parentId must be a string' }, { status: 400 })
  }

  const comment = await postComment(
    session.user.id,
    dayId,
    text,
    typeof parentId === 'string' ? parentId : undefined,
  )

  return NextResponse.json(comment, { status: 201 })
}
