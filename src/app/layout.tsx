import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProviderWrapper } from '@/components/layout/ThemeProviderWrapper'
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider'
import { StoreHydration } from '@/lib/store-hydration'
import { CloudSync } from '@/components/layout/CloudSync'
import { LangEffect } from '@/components/layout/LangEffect'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { NavigationProgress } from '@/components/layout/NavigationProgress'
import { PhaseRewardChecker } from '@/components/PhaseRewardChecker'
import { ProgressSyncBanner } from '@/components/progress/ProgressSyncBanner'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'QA Roadmap', template: '%s | QA Roadmap' },
  description: '56-day beginner-friendly QA automation testing roadmap with daily lessons, quizzes, and progress tracking.',
}

// Reads language from localStorage before React renders to avoid any flash.
// Same pattern as next-themes uses for the theme attribute.
const langInitScript = `(function(){try{var d=JSON.parse(localStorage.getItem('qa-roadmap-progress')||'{}');var l=d&&d.state&&d.state.language;document.documentElement.setAttribute('data-lang',l==='vi'?'vi':'en')}catch(e){document.documentElement.setAttribute('data-lang','en')}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-lang before paint — eliminates language flash on load */}
        <script dangerouslySetInnerHTML={{ __html: langInitScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <AuthSessionProvider>
          <ThemeProviderWrapper>
            <NavigationProgress />
            <StoreHydration />
            <CloudSync />
            <LangEffect />
            <PhaseRewardChecker />
            <div className="flex min-h-screen flex-col">
              <Header />
              <ProgressSyncBanner />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProviderWrapper>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
