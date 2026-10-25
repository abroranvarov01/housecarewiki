import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { ORG_ID, breadcrumbSchema, graph } from '@/lib/schema';
import { Breadcrumbs, Container, Kicker } from '@/components/field';
import { isStainType, isSurface } from '@/lib/tools-engine';
import {
  StainFinderTool,
  EquipmentFinderTool,
  RoutinePlannerTool,
  CostCalculatorTool,
  SurfaceCheckerTool,
} from '@/components/InteractiveToolsClient';

interface ToolMeta {
  title: string;
  /** One-line explanation under the H1; also the meta description. */
  subtitle: string;
  kicker: string;
  /** "How this tool decides": short plain sentences, server-rendered. */
  how: string[];
  related: { label: string; href: string }[];
}

const TOOL_META: Record<string, ToolMeta> = {
  'stain-finder': {
    title: 'Stain Solution Finder',
    subtitle:
      'Pick what spilled and what it landed on. You get the supplies, steps and safety warnings for that combination, plus when to call a pro.',
    kicker: 'Free tool · Stains',
    how: [
      'The answer comes from a fixed set of rules, not guesswork: the stain type, the surface, how old the stain is and, for sofas, the cleaning code on the tag.',
      'The rules follow upholstery cleaning codes (W, S, WS, X), care-label conventions and published cleaning guidance. A code S fabric, for example, never gets a water-based method.',
      'Safety rules always apply: never mix bleach with ammonia or acids, ventilate when using solvents or peroxide, and spot-test on a hidden area first.',
      'It’s general guidance, not a guarantee. Fabrics, dyes and finishes vary, so follow your manufacturer’s care instructions where they differ.',
    ],
    related: [
      { label: 'How to remove coffee stains from a fabric sofa', href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa' },
      { label: 'How to clean grout in bathroom tiles', href: '/guides/how-to-clean-grout-in-bathroom-tiles' },
      { label: 'Upholstery care and cleaning codes', href: '/surfaces/upholstery' },
      { label: 'Carpet care', href: '/surfaces/carpet' },
      { label: 'Is this cleaner safe here? Surface Compatibility Checker', href: '/tools/surface-checker' },
    ],
  },
  'equipment-finder': {
    title: 'Cleaning Equipment Finder',
    subtitle:
      'Tell us the room and the job, and we’ll point you to the kind of cleaning tool that fits, with the reasons spelled out.',
    kicker: 'Free tool · Choosing a tool',
    how: [
      'Each product we cover is matched on two things: the type of tool it is (spot cleaner, scrubber, steam cleaner, brush, organizer) and the rooms its maker designs it for.',
      'The order is a simple rule-based match, not a performance ranking. We haven’t hands-on tested these products; our ratings come from specs, manuals and published standards.',
      'We don’t filter by price because prices change often and we don’t track them. Check the current price on Amazon.',
    ],
    related: [
      { label: 'Best portable carpet cleaners for home use', href: '/best/best-portable-carpet-cleaners-home-use-2026' },
      { label: 'Best grout cleaners for bathroom tiles', href: '/best/best-grout-cleaners-bathroom-tiles-2026' },
      { label: 'Best electric spin scrubbers', href: '/best/best-electric-spin-scrubbers-2026' },
      { label: 'Compare products side by side', href: '/compare' },
      { label: 'How we evaluate products', href: '/methodology' },
    ],
  },
  'routine-planner': {
    title: 'Cleaning Routine Planner',
    subtitle:
      'Build a simple daily, weekly and monthly cleaning checklist for your home, your pets and the time you have. Tick it off here or print it.',
    kicker: 'Free tool · Planning',
    how: [
      'The plan starts from a basic set of daily, weekly and monthly tasks that keep moisture, grease and dust from building up.',
      'Having pets adds a pet hair task. Your daily time sets how much room is left for weekly jobs, and your home size changes how we suggest splitting them.',
      'Treat it as a starting point. Adjust it to your surfaces and follow each product’s care instructions.',
    ],
    related: [
      { label: 'How to prevent mold in your shower', href: '/guides/how-to-prevent-mold-in-your-shower' },
      { label: 'How to keep your kitchen organized', href: '/guides/how-to-keep-your-kitchen-organized' },
      { label: 'How to remove pet hair from furniture', href: '/guides/how-to-remove-pet-hair-from-furniture' },
      { label: 'How to clean grout in bathroom tiles', href: '/guides/how-to-clean-grout-in-bathroom-tiles' },
    ],
  },
  'cost-calculator': {
    title: 'Cleaning Cost Calculator: Buy, Rent or Hire?',
    subtitle:
      'Compare the cost per clean of owning a portable carpet cleaner, renting a machine or hiring a pro, using your own numbers.',
    kicker: 'Free tool · Costs',
    how: [
      'Owning per clean = (cleaner price + formula used over the years) ÷ number of cleans. Renting and hiring are a flat cost per clean.',
      'The starting numbers are round examples so the page isn’t empty. They aren’t quotes or Amazon prices. Replace them with prices you see locally.',
      'It leaves out electricity, repairs and your time, and pros often charge more for large or heavily soiled areas.',
    ],
    related: [
      { label: 'Best portable carpet cleaners for home use', href: '/best/best-portable-carpet-cleaners-home-use-2026' },
      { label: 'Bissell Little Green vs Hoover CleanSlate', href: '/compare/bissell-little-green-vs-hoover-cleanslate' },
      { label: 'How to remove coffee stains from a fabric sofa', href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa' },
    ],
  },
  'surface-checker': {
    title: 'Surface Compatibility Checker',
    subtitle:
      'Check whether vinegar, peroxide, steam or a spot cleaner is safe on marble, grout, hardwood, tile or upholstery, and what to use instead.',
    kicker: 'Free tool · Surface safety',
    how: [
      'Each pairing is a rule written from how the material reacts: acids etch marble and limestone, heat and moisture warp wood, heat can set protein stains.',
      'The rules draw on manufacturer care instructions, upholstery cleaning codes and published cleaning guidance.',
      'It covers common mistakes, not every product. When in doubt, follow your surface maker’s instructions and spot-test on a hidden area first.',
    ],
    related: [
      { label: 'Grout care', href: '/surfaces/grout' },
      { label: 'Ceramic tile care', href: '/surfaces/ceramic-tile' },
      { label: 'Upholstery care and cleaning codes', href: '/surfaces/upholstery' },
      { label: 'How to clean grout in bathroom tiles', href: '/guides/how-to-clean-grout-in-bathroom-tiles' },
      { label: 'Step-by-step stain help: Stain Solution Finder', href: '/tools/stain-finder' },
    ],
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const meta = TOOL_META[params.slug];
  if (!meta) return { title: 'Tool Not Found' };
  // Canonical is always the clean /tools/<slug> URL, also for ?stain=…&surface=… links.
  return buildMetadata({
    title: meta.title,
    description: fitDescription(meta.subtitle, 'Free to use, no sign-up needed.'),
    path: `/tools/${params.slug}`,
    ogKicker: 'Free interactive tool',
  });
}

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TOOL_META).map((slug) => ({ slug }));
}

export default function InteractiveToolPage({
  params,
  searchParams = {},
}: {
  params: { slug: string };
  searchParams?: SearchParams;
}) {
  const meta = TOOL_META[params.slug];
  if (!meta) {
    notFound();
  }

  // Links from the homepage finder arrive as ?stain=<value>&surface=<value>. Unknown values are ignored.
  const stainParam = firstParam(searchParams.stain);
  const surfaceParam = firstParam(searchParams.surface);
  const initialStain = isStainType(stainParam) ? stainParam : undefined;
  const initialSurface = isSurface(surfaceParam) ? surfaceParam : undefined;

  const path = `/tools/${params.slug}`;
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Tools', path: '/tools' },
      { name: meta.title, path },
    ]),
    {
      '@type': 'WebApplication',
      '@id': `${absoluteUrl(path)}#app`,
      name: meta.title,
      description: meta.subtitle,
      url: absoluteUrl(path),
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
      publisher: { '@id': ORG_ID },
    },
  );

  return (
    <div className="pb-16">
      <JsonLd data={schema} />
      <Container>
        <Breadcrumbs
          className="py-4 print:hidden"
          items={[
            { name: 'Home', href: '/' },
            { name: 'Tools', href: '/tools' },
            { name: meta.title },
          ]}
        />

        <header className="max-w-3xl pb-8 pt-2 sm:pb-10">
          <Kicker tone="accent" className="print:hidden">
            {meta.kicker}
          </Kicker>
          <h1 className="mt-3 font-serif text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.015em] text-ink sm:text-5xl">
            {meta.title}
          </h1>
          <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-secondary print:hidden">{meta.subtitle}</p>
        </header>

        {params.slug === 'stain-finder' && <StainFinderTool initialStain={initialStain} initialSurface={initialSurface} />}
        {params.slug === 'equipment-finder' && <EquipmentFinderTool />}
        {params.slug === 'routine-planner' && <RoutinePlannerTool />}
        {params.slug === 'cost-calculator' && <CostCalculatorTool />}
        {params.slug === 'surface-checker' && <SurfaceCheckerTool />}

        <div className="mt-16 grid gap-10 border-t border-rule-strong pt-6 lg:grid-cols-12 lg:gap-12 print:hidden">
          <section className="lg:col-span-7" aria-labelledby="how-heading">
            <h2 id="how-heading" className="font-serif text-2xl font-semibold text-ink">
              How this tool decides
            </h2>
            <ul className="mt-4 max-w-prose space-y-3 text-[0.9375rem] leading-relaxed text-ink-secondary">
              {meta.how.map((line) => (
                <li key={line} className="grid grid-cols-[1rem_1fr] gap-2">
                  <span className="mt-[0.6em] h-1.5 w-1.5 bg-ink-muted" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[14px] text-ink-muted">
              More on our sources and process in{' '}
              <Link href="/methodology" className="link">
                how we work
              </Link>
              .
            </p>
          </section>

          <section className="lg:col-span-5" aria-labelledby="related-heading">
            <h2 id="related-heading" className="kicker text-ink-muted">
              Related guides
            </h2>
            <ul className="mt-3 divide-y divide-rule border-y border-rule">
              {meta.related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="group flex min-h-[48px] items-center justify-between gap-4 py-3 text-[15px] font-medium text-ink hover:text-terracotta-deep"
                  >
                    <span className="hover-title">{r.label}</span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-terracotta-deep"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </div>
  );
}
