import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { prideRedemptions, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const rows = await db
    .select({
      id: prideRedemptions.id,
      productId: prideRedemptions.productId,
      productName: prideRedemptions.productName,
      productNameVi: prideRedemptions.productNameVi,
      price: prideRedemptions.price,
      pointsSpent: prideRedemptions.pointsSpent,
      type: prideRedemptions.type,
      phaseId: prideRedemptions.phaseId,
      delivered: prideRedemptions.delivered,
      deliveredAt: prideRedemptions.deliveredAt,
      createdAt: prideRedemptions.createdAt,
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
    })
    .from(prideRedemptions)
    .innerJoin(users, eq(prideRedemptions.userId, users.id))
    .orderBy(prideRedemptions.createdAt)

  // Return newest first
  rows.reverse()

  return NextResponse.json({ success: true, data: rows })
}
