import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Search } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { readStore, searchEverything } from '@/lib/store';
import type { Article } from '@/lib/types';
import { Container, Figure, Kicker, SectionHead, articleHref, articleMeta } from '@/components/field';

export const dynamic = 'force-dynamic';

// Search results are noindex: thin, query-dependent pages shouldn't compete with the guides themselves.
export const metadata: Metadata = buildMetadata({
  title: 'Search Home Care Guides, Stain Fixes & Reviews',
  description: 'Search HouseCareWiki guides, surface safety charts and product reviews.',
  path: '/search',
  noindex: true,
});

const COMMON_MESSES = [
  { label: 'Coffee on the sofa', href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa' },
  { label: 'Dog hair on everything', href: '/guides/how-to-remove-pet-hair-from-furniture' },
  { label: 'Grout that won’t come clean', href: '/guides/how-to-clean-grout-in-bathroom-tiles' },
  { label: 'Mold keeps coming back in the shower', href: '/guides/how-to-prevent-mold-in-your-shower' },
  { label: 'Kitchen cabinets out of control', href: '/guides/how-to-keep-your-kitchen-organized' },
];

const SUGGESTED_QUERIES = ['coffee stain', 'pet hair', 'grout', 'carpet cleaner', 'shower mold', 'under sink'];

// Problem fixes (step-by-step guides) before tips and organization pieces.
function guideRank(a: Article): number {
  if (a.routeType === 'problems') return 0;
  if (a.steps && a.steps.length > 0 && a.categoryLabel === 'CLEANING GUIDE') return 1;
  if (a.steps && a.steps.length > 0) return 2;
  return 3;
}

function searchHref(q: string, category: string): string {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category && category !== 'all') params.set('category', category);
  const qs = params.toString();
  return qs ? `/search?${qs}` : '/search';
}

