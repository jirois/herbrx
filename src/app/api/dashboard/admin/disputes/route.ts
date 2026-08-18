import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/admin/disputes
export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        order: { select: { id: true, custFirstName: true, custLastName: true, custEmail: true, total: true } },
        raisedBy: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const shaped = disputes.map(d => ({
      id: d.id,
      orderId: d.orderId,
      customer: d.raisedBy
        ? `${d.raisedBy.firstName} ${d.raisedBy.lastName}`
        : `${d.order.custFirstName} ${d.order.custLastName}`,
      email: d.raisedBy?.email ?? d.order.custEmail,
      amount: d.order.total,
      subject: d.subject,
      description: d.description,
      status: d.status,
      resolution: d.resolution,
      createdAt: d.createdAt,
      resolvedAt: d.resolvedAt,
    }))

    const counts = {
      open: disputes.filter(d => d.status === 'OPEN' || d.status === 'INVESTIGATING').length,
      resolved: disputes.filter(d => d.status === 'RESOLVED').length,
      closed: disputes.filter(d => d.status === 'CLOSED').length,
      amountAtRisk: disputes
        .filter(d => d.status !== 'RESOLVED')
        .reduce((s, d) => s + d.order.total, 0),
    }

    return ok({ disputes: shaped, counts })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/admin/disputes  { disputeId, status, resolution? }
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body = await req.json()
    const { disputeId, status, resolution } = body
    if (!disputeId || !status) return badRequest('disputeId and status are required')

    const existing = await prisma.dispute.findUnique({ where: { id: disputeId } })
    if (!existing) return notFound('Dispute not found')

    const updated = await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status,
        resolution: resolution ?? existing.resolution,
        ...(status === 'RESOLVED' || status === 'CLOSED'
          ? { resolvedAt: new Date(), resolvedBy: adminId }
          : {}),
      },
    })

    await prisma.adminAction.create({
      data: {
        adminId,
        action: `DISPUTE_${status}`,
        targetType: 'Dispute',
        targetId: disputeId,
        reason: resolution ?? null,
      },
    })

    return ok({ dispute: updated })
  } catch (e) {
    return serverError(e)
  }
}
