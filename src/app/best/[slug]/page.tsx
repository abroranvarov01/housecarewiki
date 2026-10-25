import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import type { Product } from '@/lib/types';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  graph,
  isoDate,
  itemListSchema,
} from '@/lib/schema';
import { EditorScore, AffiliateDisclosureNote, AffiliateButton } from '@/components/ui/Badges';
import {
  Breadcrumbs,
  Byline,
  Callout,
  Container,
  EvidenceLabel,
  FaqList,
  Figure,
  Kicker,
  SectionHead,
  SourceList,
  articleHref,
  articleMeta,
} from '@/components/field';

// ISR: pages are pre-rendered and refreshed hourly (and on every CMS publish via revalidatePath).
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore()
    .articles.filter((a) => a.routeType === 'best')
    .map((a) => ({ slug: a.slug }));
}

function findBestArticle(slug: string) {
  return readStore().articles.find((a) => a.slug === slug && a.routeType === 'best');
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = findBestArticle(params.slug);
  if (!article) return { title: 'Guide Not Found' };
  const author = readStore().authors.find((au) => au.slug === article.authorSlug);

  return buildMetadata({
    title: article.seo.title,
    description: article.seo.description,
    path: `/best/${article.slug}`,
    type: 'article',
    ogKicker: 'Buying guide',
    noindex: !article.seo.indexable || article.status !== 'Published',
    article: {
      publishedTime: isoDate(article.publishedAt),
      modifiedTime: isoDate(article.updatedAt),
      section: article.categoryLabel,
      tags: [article.seo.focusKeyword],
      authors: author ? [absoluteUrl(`/authors/${author.slug}`)] : undefined,
    },
  });
}

// Spec keys that must never appear in the comparison table (unverified or policy-restricted data).
const EXCLUDED_SPEC = /noise|decibel|\bdb\b|price|review|stars?\b|^rating$/i;
const MAX_SPEC_COLUMNS = 7;

/** Spec keys shared by most of the picks, in the order they first appear. */
function sharedSpecKeys(products: Product[]): string[] {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const p of products) {
    for (const key of Object.keys(p.specs)) {
      if (EXCLUDED_SPEC.test(key)) continue;
      if (!counts.has(key)) order.push(key);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const threshold = Math.max(2, Math.ceil(products.length / 2));
  let keys = order.filter((k) => (counts.get(k) || 0) >= threshold);
  if (keys.length > MAX_SPEC_COLUMNS) {
    // Long free-text lists ("Included Tools") make the table unreadable; drop them first.
    keys = keys.filter((k) => !/included/i.test(k));
  }
  if (keys.length > MAX_SPEC_COLUMNS) {
    keys = [...keys]
      .sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0))
      .slice(0, MAX_SPEC_COLUMNS)
      .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }
  return keys;
}

// Static prices are not allowed on the page; drop any copy line that quotes one (e.g. "under $130").
const withoutPrices = (lines: string[]) => lines.filter((l) => !/\$\s?\d/.test(l));

const ASSESSMENT_ROWS: { key: 'cleaningPower' | 'easeOfUse' | 'buildQuality' | 'valueForMoney'; label: string }[] = [
  { key: 'cleaningPower', label: 'Cleaning power' },
  { key: 'easeOfUse', label: 'Ease of use' },
  { key: 'buildQuality', label: 'Build quality' },
  { key: 'valueForMoney', label: 'Value for money' },
];

