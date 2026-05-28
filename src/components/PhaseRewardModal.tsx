'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Gift, Trophy, X, CheckCircle2, AlertTriangle, Mail } from 'lucide-react'
import { SHOP_PRODUCTS, PHASE_REWARD_PRODUCTS } from '@/data/shopProducts'
import { useProgressStore } from '@/lib/store'
import { PHASES } from '@/data/roadmap'
import { sendAwardEmail } from '@/lib/sendAwardEmail'
import { cn } from '@/lib/utils'

interface PhaseRewardModalProps {
  phaseId: number
  onClose: () => void
}

type Step = 'gift' | 'confirm-decline' | 'success'

const PHASE_ICONS = ['🌱', '🐍', '🎭', '🔌', '🏆']

export function PhaseRewardModal({ phaseId, onClose }: PhaseRewardModalProps) {
  const { claimPhaseReward, declinePhaseReward, language } = useProgressStore()
  const [step, setStep] = useState<Step>('gift')
  const overlayRef = useRef<HTMLDivElement>(null)

  const productId = PHASE_REWARD_PRODUCTS[phaseId]
  const product = SHOP_PRODUCTS.find((p) => p.id === productId)
  const phase = PHASES.find((p) => p.id === phaseId)
  const icon = PHASE_ICONS[(phaseId - 1) % PHASE_ICONS.length]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!product || !phase) return null

  const handleClaim = () => {
    claimPhaseReward(phaseId, productId)
    setStep('success')
    sendAwardEmail({
      productName: product.name,
      productNameVi: product.nameVi,
      price: product.price,
      points: 0,
      type: 'phase',
      phaseId,
    })
  }

  const handleDeclineAttempt = () => setStep('confirm-decline')

  const handleConfirmDecline = () => {
    declinePhaseReward(phaseId)
    onClose()
  }

  const phaseName = language === 'vi' ? phase.titleVi : phase.title
  const productName = language === 'vi' ? product.nameVi : product.name

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) handleDeclineAttempt() }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Decorative header band */}
        <div className="relative h-2 bg-gradient-to-r from-yellow-400 via-emerald-400 to-teal-400" />

        {step === 'gift' && (
          <>
            {/* Close */}
            <button
              onClick={handleDeclineAttempt}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-8 pb-8 pt-6 text-center">
              {/* Trophy icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-4xl shadow-inner dark:bg-yellow-900/30">
                {icon}
              </div>

              <div className="mb-1 flex items-center justify-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
                  {language === 'vi' ? 'Hoàn thành giai đoạn!' : 'Phase Complete!'}
                </span>
              </div>

              <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                {phaseName}
              </h2>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                {language === 'vi'
                  ? 'Bạn đã nhận được một phần thưởng đặc biệt!'
                  : 'You\'ve earned a special reward!'}
              </p>

              {/* Product card */}
              <div className="mx-auto mb-6 flex max-w-[220px] flex-col overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40">
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={product.image}
                    alt={productName}
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/40 to-transparent">
                    <div className="flex items-center gap-1 px-3 py-2">
                      <Gift className="h-4 w-4 text-yellow-300" />
                      <span className="text-xs font-bold text-yellow-300">
                        {language === 'vi' ? 'Miễn phí!' : 'Free reward!'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2 text-center">
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{productName}</p>
                  <p className="text-xs text-emerald-600 line-through dark:text-emerald-500">{product.price}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleClaim}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3',
                    'bg-gradient-to-r from-emerald-500 to-teal-500 font-bold text-white',
                    'shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-400 hover:to-teal-400',
                    'dark:shadow-emerald-900/40'
                  )}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {language === 'vi' ? 'Nhận phần thưởng' : 'Claim my reward'}
                </button>
                <button
                  onClick={handleDeclineAttempt}
                  className="text-sm text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {language === 'vi' ? 'Để sau' : 'Maybe later'}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="px-8 pb-8 pt-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>

            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
              {language === 'vi' ? 'Đã nhận phần thưởng!' : 'Reward Claimed!'}
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {language === 'vi'
                ? `Admin đã được thông báo chuẩn bị "${productName}" cho bạn.`
                : `Admin has been notified to prepare "${productName}" for you.`}
            </p>

            <div className="mb-6 flex items-center justify-center gap-1.5 text-xs text-violet-500 dark:text-violet-400">
              <Mail className="h-3.5 w-3.5" />
              <span>
                {language === 'vi' ? 'Email xác nhận đã được gửi' : 'Confirmation email sent'}
              </span>
            </div>

            <button
              onClick={onClose}
              className={cn(
                'w-full rounded-xl px-4 py-3 text-sm font-bold text-white',
                'bg-gradient-to-r from-emerald-500 to-teal-500 transition-all hover:from-emerald-400 hover:to-teal-400'
              )}
            >
              {language === 'vi' ? 'Đóng' : 'Close'}
            </button>
          </div>
        )}

        {step === 'confirm-decline' && (
          <div className="px-8 pb-8 pt-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-900/30">
              <AlertTriangle className="h-7 w-7 text-orange-500" />
            </div>

            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
              {language === 'vi' ? 'Bạn chắc chắn muốn bỏ qua?' : 'Sure you want to skip?'}
            </h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {language === 'vi'
                ? `Phần thưởng "${productName}" sẽ không được lưu lại nếu bạn bỏ qua.`
                : `The "${productName}" reward won't be saved if you skip it.`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmDecline}
                className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                {language === 'vi' ? 'Vâng, bỏ qua' : 'Yes, skip it'}
              </button>
              <button
                onClick={() => setStep('gift')}
                className={cn(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white',
                  'bg-gradient-to-r from-emerald-500 to-teal-500 transition-all hover:from-emerald-400 hover:to-teal-400'
                )}
              >
                {language === 'vi' ? 'Không, giữ lại!' : 'No, keep it!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
