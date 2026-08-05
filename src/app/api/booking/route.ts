import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions }  from '@/lib/auth'
import { ok, created, badRequest, serverError } from '@/lib/api-helpers'
import { initializeTransaction, generateReference, } from '@/lib/paystack'
import { validateConsultantSlot } from '@/lib/consultant-booking'
import { notifyConsultant } from '@/lib/consultant-notify'

type PaystackMetadata = {
  consultation_id: string
  type: string
  cancel_action: string
  orderId: string
  customer_name: string
  items_summary: string
}

type BookingSession = Session & {
  user: {
    id: string
    email: string
  }
}

const CONSULTATION_PRICES: Record<string, number> = {
  HERBALIST:    5000,
  NATUROPATH:   6500,
  TOXICOLOGIST: 7500,
  PHARMACIST:   8500,
}

// POST /api/booking
//
//Consultations are paid sessions — this now mirrors
// the dashboard booking flow: it creates a REQUESTED/PENDING consultation,
// initializes a real Paystack transaction, and returns the checkout URL
// for the browser to redirect to. The consultation only becomes CONFIRMED
// (and only then receives a real meeting link) once payment is verified
// via /api/dashboard/customer/consultations/verify or the Paystack webhook.
//
// Guest (not-logged-in) checkout for a paid, identity-bound consultation
// needs proper design (capturing the email Paystack should redirect/email
// receipts to, account linking after payment, etc.) — rather than fake a
// "confirmed" guest booking with no payment, we now require sign-in first.
//
// Consultant selection is now real: `consultantId` must reference an
// ACTIVE ConsultantProfile matching `type`, and the exact slot is
// re-validated against existing bookings for that consultant right here —
// see lib/consultant-booking.ts (shared with
// /api/dashboard/customer/consultations, the other booking entry point).

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body    = await req.json()

    const { practitionerId, practitionerName, consultantId, type, scheduledAt, notes } = body

    if (!type || !scheduledAt) {
      return badRequest('type and scheduledAt are required')
    }

    const validTypes = ['HERBALIST', 'NATUROPATH', 'TOXICOLOGIST', 'PHARMACIST']
    if (!validTypes.includes(type)) {
      return badRequest(`type must be one of: ${validTypes.join(', ')}`)
    }

    if (!session?.user) {
      return badRequest('Please sign in to book a paid consultation. Guest checkout for consultations is not yet supported.')
    }

    const { id: userId, email } = (session as BookingSession).user

    const slotDate = new Date(scheduledAt)
    if (isNaN(slotDate.getTime())) return
    badRequest('scheduledAt must be a valid date')

    const validation = await validateConsultantSlot(consultantId, type, slotDate)
    if (!validation.ok) return badRequest(validation.message)
   

    const priceNaira = CONSULTATION_PRICES[type]
    const reference   = generateReference('CONSULT')

    const consultation = await prisma.consultation.create({
      data: {
        userId,
        consultantId: validation.consultant.id,
        practitionerId:   practitionerId ?? null,
        practitionerName: practitionerName ?? null,
        type,
        status:        'REQUESTED',
        scheduledAt:   slotDate,
        notes:         notes ?? null,
        meetingUrl:    null,
        amount:        priceNaira * 100,
        paystackRef:   reference,
        paymentStatus: 'PENDING',
      },
    })

    let paystackRes
    try {
      paystackRes = await initializeTransaction({
        email,
        amount:    priceNaira,
        reference,
        metadata: ({
          consultation_id: consultation.id,
          type,
          cancel_action:  `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/booking`,
        } as unknown) as PaystackMetadata,
        callback_url: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/dashboard/customer/consultations?ref=${reference}`,
      })
    } catch (paystackErr: unknown) {
      await prisma.consultation.delete({ where: { id: consultation.id } }).catch(() => {})
      console.error('[Booking Payment Init]', paystackErr)
      return serverError(new Error('Could not start payment. Please try again.'))
    }

    if (!paystackRes.status) {
      await prisma.consultation.delete({ where: { id: consultation.id } }).catch(() => {})
      return serverError(new Error(paystackRes.message ?? 'Paystack initialization failed'))
    }

    // Consultant gets notified as soon as the booking exists (REQUESTED),
    // not only once paid — lets them see it coming in their queue. The
    // "confirmed" framing can wait for a future reminder-on-payment pass;
    // for now the NEW_BOOKING copy is accurate either way ("booked a session").
    await notifyConsultant({
      consultantId: validation.consultant.id,
      consultationId: consultation.id,
      type: 'NEW_BOOKING',
      clientName: (session.user as {name: string})?.name,
      scheduledAt: slotDate,
    })

    return created({
      consultation,
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
      message: 'Redirecting to secure payment…',
    })
  } catch (e) {
    return serverError(e)
  }
}

// GET /api/booking — get available slots (static for now, wire to calendar API later)
export async function GET(req: NextRequest) {
  const url  = new URL(req.url)
  const type = url.searchParams.get('type')

  // Static available slots — in production connect to Cal.com / Google Calendar API
  const slots = [
    'Thu 26 Jun · 10:00 AM', 'Thu 26 Jun · 11:30 AM',
    'Thu 26 Jun · 3:30 PM',  'Fri 27 Jun · 9:00 AM',
    'Fri 27 Jun · 2:00 PM',  'Mon 30 Jun · 9:00 AM',
    'Mon 30 Jun · 11:00 AM', 'Mon 30 Jun · 3:00 PM',
    'Tue 1 Jul · 10:00 AM',  'Tue 1 Jul · 2:00 PM',
    'Wed 2 Jul · 9:00 AM',   'Wed 2 Jul · 4:00 PM',
  ]

  return ok({ slots })
}
