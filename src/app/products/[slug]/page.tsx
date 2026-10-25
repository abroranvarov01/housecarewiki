import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, Scale } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import type { Product, SurfaceGuide } from '@/lib/types';
import { breadcrumbSchema, graph, productReviewSchema } from '@/lib/schema';
import {
  AffiliateDisclosureNote,
  EditorScore,
  AffiliateButton,
  SaveItemButton,
} from '@/components/ui/Badges';
import {
  Breadcrumbs,
  Byline,
  Container,
  EvidenceLabel,
  Figure,
  Kicker,
  SectionHead,
  articleHref,
  articleMeta,
  buttonClasses,
} from '@/components/field';

// ISR: pre-rendered, refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore().products.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = readStore();
  const product = store.products.find((p) => p.slug === params.slug);
  if (!product) return { title: 'Product Not Found' };

  return buildMetadata({
    title: `${product.shortName} Review: Specs, Pros & Cons`,
    description: fitDescription(product.summary, 'Specs, pros and cons, and who it suits best.'),
    path: `/products/${product.slug}`,
    ogKicker: `${product.brand} review`,
  });
}

// Static prices are not allowed on the page; drop any copy line that quotes one (e.g. "under $130").
const withoutPrices = (lines: string[]) => lines.filter((l) => !/\$\s?\d/.test(l));

const ASSESSMENT_ROWS: { key: 'cleaningPower' | 'easeOfUse' | 'buildQuality' | 'valueForMoney'; label: string }[] = [
  { key: 'cleaningPower', label: 'Cleaning power' },
  { key: 'easeOfUse', label: 'Ease of use' },
  { key: 'buildQuality', label: 'Build quality' },
  { key: 'valueForMoney', label: 'Value for money' },
];

// Product surface labels are free text ("Grout Lines", "Thick Pile Carpet"); map them to surface guides we publish.
const SURFACE_MATCHERS: { slug: string; pattern: RegExp }[] = [
  { slug: 'grout', pattern: /grout/i },
  { slug: 'ceramic-tile', pattern: /ceramic|tile floor/i },
  { slug: 'carpet', pattern: /carpet|\brugs?\b/i },
  { slug: 'upholstery', pattern: /upholster|sofa/i },
  { slug: 'glass', pattern: /glass|mirror/i },
  { slug: 'stainless-steel', pattern: /stainless/i },
];

function surfaceGuideFor(label: string, surfaces: SurfaceGuide[]): SurfaceGuide | undefined {
  const match = SURFACE_MATCHERS.find((m) => m.pattern.test(label));
  return match ? surfaces.find((s) => s.slug === match.slug) : undefined;
}

