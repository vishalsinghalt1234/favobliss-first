"use client";

import React from "react";
import Image from '@/components/image';
import { HomePageCategoryProduct, LocationGroup, Product } from "@/types";
import { ProductCard } from "./product-card";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

interface Props {
  products: HomePageCategoryProduct[] | undefined;
  locationGroups: LocationGroup[];
}

const PromtionalBannerProducts = (props: Props) => {
  const { products, locationGroups } = props;

  const filteredProducts = products?.filter((item) =>
  item.product?.variants?.some((variant: any) =>
    variant.variantPrices?.some((vp: any) => vp.price > 0)
  )
);


  return (
    <div className="w-full bg-transparent py-2 md:py-2 rounded-3xl">
      <div className="max-w-full mx-auto px-1">
        <div className="lg:hidden flex flex-col gap-5">
          <Swiper
            className="w-full"
            modules={[FreeMode, Mousewheel]}
            freeMode={true}
            mousewheel={true}
            slidesPerView="auto"
            spaceBetween={3}
            grabCursor={true}
          >
            {filteredProducts?.map((product) => (
              <SwiperSlide
                key={product.id}
                className="flex-shrink-0 w-[40vw] min-w-[120px] max-w-[170px]"

              >
                <ProductCard data={product.product} locationGroups={locationGroups} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="hidden lg:flex gap-6 h-[375px]">

          <div className="flex-1 min-w-0">
            <Swiper
              className="h-[375px] w-full"
              modules={[FreeMode, Mousewheel]}
              freeMode={true}
              mousewheel={true}
              slidesPerView="auto"
              spaceBetween={4}
              grabCursor={true}
            >
              {filteredProducts?.map((product) => (
                <SwiperSlide
                  key={product.id}
                  className="h-full flex-shrink-0 w-full max-w-[200px] xl:max-w-[260px]"
                >
                  <ProductCard data={product.product} locationGroups={locationGroups} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromtionalBannerProducts;
