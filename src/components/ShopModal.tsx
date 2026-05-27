'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Star, ShoppingBag, CheckCircle2, Lock } from 'lucide-react'
import { useProgressStore } from '@/lib/store'
import { SHOP_PRODUCTS } from '@/data/shopProducts'
import { cn } from '@/lib/utils'

interface ShopModalProps {
  open: boolean
  onClose: () => void
}

export function ShopModal({ open, onClose }: ShopModalProps) {
  const { totalPoints, purchasedItems, spendPoints, language } = useProgressStore()
  const [justPurchased, setJustPurchased] = useState<number | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleRedeem = (productId: number, points: number) => {
    const ok = spendPoints(points, productId)
    if (ok) {
      setJustPurchased(productId)
      setTimeout(() => setJustPurchased(null), 2000)
    }
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100">
                {language === 'vi' ? 'Cửa hàng phần thưởng' : 'Rewards Shop'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'vi' ? 'Từ Đảo Matcha – Vũ Trọng Phụng' : 'From Đảo Matcha – Vũ Trọng Phụng'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Balance chip */}
            <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-bold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400">
              <Star className="h-4 w-4" />
              <span>{totalPoints} pts</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* How to earn */}
        <div className="flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50 px-6 py-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> +5 pts daily streak</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> +5 pts per correct quiz answer</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> +5 pts per exercise item</span>
        </div>

        {/* Product grid */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {SHOP_PRODUCTS.map((product) => {
              const owned = purchasedItems.includes(product.id)
              const canAfford = totalPoints >= product.points
              const isJust = justPurchased === product.id

              return (
                <div
                  key={product.id}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-xl border transition-all',
                    owned
                      ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
                      : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/60 dark:hover:border-yellow-600'
                  )}
                >
                  {/* Product image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className={cn(
                        'object-cover transition-transform group-hover:scale-105',
                        (owned || product.imagePending) && 'opacity-70'
                      )}
                    />
                    {owned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400 drop-shadow" />
                      </div>
                    )}
                    {product.imagePending && !owned && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-[10px] text-gray-300">
                        photo coming soon
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="text-sm font-semibold leading-tight text-gray-800 dark:text-gray-200">
                      {language === 'vi' ? product.nameVi : product.name}
                    </p>
                    <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      {language === 'vi' ? product.descriptionVi : product.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400">
                        <Star className="h-3 w-3" />
                        {product.points} pts
                      </span>
                      <span className="text-xs text-gray-400">{product.price}</span>
                    </div>

                    {owned ? (
                      <div className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-100 py-1.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {language === 'vi' ? 'Đã đổi' : 'Redeemed'}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRedeem(product.id, product.points)}
                        disabled={!canAfford || isJust}
                        className={cn(
                          'mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all',
                          isJust
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : canAfford
                              ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 dark:bg-yellow-500 dark:text-yellow-950 dark:hover:bg-yellow-400'
                              : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        )}
                      >
                        {isJust ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" />{language === 'vi' ? 'Đã đổi!' : 'Redeemed!'}</>
                        ) : canAfford ? (
                          language === 'vi' ? 'Đổi ngay' : 'Redeem'
                        ) : (
                          <><Lock className="h-3 w-3" />{language === 'vi' ? 'Chưa đủ pts' : 'Not enough pts'}</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
