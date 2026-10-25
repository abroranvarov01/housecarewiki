import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from '@/lib/schema';
import { AffiliateDisclosureNote, EditorScore, AffiliateButton } from '@/components/ui/Badges';
import { Breadcrumbs, Byline, Callout, Container, EvidenceLabel, Kicker, SectionHead, articleHref } from '@/components/field';
import type { Product } from '@/lib/types';

// ISR: pre-rendered, refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore().comparisons.map((x) => ({ slug: x.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const store = readStore();
  const comp = store.comparisons.find((c) => c.slug === params.slug);
  if (!comp) return { title: 'Comparison Not Found' };
  const a = store.products.find((p) => p.id === comp.productAId);
  const b = store.products.find((p) => p.id === comp.productBId);
  return buildMetadata({
    title: a && b ? `${a.shortName} vs ${b.shortName}: Which to Buy?` : comp.title,
    description: fitDescription(comp.subtitle, 'Our verdict, the key differences and the better pick for each situation.'),
    path: `/compare/${comp.slug}`,
    ogKicker: 'Head-to-head comparison',
  });
}

/** "Tank Capacity: Bissell holds 48 oz…" → ["Tank Capacity", "Bissell holds 48 oz…"]; no short label → [null, text]. */
function splitDifference(text: string): [string | null, string] {
  const i = text.indexOf(':');
  if (i > 0 && i <= 32) return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
  return [null, text];
}

