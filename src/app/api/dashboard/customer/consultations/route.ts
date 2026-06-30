import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/customer/consultations
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id

    const consultations = await prisma.consultation.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
    })

    return ok({ consultations })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/customer/consultations
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id
    const body   = await req.json()

    const { type, scheduledAt, notes, practitionerId } = body

    if (!type || !scheduledAt) {
      return badRequest('type and scheduledAt are required')
    }

    const validTypes = ['HERBALIST', 'NATUROPATH', 'TOXICOLOGIST', 'PHARMACIST']
    if (!validTypes.includes(type)) {
      return badRequest(`type must be one of: ${validTypes.join(', ')}`)
    }

    const consultation = await prisma.consultation.create({
      data: {
        userId,
        practitionerId: practitionerId ?? null,
        type,
        status:      'CONFIRMED',
        scheduledAt: new Date(scheduledAt),
        notes:       notes ?? null,
        meetingUrl:  `https://meet.herbrx.ng/session/${Date.now()}`,
      },
    })

    return created({ consultation })
  } catch (e) {
    return serverError(e)
  }
}
