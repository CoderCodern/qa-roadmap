import { MdxContentProvider } from './MdxContentProvider'
import type { IContentProvider } from './types'

/**
 * The singleton content provider for the application.
 *
 * Pages import ONLY from here — never directly from lesson-loader or roadmap.ts.
 * To swap in an API or hybrid provider later, change only this one line.
 *
 * Future:
 *   export const content: IContentProvider =
 *     new HybridContentProvider(new MdxContentProvider(), new ApiContentProvider())
 */
export const content: IContentProvider = new MdxContentProvider()

export type { IContentProvider, LessonRef, LessonMeta, LessonContent } from './types'
