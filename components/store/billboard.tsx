"use client";

import React, { useEffect, useState } from "react";
import Image from "@/components/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/pagination";

const HeroSlider: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const slides = [
    {
      id: 1,
      src: "/assets/hero/banner-1.webp",
      alt: "Best Television India",
      width: 1000,
      height: 340,
      priority: true,
    },
    {
      id: 2,
      src: "/assets/hero/banner-1.webp",
      alt: "Best Television India",
      width: 1000,
      height: 340,
      priority: true,
    },
    {
      id: 3,
      src: "/assets/hero/banner-1.webp",
      alt: "Best Television India",
      width: 1000,
      height: 340,
      priority: true,
    },
  ];

  useEffect(() => {
    const loadImages = slides.map((slide) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = slide.src;
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(loadImages).then(() => setIsLoaded(true));
  }, []);

  if (!isLoaded) {
    return (
      <div className="relative w-full aspect-[3/1] max-h-[600px] bg-transparent hidden md:block px-4 md:px-6 border-0">
        <Image
          src="/assets/hero/banner-1.webp"
          alt="Best Television India"
          width={1000}
          height={340}
          className="w-full h-full object-fill object-center rounded-2xl"
          priority
          fetchPriority="high"
          sizes="100vw"
        />
      </div>
    );
  }

  return (
    <section className="w-full hidden md:block mb-7">
      <div className="w-full aspect-[3/1] max-h-[600px] overflow-hidden px-4 md:px-6 border-0">
        <Swiper
          modules={[Autoplay, Navigation]}
          //   pagination={{
          //   el: ".my-pagination",
          //   clickable: true,
          //   type: "bullets",
          // }}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            nextEl: ".swiper-next",
            prevEl: ".swiper-prev",
          }}
          className="h-full w-full rounded-2xl"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="relative w-full h-full">
              <Image
                src={slide.src}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                className="w-full h-full object-fill object-center"
                priority={slide.priority || false}
                loading="eager"
                sizes="100vw"
              />
              {/* Optional overlay */}
              <div className="absolute inset-0 bg-black/5 z-[1] border border-transparent" />
            </SwiperSlide>
          ))}
          {/* Custom arrows */}
          <div className="swiper-prev absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg cursor-pointer z-10 hover:bg-white transition-all duration-200 hidden">
            <ChevronLeft size={20} className="text-gray-800 sm:w-6 sm:h-6" />
          </div>
          <div className="swiper-next absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg cursor-pointer z-10 hover:bg-white transition-all duration-200 hidden">
            <ChevronRight size={20} className="text-gray-800 sm:w-6 sm:h-6" />
          </div>
        </Swiper>

        {/* <div className="my-pagination mt-4 flex justify-center items-center gap-2 absolute h-[20px] !top-[6%] w-full"></div> */}
      </div>
      {/* <style jsx global>{`
        .swiper-pagination-bullet {
          width: 25px;
          height: 8px;
          background: #acacac;
          opacity: 0.8;
          margin: 0 4px !important;
          transition: all 0.3s ease;
          border-radius: 4px;
        }

        .swiper-pagination {
          bottom: 300px !important;
          z-index: 100;
          position: sticky;
        }

        .swiper-pagination-bullet-active {
          width: 100px;
          height: 8px;
          background: #acacac;
          opacity: 1;
          border-radius: 4px;
        }
      `}</style> */}
    </section>
  );
};

export default HeroSlider;
