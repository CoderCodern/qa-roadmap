import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getBookmarks } from '@/server/bookmarks/service'

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await getBookmarks(session.user.id)
  return NextResponse.json({ bookmarks: items })
}
