import React from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Affiliate Disclosure — Amazon Associates Program',
  description: 'How HouseCareWiki earns money: we are an Amazon Associate and earn from qualifying purchases at no extra cost to you. Brands cannot pay for placement or scores.',
  path: '/affiliate-disclosure',
});

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-paper-border p-8 shadow-card space-y-5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-forest">
          FTC & Amazon Operating Agreement Compliance · Spec Section 9.5
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink">
          Affiliate Disclosure
        </h1>
        <div className="p-4 rounded-xl bg-forest-pale border border-forest/20 text-sm font-bold text-forest-dark">
          As an Amazon Associate I earn from qualifying purchases.
        </div>
        <div className="space-y-4 text-sm sm:text-base text-ink-secondary leading-relaxed">
          <p>
            HouseCareWiki.com is an independent digital publication dedicated to practical home care, stain removal, and appliance testing. To fund our testing supplies, editorial research, and free interactive tools without placing intrusive banner ads across our guides, we participate in affiliate marketing programs.
          </p>
          <p>
            HouseCareWiki.com is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
          <p>
            When you click a &ldquo;View on Amazon&rdquo; button (marked with <code>rel=&quot;sponsored nofollow&quot;</code>) and make a qualifying purchase within Amazon&apos;s attribution window, we may receive a small commission at zero additional cost to you. Manufacturers and brands cannot pay to be featured or to alter our editorial scores.
          </p>
        </div>
      </div>
    </div>
  );
}
