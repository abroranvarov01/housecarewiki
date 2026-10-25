import React from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy & Cookie Preferences',
  description: 'What HouseCareWiki collects, how affiliate click attribution works, which cookies Amazon sets, and how to export or delete your saved data at any time.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-paper-border p-8 shadow-card space-y-5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-forest">
          Spec Section 12.3 & 21.4 · Privacy by Design
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink">
          Privacy Policy
        </h1>
        <div className="space-y-4 text-sm sm:text-base text-ink-secondary leading-relaxed">
          <p>
            <strong>1. Data Minimization:</strong> You can browse all HouseCareWiki guides, product reviews, and interactive tools without creating an account or submitting personal information. Saved articles and checklists are stored locally in your browser unless you opt into email synchronization.
          </p>
          <p>
            <strong>2. Outbound Affiliate Links:</strong> When you click an affiliate link to Amazon.com, we log only the anonymous content page ID, product ID, placement slot, and device category (mobile vs. desktop). Amazon sets its own session cookie in accordance with the Amazon.com Privacy Notice.
          </p>
          <p>
            <strong>3. Newsletter & Email:</strong> If you subscribe to our weekly Home Care Field Notes, we store only your email address and subscription status. Every email includes a one-click unsubscribe link in compliance with the US CAN-SPAM Act.
          </p>
        </div>
      </div>
    </div>
  );
}
