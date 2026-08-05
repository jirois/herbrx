import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'
import { notifyConsultant } from '@/lib/consultant-notify'

async function getOwnProfile(userId: string) {
  return prisma.consultantProfile.findUnique({ where: { userId } })
}

type ConsultantQueueAction = 'CONFIRM' | 'COMPLETE' | 'CANCEL' | 'RESCHEDULE'

// GET /api/dashboard/consultant/queue?scope=today|upcoming|all
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error

  try {
    const userId = (session!.user as { id: string })?.id
    const profile = await getOwnProfile(userId)
    if (!profile) return notFound('Consultant profile not found for this account')

    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') || 'upcoming'

    let dateFilter: { scheduledAt?: { gte?: Date; lte?: Date } } = {}
    if (scope === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0)
      const end = new Date(); end.setHours(23, 59, 59, 999)
      dateFilter = { scheduledAt: { gte: start, lte: end } }
    } else if (scope === 'upcoming') {
      dateFilter = { scheduledAt: { gte: new Date() } }
    }
    // scope === 'all' → no date filter, used for the consultant's full history tab

    const consultations = await prisma.consultation.findMany({
      where: {
        consultantId: profile.id,
        status: { in: scope === 'all' ? ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] : ['REQUESTED', 'CONFIRMED'] },
        ...dateFilter,
      },
      orderBy: { scheduledAt: 'asc' },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    })

    return ok({
      queue: consultations.map(c => ({
        id: c.id,
        clientName: `${c.user.firstName} ${c.user.lastName}`,
        clientEmail: c.user.email,
        clientPhone: c.user.phone,
        type: c.type,
        status: c.status,
        scheduledAt: c.scheduledAt,
        meetingUrl: c.meetingUrl,
        notes: c.notes,
      })),
      count: consultations.length,
    })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/consultant/queue
// Body: { consultationId, action: 'CONFIRM' | 'COMPLETE' | 'CANCEL' | 'RESCHEDULE', scheduledAt? }
// Lets the consultant act on their own queue — confirming a request,
// marking a session done, cancelling, or proposing a new time. Every
// mutation writes through notifyConsultant so the notification feed and
// the change stay consistent, even though these particular events are
// consultant-initiated rather than client-initiated.
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error

  try {
    const userId = (session!.user as {id: string})?.id
    const profile = await getOwnProfile(userId)
    if (!profile) return notFound('Consultant profile not found for this account')

    const body = await req.json() as { consultationId: string; action: ConsultantQueueAction; scheduledAt?: string }
    const { consultationId, action, scheduledAt } = body

    if (!consultationId || !action) return badRequest('consultationId and action are required')
    if (!['CONFIRM', 'COMPLETE', 'CANCEL', 'RESCHEDULE'].includes(action)) {
      return badRequest('action must be CONFIRM, COMPLETE, CANCEL, or RESCHEDULE')
    }
    if (action === 'RESCHEDULE' && !scheduledAt) {
      return badRequest('scheduledAt is required for RESCHEDULE')
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { user: { select: { firstName: true, lastName: true } } },
    })
    if (!consultation || consultation.consultantId !== profile.id) {
      return notFound('Consultation not found in your queue')
    }

    const statusMap: Record<Exclude<ConsultantQueueAction, 'RESCHEDULE'>, 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'> = {
      CONFIRM: 'CONFIRMED',
      COMPLETE: 'COMPLETED',
      CANCEL: 'CANCELLED',
    }

    const rescheduledAt = action === 'RESCHEDULE' ? new Date(scheduledAt as string) : undefined

    const updated = await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        ...(action !== 'RESCHEDULE' ? { status: statusMap[action] } : {}),
        ...(action === 'RESCHEDULE' ? { scheduledAt: rescheduledAt } : {}),
      },
    })

    if (action === 'CANCEL' || action === 'RESCHEDULE') {
      await notifyConsultant({
        consultantId: profile.id,
        consultationId,
        type: action === 'CANCEL' ? 'CANCELLED' : 'RESCHEDULED',
        clientName: `${consultation.user.firstName} ${consultation.user.lastName}`,
        scheduledAt: updated.scheduledAt,
      })
    }

    return ok({ consultation: updated })
  } catch (e) {
    return serverError(e)
  }
}
