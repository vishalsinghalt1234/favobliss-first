"use client";

import Image from '@/components/image';
import { useState } from "react";

interface BrandLogoProps {
  src: string | null | undefined;
  alt: string;
}

export default function BrandLogo({ src, alt }: BrandLogoProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder-brand.png");

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
      className="object-contain p-2"
      onError={() => {
        setImgSrc("/placeholder-brand.png");
      }}
    />
  );
}