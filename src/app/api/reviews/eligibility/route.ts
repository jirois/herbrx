import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, badRequest, serverError } from '@/lib/api-helpers'

// GET /api/reviews/eligibility?productId=X
// Not gated behind requireAuth on purpose — an anonymous visitor is a valid
// (just "not eligible yet") outcome here, not an error.
export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get('productId')
    if (!productId) return badRequest('productId is required')

    const session = await getServerSession(authOptions).catch(() => null)
    const userId = (session?.user as { id: string })?.id ?? null

    if (!userId) {
      return ok({ loggedIn: false, hasVerifiedPurchase: false, existingReview: null })
    }

    const [purchase, existingReview] = await Promise.all([
      prisma.orderItem.findFirst({
        where: { productId, order: { userId, paymentStatus: 'PAID' } },
      }),
      prisma.productReview.findUnique({
        where: { productId_userId: { productId, userId } },
      }),
    ])

    return ok({
      loggedIn: true,
      hasVerifiedPurchase: !!purchase,
      existingReview: existingReview ? {
        id: existingReview.id, rating: existingReview.rating,
        title: existingReview.title, body: existingReview.body,
      } : null,
    })
  } catch (e) {
    return serverError(e)
  }
}
