import { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

// Only service areas are blocked. Pages that are noindex (/search, /compare builder, /account) stay
// crawlable so search engines can actually read their noindex tag.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
