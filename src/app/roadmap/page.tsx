import type { Metadata } from 'next'
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline'
import { db } from '@/db'
import { lessonAvailability } from '@/db/schema'

// ISR: revalidate every 60 s as a safety net.
// Admin toggles call revalidatePath('/roadmap') for instant invalidation.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'Full 8-week QA automation roadmap — 56 days across 5 phases.',
}

export default async function RoadmapPage() {
  // Fetch every row that the admin has explicitly overridden.
  // Days with no row fall back to the static `available` flag in roadmap.ts.
  const rows = await db.select().from(lessonAvailability).catch(() => [] as typeof lessonAvailability.$inferSelect[])
  const availabilityOverrides: Record<number, boolean> = {}
  for (const row of rows) {
    availabilityOverrides[row.dayId] = row.available
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          <span className="lang-en">Full Learning Roadmap</span>
          <span className="lang-vi">Lộ Trình Học Đầy Đủ</span>
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          <span className="lang-en">Click any day to open the lesson. Completed days show a green check.</span>
          <span className="lang-vi">Nhấp vào bất kỳ ngày nào để mở bài học. Ngày hoàn thành hiển thị dấu tích xanh.</span>
        </p>
      </div>
      <RoadmapTimeline availabilityOverrides={availabilityOverrides} />
    </div>
  )
}
