import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, notFound, serverError } from '@/lib/api-helpers'

type SupplyChainStage = {
  stage?: string
  location?: string
  date?: string
}

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

    if (batchNo.trim().length < 1 || batchNo.trim().length > 60) {
      return badRequest('batchNo must be between 1 and 60 characters')
    }
    if (labName.trim().length < 2 || labName.trim().length > 150) {
      return badRequest('labName must be between 2 and 150 characters')
    }
    if (!/^https?:\/\/.+/.test(coaFileUrl.trim())) {
      return badRequest('coaFileUrl must be a valid URL')
    }
    if (testedAt) {
      const testedDate = new Date(testedAt)
      if (Number.isNaN(testedDate.getTime())) {
        return badRequest('testedAt must be a valid date')
      }
      if (testedDate.getTime() > Date.now()) {
        return badRequest('testedAt cannot be in the future')
      }
    }
    if (expiryDate) {
      const expiry = new Date(expiryDate)
      if (Number.isNaN(expiry.getTime())) {
        return badRequest('expiryDate must be a valid date')
      }
      if (testedAt && expiry.getTime() < new Date(testedAt).getTime()) {
        return badRequest('expiryDate cannot be before testedAt')
      }
    }
    if (Array.isArray(chainStages)) {
      const today = new Date(); today.setHours(23, 59, 59, 999)
      let lastDate: Date | null = null
      for (const stage of chainStages) {
        if (!stage?.date) continue
        const d = new Date(stage.date)
        if (Number.isNaN(d.getTime())) return badRequest('Supply chain stage dates must be valid dates')
        if (d.getTime() > today.getTime()) return badRequest('Supply chain stage dates cannot be in the future')
        if (lastDate && d.getTime() < lastDate.getTime()) {
          return badRequest('Supply chain stage dates must be in chronological order')
        }
        lastDate = d
      }
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
        supplyChain: Array.isArray(chainStages) && chainStages.length > 0
          ? chainStages.filter((s: SupplyChainStage) => s?.stage || s?.location || s?.date)
          : undefined,
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
