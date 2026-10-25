import { MetadataRoute } from 'next';
import { readStore } from '@/lib/store';

export default function sitemap(): MetadataRoute.Sitemap {
  const store = readStore();
  const baseUrl = 'https://housecarewiki.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date('2026-10-23'), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date('2026-10-20'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/tools`, lastModified: new Date('2026-10-20'), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/tools/stain-finder`, lastModified: new Date('2026-10-20'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/tools/equipment-finder`, lastModified: new Date('2026-10-20'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/tools/routine-planner`, lastModified: new Date('2026-10-20'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/tools/cost-calculator`, lastModified: new Date('2026-10-20'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/tools/surface-checker`, lastModified: new Date('2026-10-20'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/methodology`, lastModified: new Date('2026-10-15'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/editorial-policy`, lastModified: new Date('2026-10-15'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/affiliate-disclosure`, lastModified: new Date('2026-10-15'), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Include only canonical indexable Published articles per Spec Section 15.3
  const articleRoutes: MetadataRoute.Sitemap = store.articles
    .filter((art) => art.status === 'Published' && art.seo.indexable)
    .map((art) => ({
      url: `${baseUrl}/${art.routeType}/${art.slug}`,
      lastModified: new Date('2026-10-20'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

  const roomRoutes: MetadataRoute.Sitemap = store.rooms.map((r) => ({
    url: `${baseUrl}/rooms/${r.slug}`,
    lastModified: new Date('2026-10-20'),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const productRoutes: MetadataRoute.Sitemap = store.products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const surfaceRoutes: MetadataRoute.Sitemap = store.surfaces.map((s) => ({
    url: `${baseUrl}/surfaces/${s.slug}`,
    lastModified: new Date('2026-10-18'),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const comparisonRoutes: MetadataRoute.Sitemap = store.comparisons.map((c) => ({
    url: `${baseUrl}/compare/${c.slug}`,
    lastModified: new Date('2026-10-20'),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const authorRoutes: MetadataRoute.Sitemap = store.authors.map((a) => ({
    url: `${baseUrl}/authors/${a.slug}`,
    lastModified: new Date('2026-10-15'),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...roomRoutes,
    ...productRoutes,
    ...surfaceRoutes,
    ...comparisonRoutes,
    ...authorRoutes,
  ];
}
