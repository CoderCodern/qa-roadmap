import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { prideRedemptions } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  let body: { delivered: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { delivered } = body
  if (typeof delivered !== 'boolean') {
    return NextResponse.json({ success: false, error: 'delivered must be boolean' }, { status: 400 })
  }

  await db
    .update(prideRedemptions)
    .set({
      delivered,
      deliveredAt: delivered ? new Date() : null,
    })
    .where(eq(prideRedemptions.id, params.id))

  return NextResponse.json({ success: true })
}
