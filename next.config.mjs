/** @type {import('next').NextConfig} */
const nextConfig = {
    images : {
         unoptimized: false,  // ✅ Enable optimization
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        remotePatterns : [
            {
                protocol : "https",
                hostname : "res.cloudinary.com",
            },
             {
                protocol : "https",
                hostname : "lh3.googleusercontent.com"
            }
        ]
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    async headers() {
        return [
            {
                source: '/assets/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/image',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;