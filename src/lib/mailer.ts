import nodemailer from 'nodemailer'

// ── Transport (Hostinger SMTP) ────────────────────────────────────────────
// Hostinger mail settings:
//   Host: smtp.hostinger.com  Port: 465 (SSL) or 587 (TLS)
//   Username: your full email e.g. hello@herbrx.ng
//   Password: your email account password
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST     ?? 'smtp.hostinger.com',
  port:   Number(process.env.SMTP_PORT ?? 465),
  secure: (process.env.SMTP_PORT ?? '465') === '465',   // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
})

const FROM = `"HerbRx" <${process.env.SMTP_USER ?? 'test@herbrx.ng'}>`
const BRAND_GREEN  = '#1A3A2A'
const BRAND_GOLD   = '#B8832A'
const BRAND_CREAM  = '#F7F3EC'

// ── Shared layout wrapper ─────────────────────────────────────────────────
function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { background:#f4f4f4; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  </style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:${BRAND_GREEN}; border-radius:16px 16px 0 0; padding:28px 36px; text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <div style="display:inline-flex; align-items:center; gap:10px;">
                  <div style="width:36px;height:36px;background:${BRAND_GOLD};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                    <span style="font-family:Georgia,serif;font-size:15px;font-style:italic;font-weight:700;color:white;">Hx</span>
                  </div>
                  <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:white;letter-spacing:0.5px;">HerbRx</span>
                </div>
                <p style="margin-top:4px;font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;">Natural Wellness</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:white; padding:36px; border-radius:0 0 16px 16px;">
          ${body}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:24px 0; text-align:center;">
          <p style="font-size:12px;color:#999;line-height:1.6;">
            © ${new Date().getFullYear()} HerbRx Nigeria · 
            <a href="https://herbrx.ng/privacy" style="color:#999;">Privacy Policy</a> · 
            <a href="https://herbrx.ng/unsubscribe" style="color:#999;">Unsubscribe</a>
          </p>
          <p style="font-size:11px;color:#bbb;margin-top:6px;">
            HerbRx · Lagos, Nigeria · herbrx.ng
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

// ── 1. Email Verification OTP ─────────────────────────────────────────────
export async function sendVerificationEmail(opts: {
  to:        string
  firstName: string
  code:      string
}) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:${BRAND_GREEN};margin-bottom:8px;">
      Verify your email address
    </h1>
    <p style="font-size:15px;color:#555;line-height:1.7;margin-bottom:24px;">
      Hi ${opts.firstName}, welcome to HerbRx! Enter the code below to verify your email and activate your account.
    </p>

    <!-- OTP Box -->
    <div style="background:${BRAND_CREAM};border:2px dashed ${BRAND_GOLD};border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
      <p style="font-size:12px;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Your verification code</p>
      <p style="font-family:Georgia,serif;font-size:44px;font-weight:700;color:${BRAND_GREEN};letter-spacing:12px;line-height:1;">
        ${opts.code}
      </p>
      <p style="font-size:12px;color:#aaa;margin-top:12px;">Expires in <strong>10 minutes</strong></p>
    </div>

    <p style="font-size:13px;color:#888;line-height:1.7;margin-bottom:24px;">
      If you didn't create a HerbRx account, you can safely ignore this email.
      Never share this code with anyone — HerbRx staff will never ask for it.
    </p>

    <div style="border-top:1px solid #f0f0f0;padding-top:20px;">
      <p style="font-size:12px;color:#bbb;">
        🌿 Trusted herbal health for Nigerians · NAFDAC-Compliant Reviews
      </p>
    </div>
  `

  return transporter.sendMail({
    from:    FROM,
    to:      opts.to,
    subject: `${opts.code} — Your HerbRx verification code`,
    html:    emailLayout('Verify your HerbRx email', body),
    text:    `Your HerbRx verification code is: ${opts.code}\n\nExpires in 10 minutes. Do not share this code.`,
  })
}

// ── 2. Welcome email (post-verification) ─────────────────────────────────
export async function sendWelcomeEmail(opts: {
  to:        string
  firstName: string
}) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:${BRAND_GREEN};margin-bottom:8px;">
      Welcome to HerbRx, ${opts.firstName}! 🌿
    </h1>
    <p style="font-size:15px;color:#555;line-height:1.7;margin-bottom:24px;">
      Your account is now verified and ready. You're joining 2,000+ Nigerians who trust HerbRx
      for science-backed herbal health guidance.
    </p>

    <!-- Features -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${[
        ['🛡️','NAFDAC-Compliant Reviews','Independent safety reviews of herbal products'],
        ['👨‍⚕️','Expert Consultations','One-on-one with our herbal pharmacists'],
        ['📦','Verified Products','Shop products that have passed safety review'],
      ].map(([icon, title, desc]) => `
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:40px;font-size:20px;">${icon}</td>
        <td style="padding:10px 0;">
          <p style="font-size:14px;font-weight:600;color:#333;margin-bottom:2px;">${title}</p>
          <p style="font-size:13px;color:#888;">${desc}</p>
        </td>
      </tr>`).join('')}
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin:28px 0;">
      <a href="https://herbrx.ng/store"
        style="display:inline-block;background:${BRAND_GREEN};color:white;font-size:15px;font-weight:600;padding:14px 36px;border-radius:100px;text-decoration:none;letter-spacing:0.3px;">
        Explore the Store →
      </a>
    </div>

    <p style="font-size:13px;color:#aaa;text-align:center;line-height:1.7;">
      Questions? Reply to this email or visit <a href="https://herbrx.ng/contact" style="color:${BRAND_GREEN};">herbrx.ng/contact</a>
    </p>
  `

  return transporter.sendMail({
    from:    FROM,
    to:      opts.to,
    subject: `Welcome to HerbRx, ${opts.firstName}! Your account is ready 🌿`,
    html:    emailLayout('Welcome to HerbRx', body),
    text:    `Welcome to HerbRx, ${opts.firstName}! Your account is verified. Visit https://herbrx.ng/store to get started.`,
  })
}

