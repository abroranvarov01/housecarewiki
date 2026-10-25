import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { EVIDENCE_COPY } from '@/components/field';
import { DocList, DocPage, DocSection } from '@/components/DocPage';
import type { EvidenceBadge } from '@/lib/types';

const DESCRIPTION =
  'How HouseCareWiki evaluates cleaning products and methods from specs, manuals and care standards, what our 0–10 rating means, and how evidence is labeled.';

export const metadata: Metadata = buildMetadata({
  title: 'How We Evaluate Products & Methods',
  description: DESCRIPTION,
  path: '/methodology',
});

const LEVELS: EvidenceBadge[] = ['Research-Based Review', 'Hands-on Tested', 'Specifications Overview'];

const RUBRIC = [
  {
    name: 'Cleaning capability for the job',
    detail:
      'Whether the published specs match the task the guide is about: suction or spray type, brush and tool options, heat or steam where relevant, and what the manufacturer says it is and isn’t for.',
  },
  {
    name: 'Ease of use',
    detail: 'Weight, tank sizes, hose and cord length, how tanks fill and empty, and how many steps the manual asks for in normal use and cleanup.',
  },
  {
    name: 'Build and warranty',
    detail: 'Warranty length and terms, replaceable parts, and known limitations the manufacturer documents.',
  },
  {
    name: 'Value',
    detail: 'What you get for the money over time: included tools, the cost and availability of consumables like formula, filters and brush heads.',
  },
];

export default function MethodologyPage() {
  return (
    <DocPage
      path="/methodology"
      description={DESCRIPTION}
      kicker="How we work"
      breadcrumb="How we evaluate"
      title="How we evaluate products and methods"
      lede={
        <p>
          Our rule is simple: solve the problem first, recommend a product second. This page explains what our product reviews
          are based on today, what our rating means, and how we check the cleaning methods in our guides.
        </p>
      }
      related={[
        { href: '/editorial-policy', label: 'Editorial policy', note: 'Sourcing, safety rules and updates' },
        { href: '/affiliate-disclosure', label: 'Affiliate disclosure', note: 'How the site makes money' },
        { href: '/about', label: 'About HouseCareWiki', note: 'Who we are' },
      ]}
    >
      <DocSection id="evidence" index="01" title="Evidence levels">
        <p>
          Every review declares one of three evidence levels, shown as a label near the top of the page. They tell you exactly
          how much weight to put on our verdict.
        </p>
        <dl className="border-t border-rule">
          {LEVELS.map((level) => (
            <div key={level} className="grid gap-1 border-b border-rule py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt className="kicker pt-1 text-ink">{EVIDENCE_COPY[level].label}</dt>
              <dd className="text-[0.9375rem] leading-relaxed">{EVIDENCE_COPY[level].detail}</dd>
            </div>
          ))}
        </dl>
        <p className="border-l-4 border-honey-deep bg-honey-soft px-4 py-3 text-[0.9375rem]">
          <strong>Right now, every product review on HouseCareWiki is research-based.</strong> We haven&apos;t tested any
          product hands-on yet, and no review is labeled as if we had.
        </p>
      </DocSection>

      <DocSection id="research" index="02" title="How we evaluate products from research">
        <p>For each product we read the manufacturer&apos;s own documentation and compare it against the job the reader has. We look at:</p>
        <DocList
          items={[
            'Specifications: tank sizes, weight, hose and cord length, power source and included tools.',
            'Manufacturer manuals and care instructions, including what the product should not be used on.',
            'Warranty length and what it covers.',
            'Consumable costs: cleaning formula, filters, pads and replacement brush heads.',
            'Compatibility with surfaces and fabric care codes (W, S, W/S, X), and with the methods in our guides.',
            'Known limitations the manufacturer states, such as surfaces to avoid, duty cycles or drying times.',
          ]}
        />
        <p>
          We don&apos;t copy retailer star ratings, review counts or prices into our reviews. Prices change daily, so we link to
          Amazon for the current one.
        </p>
      </DocSection>

      <DocSection id="rating" index="03" title="What “Our rating” means">
        <p>
          The 0–10 score on a review is <strong>an editorial judgment, not a measurement</strong>. It summarizes how well we
          think a product fits its intended job, based on the research above. We weigh four things:
        </p>
        <ol className="border-t border-rule">
          {RUBRIC.map((r, i) => (
            <li key={r.name} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-rule py-3">
              <span className="kicker pt-1 text-terracotta-deep">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <strong>{r.name}.</strong> <span className="text-[0.9375rem]">{r.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p>
          Where a review shows sub-scores, they are labeled &ldquo;Research assessment&rdquo;. Two products with the same
          rating can suit very different homes, so read the &ldquo;who it&apos;s for&rdquo; and &ldquo;who should skip&rdquo;
          notes before you decide.
        </p>
      </DocSection>

      <DocSection id="guides" index="04" title="How guides are checked">
        <p>Cleaning guides go through a separate check focused on safety and surface damage:</p>
        <DocList
          items={[
            'Chemical safety: we never pair bleach with acids (including vinegar) or ammonia, and every method using bleach, acids, peroxide, ammonia or steam carries a safety note.',
            'Care codes: upholstery and fabric steps follow the item’s care code; we tell you to stop and call a professional for “X” and dry-clean-only items.',
            'Surface rules: methods are checked against TCNA tile guidance, Natural Stone Institute guidance for stone, and manufacturer instructions.',
            'Spot test first: any method that could discolor or etch tells you to test it somewhere hidden.',
          ]}
        />
        <p>
          Sources are listed at the bottom of every guide. Our{' '}
          <Link href="/editorial-policy" className="link">
            editorial policy
          </Link>{' '}
          has the full rules.
        </p>
      </DocSection>

      <DocSection id="hands-on" index="05" title="When we start testing hands-on">
        <p>
          We plan to test products ourselves. When we do, those reviews will carry the hands-on tested label, and this page will
          describe the procedure we used: the conditions, the surfaces and what we recorded. Research-based reviews will stay
          labeled as research-based until they are re-done.
        </p>
      </DocSection>
    </DocPage>
  );
}
