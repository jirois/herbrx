import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'

// POST /api/dashboard/producer/products/submit
// Body: { productId }
//
// Transitions a DRAFT or FLAGGED product to PENDING_REVIEW so that
// admin can see it in their review queue and approve it for the store.
//
// Validation before allowing submission:
//  - Product must belong to the requesting producer
//  - Product must have a name, description, category, and price
//  - Product must be DRAFT or FLAGGED (can't re-submit an APPROVED product)
//
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER'])
  if (error) return error

  try {
    const userId = (session!.user as { id: string }).id
    const body   = await req.json()
    const { productId } = body

    if (!productId) return badRequest('productId is required')

    // Ownership check
    const profile = await prisma.producerProfile.findUnique({ where: { userId } })
    if (!profile) return badRequest('Producer profile not found. Complete your profile first.')

    const product = await prisma.producerProduct.findFirst({
      where:   { id: productId, producerProfileId: profile.id },
      include: { meta: true },
    })
    if (!product) return notFound('Product not found or does not belong to you')

    // Status guard
    const allowedStatuses = ['DRAFT', 'FLAGGED']
    if (!allowedStatuses.includes(product.status)) {
      return badRequest(
        product.status === 'PENDING_REVIEW'
          ? 'This product is already submitted and awaiting admin review.'
          : product.status === 'APPROVED'
          ? 'This product is already approved. Use the store listing toggle to make it visible.'
          : `Cannot submit a product with status ${product.status}.`
      )
    }

    // Content validation — admin needs enough info to review
    const issues: string[] = []
    if (!product.name?.trim())        issues.push('Product name is required')
    if (!product.description?.trim()) issues.push('Product description is required')
    if (!product.category?.trim())    issues.push('Product category is required')
    if (!product.meta?.price || product.meta.price <= 0) issues.push('Set a price before submitting')

    if (issues.length > 0) {
      return badRequest(`Please complete the following before submitting: ${issues.join('; ')}`)
    }

    const updated = await prisma.producerProduct.update({
      where: { id: productId },
      data:  {
        status:     'PENDING_REVIEW',
        flagReason: null,           // clear any previous flag reason on resubmission
        updatedAt:  new Date(),
      },
      include: { meta: true },
    })

    // Audit log
    await prisma.adminAction.create({
      data: {
        adminId:    userId,
        action:     'PRODUCT_SUBMITTED_FOR_REVIEW',
        targetType: 'Product',
        targetId:   productId,
        reason:     `Producer submitted "${product.name}" for admin review`,
      },
    }).catch(() => {})

    return ok({
      product: updated,
      message: `"${product.name}" has been submitted for admin review. You'll be notified once it's approved.`,
    })
  } catch (e) {
    return serverError(e)
  }
}