/** Editorial sub-scores as simple bars. Deliberately excludes noise, which we have not measured. */
function ResearchAssessment({ product }: { product: Product }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Kicker as="div" tone="ink">Research assessment</Kicker>
        <Link href="/methodology" className="link inline-flex min-h-[44px] items-center text-[14px]">
          How we score
        </Link>
      </div>
      <dl className="mt-3 space-y-2.5">
        {ASSESSMENT_ROWS.map(({ key, label }) => {
          const value = product.scores[key];
          return (
            <div key={key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-[14px]">
              <dt className="text-ink-secondary">{label}</dt>
              <dd className="h-1.5 overflow-hidden rounded-full bg-rule" aria-hidden="true">
                <div className="h-full rounded-full bg-terracotta" style={{ width: `${Math.max(0, Math.min(10, value)) * 10}%` }} />
              </dd>
              <dd className="text-right font-semibold text-[13px] tabular-nums text-ink">
                {value.toFixed(1)}
                <span className="sr-only"> out of 10</span>
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 text-[12px] leading-snug text-ink-muted">
        Editorial judgment from specifications, manuals and published standards. Not a measurement.
      </p>
    </div>
  );
}

export default function BestProductsPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const article = findBestArticle(params.slug);
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

  const specKeys = sharedSpecKeys(recommendedProducts);
  const pickIds = new Set(recommendedProducts.map((p) => p.id));

  const relatedGuides = store.articles
    .filter(
      (a) =>
        a.status === 'Published' &&
        a.id !== article.id &&
        (a.roomSlug === article.roomSlug || a.recommendedProductIds.some((id) => pickIds.has(id))),
    )
    .slice(0, 4);

  const relatedComparisons = store.comparisons.filter(
    (c) => pickIds.has(c.productAId) && pickIds.has(c.productBId),
  );
  const productById = (id: string) => store.products.find((p) => p.id === id);

  const hasCriteria = Boolean(article.testingCriteria && article.testingCriteria.length > 0);
  const hasGuide = Boolean(article.buyingGuideSections && article.buyingGuideSections.length > 0);

  const navItems = [
    { href: '#top-picks', label: 'Our verdict' },
    { href: '#at-a-glance', label: 'Picks at a glance' },
    specKeys.length > 0 ? { href: '#comparison', label: 'Compare specs' } : null,
    { href: '#reviews', label: 'Reviews' },
    hasCriteria ? { href: '#what-we-compared', label: 'What we compared' } : null,
    hasGuide ? { href: '#buying-guide', label: 'Buying guide' } : null,
    article.faqs.length > 0 ? { href: '#faqs', label: 'FAQ' } : null,
  ].filter((x): x is { href: string; label: string } => Boolean(x));

  // Section numbers follow render order, so optional sections never leave gaps.
  let sectionCount = 0;
  const nextIndex = () => String(++sectionCount).padStart(2, '0');

  const path = `/best/${article.slug}`;
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Reviews', path: '/products' },
      { name: article.title, path },
    ]),
    articleSchema(article, author, path),
    itemListSchema(
      article.title,
      recommendedProducts.map((p) => ({ name: p.name, path: `/products/${p.slug}` })),
    ),
    faqSchema(article.faqs),
  );

  return (
    <div className="pb-16">
      <JsonLd data={schema} />

      {/* Header: what this page is and what it is based on. */}
      <header className="border-b border-rule">
        <Container className="pb-8 pt-6 sm:pb-10 sm:pt-8">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Reviews', href: '/products' },
              { name: article.title },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <Kicker tone="accent">
              Buying guide · {recommendedProducts.length} picks
            </Kicker>
            <h1 className="mt-3 font-serif text-[2.25rem] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-secondary">{article.subtitle}</p>
            <Byline
              author={author}
              updatedAt={article.updatedAt}
              publishedAt={article.publishedAt}
              readingTime={article.readingTime}
              className="mt-5"
            />
            <div className="mt-4 border-l-2 border-honey-deep pl-3">
              <EvidenceLabel status={article.evidenceStatus} withDetail />
            </div>
          </div>
        </Container>
      </header>

      {/* In-page navigation: scrolls sideways on small screens. */}
      <nav
        aria-label="On this page"
        className="sticky top-16 z-30 border-b border-rule bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85"
      >
        <Container>
          <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  className="flex min-h-[44px] items-center whitespace-nowrap px-3 text-[14px] font-medium text-ink-secondary transition-colors hover:text-terracotta-deep"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <Container>
        {/* Verdict first: the short answer, then the top pick. */}
        <section id="top-picks" aria-labelledby="verdict-heading" className="scroll-mt-32 pt-10 sm:pt-12">
          <SectionHead id="verdict-heading" index={nextIndex()} title="Our verdict" />
          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Callout tone="answer" title="The short answer">
                <p className="text-[1.0625rem] leading-relaxed text-ink">{article.quickAnswer}</p>
              </Callout>
              <AffiliateDisclosureNote className="mt-4" />
            </div>

            {topPick && (
              <div className="border border-rule bg-paper-card p-5 lg:col-span-5">
                <div className="grid grid-cols-[7rem_1fr] gap-4 sm:grid-cols-[9rem_1fr]">
                  <Link href={`/products/${topPick.slug}`} className="block aspect-square bg-paper-card">
                    <img
                      src={topPick.image}
                      alt={topPick.name}
                      fetchPriority="high"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Kicker tone="accent">{topPick.badge || 'Our top pick'}</Kicker>
                    <h3 className="mt-1 font-serif text-2xl font-semibold leading-tight text-ink">
                      <Link href={`/products/${topPick.slug}`} className="hover:text-terracotta-deep">
                        {topPick.shortName}
                      </Link>
                    </h3>
                    <p className="mt-1 text-[13px] text-ink-muted">Best for: {topPick.bestFor}</p>
                    <div className="mt-2">
                      <EditorScore score={topPick.scores.overall} size="md" />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-secondary">{topPick.summary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <AffiliateButton
                    productId={topPick.id}
                    productName={topPick.name}
                    asin={topPick.asin}
                    amazonUrl={topPick.amazonUrl}
                    contentSlug={article.slug}
                    placement="our_top_pick_box"
                    variant="coral"
                    label="Check price on Amazon"
                  />
                  <a href={`#${topPick.slug}`} className="link inline-flex min-h-[44px] items-center text-sm font-semibold">
                    Read our notes
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick picks: a numbered, ruled index of every recommendation. */}
        <section id="at-a-glance" aria-labelledby="glance-heading" className="scroll-mt-32 pt-14">
          <SectionHead id="glance-heading" index={nextIndex()} title="The picks at a glance" />
          <ol className="mt-4 divide-y divide-rule border-b border-rule">
            {recommendedProducts.map((prod, index) => (
              <li key={prod.id} className="grid grid-cols-[2rem_4rem_1fr] gap-x-4 gap-y-3 py-5 sm:grid-cols-[2.5rem_5rem_1fr_auto] sm:items-center">
                <span className="kicker pt-1 text-terracotta-deep sm:pt-0">{String(index + 1).padStart(2, '0')}</span>
                <div className="aspect-square bg-paper-card p-1">
                  <img src={prod.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                </div>
                <div className="min-w-0">
                  <Kicker>{prod.badge || `Best for ${prod.bestFor}`}</Kicker>
                  <h3 className="mt-1 font-serif text-xl font-semibold leading-snug text-ink">
                    <Link href={`/products/${prod.slug}`} className="hover:text-terracotta-deep">
                      {prod.shortName}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[14px] leading-snug text-ink-secondary">{prod.highlights[0] || prod.summary}</p>
                </div>
                <div className="col-span-3 col-start-1 flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-span-1 sm:col-start-auto sm:justify-end">
                  <EditorScore score={prod.scores.overall} size="xs" />
                  <a
                    href={`#${prod.slug}`}
                    className="group inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-terracotta-deep"
                  >
                    <span className="hover-title">Our notes</span>
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <AffiliateButton
                    productId={prod.id}
                    productName={prod.name}
                    asin={prod.asin}
                    amazonUrl={prod.amazonUrl}
                    contentSlug={article.slug}
                    placement={`table_row_${index + 1}`}
                    variant="compact"
                    label="Check on Amazon"
                    className="whitespace-nowrap"
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Spec comparison: only keys most picks share; missing values shown as a dash. */}
        {specKeys.length > 0 && (
          <section id="comparison" aria-labelledby="comparison-heading" className="scroll-mt-32 pt-14">
            <SectionHead
              id="comparison-heading"
              index={nextIndex()}
              title="Key specs side by side"
              href="/compare"
              linkLabel="Build your own comparison"
              description="From each manufacturer's listing and manual. We have not measured these ourselves."
            />
            <div className="table-scroll mt-6 border border-rule">
              <table className="w-full min-w-[40rem] border-collapse text-left text-[14px]">
                <caption className="sr-only">Key specifications of each pick in this guide</caption>
                <thead>
                  <tr className="border-b border-rule-strong bg-paper-warm">
                    <th scope="col" className="kicker sticky left-0 z-10 bg-paper-warm px-4 py-3 text-ink">
                      Product
                    </th>
                    {specKeys.map((key) => (
                      <th key={key} scope="col" className="kicker px-4 py-3 text-ink">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {recommendedProducts.map((prod) => (
                    <tr key={prod.id}>
                      <th scope="row" className="sticky left-0 z-10 min-w-[9rem] border-r border-rule bg-paper-card px-4 py-3 font-semibold text-ink">
                        <Link href={`/products/${prod.slug}`} className="hover:text-terracotta-deep">
                          {prod.shortName}
                        </Link>
                      </th>
                      {specKeys.map((key) => (
                        <td key={key} className="px-4 py-3 align-top text-ink-secondary">
                          {prod.specs[key] || <span aria-label="Not listed">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Per-product write-ups. */}
        <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-32 pt-14">
          <SectionHead id="reviews-heading" index={nextIndex()} title="Our notes on each pick" />
          <div className="mt-2">
            {recommendedProducts.map((prod, idx) => (
              <article
                key={prod.id}
                id={prod.slug}
                aria-labelledby={`${prod.slug}-name`}
                className="grid scroll-mt-32 gap-8 border-b border-rule py-10 lg:grid-cols-12"
              >
                <div className={`lg:col-span-4 ${idx % 2 === 1 ? 'lg:order-2 lg:col-start-9' : ''}`}>
                  <Link href={`/products/${prod.slug}`} className="block aspect-square rounded-2xl border border-rule bg-white p-4">
                    <img src={prod.image} alt={prod.name} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                  </Link>
                  <div className="mt-5">
                    <ResearchAssessment product={prod} />
                  </div>
                </div>

                <div className={`lg:col-span-8 ${idx % 2 === 1 ? 'lg:order-1 lg:col-start-1 lg:row-start-1' : ''}`}>
                  <Kicker tone="accent">
                    {String(idx + 1).padStart(2, '0')} · Best for {prod.bestFor.toLowerCase()}
                  </Kicker>
                  <h3 id={`${prod.slug}-name`} className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-3xl">
                    {prod.name}
                  </h3>
                  <div className="mt-3">
                    <EditorScore score={prod.scores.overall} size="sm" />
                  </div>
                  <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-secondary">{prod.summary}</p>

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <div>
                      <Kicker as="div" className="text-leaf-deep">What we like</Kicker>
                      <ul className="mt-2 space-y-2 text-[15px] leading-snug text-ink-secondary">
                        {withoutPrices(prod.pros).map((p) => (
                          <li key={p} className="grid grid-cols-[1rem_1fr] gap-2">
                            <span className="font-semibold text-leaf-deep" aria-hidden="true">+</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Kicker as="div" tone="accent">Watch out for</Kicker>
                      <ul className="mt-2 space-y-2 text-[15px] leading-snug text-ink-secondary">
                        {withoutPrices(prod.cons).map((c) => (
                          <li key={c} className="grid grid-cols-[1rem_1fr] gap-2">
                            <span className="font-semibold text-terracotta-deep" aria-hidden="true">–</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {withoutPrices(prod.whoShouldSkip).length > 0 && (
                    <div className="mt-6 border-l-2 border-terracotta pl-4">
                      <Kicker as="div" tone="accent">Skip it if</Kicker>
                      <ul className="mt-1.5 space-y-1 text-[15px] leading-snug text-ink-secondary">
                        {withoutPrices(prod.whoShouldSkip).map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <AffiliateButton
                      productId={prod.id}
                      productName={prod.name}
                      asin={prod.asin}
                      amazonUrl={prod.amazonUrl}
                      contentSlug={article.slug}
                      placement={`review_card_${idx + 1}`}
                      variant="forest"
                      label="Check price on Amazon"
                    />
                    <Link
                      href={`/products/${prod.slug}`}
                      className="group inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-terracotta-deep"
                    >
                      <span className="hover-title">Full review and specs</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* How we compared: criteria, then long-form buying advice. */}
        {(hasCriteria || hasGuide) && (
          <div className="grid gap-12 pt-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              {hasCriteria && (
                <section id="what-we-compared" aria-labelledby="criteria-heading" className="scroll-mt-32">
                  <SectionHead
                    id="criteria-heading"
                    index={nextIndex()}
                    title="What we compared"
                    description={
                      <>
                        We read manufacturer specifications, manuals and published care standards for every pick. We have not
                        used these products ourselves.{' '}
                        <Link href="/methodology" className="link">
                          Our methodology
                        </Link>
                      </>
                    }
                  />
                  <ol className="mt-5 divide-y divide-rule border-b border-rule">
                    {article.testingCriteria!.map((crit, i) => (
                      <li key={`${crit.title}-${i}`} className="grid grid-cols-[2rem_1fr] gap-3 py-3.5">
                        <span className="kicker pt-1 text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          <p className="font-semibold text-ink">{crit.title}</p>
                          <p className="mt-0.5 text-[15px] leading-relaxed text-ink-secondary">{crit.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {hasGuide && (
                <section
                  id="buying-guide"
                  aria-labelledby="guide-heading"
                  className={`scroll-mt-32 ${hasCriteria ? 'pt-14' : ''}`}
                >
                  <SectionHead id="guide-heading" index={nextIndex()} title="What to look for before you buy" />
                  <div className="prose-field mt-6 max-w-prose space-y-8">
                    {article.buyingGuideSections!.map((sec) => (
                      <div key={sec.heading}>
                        <h3 className="font-serif text-2xl font-semibold leading-snug text-ink">{sec.heading}</h3>
                        <p className="mt-2">{sec.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="hidden lg:col-span-5 lg:block">
              <div className="lg:sticky lg:top-32">
                <Figure
                  src={article.heroImage}
                  alt={article.heroImageAlt}
                  ratio="4/5"
                  sizes="(min-width: 1024px) 38vw, 100vw"
                />
              </div>
            </div>
          </div>
        )}

        {/* Safety before use. */}
        {article.safetyWarnings.length > 0 && (
          <section aria-label="Safety" className="pt-14">
            <Callout tone="safety" title="Before you use any of these" className="max-w-3xl">
              <ul className="list-disc space-y-1.5 pl-5">
                {article.safetyWarnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Callout>
          </section>
        )}

        {article.faqs.length > 0 && (
          <section id="faqs" aria-labelledby="faq-heading" className="scroll-mt-32 pt-14">
            <SectionHead id="faq-heading" index={nextIndex()} title="Questions people ask" />
            <FaqList faqs={article.faqs} className="mt-4 max-w-3xl" />
          </section>
        )}

        {article.sources.length > 0 && (
          <div className="max-w-3xl pt-12">
            <SourceList sources={article.sources} />
          </div>
        )}

        {(relatedGuides.length > 0 || relatedComparisons.length > 0) && (
          <section aria-labelledby="related-heading" className="pt-14">
            <SectionHead id="related-heading" index={nextIndex()} title="Keep reading" />
            <div className="mt-6 grid gap-10 lg:grid-cols-12">
              {relatedGuides.length > 0 && (
                <ul className="divide-y divide-rule border-y border-rule lg:col-span-7">
                  {relatedGuides.map((g) => (
                    <li key={g.id}>
                      <Link href={articleHref(g)} className="group grid grid-cols-[4.5rem_1fr] gap-4 py-4">
                        <Figure src={g.heroImage} alt="" ratio="1/1" />
                        <span>
                          <span className="kicker text-ink-muted">{articleMeta(g)}</span>
                          <span className="mt-1 block font-serif text-lg font-semibold leading-snug text-ink">
                            <span className="hover-title">{g.title}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {relatedComparisons.length > 0 && (
                <div className="lg:col-span-5">
                  <Kicker className="mb-3">Head-to-head</Kicker>
                  <ul className="space-y-3">
                    {relatedComparisons.map((c) => {
                      const a = productById(c.productAId);
                      const b = productById(c.productBId);
                      if (!a || !b) return null;
                      return (
                        <li key={c.slug}>
                          <Link
                            href={`/compare/${c.slug}`}
                            className="group grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-rule bg-paper-card p-4 transition-colors hover:border-rule-strong"
                          >
                            <span className="text-right font-serif text-lg font-semibold leading-tight text-ink">{a.shortName}</span>
                            <span className="kicker rounded-full bg-honey px-2 py-1 text-ink">vs</span>
                            <span className="font-serif text-lg font-semibold leading-tight text-ink">{b.shortName}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
