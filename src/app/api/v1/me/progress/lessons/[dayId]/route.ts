import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'
import { completeLesson, uncompleteLesson, getProgress } from '@/server/progress/service'

interface RouteParams {
  params: { dayId: string }
}

/** PUT /api/v1/me/progress/lessons/[dayId] — mark a lesson complete (idempotent) */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dayId = Number(params.dayId)
  if (!Number.isInteger(dayId) || dayId < 1 || dayId > 56) {
    return NextResponse.json({ error: 'Invalid dayId' }, { status: 400 })
  }

  const result = await completeLesson(session.user.id, dayId)
  return NextResponse.json(result)
}

/** DELETE /api/v1/me/progress/lessons/[dayId] — uncomplete a lesson */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dayId = Number(params.dayId)
  if (!Number.isInteger(dayId) || dayId < 1 || dayId > 56) {
    return NextResponse.json({ error: 'Invalid dayId' }, { status: 400 })
  }

  await uncompleteLesson(session.user.id, dayId)
  const summary = await getProgress(session.user.id)
  return NextResponse.json(summary)
}
