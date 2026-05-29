'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, ReactNode } from 'react'
import { Play, RotateCcw, Loader2, Sparkles, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useProgressStore } from '@/lib/store'

const CodeMirrorEditor = dynamic(
  async () => {
    const { default: CodeMirror } = await import('@uiw/react-codemirror')
    const { python } = await import('@codemirror/lang-python')
    function Editor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
      return (
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[python()]}
          theme="dark"
          basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLineGutter: false }}
          style={{ fontSize: 13 }}
        />
      )
    }
    return Editor
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 items-center justify-center bg-[#282c34] text-xs text-gray-500">
        Loading editor…
      </div>
    ),
  }
)

type PyodideInterface = { runPython: (code: string) => unknown }

declare global {
  interface Window {
    loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface>
    _pyodideInstance?: PyodideInterface
    _pyodideLoading?: Promise<PyodideInterface>
  }
}

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'

async function getPyodide(): Promise<PyodideInterface> {
  if (window._pyodideInstance) return window._pyodideInstance
  if (window._pyodideLoading) return window._pyodideLoading

  if (!document.querySelector(`script[src="${PYODIDE_CDN}pyodide.js"]`)) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = `${PYODIDE_CDN}pyodide.js`
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load Pyodide'))
      document.head.appendChild(s)
    })
  }

  window._pyodideLoading = window.loadPyodide({ indexURL: PYODIDE_CDN }).then((py) => {
    window._pyodideInstance = py
    return py
  })

  return window._pyodideLoading
}

interface Exercise {
  title: string
  code: string
}

interface EditorState {
  code: string
  output: string | null
  error: string | null
  running: boolean
  pyodideLoading: boolean
}

interface CodeExerciseGroupProps {
  exercises: Exercise[]
  children?: ReactNode
  pointsPerExercise?: number
}

