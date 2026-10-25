import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { ORG_ID, breadcrumbSchema, graph } from '@/lib/schema';
import { ChevronRight } from 'lucide-react';
import {
  StainFinderTool,
  EquipmentFinderTool,
  RoutinePlannerTool,
  CostCalculatorTool,
  SurfaceCheckerTool,
} from '@/components/InteractiveToolsClient';

const TOOL_META: Record<
  string,
  { title: string; subtitle: string; badge: string }
> = {
  'stain-finder': {
    title: 'Interactive Stain Solution Finder',
    subtitle:
      'Select your stain type, surface material, and fabric care code to get a verified step-by-step removal method with chemical safety warnings.',
    badge: 'Free tool · Deterministic Stain Protocol',
  },
  'equipment-finder': {
    title: 'Find the Right Cleaning Products for Your Home',
    subtitle:
      'Answer a few questions about your space, cleaning task, and budget to receive personalized, lab-tested equipment recommendations.',
    badge: 'Free tool · Personalized Product Finder',
  },
  'routine-planner': {
    title: 'Personal Home Cleaning Routine Planner',
    subtitle:
      'Build a realistic daily, weekly, and monthly cleaning checklist customized to your home size and pets.',
    badge: 'Free tool · Printable Schedule Builder',
  },
  'cost-calculator': {
    title: 'Home Cleaning Cost & ROI Calculator',
    subtitle:
      'Compare the true per-use cost of owning a portable carpet or steam cleaner versus supermarket rentals and professional visits.',
    badge: 'Free tool · Transparent Cost Math',
  },
  'surface-checker': {
    title: 'Surface & Cleaner Compatibility Checker',
    subtitle:
      'Verify whether household cleaners, acids, oxygen bleach, or high-heat steam are safe for your specific countertop, tile, or fabric.',
    badge: 'Free tool · Surface Safety Matrix',
  },
};

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const meta = TOOL_META[params.slug];
  if (!meta) return { title: 'Tool Not Found' };
  return buildMetadata({
    title: meta.title,
    description: meta.subtitle,
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
}: {
  params: { slug: string };
}) {
  const meta = TOOL_META[params.slug];
  if (!meta) {
    notFound();
  }

  const path = `/tools/${params.slug}`;
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Smart Tools', path: '/tools' },
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="py-4 flex items-center gap-1.5 text-xs text-ink-muted">
        <Link href="/" className="hover:text-forest">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/tools" className="hover:text-forest">
          Smart Tools
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium">{meta.title}</span>
      </nav>

      <header className="bg-gradient-to-r from-[#E7EFE9] to-[#DCE6DF] rounded-2xl p-6 sm:p-8 border border-mist-dark/50 shadow-soft mb-8">
        <span className="text-xs font-extrabold uppercase tracking-wider text-forest">
          {meta.badge}
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink mt-1">
          {meta.title}
        </h1>
        <p className="text-sm sm:text-base text-ink-secondary mt-2 max-w-2xl">
          {meta.subtitle}
        </p>
      </header>

      {params.slug === 'stain-finder' && <StainFinderTool />}
      {params.slug === 'equipment-finder' && <EquipmentFinderTool />}
      {params.slug === 'routine-planner' && <RoutinePlannerTool />}
      {params.slug === 'cost-calculator' && <CostCalculatorTool />}
      {params.slug === 'surface-checker' && <SurfaceCheckerTool />}
    </div>
  );
}
