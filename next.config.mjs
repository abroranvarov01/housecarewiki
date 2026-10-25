/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Production always sits behind nginx, which compresses with brotli/gzip; compressing here too would
  // hand nginx pre-gzipped bodies and block brotli.
  compress: false,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      }
    ],
    // Images are pre-optimized to WebP by scripts/optimize-images.cjs.
    unoptimized: true,
  },
  async redirects() {
    return [
      // Placeholder author personas were retired in favor of the real editorial team page.
      ...['emily-carter', 'marcus-vance', 'claire-bennett'].map((slug) => ({
        source: `/authors/${slug}`,
        destination: '/authors/housecarewiki-editors',
        statusCode: 301,
      })),
      // Legacy URLs listed in the CMS redirect manager.
      { source: '/reviews/best-portable-carpet-cleaners', destination: '/best/best-portable-carpet-cleaners-home-use-2026', statusCode: 301 },
      { source: '/guides/coffee-stain-couch', destination: '/guides/how-to-remove-coffee-stains-from-fabric-sofa', statusCode: 301 },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Editorial images are not content-hashed, so cache for 30 days rather than a year.
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
      {
        source: '/:file(favicon.svg|icon.png|apple-icon.png)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/admin',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
