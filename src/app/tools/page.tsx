import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph } from '@/lib/schema';
import { Breadcrumbs, Container, Kicker, SectionHead } from '@/components/field';

export const metadata: Metadata = buildMetadata({
  title: 'Interactive Home Care Tools & Calculators',
  description:
    'Free interactive tools for stain removal, cleaning equipment matching, product comparisons, routine planning, cleaning costs and surface compatibility checks.',
  path: '/tools',
});

// Problem-solving tools lead: they answer "what do I do right now?"
const FIX_TOOLS = [
  {
    href: '/tools/stain-finder',
    name: 'Stain Solution Finder',
    question: 'Something spilled. What do I do?',
    cta: 'Find the steps for my stain',
    description:
      'Pick the stain and the surface. You get the supplies, numbered steps, safety warnings and the point where a pro is the better call.',
    examples: [
      { label: 'Coffee on a sofa', href: '/tools/stain-finder?stain=coffee&surface=fabric-sofa' },
      { label: 'Pet accident on carpet', href: '/tools/stain-finder?stain=pet-urine&surface=carpet-rug' },
      { label: 'Red wine on a rug', href: '/tools/stain-finder?stain=red-wine&surface=carpet-rug' },
    ],
  },
  {
    href: '/tools/surface-checker',
    name: 'Surface Compatibility Checker',
    question: 'Is this cleaner safe on this surface?',
    cta: 'Check a surface',
    description:
      'Check vinegar, peroxide, steam and spot cleaners against marble, grout, hardwood, tile and upholstery, and see what to use instead.',
    examples: [],
  },
];

// Planning and buying tools: a ruled list, each with the question it answers.
const PLAN_TOOLS = [
  {
    href: '/tools/equipment-finder',
    name: 'Cleaning Equipment Finder',
    question: 'Which kind of tool fits the job I have?',
  },
  {
    href: '/tools/routine-planner',
    name: 'Cleaning Routine Planner',
    question: 'What should I clean daily, weekly and monthly?',
  },
  {
    href: '/tools/cost-calculator',
    name: 'Cleaning Cost Calculator',
    question: 'Should I buy a carpet cleaner, rent one or hire a pro?',
  },
  {
    href: '/compare',
    name: 'Product Comparison Builder',
    question: 'How do these products differ on paper?',
  },
];

export default function ToolsIndexPage() {
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Tools', path: '/tools' },
    ]),
    {
      '@type': 'ItemList',
      '@id': `${absoluteUrl('/tools')}#tools`,
      name: 'HouseCareWiki interactive tools',
      itemListElement: [...FIX_TOOLS, ...PLAN_TOOLS].map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.name,
        url: absoluteUrl(t.href),
      })),
    },
  );

  return (
    <div className="pb-16">
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs className="py-4" items={[{ name: 'Home', href: '/' }, { name: 'Tools' }]} />

        <header className="max-w-3xl pb-10 pt-2">
          <Kicker tone="accent">Free tools</Kicker>
          <h1 className="mt-3 font-serif text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.015em] text-ink sm:text-5xl">
            Tools for the mess in front of you
          </h1>
          <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-secondary">
            Answer a couple of questions and get a specific answer, with the reasons. Start with a problem, or plan ahead.
          </p>
        </header>

        <section aria-labelledby="fix-heading">
          <SectionHead id="fix-heading" index="01" title="Fix a problem now" />
          <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
            {FIX_TOOLS.map((t) => (
              <article key={t.href} className="flex flex-col bg-paper-card p-6 sm:p-8">
                <Kicker>{t.name}</Kicker>
                <h3 className="mt-3 font-serif text-[1.75rem] font-semibold leading-tight text-ink sm:text-3xl">
                  <Link href={t.href} className="group">
                    <span className="hover-title">{t.question}</span>
                  </Link>
                </h3>
                <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-ink-secondary">{t.description}</p>
                {t.examples.length > 0 && (
                  <div className="mt-5">
                    <p className="kicker text-ink-muted">Common questions</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {t.examples.map((e) => (
                        <li key={e.href}>
                          <Link
                            href={e.href}
                            className="inline-flex min-h-[44px] items-center rounded-full border border-rule-strong px-4 text-[14px] text-ink-secondary transition-colors duration-150 hover:border-ink hover:text-ink"
                          >
                            {e.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-auto pt-7">
                  <Link
                    href={t.href}
                    className="group inline-flex min-h-[44px] items-center gap-2 rounded bg-ink px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ink-deep"
                  >
                    {t.cta}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16" aria-labelledby="plan-heading">
          <SectionHead id="plan-heading" index="02" title="Plan and choose" />
          <ul className="mt-6 divide-y divide-rule border-b border-rule">
            {PLAN_TOOLS.map((t, i) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="group grid min-h-[64px] grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5 sm:grid-cols-[2.5rem_minmax(0,18rem)_1fr_auto]"
                >
                  <span className="kicker text-terracotta-deep">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-serif text-xl font-semibold leading-snug text-ink group-hover:text-terracotta-deep">
                    <span className="hover-title">{t.name}</span>
                  </span>
                  <span className="col-start-2 text-[0.9375rem] text-ink-secondary sm:col-start-3">{t.question}</span>
                  <ArrowRight
                    className="col-start-3 row-start-1 h-4 w-4 self-center text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-terracotta-deep sm:col-start-4"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <aside className="mt-14 max-w-prose border-l-4 border-leaf bg-leaf-soft/60 px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-secondary">
          <p className="kicker mb-2 text-terracotta-deep">How these tools work</p>
          <p>
            Each tool runs on plain rules written from manufacturer instructions, upholstery cleaning codes and published care
            standards. The answers are guidance, not a guarantee: materials and finishes vary, so always spot-test on a hidden
            area first and follow your product’s care label.{' '}
            <Link href="/methodology" className="link">
              How we work
            </Link>
          </p>
        </aside>
      </Container>
    </div>
  );
}
