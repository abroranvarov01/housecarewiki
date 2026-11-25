// Guides merged into a stronger guide during the Nov 2026 SEO consolidation (docs/seo-recovery-2026-11.md).
// Each old URL 301s to the guide that now holds its content. Kept inline: the runtime image only ships this file.
const mergedGuides = {
  'can-you-mix-bleach-and-ammonia': 'cleaning-products-you-should-never-mix',
  'can-you-mix-bleach-and-rubbing-alcohol': 'cleaning-products-you-should-never-mix',
  'can-you-mix-hydrogen-peroxide-and-vinegar': 'cleaning-products-you-should-never-mix',
  'can-you-put-cast-iron-in-the-dishwasher': 'how-to-clean-a-cast-iron-skillet',
  'can-you-use-vinegar-on-hardwood-floors': 'how-to-clean-hardwood-floors',
  'can-you-use-a-steam-mop-on-hardwood-floors': 'how-to-clean-hardwood-floors',
  'how-to-clean-a-white-porcelain-kitchen-sink': 'how-to-clean-a-porcelain-sink',
  'how-to-clean-a-keurig': 'how-to-clean-a-coffee-maker',
  'how-to-descale-a-nespresso-machine': 'how-to-clean-a-coffee-maker',
  'how-to-clean-ugg-boots': 'how-to-clean-suede-boots',
  'can-you-put-a-yeti-in-the-dishwasher': 'how-to-clean-a-stanley-cup',
  'how-to-clean-fireplace-glass': 'how-to-clean-out-a-fireplace',
  'how-to-get-red-wine-out-of-a-couch': 'how-to-get-red-wine-out-of-carpet',
  'how-to-get-red-wine-out-of-clothes': 'how-to-get-red-wine-out-of-carpet',
  // Round 2 (2026-11-25)
  'how-to-get-candle-wax-off-wood': 'how-to-get-candle-wax-out-of-carpet',
  'how-to-get-candle-wax-out-of-clothes': 'how-to-get-candle-wax-out-of-carpet',
  'how-to-get-gum-out-of-clothes': 'how-to-get-gum-out-of-carpet',
  'how-to-get-gravy-out-of-clothes': 'how-to-remove-grease-stains-from-clothes',
  'how-to-get-deodorant-stains-out-of-clothes': 'how-to-remove-yellow-armpit-stains-from-white-shirts',
  'how-to-get-lipstick-out-of-clothes': 'how-to-get-makeup-out-of-clothes',
  'how-to-remove-hard-water-stains-from-tile': 'how-to-clean-shower-tiles',
  'how-to-wash-a-down-jacket': 'how-to-wash-a-down-comforter',
  'how-to-wash-cashmere': 'how-to-wash-a-wool-sweater',
  'how-to-clean-a-roasting-pan': 'how-to-clean-a-baking-sheet',
  'how-to-clean-a-glass-baking-dish': 'how-to-clean-a-baking-sheet',
  'how-to-clean-a-roaster-oven': 'how-to-clean-a-slow-cooker',
};

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

/** @type {import('next').NextConfig} */
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
      ...Object.entries(mergedGuides).map(([from, to]) => ({
        source: `/guides/${from}`,
        destination: `/guides/${to}`,
        statusCode: 301,
      })),
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
