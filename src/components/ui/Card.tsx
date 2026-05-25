import { HTMLAttributes, ElementType } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

export function Card({
  as: Tag = 'div',
  hover = false,
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900',
        paddingClasses[padding],
        hover && 'transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
