'use client'

import { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useSession } from 'next-auth/react'

const CONSENT_KEY = 'qa-roadmap-analytics-consent'
type Consent = 'accepted' | 'declined' | null

function getStoredConsent(): Consent {
  try {
    return (localStorage.getItem(CONSENT_KEY) as Consent) ?? null
  } catch {
    return null
  }
}

function initPostHog() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  if (posthog.__loaded) return
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
    capture_pageview: true,
    loaded: () => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    },
  })
}

function UserIdentification() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
    if (session?.user) {
      const userId = (session.user as { id?: string }).id
      if (userId) {
        posthog.identify(userId, {
          email: session.user.email ?? undefined,
          name: session.user.name ?? undefined,
        })
      }
    } else {
      posthog.reset()
    }
  }, [session])

  return null
}

export function ConsentBanner() {
  const [consent, setConsent] = useState<Consent>('accepted') // optimistic — hide until hydrated

  useEffect(() => {
    setConsent(getStoredConsent())
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setConsent('accepted')
    initPostHog()
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setConsent('declined')
  }

  if (consent !== null) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          <span className="lang-en">
            We use analytics to improve your learning experience. No personal data is sold.
          </span>
          <span className="lang-vi">
            Chúng tôi dùng phân tích để cải thiện trải nghiệm học. Không bán dữ liệu cá nhân.
          </span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="flex-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <span className="lang-en">Accept</span>
            <span className="lang-vi">Chấp nhận</span>
          </button>
          <button
            onClick={decline}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="lang-en">Decline</span>
            <span className="lang-vi">Từ chối</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only init if user has already accepted (returning visitor)
    if (getStoredConsent() === 'accepted') {
      initPostHog()
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      <UserIdentification />
      {children}
    </PHProvider>
  )
}
