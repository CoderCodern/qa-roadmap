'use client'

import Link from 'next/link'
import { CheckCircle2, Clock, Lock } from 'lucide-react'
import { type Day, type Phase } from '@/data/roadmap'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface DayCardProps {
  day: Day
  phase: Phase
  isCompleted: boolean
  isLocked: boolean
}

export function DayCard({ day, phase, isCompleted, isLocked }: DayCardProps) {
  const badge = (
    <div className={cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
      isLocked
        ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
        : isCompleted
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
          : `${phase.bgClass} ${phase.textClass}`
    )}>
      {isLocked
        ? <Lock className="h-3.5 w-3.5" />
        : isCompleted
          ? <CheckCircle2 className="h-4 w-4" />
          : <span>{day.id}</span>
      }
    </div>
  )

  const content = (
    <>
      {badge}
      <div className="min-w-0 flex-1">
        <p className={cn(
          'text-sm font-semibold leading-tight',
          isLocked
            ? 'text-gray-400 dark:text-gray-600'
            : isCompleted
              ? 'text-emerald-800 dark:text-emerald-200'
              : 'text-gray-800 dark:text-gray-200'
        )}>
          <span className="lang-en">{day.title}</span>
          <span className="lang-vi">{day.titleVi}</span>
        </p>
        <p className={cn(
          'mt-0.5 text-xs line-clamp-2',
          isLocked ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'
        )}>
          {isLocked
            ? (
              <>
                <span className="lang-en">Complete previous lessons to unlock</span>
                <span className="lang-vi">Hoàn thành bài trước để mở khóa</span>
              </>
            ) : (
              <>
                <span className="lang-en">{day.blurb}</span>
                <span className="lang-vi">{day.blurbVi}</span>
              </>
            )
          }
        </p>
        {!isLocked && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {day.estMinutes}m
            </span>
            {day.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="default" className="text-xs px-1.5 py-0">{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </>
  )

  if (isLocked) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 cursor-not-allowed select-none dark:border-gray-800 dark:bg-gray-900/30">
        {content}
      </div>
    )
  }

  return (
    <Link
      href={`/day/${day.id}`}
      className={cn(
        'group flex items-start gap-3 rounded-xl border p-3 transition-all hover:shadow-sm',
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20'
          : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-700 dark:hover:bg-brand-950/20'
      )}
    >
      {content}
    </Link>
  )
}
