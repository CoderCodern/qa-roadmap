import type React from 'react'

export interface LessonRef {
  courseSlug: string
  dayId: number
  locale?: 'en' | 'vi'
}

export interface LessonMeta {
  dayId: number
  title: string
  titleVi: string
  blurb: string
  blurbVi: string
  phaseId: number
  estMinutes: number
  tags: string[]
  /** false = content not ready yet; true/undefined = published */
  available: boolean
  /** Provenance — useful for debugging and future telemetry */
  source: 'mdx' | 'api'
}

export interface LessonContent {
  meta: LessonMeta
  /** MDX-compiled component or API-rendered component */
  Body: React.ComponentType
}

export interface IContentProvider {
  hasLesson(ref: LessonRef): boolean | Promise<boolean>
  getLessonMeta(ref: LessonRef): Promise<LessonMeta | null>
  getLesson(ref: LessonRef): Promise<LessonContent | null>
  listLessons(courseSlug: string): Promise<LessonMeta[]>
}
