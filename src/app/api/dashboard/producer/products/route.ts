import { NextRequest }          from 'next/server'
import { prisma }               from '@/lib/prisma'
import { requireAuth, ok, created, badRequest, serverError, notFound } from '@/lib/api-helpers'

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
              orderBy: { createdAt: 'desc' }
            },
            meta: true,
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
            ingredients, warnings, nafdacNo, imageUrl } = body

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
        name,
        category: category ?? type,
        status:   'DRAFT',
        description,
        meta: {
          create: {
            price:       Number(price) || 0,
            emoji:       emoji ?? '🌿',
            productType: type ?? category ?? '',
            ingredients: ingredients ?? [],
            warnings:    warnings ?? [],
            nafdacNo:    nafdacNo ?? null,
            imageUrl: imageUrl ?? null,
          },
        },
      },
    })

    return created({ product })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/producer/products
// Body: { productId, name?, category?, type?, emoji?, price?, description?,
//         ingredients?, warnings?, nafdacNo?, inStore? }
// Used for edits, store toggle, and (with a different productId/name) duplication.
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const user = session!.user as AuthUser
    const userId = user.id
    const body   = await req.json()
    const { productId, name, category, type, emoji, price, description,
            ingredients, warnings, nafdacNo, inStore, imageUrl } = body

    if (!productId) return badRequest('productId is required')

    // Ownership check — a producer can only edit their own products.
    const profile = await prisma.producerProfile.findUnique({ where: { userId } })
    const role    = user.role
    if (role !== 'ADMIN') {
      const owns = await prisma.producerProduct.findFirst({
        where: { id: productId, producerProfileId: profile?.id },
      })
      if (!owns) return notFound('Product not found or does not belong to you')
    }

    const product = await prisma.producerProduct.update({
      where: { id: productId },
      data: {
        ...(name        !== undefined ? { name }        : {}),
        ...(category     !== undefined ? { category }     : {}),
        ...(description !== undefined ? { description } : {}),
        meta: {
          upsert: {
            create: {
              price:       Number(price) || 0,
              emoji:       emoji ?? '🌿',
              productType: type ?? category ?? '',
              ingredients: ingredients ?? [],
              warnings:    warnings ?? [],
              nafdacNo:    nafdacNo ?? null,
              inStore:     inStore ?? false,
              imageUrl:   imageUrl ?? null,
            },
            update: {
              ...(price       !== undefined ? { price: Number(price) || 0 } : {}),
              ...(emoji       !== undefined ? { emoji }                     : {}),
              ...(type        !== undefined ? { productType: type }         : {}),
              ...(ingredients !== undefined ? { ingredients }               : {}),
              ...(warnings    !== undefined ? { warnings }                  : {}),
              ...(nafdacNo    !== undefined ? { nafdacNo }                  : {}),
              ...(inStore     !== undefined ? { inStore }                   : {}),
              ...(imageUrl    !== undefined ? { imageUrl }                  : {}),
            },
          },
        },
      },
      include: { meta: true, batchSubmissions: true },
    })

    return ok({ product })
  } catch (e) {
    return serverError(e)
  }
}

// DELETE /api/dashboard/producer/products?id=...
export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['PRODUCER', 'ADMIN'])
  if (error) return error

  try {
    const user = session!.user as AuthUser
    const userId    = user.id
    const role      = user.role
    const url       = new URL(req.url)
    const productId = url.searchParams.get('id')

    if (!productId) return badRequest('id query param is required')

    if (role !== 'ADMIN') {
      const profile = await prisma.producerProfile.findUnique({ where: { userId } })
      const owns    = await prisma.producerProduct.findFirst({
        where: { id: productId, producerProfileId: profile?.id },
      })
      if (!owns) return notFound('Product not found or does not belong to you')
    }

    // meta and batchSubmissions cascade-delete via the schema's onDelete: Cascade
    await prisma.producerProduct.delete({ where: { id: productId } })

    return ok({ success: true, deletedId: productId })
  } catch (e) {
    return serverError(e)
  }
}
