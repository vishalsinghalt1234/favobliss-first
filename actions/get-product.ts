// actions/get-products.ts
"use server";

import { Product } from "@/types";
import {
  hotDeals,
  productById,
  productBySlug,
  productsList,
  recentlyViewedProducts,
} from "@/data/functions/product";
import { unstable_cache } from "next/cache";

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID || "684315296fa373b59468f387";
const PRODUCT_TAG = "products";


interface ProductQuery {
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  isFeatured?: boolean;
  limit?: number;
  page?: number;
  type?: "MEN" | "WOMEN" | "KIDS" | "BEAUTY" | "ELECTRONICS";
  price?: string;
  variantIds?: string[];
  pincode?: number;
  rating?: string;
  discount?: string;
  locationGroupId?: string;
}

interface HotDealsQuery extends ProductQuery {
  timeFrame?: "7 days" | "30 days" | "90 days" | "all time";
}

const productQueryKey = (query: ProductQuery) =>
  `products-${JSON.stringify(query)}`;
const hotDealsKey = (query: HotDealsQuery) =>
  `hot-deals-${JSON.stringify(query)}`;
const productSlugKey = (slug: string) => `product-slug-${slug}`;
const productIdKey = (id: string) => `product-id-${id}`;
const recentlyViewedKey = (productIds: string[], locationGroupId?: string) =>
  `recently-viewed-${productIds.sort().join("-")}-${locationGroupId || "none"}`;

/* ---------- GET PRODUCT BY SLUG ---------- */
const _getProductBySlug = unstable_cache(
  async (
    slug: string,
    includeRelated = false,
    locationGroupId?: string
  ): Promise<any> => {
    console.log(`[CACHE MISS] Fetching product by slug: ${slug}`);
    return await productBySlug(STORE_ID, slug, includeRelated, locationGroupId);
  },
  ["getProductBySlug"],
  {
    tags: ["products"],
    revalidate: 86400,
  }
);

export const getProductBySlug = async (
  slug: string,
  includeRelated = false,
  locationGroupId?: string
) => _getProductBySlug(slug, includeRelated, locationGroupId);



/* ---------- GET PRODUCT BY ID ---------- */
const _getProductById = unstable_cache(
  async (
    id: string,
    includeRelated = false,
    locationGroupId?: string
  ): Promise<any> => {
    console.log(`[CACHE MISS] Fetching product by id: ${id}`);
    return await productById(STORE_ID, id, includeRelated, locationGroupId);
  },
  ["getProductById"],
  {
    tags: ["products"],
    revalidate: 86400,
  }
);

export const getProductById = async (
  id: string,
  includeRelated = false,
  locationGroupId?: string
) => _getProductById(id, includeRelated, locationGroupId);



/* ---------- GET RECENTLY VIEWED ---------- */
const _getRecentlyViewedProducts = unstable_cache(
  async (productIds: string[], locationGroupId?: string): Promise<any[]> => {
    console.log(
      `[CACHE MISS] Fetching recently viewed: ${productIds.length} items`
    );
    return await recentlyViewedProducts(STORE_ID, productIds, locationGroupId);
  },
  ["getRecentlyViewedProducts"],
  {
    tags: ["products"],
    revalidate: 3600,
  }
);

export const getRecentlyViewedProducts = async (
  productIds: string[],
  locationGroupId?: string
) => _getRecentlyViewedProducts(productIds, locationGroupId);

