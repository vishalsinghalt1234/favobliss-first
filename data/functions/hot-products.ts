// lib/hot-products.ts
import { db } from "@/lib/db";

/**
 * Shared include for HotProductsSection queries
 * Loads products with full variant + pricing + images + relations
 */
const includeRelations = {
  include: {
    products: {
      include: {
        product: {
          include: {
            variants: {
              orderBy: [
                { createdAt: "asc" },
                { id: "asc" },
              ],
              include: {
                images: {
                  orderBy: [
                    { createdAt: "asc" },
                    { id: "asc" },
                  ],
                  select: {
                    id: true,
                    url: true,
                  },
                },
                variantPrices: {
                  include: {
                    locationGroup: {
                      include: { locations: true },
                    },
                  },
                },
              },
            },
            category: true,
            subCategory: true,
            brand: true,
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { position: "asc" } as const,
    },
  },
} as const;

/**
 * Get the SINGLE hot products section for a store
 * (Always returns one or null)
 */

export async function getHotProductsSection(storeId: string) {
  const section = await db.hotProductsSection.findFirst({
    where: { storeId },
    include: {
      products: {
        include: {
          product: {
            include: {
              variants: {
                orderBy: [
                  { createdAt: "asc" },
                  { id: "asc" },
                ],
                include: {
                  images: {
                    orderBy: [
                      { createdAt: "asc" },
                      { id: "asc" },
                    ],
                    select: {
                      id: true,
                      url: true,
                    },
                  },
                  variantPrices: {
                    include: {
                      locationGroup: {
                        include: { locations: true },
                      },
                    },
                  },
                },
              },
              category: true,
              subCategory: true,
              brand: true,
              reviews: { select: { rating: true } },
            },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!section) return null;

  // Flatten: extract product from the join table
  const products = section.products.map((item) => {
    const product = item.product;

    product.variants.sort((a: any, b: any) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      if (aTime !== bTime) return aTime - bTime;
      return a.id.localeCompare(b.id);
    });

    product.variants.forEach((v: any) => {
      v.images.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        if (aTime !== bTime) return aTime - bTime;
        return a.id.localeCompare(b.id);
      });
    });
    const ratings = product.reviews.map((r: { rating: number }) => r.rating);
    const numberOfRatings = ratings.length;
    const averageRating =
      numberOfRatings > 0
        ? Number(
            (ratings.reduce((a: number, b: number) => a + b, 0) / numberOfRatings).toFixed(2),
          )
        : 0;

    return {
      ...product,
      averageRating,
      numberOfRatings,
    };
  });

  return {
    bannerImage: section.bannerImage,
    products,
  };
}

/**
 * Lightweight version – only banner (for header/preload)
 */
export async function getHotProductsBanner(storeId: string) {
  return await db.hotProductsSection.findFirst({
    where: { storeId },
    select: {
      id: true,
      bannerImage: true,
      updatedAt: true,
    },
  });
}