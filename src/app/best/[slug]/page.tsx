import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Check,
  Droplets,
  Layers,
  Sparkles,
  Volume2,
  Scale,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { readStore } from '@/lib/store';
import {
  PrimeBadge,
  StarRating,
  HandwrittenNote,
  TestedInRealHomesSeal,
  AffiliateButton,
} from '@/components/ui/Badges';

export const dynamic = 'force-dynamic';

const CRITERIA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  Layers,
  Sparkles,
  Volume2,
  Scale,
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = readStore();
  const article = store.articles.find((a) => a.slug === params.slug);
  if (!article) return { title: 'Guide Not Found' };

  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: {
      canonical: article.seo.canonical,
    },
  };
}

export default function BestProductsPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const article = store.articles.find((a) => a.slug === params.slug);
  if (!article) {
    notFound();
  }

  const author =
    store.authors.find((au) => au.slug === article.authorSlug) || store.authors[0];

  const recommendedProducts = article.recommendedProductIds
    .map((id) => store.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const topPick =
    store.products.find((p) => p.id === article.topPickProductId) ||
    recommendedProducts[0];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://housecarewiki.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Reviews',
        item: 'https://housecarewiki.com/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: article.seo.canonical,
      },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.subtitle,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: author.name,
      url: `https://housecarewiki.com/authors/${author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'HouseCareWiki',
    },
  };

  return (
    <div className="bg-[#F7F4EC] pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* 1. SEAMLESS HERO SECTION WITH BREADCRUMBS — Matches Screen 3 of Photo */}
      <header className="relative overflow-hidden bg-[#F6F1E7] border-b border-[#E6DFD3]">
        <div className="max-w-6xl mx-auto relative">
          {/* Right Seamless Image + "TESTED IN REAL HOMES" Seal + Handwritten Note */}
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-[54%] h-72 sm:h-80 lg:h-full relative overflow-hidden">
            <img
              src={article.heroImage}
              alt={article.heroImageAlt}
              className="w-full h-full object-cover object-right"
            />
            {/* Smooth left fade into warm cream background */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-44 bg-gradient-to-r from-[#F6F1E7] via-[#F6F1E7]/85 to-transparent" />
            <div className="lg:hidden absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#F6F1E7] to-transparent" />

            {/* Circular TESTED IN REAL HOMES stamp at top-right */}
            {article.testedBadge && (
              <TestedInRealHomesSeal className="absolute top-4 right-4 sm:top-5 sm:right-6 z-10" />
            )}

            {/* Handwritten Note directly over the rug pointing right toward the cleaner */}
            {article.handwrittenBadge && (
              <div className="absolute bottom-5 left-6 sm:left-12 lg:bottom-7 lg:left-10 z-10">
                <HandwrittenNote
                  text={article.handwrittenBadge.replace(' for ', '\nfor ')}
                  arrowDirection="right"
                />
              </div>
            )}
          </div>

          {/* Left Column: Breadcrumbs, Serif Title, Subtitle, Author Byline */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-5 pb-8 sm:py-9 lg:py-11 lg:w-[58%]">
            {/* Breadcrumbs: Home > Reviews > Best Portable Carpet Cleaners */}
            <nav aria-label="Breadcrumb" className="mb-4 text-[11.5px] text-[#7A756C]">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-[#1F4D3A]">
                    Home
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-3 h-3" />
                </li>
                <li>
                  <Link href="/products" className="hover:text-[#1F4D3A]">
                    Reviews
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-3 h-3" />
                </li>
                <li className="text-[#4A504C] font-medium truncate">
                  {article.title.replace(' for Home Use in 2026', '')}
                </li>
              </ol>
            </nav>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1F2421] leading-[1.1] tracking-tight">
              {article.title}
            </h1>

            <p className="text-sm sm:text-[15px] text-[#4A504C] leading-relaxed mt-3.5 max-w-lg">
              {article.subtitle}
            </p>

            {/* Author Meta Row */}
            <div className="mt-5 flex items-center gap-3">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover border border-[#D8CFC0] shadow-sm"
              />
              <div>
                <p className="text-xs sm:text-[13px] text-[#3F4641]">
                  By{' '}
                  <Link
                    href={`/authors/${author.slug}`}
                    className="font-bold text-[#1F2421] hover:text-[#1F4D3A]"
                  >
                    {author.name}
                  </Link>
                </p>
                <p className="text-[11.5px] text-[#6E756F]">
                  Updated {article.updatedAt} · {article.readingTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. STICKY SUB-NAVIGATION TABS (Top Picks | Comparison | Reviews | How We Tested | Buying Guide | FAQs) */}
      <div className="sticky top-16 z-30 bg-[#FBF9F5] border-b border-[#E4DDD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-7 sm:gap-9 overflow-x-auto py-3 text-xs sm:text-[13.5px] font-semibold">
          <a
            href="#top-picks"
            className="text-[#1F2421] border-b-2 border-[#1F4D3A] pb-3 -mb-3 whitespace-nowrap font-bold"
          >
            Top Picks
          </a>
          <a
            href="#comparison"
            className="text-[#4A504C] hover:text-[#1F4D3A] pb-3 -mb-3 whitespace-nowrap"
          >
            Comparison
          </a>
          <a
            href="#reviews"
            className="text-[#4A504C] hover:text-[#1F4D3A] pb-3 -mb-3 whitespace-nowrap"
          >
            Reviews
          </a>
          <a
            href="#how-we-tested"
            className="text-[#4A504C] hover:text-[#1F4D3A] pb-3 -mb-3 whitespace-nowrap"
          >
            How We Tested
          </a>
          <a
            href="#buying-guide"
            className="text-[#4A504C] hover:text-[#1F4D3A] pb-3 -mb-3 whitespace-nowrap"
          >
            Buying Guide
          </a>
          <a
            href="#faqs"
            className="text-[#4A504C] hover:text-[#1F4D3A] pb-3 -mb-3 whitespace-nowrap"
          >
            FAQs
          </a>
        </div>
      </div>

      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3. OUR TOP PICK SPOTLIGHT CARD (Matches Screen 3 "Bissell Little Green Portable Carpet Cleaner") */}
        {topPick && (
          <section id="top-picks" className="mt-7 scroll-mt-28">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="font-editorial text-2xl sm:text-[26px] font-bold text-[#1F2421] shrink-0">
                Our Top Pick
              </h2>
              <div className="h-px bg-[#DFD7C8] flex-1" />
            </div>

            <div className="bg-white rounded-2xl border border-[#E4DDD0] shadow-card p-5 sm:p-7">
              {/* Best Overall Badge at top-left above product */}
              <div className="mb-2 sm:pl-16">
                <span className="inline-block bg-[#1F4D3A] text-white text-xs font-bold px-3.5 py-1 rounded-md">
                  {topPick.badge || 'Best Overall'}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Product Studio Cutout Image */}
                <div className="lg:col-span-4 flex flex-col items-center">
                  <Link
                    href={`/products/${topPick.slug}`}
                    className="w-full max-w-[210px] aspect-square bg-white flex items-center justify-center p-2"
                  >
                    <img
                      src={topPick.image}
                      alt={topPick.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                    />
                  </Link>
                </div>

                {/* Product Title, Rating & 3 Checkmark Bullets */}
                <div className="lg:col-span-5 space-y-2.5">
                  <h3 className="font-editorial text-xl sm:text-[22px] font-bold text-[#1F2421] leading-snug">
                    <Link href={`/products/${topPick.slug}`} className="hover:text-[#1F4D3A]">
                      {topPick.name.includes('Portable Carpet Cleaner') ? (
                        <>
                          {topPick.name.replace(' Portable Carpet Cleaner', '')}
                          <br />
                          Portable Carpet Cleaner
                        </>
                      ) : (
                        topPick.name
                      )}
                    </Link>
                  </h3>

                  <StarRating
                    rating={topPick.rating}
                    reviewCount={topPick.reviewCount}
                    size="md"
                  />

                  <ul className="space-y-1.5 pt-1">
                    {topPick.highlights.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-xs sm:text-[13.5px] text-[#3F4641]"
                      >
                        <Check className="w-4 h-4 text-[#1F4D3A] stroke-[2.5] shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right Price & Orange CTA Box */}
                <div className="lg:col-span-3 lg:border-l lg:border-[#E6DFD3] lg:pl-6 flex flex-col items-start lg:items-center justify-center space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-[26px] font-extrabold text-[#1F2421]">
                      {topPick.price}
                    </span>
                    {topPick.isPrime && <PrimeBadge />}
                  </div>

                  <AffiliateButton
                    productId={topPick.id}
                    productName={topPick.name}
                    asin={topPick.asin}
                    amazonUrl={topPick.amazonUrl}
                    contentSlug={article.slug}
                    placement="our_top_pick_box"
                    variant="coral"
                    label="View on Amazon"
                    className="w-full"
                  />

                  <p className="text-[11px] text-[#7A756C] text-left lg:text-center leading-tight">
                    We earn a commission at no extra cost to you.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. TOP 5 COMPARISON TABLE (Matches Screen 3 "Top 5 Portable Carpet Cleaners") */}
        <section id="comparison" className="mt-9 scroll-mt-28">
          <h2 className="font-editorial text-2xl sm:text-[26px] font-bold text-[#1F2421] mb-4">
            Top {recommendedProducts.length}{' '}
            {article.title
              .replace('Best ', '')
              .replace('The best ', '')
              .replace(' for Home Use in 2026', '')
              .replace(' in 2026', '')}
          </h2>

          <div className="bg-white rounded-2xl border border-[#E4DDD0] shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F1E8] border-b border-[#E4DDD0] text-xs font-bold text-[#3F4641]">
                    <th className="py-3 px-4 w-10">#</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Best For</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE4D7] text-sm">
                  {recommendedProducts.map((prod, index) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-[#FBF9F5] transition"
                    >
                      <td className="py-3 px-4 font-editorial font-bold text-base text-[#1F2421]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/products/${prod.slug}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-11 h-11 rounded-lg bg-white border border-[#EAE4D7] p-1 flex items-center justify-center shrink-0">
                            <img
                              src={prod.image}
                              alt={prod.shortName}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="font-bold text-[13.5px] text-[#1F2421] group-hover:text-[#1F4D3A]">
                            {prod.shortName}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs sm:text-[13px] text-[#4A504C]">
                        {prod.bestFor}
                      </td>
                      <td className="py-3 px-4">
                        <StarRating rating={prod.rating} size="xs" />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-extrabold text-[14px] text-[#1F2421]">{prod.price}</span>
                        {prod.isPrime && <PrimeBadge />}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <AffiliateButton
                          productId={prod.id}
                          productName={prod.name}
                          asin={prod.asin}
                          amazonUrl={prod.amazonUrl}
                          contentSlug={article.slug}
                          placement={`table_row_${index + 1}`}
                          variant="compact"
                          label="View"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. HOW WE TESTED 5-ICON GRID (Matches Screen 3 bottom section) */}
        {article.testingCriteria && article.testingCriteria.length > 0 && (
          <section id="how-we-tested" className="mt-9 scroll-mt-28">
            <h2 className="font-editorial text-2xl sm:text-[26px] font-bold text-[#1F2421] mb-5">
              How we tested
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 text-center">
              {article.testingCriteria.map((crit) => {
                const IconComp = CRITERIA_ICONS[crit.icon] || Sparkles;
                return (
                  <div
                    key={crit.title}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#E2ECE5] text-[#1F4D3A] flex items-center justify-center shadow-sm">
                      <IconComp className="w-5 h-5 stroke-[1.9]" />
                    </div>
                    <h3 className="font-sans font-bold text-[13.5px] text-[#1F2421]">
                      {crit.title}
                    </h3>
                    <p className="text-xs text-[#5C645E] leading-relaxed max-w-[165px]">
                      {crit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 6. IN-DEPTH REVIEWS, BUYING GUIDE & FAQS (Accessible via Anchor Tabs) */}
        <section id="reviews" className="mt-14 pt-8 border-t border-[#E4DDD0] scroll-mt-28 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl font-bold text-[#1F2421]">
              Detailed Review Notes
            </h2>
            <Link
              href="/compare"
              className="text-xs sm:text-sm font-semibold text-[#1F4D3A] hover:underline"
            >
              Compare specs side-by-side →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendedProducts.map((prod, idx) => (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-[#E4DDD0] p-5 shadow-card flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-[#1F4D3A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded">
                      #{idx + 1} · {prod.badge || `Best for ${prod.bestFor}`}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-extrabold text-[#1F2421]">{prod.price}</span>
                      {prod.isPrime && <PrimeBadge />}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={prod.image}
                      alt={prod.shortName}
                      className="w-16 h-16 object-contain bg-white rounded-lg border border-[#EAE4D7] p-1 shrink-0"
                    />
                    <div>
                      <h3 className="font-editorial text-lg font-bold text-[#1F2421]">
                        <Link href={`/products/${prod.slug}`} className="hover:text-[#1F4D3A]">
                          {prod.name}
                        </Link>
                      </h3>
                      <StarRating rating={prod.rating} reviewCount={prod.reviewCount} size="xs" />
                    </div>
                  </div>

                  <p className="text-xs text-[#4A504C] leading-relaxed">{prod.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#EAE4D7]">
                  <div>
                    <p className="font-bold text-[#1F4D3A] flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pros
                    </p>
                    <ul className="space-y-1 text-[11.5px] text-[#3F4641]">
                      {prod.pros.slice(0, 2).map((p) => (
                        <li key={p}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-rose-800 flex items-center gap-1 mb-1">
                      <XCircle className="w-3.5 h-3.5" /> Cons
                    </p>
                    <ul className="space-y-1 text-[11.5px] text-[#3F4641]">
                      {prod.cons.slice(0, 2).map((c) => (
                        <li key={c}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {article.buyingGuideSections && article.buyingGuideSections.length > 0 && (
          <section
            id="buying-guide"
            className="mt-10 scroll-mt-28 bg-white rounded-2xl border border-[#E4DDD0] p-6 shadow-card space-y-4"
          >
            <h2 className="font-editorial text-2xl font-bold text-[#1F2421]">
              Buying Guide: What to Look For
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {article.buyingGuideSections.map((sec) => (
                <div key={sec.heading} className="space-y-1.5">
                  <h3 className="font-editorial text-base font-bold text-[#1F2421]">
                    {sec.heading}
                  </h3>
                  <p className="text-xs text-[#4A504C] leading-relaxed">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {article.faqs.length > 0 && (
          <section
            id="faqs"
            className="mt-8 scroll-mt-28 bg-white rounded-2xl border border-[#E4DDD0] p-6 shadow-card"
          >
            <h2 className="font-editorial text-2xl font-bold text-[#1F2421] mb-4">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {article.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="font-editorial text-base font-bold text-[#1F2421]">
                    {faq.question}
                  </h3>
                  <p className="text-xs text-[#4A504C] mt-1.5 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {article.safetyWarnings.length > 0 && (
          <section className="mt-8 bg-amber-50/80 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <span className="font-bold uppercase tracking-wider">Surface Safety Check: </span>
                <span>{article.safetyWarnings.join(' ')}</span>
              </div>
            </div>
          </section>
        )}

        {article.sources.length > 0 && (
          <section className="mt-6 bg-[#F2ECE1] rounded-xl border border-[#E2DACB] p-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#1F4D3A] flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Primary Testing Standards & References
            </h3>
            <div className="flex flex-wrap gap-4 text-xs text-[#4A504C]">
              {article.sources.map((src) => (
                <a
                  key={src.id}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#1F4D3A] underline"
                >
                  <span>{src.title} ({src.publisher})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
