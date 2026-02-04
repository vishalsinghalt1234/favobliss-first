// lib/image-optimizer.ts
export function getBunnyImageUrl(
  url: string,
  width?: number,
  quality: number = 85
): string {
  // If it's already a BunnyCDN URL
  if (url.includes('images.favobliss.com')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    params.append('quality', quality.toString());
    params.append('format', 'auto'); // Auto webp/avif
    
    return `${url}?${params.toString()}`;
  }
  
  // For external images, return as-is or proxy through your API
  return url;
}