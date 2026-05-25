import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LessonShell } from '@/components/lesson/LessonShell'
import { getDayById } from '@/data/roadmap'
import { getLessonLoader } from '@/lib/lesson-loader'

export async function generateStaticParams() {
  return Array.from({ length: 56 }, (_, i) => ({ id: String(i + 1) }))
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const day = getDayById(Number(params.id))
  if (!day) return {}
  return {
    title: `Day ${day.id}: ${day.title}`,
    description: day.blurb,
  }
}

export default async function DayPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (!id || id < 1 || id > 56 || isNaN(id)) notFound()

  const loader = getLessonLoader(id)
  if (!loader) notFound()

  const { default: LessonContent } = await loader()

  return (
    <LessonShell dayId={id}>
      <article className="prose prose-gray prose-lg dark:prose-invert max-w-none">
        <LessonContent />
      </article>
    </LessonShell>
  )
}
