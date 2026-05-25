import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} QA Roadmap — 56 days to automation mastery.
          </p>
          <nav className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              About
            </Link>
            <Link href="/roadmap" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Roadmap
            </Link>
            <Link href="/progress" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Progress
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
