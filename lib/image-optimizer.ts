/**
 * BunnyCDN Image Optimization Helper
 * Generates optimized image URLs with proper parameters
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Optimizes BunnyCDN images with transformation parameters
 * Falls back to original URL for non-BunnyCDN images
 * 
 * @param url - Image URL (BunnyCDN or external)
 * @param width - Desired width in pixels
 * @param quality - Image quality (1-100, default: 85)
 * @param options - Additional optimization options
 * @returns Optimized image URL with BunnyCDN parameters
 */
export function getBunnyImageUrl(
  url: string,
  width?: number,
  quality: number = 85,
  options?: ImageOptimizationOptions
): string {
  // Return as-is for empty URLs or non-string values
  if (!url || typeof url !== 'string') return url;

  // Don't optimize local assets (starting with /)
  if (url.startsWith('/assets') || url.startsWith('/_next')) {
    return url;
  }

  // Check if it's a BunnyCDN URL
  const isBunnyCDN = url.includes('images.favobliss.com') || 
                     url.includes('bunnycdn.com');

  // If not BunnyCDN, check if it's Cloudinary
  const isCloudinary = url.includes('res.cloudinary.com');

  // For non-CDN URLs (local assets, other domains), return as-is
  if (!isBunnyCDN && !isCloudinary) {
    return url;
  }

  // Handle BunnyCDN optimization
  if (isBunnyCDN) {
    const params = new URLSearchParams();

    // Add width parameter
    if (width) {
      params.append('width', width.toString());
    }

    // Add height parameter if provided
    if (options?.height) {
      params.append('height', options.height.toString());
    }

    // Add quality (BunnyCDN uses 'quality' parameter)
    params.append('quality', Math.min(100, Math.max(1, quality)).toString());

    // Add format (auto for best format based on browser support)
    params.append('format', options?.format || 'auto');

    // Add fit mode if provided
    if (options?.fit) {
      params.append('aspect_ratio', options.fit);
    }

    // Append params to URL
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }

  // Handle Cloudinary optimization (if you're also using it)
  if (isCloudinary) {
    return getCloudinaryUrl(url, width, quality, options?.format);
  }

  return url;
}

/**
 * Optimizes Cloudinary images using transformation URLs
 * This is a fallback for any Cloudinary images in your project
 */
function getCloudinaryUrl(
  url: string,
  width?: number,
  quality: number = 85,
  format: 'auto' | 'webp' | 'avif' | 'jpg' | 'png' = 'auto'
): string {
  try {
    // Parse the Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
    const urlParts = url.split('/upload/');
    if (urlParts.length !== 2) return url;

    const baseUrl = urlParts[0] + '/upload/';
    const publicId = urlParts[1];

    // Build transformations
    const transformations = [
      width ? `w_${width}` : '',
      `q_${quality}`,
      `f_${format}`,
      'c_limit', // Don't upscale images
    ].filter(Boolean).join(',');

    return `${baseUrl}${transformations}/${publicId}`;
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', error);
    return url;
  }
}

/**
 * Get responsive image srcset for BunnyCDN
 * Useful for <img> tags with srcset attribute
 */
export function getBunnySrcSet(
  url: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920],
  quality: number = 85
): string {
  return widths
    .map(width => `${getBunnyImageUrl(url, width, quality)} ${width}w`)
    .join(', ');
}

/**
 * Preload critical images for better performance
 * Add to page head for LCP optimization
 */
export function getImagePreloadLink(
  url: string,
  width?: number,
  quality: number = 85
): string {
  const optimizedUrl = getBunnyImageUrl(url, width, quality);
  return `<link rel="preload" as="image" href="${optimizedUrl}" />`;
}