// ── 3. Password reset OTP ─────────────────────────────────────────────────
export async function sendPasswordResetEmail(opts: {
  to:        string
  firstName: string
  code:      string
}) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:${BRAND_GREEN};margin-bottom:8px;">
      Reset your password
    </h1>
    <p style="font-size:15px;color:#555;line-height:1.7;margin-bottom:24px;">
      Hi ${opts.firstName}, we received a request to reset your HerbRx password.
      Use the code below to proceed.
    </p>

    <div style="background:${BRAND_CREAM};border:2px dashed #e0e0e0;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
      <p style="font-size:12px;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">Reset code</p>
      <p style="font-family:Georgia,serif;font-size:44px;font-weight:700;color:${BRAND_GREEN};letter-spacing:12px;line-height:1;">
        ${opts.code}
      </p>
      <p style="font-size:12px;color:#aaa;margin-top:12px;">Expires in <strong>10 minutes</strong></p>
    </div>

    <p style="font-size:13px;color:#e53e3e;line-height:1.7;margin-bottom:16px;">
      ⚠️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      Contact us immediately if you suspect unauthorised access.
    </p>
  `

  return transporter.sendMail({
    from:    FROM,
    to:      opts.to,
    subject: `${opts.code} — Reset your HerbRx password`,
    html:    emailLayout('Reset your password', body),
    text:    `Your HerbRx password reset code is: ${opts.code}\n\nExpires in 10 minutes.`,
  })
}

// ── 4. Order confirmation ─────────────────────────────────────────────────
export async function sendOrderConfirmationEmail(opts: {
  to:        string
  firstName: string
  orderId:   string
  total:     number
  items:     { name: string; emoji: string; quantity: number; price: number }[]
}) {
  const fmtNaira = (v: number) => new Intl.NumberFormat('en-NG',{ style:'currency', currency:'NGN', minimumFractionDigits:0 }).format(v)

  const itemRows = opts.items.map(item => `
    <tr>
      <td style="padding:10px 0;font-size:20px;width:36px;">${item.emoji}</td>
      <td style="padding:10px 0;font-size:14px;color:#333;">${item.name}</td>
      <td style="padding:10px 0;font-size:14px;color:#555;text-align:center;">×${item.quantity}</td>
      <td style="padding:10px 0;font-size:14px;font-weight:600;color:${BRAND_GREEN};text-align:right;">${fmtNaira(item.price * item.quantity)}</td>
    </tr>
  `).join('')

  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:${BRAND_GREEN};margin-bottom:8px;">
      Order Confirmed! 🎉
    </h1>
    <p style="font-size:15px;color:#555;line-height:1.7;margin-bottom:8px;">
      Hi ${opts.firstName}, thank you for your order. We've received your payment and are processing it now.
    </p>
    <p style="font-size:13px;color:#999;margin-bottom:24px;">Order ID: <strong style="font-family:monospace;color:#333;">${opts.orderId}</strong></p>

    <!-- Items -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;margin-bottom:20px;">
      ${itemRows}
      <tr>
        <td colspan="3" style="padding:12px 0;font-size:15px;font-weight:700;color:${BRAND_GREEN};border-top:2px solid #f0f0f0;">Total</td>
        <td style="padding:12px 0;font-size:15px;font-weight:700;color:${BRAND_GREEN};text-align:right;border-top:2px solid #f0f0f0;">${fmtNaira(opts.total)}</td>
      </tr>
    </table>

    <p style="font-size:13px;color:#888;line-height:1.7;margin-bottom:24px;">
      We'll send you a tracking notification once your order ships (usually within 1–2 business days).
      For questions, reply to this email or visit your <a href="https://herbrx.ng/account/orders" style="color:${BRAND_GREEN};">order history</a>.
    </p>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://herbrx.ng/account/orders"
        style="display:inline-block;background:${BRAND_GREEN};color:white;font-size:14px;font-weight:600;padding:12px 28px;border-radius:100px;text-decoration:none;">
        Track Your Order →
      </a>
    </div>
  `

  return transporter.sendMail({
    from:    FROM,
    to:      opts.to,
    subject: `Order confirmed — ${opts.orderId} | HerbRx`,
    html:    emailLayout('Order Confirmed', body),
    text:    `Hi ${opts.firstName}, your HerbRx order ${opts.orderId} (${fmtNaira(opts.total)}) is confirmed. Track it at https://herbrx.ng/account/orders`,
  })
}

