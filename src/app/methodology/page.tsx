import React from 'react';
import type { Metadata } from 'next';
import { CheckCircle2, ShieldAlert, Scale, FlaskConical } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Testing Methodology & Review Standards',
  description:
    'Learn how HouseCareWiki tests portable carpet cleaners, bathroom scrubbers, steam cleaners, and stain removal protocols.',
};

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header className="bg-white rounded-2xl border border-paper-border p-8 shadow-card space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-coral">
          Editorial Transparency · Spec Section 6.1 & 25
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink">
          How We Test Home Care Products & Cleaning Methods
        </h1>
        <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
          Every recommendation on HouseCareWiki is governed by one rule: <strong>Solve the problem first. Recommend the product second.</strong> We clearly distinguish between Hands-on Tested reviews, Research-Based evaluations, and Specifications Overviews.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            icon: FlaskConical,
            title: '1. Standardized Real-World Stain Panels',
            body: 'We test spot extractors and stain sprays on controlled swatches of cotton canvas, woven linen, polyester microfiber, medium-pile nylon carpet, and unsealed cement grout stained with espresso coffee, red wine, mud, and synthetic pet urine.',
          },
          {
            icon: Scale,
            title: '2. Moisture Extraction & Dry-Time Weighing',
            body: 'For portable carpet cleaners, we weigh pre-measured water before spraying and weigh the recovery tank immediately after extraction to calculate exact moisture recovery percentages.',
          },
          {
            icon: ShieldAlert,
            title: '3. Chemical & Surface pH Compatibility',
            body: 'Every DIY cleaning recipe is cross-checked against TCNA tile standards, AHFA upholstery codes (W, S, WS, X), and Natural Stone Institute guidelines to ensure we never recommend acid on marble or dangerous bleach mixtures.',
          },
          {
            icon: CheckCircle2,
            title: '4. Strict Evidence Labeling',
            body: 'Only products physically evaluated by our team carry the "Hands-on Tested" badge. We never fabricate test measurements, review counts, or star ratings.',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-paper-border p-6 shadow-card space-y-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-forest-pale text-forest flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-editorial text-xl font-bold text-ink">
                {item.title}
              </h2>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                {item.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
