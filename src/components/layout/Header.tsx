'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon, Flame, FlaskConical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useProgressStore } from '@/lib/store'
import { MobileNav } from './MobileNav'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/progress', label: 'Progress' },
  { href: '/about', label: 'About' },
]

export function Header() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { streak, language, setLanguage } = useProgressStore()
  // Defer theme icon to avoid SSR/client mismatch (resolvedTheme is undefined on server)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-600 dark:text-brand-400">
          <FlaskConical className="h-5 w-5" />
          <span className="hidden sm:inline">QA Roadmap</span>
          <span className="sm:hidden">QA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Streak chip */}
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              <span>{streak}</span>
            </div>
          )}

          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle language"
          >
            {language === 'en' ? 'VI' : 'EN'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === 'dark'
              ? <Sun className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>

          <MobileNav />
        </div>
      </div>
    </header>
  )
}
