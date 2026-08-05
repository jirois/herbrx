import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'

async function getOwnProfile(userId: string) {
  return prisma.consultantProfile.findUnique({ where: { userId } })
}

// GET /api/dashboard/consultant/notifications?status=UNREAD&limit=20
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error

  try {
    const userId = (session!.user as {id: string})?.id
    const profile = await getOwnProfile(userId)
    if (!profile) return notFound('Consultant profile not found for this account')

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // 'UNREAD' | null (=all)
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)

    const notifications = await prisma.consultantNotification.findMany({
      where: {
        consultantId: profile.id,
        ...(status === 'UNREAD' ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return ok({ notifications })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/consultant/notifications
// Body: { id: string } to mark one read, or { all: true } to mark everything read.
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error

  try {
    const userId = (session!.user as {id: string})?.id
    const profile = await getOwnProfile(userId)
    if (!profile) return notFound('Consultant profile not found for this account')

    const body = await req.json()
    const { id, all } = body

    if (all) {
      await prisma.consultantNotification.updateMany({
        where: { consultantId: profile.id, isRead: false },
        data: { isRead: true },
      })
      return ok({ updated: 'all' })
    }

    if (!id) return badRequest('id or all is required')

    // Scope the update to this consultant's own notifications so one
    // consultant can't mark another's feed as read by guessing an id.
    const result = await prisma.consultantNotification.updateMany({
      where: { id, consultantId: profile.id },
      data: { isRead: true },
    })
    if (result.count === 0) return notFound('Notification not found')

    return ok({ updated: id })
  } catch (e) {
    return serverError(e)
  }
}
