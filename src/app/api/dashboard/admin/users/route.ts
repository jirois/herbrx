import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError, parsePagination } from '@/lib/api-helpers'

// GET /api/dashboard/admin/users
export async function GET(req: NextRequest) {
  const {  error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const url    = new URL(req.url)
    const roleParam = url.searchParams.get('role')
    const role = ['CUSTOMER', 'PRODUCER', 'ADMIN'].includes(roleParam ?? '')
      ? roleParam as 'CUSTOMER' | 'PRODUCER' | 'ADMIN'
      : null
    const search = url.searchParams.get('search')
    const { skip, limit } = parsePagination(url)

    const where = {
      ...(role ? { role } : {}),
      ...(search ? {
        OR: [
          { email:     { contains: search } },
          { firstName: { contains: search } },
          { lastName:  { contains: search } },
        ],
      } : {}),
    }

    const [users, total, flagCounts] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true,
          email: true, phone: true, role: true,
          status: true, emailVerified: true, createdAt: true,
          statusNote: true,
          producerProfile: {
            select: { businessName: true, tier: true, products: { select: { id: true } } },
          },
          orders: { select: { id: true, total: true, paymentStatus: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.user.count({ where }),
      // Real "times actioned against by an admin" count, used as the flag indicator
      prisma.adminAction.groupBy({
        by: ['targetId'],
        where: { targetType: 'User' },
        _count: { targetId: true },
      }),
    ])

    const flagCountByUser = new Map(flagCounts.map(f => [f.targetId, f._count.targetId]))

    // Shape the data cleanly
    const shaped = users.map(u => ({
      id:            u.id,
      firstName:     u.firstName,
      lastName:      u.lastName,
      email:         u.email,
      phone:         u.phone,
      role:          u.role,
      status:        u.status,
      statusNote:    u.statusNote,
      emailVerified: u.emailVerified,
      createdAt:     u.createdAt,
      businessName:  u.producerProfile?.businessName,
      tier:          u.producerProfile?.tier,
      productCount:  u.producerProfile?.products?.length ?? 0,
      orders:        u.orders.length,
      totalSpend:    u.orders
        .filter(o => o.paymentStatus === 'PAID')
        .reduce((s, o) => s + o.total, 0),
      flagCount: flagCountByUser.get(u.id) ?? 0,
    }))

    return ok({ users: shaped, total, page: Math.ceil(skip / limit) + 1, limit })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/admin/users
// Body: { userId, action, note }
// action: 'SUSPEND' | 'BAN' | 'ACTIVATE'
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body    = await req.json()
    const { userId, action, note } = body

    if (!userId || !action) return badRequest('userId and action are required')

    const statusMap: Record<string, 'ACTIVE' | 'SUSPENDED' | 'BANNED'> = {
      SUSPEND: 'SUSPENDED',
      BAN: 'BANNED',
      ACTIVATE: 'ACTIVE',
    }
    const nextStatus = statusMap[action]
    if (!nextStatus) return badRequest(`Unknown action: ${action}`)

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return notFound('User not found')

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: nextStatus, statusNote: note ?? null },
      select: { id: true, status: true, statusNote: true },
    })

    // Audit log the action
    await prisma.adminAction.create({
      data: {
        adminId,
        action:     `USER_${action}`,
        targetType: 'User',
        targetId:   userId,
        reason:     note ?? null,
      },
    })

    return ok({ ...updated, message: `User ${action.toLowerCase()}d successfully` })
  } catch (e) {
    return serverError(e)
  }
}
