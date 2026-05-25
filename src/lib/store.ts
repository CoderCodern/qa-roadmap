'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { todayKey, isYesterday, isToday } from '@/lib/date'

export type Language = 'en' | 'vi'

export type ProgressState = {
  completed: number[]
  completedDates: Record<number, string>
  lastCompletedDate: string | null
  streak: number
  longestStreak: number
  language: Language
  /** AI-generated bilingual answers keyed by dayId — saved after first use. */
  aiAnswers: Record<number, { en: string; vi: string }>
  /** Tracks which days have consumed their one AI review. */
  aiHintUsed: Record<number, boolean>
  /** True after localStorage has been rehydrated; used to avoid pre-hydration lock flicker. */
  hydrated: boolean
  /** Developer preview mode — bypasses the available gate so unpublished days are accessible. */
  devPreview: boolean
  toggleDay: (id: number) => void
  setLanguage: (lang: Language) => void
  setHydrated: () => void
  setDevPreview: (val: boolean) => void
  setAiAnswer: (dayId: number, answer: { en: string; vi: string }) => void
  markAiHintUsed: (dayId: number) => void
  reset: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: [],
      completedDates: {},
      lastCompletedDate: null,
      streak: 0,
      longestStreak: 0,
      language: 'en',
      aiAnswers: {},
      aiHintUsed: {},
      hydrated: false,
      devPreview: false,

      toggleDay: (id) => {
        const state = get()
        const isCompleted = state.completed.includes(id)

        if (isCompleted) {
          const restDates = Object.fromEntries(
            Object.entries(state.completedDates).filter(([k]) => Number(k) !== id)
          )
          set({
            completed: state.completed.filter((d) => d !== id),
            completedDates: restDates,
          })
          return
        }

        const today = todayKey()
        const last = state.lastCompletedDate

        let newStreak: number
        if (!last || isToday(last)) {
          newStreak = last && isToday(last) ? state.streak : 1
        } else if (isYesterday(last)) {
          newStreak = state.streak + 1
        } else {
          newStreak = 1
        }

        const newLongest = Math.max(state.longestStreak, newStreak)

        set({
          completed: [...state.completed, id],
          completedDates: { ...state.completedDates, [id]: today },
          lastCompletedDate: today,
          streak: newStreak,
          longestStreak: newLongest,
        })
      },

      setLanguage: (lang) => set({ language: lang }),

      setHydrated: () => set({ hydrated: true }),

      setDevPreview: (val) => set({ devPreview: val }),

      setAiAnswer: (dayId, answer) =>
        set((s) => ({ aiAnswers: { ...s.aiAnswers, [dayId]: answer } })),

      markAiHintUsed: (dayId) =>
        set((s) => ({ aiHintUsed: { ...s.aiHintUsed, [dayId]: true } })),

      reset: () =>
        set({
          completed: [],
          completedDates: {},
          lastCompletedDate: null,
          streak: 0,
          longestStreak: 0,
        }),
    }),
    {
      name: 'qa-roadmap-progress',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        completed: s.completed,
        completedDates: s.completedDates,
        lastCompletedDate: s.lastCompletedDate,
        streak: s.streak,
        longestStreak: s.longestStreak,
        language: s.language,
        aiAnswers: s.aiAnswers,
        aiHintUsed: s.aiHintUsed,
      }),
    }
  )
)
