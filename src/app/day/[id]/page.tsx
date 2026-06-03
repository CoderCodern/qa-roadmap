import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LessonShell } from '@/components/lesson/LessonShell'
import { content } from '@/content'
import { db } from '@/db'
import { lessonAvailability } from '@/db/schema'
import { eq } from 'drizzle-orm'

// ISR: revalidate at most every 60s. Admin toggles call revalidatePath() for instant effect.
export const revalidate = 60

export async function generateStaticParams() {
  const lessons = await content.listLessons('qa')
  return lessons.map((l) => ({ id: String(l.dayId) }))
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const meta = await content.getLessonMeta({ courseSlug: 'qa', dayId: Number(params.id) })
  if (!meta) return {}
  return {
    title: `Day ${meta.dayId}: ${meta.title}`,
    description: meta.blurb,
  }
}

export default async function DayPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (!id || id < 1 || isNaN(id)) notFound()

  const [lesson, override] = await Promise.all([
    content.getLesson({ courseSlug: 'qa', dayId: id }),
    db.query.lessonAvailability.findFirst({ where: eq(lessonAvailability.dayId, id) }).catch(() => undefined),
  ])

  if (!lesson) notFound()

  const { Body } = lesson

  return (
    <LessonShell dayId={id} availableOverride={override?.available}>
      <article className="prose prose-gray prose-lg dark:prose-invert max-w-none">
        <Body />
      </article>
    </LessonShell>
  )
}
