import Link from 'next/link'
import {
  BookOpen, Code2, Monitor, Globe, Trophy,
  type LucideIcon,
} from 'lucide-react'
import { type Phase } from '@/data/roadmap'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = { BookOpen, Code2, Monitor, Globe, Trophy }

interface PhaseOverviewProps {
  phases: Phase[]
}

export function PhaseOverview({ phases }: PhaseOverviewProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          <span className="lang-en">5 Phases, 56 Days</span>
          <span className="lang-vi">5 Giai Đoạn, 56 Ngày</span>
        </h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">
          <span className="lang-en">A structured path from tester fundamentals to a polished automation portfolio.</span>
          <span className="lang-vi">Con đường có cấu trúc từ kiến thức cơ bản đến portfolio automation hoàn chỉnh.</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {phases.map((phase) => {
          const Icon = iconMap[phase.iconName] ?? BookOpen
          return (
            <Link
              key={phase.id}
              href="/roadmap"
              className={cn(
                'group flex flex-col gap-3 rounded-2xl border p-5 transition-all hover:shadow-md',
                phase.borderClass,
                phase.bgClass
              )}
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 dark:bg-black/20')}>
                <Icon className={cn('h-5 w-5', phase.textClass)} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{phase.weekRange}</p>
                <p className={cn('font-bold', phase.textClass)}>
                  <span className="lang-en">{phase.title}</span>
                  <span className="lang-vi">{phase.titleVi}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{phase.days.length} days</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
