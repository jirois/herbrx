import { NextRequest }  from 'next/server'
import { ok, badRequest, serverError } from '@/lib/api-helpers'
import nodemailer       from 'nodemailer'

// ── Transport (reuse mailer config) ──────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST  ?? 'smtp.hostinger.com',
  port:   Number(process.env.SMTP_PORT ?? 465),
  secure: (process.env.SMTP_PORT ?? '465') === '465',
  auth: {
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
  },
})

const FROM       = `"HerbRx" <${process.env.SMTP_USER ?? 'hello@herbrx.ng'}>`
const ADMIN_TO   = process.env.CONTACT_INBOX ?? process.env.SMTP_USER ?? 'hello@herbrx.ng'
const BRAND_GREEN = '#1A3A2A'
const BRAND_GOLD  = '#B8832A'
const BRAND_CREAM = '#F7F3EC'

// ── Shared layout ──────────
function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:${BRAND_GREEN};border-radius:16px 16px 0 0;padding:24px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display:inline-flex;align-items:center;gap:10px;">
                  <div style="width:34px;height:34px;background:${BRAND_GOLD};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                    <span style="font-family:Georgia,serif;font-size:14px;font-style:italic;font-weight:700;color:white;">Hx</span>
                  </div>
                  <span style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:white;">HerbRx</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:white;padding:36px;border-radius:0 0 16px 16px;">
          ${body}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 0;text-align:center;">
          <p style="font-size:11px;color:#aaa;line-height:1.6;margin:0;">
            © ${new Date().getFullYear()} HerbRx Nigeria &nbsp;·&nbsp; Lagos, Nigeria &nbsp;·&nbsp;
            <a href="https://herbrx.ng" style="color:#aaa;">herbrx.ng</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

// ── Email 1: Internal notification to the HerbRx team ────
function buildAdminEmail(opts: {
  name: string; email: string; topic: string; message: string; submittedAt: string
}) {
  const body = `
    <p style="font-size:13px;color:#999;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">New Contact Form Submission</p>
    <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:${BRAND_GREEN};margin-bottom:20px;">
      ${opts.topic}
    </h1>

    <!-- Sender details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_CREAM};border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;">
          <span style="font-size:12px;color:#999;display:block;margin-bottom:2px;">FROM</span>
          <span style="font-size:15px;font-weight:600;color:#333;">${opts.name}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;border-top:1px solid #e8e0d4;">
          <span style="font-size:12px;color:#999;display:block;margin-bottom:2px;">EMAIL</span>
          <a href="mailto:${opts.email}" style="font-size:14px;color:${BRAND_GREEN};font-weight:500;">${opts.email}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;border-top:1px solid #e8e0d4;">
          <span style="font-size:12px;color:#999;display:block;margin-bottom:2px;">TOPIC</span>
          <span style="font-size:14px;color:#555;">${opts.topic}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;border-top:1px solid #e8e0d4;">
          <span style="font-size:12px;color:#999;display:block;margin-bottom:2px;">SUBMITTED</span>
          <span style="font-size:13px;color:#888;">${opts.submittedAt}</span>
        </td>
      </tr>
    </table>

    <!-- Message -->
    <p style="font-size:12px;color:#999;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Message</p>
    <div style="background:#fafafa;border-left:4px solid ${BRAND_GREEN};border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="font-size:15px;color:#333;line-height:1.75;white-space:pre-wrap;margin:0;">${opts.message}</p>
    </div>

    <!-- Reply CTA -->
    <div style="text-align:center;margin-top:8px;">
      <a href="mailto:${opts.email}?subject=Re: ${encodeURIComponent(opts.topic)} — HerbRx"
        style="display:inline-block;background:${BRAND_GREEN};color:white;font-size:14px;font-weight:600;padding:12px 28px;border-radius:100px;text-decoration:none;">
        Reply to ${opts.name} →
      </a>
    </div>
  `
  return layout(`New message: ${opts.topic}`, body)
}

