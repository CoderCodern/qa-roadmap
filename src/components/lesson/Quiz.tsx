'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface QuizQuestion {
  q: string
  choices: string[]
  answer: number
  explain: string
}

interface QuizProps {
  questions: QuizQuestion[]
}

export function Quiz({ questions }: QuizProps) {
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = questions.every((_, i) => selected[i] !== undefined)

  const reset = () => {
    setSelected({})
    setSubmitted(false)
  }

  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <HelpCircle className="h-4 w-4 text-brand-500" />
        <span className="lang-en">Quick Quiz</span>
        <span className="lang-vi">Câu hỏi nhanh</span>
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => {
          const userAnswer = selected[qi]
          const isCorrect = submitted && userAnswer === q.answer

          return (
            <div key={qi}>
              <p className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                {qi + 1}. {q.q}
              </p>
              <ul className="space-y-2">
                {q.choices.map((choice, ci) => {
                  const isSelected = userAnswer === ci
                  const isCorrectChoice = submitted && ci === q.answer
                  const isWrongChoice = submitted && isSelected && ci !== q.answer

                  return (
                    <li key={ci}>
                      <button
                        onClick={() => !submitted && setSelected((s) => ({ ...s, [qi]: ci }))}
                        disabled={submitted}
                        className={cn(
                          'w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors',
                          !submitted && !isSelected && 'border-gray-200 hover:border-brand-300 hover:bg-brand-50 dark:border-gray-700 dark:hover:border-brand-500 dark:hover:bg-brand-950/40',
                          !submitted && isSelected && 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-400 dark:bg-brand-700/50 dark:text-brand-100',
                          isCorrectChoice && 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-900/50 dark:text-emerald-100',
                          isWrongChoice && 'border-red-400 bg-red-50 text-red-800 dark:border-red-500 dark:bg-red-900/50 dark:text-red-100',
                        )}
                      >
                        {choice}
                      </button>
                    </li>
                  )
                })}
              </ul>
              {submitted && (
                <div className={cn(
                  'mt-3 flex items-start gap-2 rounded-lg p-3 text-sm',
                  isCorrect ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
                )}>
                  {isCorrect
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                  <span>{q.explain}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex gap-3">
        {!submitted ? (
          <Button onClick={() => setSubmitted(true)} disabled={!allAnswered} size="sm">
            <span className="lang-en">Submit Answers</span>
            <span className="lang-vi">Nộp bài</span>
          </Button>
        ) : (
          <Button onClick={reset} variant="secondary" size="sm">
            <span className="lang-en">Try Again</span>
            <span className="lang-vi">Thử lại</span>
          </Button>
        )}
      </div>
    </div>
  )
}
