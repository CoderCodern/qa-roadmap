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
  /** Accumulated XP points. */
  totalPoints: number
  /** Tracks which days have already had their quiz points awarded (one-time per day). */
  quizPointsEarned: Record<number, boolean>
  /** Dates (YYYY-MM-DD) on which streak bonus points were already awarded. */
  streakPointsDates: string[]
  /** Product IDs that have been redeemed from the shop. */
  purchasedItems: number[]
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
  addPoints: (pts: number) => void
  markQuizPointsEarned: (dayId: number) => void
  /** Deducts pts and records purchase. Returns false if not enough points. */
  spendPoints: (pts: number, productId: number) => boolean
  /** Phase reward status — absent key means the reward is pending for that phase. */
  phaseRewards: Record<number, 'claimed' | 'declined'>
  /** Awards the product for free and marks phase reward as claimed. */
  claimPhaseReward: (phaseId: number, productId: number) => void
  /** Marks phase reward as declined (user explicitly skipped). */
  declinePhaseReward: (phaseId: number) => void
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
      totalPoints: 0,
      quizPointsEarned: {},
      streakPointsDates: [],
      purchasedItems: [],
      phaseRewards: {},
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

        // Award 5 streak pts once per calendar day
        const alreadyAwardedToday = state.streakPointsDates.includes(today)
        const streakPtsEarned = alreadyAwardedToday ? 0 : 5

        set({
          completed: [...state.completed, id],
          completedDates: { ...state.completedDates, [id]: today },
          lastCompletedDate: today,
          streak: newStreak,
          longestStreak: newLongest,
          totalPoints: state.totalPoints + streakPtsEarned,
          streakPointsDates: alreadyAwardedToday
            ? state.streakPointsDates
            : [...state.streakPointsDates, today],
        })
      },

      setLanguage: (lang) => set({ language: lang }),

      setHydrated: () => set({ hydrated: true }),

      setDevPreview: (val) => set({ devPreview: val }),

      setAiAnswer: (dayId, answer) =>
        set((s) => ({ aiAnswers: { ...s.aiAnswers, [dayId]: answer } })),

      markAiHintUsed: (dayId) =>
        set((s) => ({ aiHintUsed: { ...s.aiHintUsed, [dayId]: true } })),

      addPoints: (pts) => set((s) => ({ totalPoints: s.totalPoints + pts })),

      markQuizPointsEarned: (dayId) =>
        set((s) => ({ quizPointsEarned: { ...s.quizPointsEarned, [dayId]: true } })),

      spendPoints: (pts, productId) => {
        const s = get()
        if (s.totalPoints < pts) return false
        set({
          totalPoints: s.totalPoints - pts,
          purchasedItems: [...s.purchasedItems, productId],
        })
        return true
      },

      claimPhaseReward: (phaseId, productId) =>
        set((s) => ({
          phaseRewards: { ...s.phaseRewards, [phaseId]: 'claimed' },
          purchasedItems: s.purchasedItems.includes(productId)
            ? s.purchasedItems
            : [...s.purchasedItems, productId],
        })),

      declinePhaseReward: (phaseId) =>
        set((s) => ({
          phaseRewards: { ...s.phaseRewards, [phaseId]: 'declined' },
        })),

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
        totalPoints: s.totalPoints,
        quizPointsEarned: s.quizPointsEarned,
        streakPointsDates: s.streakPointsDates,
        purchasedItems: s.purchasedItems,
        phaseRewards: s.phaseRewards,
      }),
    }
  )
)
