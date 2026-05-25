'use client'

import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children, className, ...props }: TooltipProps) {
  return (
    <div className={cn('group relative inline-flex', className)} {...props}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2',
          'whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-xs text-white dark:bg-gray-700',
          'opacity-0 transition-opacity group-hover:opacity-100'
        )}
      >
        {content}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
      </span>
    </div>
  )
}
