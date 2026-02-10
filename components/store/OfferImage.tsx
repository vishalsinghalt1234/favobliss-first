import Image from "next/image";
import React from "react";

interface ProductCardProps {
  imageSrc: string;
  title: string;
}

const OfferImage: React.FC<ProductCardProps> = ({ imageSrc, title }) => {
  return (
    <div className="bg-white flex flex-col items-center text-center">
      <div className="relative w-full h-full mb-4">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default OfferImage;
