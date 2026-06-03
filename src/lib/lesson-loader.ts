/**
 * lesson-loader.ts — server-only
 *
 * Replaces the old 56-entry hardcoded map with filesystem auto-discovery.
 *
 * How it works:
 *  1. At module init, `fs.readdirSync` scans content/lessons/en/ and builds a
 *     Set of known day IDs from filenames (day-NN.mdx).  Adding a new lesson
 *     file is all that's needed — no manual registration here.
 *  2. `getLessonLoader(id)` returns a thunk that uses a template-literal
 *     dynamic import.  Webpack resolves template-literal imports into a context
 *     module that bundles every matching day-NN.mdx at build time.
 *  3. `remark-mdx-frontmatter` (wired in next.config.mjs) exports the YAML
 *     front-matter block as `export const frontmatter = { … }` from each MDX
 *     module, which MdxContentProvider reads to derive authoritative metadata.
 */
import fs from 'fs'
import path from 'path'
import type React from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

/** Shape of the YAML front-matter block exported by each MDX lesson. */
export type MdxFrontmatter = {
  id?: number
  title?: string
  phase?: number
  estMinutes?: number
  tags?: string[]
}

/** Module shape returned by every lesson MDX file. */
export type LessonModule = {
  default: React.ComponentType
  frontmatter?: MdxFrontmatter
}

type LessonLoader = () => Promise<LessonModule>

// ── Filesystem scan ───────────────────────────────────────────────────────────

/**
 * Reads the MDX directory once at module init (cold start / build time).
 * Returns a sorted array of known day IDs so callers never need to touch this
 * file to register new lessons.
 */
function discoverLessonIds(): number[] {
  try {
    const dir = path.join(process.cwd(), 'content', 'lessons', 'en')
    return fs
      .readdirSync(dir)
      .map(f => f.match(/^day-(\d+)\.mdx$/)?.[1])
      .filter((n): n is string => n !== undefined)
      .map(Number)
      .sort((a, b) => a - b)
  } catch {
    // Graceful fallback in environments where the directory isn't mounted
    // (e.g. unit-test sandboxes running without the content folder).
    return []
  }
}

const _availableIds = new Set(discoverLessonIds())

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns a dynamic loader for the given day ID, or `undefined` if no MDX
 * file was found on disk.
 *
 * Webpack resolves the template-literal `import(…)` into a context module that
 * includes every `content/lessons/en/day-NN.mdx` file — the correct module is
 * selected at runtime by the padded string.
 */
export function getLessonLoader(id: number): LessonLoader | undefined {
  if (!_availableIds.has(id)) return undefined
  const padded = String(id).padStart(2, '0')
  return () => import(`../../content/lessons/en/day-${padded}.mdx`) as Promise<LessonModule>
}

/**
 * Returns all day IDs that have a corresponding MDX file, sorted ascending.
 * Used by `MdxContentProvider.listLessons()` to auto-include new lessons.
 */
export function getAvailableLessonIds(): number[] {
  return Array.from(_availableIds).sort((a, b) => a - b)
}
