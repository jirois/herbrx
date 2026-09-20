import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions }  from '@/lib/auth'
import { ok, created, badRequest, serverError } from '@/lib/api-helpers'

// GET /api/alerts/subscribe
// Lets the dashboard know whether the logged-in user already has a safety
// alert subscription, instead of the frontend having no way to tell and
// always defaulting to "not subscribed" on every page load.
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return ok({ subscribed: false, channels: [], herbIds: [] })
    }

    const userId = (session.user as { id: string }).id
    const sub = await prisma.alertSubscription.findUnique({ where: { userId } })

    return ok({
      subscribed: !!sub,
      channels:   sub?.channels ? JSON.parse(sub.channels) : [],
      herbIds:    sub?.herbIds  ? JSON.parse(sub.herbIds)  : [],
    })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/alerts/subscribe
// Body: { email?, channels: ['email'|'sms'], herbIds?: string[] }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body    = await req.json()
    const { email, channels = ['email'], herbIds = [] } = body

    if (session?.user) {
      const userId = (session.user as { id: string }).id

      // herbIds/channels are stored as JSON-encoded strings (see schema
      // comment) rather than Prisma's Json scalar, so encode explicitly here.
      const herbIdsJson  = JSON.stringify(Array.isArray(herbIds) ? herbIds : [])
      const channelsJson = JSON.stringify(Array.isArray(channels) ? channels : ['email'])

      await prisma.alertSubscription.upsert({
        where:  { userId },
        update: { herbIds: herbIdsJson, channels: channelsJson },
        create: { userId, herbIds: herbIdsJson, channels: channelsJson },
      })

      return created({ message: 'Subscribed successfully.', authenticated: true })
    }

    // Guest — just confirm (in production: store email in a separate GuestSubscription model)
    if (!email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return badRequest('Valid email required for guest subscription')
    }

    // TODO: store in GuestSubscription table or send to email list provider
    return created({ message: `Subscribed ${email} to safety alerts.`, authenticated: false })
  } catch (e) {
    return serverError(e)
  }
}
