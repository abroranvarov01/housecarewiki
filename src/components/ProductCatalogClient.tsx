'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import { EditorScore, AffiliateButton, SaveItemButton } from '@/components/ui/Badges';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All products' },
  { id: 'carpet-cleaners', label: 'Portable carpet cleaners' },
  { id: 'Bathroom-scrubbers', label: 'Electric spin scrubbers' },
  { id: 'steam-cleaners', label: 'Steam cleaners' },
  { id: 'brushes-tools', label: 'Brushes and hair rollers' },
  { id: 'organizers', label: 'Home organizers' },
];

type SortKey = 'rating' | 'name';

/** Only the fields the catalog renders: prices, Amazon ratings and review counts never reach the browser. */
export type CatalogProduct = Pick<
  Product,
  'id' | 'slug' | 'name' | 'shortName' | 'brand' | 'model' | 'asin' | 'amazonUrl' | 'image' | 'category' | 'badge' | 'bestFor'
> & { scores: Pick<Product['scores'], 'overall'> };

export function ProductCatalogClient({ products }: { products: CatalogProduct[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('rating');

  const countFor = (id: string) => (id === 'all' ? products.length : products.filter((p) => p.category === id).length);
  const categories = CATEGORIES.filter((c) => countFor(c.id) > 0);

  const filtered = products
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'name') return a.shortName.localeCompare(b.shortName);
      return b.scores.overall - a.scores.overall;
    });

  const activeLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'All products';

  return (
    <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8">
      {/* Filters: category chips scroll sideways on small screens; sort stays a labeled select. */}
      <div className="flex flex-col gap-4 border-b border-rule py-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors duration-150 ${
                  active
                    ? 'border-ink bg-ink text-paper-light'
                    : 'border-rule-strong bg-transparent text-ink-secondary hover:border-ink hover:text-ink'
                }`}
              >
                {cat.label}
                <span className={`font-mono text-[11px] ${active ? 'text-paper-light/70' : 'text-ink-muted'}`}>{countFor(cat.id)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="catalog-sort" className="kicker whitespace-nowrap text-ink-muted">
            Sort by
          </label>
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="h-11 rounded-sm border border-rule-field bg-paper-card px-3 text-[14px] font-medium text-ink focus:border-ink focus:outline-none"
          >
            <option value="rating">Our rating</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </div>

      <p className="pt-4 text-[14px] text-ink-muted" aria-live="polite">
        Showing <span className="font-semibold text-ink">{filtered.length}</span>{' '}
        {filtered.length === 1 ? 'product' : 'products'}
        {selectedCategory !== 'all' && <> in {activeLabel.toLowerCase()}</>}
      </p>

      {/* Ruled list of products with consistent image boxes. */}
      <ul className="mt-2 divide-y divide-rule border-b border-rule">
        {filtered.map((prod) => (
          <li key={prod.id} className="grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-3 py-5 sm:grid-cols-[8rem_1fr_auto] sm:items-center sm:gap-x-6">
            <div className="aspect-square rounded-2xl border border-rule bg-white p-2">
              <img src={prod.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
            </div>

            <div className="min-w-0">
              <p className="kicker text-ink-muted">
                {prod.brand}
                {prod.badge && <span className="text-terracotta-deep"> · {prod.badge}</span>}
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold leading-snug text-ink sm:text-2xl">
                <Link href={`/products/${prod.slug}`} className="hover:text-terracotta-deep">
                  {prod.name}
                </Link>
              </h2>
              <p className="mt-1 text-[14px] text-ink-muted">
                Best for: <span className="text-ink-secondary">{prod.bestFor}</span>
              </p>
              <div className="mt-2">
                <EditorScore score={prod.scores.overall} size="xs" />
              </div>
            </div>

            <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-1 sm:flex-col sm:items-end">
              <Link
                href={`/products/${prod.slug}`}
                className="group inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-terracotta-deep"
              >
                <span className="hover-title">Read review</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <AffiliateButton
                productId={prod.id}
                productName={prod.name}
                asin={prod.asin}
                amazonUrl={prod.amazonUrl}
                contentSlug="products_catalog"
                placement="catalog_grid"
                variant="compact"
                label="Check on Amazon"
                className="whitespace-nowrap"
              />
              <SaveItemButton itemSlug={prod.slug} itemType="product" title={prod.name} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
