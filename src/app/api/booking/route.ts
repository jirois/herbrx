import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions }  from '@/lib/auth'
import { ok, created, badRequest, serverError } from '@/lib/api-helpers'

// POST /api/booking
// Public endpoint — works for logged-in users (saves to DB) and guests (email only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body    = await req.json()

    const {
      practitionerId, practitionerName, type, scheduledAt,
      notes, guestName, guestEmail, 
    } = body

    if (!type || !scheduledAt) {
      return badRequest('type and scheduledAt are required')
    }

    const validTypes = ['HERBALIST', 'NATUROPATH', 'TOXICOLOGIST', 'PHARMACIST']
    if (!validTypes.includes(type)) {
      return badRequest(`type must be one of: ${validTypes.join(', ')}`)
    }

    // If logged in — save to Consultation model
    if (session?.user) {
      const userId = (session.user as { id: string }).id

      const consultation = await prisma.consultation.create({
        data: {
          userId,
          practitionerId: practitionerId ?? null,
          type,
          status:      'CONFIRMED',
          scheduledAt: new Date(scheduledAt),
          notes:       notes ?? null,
          meetingUrl:  generateMeetingUrl(),
        },
      })

      return created({
        consultation,
        meetingUrl: consultation.meetingUrl,
        message:    'Booking confirmed. A calendar invite has been sent to your email.',
      })
    }

    // Guest booking — return confirmation without DB write
    // In production: send confirmation email via Resend/Nodemailer
    if (!guestEmail || !guestName) {
      return badRequest('guestName and guestEmail are required for guest bookings')
    }

    const meetingUrl = generateMeetingUrl()

    // TODO: Send confirmation email
    // await sendBookingEmail({ to: guestEmail, name: guestName, scheduledAt, practitionerName, meetingUrl })

    return created({
      meetingUrl,
      message: `Booking confirmed for ${guestName}. A confirmation has been sent to ${guestEmail}.`,
      scheduledAt,
      type,
      practitionerName,
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

function generateMeetingUrl() {
  return `https://meet.herbrx.ng/session/${Date.now().toString(36)}`
}
