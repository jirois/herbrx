import { NextRequest } from 'next/server'
import { prisma }      from '@/lib/prisma'
import { ok, created, badRequest, serverError } from '@/lib/api-helpers'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// POST /api/newsletter/subscribe
// Body: { email, source? }
// Public endpoint — no auth required. Previously the frontend never called
// any API here at all (it just faked a 1.2s delay and claimed success), so
// no email was ever actually captured.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return badRequest('Invalid request body')

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const source = typeof body.source === 'string' ? body.source.slice(0, 100) : null

    if (!email) return badRequest('Email is required')
    if (!EMAIL_RE.test(email)) return badRequest('Please enter a valid email address')

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })

    if (existing) {
      // Re-subscribing after a prior unsubscribe should work silently;
      // subscribing again while already active is not an error either —
      // both should just confirm success, not surface a 409 to the user.
      if (existing.unsubscribedAt) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data:  { unsubscribedAt: null, source: source ?? existing.source },
        })
      }
      return ok({ message: "You're subscribed! Check your inbox for a welcome email.", alreadySubscribed: !existing.unsubscribedAt })
    }

    await prisma.newsletterSubscriber.create({ data: { email, source } })

    return created({ message: "You're subscribed! Check your inbox for a welcome email." })
  } catch (e) {
    return serverError(e)
  }
}

// DELETE /api/newsletter/subscribe  — Body: { email }
// Basic unsubscribe path so "Unsubscribe anytime" (footer copy) is actually true.
export async function DELETE(req: NextRequest) {
  try {
    const body  = await req.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !EMAIL_RE.test(email)) return badRequest('A valid email is required')

    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data:  { unsubscribedAt: new Date() },
    })

    return ok({ message: 'You have been unsubscribed.' })
  } catch (e) {
    return serverError(e)
  }
}
