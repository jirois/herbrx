import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError } from '@/lib/api-helpers'
import { initializeTransaction, generateReference } from '@/lib/paystack'
import { validateConsultantSlot } from '@/lib/consultant-booking'
import { notifyConsultant } from '@/lib/consultant-notify'


// Pricing must match what's shown to the user in the booking UI.
// In production this should live in a Practitioner DB table rather than
// being duplicated here and in the frontend component — flagged as a
// follow-up, but out of scope for the payment-gating fix itself.

const CONSULTATION_PRICES: Record<string, number> = {
  HERBALIST:    5000,
  NATUROPATH:   6500,
  TOXICOLOGIST: 7500,
  PHARMACIST:   8500,
}

// GET /api/dashboard/customer/consultations
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id

    const consultations = await prisma.consultation.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        consultant: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    })

    return ok({
      consultations: consultations.map(c => ({
        ...c,
        consultantName: c.consultant ? `${c.consultant.user.firstName} ${c.consultant.user.lastName}` : c.practitionerName,
      })),
    })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/customer/consultations
// Previously this created a CONFIRMED consultation with a fabricated
// meeting link the instant it was called — no payment was ever taken,
// initialized, or verified. It now:
//   1. Creates the consultation as REQUESTED / payment PENDING
//   2. Initializes a real Paystack transaction for the practitioner's price
//   3. Returns the Paystack authorization_url for the frontend to redirect to
// The consultation is only flipped to CONFIRMED — and only then given a
// real meeting link — once the Paystack webhook (or the verify endpoint,
// as an immediate fallback on browser return) confirms the charge.
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error

  try {
    const user = session!.user as { id: string; email: string; firstName?: string; lastName?: string }
    const userId = user.id
    const email  = user.email
    const body   = await req.json()

    const { type, scheduledAt, notes, consultantId } = body

    if (!type || !scheduledAt) {
      return badRequest('type and scheduledAt are required')
    }

    const parsedDate = new Date(scheduledAt)
    if (isNaN(parsedDate.getTime())) {
      return badRequest('The scheduledAt parameter must be a valid ISO date or timestamp string')
    }

    const validTypes = ['HERBALIST', 'NATUROPATH', 'TOXICOLOGIST', 'PHARMACIST']
    if (!validTypes.includes(type)) {
      return badRequest(`type must be one of: ${validTypes.join(', ')}`)
    }
    const slotDate = new Date(scheduledAt)
    if (isNaN(slotDate.getTime())) return badRequest('scheduledAt must be a valid date')

    const validation = await validateConsultantSlot(consultantId, type, slotDate)
    if (!validation.ok) {
      return badRequest(validation.message)
    }

    const consultant = validation.consultant
    const priceNaira = CONSULTATION_PRICES[type]
    const reference  = generateReference('CONSULT')

    const consultation = await prisma.consultation.create({
      data: {
        userId,
        consultantId: consultant.id,
        // practitionerName: practionerName ?? null,
        type,
        status:      'REQUESTED',
        scheduledAt: slotDate,
        notes:       notes ?? null,
        meetingUrl:  null, // not set yet 
        amount:   priceNaira * 100, // Kobo
        paystackRef: reference,
        paymentStatus: 'PENDING',

      },
    })

    let paystackRes

    const baseUrl = typeof process.env.NEXTAUTH_URL === 'string' 
      ? process.env.NEXTAUTH_URL 
      : 'http://localhost:3000';

    try {
      paystackRes = await initializeTransaction({
        email,
        amount:  priceNaira, // lib converts to kobo internally
        reference,
        metadata: {
          customerId: userId,
          cancel_action: `${baseUrl}/dashboard/customer/consultations`,
          orderId: consultation.id,
          customer_name: email,
          items_summary: `${type} consultation`,
        } ,
        callback_url: `${baseUrl}/dashboard/customer/consultations?ref=${reference}`,

      })

    } catch (paystackErr: unknown) {
       // Roll back the consultation row rather than leaving an orphaned
      // PENDING booking with no way to ever be paid for.
      await prisma.consultation.delete({ where: { id: consultation.id } }).catch(() => {})
      console.error('[Consultation Payment Init]', paystackErr)
      return serverError(new Error('Could not start payment. Please try again.'))
    }

      if (!paystackRes.status) {
      await prisma.consultation.delete({ where: { id: consultation.id } }).catch(() => {})
      return serverError(new Error(paystackRes.message ?? 'Paystack initialization failed'))
    }

     await notifyConsultant({
      consultantId: validation.consultant.id,
      consultationId: consultation.id,
      type: 'NEW_BOOKING',
      clientName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      scheduledAt: slotDate,
    })


    return created({ 
      consultation,
      authorizationUrl: paystackRes.data.authorization_url,
      // authorization_uri,
      reference,


    })
  } catch (e) {
    return serverError(e)
  }
}
