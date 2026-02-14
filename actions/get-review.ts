"use server"

import { Review } from "@/types";
import { productReviews } from "@/data/functions/review";
import { unstable_cache } from "next/cache";

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "684315296fa373b59468f387";

export async function getReviews(
  productId: string,
  page: number = 1,
  limit: number = 10
): Promise<Review[]> {
  const cachedFetch = unstable_cache(
    async (prodId: string, pg: number, lmt: number) => {
      console.log(`[CACHE MISS] Fetching reviews for product: ${prodId}, page: ${pg}, limit: ${lmt}`);
      return await productReviews({ productId: prodId, page: pg, limit: lmt });
    },
    ['product-reviews', productId, page.toString(), limit.toString()],
    {
      tags: [`reviews-${productId}`],
    //  revalidate: 3600, // Optional fallback
    }
  );

  return cachedFetch(productId, page, limit);
}