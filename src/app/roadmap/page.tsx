import type { Metadata } from 'next'
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline'

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'Full 8-week QA automation roadmap — 56 days across 5 phases.',
}

export default function RoadmapPage() {
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
      <RoadmapTimeline />
    </div>
  )
}
