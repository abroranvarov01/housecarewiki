import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, Check, X } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/schema';
import { AffiliateDisclosureNote, EditorScore, AffiliateButton } from '@/components/ui/Badges';
import {
  Breadcrumbs,
  ButtonLink,
  Container,
  Figure,
  Kicker,
  SectionHead,
  articleHref,
  articleMeta,
} from '@/components/field';

// ISR: pre-rendered, refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore().surfaces.map((x) => ({ slug: x.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const store = readStore();
  const surface = store.surfaces.find((s) => s.slug === params.slug);
  if (!surface) return { title: 'Surface Guide Not Found' };
  return buildMetadata({
    title: `${surface.name} Cleaning & Safety Guide`,
    description: fitDescription(surface.summary, 'Safe cleaners, what to avoid, routine care and deep-clean steps.'),
    path: `/surfaces/${surface.slug}`,
    ogKicker: 'Surface safety guide',
  });
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function SurfaceGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const surface = store.surfaces.find((s) => s.slug === params.slug);
  if (!surface) {
    notFound();
  }

  const recommendedProducts = surface.recommendedProductIds
    .map((id) => store.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Surfaces', path: '/tools/surface-checker' },
      { name: surface.name, path: `/surfaces/${surface.slug}` },
    ]),
    webPageSchema({
      path: `/surfaces/${surface.slug}`,
      name: `${surface.name} Cleaning & Safety Guide`,
      description: surface.summary,
      about: surface.name,
    }),
  );

  const relatedGuides = store.articles.filter(
    (a) => a.status === 'Published' && a.routeType === 'guides' && a.surfaceSlugs.includes(surface.slug),
  );

  return (
    <div className="pb-16">
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs
          className="py-4"
          items={[
            { name: 'Home', href: '/' },
            { name: 'Surfaces', href: '/tools/surface-checker' },
            { name: surface.name },
          ]}
        />

        {/* Header */}
        <header className="grid gap-8 border-b border-rule pb-10 pt-4 lg:grid-cols-12 lg:gap-12 lg:pt-6">
          <div className="lg:col-span-7">
            <Kicker tone="accent">Surface care guide · {surface.category}</Kicker>
            <h1 className="mt-4 font-serif text-[2.25rem] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.5rem]">
              {surface.name}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-secondary">{surface.summary}</p>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
              <span className="mark">Check the &ldquo;never use&rdquo; list first.</span> Most surface damage comes from one wrong
              product, not from too little scrubbing.
            </p>
          </div>
          <div className="lg:col-span-5">
            <Figure src={surface.image} alt={surface.name} ratio="4/3" priority sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
        </header>

        {/* Centerpiece: safe vs never */}
        <section aria-labelledby="safe-heading" className="mt-12">
          <SectionHead
            id="safe-heading"
            index="01"
            title={`What’s safe on ${surface.name.toLowerCase()}`}
            description="Read across: what you can reach for, and what to keep away from this surface and why."
          />
          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
            <div className="bg-leaf-soft/60 p-5 sm:p-7">
              <h3 className="kicker flex items-center gap-2 text-leaf-deep">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-leaf-deep text-paper-light" aria-hidden="true">
                  <Check className="h-4 w-4" />
                </span>
                Safe to use
              </h3>
              <ul className="mt-4 border-t border-leaf-deep/30">
                {surface.safeAgents.map((agent) => (
                  <li
                    key={agent}
                    className="grid grid-cols-[1.25rem_1fr] gap-3 border-b border-leaf-deep/30 py-3 text-base leading-snug text-ink sm:text-[17px]"
                  >
                    <Check className="mt-0.5 h-4 w-4 text-leaf-deep" aria-hidden="true" />
                    <span>{agent}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-terracotta-soft/60 p-5 sm:p-7">
              <h3 className="kicker flex items-center gap-2 text-terracotta-deep">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-terracotta text-paper-light" aria-hidden="true">
                  <X className="h-4 w-4" />
                </span>
                Never use
              </h3>
              <ul className="mt-4 border-t border-terracotta/30">
                {surface.unsafeAgents.map((u) => (
                  <li key={u.agent} className="grid grid-cols-[1.25rem_1fr] gap-3 border-b border-terracotta/30 py-3">
                    <X className="mt-1 h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                    <span>
                      <span className="block text-base font-semibold leading-snug text-ink sm:text-[17px]">{u.agent}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-ink-secondary">{u.reason}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-[15px] text-ink-secondary">Have a specific cleaner in mind?</p>
            <ButtonLink href="/tools/surface-checker" variant="ghost" size="md" className="-ml-2 sm:ml-0">
              Check it in the Surface Checker
            </ButtonLink>
          </div>
        </section>

        {/* Routine + deep clean, asymmetric split */}
        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <section aria-labelledby="routine-heading" className="lg:col-span-5">
            <SectionHead id="routine-heading" index="02" title="Routine care" />
            <ul className="mt-5 border-t border-rule">
              {surface.routineCare.map((step) => (
                <li
                  key={step}
                  className="grid grid-cols-[0.875rem_1fr] gap-3 border-b border-rule py-3.5 text-base leading-relaxed text-ink-secondary sm:text-[17px]"
                >
                  <span className="mt-[0.7em] h-1.5 w-1.5 bg-ink" aria-hidden="true" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="deep-heading" className="lg:col-span-7">
            <SectionHead id="deep-heading" index="03" title="Deep clean, step by step" />
            <ol className="mt-2">
              {surface.deepCleanSteps.map((step, i) => (
                <li key={step} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-rule py-5 sm:grid-cols-[4rem_1fr]">
                  <span className="font-serif text-[2.25rem] font-medium leading-none tracking-[-0.02em] text-terracotta-deep" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <p className="max-w-prose text-base leading-relaxed text-ink-secondary sm:text-[17px]">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Products, compact, after the care advice */}
        {recommendedProducts.length > 0 && (
          <section aria-labelledby="products-heading" className="mt-14 max-w-4xl">
            <SectionHead
              id="products-heading"
              index="04"
              title="Tools that suit this surface"
              description="Picked from specifications and manufacturer care guidance. Plain water and a microfiber cloth handle most routine care."
            />
            <AffiliateDisclosureNote className="mt-3" />
            <ul className="mt-4 border-t border-rule">
              {recommendedProducts.map((prod) => (
                <li
                  key={prod.id}
                  className="grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-3 border-b border-rule py-4 sm:grid-cols-[4.5rem_1fr_auto]"
                >
                  <Link href={`/products/${prod.slug}`} tabIndex={-1} aria-hidden="true">
                    <Figure src={prod.image} alt="" ratio="1/1" />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/products/${prod.slug}`} className="group block">
                      <span className="font-serif text-lg font-semibold leading-snug text-ink">
                        <span className="hover-title">{prod.shortName}</span>
                      </span>
                    </Link>
                    <p className="mt-0.5 text-sm leading-snug text-ink-muted">Best for {prod.bestFor}</p>
                    <div className="mt-1.5">
                      <EditorScore score={prod.scores.overall} size="xs" />
                    </div>
                  </div>
                  <AffiliateButton
                    productId={prod.id}
                    productName={prod.name}
                    asin={prod.asin}
                    amazonUrl={prod.amazonUrl}
                    contentSlug={surface.slug}
                    placement="surface_guide_card"
                    variant="compact"
                    label="Check price on Amazon"
                    className="col-span-2 min-h-[44px] sm:col-span-1"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Guides for this surface */}
        {relatedGuides.length > 0 && (
          <section aria-labelledby="guides-heading" className="mt-14 max-w-4xl">
            <SectionHead id="guides-heading" index="05" title="Fix-it guides for this surface" />
            <ul className="mt-4 border-t border-rule">
              {relatedGuides.map((g) => (
                <li key={g.id}>
                  <Link href={articleHref(g)} className="group grid grid-cols-[4.5rem_1fr] gap-4 border-b border-rule py-4">
                    <Figure src={g.heroImage} alt="" ratio="1/1" />
                    <span className="min-w-0">
                      <span className="kicker text-ink-muted">{articleMeta(g)}</span>
                      <span className="mt-1 block font-serif text-lg font-semibold leading-snug text-ink">
                        <span className="hover-title">{g.title}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Other surfaces */}
        <nav aria-labelledby="other-surfaces" className="mt-14 border-t border-rule-strong pt-3">
          <p id="other-surfaces" className="kicker text-ink">
            Other surfaces
          </p>
          <ul className="mt-3 grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
            {store.surfaces
              .filter((s) => s.slug !== surface.slug)
              .map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/surfaces/${s.slug}`}
                    className="group flex min-h-[44px] items-center justify-between gap-3 border-b border-rule py-2.5 text-[15px] text-ink hover:text-terracotta-deep"
                  >
                    <span className="hover-title">{s.name}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}
