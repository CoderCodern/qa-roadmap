import { ReactNode } from 'react'
import { Lightbulb, AlertTriangle, Info, AlertOctagon } from 'lucide-react'
import { cn } from '@/lib/utils'

type CalloutType = 'tip' | 'warning' | 'note' | 'danger'

interface CalloutProps {
  type?: CalloutType
  children: ReactNode
}

const config: Record<CalloutType, { icon: typeof Lightbulb; classes: string; labelEn: string; labelVi: string }> = {
  tip: {
    icon: Lightbulb,
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100',
    labelEn: 'Tip',
    labelVi: 'Mẹo',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-100',
    labelEn: 'Warning',
    labelVi: 'Lưu ý',
  },
  note: {
    icon: Info,
    classes: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100',
    labelEn: 'Note',
    labelVi: 'Ghi chú',
  },
  danger: {
    icon: AlertOctagon,
    classes: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100',
    labelEn: 'Danger',
    labelVi: 'Nguy hiểm',
  },
}

export function Callout({ type = 'note', children }: CalloutProps) {
  const { icon: Icon, classes, labelEn, labelVi } = config[type]
  return (
    <aside className={cn('my-6 flex gap-3 rounded-xl border p-4', classes)}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1 text-sm leading-relaxed">
        <div className="mb-1 font-semibold">
          <span className="lang-en">{labelEn}</span>
          <span className="lang-vi">{labelVi}</span>
        </div>
        {children}
      </div>
    </aside>
  )
}
