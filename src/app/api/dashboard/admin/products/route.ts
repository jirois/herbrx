import { NextRequest }  from 'next/server'
import { prisma }       from '@/lib/prisma'
import { requireAuth, ok, badRequest, notFound, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/admin/products
export async function GET(req: NextRequest) {
  const {  error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const url    = new URL(req.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    const products = await prisma.producerProduct.findMany({
      where: {
        ...(status ? { status: status as 'APPROVED' | 'FLAGGED' | 'BANNED' | 'DRAFT' } : {}),
        ...(search ? {
          OR: [
            { name:        { contains: search } },
            { description: { contains: search } },
            { producerProfile: { businessName: { contains: search } } },
          ],
        } : {}),
      },
      include: {
        producerProfile: { select: { businessName: true, tier: true } },
        batchSubmissions: {
          select: { id: true, reviewStatus: true },
          orderBy: { createdAt: 'desc' },
        },
        meta: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    const shaped = products.map(p => ({
      id:           p.id,
      name:         p.name,
      category:     p.category,
      description:  p.description,
      status:       p.status,
      flagReason:   p.flagReason,
      createdAt:    p.createdAt,
      updatedAt:    p.updatedAt,
      producer:     p.producerProfile?.businessName ?? 'Unknown',
      producerTier: p.producerProfile?.tier         ?? 'UNVERIFIED',
      batches:      p.batchSubmissions.length,
      approvedBatches: p.batchSubmissions.filter(b => b.reviewStatus === 'APPROVED').length,
      // From meta
      emoji:        p.meta?.emoji       ?? '🌿',
      price:        p.meta?.price       ?? 0,
      nafdacNo:     p.meta?.nafdacNo,
      inStore:      p.meta?.inStore     ?? false,
      stock:        p.meta?.stock       ?? 0,
      sales:        p.meta?.sales       ?? 0,
      revenue:      p.meta?.revenue     ?? 0,
    }))

    return ok({ products: shaped })
  } catch (e) {
    return serverError(e)
  }
}

// PATCH /api/dashboard/admin/products
// Body: { productId, action: 'APPROVE'|'FLAG'|'BAN'|'RESTORE', reason? }
export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const adminId = (session!.user as { id: string }).id
    const body    = await req.json()
    const { productId, action, reason } = body

    if (!productId || !action) return badRequest('productId and action are required')

    const statusMap: Record<string, string> = {
      APPROVE:  'APPROVED',
      FLAG:     'FLAGGED',
      PAUSE:    'FLAGGED',
      BAN:      'BANNED',
      RESTORE:  'APPROVED',
    }

    const newStatus = statusMap[action]
    if (!newStatus) return badRequest('Invalid action')

    // Fetch product with producer info before updating, so we can notify them
    const existing = await prisma.producerProduct.findUnique({
      where:   { id: productId },
      include: {
        producerProfile: {
          include: { user: { select: { email: true, firstName: true } } },
        },
      },
    })
    if (!existing) return notFound('Product not found')

    const product = await prisma.producerProduct.update({
      where: { id: productId },
      data: {
        status:     newStatus as 'APPROVED' | 'FLAGGED' | 'BANNED',
        flagReason: ['FLAG', 'PAUSE', 'BAN'].includes(action) ? (reason ?? null) : null,
      },
      include: {
        meta: true,
        producerProfile: { select: { businessName: true, tier: true } },
        batchSubmissions: { select: { id: true, reviewStatus: true } },
      },
    })

    // Audit log
    await prisma.adminAction.create({
      data: {
        adminId,
        action:     `PRODUCT_${action}`,
        targetType: 'Product',
        targetId:   productId,
        reason:     reason ?? null,
      },
    })

    // Notify the producer by email (fire-and-forget — don't block the response)
    const producerEmail = existing.producerProfile?.user?.email
    const producerName  = existing.producerProfile?.user?.firstName ?? 'Producer'
    const productName   = existing.name

    if (producerEmail) {
      import('@/lib/mailer').then(({ sendProductStatusEmail }) => {
        sendProductStatusEmail({
          to:          producerEmail,
          firstName:   producerName,
          productName,
          action,
          reason:      reason ?? undefined,
        }).catch(err => console.error('[ProductStatus Email]', err))
      }).catch(() => {})
    }

    // Return shaped product matching what the admin UI expects
    const shaped = {
      id:             product.id,
      name:           product.name,
      category:       product.category,
      description:    product.description,
      status:         product.status,
      flagReason:     product.flagReason,
      createdAt:      product.createdAt,
      updatedAt:      product.updatedAt,
      producer:       product.producerProfile?.businessName ?? 'Unknown',
      producerTier:   product.producerProfile?.tier         ?? 'UNVERIFIED',
      batches:        product.batchSubmissions.length,
      approvedBatches: product.batchSubmissions.filter(b => b.reviewStatus === 'APPROVED').length,
      emoji:          product.meta?.emoji    ?? '🌿',
      imageUrl:       product.meta?.imageUrl ?? null,
      price:          product.meta?.price    ?? 0,
      nafdacNo:       product.meta?.nafdacNo ?? null,
      inStore:        product.meta?.inStore  ?? false,
      stock:          product.meta?.stock    ?? 0,
      sales:          product.meta?.sales    ?? 0,
    }

    return ok({ product: shaped, action })
  } catch (e) {
    return serverError(e)
  }
}
