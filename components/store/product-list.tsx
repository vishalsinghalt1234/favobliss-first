"use client";

import { LocationGroup, Product } from "@/types";
import { NoResults } from "./no-results";
import { ProductCard } from "./product-card";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ProductListProps {
  title: string;
  data: Product[];
  locationGroups: LocationGroup[];
  isSpaceTop?: boolean;
  isBannerProduct?: boolean;
  showViewAll?: boolean;
  link?: string;
  className?: string;
}

export const ProductList = ({
  title,
  data,
  locationGroups,
  isSpaceTop = true,
  isBannerProduct = false,
  showViewAll = false,
  link = "/latest-launches?page=1",
  className,
}: ProductListProps) => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const userName = isAuthenticated ? session?.user?.name || "User" : "User";

  return (
    <div className="space-y-2 md:space-y-8">
      {title.length > 0 && (
        <div className="relative flex items-center justify-center">
          <h3 className="text-xl md:text-3xl lg:text-4xl mb-0 md:mb-5 font-semibold text-center w-[50%]">
            {title} {title === "Recently Viewed" && `by ${userName}`}
          </h3>

          {showViewAll && (
            <Link
              href={link}
              className="absolute right-[8px] text-gray-500 text-sm hover:underline"
            >
              View All
            </Link>
          )}
        </div>
      )}

      {data.length === 0 && <NoResults />}
      <div
        className={`flex flex-row overflow-x-auto gap-2 md:gap-4 mb-2 snap-x snap-mandatory py-3 scrollbar-hide ${
          isSpaceTop ? "mt-0!" : ""
        }`}
        style={isSpaceTop ? { marginTop: "0px" } : {}}
      >
        {data.slice(0, 5).map((product) => (
          <div
            key={product.id}
            className={`flex-none w-[40vw] sm:w-[28vw] md:w-[25vw] lg:w-[25vw] ${className} ${
              isBannerProduct ? "xl:w-[16vw]" : "xl:w-[17vw]"
            } snap-start`}
          >
            <ProductCard data={product} locationGroups={locationGroups} />
          </div>
        ))}
      </div>
    </div>
  );
};
