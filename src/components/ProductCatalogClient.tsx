'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { PrimeBadge, StarRating, AffiliateButton, SaveItemButton } from '@/components/ui/Badges';
import { SlidersHorizontal, Scale } from 'lucide-react';

export function ProductCatalogClient({ products }: { products: Product[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc'>('rating');

  const categories = [
    { id: 'all', label: 'All Tested Equipment' },
    { id: 'carpet-cleaners', label: 'Portable Carpet Cleaners' },
    { id: 'Bathroom-scrubbers', label: 'Electric Spin Scrubbers' },
    { id: 'steam-cleaners', label: 'Steam Cleaners' },
    { id: 'brushes-tools', label: 'Brushes & Hair Rollers' },
    { id: 'organizers', label: 'Home Organizers' },
  ];

  const filtered = products
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceNumeric - b.priceNumeric;
      if (sortBy === 'price-desc') return b.priceNumeric - a.priceNumeric;
      return b.rating - a.rating;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F5F0E6] to-[#E9E0CE] rounded-2xl p-6 sm:p-10 border border-paper-border shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-coral">
            Hands-On Tested Equipment Database
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink mt-1">
            Tools & Cleaning Equipment Catalog
          </h1>
          <p className="text-sm sm:text-base text-ink-secondary mt-2">
            Every machine and tool in our catalog includes verified specifications, surface compatibility lists, and transparent lab scores.
          </p>
        </div>

        <Link
          href="/compare"
          className="inline-flex items-center gap-2 bg-forest hover:bg-forest-light text-white text-sm font-semibold px-5 py-3 rounded-full transition shrink-0 self-start md:self-center"
        >
          <Scale className="w-4 h-4" />
          <span>Open Comparison Builder</span>
        </Link>
      </div>

      {/* Filters & Sorting Bar */}
      <div className="mt-6 bg-white rounded-xl border border-paper-border p-4 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-forest mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-forest text-white'
                  : 'bg-paper-light text-ink-secondary hover:bg-paper-warm'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-ink-muted font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-paper-light border border-paper-border rounded-lg px-3 py-1.5 font-semibold text-ink focus:outline-none"
          >
            <option value="rating">Highest Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-2xl border border-paper-border p-5 shadow-card hover:shadow-elevated transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="bg-forest text-white text-[11px] font-bold px-2.5 py-0.5 rounded">
                  {prod.badge || `Best for ${prod.bestFor}`}
                </span>
                <SaveItemButton
                  itemSlug={prod.slug}
                  itemType="product"
                  title={prod.name}
                />
              </div>

              <Link
                href={`/products/${prod.slug}`}
                className="block aspect-square rounded-xl overflow-hidden bg-paper-light mb-3 p-2"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform"
                />
              </Link>

              <p className="text-[11px] font-bold uppercase tracking-wider text-forest-muted">
                {prod.brand} · Model {prod.model}
              </p>

              <Link
                href={`/products/${prod.slug}`}
                className="font-editorial font-bold text-lg text-ink hover:text-forest leading-snug mt-0.5 block"
              >
                {prod.name}
              </Link>

              <div className="mt-2">
                <StarRating
                  rating={prod.rating}
                  reviewCount={prod.reviewCount}
                  size="xs"
                />
              </div>

              <p className="text-xs text-ink-secondary mt-2.5 line-clamp-2 leading-relaxed">
                {prod.summary}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-paper-border space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-ink">{prod.price}</span>
                  {prod.isPrime && <PrimeBadge />}
                </div>
                <span className="text-xs font-bold text-forest bg-forest-pale px-2 py-0.5 rounded">
                  Score: {prod.scores.overall}/10
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/products/${prod.slug}`}
                  className="text-center py-2 px-3 rounded-lg border border-paper-border text-xs font-semibold text-ink hover:border-forest transition"
                >
                  Full Specs
                </Link>
                <AffiliateButton
                  productId={prod.id}
                  productName={prod.name}
                  asin={prod.asin}
                  amazonUrl={prod.amazonUrl}
                  contentSlug="products_catalog"
                  placement="catalog_grid"
                  variant="compact"
                  label="Amazon →"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
