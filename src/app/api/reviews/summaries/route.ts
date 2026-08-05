import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, badRequest, serverError } from '@/lib/api-helpers'

// GET /api/reviews/summaries?ids=id1,id2,id3
// Public. Returns { summaries: { [productId]: { average, count } } } for
// every id that has at least one review — ids with no reviews are simply
// absent from the map, letting the caller show a "No reviews yet" state
// instead of a fabricated number. Built for product grids, which would
// otherwise need one review fetch per card.
export async function GET(req: NextRequest) {
  try {
    const idsParam = req.nextUrl.searchParams.get('ids')
    if (!idsParam) return badRequest('ids is required (comma-separated)')

    const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean).slice(0, 100)
    if (ids.length === 0) return ok({ summaries: {} })

    const reviews = await prisma.productReview.findMany({
      where: { productId: { in: ids } },
      select: { productId: true, rating: true },
    })

    const grouped: Record<string, number[]> = {}
    for (const r of reviews) {
      (grouped[r.productId] ??= []).push(r.rating)
    }

    const summaries: Record<string, { average: number; count: number }> = {}
    for (const [productId, ratings] of Object.entries(grouped)) {
      const count = ratings.length
      const average = Math.round((ratings.reduce((a, b) => a + b, 0) / count) * 10) / 10
      summaries[productId] = { average, count }
    }

    return ok({ summaries })
  } catch (e) {
    return serverError(e)
  }
}
