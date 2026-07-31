import { prisma } from "@/lib/prisma";
import { ok, serverError } from "@/lib/api-helpers";


export async function GET() {
  try {
    // const products = await prisma.producerProduct.findMany({
    //   where: {
    //     status: "APPROVED",
    //     meta: {
    //       is: {
    //         inStore: true,
    //       },
    //     },
    //   },
    //   include: {
    //     meta: true,
    //     producerProfile: {
    //       select: {
    //         businessName: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     updatedAt: "desc",
    //   },
    // });

   const products = await prisma.producerProduct.findMany({
  include: {
    meta: true,
    producerProfile: true,
  },
});

console.table(
  products.map((p) => ({
    name: p.name,
    status: p.status,
    inStore: p.meta?.inStore,
    producer: p.producerProfile?.businessName,
  }))
);
    return ok({
      products: products.map((p) => ({
        // Basic
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,

        // Classification
        category: p.category ?? 'Uncategorized',
        type: p.meta?.productType || p.category || "",

         // Pricing
        price: (p.meta?.price ?? 0) / 100,
        originalPrice: null,

        // Images
        imageUrl: p.meta?.imageUrl,
        emoji: p.meta?.emoji ?? "🌿",

        // Store descriptions
        shortDesc: p.description,
        longDesc: p.description,

        // Product details
        ingredients: Array.isArray(p.meta?.ingredients)
          ? p.meta.ingredients
          : [],

        warnings: Array.isArray(p.meta?.warnings)
          ? p.meta.warnings
          : [],

        nafdacNo: p.meta?.nafdacNo,

        // Inventory
        inStock: (p.meta?.stock ?? 0) > 0,
        stockCount: p.meta?.stock ?? 0,

        // Display values (can later become database fields)
        rating: 5,
        reviews: 0,

        featured: false,

        badge: "Verified",
        badgeVariant: "green",

        unit: "pack",

        gradientFrom: "#DCECC8",
        gradientTo: "#A8D08D",

        tags: [],
        
        // Producer
        producer: p.producerProfile?.businessName ?? "",

        // Dates
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}