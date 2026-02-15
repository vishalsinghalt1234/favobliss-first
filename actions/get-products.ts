// actions/get-products.ts
"use server";

import { cache } from "react";
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
const CATEGORY_TAG = "categories";

interface ProductQuery {
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  limit?: number | string;
  page?: number;
  type?: "MEN" | "WOMEN" | "KIDS" | "BEAUTY" | "ELECTRONICS";
  price?: string;
  variantIds?: string[];
  pincode?: number;
  rating?: string;
  discount?: string;
  locationGroupId?: string;
  selectFields?: string[];
}

interface HotDealsQuery extends ProductQuery {
  timeFrame?: "7 days" | "30 days" | "90 days" | "all time";
}


/* ---------- GET PRODUCTS LIST ---------- */
const _getProducts = unstable_cache(
  async (
    query: ProductQuery = {}
  ): Promise<{ products: any[]; totalCount: number }> => {
    console.log(`[CACHE MISS] Fetching products:`, query);
    return await productsList(query, STORE_ID);
  },
  ["getProducts"],
  {
    // Products listing affects category pages + home, so tag both buckets
    tags: [PRODUCT_TAG, CATEGORY_TAG],
    // Keep it reasonably fresh as fallback; admin routes will purge instantly anyway
    //revalidate: false,
  }
);

export const getProducts = async (query: ProductQuery = {}) => _getProducts(query);


export const _getHotDeals = unstable_cache(
  async (query: HotDealsQuery): Promise<any[]> => {
    console.log(`[CACHE MISS] Fetching hot deals:`, query);
    return await hotDeals(query, STORE_ID);
  },
  ["getHotDeals"],
  {
    tags: [PRODUCT_TAG, CATEGORY_TAG],
    revalidate: 3600,
  }
);

export const getHotDeals = async (query: HotDealsQuery) => _getHotDeals(query);
