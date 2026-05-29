'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Star, ShoppingBag, Lock, AlertTriangle, Mail, CheckCircle2 } from 'lucide-react'
import { useProgressStore } from '@/lib/store'
import { SHOP_PRODUCTS } from '@/data/shopProducts'
import { sendAwardEmail } from '@/lib/sendAwardEmail'
import { cn } from '@/lib/utils'

interface ShopModalProps {
  open: boolean
  onClose: () => void
}

const SHOP_NAMES = ['All', 'Đảo Matcha', 'Universal Tea'] as const
type ShopFilter = (typeof SHOP_NAMES)[number]

export function ShopModal({ open, onClose }: ShopModalProps) {
  const { totalPoints, spendPoints, language } = useProgressStore()
  const [justPurchased, setJustPurchased] = useState<number | null>(null)
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [selectedShop, setSelectedShop] = useState<ShopFilter>('All')
  const overlayRef = useRef<HTMLDivElement>(null)

  const filteredProducts = selectedShop === 'All'
    ? SHOP_PRODUCTS
    : SHOP_PRODUCTS.filter((p) => p.shop === selectedShop)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Cancel confirmation when modal closes
  useEffect(() => { if (!open) setConfirmingId(null) }, [open])

  const handleRedeemClick = (productId: number) => {
    if (confirmingId === productId) return // already confirming
    setConfirmingId(productId)
  }

  const handleConfirmRedeem = (productId: number, points: number) => {
    const ok = spendPoints(points, productId)
    if (ok) {
      setJustPurchased(productId)
      setTimeout(() => setJustPurchased(null), 4000)
      const product = SHOP_PRODUCTS.find((p) => p.id === productId)
      if (product) {
        sendAwardEmail({
          productName: product.name,
          productNameVi: product.nameVi,
          price: product.price,
          points,
          type: 'shop',
        })
      }
    }
    setConfirmingId(null)
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) { setConfirmingId(null); onClose() } }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

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
                {selectedShop === 'All'
                  ? (language === 'vi' ? 'Đảo Matcha & Universal Tea' : 'Đảo Matcha & Universal Tea')
                  : selectedShop}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />+5 pts daily streak</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />+5 pts per correct quiz answer</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" />+5 pts per exercise item</span>
        </div>

        {/* Redeem success banner */}
        {justPurchased && (
          <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-6 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <Mail className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              {language === 'vi'
                ? 'Đã đổi thành công! Admin đã được thông báo chuẩn bị đơn hàng cho bạn.'
                : 'Redeemed! Admin has been notified to prepare your order.'}
            </p>
          </div>
        )}

        {/* Shop filter */}
        <div className="flex gap-2 border-b border-gray-100 px-6 py-3 dark:border-gray-800">
          {SHOP_NAMES.map((shop) => (
            <button
              key={shop}
              onClick={() => { setSelectedShop(shop); setConfirmingId(null) }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                selectedShop === shop
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              {shop === 'All' ? (language === 'vi' ? 'Tất cả' : 'All') : shop}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="overflow-y-auto p-6" onClick={() => setConfirmingId(null)}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {filteredProducts.map((product) => {
              const canAfford = totalPoints >= product.points
              const isJust = justPurchased === product.id
              const isConfirming = confirmingId === product.id

              return (
                <div
                  key={product.id}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-xl border transition-all',
                    isConfirming
                      ? 'border-yellow-400 bg-yellow-50/60 shadow-lg dark:border-yellow-600 dark:bg-yellow-950/30'
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
                      className="object-cover transition-transform group-hover:scale-105"
                    />
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

                    {isJust ? (
                      <div className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-100 py-1.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {language === 'vi' ? 'Đã đổi!' : 'Redeemed!'}
                      </div>
                    ) : isConfirming ? (
                      /* Confirmation panel */
                      <div className="mt-1 space-y-1.5 rounded-lg border border-yellow-200 bg-yellow-50 p-2 dark:border-yellow-800 dark:bg-yellow-950/40">
                        <div className="flex items-center gap-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                          <AlertTriangle className="h-3 w-3" />
                          {language === 'vi'
                            ? `Dùng ${product.points} pts?`
                            : `Spend ${product.points} pts?`}
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleConfirmRedeem(product.id, product.points)}
                            className="flex-1 rounded-lg bg-yellow-400 py-1 text-xs font-bold text-yellow-900 transition-colors hover:bg-yellow-500 dark:bg-yellow-500 dark:text-yellow-950"
                          >
                            {language === 'vi' ? 'Xác nhận' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="flex-1 rounded-lg bg-gray-100 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                          >
                            {language === 'vi' ? 'Huỷ' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => canAfford && handleRedeemClick(product.id)}
                        disabled={!canAfford}
                        className={cn(
                          'mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all',
                          canAfford
                            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 dark:bg-yellow-500 dark:text-yellow-950 dark:hover:bg-yellow-400'
                            : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                        )}
                      >
                        {canAfford
                          ? (language === 'vi' ? 'Đổi ngay' : 'Redeem')
                          : <><Lock className="h-3 w-3" />{language === 'vi' ? 'Chưa đủ pts' : 'Not enough pts'}</>
                        }
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
