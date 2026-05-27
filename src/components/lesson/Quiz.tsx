'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, HelpCircle, Star } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useProgressStore } from '@/lib/store'

export interface QuizQuestion {
  q: string
  qVi?: string
  choices: string[]
  choicesVi?: string[]
  answer: number
  explain: string
  explainVi?: string
}

interface QuizProps {
  questions: QuizQuestion[]
}

const PTS_PER_CORRECT = 5

export function Quiz({ questions }: QuizProps) {
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [pointsEarned, setPointsEarned] = useState<number | null>(null)

  const pathname = usePathname()
  const dayId = Number(pathname?.split('/').at(-1)) || 0

  const { language, quizPointsEarned, addPoints, markQuizPointsEarned } = useProgressStore()

  const allAnswered = questions.every((_, i) => selected[i] !== undefined)
  const alreadyEarned = dayId > 0 && !!quizPointsEarned[dayId]

  const handleSubmit = () => {
    setSubmitted(true)

    // Award points only on the very first submission per day
    if (dayId > 0 && !alreadyEarned) {
      const correct = questions.filter((q, i) => selected[i] === q.answer).length
      const earned = correct * PTS_PER_CORRECT
      if (earned > 0) addPoints(earned)
      markQuizPointsEarned(dayId)
      setPointsEarned(earned)
    }
  }

  const reset = () => {
    setSelected({})
    setSubmitted(false)
    // pointsEarned intentionally kept — banner already showed once
  }

  return (
    <div className="my-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <HelpCircle className="h-4 w-4 text-brand-500" />
        <span className="lang-en">Quick Quiz</span>
        <span className="lang-vi">Câu hỏi nhanh</span>
        <span className="ml-auto text-xs font-normal text-gray-400 dark:text-gray-500">
          {PTS_PER_CORRECT} pts / correct answer
        </span>
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => {
          const userAnswer = selected[qi]
          const isCorrect = submitted && userAnswer === q.answer
          const displayQ = language === 'vi' && q.qVi ? q.qVi : q.q
          const displayChoices = language === 'vi' && q.choicesVi ? q.choicesVi : q.choices
          const displayExplain = language === 'vi' && q.explainVi ? q.explainVi : q.explain

          return (
            <div key={qi}>
              <p className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                {qi + 1}. {displayQ}
              </p>
              <ul className="space-y-2">
                {displayChoices.map((choice, ci) => {
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
                  <span>{displayExplain}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!allAnswered} size="sm">
            <span className="lang-en">Submit Answers</span>
            <span className="lang-vi">Nộp bài</span>
          </Button>
        ) : (
          <Button onClick={reset} variant="secondary" size="sm">
            <span className="lang-en">Try Again</span>
            <span className="lang-vi">Thử lại</span>
          </Button>
        )}

        {/* Points banner — shown once after first submission */}
        {submitted && pointsEarned !== null && (
          <div className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            pointsEarned > 0
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}>
            <Star className="h-3.5 w-3.5" />
            {pointsEarned > 0
              ? <><span className="lang-en">+{pointsEarned} pts earned!</span><span className="lang-vi">+{pointsEarned} điểm!</span></>
              : <><span className="lang-en">0 pts — try again to improve</span><span className="lang-vi">0 điểm — thử lại để cải thiện</span></>
            }
          </div>
        )}

        {/* Already-earned notice on retry attempts */}
        {submitted && pointsEarned === null && alreadyEarned && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            <span className="lang-en">Points already earned for this session</span>
            <span className="lang-vi">Điểm đã được tính cho buổi này</span>
          </span>
        )}
      </div>
    </div>
  )
}
