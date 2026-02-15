"use server";

import {
  allHomepageCategories,
  homepageCategoryByIdOrFirst,
} from "@/data/functions/homepage-categories";
import { HomepageCategory } from "@/types";
import { unstable_cache } from "next/cache";

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "684315296fa373b59468f387";

const HOMEPAGE_CATEGORIES_TAG = "homepage-categories";
const HOMEPAGE_CATEGORY_TAG = "homepage-category";

export async function getHomepageCategory(): Promise<HomepageCategory[]> {
  const cachedFetch = unstable_cache(
    async () => {
      console.log("[CACHE MISS] Fetching all homepage categories");
      return await allHomepageCategories(STORE_ID);
    },
    ['homepage-categories-list'], // Cache key
    {
      tags: [HOMEPAGE_CATEGORIES_TAG],
    //  revalidate: 3600, // Optional: 1 hour fallback
    }
  );

  return cachedFetch();
}

export async function getHomepageCategoryById(
  idOrFirst: string
): Promise<HomepageCategory | null> {
  const cachedFetch = unstable_cache(
    async (id: string) => {
      console.log(`[CACHE MISS] Fetching homepage category: ${id}`);
      return await homepageCategoryByIdOrFirst(id);
    },
    ['homepage-category', idOrFirst], 
    {
      tags: [HOMEPAGE_CATEGORY_TAG, `${HOMEPAGE_CATEGORY_TAG}-${idOrFirst}`],
     // revalidate: 3600,
    }
  );

  return cachedFetch(idOrFirst);
};
