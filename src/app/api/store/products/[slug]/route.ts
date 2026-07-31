import { prisma } from "@/lib/prisma";
import {
  ok,
  notFound,
  serverError,
} from "@/lib/api-helpers";


export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.producerProduct.findFirst({
      where: {
        slug,
        status: "APPROVED",
        meta: {
          is: {
            inStore: true,
          },
        },
      },
      include: {
        meta: true,
        producerProfile: {
        select: {
          businessName: true,
        }
      },
      },
    });

    // const product = products.find(
    //   (p) => slugify(p.name) === slug
    // );

    if (!product) {
      return notFound("Product not found");
    }

    const relatedProducts = await prisma.producerProduct.findMany({
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
      
    // .filter(
    //     (p) =>
    //       p.id !== product.id &&
    //       p.category === product.category
    //   )
    //   .slice(0, 4)
    //   .map((p) => ({
    //     id: p.id,
    //     slug: slugify(p.name),
    //     name: p.name,
    //     price: p.meta?.price ?? 0,
    //     imageUrl: p.meta?.imageUrl,
    //     emoji: p.meta?.emoji,
    //     category: p.category,
    //   }));

    return ok({
      product: {
        id: product.id,
        slug: product.slug,

        name: product.name,
        category: product.category,

        type: product.meta?.productType ?? "",

        price: product.meta?.price ?? 0,

        imageUrl: product.meta?.imageUrl,

        emoji: product.meta?.emoji,

        shortDesc: product.description,

        longDesc: product.description,

        ingredients: Array.isArray(product.meta?.ingredients)
          ? product.meta.ingredients
          : [],

        warnings: Array.isArray(product.meta?.warnings)
          ? product.meta.warnings
          : [],

        nafdacNo: product.meta?.nafdacNo,

        stockCount: product.meta?.stock ?? 0,

        inStock: (product.meta?.stock ?? 0) > 0,

        producer:
          product.producerProfile?.businessName,
        
        rating: product.meta?.rating ?? 0,

        reviews: product.meta?.reviewCount ?? 0,

        unit: product.meta?.unit ?? "pack",

        badge: product.meta?.featured ? 'Featured' : "Verified",

        badgeVariant: product.meta?.featured ? "success" : "secondary",

        gradientFrom: "#D8F3DC",
        gradientTo: "#95D5B2",

        tags: [
          product.category,
          product.meta?.productType
        ].filter(Boolean),

        howToUse: "Use according to the manufacturer's instructions",

        originalPrice: null,

        relatedProducts: relatedProducts.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.meta?.price ?? 0,
          imageUrl: p.meta?.imageUrl,
          emoji: p.meta?.emoji,
          category: p.category
        })),
      },
    });
  } catch (e) {
    return serverError(e);
  }
}