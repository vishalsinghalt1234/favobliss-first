"use server";

import { Brand } from "@/types";
import { brandBySlug } from "@/data/functions/brand";
import { unstable_cache } from "next/cache";

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "684315296fa373b59468f387";
const BRAND_TAG = "brands";

export const getBrandBySlug = unstable_cache(
  async (slug: string): Promise<Brand | null> => {
    console.log(`[CACHE MISS] Fetching brand by slug: ${slug}`);
    return await brandBySlug(STORE_ID, slug);
  },
  ["getBrandBySlug"], // base key
  {
    tags: [BRAND_TAG],
    revalidate: 86400,
  }
);
