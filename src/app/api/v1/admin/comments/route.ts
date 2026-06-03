import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/db'
import { comments, users } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // 'approved' | 'hidden' | null = all

  const rows = await db
    .select({
      id: comments.id,
      dayId: comments.dayId,
      parentId: comments.parentId,
      body: comments.body,
      status: comments.status,
      createdAt: comments.createdAt,
      userId: comments.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(status ? eq(comments.status, status) : undefined)
    .orderBy(desc(comments.createdAt))
    .limit(200)

  return NextResponse.json({ success: true, data: rows })
}
