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
  /** True after localStorage has been rehydrated; used to avoid pre-hydration lock flicker. */
  hydrated: boolean
  toggleDay: (id: number) => void
  setLanguage: (lang: Language) => void
  setHydrated: () => void
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
      hydrated: false,

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
      }),
    }
  )
)
