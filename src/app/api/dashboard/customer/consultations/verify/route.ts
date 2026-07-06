import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'
import { verifyTransaction } from '@/lib/paystack'
import { generateMeetingLink } from '@/lib/meeting-link'

// POST /api/dashboard/customer/consultations/verify
// Body: { reference }
//
// Called by the frontend the moment the browser returns from the Paystack
// checkout page (via the callback_url query param). This exists because
// relying solely on the Paystack webhook means the user could land back
// on the consultations page before the webhook has actually arrived and
// been processed — verify() lets us confirm payment status directly and
// immediately, with the webhook as the authoritative source of truth for
// anything that happens asynchronously/out of band (e.g. retried webhooks).
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id
    const body   = await req.json()
    const { reference } = body

    if (!reference) return badRequest('reference is required')

    const consultation = await prisma.consultation.findUnique({ where: { paystackRef: reference } })
    if (!consultation) return notFound('No consultation found for this payment reference')
    if (consultation.userId !== userId) return notFound('No consultation found for this payment reference')

    // Already confirmed (e.g. webhook beat us to it) — return as-is,
    // idempotent, no duplicate meeting link generated.
    if (consultation.paymentStatus === 'PAID' && consultation.status === 'CONFIRMED') {
      return ok({ consultation, alreadyConfirmed: true })
    }

    let verifyRes
    try {
      verifyRes = await verifyTransaction(reference)
    } catch (err) {
      console.error('[Consultation Verify]', err)
      return serverError(new Error('Could not verify payment with Paystack. Please contact support if you were charged.'))
    }

    const paid = verifyRes.status && verifyRes.data?.status === 'success'

    if (!paid) {
      const updated = await prisma.consultation.update({
        where: { id: consultation.id },
        data:  { paymentStatus: 'FAILED', status: 'CANCELLED' },
      })
      return ok({ consultation: updated, paid: false })
    }

    // Payment genuinely confirmed by Paystack — only now do we generate
    // a real meeting link and mark the booking as confirmed. This is the
    // gate that was previously entirely missing: confirmation and meeting
    // link used to happen unconditionally the moment "Confirm & Pay" was
    // clicked, with no check that any money had actually moved.
    const meetingUrl = generateMeetingLink(consultation.id)

    const updated = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentStatus: 'PAID',
        status:        'CONFIRMED',
        meetingUrl,
      },
    })

    return ok({ consultation: updated, paid: true })
  } catch (e) {
    return serverError(e)
  }
}
