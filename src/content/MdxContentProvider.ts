/**
 * MdxContentProvider — server-only
 *
 * Implements IContentProvider over the local MDX lesson files.
 *
 * Metadata strategy (eliminating dual-source drift):
 *  • MDX front-matter is authoritative for fields present in both sources:
 *    `title`, `estMinutes`, `tags`.  When a content author edits those fields
 *    in the MDX file, the change propagates automatically to lesson detail pages
 *    without touching roadmap.ts.
 *  • roadmap.ts remains the source of truth for bilingual / structural fields
 *    that have no MDX equivalent: `titleVi`, `blurb`, `blurbVi`, `phaseId`, and
 *    the admin-controlled `available` flag (stored in the DB; roadmap.ts is the
 *    fallback default).
 *  • List views (roadmap page, search index) still read from roadmap.ts — fast
 *    and no module-loading overhead.  Only lesson detail pages load the module
 *    and benefit from fresh front-matter.
 */
import { getLessonLoader, getAvailableLessonIds } from '@/lib/lesson-loader'
import type { MdxFrontmatter } from '@/lib/lesson-loader'
import { getDayById, PHASES } from '@/data/roadmap'
import type { IContentProvider, LessonContent, LessonMeta, LessonRef } from './types'

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Merges roadmap.ts data with optional MDX front-matter.
 * Front-matter wins for fields it explicitly provides; roadmap.ts fills the rest.
 */
function buildMeta(dayId: number, fm?: MdxFrontmatter): LessonMeta | null {
  const day = getDayById(dayId)
  if (!day) return null

  const phase = PHASES.find(p => p.days.some(d => d.id === dayId))

  return {
    dayId,
    // MDX front-matter is authoritative when present; roadmap.ts is the fallback.
    title: fm?.title ?? day.title,
    estMinutes: fm?.estMinutes ?? day.estMinutes,
    tags: fm?.tags ?? day.tags,
    // Bilingual / structural fields live only in roadmap.ts.
    titleVi: day.titleVi,
    blurb: day.blurb,
    blurbVi: day.blurbVi,
    phaseId: phase?.id ?? 0,
    available: day.available ?? true,
    source: 'mdx',
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class MdxContentProvider implements IContentProvider {
  hasLesson({ dayId }: LessonRef): boolean {
    return !!getLessonLoader(dayId)
  }

  /**
   * Returns metadata for list/card contexts — reads from roadmap.ts only (fast,
   * no MDX module loading).  The lesson detail page uses `getLesson` which
   * additionally reads front-matter from the loaded module.
   */
  async getLessonMeta({ dayId }: LessonRef): Promise<LessonMeta | null> {
    if (!getLessonLoader(dayId)) return null
    return buildMeta(dayId)
  }

  /**
   * Loads the MDX module and builds metadata from its front-matter + roadmap.ts.
   * Front-matter wins for `title`, `estMinutes`, and `tags`.
   */
  async getLesson(ref: LessonRef): Promise<LessonContent | null> {
    const loader = getLessonLoader(ref.dayId)
    if (!loader) return null

    const mod = await loader()
    const meta = buildMeta(ref.dayId, mod.frontmatter)
    if (!meta) return null

    return { meta, Body: mod.default }
  }

  /**
   * Lists all lessons whose MDX file exists on disk (auto-discovered via
   * filesystem scan — no manual registration needed when adding new lessons).
   * Metadata comes from roadmap.ts for performance; no MDX modules are loaded.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async listLessons(_courseSlug: string): Promise<LessonMeta[]> {
    return getAvailableLessonIds()
      .map(id => buildMeta(id))
      .filter((m): m is LessonMeta => m !== null)
  }
}
