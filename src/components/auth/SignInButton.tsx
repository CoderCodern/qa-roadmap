'use client'

import { signIn } from 'next-auth/react'
import { LogIn } from 'lucide-react'

export function SignInButton() {
  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      <LogIn className="h-3.5 w-3.5" />
      <span className="lang-en">Sign in</span>
      <span className="lang-vi">Đăng nhập</span>
    </button>
  )
}
