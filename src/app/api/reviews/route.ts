import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, forbidden, serverError } from '@/lib/api-helpers'
import { required, maxLength, minLength, collectErrors, hasErrors } from '@/lib/vaildation'

// GET /api/reviews?productId=X&stars=4&sort=recent|helpful
// Public — no auth required. Returns the review list (filtered/sorted) plus
// a summary block (average rating + star breakdown) computed over ALL
// reviews for the product, independent of the star filter, so the summary
// bars stay stable while someone plays with the filter.
export async function GET(req: NextRequest) {
  try {
    const url       = req.nextUrl
    const productId = url.searchParams.get('productId')
    const starsParam = url.searchParams.get('stars')
    const sort       = url.searchParams.get('sort') ?? 'recent'

    if (!productId) return badRequest('productId is required')

    const stars = starsParam ? Number(starsParam) : null
    if (stars !== null && (!Number.isInteger(stars) || stars < 1 || stars > 5)) {
      return badRequest('stars must be an integer between 1 and 5')
    }

    // Try to identify the current viewer so we can flag which review (if
    // any) is theirs and which reviews they've already marked helpful —
    // best-effort, this endpoint works fine for anonymous visitors too.
    const session = await getServerSession(authOptions).catch(() => null)
    const viewerId = (session?.user as { id: string })?.id ?? null

    const [allForSummary, filtered] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId },
        select: { rating: true },
      }),
      prisma.productReview.findMany({
        where: { productId, ...(stars !== null ? { rating: stars } : {}) },
        orderBy: sort === 'helpful'
          ? [{ helpfulCount: 'desc' }, { createdAt: 'desc' }]
          : [{ createdAt: 'desc' }],
        include: {
          user: { select: { firstName: true, lastName: true } },
          ...(viewerId ? { helpfulVotes: { where: { userId: viewerId } } } : {}),
        },
      }),
    ])

    const count = allForSummary.length
    const average = count > 0
      ? Math.round((allForSummary.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
      : 0
    const breakdown: Record<'5' | '4' | '3' | '2' | '1', { count: number; pct: number }> = {
      '5': { count: 0, pct: 0 }, '4': { count: 0, pct: 0 }, '3': { count: 0, pct: 0 },
      '2': { count: 0, pct: 0 }, '1': { count: 0, pct: 0 },
    }
    for (const r of allForSummary) {
      const key = String(r.rating) as keyof typeof breakdown
      if (breakdown[key]) breakdown[key].count += 1
    }
    for (const key of Object.keys(breakdown) as (keyof typeof breakdown)[]) {
      breakdown[key].pct = count > 0 ? Math.round((breakdown[key].count / count) * 100) : 0
    }

    const reviews = filtered.map((r) => ({
      id:               r.id,
      rating:           r.rating,
      title:            r.title,
      body:             r.body,
      verifiedPurchase: r.verifiedPurchase,
      helpfulCount:     r.helpfulCount,
      createdAt:        r.createdAt,
      reviewerName:     `${r.user.firstName} ${r.user.lastName.charAt(0)}.`,
      isOwnReview:      viewerId ? r.userId === viewerId : false,
      markedHelpful:    viewerId ? (r.helpfulVotes?.length ?? 0) > 0 : false,
    }))

    return ok({
      reviews,
      summary: { average, count, breakdown },
    })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/reviews — Body: { productId, rating, title, body }
// Requires a logged-in customer with a paid order containing this product.
// Upserts: submitting again for the same product edits the existing review
// rather than erroring, which is friendlier than a hard "already reviewed"
// block and still respects the one-review-per-product rule.
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req)
  if (error) return error

  try {
    const body = await req.json().catch(() => null)
    if (!body) return badRequest('Invalid request body')

    const productId = typeof body.productId === 'string' ? body.productId.trim() : ''
    const rating     = Number(body.rating)
    const title       = typeof body.title === 'string' ? body.title.trim() : ''
    const reviewBody  = typeof body.body  === 'string' ? body.body.trim()  : ''

    const errors = collectErrors({
      productId: required(productId, 'Product'),
      rating: (!Number.isInteger(rating) || rating < 1 || rating > 5) ? 'Rating must be between 1 and 5 stars.' : null,
      title: required(title, 'Review title') ?? maxLength(title, 120, 'Review title'),
      body: required(reviewBody, 'Review') ?? minLength(reviewBody, 10, 'Review') ?? maxLength(reviewBody, 5000, 'Review'),
    })
    if (hasErrors(errors)) return badRequest(Object.values(errors)[0])

    const userId = (session!.user as { id: string })?.id as string

    // Verified-purchase eligibility: a paid order containing this product.
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, paymentStatus: 'PAID' },
      },
    })

    if (!purchase) {
      return forbidden('Only customers with a verified purchase of this product can leave a review.')
    }

    const review = await prisma.productReview.upsert({
      where: { productId_userId: { productId, userId } },
      create: { productId, userId, rating, title, body: reviewBody, verifiedPurchase: true },
      update: { rating, title, body: reviewBody, verifiedPurchase: true },
    })

    return created({ review })
  } catch (e) {
    return serverError(e)
  }
}
