import type { AwardEmailPayload } from '@/app/api/send-award-email/route'

export async function sendAwardEmail(payload: AwardEmailPayload): Promise<void> {
  try {
    await fetch('/api/send-award-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Fire-and-forget — email failure must not block the UI
  }
}
