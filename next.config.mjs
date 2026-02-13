/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.favobliss.com",
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

    // ==============================
    // ❌ NEVER CACHE AUTH ROUTES
    // ==============================

    {
      source: "/api/auth/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, no-cache, must-revalidate, max-age=0",
        },
      ],
    },

    {
      source: "/api/[...nextauth]",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, no-cache, must-revalidate, max-age=0",
        },
      ],
    },

    {
      source: "/api/register",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, no-cache, must-revalidate, max-age=0",
        },
      ],
    },

    {
      source: "/api/signup",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, no-cache, must-revalidate, max-age=0",
        },
      ],
    },

    // ==============================
    // ❌ NEVER CACHE ADDRESS ROUTES
    // (base + nested)
    // ==============================

    {
      source: "/api/v1/address",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, no-cache, must-revalidate, max-age=0",
        },
      ],
    },

    {
      source: "/api/v1/address/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, no-cache, must-revalidate, max-age=0",
        },
      ],
    },

    // ==============================
    // ✅ CACHE ALL OTHER APIs
    // ==============================

    {
      source: "/api/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=60, stale-while-revalidate=300",
        },
        {
          key: "Vary",
          value: "Cookie, Authorization",
        },
      ],
    },

    // ==============================
    // STATIC ASSETS
    // ==============================

    {
      source: "/assets/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },

    // ==============================
    // PRODUCT PAGES (ISR)
    // ==============================

    {
      source: "/:slug",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=172800",
        },
      ],
    },

    // ==============================
    // CATEGORY PAGES
    // ==============================

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
}

};

export default nextConfig;
