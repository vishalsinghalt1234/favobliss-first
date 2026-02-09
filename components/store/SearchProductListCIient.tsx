"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/store/product-card";
import { NoResults } from "@/components/store/no-results";
import { PaginationComponent } from "./_components/pagination";
import { LocationGroup } from "@/types";

interface SearchProductListClientProps {
  searchQuery: string;
  locationGroups: LocationGroup[];
  filteredSizes: any[];
  colors: any[];
  brands: any[];
  priceRanges: any[];
  ratingRanges: any[];
  discountRanges: any[];
  allProducts: any[];
}

export default function SearchProductListClient({
  searchQuery,
  locationGroups,
  allProducts,
}: SearchProductListClientProps) {
  const searchParams = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<any[]>(allProducts);
  const [totalProducts, setTotalProducts] = useState<number>(allProducts.length);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;
  const totalPages = Math.ceil(totalProducts / 12);

  useEffect(() => {
    let products = [...allProducts];
    const colorId = searchParams.get("colorId");
    if (colorId) {
      products = products.filter((p: any) =>
        p.variants.some((v: any) => v.colorId === colorId)
      );
    }

    const sizeId = searchParams.get("sizeId");
    if (sizeId) {
      products = products.filter((p: any) =>
        p.variants.some((v: any) => v.sizeId === sizeId)
      );
    }

    const brandId = searchParams.get("brandId");
    if (brandId) {
      products = products.filter((p: any) => p.brandId === brandId);
    }

    const priceRange = searchParams.get("price");
    if (priceRange) {
      let [minStr, maxStr] = priceRange.split("-");
      let minPrice = parseFloat(minStr) || 0;
      let maxPrice = maxStr ? parseFloat(maxStr) : Infinity;

      products = products.filter((p: any) =>
        p.variants.some((v: any) =>
          v.variantPrices.some((vp: any) => {
            const price = vp.price;
            return price >= minPrice && price <= maxPrice;
          })
        )
      );
    }

    const ratingStr = searchParams.get("rating");
    if (ratingStr) {
      const minRating = parseInt(ratingStr, 10);
      products = products.filter((p: any) => {
        if (!p.reviews || p.reviews.length === 0) return false;
        const avgRating =
          p.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          p.reviews.length;
        return avgRating >= minRating;
      });
    }

    const discountStr = searchParams.get("discount");
    if (discountStr) {
      const minDiscount = parseInt(discountStr, 10);
      products = products.filter((p: any) => {
        let maxDisc = 0;
        p.variants.forEach((v: any) => {
          v.variantPrices.forEach((vp: any) => {
            if (vp.mrp > 0) {
              const disc = ((vp.mrp - vp.price) / vp.mrp) * 100;
              if (disc > maxDisc) maxDisc = disc;
            }
          });
        });
        return maxDisc >= minDiscount;
      });
    }

    setFilteredProducts(products);
    setTotalProducts(products.length);
  }, [searchParams, allProducts]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      {paginatedProducts.length === 0 ? (
        <NoResults />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
          {paginatedProducts.map((product: any) => (
            <ProductCard
              key={product.id}
              data={product}
              locationGroups={locationGroups}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="w-full flex items-center justify-center pt-12">
          <PaginationComponent currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </>
  );
}