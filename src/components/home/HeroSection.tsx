'use client'

import Link from 'next/link'
import { ArrowRight, Map } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getDailyMotivation } from '@/data/motivation'
import { useProgressStore } from '@/lib/store'

export function HeroSection() {
  const language = useProgressStore((s) => s.language)
  // Deferred to client-only to avoid SSG/runtime date mismatch (hydration error)
  const [motivation, setMotivation] = useState<string | null>(null)
  useEffect(() => {
    setMotivation(getDailyMotivation(language))
  }, [language])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-violet-600 to-purple-700 py-20 sm:py-28">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-20 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {/* Motivation pill — client-only to avoid hydration mismatch */}
          {motivation && (
            <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90">
              {motivation}
            </div>
          )}

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="lang-en">Your 8-Week Automation Tester Roadmap</span>
            <span className="lang-vi">Lộ Trình 8 Tuần Tự Động Hóa Kiểm Thử</span>
          </h1>

          <p className="mb-10 text-lg text-white/80 sm:text-xl">
            <span className="lang-en">
              56 daily lessons — from zero to job-ready. Test fundamentals, Python, Playwright, and API testing,
              one focused day at a time.
            </span>
            <span className="lang-vi">
              56 bài học hàng ngày — từ con số không đến sẵn sàng đi làm. Kiến thức cơ bản, Python, Playwright và
              kiểm thử API, mỗi ngày tập trung một chủ đề.
            </span>
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/day/1"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
            >
              <span className="lang-en">Start Day 1</span>
              <span className="lang-vi">Bắt đầu Ngày 1</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <Map className="h-5 w-5" />
              <span className="lang-en">See Full Roadmap</span>
              <span className="lang-vi">Xem lộ trình đầy đủ</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 flex justify-center gap-10 text-center">
            {[
              { num: '56', enLabel: 'Daily Lessons', viLabel: 'Bài Học' },
              { num: '5', enLabel: 'Phases', viLabel: 'Giai Đoạn' },
              { num: '8', enLabel: 'Weeks', viLabel: 'Tuần' },
            ].map((s) => (
              <div key={s.num}>
                <p className="text-3xl font-bold text-white">{s.num}</p>
                <p className="text-sm text-white/70">
                  <span className="lang-en">{s.enLabel}</span>
                  <span className="lang-vi">{s.viLabel}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
