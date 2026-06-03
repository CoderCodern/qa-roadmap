'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useSession } from 'next-auth/react'

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

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      capture_pageview: true,
      loaded: () => {
        if (process.env.NODE_ENV === 'development') posthog.debug()
      },
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <UserIdentification />
      {children}
    </PHProvider>
  )
}
