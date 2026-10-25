import React from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Editorial Policy & Safety Standards',
  description: 'How HouseCareWiki researches, fact-checks and updates its home care guides, how we keep reviews independent, and the chemical safety rules we follow.',
  path: '/editorial-policy',
});

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-paper-border p-8 shadow-card space-y-6">
        <span className="text-xs font-extrabold uppercase tracking-wider text-coral">
          Spec Section 25 · Editorial Integrity
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink">
          Editorial & Chemical Safety Policy
        </h1>
        <div className="space-y-4 text-sm sm:text-base text-ink-secondary leading-relaxed">
          <p>
            <strong>1. User Utility First:</strong> No page on HouseCareWiki is published solely to target a search engine keyword. Every guide must solve a distinct household problem with step-by-step instructions that work even if the reader buys nothing.
          </p>
          <p>
            <strong>2. Zero Unverified AI Claims:</strong> While our editorial team uses software tools to organize research outlines and audit internal links, every factual claim, chemical ratio, and surface compatibility warning undergoes human editorial verification against manufacturer manuals, EPA guidelines, or IICRC standards before publication.
          </p>
          <p>
            <strong>3. Chemical Safety Mandate:</strong> Every guide involving bleach, acids (vinegar, citric acid), hydrogen peroxide, ammonia, or pressurized steam includes an explicit safety callout to prevent toxic fumes (such as chloramine/chlorine gas) or permanent surface etching.
          </p>
          <p>
            <strong>4. Honest Update Dates:</strong> We only update the &ldquo;Updated&rdquo; timestamp on an article when substantive revisions, new product comparisons, or updated safety checks are performed—never automatically to fake freshness.
          </p>
        </div>
      </div>
    </div>
  );
}
