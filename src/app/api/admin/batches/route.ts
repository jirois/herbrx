import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'

// Allowed review statuses
type ReviewStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

// GET /api/dashboard/admin/batches
export async function GET(req: NextRequest) {
  const {  error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const url             = new URL(req.url)
    const validStatuses   = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const
    type ReviewStatus     = (typeof validStatuses)[number]
    const status          = url.searchParams.get('status')
    const statusFilter    = status && validStatuses.includes(status as ReviewStatus)
      ? status as ReviewStatus
      : undefined

    const batches = await prisma.batchSubmission.findMany({
      where:   statusFilter ? { reviewStatus: statusFilter } : {
        reviewStatus: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      },
      include: {
        product: {
          include: {
            producerProfile: { select: { businessName: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' }, // oldest first = FIFO queue
    })

    return ok({ batches })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/admin/batches
// Body: { batchId, decision: 'APPROVED'|'REJECTED', reviewNote }
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body    = await req.json()
    const { batchId, decision, reviewNote } = body

    if (!batchId || !decision) return badRequest('batchId and decision are required')
    if (!['APPROVED', 'REJECTED'].includes(decision)) return badRequest('decision must be APPROVED or REJECTED')

    const batch = await prisma.batchSubmission.findUnique({ where: { id: batchId } })
    if (!batch) return notFound('Batch not found')

    const updated = await prisma.batchSubmission.update({
      where: { id: batchId },
      data:  {
        reviewStatus: decision as ReviewStatus,
        reviewNotes:  reviewNote ?? null,
        reviewedBy:   adminId,
      },
    })

    // If approved, update parent product status to APPROVED
    if (decision === 'APPROVED') {
      await prisma.producerProduct.update({
        where: { id: batch.productId },
        data:  { status: 'APPROVED' },
      })
    }

    // Audit log
    await prisma.adminAction.create({
      data: {
        adminId,
        action:     `BATCH_${decision}`,
        targetType: 'Batch',
        targetId:   batchId,
        reason:     reviewNote ?? null,
      },
    })

    return ok({ batch: updated })
  } catch (e) {
    return serverError(e)
  }
}
