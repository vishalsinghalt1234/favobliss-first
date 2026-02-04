// components/OptimizedImage.tsx
import Image from 'next/image';
import { getBunnyImageUrl } from '@/lib/image-optimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  className?: string;
  priority?: boolean;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height,
  quality = 85,
  ...props 
}: OptimizedImageProps) => {
  const optimizedSrc = getBunnyImageUrl(src, width, quality);
  
  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  );
};