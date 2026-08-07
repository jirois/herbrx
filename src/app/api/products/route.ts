import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, serverError } from '@/lib/api-helpers'
import type { StoreProduct } from '@/types'

// GET /api/products
// This is the fix: the storefront was reading a static file that never
// reflected admin approvals. A product is visible here only when BOTH are
// true — status: APPROVED (admin/reviewer sign-off) AND meta.inStore: true
// (producer has actually listed it for sale — lets them pull an approved
// item from sale without losing its approval history, e.g. temporarily
// out of stock or discontinued).
//
// If products still don't show up after approval, check whether your
// admin-approve action also flips ProductMeta.inStore — see
// PRODUCT-STOREFRONT-FIX-NOTES.md.


export async function GET(req: NextRequest) {
   try {
    const category = req.nextUrl.searchParams.get('category')

    const products = await prisma.producerProduct.findMany({
      where: {
        status: 'APPROVED',
        meta: { inStore: true },
        ...(category && category !== 'All Products' ? { category } : {}),
      },
      include: {
        meta: true,
        producerProfile: { select: { businessName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const shaped: StoreProduct[] = products
      .filter(p => p.meta) // defensive — a product shouldn't exist without meta, but don't 500 if one does
      .map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category ?? 'Uncategorized',
        type: p.meta!.productType || undefined,
        price: p.meta!.price,
        originalPrice: p.meta!.originalPrice,
        imageUrl: p.meta!.imageUrl,
        emoji: p.meta!.emoji,
        producer: p.producerProfile?.businessName,
        description: p.meta!.shortDesc || truncate(p.description),
        inStock: p.meta!.stock > 0,
        stockCount: p.meta!.stock,
        rating: p.meta!.rating,
        reviewCount: p.meta!.reviewCount,
        unit: p.meta!.unit,
        badge: (p.meta!.badge as StoreProduct['badge']) ?? null,
        badgeVariant: (p.meta!.badgeVariant as StoreProduct['badgeVariant']) ?? null,
        tags: Array.isArray(p.meta!.tags) ? (p.meta!.tags as string[]) : [],
        featured: p.meta!.featured,
      }))

    return ok({ products: shaped })
  } catch (e) {
    return serverError(e)
  }
}

function truncate(text: string | null, len = 140) {
  if (!text) return undefined
  return text.length > len ? `${text.slice(0, len).trim()}…` : text
}
