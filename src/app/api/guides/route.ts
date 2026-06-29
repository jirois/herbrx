import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { ok, serverError } from '@/lib/api-helpers'

// GET /api/guides?category=&featured=&lang=&search=
export async function GET(req: NextRequest) {
  try {
    const url      = new URL(req.url)
    const category = url.searchParams.get('category')
    const featured = url.searchParams.get('featured')
    const search   = url.searchParams.get('search')

    const guides = await prisma.safetyGuide.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
        ...(featured === 'true' ? { featured: true } : {}),
        ...(search   ? {
          OR: [
            { title:       { contains: search } },
            { description: { contains: search } },
          ],
        } : {}),
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })

    return ok({ guides })
  } catch (e) {
    return serverError(e)
  }
}
