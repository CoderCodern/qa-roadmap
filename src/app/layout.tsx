import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProviderWrapper } from '@/components/layout/ThemeProviderWrapper'
import { StoreHydration } from '@/lib/store-hydration'
import { LangEffect } from '@/components/layout/LangEffect'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <ThemeProviderWrapper>
          <StoreHydration />
          <LangEffect />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}
