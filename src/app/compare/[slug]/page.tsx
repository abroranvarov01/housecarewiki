import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Trophy, CheckCircle2, ChevronRight } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from '@/lib/schema';
import { AffiliateDisclosureNote, PriceNote, EditorScore, AffiliateButton } from '@/components/ui/Badges';

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
  const winner = store.products.find((p) => p.id === comp.winnerId);

  if (!productA || !productB) {
    notFound();
  }

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
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="py-4 flex items-center gap-1.5 text-xs text-ink-muted">
        <Link href="/" className="hover:text-forest">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/compare" className="hover:text-forest">
          Comparisons
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium truncate">{comp.title}</span>
      </nav>
      <AffiliateDisclosureNote className="mb-4" />

      <header className="bg-gradient-to-br from-[#FBF9F5] to-[#EAE1D0] rounded-2xl border border-paper-border p-6 sm:p-10 shadow-soft space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider text-coral">
          Head-to-Head Lab Comparison · {comp.category}
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink leading-tight">
          {comp.title}
        </h1>
        <p className="text-sm sm:text-base text-ink-secondary max-w-2xl">
          {comp.subtitle}
        </p>
      </header>

      {/* Two Contenders Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[productA, productB].map((prod) => {
          const isWinner = prod.id === comp.winnerId;
          return (
            <div
              key={prod.id}
              className={`bg-white rounded-2xl p-6 shadow-card border-2 flex flex-col justify-between ${
                isWinner ? 'border-forest' : 'border-paper-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  {isWinner ? (
                    <span className="inline-flex items-center gap-1.5 bg-forest text-white text-xs font-bold px-3 py-1 rounded-full">
                      <Trophy className="w-3.5 h-3.5 text-sun" />
                      Our Overall Winner
                    </span>
                  ) : (
                    <span className="bg-paper-warm text-ink-secondary text-xs font-bold px-3 py-1 rounded-full">
                      Runner-Up Contender
                    </span>
                  )}
                  <span className="text-xs font-bold text-forest">
                    Score: {prod.scores.overall}/10
                  </span>
                </div>

                <div className="flex items-center gap-4 my-4">
                  <img
                    src={prod.image}
                    fetchPriority="high"
                    alt={prod.name}
                    className="w-24 h-24 rounded-xl object-cover border border-paper-border"
                  />
                  <div>
                    <Link
                      href={`/products/${prod.slug}`}
                      className="font-editorial font-bold text-xl text-ink hover:text-forest"
                    >
                      {prod.name}
                    </Link>
                    <div className="mt-1">
                      <EditorScore score={prod.scores.overall}
                        size="xs" />
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {prod.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-paper-border flex items-center justify-between">
                <div>
                  <PriceNote />
                </div>
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Editorial Verdict & Key Differences */}
      <section className="mt-8 bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card space-y-5">
        <h2 className="font-editorial text-2xl font-bold text-ink">
          The Editorial Verdict: Why {winner?.shortName} Wins
        </h2>
        <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
          {comp.verdict}
        </p>

        <div className="pt-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-forest mb-3">
            Key Measured Differences
          </h3>
          <ul className="space-y-2 text-sm text-ink">
            {comp.keyDifferences.map((diff) => (
              <li key={diff} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Scenario Breakdown */}
      <section className="mt-8 space-y-4">
        <h2 className="font-editorial text-2xl font-bold text-ink">
          Which One Should You Choose by Scenario?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {comp.scenarios.map((scen) => {
            const scenWinner =
              scen.winnerId === productA.id ? productA : productB;
            return (
              <div
                key={scen.scenario}
                className="bg-white rounded-2xl border border-paper-border p-5 shadow-card space-y-2"
              >
                <span className="text-xs font-bold text-coral uppercase tracking-wider">
                  Scenario: {scen.scenario}
                </span>
                <h3 className="font-editorial font-bold text-lg text-ink">
                  Winner: {scenWinner.shortName}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {scen.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
