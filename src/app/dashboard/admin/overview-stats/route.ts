import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/admin/overview-stats
// Real platform totals for the admin dashboard's KPI strip.
export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      totalOrders,
      verifiedProducers,
      totalProducers,
      mtdOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.producerProfile.count({ where: { tier: 'VERIFIED' } }),
      prisma.producerProfile.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID', createdAt: { gte: monthStart } },
        select: { total: true },
      }),
    ])

    const revenueMtd = mtdOrders.reduce((sum, o) => sum + o.total, 0)

    return ok({
      totalUsers,
      totalOrders,
      revenueMtd,
      verifiedProducers,
      totalProducers,
    })
  } catch (e) {
    return serverError(e)
  }
}
