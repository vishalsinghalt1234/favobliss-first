"use server";

import { Brand } from "@/types";
import { allBrands } from "@/data/functions/brand";
import { unstable_cache } from "next/cache";

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "684315296fa373b59468f387";
const BRAND_TAG = "brands";

/* ---------- GET ALL BRANDS ---------- */
export const getBrands = unstable_cache(
  async (): Promise<Brand[]> => {
    console.log(`[CACHE MISS] Fetching all brands for store: ${STORE_ID}`);
    return await allBrands(STORE_ID);
  },
  ["getBrands"],
  {
    tags: [BRAND_TAG],
    revalidate: 86400,
  }
);
