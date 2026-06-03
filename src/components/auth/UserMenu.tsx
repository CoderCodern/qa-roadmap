'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, User, Bookmark, Settings, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

export function UserMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session?.user) return null

  const { name, image, isAdmin } = session.user

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 transition-colors hover:border-brand-400 dark:border-gray-700 dark:bg-gray-800"
        aria-label="User menu"
      >
        {image ? (
          <Image
            src={image}
            alt={name ?? 'User'}
            width={28}
            height={28}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-800">
            <p className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100">
              {name}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {session.user.email}
            </p>
          </div>

          <Link
            href="/saved"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Bookmark className="h-4 w-4" />
            <span className="lang-en">Saved lessons</span>
            <span className="lang-vi">Bài đã lưu</span>
          </Link>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
            <span className="lang-en">Account</span>
            <span className="lang-vi">Tài khoản</span>
          </Link>

          {isAdmin && (
            <>
              <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            </>
          )}

          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="lang-en">Sign out</span>
            <span className="lang-vi">Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  )
}
