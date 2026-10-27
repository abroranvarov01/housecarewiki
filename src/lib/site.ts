// Single source of truth for site-wide data. Metadata, JSON-LD, sitemap and robots read only from here.
export const SITE = {
  url: 'https://housecarewiki.com',
  name: 'HouseCareWiki',
  legalName: 'HouseCareWiki',
  tagline: 'Home Cleaning Guides & Honest Product Research',
  description:
    'Step-by-step fixes for stains, grime and clutter, surface safety guides, free cleaning tools and research-based product reviews that say exactly what they are based on.',
  lang: 'en-US',
  ogLocale: 'en_US',
  email: 'hello@housecarewiki.com',
  logo: '/icon.png',
  defaultOgImage: '/og',
  themeColor: '#F8F4EB',
  backgroundColor: '#F8F4EB',
  // Add real profiles here once they exist; empty entries are skipped in schema.
  sameAs: [] as string[],
  // Amazon Associates tracking ID. The only place it is set: every product link is built from it.
  amazonPartnerTag: 'housecare0a-20',
  // Google Tag Manager container, loaded only after cookie consent. GA4 (G-YCNX9GQD85) and Microsoft Clarity
  // (z4946iuout) are configured inside the container. Empty = no analytics script and no cookie banner.
  gtmId: 'GTM-K9GRGZQ9' as string,
  foundingDate: '2026',
} as const;

export function amazonProductUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${SITE.amazonPartnerTag}`;
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}
