import React from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { readStore } from '@/lib/store';
import { ProductCatalogClient } from '@/components/ProductCatalogClient';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from '@/lib/schema';

// ISR: refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Cleaning Tools & Equipment Reviews (2026)',
  description: 'Browse our reviews of portable carpet cleaners, electric spin scrubbers, steam cleaners, grout brushes and home organizers, with scores, pros, cons and specs.',
  path: '/products',
});

export default function ProductsCatalogPage() {
  const store = readStore();
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Products', path: '/products' },
    ]),
    webPageSchema({
      path: '/products',
      name: 'Cleaning Tools & Equipment Reviews',
      description: 'Reviews of home cleaning tools and equipment.',
      type: 'CollectionPage',
    }),
    itemListSchema(
      'Cleaning tools & equipment reviews',
      store.products.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
    ),
  );
  return (
    <>
      <JsonLd data={schema} />
      <ProductCatalogClient products={store.products} />
    </>
  );
}
