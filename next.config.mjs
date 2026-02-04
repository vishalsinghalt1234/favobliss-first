/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // ✅ Disable Vercel optimization
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.favobliss.com", // Your BunnyCDN domain
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  async headers() {
    return [
      // Static assets - cache forever
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // API routes - short cache
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      // Product pages - medium cache with ISR
      {
        source: "/:slug",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=172800",
          },
        ],
      },
      // Category pages - medium cache
      {
        source: "/category/:slug",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=7200",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
