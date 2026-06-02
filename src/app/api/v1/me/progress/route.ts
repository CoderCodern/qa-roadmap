import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'
import {
  getProgress,
  syncFromLocalStorage,
  type LocalProgressBlob,
} from '@/server/progress/service'

/** GET /api/v1/me/progress — returns the current user's progress summary */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const summary = await getProgress(session.user.id)
  return NextResponse.json(summary)
}

/**
 * POST /api/v1/me/progress/sync
 * One-time import from the client's localStorage blob.
 * Body: { completed: number[], completedDates: Record<number, string>, totalPoints?: number }
 */
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let blob: LocalProgressBlob
  try {
    blob = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!Array.isArray(blob.completed)) {
    return NextResponse.json({ error: 'Invalid payload: completed must be an array' }, { status: 400 })
  }

  const summary = await syncFromLocalStorage(session.user.id, blob)
  return NextResponse.json(summary, { status: 200 })
}
