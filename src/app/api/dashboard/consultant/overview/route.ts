import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, notFound, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/consultant/overview
// Powers the dashboard home screen grid in one round trip: profile
// snapshot, today's queue count, earnings summary, unread notification
// count + latest few, and rating/feedback summary.
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['CONSULTANT'])
  if (error) return error

  try {
    const userId = session!.user.id

    const profile = await prisma.consultantProfile.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true, email: true, phone: true } } },
    })
    if (!profile) return notFound('Consultant profile not found for this account')

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const [
      queueToday,
      notifications,
      unreadCount,
      completedStats,
      monthEarnings,
      pendingPayout,
    ] = await Promise.all([
      prisma.consultation.count({
        where: {
          consultantId: profile.id,
          status: { in: ['CONFIRMED', 'REQUESTED'] },
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.consultantNotification.findMany({
        where: { consultantId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.consultantNotification.count({
        where: { consultantId: profile.id, isRead: false },
      }),
      prisma.consultation.aggregate({
        where: { consultantId: profile.id, status: 'COMPLETED', rating: { not: null } },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      prisma.consultation.aggregate({
        where: {
          consultantId: profile.id,
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { amount: true },
      }),
      prisma.consultation.aggregate({
        where: { consultantId: profile.id, status: 'COMPLETED', paymentStatus: 'PAID', payoutStatus: { in: ['NONE', 'PENDING'] } },
        _sum: { amount: true },
      }),
    ])

    const totalPayoutsAgg = await prisma.consultation.aggregate({
      where: { consultantId: profile.id, payoutStatus: 'PAID' },
      _sum: { amount: true },
    })

    const recentFeedback = await prisma.consultation.findMany({
      where: { consultantId: profile.id, rating: { not: null } },
      orderBy: { ratedAt: 'desc' },
      take: 3,
      select: {
        id: true, rating: true, feedback: true, ratedAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
    })

    return ok({
      profile: {
        id: profile.id,
        firstName: profile.user.firstName,
        lastName: profile.user.lastName,
        email: profile.user.email,
        phone: profile.user.phone,
        specialization: profile.specialization,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        status: profile.status,
        licenseNumber: profile.licenseNumber,
        yearsExperience: profile.yearsExperience,
        mustResetPassword: profile.mustResetPassword,
      },
      queue: { today: queueToday },
      notifications: { items: notifications, unreadCount },
      earnings: {
        thisMonthKobo: monthEarnings._sum.amount ?? 0,
        pendingKobo: pendingPayout._sum.amount ?? 0,
        totalPaidOutKobo: totalPayoutsAgg._sum.amount ?? 0,
      },
      rating: {
        average: completedStats._avg.rating,
        count: completedStats._count.rating,
        recentFeedback,
      },
    })
  } catch (e) {
    return serverError(e)
  }
}
