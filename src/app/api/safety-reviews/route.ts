import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import type { ReviewVerdict } from '@prisma/client'
import { ok, serverError } from '@/lib/api-helpers'

// GET /api/safety-reviews?verdict=&search=
export async function GET(req: NextRequest) {
  try {
    const url     = new URL(req.url)
    const verdict = url.searchParams.get('verdict')
    const search  = url.searchParams.get('search')

    const reviews = await prisma.productSafetyReview.findMany({
      where: {
        isPublished: true,
        ...(verdict ? { verdict: verdict as ReviewVerdict } : {}),
        ...(search  ? {
          OR: [
            { productName: { contains: search } },
            { producer:    { contains: search } },
          ],
        } : {}),
      },
      orderBy: { reviewDate: 'desc' },
    })

    return ok({ reviews })
  } catch (e) {
    return serverError(e)
  }
}
