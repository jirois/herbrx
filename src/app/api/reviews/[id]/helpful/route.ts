import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, notFound, badRequest, serverError } from '@/lib/api-helpers'

// POST /api/reviews/[id]/helpful — toggles the current user's helpful vote
// on a review and returns the updated count, so "Helpful (N)" sorting and
// display stay in sync with the click that just happened.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth(req)
  if (error) return error

  try {
    const reviewId = params.id
    const user = session!.user as { id: string }
    const userId = user.id

    const review = await prisma.productReview.findUnique({ where: { id: reviewId } })
    if (!review) return notFound('Review not found')
    if (review.userId === userId) return badRequest("You can't mark your own review as helpful.")

    const existing = await prisma.reviewHelpfulVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    })

    let helpful: boolean
    const updated = await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.reviewHelpfulVote.delete({ where: { id: existing.id } })
        helpful = false
        return tx.productReview.update({
          where: { id: reviewId },
          data:  { helpfulCount: { decrement: 1 } },
        })
      }
      await tx.reviewHelpfulVote.create({ data: { reviewId, userId } })
      helpful = true
      return tx.productReview.update({
        where: { id: reviewId },
        data:  { helpfulCount: { increment: 1 } },
      })
    })

    return ok({ helpful: helpful!, helpfulCount: updated.helpfulCount })
  } catch (e) {
    return serverError(e)
  }
}
