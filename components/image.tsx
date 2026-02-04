'use client';

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { getBunnyImageUrl } from '@/lib/image-optimizer';

/**
 * Drop-in replacement for Next.js Image component
 * Automatically optimizes BunnyCDN images
 * Supports ALL Next.js Image props including fill, layout, sizes, etc.
 * No code changes needed - just update imports!
 */
export default function Image({ 
  src, 
  alt, 
  width,
  height,
  quality = 85,
  fill,
  sizes,
  priority,
  loading,
  placeholder,
  blurDataURL,
  unoptimized,
  onLoadingComplete,
  onLoad,
  onError,
  layout,
  objectFit,
  objectPosition,
  lazyBoundary,
  lazyRoot,
  fetchPriority,
  className,
  style,
  ...restProps 
}: NextImageProps) {
  // Only optimize if:
  // 1. src is a string (not imported image)
  // 2. unoptimized prop is not set to true
  // 3. We have width or fill is true
  const shouldOptimize = typeof src === 'string' && !unoptimized;
  
  const optimizedSrc = shouldOptimize
    ? getBunnyImageUrl(
        src, 
        // Use width for optimization, unless using fill layout
        typeof width === 'number' && !fill ? width : undefined,
        quality
      )
    : src;

  return (
    <NextImage
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      quality={quality}
      priority={priority}
      loading={loading}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      unoptimized={unoptimized}
      onLoadingComplete={onLoadingComplete}
      onLoad={onLoad}
      onError={onError}
      // @ts-ignore - legacy props that might still be used
      layout={layout}
      objectFit={objectFit}
      objectPosition={objectPosition}
      lazyBoundary={lazyBoundary}
      lazyRoot={lazyRoot}
      fetchPriority={fetchPriority}
      className={className}
      style={style}
      {...restProps}
    />
  );
}
