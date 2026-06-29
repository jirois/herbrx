import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { ok, notFound, serverError } from '@/lib/api-helpers'

// GET /api/herbs/[slug]
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const herb = await prisma.herb.findUnique({
      where: { slug: params.slug },
      include: {
        safetyReviews: {
          where: { isPublished: true },
          orderBy: { reviewDate: 'desc' },
          take: 5,
        },
      },
    })

    if (!herb || !herb.isPublished) return notFound('Herb not found')

    return ok({ herb })
  } catch (e) {
    return serverError(e)
  }
}
