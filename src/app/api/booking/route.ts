import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions }  from '@/lib/auth'
import { ok, created, badRequest, serverError } from '@/lib/api-helpers'
import { initializeTransaction, generateReference, } from '@/lib/paystack'

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
// Previously this auto-confirmed every booking (logged in or guest) the
// instant it was called, handing back a fake meeting link with no

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body    = await req.json()

    const { practitionerId, practitionerName, type, scheduledAt, notes } = body

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

    const priceNaira = CONSULTATION_PRICES[type]
    const reference   = generateReference('CONSULT')

    const consultation = await prisma.consultation.create({
      data: {
        userId,
        practitionerId:   practitionerId ?? null,
        practitionerName: practitionerName ?? null,
        type,
        status:        'REQUESTED',
        scheduledAt:   new Date(scheduledAt),
        notes:         notes ?? null,
        meetingUrl:    null,
        amount:        priceNaira * 100,
        paystackRef:   reference,
        paymentStatus: 'PENDING',
      },
    })

    let paystackRes
    try {
      const paystackMetadata: PaystackMetadata = {
        consultation_id: consultation.id,
        type,
        cancel_action: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/booking`,
        orderId: consultation.id,
        customer_name: email,
        items_summary: `${type} consultation`,
      }

      paystackRes = await initializeTransaction({
        email,
        amount:    priceNaira,
        reference,
        metadata: paystackMetadata,
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
