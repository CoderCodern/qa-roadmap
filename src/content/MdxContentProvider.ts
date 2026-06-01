import { getLessonLoader } from '@/lib/lesson-loader'
import { getAllDays, getDayById, PHASES } from '@/data/roadmap'
import type { IContentProvider, LessonContent, LessonMeta, LessonRef } from './types'

function dayToMeta(day: {
  id: number
  title: string
  titleVi: string
  blurb: string
  blurbVi: string
  estMinutes: number
  tags: string[]
  available?: boolean
}): LessonMeta {
  const phase = PHASES.find((p) => p.days.some((d) => d.id === day.id))
  return {
    dayId: day.id,
    title: day.title,
    titleVi: day.titleVi,
    blurb: day.blurb,
    blurbVi: day.blurbVi,
    phaseId: phase?.id ?? 0,
    estMinutes: day.estMinutes,
    tags: day.tags,
    available: day.available ?? true,
    source: 'mdx',
  }
}

export class MdxContentProvider implements IContentProvider {
  hasLesson({ dayId }: LessonRef): boolean {
    return !!getLessonLoader(dayId)
  }

  async getLessonMeta({ dayId }: LessonRef): Promise<LessonMeta | null> {
    const day = getDayById(dayId)
    if (!day) return null
    return dayToMeta(day)
  }

  async getLesson(ref: LessonRef): Promise<LessonContent | null> {
    const loader = getLessonLoader(ref.dayId)
    if (!loader) return null

    const [{ default: Body }, meta] = await Promise.all([
      loader(),
      this.getLessonMeta(ref),
    ])

    if (!meta) return null
    return { meta, Body }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async listLessons(courseSlug: string): Promise<LessonMeta[]> {
    return getAllDays().map(dayToMeta)
  }
}
