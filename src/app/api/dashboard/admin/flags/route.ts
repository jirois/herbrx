import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, badRequest, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/admin/flags
export async function GET(req: NextRequest) {
  const {  error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const url    = new URL(req.url)
    const status = url.searchParams.get('status') // 'actioned' | 'pending'

    // Fetch flagged products
    const flaggedProducts = await prisma.producerProduct.findMany({
      where: { status: 'FLAGGED' },
      include: { producerProfile: { select: { businessName: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    // Fetch rejected batches as flags
    const rejectedBatches = await prisma.batchSubmission.findMany({
      where:   { reviewStatus: 'REJECTED' },
      include: { product: { include: { producerProfile: { select: { businessName: true } } } } },
      orderBy: { updatedAt: 'desc' },
    })

    return ok({ flaggedProducts, rejectedBatches })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/admin/flags
// Body: { targetType: 'Product'|'Batch', targetId, action: 'PAUSED'|'BANNED'|'CLEARED'|'WARNED', reason }
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body    = await req.json()
    const { targetType, targetId, action, reason } = body

    if (!targetType || !targetId || !action) {
      return badRequest('targetType, targetId, and action are required')
    }

    let result: unknown

    if (targetType === 'Product') {
      type ProductAction = 'PAUSED' | 'BANNED' | 'CLEARED' | 'WARNED'
      type ProductStatus = 'FLAGGED' | 'BANNED' | 'APPROVED'
      const statusMap: Record<ProductAction, ProductStatus> = {
        PAUSED:  'FLAGGED',
        BANNED:  'BANNED',
        CLEARED: 'APPROVED',
        WARNED:  'FLAGGED',
      }
      const newStatus = statusMap[action as ProductAction]
      if (!newStatus) return badRequest('Invalid action for Product')

      result = await prisma.producerProduct.update({
        where: { id: targetId },
        data:  {
          status:     newStatus,
          flagReason: action === 'CLEARED' ? null : (reason ?? null),
        },
      })
    }

    if (targetType === 'Batch') {
      result = await prisma.batchSubmission.update({
        where: { id: targetId },
        data:  {
          reviewStatus: action === 'CLEARED' ? 'APPROVED' : 'REJECTED',
          reviewNotes:  reason ?? null,
          reviewedBy:   adminId,
        },
      })
    }

    // Audit log
    await prisma.adminAction.create({
      data: { adminId, action, targetType, targetId, reason: reason ?? null },
    })

    return ok({ result, action })
  } catch (e) {
    return serverError(e)
  }
}
