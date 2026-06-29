import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions }  from '@/lib/auth'
import { created, badRequest, serverError } from '@/lib/api-helpers'

// POST /api/alerts/subscribe
// Body: { email?, channels: ['email'|'sms'], herbIds?: string[] }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body    = await req.json()
    const { email, channels = ['email'], herbIds = [] } = body

    if (session?.user) {
      const userId = (session.user as { id: string }).id

      await prisma.alertSubscription.upsert({
        where:  { userId },
        update: { herbIds, channels },
        create: { userId, herbIds, channels },
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
