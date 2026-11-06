import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { ORG_ID, breadcrumbSchema, faqSchema, graph, webPageSchema } from '@/lib/schema';
import { Breadcrumbs, Container, FaqList, Kicker } from '@/components/field';
import type { ArticleFAQ } from '@/lib/types';
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
  /** Search title when it should differ from the H1. */
  seoTitle?: string;
  /** Server-rendered explainer under the tool, for people who want the reasoning and not only the number. */
  guide?: { heading: string; body: string[] }[];
  faqs?: ArticleFAQ[];
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
      { label: 'Shark StainStriker vs Bissell Little Green', href: '/compare/bissell-little-green-vs-shark-stainstriker' },
      { label: 'Bissell SpotClean Pro review', href: '/products/bissell-spotclean-pro-portable-cleaner' },
      { label: 'How to get dog urine out of carpet', href: '/guides/how-to-get-dog-urine-out-of-carpet' },
      { label: 'How to remove coffee stains from a fabric sofa', href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa' },
    ],
    seoTitle: 'Carpet Cleaning Cost Calculator: Buy, Rent or Hire a Pro?',
    guide: [
      {
        heading: 'How to read the result',
        body: [
          'The calculator turns three very different ways of paying into one number: the cost per clean. Owning has a one-time machine price plus formula, so it gets cheaper the more often you clean. Renting a machine and hiring a pro cost about the same every time.',
          'The break-even point is the number of cleans where owning becomes the cheaper option. The calculator works it out against renting: the machine price divided by the difference between one rental and the formula for one clean. If you expect to clean more often than that over the years you keep the machine, buying is cheaper than renting, and the comparison with a pro is clearer still in the cost-per-clean column.',
        ],
      },
      {
        heading: 'When buying a portable carpet cleaner makes sense',
        body: [
          'Buying pays off for small, frequent jobs: pet accidents, kids’ spills, coffee on the couch, car seats and stairs. These are spots you want to treat within minutes, and a rental or a pro visit is too slow and too expensive for a single stain.',
          'A portable spot cleaner is not a full-room machine, though. It cleans a few square feet at a time, so it does not replace an upright carpet cleaner or a professional for wall-to-wall carpet.',
        ],
      },
      {
        heading: 'When renting or hiring a pro is the better deal',
        body: [
          'Rent an upright machine when you clean whole rooms only once or twice a year. Hire a professional for large areas, heavily soiled or water-damaged carpet, delicate rugs such as wool or silk, and upholstery with an S or X cleaning code that should not get water.',
          'Pros also take the drying risk off your hands. Carpet that stays wet for long can develop odor or mildew, so if you clean it yourself, extract as much water as you can and keep air moving until it is dry.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is it cheaper to buy a carpet cleaner or hire a professional?',
        answer: 'It depends on how often you clean. For frequent spot cleaning, owning a portable cleaner usually works out cheaper after a handful of uses, because each clean costs only formula. For an occasional whole-house clean, renting or hiring a pro can cost less than buying a machine you rarely use. Enter your own prices above to see your break-even point.',
      },
      {
        question: 'How many cleans until a portable carpet cleaner pays for itself?',
        answer: 'Divide the machine price by what you save per clean compared with renting, which is the rental price minus the formula cost of one clean. The calculator shows this break-even number once you enter prices you see locally. Against a pro, compare the cost per clean of each option.',
      },
      {
        question: 'Does a portable spot cleaner replace professional carpet cleaning?',
        answer: 'No. A portable spot cleaner is made for spills, pet accidents, stairs, upholstery and car seats. For wall-to-wall carpet, use an upright carpet cleaner or a professional service, and follow your carpet maker’s care and warranty instructions.',
      },
      {
        question: 'What does the calculator leave out?',
        answer: 'Electricity, repairs, replacement parts, your time and travel to pick up a rental. Professional prices also vary with area, soil level and extras such as stain treatment, so ask for a written quote.',
      },
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
    title: meta.seoTitle || meta.title,
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
    webPageSchema({ path, name: meta.title, description: meta.subtitle, aboutId: `${absoluteUrl(path)}#app` }),
    {
      '@type': 'WebApplication',
      '@id': `${absoluteUrl(path)}#app`,
      name: meta.title,
      description: meta.subtitle,
      url: absoluteUrl(path),
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
      publisher: { '@id': ORG_ID },
      mainEntityOfPage: { '@id': `${absoluteUrl(path)}#webpage` },
    },
    faqSchema(meta.faqs || []),
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

        {(meta.guide || meta.faqs) && (
          <div className="mt-16 max-w-3xl print:hidden">
            {meta.guide?.map((section) => (
              <section key={section.heading} className="mt-10 first:mt-0">
                <h2 className="font-serif text-2xl font-semibold text-ink">{section.heading}</h2>
                {section.body.map((para) => (
                  <p key={para} className="mt-3 max-w-prose text-[1.0625rem] leading-relaxed text-ink-secondary">
                    {para}
                  </p>
                ))}
              </section>
            ))}
            {meta.faqs && meta.faqs.length > 0 && (
              <section className="mt-12" aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="font-serif text-2xl font-semibold text-ink">
                  Questions people ask
                </h2>
                <FaqList faqs={meta.faqs} className="mt-4" />
              </section>
            )}
          </div>
        )}

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
