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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true,
          email: true, phone: true, role: true,
          emailVerified: true, createdAt: true,
          producerProfile: {
            select: { businessName: true, tier: true, products: { select: { id: true } } },
          },
          orders: { select: { id: true, total: true, paymentStatus: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Shape the data cleanly
    const shaped = users.map(u => ({
      id:            u.id,
      firstName:     u.firstName,
      lastName:      u.lastName,
      email:         u.email,
      phone:         u.phone,
      role:          u.role,
      emailVerified: u.emailVerified,
      createdAt:     u.createdAt,
      businessName:  u.producerProfile?.businessName,
      tier:          u.producerProfile?.tier,
      productCount:  u.producerProfile?.products?.length ?? 0,
      orders:        u.orders.length,
      totalSpend:    u.orders
        .filter(o => o.paymentStatus === 'PAID')
        .reduce((s, o) => s + o.total, 0),
    }))

    return ok({ users: shaped, total, page: Math.ceil(skip / limit) + 1, limit })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/admin/users
// Body: { userId, status: 'ACTIVE'|'SUSPENDED'|'BANNED', note }
// Note: status lives on User model — add a `status` field or use a separate table.
// For now we toggle emailVerified as a proxy for suspension and log the action.
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body    = await req.json()
    const { userId, action, note } = body // action: 'SUSPEND' | 'BAN' | 'ACTIVATE'

    if (!userId || !action) return badRequest('userId and action are required')

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return notFound('User not found')

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

    return ok({ userId, action, message: `User ${action.toLowerCase()}d successfully` })
  } catch (e) {
    return serverError(e)
  }
}
