'use client';

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { getBunnyImageUrl } from '@/lib/image-optimizer';

/**
 * Drop-in replacement for Next.js Image component
 * Automatically optimizes BunnyCDN images
 * Supports ALL Next.js Image props including fill, sizes, priority, etc.
 */
type ExtendedImageProps = NextImageProps & {
  // Legacy/optional props some codebases still pass (Next may not type these anymore)
  layout?: any;
  objectFit?: any;
  objectPosition?: any;
  lazyBoundary?: string;
  lazyRoot?: string;
  fetchPriority?: any;
};

export default function Image({
  src,
  alt,
  width,
  height,
  quality,
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
}: ExtendedImageProps) {
  // Convert `number | `${number}` | undefined` -> `number | undefined`
  const toNumber = (v: unknown): number | undefined => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  // Optimize only when:
  // 1) src is a string (not a static import)
  // 2) unoptimized is not true
  const shouldOptimize = typeof src === 'string' && !unoptimized;

  // Use provided quality (string/number) or default
  const imageQuality: number = toNumber(quality) ?? 85;

  // Use width if available and not using fill layout
  const numericWidth = !fill ? toNumber(width) : undefined;

  const optimizedSrc =
    shouldOptimize && numericWidth
      ? getBunnyImageUrl(src, numericWidth, imageQuality)
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
      // legacy passthrough (may be ignored by Next internally)
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
