import { MetadataRoute } from 'next';

// Per Spec Section 15.5: Do not block /search or /compare in robots.txt so crawlers can read the meta robots="noindex" tag.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/'],
    },
    sitemap: 'https://housecarewiki.com/sitemap.xml',
  };
}
