import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { lessonAvailability } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { dayId: string } },
) {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const dayId = Number(params.dayId)
  if (!dayId || isNaN(dayId)) {
    return NextResponse.json({ success: false, error: 'Invalid dayId' }, { status: 400 })
  }

  const { available } = (await req.json()) as { available: boolean }
  if (typeof available !== 'boolean') {
    return NextResponse.json({ success: false, error: 'available must be boolean' }, { status: 400 })
  }

  await db
    .insert(lessonAvailability)
    .values({ dayId, available, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: lessonAvailability.dayId,
      set: { available, updatedAt: new Date() },
    })

  // Invalidate both the lesson detail page and the roadmap listing so the
  // admin publish/hide change is reflected everywhere immediately.
  revalidatePath(`/day/${dayId}`)
  revalidatePath('/roadmap')

  return NextResponse.json({ success: true, data: { dayId, available } })
}
