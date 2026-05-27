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

function extractItems(node: ReactNode, lang?: string): ReactNode[] {
  const items: ReactNode[] = []
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return
    const el = child as REl
    if (el.type === 'div' && typeof el.props.className === 'string') {
      const cls = el.props.className
      if (cls === 'lang-en' || cls === 'lang-vi') {
        if (!lang || cls === `lang-${lang}`) {
          items.push(...extractItems(el.props.children, lang))
        }
        return
      }
    }
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
    if (el.props.className?.includes('lang-vi')) return ''
    return nodeToText(el.props.children)
  }
  return ''
}

export function ExerciseBox({ children }: ExerciseBoxProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [answers, setAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pathname = usePathname()
  const dayId = Number(pathname?.split('/').at(-1)) || 0

  const { language, aiAnswers, aiHintUsed, setAiAnswer, markAiHintUsed, addPoints } = useProgressStore()
  const items = extractItems(children, language)
  const hintUsed = dayId > 0 && !!aiHintUsed[dayId]
  const savedBilingual = dayId > 0 ? aiAnswers[dayId] : undefined

  const normalizeLang = (val: unknown): string | undefined => {
    if (!val) return undefined
    if (typeof val === 'string') return val
    if (typeof val === 'object') {
      return Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => `${k}:\n${v}`)
        .join('\n\n')
    }
    return String(val)
  }

  const rawLang = savedBilingual
    ? ((language === 'vi' ? savedBilingual.vi : savedBilingual.en) as unknown)
    : undefined
  const savedAnswer = normalizeLang(rawLang)

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const setAnswer = (i: number, value: string) =>
    setAnswers((prev) => {
      const next = [...prev]
      next[i] = value
      return next
    })

  const handleSubmit = async () => {
    if (hintUsed || loading || !dayId) return
    setLoading(true)
    setError(null)
    try {
      const itemTexts = items.map((item) => nodeToText(item)).filter(Boolean)
      const userAnswers = items.map((_, i) => (answers[i] ?? '').trim())
      const res = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, items: itemTexts, userAnswers }),
      })
      if (!res.ok) throw new Error('API error')
      const data: { answer?: { en: string; vi: string }; error?: string } = await res.json()
      if (data.answer) {
        setAiAnswer(dayId, data.answer)
        markAiHintUsed(dayId)
        addPoints(items.length * 5)
        setShowAnswer(true)
      } else {
        throw new Error(data.error ?? 'Empty response')
      }
    } catch {
      setError(
        language === 'vi'
          ? 'Không thể gửi bài. Vui lòng thử lại sau.'
          : 'Could not submit. Please try again later.'
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

      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="space-y-1.5">
            <div
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
            </div>

            <div className="pl-6">
              <textarea
                value={answers[i] ?? ''}
                onChange={(e) => !hintUsed && setAnswer(i, e.target.value)}
                readOnly={hintUsed}
                placeholder={
                  hintUsed
                    ? (language === 'vi' ? '(đã nộp)' : '(submitted)')
                    : (language === 'vi' ? 'Viết câu trả lời của bạn…' : 'Write your answer…')
                }
                rows={2}
                className={cn(
                  'w-full resize-none rounded-lg border px-3 py-2 text-sm transition-colors',
                  hintUsed
                    ? 'border-gray-100 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-600'
                    : [
                        'border-gray-200 bg-white text-gray-700 placeholder-gray-400',
                        'dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300 dark:placeholder-gray-600',
                        'focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400/50',
                        'dark:focus:border-brand-500 dark:focus:ring-brand-500/40',
                      ]
                )}
              />
            </div>
          </li>
        ))}
      </ul>

      {/* Submit / AI feedback section */}
      <div className="mt-4 border-t border-brand-100 pt-4 dark:border-brand-800/60">
        {!hintUsed ? (
          <div className="space-y-2">
            <button
              onClick={handleSubmit}
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
              <span className="lang-en">{loading ? 'Reviewing…' : 'Submit for AI Review'}</span>
              <span className="lang-vi">{loading ? 'Đang xem xét…' : 'Gửi để AI kiểm tra'}</span>
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              <span className="lang-en">1 review per lesson · leave blank to get example answers</span>
              <span className="lang-vi">1 lần mỗi bài · để trống để nhận đáp án mẫu</span>
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer((s) => !s)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 transition-colors hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-200"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="lang-en">AI Feedback</span>
            <span className="lang-vi">Phản hồi AI</span>
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
              <span className="lang-en">AI Review · use as guidance, not a definitive answer</span>
              <span className="lang-vi">Đánh giá AI · dùng làm hướng dẫn, không phải câu trả lời dứt khoát</span>
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
