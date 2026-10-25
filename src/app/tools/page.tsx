import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import {
  FlaskConical,
  Sparkles,
  Scale,
  CalendarCheck,
  Calculator,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = buildMetadata({
  title: 'Interactive Home Care Tools & Calculators',
  description: 'Free interactive tools for stain removal, cleaning equipment matching, product comparisons, routine planning, cleaning costs and surface compatibility checks.',
  path: '/tools',
});

const TOOLS_LIST = [
  {
    slug: 'stain-finder',
    name: 'Stain Solution Finder',
    subtitle: 'Step-by-step removal by stain, fabric code, and age',
    description:
      'Select your stain (coffee, pet urine, wine, grease, mold) and surface type to receive a verified step-by-step protocol with chemical hazard safeguards.',
    icon: FlaskConical,
  },
  {
    slug: 'equipment-finder',
    name: 'Cleaning Equipment Finder',
    subtitle: 'Match tested machines to your home & budget',
    description:
      'Answer 3 quick questions about your rooms, surfaces, and budget to get deterministic product recommendations from our hands-on tests.',
    icon: Sparkles,
  },
  {
    slug: 'routine-planner',
    name: 'Cleaning Routine Planner',
    subtitle: 'Customizable daily, weekly & seasonal checklists',
    description:
      'Generate a realistic, printable home maintenance schedule tailored to your apartment or house size, pet ownership, and daily time budget.',
    icon: CalendarCheck,
  },
  {
    slug: 'cost-calculator',
    name: 'Cleaning Cost Calculator',
    subtitle: 'Cost-per-use of owning vs. renting or hiring pros',
    description:
      'Edit machine cost, formula price, and cleaning frequency to see transparent 4-year cost-per-use math.',
    icon: Calculator,
  },
  {
    slug: 'surface-checker',
    name: 'Surface Compatibility Checker',
    subtitle: 'Prevent chemical etching & steam damage',
    description:
      'Cross-check whether vinegar, bleach, peroxide, or pressurized steam is safe on marble, cement grout, hardwood, and upholstery codes.',
    icon: ShieldAlert,
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-gradient-to-r from-[#E7EFE9] to-[#DCE6DF] rounded-2xl p-6 sm:p-10 border border-mist-dark/50 shadow-soft">
        <span className="text-xs font-extrabold uppercase tracking-widest text-forest">
          SYS-05 · Rule-Based Smart Utilities
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink mt-1">
          Interactive Home Care Tools & Finders
        </h1>
        <p className="text-sm sm:text-base text-ink-secondary mt-2 max-w-2xl">
          Every tool runs on deterministic compatibility rules and verified textile/surface standards—never unverified LLM hallucinations.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS_LIST.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              href={`/tools/${t.slug}`}
              className="group bg-white rounded-2xl border border-paper-border p-6 shadow-card hover:shadow-elevated hover:border-forest transition flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-forest-pale text-forest flex items-center justify-center mb-4 group-hover:bg-forest group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="font-editorial text-xl font-bold text-ink group-hover:text-forest">
                  {t.name}
                </h2>
                <p className="text-xs font-semibold text-coral mt-0.5">{t.subtitle}</p>
                <p className="text-xs sm:text-sm text-ink-secondary mt-3 leading-relaxed">
                  {t.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-paper-border flex items-center justify-between text-xs font-bold text-forest">
                <span>Open Interactive Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}

        {/* 6th Tool: Product Comparison Builder Card */}
        <Link
          href="/compare"
          className="group bg-white rounded-2xl border border-paper-border p-6 shadow-card hover:shadow-elevated hover:border-forest transition flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-forest-pale text-forest flex items-center justify-center mb-4 group-hover:bg-forest group-hover:text-white transition">
              <Scale className="w-6 h-6" />
            </div>
            <h2 className="font-editorial text-xl font-bold text-ink group-hover:text-forest">
              Product Comparison Builder
            </h2>
            <p className="text-xs font-semibold text-coral mt-0.5">
              Compare 2 to 4 machines side by side
            </p>
            <p className="text-xs sm:text-sm text-ink-secondary mt-3 leading-relaxed">
              Select any tested spot cleaners, scrubbers, or steam cleaners to compare tank capacities, suction, weight, noise levels, and differences.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-paper-border flex items-center justify-between text-xs font-bold text-forest">
            <span>Open Comparison Builder</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
