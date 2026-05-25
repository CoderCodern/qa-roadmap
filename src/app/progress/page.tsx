import type { Metadata } from 'next'
import { ProgressDashboard } from '@/components/progress/ProgressDashboard'

export const metadata: Metadata = {
  title: 'My Progress',
  description: 'Track your QA roadmap progress — completed days, streak, and milestones.',
}

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          <span className="lang-en">My Progress</span>
          <span className="lang-vi">Tiến Độ Của Tôi</span>
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          <span className="lang-en">Your journey through the 56-day roadmap.</span>
          <span className="lang-vi">Hành trình của bạn qua lộ trình 56 ngày.</span>
        </p>
      </div>
      <ProgressDashboard />
    </div>
  )
}
