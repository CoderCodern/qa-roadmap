'use client'

import { ReactNode, isValidElement, Children, useState } from 'react'
import { CheckSquare2, Square, Dumbbell, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useProgressStore } from '@/lib/store'

interface ExerciseBoxProps {
  children: ReactNode
}

type REl = React.ReactElement<{ children?: ReactNode; className?: string }>

function extractItems(node: ReactNode): ReactNode[] {
  const items: ReactNode[] = []
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return
    const el = child as REl
    if (el.type === 'ul' || el.type === 'ol') {
      Children.forEach(el.props.children, (li) => {
        if (isValidElement(li) && (li as REl).type === 'li') {
          const liEl = li as REl
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

function nodeToText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(nodeToText).join(' ')
  if (isValidElement(node)) {
    const el = node as REl
    // Skip lang-vi spans — send English content to the AI prompt
    if (el.props.className?.includes('lang-vi')) return ''
    return nodeToText(el.props.children)
  }
  return ''
}

export function ExerciseBox({ children }: ExerciseBoxProps) {
  const items = extractItems(children)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pathname = usePathname()
  const dayId = Number(pathname?.split('/').at(-1)) || 0

  const { language, aiAnswers, aiHintUsed, setAiAnswer, markAiHintUsed } = useProgressStore()
  const hintUsed = dayId > 0 && !!aiHintUsed[dayId]
  const savedAnswer = dayId > 0 ? aiAnswers[dayId] : undefined

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const handleAiHint = async () => {
    if (hintUsed || loading || !dayId) return
    setLoading(true)
    setError(null)
    try {
      const itemTexts = items.map((item) => nodeToText(item)).filter(Boolean)
      const res = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, items: itemTexts, language }),
      })
      if (!res.ok) throw new Error('API error')
      const data: { answer?: string; error?: string } = await res.json()
      if (data.answer) {
        setAiAnswer(dayId, data.answer)
        markAiHintUsed(dayId)
        setShowAnswer(true)
      } else {
        throw new Error(data.error ?? 'Empty response')
      }
    } catch {
      setError(
        language === 'vi'
          ? 'Không thể lấy gợi ý. Vui lòng thử lại sau.'
          : 'Could not get AI hint. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  const containerClass =
    'my-6 rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-700 dark:bg-brand-950/40'
  const headerClass =
    'mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300'

  if (items.length === 0) {
    return (
      <div className={containerClass}>
        <div className={headerClass}>
          <Dumbbell className="h-4 w-4" />
          <span className="lang-en">Exercise</span>
          <span className="lang-vi">Bài tập</span>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <div className={headerClass}>
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
            <span className={cn(
              checked.has(i) ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'
            )}>
              {item}
            </span>
          </li>
        ))}
      </ul>

      {/* AI Hint section */}
      <div className="mt-4 border-t border-brand-100 pt-4 dark:border-brand-800/60">
        {!hintUsed ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAiHint}
              disabled={loading}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                'bg-violet-100 text-violet-700 hover:bg-violet-200',
                'dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60',
                loading && 'cursor-wait opacity-70'
              )}
            >
              {loading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Sparkles className="h-3.5 w-3.5" />
              }
              <span className="lang-en">{loading ? 'Generating…' : 'Get AI Hint'}</span>
              <span className="lang-vi">{loading ? 'Đang tạo…' : 'Gợi ý AI'}</span>
            </button>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              <span className="lang-en">1 use per lesson · answer saved for reference</span>
              <span className="lang-vi">1 lần mỗi bài · câu trả lời được lưu lại</span>
            </span>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer((s) => !s)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 transition-colors hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-200"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="lang-en">AI Example Answer</span>
            <span className="lang-vi">Đáp án mẫu AI</span>
            {showAnswer
              ? <ChevronUp className="h-3.5 w-3.5" />
              : <ChevronDown className="h-3.5 w-3.5" />
            }
          </button>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>
        )}

        {savedAnswer && showAnswer && (
          <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800/40 dark:bg-violet-950/20">
            <p className="mb-2 text-xs font-semibold text-violet-600 dark:text-violet-400">
              <span className="lang-en">AI-generated example — use as inspiration, not a copy</span>
              <span className="lang-vi">Ví dụ do AI tạo — dùng làm gợi ý, không sao chép</span>
            </p>
            <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {savedAnswer}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
