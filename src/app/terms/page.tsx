import React from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Use',
  description: 'The terms that apply when you use HouseCareWiki guides, smart tools and product reviews, including safety disclaimers and affiliate link information.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-paper-border p-8 shadow-card space-y-5">
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink">
          Terms of Use
        </h1>
        <div className="space-y-4 text-sm sm:text-base text-ink-secondary leading-relaxed">
          <p>
            <strong>1. Informational & Reference Nature:</strong> HouseCareWiki.com provides general household cleaning, stain removal, and organization information for educational purposes. Always consult your appliance or furniture manufacturer&apos;s care manual and test cleaning solutions on a hidden area before full application.
          </p>
          <p>
            <strong>2. Independent Publisher Boundary:</strong> HouseCareWiki does not sell physical products directly, process payments, or handle shipping or returns. All retail transactions occur on Amazon.com or the respective merchant&apos;s website.
          </p>
          <p>
            <strong>3. Chemical Safety:</strong> Users must follow all manufacturer label precautions, ensure adequate ventilation, and never combine bleach with acids, vinegar, or ammonia.
          </p>
        </div>
      </div>
    </div>
  );
}