// ── Product Status Notification ────────────────────────────────────────
export async function sendProductStatusEmail(opts: {
  to:          string
  firstName:   string
  productName: string
  action:      string   // APPROVE | FLAG | BAN | RESTORE | PAUSE
  reason?:     string
}) {
  const baseUrl     = process.env.NEXTAUTH_URL ?? 'https://herbrx.ng'
  const dashUrl     = `${baseUrl}/dashboard/producer/products`

  const actionConfig: Record<string, { subject: string; headline: string; color: string; detail: string }> = {
    APPROVE:  { subject: '🎉 Your product has been approved!', headline: 'Product Approved!', color: '#27ae60', detail: 'Your product has been approved and is ready to be listed on the HerbRx marketplace. Head to your dashboard to set your stock level and toggle it live.' },
    FLAG:     { subject: '⚠ Action required — your product has been flagged', headline: 'Product Flagged', color: '#e67e22', detail: 'Your product has been flagged by our compliance team and may not be visible to customers until the issue is resolved.' },
    BAN:      { subject: '🚫 Your product has been removed from HerbRx', headline: 'Product Removed', color: '#e74c3c', detail: 'Your product has been permanently removed from the HerbRx marketplace following a compliance review.' },
    PAUSE:    { subject: '⏸ Your product has been temporarily paused', headline: 'Product Paused', color: '#e67e22', detail: 'Your product has been temporarily paused and is not visible to customers. Please review the reason below and contact us to resolve the issue.' },
    RESTORE:  { subject: '✅ Your product has been restored', headline: 'Product Restored', color: '#27ae60', detail: 'Your product has been reviewed and restored to the marketplace. You can continue selling as normal.' },
  }

  const cfg = actionConfig[opts.action] ?? { subject: `Product update: ${opts.productName}`, headline: 'Product Update', color: BRAND_GREEN, detail: `There has been an update to your product on HerbRx.` }

  const body = `
    <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:600;color:${cfg.color};margin-bottom:8px;">
      ${cfg.headline}
    </h1>
    <p style="font-size:15px;color:#555;line-height:1.7;margin-bottom:20px;">
      Hi ${opts.firstName}, here's an update about your product on HerbRx.
    </p>

    <div style="background:#f7f3ec;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="font-size:12px;color:#999;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Product</p>
      <p style="font-size:18px;font-weight:600;color:#1a3a2a;font-family:Georgia,serif;margin:0;">${opts.productName}</p>
    </div>

    <p style="font-size:15px;color:#444;line-height:1.7;margin-bottom:${opts.reason ? '16px' : '28px'};">
      ${cfg.detail}
    </p>

    ${opts.reason ? `
    <div style="background:#fff8f0;border-left:4px solid ${cfg.color};padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:28px;">
      <p style="font-size:12px;color:#999;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Reason from HerbRx team</p>
      <p style="font-size:14px;color:#555;margin:0;line-height:1.7;">${opts.reason}</p>
    </div>
    ` : ''}

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${dashUrl}"
         style="display:inline-block;background:${BRAND_GREEN};color:#ffffff;font-family:Georgia,serif;font-size:15px;font-weight:600;padding:14px 36px;border-radius:50px;text-decoration:none;">
        Go to My Products →
      </a>
    </div>

    <p style="font-size:13px;color:#888;line-height:1.7;">
      If you have questions, reply to this email or contact us at
      <a href="mailto:support@herbrx.ng" style="color:${BRAND_GREEN};">support@herbrx.ng</a>
    </p>
  `

  return transporter.sendMail({
    from:    FROM,
    to:      opts.to,
    subject: `${cfg.subject} — ${opts.productName} | HerbRx`,
    html:    emailLayout(cfg.headline, body),
    text:    `Hi ${opts.firstName}, ${cfg.detail}${opts.reason ? ` Reason: ${opts.reason}` : ''} Visit ${dashUrl} to manage your products.`,
  })
}
