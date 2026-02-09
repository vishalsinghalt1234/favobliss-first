"use client";

import {
  HomepageCategory,
  HomePageCategoryProduct,
  LocationGroup,
} from "@/types";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductSkeleton } from "./product-skeleton";
import CategoryButtons from "./CategoryButtons";
import PromtionalBannerProducts from "./PromotionalBannerProducts";
import { getHomepageCategoryById } from "@/actions/get-homepage-categories";

interface Props {
  locationGroups: LocationGroup[];
  categories: HomepageCategory[];
}

const PromotionalBanner = (props: Props) => {
  const { locationGroups, categories } = props;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [category, setCategory] = useState<string>(categories[0]?.id ?? "");
  const [product, setProduct] = useState<HomePageCategoryProduct[] | undefined>(
    [],
  );

  const categoryChange = (id: string) => {
    setCategory(id);
  };

  useEffect(() => {
    const getData = async () => {
      if (!category) return;
      setLoading(true);
      const productsData = await getHomepageCategoryById(category);
      //@ts-ignore
      setProduct(productsData.products);
      setLoading(false);
    };
    getData();
  }, [category]);

  return (
    <>
      <div className="relative rounded-3xl overflow-hidden bg-[#f8cabb] py-3 px-1 sm:p-4 lg:p-5">
        {/* TOP IMAGE SECTION */}
        <div className="relative w-full h-[180px] sm:h-[220px] md:h-[260px] rounded-2xl overflow-hidden mb-4">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/home-banner/earphone-banner.jpg')",
            }}
          />
        </div>

        <div className="relative">
          <div className="w-full lg:px-0">
            <div className="mb-4 sm:mb-6 w-full">
              {/* <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category, index) => (
                <button
                  className="bg-white rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-gray-800 font-medium hover:bg-gray-100 transition-colors duration-200 shadow-sm border border-gray-200 whitespace-nowrap text-sm sm:text-base flex-shrink-0 min-w-fit md:min-w-[150px]"
                  key={index}
                  onClick={() => categoryChange(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div> */}
              <CategoryButtons
                categories={categories}
                categoryChange={categoryChange}
              />
            </div>

            {loading ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide md:grid md:grid-cols-4 md:overflow-y-hidden max-h-[360px]">
                <ProductSkeleton className="w-[160px] sm:w-[unset] flex-shrink-0 h-[270px] md:h-[unset]" />
                <ProductSkeleton className="w-[160px] sm:w-[unset] flex-shrink-0 h-[270px]" />
                <ProductSkeleton className="w-[160px] sm:w-[unset] flex-shrink-0 h-[270px]" />
                <ProductSkeleton className="w-[160px] sm:w-[unset] flex-shrink-0 h-[270px]" />
              </div>
            ) : (
              <PromtionalBannerProducts
                products={product}
                locationGroups={locationGroups}
              />
            )}

            {!loading && product && product?.length > 0 && (
              <div className="mt-4 text-center">
                <button
                  className="bg-white text-black px-8 py-2 hover:bg-white transition-colors border rounded-lg"
                  onClick={() => {
                    const currentCat = categories.find(
                      (c) => c.id === category,
                    );
                    if (currentCat?.link) {
                      router.push(`category/${currentCat.link}?page=1`);
                    }
                  }}
                >
                  View More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PromotionalBanner;
