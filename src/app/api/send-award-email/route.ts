import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export interface AwardEmailPayload {
  productName: string
  productNameVi: string
  price: string
  points: number
  type: 'phase' | 'shop'
  phaseId?: number
  /** Learner's email — when provided, a confirmation email is also sent to them. */
  userEmail?: string
}

function buildHtml(p: AwardEmailPayload): string {
  const claimLabel =
    p.type === 'phase'
      ? `Phase ${p.phaseId} Completion Reward (free)`
      : `Shop Redemption (${p.points} pts)`
  const claimLabelVi =
    p.type === 'phase'
      ? `Phần thưởng hoàn thành Giai đoạn ${p.phaseId} (miễn phí)`
      : `Đổi từ cửa hàng (${p.points} pts)`

  const timestamp = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Award Claimed — QA Roadmap</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header band -->
          <tr>
            <td style="height:6px;background:linear-gradient(90deg,#fbbf24,#34d399,#2dd4bf);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f3f4f6;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6b7280;">QA Roadmap · Đảo Matcha</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">🎁 Award Claimed</h1>
            </td>
          </tr>

          <!-- Product info -->
          <tr>
            <td style="padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px;background:#ecfdf5;border-radius:10px;border:1px solid #a7f3d0;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#065f46;">Product</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#064e3b;">${p.productName}</p>
                    <p style="margin:2px 0 0;font-size:14px;color:#6b7280;">${p.productNameVi} · ${p.price}</p>
                  </td>
                </tr>
              </table>

              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Claim type</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:13px;font-weight:600;color:#374151;">${claimLabel}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Loại phần thưởng</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:13px;font-weight:600;color:#374151;">${claimLabelVi}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Time</span>
                  </td>
                  <td style="padding:10px 0;text-align:right;">
                    <span style="font-size:13px;color:#374151;">${timestamp}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;">
                <p style="margin:0;font-size:13px;color:#92400e;font-weight:500;">
                  ☕ Please prepare <strong>${p.productName}</strong> for the learner.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px;background:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">Sent automatically by QA Roadmap · Đảo Matcha – Vũ Trọng Phụng</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildUserHtml(p: AwardEmailPayload): string {
  const rewardLabel =
    p.type === 'phase'
      ? `Phase ${p.phaseId} Completion Reward`
      : `Shop Redemption — ${p.points} pts spent`
  const rewardLabelVi =
    p.type === 'phase'
      ? `Phần thưởng hoàn thành Giai đoạn ${p.phaseId}`
      : `Đổi từ cửa hàng — tiêu ${p.points} pts`

  const timestamp = new Date().toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reward Confirmed — QA Roadmap</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header band -->
          <tr>
            <td style="height:6px;background:linear-gradient(90deg,#fbbf24,#34d399,#2dd4bf);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #f3f4f6;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6b7280;">QA Roadmap · Đảo Matcha</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">✅ Phần thưởng đã xác nhận</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Your reward has been confirmed / Phần thưởng của bạn đã được xác nhận</p>
            </td>
          </tr>

          <!-- Product info -->
          <tr>
            <td style="padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px;background:#ecfdf5;border-radius:10px;border:1px solid #a7f3d0;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#065f46;">Phần thưởng của bạn / Your reward</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#064e3b;">${p.productName}</p>
                    <p style="margin:2px 0 0;font-size:14px;color:#6b7280;">${p.productNameVi} · ${p.price}</p>
                  </td>
                </tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Reward type</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:13px;font-weight:600;color:#374151;">${rewardLabel}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Loại phần thưởng</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:13px;font-weight:600;color:#374151;">${rewardLabelVi}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Thời gian / Time</span>
                  </td>
                  <td style="padding:10px 0;text-align:right;">
                    <span style="font-size:13px;color:#374151;">${timestamp}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;">
                <p style="margin:0;font-size:13px;color:#92400e;font-weight:500;">
                  ☕ Admin đã được thông báo chuẩn bị <strong>${p.productName}</strong> cho bạn. Hãy liên hệ để nhận nhé!
                </p>
                <p style="margin:6px 0 0;font-size:12px;color:#b45309;">
                  The admin has been notified to prepare your order. Reach out to collect it!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px;background:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">Gửi tự động bởi QA Roadmap · Đảo Matcha – Vũ Trọng Phụng</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL

  if (!apiKey || !adminEmail) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 })
  }

  let body: AwardEmailPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { productName, productNameVi, price, points, type, phaseId, userEmail } = body
  if (!productName || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const resend = new Resend(apiKey)
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'QA Roadmap <onboarding@resend.dev>'
  const payload = { productName, productNameVi, price, points, type, phaseId }

  const adminSubject =
    type === 'phase'
      ? `🎁 Phase ${phaseId} Reward Claimed — ${productName}`
      : `🛒 Shop Redemption — ${productName}`

  const userSubject =
    type === 'phase'
      ? `✅ Phần thưởng Phase ${phaseId} đã xác nhận — ${productName}`
      : `✅ Đã đổi thành công — ${productName}`

  try {
    const { error: adminError } = await resend.emails.send({
      from: fromAddress,
      to: adminEmail,
      subject: adminSubject,
      html: buildHtml(payload),
    })

    if (adminError) {
      console.error('Resend admin email error:', adminError)
      return NextResponse.json({ error: 'Email send failed' }, { status: 502 })
    }

    if (userEmail) {
      const { error: userError } = await resend.emails.send({
        from: fromAddress,
        to: userEmail,
        subject: userSubject,
        html: buildUserHtml(payload),
      })
      if (userError) {
        console.error('Resend user email error:', userError)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Send award email error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