// ── Email 2: Auto-reply to the sender ────────────
function buildAutoReplyEmail(opts: { name: string; topic: string; message: string }) {
  const firstName = opts.name.split(' ')[0]
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:600;color:${BRAND_GREEN};margin-bottom:10px;">
      We've received your message 🌿
    </h1>
    <p style="font-size:15px;color:#555;line-height:1.75;margin-bottom:20px;">
      Hi ${firstName}, thank you for reaching out to HerbRx. We've received your message and
      a member of our team will get back to you within <strong style="color:#333;">one business day</strong>.
    </p>

    <!-- Message recap -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_CREAM};border-radius:12px;padding:20px;margin-bottom:24px;">
      <tr>
        <td style="padding:6px 0;">
          <span style="font-size:12px;color:#999;display:block;margin-bottom:2px;">YOUR TOPIC</span>
          <span style="font-size:14px;font-weight:600;color:#333;">${opts.topic}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;border-top:1px solid #e8e0d4;margin-top:10px;">
          <span style="font-size:12px;color:#999;display:block;margin-bottom:8px;">YOUR MESSAGE</span>
          <p style="font-size:14px;color:#666;line-height:1.7;white-space:pre-wrap;margin:0;">${opts.message.length > 300 ? opts.message.slice(0, 300) + '…' : opts.message}</p>
        </td>
      </tr>
    </table>

    <!-- Quick links -->
    <p style="font-size:14px;color:#555;line-height:1.7;margin-bottom:16px;">
      While you wait, here are some things that might help:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${[
        ['📚', 'Safety Resources', 'Free herbal safety guides in 5 languages', 'https://herbrx.ng/resources'],
        ['👨‍⚕️', 'Book a Consultation', 'Speak directly with a herbal pharmacist', 'https://herbrx.ng/booking'],
        ['🛒', 'Verified Products', 'Shop NAFDAC-compliant herbal products', 'https://herbrx.ng/store'],
      ].map(([icon, title, desc, url]) => `
      <tr>
        <td style="padding:8px 0;vertical-align:top;width:32px;font-size:18px;">${icon}</td>
        <td style="padding:8px 0;">
          <a href="${url}" style="font-size:14px;font-weight:600;color:${BRAND_GREEN};text-decoration:none;">${title}</a>
          <p style="font-size:12px;color:#999;margin:2px 0 0;">${desc}</p>
        </td>
      </tr>`).join('')}
    </table>

    <p style="font-size:13px;color:#aaa;line-height:1.7;text-align:center;">
      If your message is urgent, you can also reach us via WhatsApp at 
      <a href="https://wa.me/2348004372793" style="color:${BRAND_GREEN};">+234 800 HERBRX</a>.
    </p>
  `
  return layout('We received your message — HerbRx', body)
}

// ── Rate limiting (simple in-memory — swap for Redis in production) ────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now   = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }) // 1-min window
    return false
  }
  if (entry.count >= 3) return true  // max 3 submissions per minute per IP
  entry.count++
  return false
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return badRequest('Too many requests. Please wait a moment before trying again.')
    }

    const body = await req.json()
    const { name, email, topic, message } = body

    // ── Validation ──────────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return badRequest('Name, email, and message are required.')
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest('Please provide a valid email address.')
    }
    if (message.trim().length < 10) {
      return badRequest('Message is too short. Please provide more detail.')
    }
    if (name.length > 100 || email.length > 200 || message.length > 5000) {
      return badRequest('Input exceeds maximum length.')
    }

    const submittedAt = new Date().toLocaleString('en-NG', {
      dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Lagos',
    })
    const safeTopic = topic?.trim() || 'General Enquiry'

    // ── Send both emails in parallel ──────────
    await Promise.all([
      // 1. Notify the HerbRx team
      transporter.sendMail({
        from:    FROM,
        to:      ADMIN_TO,
        replyTo: `"${name}" <${email}>`,
        subject: `[Contact] ${safeTopic} — ${name}`,
        html:    buildAdminEmail({ name, email, topic: safeTopic, message, submittedAt }),
        text:    `New contact form submission\n\nFrom: ${name} <${email}>\nTopic: ${safeTopic}\nSubmitted: ${submittedAt}\n\n${message}`,
      }),

      // 2. Auto-reply to the sender
      transporter.sendMail({
        from:    FROM,
        to:      email,
        subject: `We received your message — HerbRx`,
        html:    buildAutoReplyEmail({ name, topic: safeTopic, message }),
        text:    `Hi ${name.split(' ')[0]},\n\nThank you for contacting HerbRx! We've received your message about "${safeTopic}" and will reply within one business day.\n\nFor urgent matters, reach us on WhatsApp: +234 800 HERBRX\n\n— The HerbRx Team`,
      }),
    ])

    return ok({
      success: true,
      message: 'Message sent successfully. Check your inbox for a confirmation.',
    })
  } catch (err) {
    console.error('[Contact API]', err)
    return serverError(err)
  }
}
