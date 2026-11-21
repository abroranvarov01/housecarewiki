import { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

// Blocked: service areas, internal search results and the compare builder with query parameters (all noindex,
// already dropped from the index), and Next.js RSC payloads (`?_rsc=`). In Search Console crawl stats these
// payloads were 70% of all Googlebot requests, crawl budget that belongs to the guides. Pages render fully
// without them. /compare/<slug> comparisons stay crawlable: only `/compare?` with parameters is blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/search', '/compare?', '/account', '/*?_rsc=', '/*&_rsc='],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
