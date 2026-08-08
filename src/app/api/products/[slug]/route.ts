import { prisma } from "@/lib/prisma";
import {
  ok,
  notFound,
  serverError,
} from "@/lib/api-helpers";
import type { StoreProductDetail, RelatedProduct } from '@/types'

// GET /api/products/[slug]
// Replaces the static getProductBySlug()/getRelatedProducts() calls
// (currently commented out in src/data/products.ts, which is almost
// certainly why the product detail page is broken right now, not just
// "showing stale data").

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.producerProduct.findUnique({
      where: { slug,  status: "APPROVED",
        meta: {
          is: {
            inStore: true,
          },
        },
      },
      include: { meta: true, producerProfile: { select: { businessName: true } } },
    })



  

    // Only ever expose APPROVED + inStore products publicly — a direct-link
    // guess at a draft/flagged product's slug shouldn't leak it.

    if (!product || product.status !== 'APPROVED' || !product.meta?.inStore) {
      return notFound('Product not found')
    }

    const related = await prisma.producerProduct.findMany({
      where: {
        id: {
          not: product.id,
        },
        category: product.category,
        status: "APPROVED",
        meta: {
          is: {
            inStore: true,
          },
        },
      },
      include: {
        meta: true,
      },
      take: 4,
      orderBy: {
        updatedAt: 'desc'
      }

    })
      
     const relatedProducts: RelatedProduct[] = related
      .filter(p => p.meta)
      .map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category ?? 'Uncategorized',
        price: p.meta!.price,
        imageUrl: p.meta!.imageUrl,
        emoji: p.meta!.emoji,
        badge: (p.meta!.badge as RelatedProduct['badge']) ?? null,
        badgeVariant: (p.meta!.badgeVariant as RelatedProduct['badgeVariant']) ?? null,
      }))

      const detail: StoreProductDetail = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category ?? 'Uncategorized',
      type: product.meta!.productType || 'Herbal Product',
      price: product.meta!.price,
      originalPrice: product.meta!.originalPrice,
      imageUrl: product.meta!.imageUrl,
      emoji: product.meta!.emoji,
      shortDesc: product.meta!.shortDesc || truncate(product.description) || product.name,
      longDesc: product.description || product.meta!.shortDesc || '',
      ingredients: Array.isArray(product.meta!.ingredients) ? (product.meta!.ingredients as string[]) : [],
      warnings: Array.isArray(product.meta!.warnings) ? (product.meta!.warnings as string[]) : [],
      howToUse: product.meta!.howToUse || undefined,
      rating: product.meta!.rating ?? 0,
      reviewCount: product.meta!.reviewCount ?? 0,
      nafdacNo: product.meta!.nafdacNo,
      stockCount: product.meta?.stock ?? 0,
      inStock: (product.meta?.stock ?? 0) > 0,
      unit: product.meta!.unit,
      badge: (product.meta!.badge as StoreProductDetail['badge']) ?? null,
      badgeVariant: (product.meta!.badgeVariant as StoreProductDetail['badgeVariant']) ?? null,
      
    
      tags: Array.isArray(product.meta!.tags) ? (product.meta!.tags as string[]) : [],
      producer: product.producerProfile?.businessName,
      relatedProducts,
    }


    return ok({
      product: detail })
   
  } catch (e) {
    return serverError(e);
  }
}

function truncate(text: string | null, len = 140) {
  if (!text) return undefined
  return text.length > len ? `${text.slice(0, len).trim()}…` : text
}