import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { ok, serverError } from '@/lib/api-helpers'

// GET /api/press?type=COVERAGE|RELEASE
export async function GET(req: NextRequest) {
  try {
    const url  = new URL(req.url)
    const type = url.searchParams.get('type')
    const validTypes = ['COVERAGE', 'RELEASE'] as const
    const typeFilter = validTypes.find((t) => t === type)

    const items = await prisma.pressItem.findMany({
      where: {
        isPublished: true,
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      orderBy: { date: 'desc' },
    })

    return ok({ items })
  } catch (e) {
    return serverError(e)
  }
}
