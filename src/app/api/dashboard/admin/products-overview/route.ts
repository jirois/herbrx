import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, ok, serverError } from '@/lib/api-helpers'

// GET /api/dashboard/admin/products-overview
//
// Platform-wide product inventory + revenue report for the admin "Products"
// performance view. Revenue and units sold are computed from real, paid
// OrderItem rows — not from ProductMeta.sales/revenue, which nothing in the
// checkout flow increments yet — so this always reflects what's actually
// happened, even if that's currently zero for a fresh catalog.
export async function GET(req: NextRequest) {
  const { error } = await requireAuth(req, ['ADMIN'])
  if (error) return error

  try {
    const [products, paidItems] = await Promise.all([
      prisma.producerProduct.findMany({
        include: {
          meta: true,
          producerProfile: { select: { businessName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.orderItem.findMany({
        where: { order: { paymentStatus: 'PAID' } },
        select: { productId: true, price: true, quantity: true },
      }),
    ])

    const revenueByProduct: Record<string, number> = {}
    const unitsByProduct: Record<string, number> = {}
    for (const item of paidItems) {
      revenueByProduct[item.productId] = (revenueByProduct[item.productId] ?? 0) + item.price * item.quantity
      unitsByProduct[item.productId]   = (unitsByProduct[item.productId]   ?? 0) + item.quantity
    }

    const shaped = products.map(p => ({
      id:            p.id,
      slug:          p.slug,
      name:          p.name,
      category:      p.category ?? 'Uncategorized',
      status:        p.status,
      producer:      p.producerProfile?.businessName ?? 'Unknown',
      emoji:         p.meta?.emoji        ?? '🌿',
      imageUrl:      p.meta?.imageUrl     ?? null,
      price:         p.meta?.price        ?? 0,
      unit:          p.meta?.unit         ?? 'unit',
      badge:         p.meta?.badge        ?? null,
      badgeVariant:  p.meta?.badgeVariant ?? null,
      rating:        p.meta?.rating       ?? 0,
      reviewCount:   p.meta?.reviewCount  ?? 0,
      inStock:       (p.meta?.stock ?? 0) > 0,
      stockCount:    p.meta?.stock        ?? 0,
      revenue:       revenueByProduct[p.id] ?? 0,
      unitsSold:     unitsByProduct[p.id]   ?? 0,
    }))

    const totals = {
      totalProducts:  shaped.length,
      inStock:        shaped.filter(p => p.inStock).length,
      lowStock:       shaped.filter(p => p.stockCount > 0 && p.stockCount < 20).length,
      totalUnitsSold: shaped.reduce((s, p) => s + p.unitsSold, 0),
      totalRevenue:   shaped.reduce((s, p) => s + p.revenue, 0),
    }

    return ok({ products: shaped, totals })
  } catch (e) {
    return serverError(e)
  }
}
