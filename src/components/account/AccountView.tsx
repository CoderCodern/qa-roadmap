'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Flame, Star, CheckCircle2, Trophy, User, LogOut, Pencil, Check, X } from 'lucide-react'
import { SignInButton } from '@/components/auth/SignInButton'

interface ProfileData {
  id: string
  name: string | null
  email: string | null
  image: string | null
  bio: string | null
  stats: {
    currentStreak: number
    longestStreak: number
    pointsBalance: number
    completedCount: number
  }
}

export function AccountView() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingBio, setEditingBio] = useState(false)
  const [bioValue, setBioValue] = useState('')
  const [saving, setSaving] = useState(false)
  const bioRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user?.id) { setLoading(false); return }

    fetch('/api/v1/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data: ProfileData | null) => {
        setProfile(data)
        setBioValue(data?.bio ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session?.user?.id, status])

  useEffect(() => {
    if (editingBio) bioRef.current?.focus()
  }, [editingBio])

  const saveBio = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const res = await fetch('/api/v1/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioValue }),
      })
      if (res.ok) {
        const updated: ProfileData = await res.json()
        setProfile(updated)
        setEditingBio(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-64 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Account</h1>
        <p className="mb-6 text-gray-500 dark:text-gray-400">Sign in to view your account.</p>
        <SignInButton />
      </div>
    )
  }

  const stats = profile?.stats

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6">
      {/* Profile card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative h-16 w-16 shrink-0">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'Avatar'}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
                <User className="h-8 w-8 text-brand-600 dark:text-brand-400" />
              </div>
            )}
          </div>

          {/* Name + email */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {session.user.name ?? 'Learner'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
          </div>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4" />
            <span className="lang-en">Sign out</span>
            <span className="lang-vi">Đăng xuất</span>
          </button>
        </div>

        {/* Bio */}
        <div className="mt-4">
          {editingBio ? (
            <div className="space-y-2">
              <textarea
                ref={bioRef}
                value={bioValue}
                onChange={(e) => setBioValue(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="A short bio about yourself…"
                className="w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={saveBio}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="lang-en">Save</span>
                  <span className="lang-vi">Lưu</span>
                </button>
                <button
                  onClick={() => { setEditingBio(false); setBioValue(profile?.bio ?? '') }}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="lang-en">Cancel</span>
                  <span className="lang-vi">Hủy</span>
                </button>
                <span className="ml-auto text-xs text-gray-400">{bioValue.length}/280</span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm text-gray-600 dark:text-gray-400 italic">
                {profile?.bio || (
                  <span className="not-italic text-gray-400 dark:text-gray-500">
                    <span className="lang-en">No bio yet.</span>
                    <span className="lang-vi">Chưa có giới thiệu.</span>
                  </span>
                )}
              </p>
              <button
                onClick={() => setEditingBio(true)}
                className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                aria-label="Edit bio"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            label={{ en: 'Current streak', vi: 'Chuỗi hiện tại' }}
            value={`${stats.currentStreak} days`}
            valueVi={`${stats.currentStreak} ngày`}
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            label={{ en: 'Longest streak', vi: 'Chuỗi dài nhất' }}
            value={`${stats.longestStreak} days`}
            valueVi={`${stats.longestStreak} ngày`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            label={{ en: 'Completed', vi: 'Đã hoàn thành' }}
            value={`${stats.completedCount} lessons`}
            valueVi={`${stats.completedCount} bài`}
          />
          <StatCard
            icon={<Star className="h-5 w-5 text-yellow-500" />}
            label={{ en: 'Points', vi: 'Điểm' }}
            value={`${stats.pointsBalance} pts`}
            valueVi={`${stats.pointsBalance} điểm`}
          />
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: { en: string; vi: string }
  value: string
  valueVi: string
}

function StatCard({ icon, label, value, valueVi }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          <span className="lang-en">{label.en}</span>
          <span className="lang-vi">{label.vi}</span>
        </span>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
        <span className="lang-en">{value}</span>
        <span className="lang-vi">{valueVi}</span>
      </p>
    </div>
  )
}