function ResultRow({
  href,
  image,
  imageFit = 'cover',
  kicker,
  title,
  excerpt,
}: {
  href: string;
  image: string;
  imageFit?: 'cover' | 'contain';
  kicker: string;
  title: string;
  excerpt: string;
}) {
  return (
    <li>
      <Link href={href} className="group grid grid-cols-[4.5rem_1fr] gap-4 py-4 sm:grid-cols-[6rem_1fr] sm:gap-5">
        {imageFit === 'cover' ? (
          <Figure src={image} alt="" ratio="1/1" />
        ) : (
          <div className="aspect-square bg-paper-card p-1.5">
            <img src={image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
          </div>
        )}
        <span className="min-w-0">
          <span className="kicker block text-ink-muted">{kicker}</span>
          <span className="mt-1 block font-serif text-xl font-semibold leading-snug text-ink">
            <span className="hover-title">{title}</span>
          </span>
          <span className="mt-1 block max-w-prose text-[15px] leading-snug text-ink-secondary line-clamp-2">{excerpt}</span>
        </span>
      </Link>
    </li>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string };
}) {
  const q = (searchParams.q || '').trim();
  const category = searchParams.category || 'all';
  const store = readStore();
  const results = searchEverything(q, category);

  const published = results.articles.filter((a) => a.status === 'Published');
  const guides = published
    .filter((a) => a.routeType === 'guides' || a.routeType === 'problems')
    .sort((a, b) => guideRank(a) - guideRank(b));
  const buyingGuides = published.filter((a) => a.routeType === 'best' || a.routeType === 'reviews');
  const products = results.products;
  // Surface guides aren't tied to a room, so they only appear when no room filter is active.
  const surfaces = category === 'all' ? results.surfaces : [];

  const total = guides.length + buyingGuides.length + products.length + surfaces.length;
  const activeRoom = store.rooms.find((r) => r.slug === category);
  const scope = activeRoom ? ` in ${activeRoom.name}` : '';

  let countLine: string;
  if (q) countLine = `${total} ${total === 1 ? 'result' : 'results'} for “${q}”${scope}`;
  else countLine = `${total} ${total === 1 ? 'page' : 'pages'}${scope}`;

  return (
    <div className="pb-16">
      {/* 1. Search field + room filter */}
      <header className="border-b border-rule">
        <Container className="py-8 sm:py-12">
          <Kicker tone="accent">{q ? 'Search' : 'Browse everything'}</Kicker>
          <h1 className="mt-3 font-serif text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
            {q ? 'Search results' : 'All guides and reviews'}
          </h1>

          <form action="/search" method="GET" role="search" className="mt-6 max-w-2xl">
            <label htmlFor="search-q" className="mb-2 block text-[15px] font-semibold text-ink">
              Describe the mess, surface or product
            </label>
            <div className="flex rounded-full border border-ink-muted bg-paper-card p-1 shadow-card focus-within:border-ink">
              <Search className="ml-3 mt-3.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
              <input
                id="search-q"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="e.g. red wine on carpet"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-lg text-ink placeholder:text-ink-muted focus:outline-none"
              />
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              <button type="submit" className="min-h-[44px] rounded-full bg-ink px-5 text-[15px] font-semibold text-paper-light transition-colors hover:bg-ink-deep sm:px-6">
                Search
              </button>
            </div>
          </form>

          <nav aria-label="Filter by room" className="mt-6">
            <Kicker className="mb-2">Room</Kicker>
            <ul className="flex flex-wrap gap-2">
              {[{ slug: 'all', name: 'All rooms' }, ...store.rooms].map((r) => {
                const active = r.slug === category;
                return (
                  <li key={r.slug}>
                    <Link
                      href={searchHref(q, r.slug)}
                      aria-current={active ? 'page' : undefined}
                      className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-[14px] font-medium transition-colors ${
                        active ? 'border-ink bg-ink text-paper-light' : 'border-rule-strong bg-paper-card text-ink-secondary hover:border-ink hover:text-ink'
                      }`}
                    >
                      {r.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Container>
      </header>

      <Container className="pt-8">
        <p className="kicker text-ink" role="status">
          {countLine}
        </p>

        {total === 0 ? (
          /* Zero results: point to the most common fixes and the stain finder. */
          <section aria-labelledby="empty-heading" className="mt-6 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 id="empty-heading" className="font-serif text-3xl font-semibold leading-tight text-ink">
                Nothing matched{q ? ` “${q}”` : ''}{scope}.
              </h2>
              <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-ink-secondary">
                Try fewer or plainer words (&ldquo;wine carpet&rdquo; instead of a full sentence), check the spelling, or
                {activeRoom ? (
                  <>
                    {' '}
                    <Link href={searchHref(q, 'all')} className="link">
                      search all rooms
                    </Link>
                    .
                  </>
                ) : (
                  ' start from one of the common messes below.'
                )}
              </p>
              <Kicker className="mb-1 mt-8">Common messes</Kicker>
              <ol className="divide-y divide-rule border-y border-rule">
                {COMMON_MESSES.map((m, i) => (
                  <li key={m.href}>
                    <Link href={m.href} className="group flex min-h-[44px] items-baseline gap-3 py-3 text-[15px] text-ink hover:text-terracotta-deep">
                      <span className="kicker w-5 shrink-0 text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                      <span className="hover-title">{m.label}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <Kicker className="mb-2 mt-8">Or try</Kicker>
              <ul className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((t) => (
                  <li key={t}>
                    <Link
                      href={searchHref(t, 'all')}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-rule-strong bg-paper-card px-4 text-[14px] text-ink-secondary hover:border-ink hover:text-ink"
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="lg:col-span-5">
              <div className="rounded-2xl bg-paper-warm p-6 text-ink sm:p-8">
                <Kicker tone="accent">Stain Solution Finder</Kicker>
                <p className="mt-3 font-serif text-2xl font-semibold leading-tight">Know what spilled and on what?</p>
                <p className="mt-2 text-base leading-relaxed text-ink-secondary">
                  Answer two questions and get the supplies, steps and warnings for that exact stain and surface.
                </p>
                <Link
                  href="/tools/stain-finder"
                  className="group mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-honey px-6 text-[15px] font-semibold text-ink hover:bg-honey-deep"
                >
                  Open the finder
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </section>
        ) : (
          <div className="mt-6 space-y-12">
            {guides.length > 0 && (
              <section aria-labelledby="guides-heading">
                <SectionHead id="guides-heading" title="Guides" kicker={`${guides.length} ${guides.length === 1 ? 'guide' : 'guides'}`} />
                <ul className="mt-2 divide-y divide-rule border-b border-rule">
                  {guides.map((a) => (
                    <ResultRow key={a.id} href={articleHref(a)} image={a.heroImage} kicker={articleMeta(a)} title={a.title} excerpt={a.excerpt} />
                  ))}
                </ul>
              </section>
            )}

            {buyingGuides.length + products.length > 0 && (
              <section aria-labelledby="buying-heading">
                <SectionHead
                  id="buying-heading"
                  title="Buying guides & reviews"
                  kicker={`${buyingGuides.length + products.length} ${buyingGuides.length + products.length === 1 ? 'page' : 'pages'}`}
                />
                <ul className="mt-2 divide-y divide-rule border-b border-rule">
                  {buyingGuides.map((a) => (
                    <ResultRow
                      key={a.id}
                      href={articleHref(a)}
                      image={a.heroImage}
                      kicker={`Buying guide · ${a.recommendedProductIds.length} picks`}
                      title={a.title}
                      excerpt={a.excerpt}
                    />
                  ))}
                  {products.map((p) => (
                    <ResultRow
                      key={p.id}
                      href={`/products/${p.slug}`}
                      image={p.image}
                      imageFit="contain"
                      kicker={`Product review · Best for ${p.bestFor}`}
                      title={p.name}
                      excerpt={p.summary}
                    />
                  ))}
                </ul>
              </section>
            )}

            {surfaces.length > 0 && (
              <section aria-labelledby="surfaces-heading">
                <SectionHead
                  id="surfaces-heading"
                  title="Surface guides"
                  kicker={`${surfaces.length} ${surfaces.length === 1 ? 'surface' : 'surfaces'}`}
                />
                <ul className="mt-2 divide-y divide-rule border-b border-rule">
                  {surfaces.map((s) => (
                    <ResultRow
                      key={s.slug}
                      href={`/surfaces/${s.slug}`}
                      image={s.image}
                      kicker={`Surface guide · ${s.category}`}
                      title={s.name}
                      excerpt={s.summary}
                    />
                  ))}
                </ul>
              </section>
            )}

            <p className="text-[15px] text-ink-secondary">
              Not what you needed? Try the{' '}
              <Link href="/tools/stain-finder" className="link font-semibold">
                Stain Solution Finder
              </Link>{' '}
              or{' '}
              <Link href="/tools" className="link font-semibold">
                browse all tools
              </Link>
              .
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
