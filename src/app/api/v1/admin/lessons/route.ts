import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { lessonAvailability } from '@/db/schema'
import { PHASES } from '@/data/roadmap'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all DB overrides
  const overrides = await db.select().from(lessonAvailability)
  const overrideMap = new Map(overrides.map((o) => [o.dayId, o.available]))

  // Flatten phases → days, preserving phaseId
  const days = PHASES.flatMap((phase) =>
    phase.days.map((d) => ({
      dayId: d.id,
      title: d.title,
      phaseId: phase.id,
      available: overrideMap.has(d.id) ? (overrideMap.get(d.id) ?? true) : (d.available ?? true),
      hasOverride: overrideMap.has(d.id),
    })),
  )

  return NextResponse.json({ success: true, data: days })
}
