import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { addBookmark, removeBookmark } from '@/server/bookmarks/service'

interface RouteContext {
  params: { dayId: string }
}

export async function PUT(
  _req: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dayId = parseInt(params.dayId, 10)
  if (isNaN(dayId)) {
    return NextResponse.json({ error: 'Invalid dayId' }, { status: 400 })
  }

  await addBookmark(session.user.id, dayId)
  return new NextResponse(null, { status: 204 })
}

export async function DELETE(
  _req: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dayId = parseInt(params.dayId, 10)
  if (isNaN(dayId)) {
    return NextResponse.json({ error: 'Invalid dayId' }, { status: 400 })
  }

  await removeBookmark(session.user.id, dayId)
  return new NextResponse(null, { status: 204 })
}
