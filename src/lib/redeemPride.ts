export interface RedeemPridePayload {
  productId: number
  productName: string
  productNameVi: string
  price: string
  pointsSpent: number
  type: 'shop' | 'phase'
  phaseId?: number
}

export interface RedeemPrideResult {
  success: boolean
  newPointsBalance?: number
  error?: string
}

export async function redeemPride(payload: RedeemPridePayload): Promise<RedeemPrideResult> {
  try {
    const res = await fetch('/api/v1/me/pride/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json() as { success: boolean; data?: { id: string; newPointsBalance: number }; error?: string }
    if (!res.ok || !data.success) {
      return { success: false, error: data.error ?? 'Failed to redeem' }
    }
    return { success: true, newPointsBalance: data.data?.newPointsBalance }
  } catch {
    return { success: false, error: 'Network error' }
  }
}
