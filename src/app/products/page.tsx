import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { readStore } from '@/lib/store';
import { ProductCatalogClient, type CatalogProduct } from '@/components/ProductCatalogClient';
import type { Product } from '@/lib/types';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from '@/lib/schema';
import { AffiliateDisclosureNote } from '@/components/ui/Badges';
import { Breadcrumbs, ButtonLink, Container, Kicker } from '@/components/field';

// ISR: refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Cleaning Tools & Equipment Reviews (2026)',
  description: 'Browse our reviews of portable carpet cleaners, electric spin scrubbers, steam cleaners, grout brushes and home organizers, with scores, pros, cons and specs.',
  path: '/products',
});

// Only the fields the catalog renders: prices, Amazon ratings and review counts never reach the browser.
function toCatalogProduct(p: Product): CatalogProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortName: p.shortName,
    brand: p.brand,
    model: p.model,
    asin: p.asin,
    amazonUrl: p.amazonUrl,
    image: p.image,
    category: p.category,
    badge: p.badge,
    bestFor: p.bestFor,
    scores: { overall: p.scores.overall },
  };
}

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
    <div className="pb-16">
      <JsonLd data={schema} />
      <header className="border-b border-rule">
        <Container className="grid gap-6 pb-8 pt-6 sm:pt-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Products' }]} />
            <Kicker tone="accent" className="mt-6">
              Product reviews · {store.products.length} products
            </Kicker>
            <h1 className="mt-3 font-serif text-[2.25rem] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
              Cleaning tools and equipment
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-secondary">
              Every review covers who the product suits, who should skip it, its pros and cons and the manufacturer&apos;s
              specifications. Our ratings come from specs, manuals and published care standards; we have not used these products ourselves.{' '}
              <Link href="/methodology" className="link">
                How we evaluate
              </Link>
            </p>
            <AffiliateDisclosureNote className="mt-4" />
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <ButtonLink href="/compare" variant="secondary">
              Compare two products
            </ButtonLink>
          </div>
        </Container>
      </header>
      <ProductCatalogClient products={store.products.map(toCatalogProduct)} />
    </div>
  );
}
