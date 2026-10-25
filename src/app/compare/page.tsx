import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { readStore } from '@/lib/store';
import { CompareBuilderClient } from '@/components/CompareBuilderClient';
import { Breadcrumbs, Container, Kicker, SectionHead } from '@/components/field';

// ISR: refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Product Comparison Builder',
  description:
    'Compare portable carpet cleaners, electric spin scrubbers and steam cleaners side by side on tank capacity, weight, included tools and our research-based ratings.',
  path: '/compare',
  noindex: true,
});

export default function ComparePage() {
  const store = readStore();
  const name = (id: string) => store.products.find((p) => p.id === id)?.shortName || '';

  return (
    <div className="pb-16">
      <header className="border-b border-rule">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Comparison builder' }]} />
          <Kicker tone="accent" className="mt-6">
            Comparison builder
          </Kicker>
          <h1 className="mt-3 max-w-3xl font-serif text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
            Line up the models you&apos;re choosing between.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-secondary">
            Pick two to four products and read their specs in one table. Specs come from manufacturer listings and manuals; our
            ratings are an editorial judgment based on that research.
          </p>
        </Container>
      </header>

      <Container className="pt-10">
        <CompareBuilderClient products={store.products} />
      </Container>

      {store.comparisons.length > 0 && (
        <section aria-labelledby="headtohead-heading" className="pt-14">
          <Container>
            <SectionHead
              id="headtohead-heading"
              title="Our head-to-heads"
              description="Two products, one verdict, and which to pick for your situation."
            />
            <ul className="mt-6 divide-y divide-rule border-b border-rule">
              {store.comparisons.map((comp) => (
                <li key={comp.slug}>
                  <Link href={`/compare/${comp.slug}`} className="group grid gap-2 py-5 md:grid-cols-[minmax(0,22rem)_1fr_auto] md:gap-8">
                    <span>
                      <span className="kicker block text-ink-muted">{comp.category}</span>
                      <span className="mt-1 block font-serif text-xl font-semibold leading-snug text-ink">
                        <span className="hover-title">
                          {name(comp.productAId)} vs {name(comp.productBId)}
                        </span>
                      </span>
                    </span>
                    <span className="max-w-prose text-[15px] leading-relaxed text-ink-secondary line-clamp-3">{comp.verdict}</span>
                    <ArrowRight
                      className="hidden h-4 w-4 self-center text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep md:block"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </div>
  );
}
