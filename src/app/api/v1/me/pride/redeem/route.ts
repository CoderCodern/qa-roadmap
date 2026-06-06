import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { db } from '@/db'
import { prideRedemptions, pointsLedger, userStats } from '@/db/schema'
import type { RedeemPridePayload } from '@/lib/redeemPride'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: RedeemPridePayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const { productId, productName, productNameVi, price, pointsSpent, type, phaseId } = body
  if (!productId || !productName || !type) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  const userId = (session.user as { id?: string }).id
  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID not found' }, { status: 401 })
  }

  // 1. Insert the redemption record
  const [inserted] = await db
    .insert(prideRedemptions)
    .values({ userId, productId, productName, productNameVi, price, pointsSpent, type, phaseId })
    .returning({ id: prideRedemptions.id })

  if (pointsSpent > 0) {
    // 2. Write a negative ledger entry so rebuildStats() always reflects the spend
    await db.insert(pointsLedger).values({
      userId,
      delta: -pointsSpent,
      reason: `Redeemed: ${productName}`,
      idempotencyKey: `redeem:${inserted.id}`,
    })

    // 3. Decrement the cached balance — GREATEST prevents going negative
    await db
      .update(userStats)
      .set({
        pointsBalance: sql`GREATEST(${userStats.pointsBalance} - ${pointsSpent}, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId))
  }

  // 4. Read the authoritative balance and return it to the client
  const [stats] = await db
    .select({ pointsBalance: userStats.pointsBalance })
    .from(userStats)
    .where(eq(userStats.userId, userId))

  return NextResponse.json(
    { success: true, data: { id: inserted.id, newPointsBalance: stats?.pointsBalance ?? 0 } },
    { status: 201 },
  )
}