export function CodeExerciseGroup({ exercises, children, pointsPerExercise = 5 }: CodeExerciseGroupProps) {
  const pathname = usePathname()
  const dayId = Number(pathname?.split('/').at(-1)) || 0

  const { language, aiAnswers, aiHintUsed, setAiAnswer, markAiHintUsed, addPoints } = useProgressStore()

  const [editors, setEditors] = useState<EditorState[]>(
    exercises.map((ex) => ({
      code: ex.code.trim(),
      output: null,
      error: null,
      running: false,
      pyodideLoading: false,
    }))
  )

  // Ref keeps runCode from going stale without re-creating on every render
  const editorsRef = useRef(editors)
  editorsRef.current = editors

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

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

  const patchEditor = (i: number, patch: Partial<EditorState>) =>
    setEditors((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))

  const runCode = async (i: number) => {
    if (editorsRef.current[i].running) return
    const code = editorsRef.current[i].code
    patchEditor(i, { running: true, output: null, error: null })

    let py: PyodideInterface
    try {
      if (!window._pyodideInstance) patchEditor(i, { pyodideLoading: true })
      py = await getPyodide()
      patchEditor(i, { pyodideLoading: false })
    } catch {
      patchEditor(i, {
        error: 'Could not load Python runtime. Check your internet connection.',
        running: false,
        pyodideLoading: false,
      })
      return
    }

    try {
      py.runPython(`
import sys, io
__buf = io.StringIO()
__old_stdout = sys.stdout
sys.stdout = __buf
`)
      py.runPython(code)
      const out = py.runPython(`
sys.stdout = __old_stdout
__buf.getvalue()
`)
      patchEditor(i, { output: String(out) || '(no output)', running: false })
    } catch (err) {
      try { py.runPython(`sys.stdout = __old_stdout`) } catch { /* ignore */ }
      patchEditor(i, { error: String(err), running: false })
    }
  }

  const resetCode = (i: number) =>
    setEditors((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, code: exercises[i].code.trim(), output: null, error: null } : s
      )
    )

  const handleAiSubmit = async () => {
    if (hintUsed || aiLoading || !dayId) return
    setAiLoading(true)
    setAiError(null)
    try {
      const items = exercises.map((ex) => ex.title)
      const userAnswers = editorsRef.current.map((s) => s.code)
      const res = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, items, userAnswers, isCode: true }),
      })
      if (!res.ok) throw new Error('API error')
      const data: { answer?: { en: string; vi: string }; error?: string } = await res.json()
      if (data.answer) {
        setAiAnswer(dayId, data.answer)
        markAiHintUsed(dayId)
        addPoints(exercises.length * pointsPerExercise)
        setShowAnswer(true)
      } else {
        throw new Error(data.error ?? 'Empty response')
      }
    } catch {
      setAiError(
        language === 'vi'
          ? 'Không thể gửi bài. Vui lòng thử lại sau.'
          : 'Could not submit. Please try again later.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="my-6 rounded-xl border border-brand-200 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-950/40">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 dark:border-brand-800/60 dark:text-brand-300">
        <Dumbbell className="h-4 w-4" />
        <span className="lang-en">Exercise</span>
        <span className="lang-vi">Bài tập</span>
      </div>

      {/* Bilingual intro from children */}
      {children && (
        <div className="px-5 pb-2 pt-4 text-sm text-gray-700 dark:text-gray-300">{children}</div>
      )}

      {/* Code editors */}
      <div className="space-y-6 px-5 py-4">
        {exercises.map((ex, i) => {
          const state = editors[i]
          return (
            <div key={i} className="space-y-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{ex.title}</p>

              <div className="overflow-hidden rounded-xl border border-gray-700 bg-[#282c34]">
                <CodeMirrorEditor
                  value={state.code}
                  onChange={(v) => patchEditor(i, { code: v })}
                />

                {/* Toolbar */}
                <div className="flex items-center gap-3 border-t border-gray-700 bg-gray-900/80 px-4 py-2">
                  <button
                    onClick={() => runCode(i)}
                    disabled={state.running}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                      'bg-emerald-600 text-white hover:bg-emerald-500',
                      state.running && 'cursor-wait opacity-60'
                    )}
                  >
                    {state.running
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Play className="h-3.5 w-3.5" />
                    }
                    {state.pyodideLoading ? 'Loading Python…' : state.running ? 'Running…' : 'Run'}
                  </button>

                  <button
                    onClick={() => resetCode(i)}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-200"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>

                  {state.pyodideLoading && (
                    <span className="text-xs text-yellow-400">First run downloads ~6 MB…</span>
                  )}

                  <span className="ml-auto text-xs text-gray-600">Python 3.11 · Pyodide</span>
                </div>

                {/* Output panel */}
                {(state.output !== null || state.error) && (
                  <div
                    className={cn(
                      'border-t px-4 py-3 font-mono text-xs',
                      state.error
                        ? 'border-red-900 bg-red-950/40 text-red-400'
                        : 'border-gray-700 bg-black/60 text-green-400'
                    )}
                  >
                    <div className="mb-1 text-xs font-semibold text-gray-500">
                      {state.error ? '✗ Error' : '▸ Output'}
                    </div>
                    <pre className="whitespace-pre-wrap break-words">{state.error || state.output}</pre>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Single AI review section for all exercises */}
      <div className="border-t border-brand-100 px-5 py-4 dark:border-brand-800/60">
        {!hintUsed ? (
          <div className="space-y-2">
            <button
              onClick={handleAiSubmit}
              disabled={aiLoading}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                'bg-violet-100 text-violet-700 hover:bg-violet-200',
                'dark:bg-violet-900/40 dark:text-violet-300 dark:hover:bg-violet-900/60',
                aiLoading && 'cursor-wait opacity-70'
              )}
            >
              {aiLoading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Sparkles className="h-3.5 w-3.5" />
              }
              <span className="lang-en">{aiLoading ? 'Reviewing…' : 'Submit All for AI Review'}</span>
              <span className="lang-vi">{aiLoading ? 'Đang xem xét…' : 'Nộp tất cả để AI kiểm tra'}</span>
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              <span className="lang-en">1 review per lesson · edit the code or leave as starter to get sample solutions</span>
              <span className="lang-vi">1 lần mỗi bài · chỉnh sửa code hoặc để nguyên để nhận giải pháp mẫu</span>
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
            {showAnswer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}

        {aiError && (
          <p className="mt-2 text-xs text-red-500 dark:text-red-400">{aiError}</p>
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
