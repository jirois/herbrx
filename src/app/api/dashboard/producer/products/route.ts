import { NextRequest }          from 'next/server'
import { prisma }               from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError } from '@/lib/api-helpers'

type AuthUser = {
  id: string
  role: string
  firstName?: string
}

// GET /api/dashboard/producer/products
export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const user = session!.user as AuthUser
    const userId = user.id
    const role   = user.role

    const profile = await prisma.producerProfile.findUnique({
      where: { userId: role === 'ADMIN' ? undefined : userId },
      include: {
        products: {
          include: {
            batchSubmissions: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!profile) return ok({ products: [], tier: 'UNVERIFIED' })

    return ok({
      products: profile.products,
      tier:     profile.tier,
      businessName: profile.businessName,
    })
  } catch (e) {
    return serverError(e)
  }
}

// POST /api/dashboard/producer/products
export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const user = session!.user as AuthUser
    const userId = user.id
    const body   = await req.json()

    const { name, category, type, emoji, price, description,
            ingredients, warnings, nafdacNo } = body

    if (!name || !category || !price || !description) {
      return badRequest('name, category, price, and description are required')
    }

    // Upsert producer profile (created automatically on first product)
    let profile = await prisma.producerProfile.findUnique({ where: { userId } })
    if (!profile) {
      profile = await prisma.producerProfile.create({
        data: { userId, businessName: `${user.firstName ?? 'Producer'}'s Business` },
      })
    }

    const product = await prisma.producerProduct.create({
      data: {
        producerProfileId: profile.id,
        name, category: category ?? type, status: 'DRAFT',
        description,
        // Store ingredients/warnings/emoji/price in description JSON field
        // (extend schema if you want dedicated columns)
      },
    })

    return created({ product })
  } catch (e) {
    return serverError(e)
  }
}
