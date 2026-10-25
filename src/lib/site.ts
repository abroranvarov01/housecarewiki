// Single source of truth for site-wide data. Metadata, JSON-LD, sitemap and robots read only from here.
export const SITE = {
  url: 'https://housecarewiki.com',
  name: 'HouseCareWiki',
  legalName: 'HouseCareWiki',
  tagline: 'Real Solutions for Everyday Messy Moments',
  description:
    'Practical home care guides, honest product reviews, surface safety protocols, and interactive tools to keep your home fresh, organized, and comfortable.',
  lang: 'en-US',
  ogLocale: 'en_US',
  email: 'hello@housecarewiki.com',
  logo: '/icon.png',
  defaultOgImage: '/og',
  themeColor: '#1F4D3A',
  backgroundColor: '#F7F4EE',
  // Add real profiles here once they exist; empty entries are skipped in schema.
  sameAs: [] as string[],
  amazonPartnerTag: 'housecarewiki-20',
  foundingDate: '2026',
} as const;

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${clean}`;
}
