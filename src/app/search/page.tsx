import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Search, Sparkles } from 'lucide-react';
import { searchEverything } from '@/lib/store';
import { PrimeBadge, StarRating, AffiliateButton } from '@/components/ui/Badges';

export const dynamic = 'force-dynamic';

// Per Spec Section 15.5: Search Results are noindex by default
export const metadata: Metadata = {
  title: 'Search Home Care Guides, Stain Fixes & Reviews',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = searchParams.q || '';
  const category = searchParams.category || 'all';
  const results = searchEverything(q, category);

  const trendingQueries = [
    'coffee stain',
    'pet hair',
    'grout cleaning',
    'carpet cleaner',
    'under sink organizer',
    'shower mold',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Search Bar Box */}
      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card">
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-ink">
          Search HouseCareWiki
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Full-text search with synonym matching across guides, surface safety charts, and hands-on product reviews.
        </p>

        <form action="/search" method="GET" className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search stains, surfaces, rooms, or products..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-paper-border bg-paper-light text-sm text-ink focus:outline-none focus:border-forest"
            />
          </div>
          <select
            name="category"
            defaultValue={category}
            className="rounded-xl border border-paper-border bg-paper-light px-4 py-3 text-sm font-semibold text-ink"
          >
            <option value="all">All Rooms & Topics</option>
            <option value="bathroom-cleaning">Bathroom Cleaning</option>
            <option value="kitchen-cleaning">Kitchen Cleaning</option>
            <option value="floor-carpet-care">Floor & Carpet Care</option>
            <option value="pet-hair-removal">Pet Hair & Stains</option>
            <option value="home-organization">Home Organization</option>
          </select>
          <button
            type="submit"
            className="bg-coral hover:bg-coral-hover text-white font-semibold text-sm px-6 py-3 rounded-xl transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs text-ink-muted flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-coral" /> Trending searches:
          </span>
          {trendingQueries.map((t) => (
            <Link
              key={t}
              href={`/search?q=${encodeURIComponent(t)}`}
              className="text-xs font-medium bg-paper-light hover:bg-paper-warm text-ink-secondary px-3 py-1 rounded-full border border-paper-border"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Matching Guides & Reviews */}
      <section>
        <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
          Matching Guides & Reviews ({results.articles.length})
        </h2>
        {results.articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-paper-border p-6 text-sm text-ink-secondary">
            No matching articles found for &ldquo;{q}&rdquo;. Try our{' '}
            <Link href="/tools/stain-finder" className="text-forest font-bold underline">
              Interactive Stain Solution Finder
            </Link>{' '}
            or browse all topics above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {results.articles.map((art) => {
              const href =
                art.routeType === 'best' ? `/best/${art.slug}` : `/guides/${art.slug}`;
              return (
                <Link
                  key={art.id}
                  href={href}
                  className="group bg-white rounded-xl overflow-hidden border border-paper-border shadow-card hover:shadow-elevated transition flex flex-col"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-paper-warm">
                    <img
                      src={art.heroImage}
                      alt={art.heroImageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-5 space-y-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-coral">
                      {art.categoryLabel}
                    </span>
                    <h3 className="font-editorial font-bold text-lg text-ink group-hover:text-forest leading-snug">
                      {art.title}
                    </h3>
                    <p className="text-xs text-ink-secondary line-clamp-2">
                      {art.subtitle}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Matching Products */}
      <section>
        <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
          Matching Tested Products ({results.products.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {results.products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-xl border border-paper-border p-4 shadow-card flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold bg-forest text-white px-2.5 py-0.5 rounded">
                  {prod.badge || prod.bestFor}
                </span>
                <Link
                  href={`/products/${prod.slug}`}
                  className="font-bold text-sm text-ink hover:text-forest block mt-2"
                >
                  {prod.name}
                </Link>
                <div className="mt-1">
                  <StarRating
                    rating={prod.rating}
                    reviewCount={prod.reviewCount}
                    size="xs"
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-ink">{prod.price}</span>
                  {prod.isPrime && <PrimeBadge />}
                </div>
                <AffiliateButton
                  productId={prod.id}
                  productName={prod.name}
                  asin={prod.asin}
                  amazonUrl={prod.amazonUrl}
                  contentSlug="search_results"
                  placement="search_product_card"
                  variant="compact"
                  label="Amazon →"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
