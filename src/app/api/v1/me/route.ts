import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'
import { getProfile, upsertProfile } from '@/server/profile/service'

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await getProfile(session.user.id)
  if (!profile) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(profile)
}

export async function PATCH(req: Request): Promise<NextResponse> {
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

  const bio =
    body !== null &&
    typeof body === 'object' &&
    'bio' in body &&
    typeof (body as Record<string, unknown>).bio === 'string'
      ? ((body as Record<string, unknown>).bio as string)
      : undefined

  await upsertProfile(session.user.id, { bio })

  const updated = await getProfile(session.user.id)
  return NextResponse.json(updated)
}
