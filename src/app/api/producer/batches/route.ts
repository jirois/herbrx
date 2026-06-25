import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, notFound, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/producer/batches
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id

    const profile = await prisma.producerProfile.findUnique({
      where: { userId },
      include: {
        products: {
          include: {
            batchSubmissions: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    })

    if (!profile) return ok({ batches: [], products: [] })

    // Flatten all batches with product name attached
    const batches = profile.products.flatMap(p =>
      p.batchSubmissions.map(b => ({
        ...b,
        productName: p.name,
        productId:   p.id,
      }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const products = profile.products.map(p => ({
      id:       p.id,
      name:     p.name,
      category: p.category,
      status:   p.status,
    }))

    return ok({ batches, products })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/producer/batches
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id
    const body   = await req.json()

    const { productId, batchNo, labName, testedAt,
            expiryDate, quantity, unit, notes,
            coaFileUrl, chainStages } = body

    if (!productId || !batchNo || !labName || !coaFileUrl) {
      return badRequest('productId, batchNo, labName, and coaFileUrl are required')
    }

    // Verify the product belongs to this producer
    const profile = await prisma.producerProfile.findUnique({ where: { userId } })
    if (!profile) return notFound('Producer profile not found')

    const product = await prisma.producerProduct.findFirst({
      where: { id: productId, producerProfileId: profile.id },
    })
    if (!product) return notFound('Product not found or does not belong to you')

    const batch = await prisma.batchSubmission.create({
      data: {
        productId,
        batchNo,
        labName,
        coaFileUrl,
        testedAt:  testedAt  ? new Date(testedAt)  : null,
        reviewStatus: 'SUBMITTED',
      },
    })

    // Log admin action audit entry
    await prisma.adminAction.create({
      data: {
        adminId:    userId,
        action:     'BATCH_SUBMITTED',
        targetType: 'Batch',
        targetId:   batch.id,
        reason:     `Batch ${batchNo} submitted for ${product.name}`,
      },
    }).catch(() => {}) // non-critical

    return created({ batch })
  } catch (e) {
    return serverError(e)
  }
}