export default function EditorialComparisonPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const comp = store.comparisons.find((c) => c.slug === params.slug);
  if (!comp) {
    notFound();
  }

  const productA = store.products.find((p) => p.id === comp.productAId);
  const productB = store.products.find((p) => p.id === comp.productBId);

  if (!productA || !productB) {
    notFound();
  }

  const winner = [productA, productB].find((p) => p.id === comp.winnerId);
  const pair: Product[] = [productA, productB];
  const author = store.authors.find((a) => a.slug === 'housecarewiki-editors') || store.authors[0];
  const updatedAt = [productA.updatedAt, productB.updatedAt].sort().reverse()[0];

  const specKeys = Array.from(new Set([...Object.keys(productA.specs), ...Object.keys(productB.specs)]));
  const buyingGuides = store.articles.filter(
    (a) =>
      a.status === 'Published' &&
      a.routeType === 'best' &&
      (a.recommendedProductIds.includes(productA.id) || a.recommendedProductIds.includes(productB.id)),
  );

  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Comparisons', path: '/compare' },
      { name: comp.title, path: `/compare/${comp.slug}` },
    ]),
    webPageSchema({ path: `/compare/${comp.slug}`, name: comp.title, description: comp.subtitle, about: comp.category }),
    itemListSchema(comp.title, [productA, productB].map((p) => ({ name: p.name, path: `/products/${p.slug}` }))),
  );

  return (
    <article className="pb-16">
      <JsonLd data={schema} />

      {/* 1. Header */}
      <header className="border-b border-rule">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Comparisons', href: '/compare' },
              { name: comp.title },
            ]}
          />
          <Kicker tone="accent" className="mt-6">
            Head-to-head · {comp.category}
          </Kicker>
          <h1 className="mt-3 max-w-4xl font-serif text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
            {comp.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-secondary">{comp.subtitle}</p>
          <div className="mt-5 space-y-3">
            {author && <Byline author={author} updatedAt={updatedAt} />}
            <EvidenceLabel status="Research-Based Review" withDetail />
          </div>
        </Container>
      </header>

      {/* 2. Face-off: two columns, the winner marked, the verdict spanning both. */}
      <section aria-labelledby="faceoff-heading" className="pt-10">
        <Container>
          <h2 id="faceoff-heading" className="sr-only">
            The two products side by side
          </h2>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
            {pair.map((prod, i) => {
              const isWinner = prod.id === comp.winnerId;
              return (
                <div key={prod.id} className="flex flex-col bg-paper p-5 sm:p-7">
                  <div className="flex min-h-[28px] items-center justify-between gap-3">
                    <Kicker as="span">{i === 0 ? 'Option A' : 'Option B'}</Kicker>
                    {isWinner && <span className="kicker bg-honey px-2 py-1 text-ink">Our pick for most homes</span>}
                  </div>
                  <div className="mt-4 aspect-[4/3] bg-paper-card p-6">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-semibold leading-tight text-ink sm:text-[1.75rem]">
                    <Link href={`/products/${prod.slug}`} className="hover:text-terracotta-deep">
                      {prod.shortName}
                    </Link>
                  </h3>
                  <p className="mt-1 text-[15px] text-ink-secondary">
                    <span className="kicker text-ink-muted">Best for</span> {prod.bestFor}
                  </p>
                  <div className="mt-3">
                    <EditorScore score={prod.scores.overall} size="md" />
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">{prod.summary}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                    <AffiliateButton
                      productId={prod.id}
                      productName={prod.name}
                      asin={prod.asin}
                      amazonUrl={prod.amazonUrl}
                      contentSlug={comp.slug}
                      placement="comparison_contender_card"
                      variant={isWinner ? 'coral' : 'forest'}
                      label="Check price on Amazon"
                    />
                    <Link
                      href={`/products/${prod.slug}`}
                      className="group inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-terracotta-deep"
                    >
                      <span className="hover-title">Full review</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          <AffiliateDisclosureNote className="mt-3" />

          <Callout tone="answer" title="Our verdict" className="mt-6">
            {winner && (
              <p className="mb-2 font-serif text-xl font-semibold leading-snug text-ink">
                For most homes: the <span className="mark">{winner.shortName}</span>.
              </p>
            )}
            <p>{comp.verdict}</p>
          </Callout>
        </Container>
      </section>

      {/* 3. Key differences */}
      {comp.keyDifferences.length > 0 && (
        <section aria-labelledby="differences-heading" className="pt-14">
          <Container>
            <SectionHead id="differences-heading" index="01" title="Key differences" />
            <ol className="mt-6 divide-y divide-rule border-b border-rule">
              {comp.keyDifferences.map((diff, i) => {
                const [label, text] = splitDifference(diff);
                return (
                  <li key={diff} className="grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[2.5rem_12rem_1fr]">
                    <span className="kicker text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-semibold text-ink">{label || 'Difference'}</span>
                    <span className="max-w-prose text-[15px] leading-relaxed text-ink-secondary">{text}</span>
                  </li>
                );
              })}
            </ol>
          </Container>
        </section>
      )}

      {/* 4. Which one for you? Scenario → winner chip → why. */}
      {comp.scenarios.length > 0 && (
        <section aria-labelledby="scenarios-heading" className="pt-14">
          <Container>
            <SectionHead id="scenarios-heading" index="02" title="Which one for you?" />
            <ul className="mt-6 divide-y divide-rule border-b border-rule">
              {comp.scenarios.map((scen) => {
                const scenWinner = scen.winnerId === productA.id ? productA : productB;
                return (
                  <li key={scen.scenario} className="grid gap-x-6 gap-y-2 py-5 md:grid-cols-[minmax(0,16rem)_minmax(0,12rem)_1fr] md:items-start">
                    <h3 className="font-serif text-lg font-semibold leading-snug text-ink">{scen.scenario}</h3>
                    <p>
                      <span className="sr-only">Better pick: </span>
                      <Link
                        href={`/products/${scenWinner.slug}`}
                        className="inline-flex min-h-[44px] items-center rounded-full border border-ink px-4 text-[14px] font-semibold text-ink hover:border-terracotta-deep hover:text-terracotta-deep"
                      >
                        {scenWinner.shortName}
                      </Link>
                    </p>
                    <p className="max-w-prose text-[15px] leading-relaxed text-ink-secondary">{scen.explanation}</p>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>
      )}

      {/* 5. Spec-by-spec table */}
      {specKeys.length > 0 && (
        <section aria-labelledby="specs-heading" className="pt-14">
          <Container>
            <SectionHead
              id="specs-heading"
              index="03"
              title="Spec by spec"
              description={
                <>
                  From manufacturer listings and manuals. Rows where the two differ are shaded. We have not checked these figures
                  ourselves;{' '}
                  <Link href="/methodology" className="link">
                    how we evaluate
                  </Link>
                  .
                </>
              }
            />
            <div className="table-scroll mt-6 border border-rule">
              <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
                <caption className="sr-only">
                  Specifications of the {productA.shortName} and the {productB.shortName}
                </caption>
                <thead>
                  <tr className="border-b border-rule-strong bg-paper-card">
                    <th scope="col" className="kicker w-1/3 px-4 py-3 text-ink-muted">
                      Spec
                    </th>
                    {pair.map((p) => (
                      <th key={p.id} scope="col" className="px-4 py-3 font-serif text-base font-semibold text-ink">
                        {p.shortName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {specKeys.map((key) => {
                    const a = productA.specs[key] || '—';
                    const b = productB.specs[key] || '—';
                    const differs = a !== b;
                    return (
                      <tr key={key} className={differs ? 'bg-honey-soft/40' : 'bg-paper'}>
                        <th scope="row" className="px-4 py-3 align-top font-semibold text-ink">
                          {key}
                          {differs && <span className="sr-only"> (differs)</span>}
                        </th>
                        <td className="px-4 py-3 align-top text-ink-secondary">{a}</td>
                        <td className="px-4 py-3 align-top text-ink-secondary">{b}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      {/* 6. Keep reading: full reviews and the buying guides that include them. */}
      <section aria-labelledby="more-heading" className="pt-14">
        <Container>
          <SectionHead id="more-heading" index="04" title="Keep reading" />
          <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
            {pair.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} className="group flex items-baseline justify-between gap-4 border-b border-rule py-4">
                  <span>
                    <span className="kicker block text-ink-muted">Full review</span>
                    <span className="mt-1 block font-serif text-xl font-semibold leading-snug text-ink">
                      <span className="hover-title">{p.name}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep" aria-hidden="true" />
                </Link>
              </li>
            ))}
            {buyingGuides.map((g) => (
              <li key={g.id}>
                <Link href={articleHref(g)} className="group flex items-baseline justify-between gap-4 border-b border-rule py-4">
                  <span>
                    <span className="kicker block text-ink-muted">Buying guide</span>
                    <span className="mt-1 block font-serif text-xl font-semibold leading-snug text-ink">
                      <span className="hover-title">{g.title}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] text-ink-secondary">
            Want to line up more models?{' '}
            <Link href="/compare" className="link font-semibold">
              Build your own comparison
            </Link>
            .
          </p>
        </Container>
      </section>
    </article>
  );
}