/** Editorial sub-scores as bars. Noise is never shown: we have not measured it. */
function ResearchAssessment({ product }: { product: Product }) {
  return (
    <dl className="space-y-3">
      {ASSESSMENT_ROWS.map(({ key, label }) => {
        const value = product.scores[key];
        return (
          <div key={key} className="grid grid-cols-[8rem_1fr_2.75rem] items-center gap-3 text-[15px]">
            <dt className="text-ink-secondary">{label}</dt>
            <dd className="h-2 overflow-hidden rounded-full bg-rule" aria-hidden="true">
              <div className="h-full rounded-full bg-terracotta" style={{ width: `${Math.max(0, Math.min(10, value)) * 10}%` }} />
            </dd>
            <dd className="text-right font-semibold text-sm tabular-nums text-ink">
              {value.toFixed(1)}
              <span className="sr-only"> out of 10</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export default function ProductProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const product = store.products.find((p) => p.slug === params.slug);
  if (!product) {
    notFound();
  }

  const alternatives = store.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const mentions = store.articles.filter(
    (a) => a.status === 'Published' && a.recommendedProductIds.includes(product.id),
  );
  const buyingGuides = mentions.filter((a) => a.routeType === 'best');
  const howToGuides = mentions.filter((a) => a.routeType !== 'best');

  const comparisons = store.comparisons.filter(
    (c) => c.productAId === product.id || c.productBId === product.id,
  );
  const productById = (id: string) => store.products.find((p) => p.id === id);

  const surfaceRows = product.surfaces.map((label) => ({ label, guide: surfaceGuideFor(label, store.surfaces) }));

  // Section numbers follow render order, so optional sections never leave gaps.
  let sectionCount = 0;
  const nextIndex = () => String(++sectionCount).padStart(2, '0');

  const reviewer = store.authors[0];
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Products', path: '/products' },
      { name: product.shortName, path: `/products/${product.slug}` },
    ]),
    productReviewSchema(product, reviewer),
  );

  return (
    <div className="pb-16">
      <JsonLd data={schema} />

      {/* Verdict-first header. */}
      <header className="border-b border-rule">
        <Container className="pb-10 pt-6 sm:pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Breadcrumbs
              items={[
                { name: 'Home', href: '/' },
                { name: 'Products', href: '/products' },
                { name: product.shortName },
              ]}
            />
            <SaveItemButton itemSlug={product.slug} itemType="product" title={product.name} />
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <div className="aspect-square rounded-2xl border border-rule bg-white p-6">
                <img
                  src={product.image}
                  alt={product.name}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <Kicker tone="accent">
                {product.badge ? `${product.badge} · ` : ''}Product review
              </Kicker>
              <h1 className="mt-3 font-serif text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] text-ink sm:text-[2.75rem]">
                {product.name}
              </h1>
              <p className="mt-2 text-[13px] text-ink-muted">
                {product.brand} · Model {product.model}
              </p>
              <Byline author={reviewer} updatedAt={product.updatedAt} className="mt-3" />

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-rule py-4">
                <EditorScore score={product.scores.overall} size="md" />
                <p className="text-[15px] text-ink">
                  <span className="kicker mr-2 text-ink-muted">Best for</span>
                  <span className="mark font-semibold">{product.bestFor}</span>
                </p>
              </div>

              <p className="mt-5 max-w-prose text-[1.0625rem] leading-relaxed text-ink-secondary">{product.summary}</p>

              <div className="mt-5 border-l-2 border-honey-deep pl-3">
                <EvidenceLabel status={product.evidenceStatus} withDetail />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <AffiliateButton
                  productId={product.id}
                  productName={product.name}
                  asin={product.asin}
                  amazonUrl={product.amazonUrl}
                  contentSlug={product.slug}
                  placement="product_profile_hero"
                  variant="coral"
                  label="Check price on Amazon"
                />
                <Link href={`/compare?p1=${product.id}`} className={buttonClasses('secondary')}>
                  <Scale className="h-4 w-4" aria-hidden="true" />
                  <span>Compare with another</span>
                </Link>
              </div>
              <AffiliateDisclosureNote className="mt-3" />
            </div>
          </div>
        </Container>
      </header>

      <Container>
        {/* Fit: who it suits, who should look elsewhere. */}
        <section aria-labelledby="fit-heading" className="pt-12">
          <SectionHead id="fit-heading" index={nextIndex()} title="Is it right for you?" />
          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
            <div className="bg-paper p-5 sm:p-6">
              <Kicker as="div" className="text-leaf-deep">Good fit if you are</Kicker>
              <ul className="mt-3 space-y-2.5 text-[15px] leading-snug text-ink-secondary">
                {withoutPrices(product.whoShouldBuy).map((w) => (
                  <li key={w} className="grid grid-cols-[1rem_1fr] gap-2">
                    <span className="mt-1.5 h-2 w-2 bg-leaf-deep" aria-hidden="true" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-paper p-5 sm:p-6">
              <Kicker as="div" tone="accent">Skip it if you are</Kicker>
              <ul className="mt-3 space-y-2.5 text-[15px] leading-snug text-ink-secondary">
                {withoutPrices(product.whoShouldSkip).map((w) => (
                  <li key={w} className="grid grid-cols-[1rem_1fr] gap-2">
                    <span className="mt-1.5 h-2 w-2 bg-terracotta" aria-hidden="true" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Highlights, pros and cons. */}
        <section aria-labelledby="pros-heading" className="pt-14">
          <SectionHead id="pros-heading" index={nextIndex()} title="What stands out" />
          <div className="mt-6 grid gap-10 lg:grid-cols-12">
            {product.highlights.length > 0 && (
              <ol className="divide-y divide-rule border-y border-rule lg:col-span-5">
                {product.highlights.map((h, i) => (
                  <li key={h} className="grid grid-cols-[2rem_1fr] gap-3 py-3.5">
                    <span className="kicker pt-1 text-terracotta-deep">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-serif text-lg font-semibold leading-snug text-ink">{h}</span>
                  </li>
                ))}
              </ol>
            )}
            <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
              <div>
                <h3 className="kicker text-leaf-deep">What we like</h3>
                <ul className="mt-3 space-y-2.5 text-[15px] leading-snug text-ink-secondary">
                  {withoutPrices(product.pros).map((pro) => (
                    <li key={pro} className="grid grid-cols-[1rem_1fr] gap-2">
                      <span className="font-semibold text-leaf-deep" aria-hidden="true">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="kicker text-terracotta-deep">Watch out for</h3>
                <ul className="mt-3 space-y-2.5 text-[15px] leading-snug text-ink-secondary">
                  {withoutPrices(product.cons).map((con) => (
                    <li key={con} className="grid grid-cols-[1rem_1fr] gap-2">
                      <span className="font-semibold text-terracotta-deep" aria-hidden="true">–</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Research assessment + specifications. */}
        <div className="grid gap-12 pt-14 lg:grid-cols-12">
          <section aria-labelledby="assessment-heading" className="lg:col-span-5">
            <SectionHead
              id="assessment-heading"
              index={nextIndex()}
              title="Research assessment"
              description={
                <>
                  Our editorial judgment from the specifications, manual and published care standards, scored out of 10. These
                  are not measurements.{' '}
                  <Link href="/methodology" className="link">
                    How we score
                  </Link>
                </>
              }
            />
            <div className="mt-6">
              <ResearchAssessment product={product} />
            </div>
            <div className="mt-6 flex items-center gap-3 border-t border-rule pt-4">
              <span className="text-[14px] text-ink-secondary">Overall</span>
              <EditorScore score={product.scores.overall} size="md" />
            </div>
          </section>

          <section aria-labelledby="specs-heading" className="lg:col-span-7">
            <SectionHead
              id="specs-heading"
              index={nextIndex()}
              title="Specifications"
              description="From the manufacturer's listing and manual; we have not measured these."
            />
            <div className="table-scroll mt-6">
              <table className="w-full border-collapse text-left text-[15px]">
                <caption className="sr-only">{product.shortName} specifications</caption>
                <tbody className="divide-y divide-rule border-y border-rule">
                  {Object.entries(product.specs).map(([label, val]) => (
                    <tr key={label}>
                      <th scope="row" className="kicker w-2/5 py-3 pr-4 align-top text-ink-muted">
                        {label}
                      </th>
                      <td className="py-3 text-ink">{val}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="kicker w-2/5 py-3 pr-4 align-top text-ink-muted">
                      Model
                    </th>
                    <td className="py-3 text-ink">{product.model}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Surfaces. */}
        {surfaceRows.length > 0 && (
          <section aria-labelledby="surfaces-heading" className="pt-14">
            <SectionHead
              id="surfaces-heading"
              index={nextIndex()}
              title="Surfaces it is made for"
              description="As listed by the manufacturer. Always check the care label or flooring guidance first."
            />
            <ul className="mt-5 flex flex-wrap gap-2">
              {surfaceRows.map(({ label, guide }) => (
                <li key={label}>
                  {guide ? (
                    <Link
                      href={`/surfaces/${guide.slug}`}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-terracotta/40 bg-leaf-soft px-4 text-[14px] font-medium text-terracotta-deep transition-colors hover:border-terracotta-deep"
                      title={`Care guide: ${guide.name}`}
                    >
                      {label}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-[44px] items-center rounded-full border border-rule px-4 text-[14px] text-ink-secondary">
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Where it appears: guides, buying guides, comparisons. */}
        {(howToGuides.length > 0 || buyingGuides.length > 0 || comparisons.length > 0) && (
          <section aria-labelledby="mentions-heading" className="pt-14">
            <SectionHead id="mentions-heading" index={nextIndex()} title="Where we recommend it" />
            <div className="mt-6 grid gap-10 lg:grid-cols-12">
              {(buyingGuides.length > 0 || howToGuides.length > 0) && (
                <ul className="divide-y divide-rule border-y border-rule lg:col-span-7">
                  {[...buyingGuides, ...howToGuides].map((g) => (
                    <li key={g.id}>
                      <Link href={articleHref(g)} className="group grid grid-cols-[4.5rem_1fr] gap-4 py-4">
                        <Figure src={g.heroImage} alt="" ratio="1/1" />
                        <span>
                          <span className="kicker text-ink-muted">
                            {g.routeType === 'best' ? 'Buying guide' : articleMeta(g)}
                            {g.topPickProductId === product.id ? ' · Our top pick' : ''}
                          </span>
                          <span className="mt-1 block font-serif text-lg font-semibold leading-snug text-ink">
                            <span className="hover-title">{g.title}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {comparisons.length > 0 && (
                <div className="lg:col-span-5">
                  <Kicker className="mb-3">Head-to-head</Kicker>
                  <ul className="space-y-3">
                    {comparisons.map((c) => {
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

        {/* Alternatives in the same category. */}
        {alternatives.length > 0 && (
          <section aria-labelledby="alternatives-heading" className="pt-14">
            <SectionHead
              id="alternatives-heading"
              index={nextIndex()}
              title="Other options in this category"
              href="/products"
              linkLabel="All product reviews"
            />
            <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-3">
              {alternatives.map((alt) => (
                <li key={alt.id} className="bg-paper">
                  <Link href={`/products/${alt.slug}`} className="group flex h-full gap-4 p-5 transition-colors hover:bg-paper-card">
                    <div className="h-20 w-20 shrink-0 bg-paper-card p-1">
                      <img src={alt.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <Kicker>{alt.badge || `Best for ${alt.bestFor}`}</Kicker>
                      <p className="mt-1 font-serif text-lg font-semibold leading-snug text-ink">
                        <span className="hover-title">{alt.shortName}</span>
                      </p>
                      <div className="mt-1.5">
                        <EditorScore score={alt.scores.overall} size="xs" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </div>
  );
}
