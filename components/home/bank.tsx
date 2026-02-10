import React from "react";
import { Container } from "@/components/ui/container";
import Image from "next/image";

export function Bank() {
  return (
    <Container>
      <div className="space-y-10 pb-20 mt-20">
        <div className="flex flex-col gap-y-4 md:gap-y-12 px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold ">Exciting Bank Offers</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <Image
              src="/assets/offers/offer1.webp"
              alt="Bank Offer 1"
              width={500}
              height={300}
              className="rounded-lg shadow-xl w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
            />

            <Image
              src="/assets/offers/offer1.webp"
              alt="Bank Offer 2"
              width={500}
              height={300}
              className="rounded-lg shadow-xl w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
