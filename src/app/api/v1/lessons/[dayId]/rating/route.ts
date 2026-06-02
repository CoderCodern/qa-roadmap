import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getRatingSummary, upsertRating } from '@/server/ratings/service'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: { dayId: string }
}

/** GET /api/v1/lessons/[dayId]/rating — public; includes myRating if signed in */
export async function GET(req: Request, { params }: RouteContext): Promise<NextResponse> {
  const dayId = parseInt(params.dayId, 10)
  if (isNaN(dayId)) return NextResponse.json({ error: 'Invalid dayId' }, { status: 400 })

  const session = await auth()
  const summary = await getRatingSummary(dayId, session?.user?.id)
  return NextResponse.json(summary)
}

/** PUT /api/v1/lessons/[dayId]/rating — upsert rating, auth required */
export async function PUT(req: Request, { params }: RouteContext): Promise<NextResponse> {
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

  const { stars, review } = body as Record<string, unknown>

  if (typeof stars !== 'number' || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'stars must be an integer 1–5' }, { status: 400 })
  }
  if (review !== undefined && review !== null && typeof review !== 'string') {
    return NextResponse.json({ error: 'review must be a string' }, { status: 400 })
  }

  const summary = await upsertRating(
    session.user.id,
    dayId,
    stars,
    typeof review === 'string' ? review : undefined,
  )

  return NextResponse.json(summary)
}
