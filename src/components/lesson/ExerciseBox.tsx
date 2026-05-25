'use client'

import { ReactNode, isValidElement, Children, useState } from 'react'
import { CheckSquare2, Square, Dumbbell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExerciseBoxProps {
  children: ReactNode
}

type REl = React.ReactElement<{ children?: ReactNode }>

function extractItems(node: ReactNode): ReactNode[] {
  const items: ReactNode[] = []
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return
    const el = child as REl
    if (el.type === 'ul' || el.type === 'ol') {
      // MDX task lists render as <ul><li>...</li></ul> via remark-gfm
      Children.forEach(el.props.children, (li) => {
        if (isValidElement(li) && (li as REl).type === 'li') {
          const liEl = li as REl
          // Filter out the disabled <input> checkbox remark-gfm inserts for `- [ ]`
          const content = Children.toArray(liEl.props.children).filter(
            (c) => !(isValidElement(c) && (c as REl).type === 'input')
          )
          items.push(content.length === 1 ? content[0] : content)
        }
      })
    } else if (el.type === 'li') {
      const content = Children.toArray(el.props.children).filter(
        (c) => !(isValidElement(c) && (c as REl).type === 'input')
      )
      items.push(content.length === 1 ? content[0] : content)
    }
  })
  return items
}

export function ExerciseBox({ children }: ExerciseBoxProps) {
  const items = extractItems(children)
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  if (items.length === 0) {
    return (
      <div className="my-6 rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-800 dark:bg-brand-950/20">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
          <Dumbbell className="h-4 w-4" />
          <span className="lang-en">Exercise</span>
          <span className="lang-vi">Bài tập</span>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
      </div>
    )
  }

  return (
    <div className="my-6 rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-800 dark:bg-brand-950/20">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
        <Dumbbell className="h-4 w-4" />
        <span className="lang-en">Exercise</span>
        <span className="lang-vi">Bài tập</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex cursor-pointer items-start gap-2.5 text-sm"
            onClick={() => toggle(i)}
          >
            {checked.has(i)
              ? <CheckSquare2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              : <Square className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            }
            <span className={cn(checked.has(i) ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300')}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
