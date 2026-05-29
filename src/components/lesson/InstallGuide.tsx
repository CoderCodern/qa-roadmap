'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  CheckSquare2, Square, Copy, Check, Terminal,
  Sparkles, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgressStore } from '@/lib/store'

interface SubStep {
  text: string
  textVi: string
  cmd?: string
}

interface InstallStep {
  title: string
  titleVi: string
  substeps: SubStep[]
}

interface InstallGuideProps {
  steps: InstallStep[]
}

function normalizeLang(val: unknown): string | undefined {
  if (!val) return undefined
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    return Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => `${k}:\n${v}`)
      .join('\n\n')
  }
  return String(val)
}

export function InstallGuide({ steps }: InstallGuideProps) {
  const [done, setDone] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [verifyOutput, setVerifyOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pathname = usePathname()
  const dayId = Number(pathname?.split('/').at(-1)) || 0
  const { language, aiAnswers, aiHintUsed, setAiAnswer, markAiHintUsed, addPoints } = useProgressStore()

  const hintUsed = dayId > 0 && !!aiHintUsed[dayId]
  const savedBilingual = dayId > 0 ? aiAnswers[dayId] : undefined
  const rawLang = savedBilingual
    ? ((language === 'vi' ? savedBilingual.vi : savedBilingual.en) as unknown)
    : undefined
  const savedAnswer = normalizeLang(rawLang)

  const allDone = done.size === steps.length

  const toggleDone = (i: number) => {
    if (hintUsed) return
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const copyCmd = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd)
      setCopied(cmd)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // clipboard not available — silently ignore
    }
  }

  const handleSubmit = async () => {
    if (hintUsed || loading || !dayId) return
    setLoading(true)
    setError(null)
    try {
      const items = steps.map((s) => s.title)
      const userAnswers = steps.map((_, i) =>
        i === steps.length - 1 && verifyOutput.trim()
          ? verifyOutput.trim()
          : '(step completed)'
      )
      const res = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, items, userAnswers }),
      })
      if (!res.ok) throw new Error('API error')
      const data: { answer?: { en: string; vi: string }; error?: string } = await res.json()
      if (data.answer) {
        setAiAnswer(dayId, data.answer)
        markAiHintUsed(dayId)
        addPoints(steps.length * 5)
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

  return (
    <div className="my-6 rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-700 dark:bg-brand-950/40">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
        <Terminal className="h-4 w-4" />
        <span className="lang-en">Setup Guide</span>
        <span className="lang-vi">Hướng dẫn cài đặt</span>
        <span className="ml-auto text-xs font-normal text-gray-400">
          {done.size}/{steps.length}
          <span className="lang-en"> steps done</span>
          <span className="lang-vi"> bước hoàn thành</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${(done.size / steps.length) * 100}%` }}
        />
      </div>

      {/* Step cards */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isDone = done.has(i)
          return (
            <div
              key={i}
              className={cn(
                'overflow-hidden rounded-xl border transition-all',
                isDone
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/60'
              )}
            >
              {/* Step title row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}
                >
                  {isDone ? '✓' : i + 1}
                </span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {language === 'vi' ? step.titleVi : step.title}
                </p>
              </div>

              {/* Sub-steps */}
              <div className="border-t border-gray-100 px-4 pb-3 pt-3 dark:border-gray-700/60">
                <ul className="space-y-3">
                  {step.substeps.map((sub, j) => (
                    <li key={j} className="space-y-1.5">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="mr-1.5 font-mono text-xs text-gray-400">{j + 1}.</span>
                        {language === 'vi' ? sub.textVi : sub.text}
                      </p>
                      {sub.cmd && (
                        <div className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 dark:bg-black/60">
                          <code className="flex-1 overflow-x-auto font-mono text-xs text-green-400">
                            {sub.cmd}
                          </code>
                          <button
                            onClick={() => copyCmd(sub.cmd!)}
                            title="Copy command"
                            className="shrink-0 rounded p-1 text-gray-500 transition-colors hover:text-gray-300"
                          >
                            {copied === sub.cmd
                              ? <Check className="h-3.5 w-3.5 text-emerald-400" />
                              : <Copy className="h-3.5 w-3.5" />
                            }
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Mark done */}
                <button
                  onClick={() => toggleDone(i)}
                  disabled={hintUsed}
                  className={cn(
                    'mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    isDone
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600',
                    hintUsed && 'cursor-default opacity-60'
                  )}
                >
                  {isDone
                    ? <><CheckSquare2 className="h-3.5 w-3.5" /><span className="lang-en">Done</span><span className="lang-vi">Xong</span></>
                    : <><Square className="h-3.5 w-3.5" /><span className="lang-en">Mark as done</span><span className="lang-vi">Đánh dấu hoàn thành</span></>
                  }
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI review section */}
      <div className="mt-5 border-t border-brand-100 pt-4 dark:border-brand-800/60">
        {!hintUsed && (
          <div className="space-y-2">
            {allDone ? (
              <>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">
                  <span className="lang-en">
                    Paste your{' '}
                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">
                      python --version
                    </code>{' '}
                    output to confirm your setup (optional):
                  </span>
                  <span className="lang-vi">
                    Dán kết quả{' '}
                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">
                      python --version
                    </code>{' '}
                    để xác nhận cài đặt (tuỳ chọn):
                  </span>
                </label>
                <textarea
                  value={verifyOutput}
                  onChange={(e) => setVerifyOutput(e.target.value)}
                  placeholder="Python 3.11.x"
                  rows={2}
                  className={cn(
                    'w-full resize-none rounded-lg border px-3 py-2 font-mono text-sm transition-colors',
                    'border-amber-200 bg-[#fdfbf5] text-gray-700 placeholder-gray-400',
                    'dark:border-gray-700 dark:bg-[#1a1f16] dark:text-gray-300 dark:placeholder-gray-600',
                    'focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50',
                    'dark:focus:border-emerald-700 dark:focus:ring-emerald-700/40',
                  )}
                />
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
                  <span className="lang-en">1 review per lesson · leave blank to get example feedback</span>
                  <span className="lang-vi">1 lần mỗi bài · để trống để nhận phản hồi mẫu</span>
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                <span className="lang-en">Complete all {steps.length} steps above to unlock AI review</span>
                <span className="lang-vi">Hoàn thành cả {steps.length} bước trên để mở AI review</span>
              </p>
            )}
          </div>
        )}

        {hintUsed && (
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
