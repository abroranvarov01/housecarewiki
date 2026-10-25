import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { DocPage, DocSection } from '@/components/DocPage';

const DESCRIPTION =
  'How HouseCareWiki earns money: we are an Amazon Associate and earn from qualifying purchases at no extra cost to you. Brands cannot pay for placement or scores.';

export const metadata: Metadata = buildMetadata({
  title: 'Affiliate Disclosure — Amazon Associates Program',
  description: DESCRIPTION,
  path: '/affiliate-disclosure',
});

export default function AffiliateDisclosurePage() {
  return (
    <DocPage
      path="/affiliate-disclosure"
      description={DESCRIPTION}
      kicker="How we make money"
      breadcrumb="Affiliate disclosure"
      title="Affiliate disclosure"
      lede={
        <p className="border-l-4 border-honey-deep bg-honey-soft px-4 py-3 text-lg font-semibold text-ink">
          As an Amazon Associate I earn from qualifying purchases.
        </p>
      }
      related={[
        { href: '/methodology', label: 'How we evaluate', note: 'What our rating means' },
        { href: '/editorial-policy', label: 'Editorial policy' },
        { href: '/privacy', label: 'Privacy policy', note: 'What an affiliate click records' },
      ]}
    >
      <DocSection id="program" index="01" title="The Amazon Associates program">
        <p>
          HouseCareWiki is an independent publication about practical home care and stain removal. HouseCareWiki is a
          participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a
          means for sites to earn advertising fees by advertising and linking to Amazon.com.
        </p>
        <p>
          Commissions pay for our editorial research, writing and the free tools on the site, so we don&apos;t have to fill
          guides with banner ads.
        </p>
      </DocSection>

      <DocSection id="links" index="02" title="How affiliate links work">
        <p>
          Product links on HouseCareWiki are labeled &ldquo;Check price on Amazon&rdquo; and marked as sponsored links in the
          page code. If you follow one and make a qualifying purchase, Amazon may pay us a small commission. The price you pay
          is the same.
        </p>
        <p>
          We don&apos;t show prices, star ratings or review counts on our pages, because they change constantly. Amazon shows
          the current price when you click through.
        </p>
      </DocSection>

      <DocSection id="independence" index="03" title="What money can’t buy">
        <p>
          Manufacturers and brands can&apos;t pay to be featured, to be ranked higher or to change our rating or verdict.
          Commission rates don&apos;t decide what we recommend. Our reviews are research-based, and{' '}
          <Link href="/methodology" className="link">
            our methodology
          </Link>{' '}
          explains what that means.
        </p>
      </DocSection>

      <DocSection id="questions" index="04" title="Questions">
        <p>
          Email{' '}
          <a href={`mailto:${SITE.email}`} className="link">
            {SITE.email}
          </a>{' '}
          with any question about how we make money.
        </p>
      </DocSection>
    </DocPage>
  );
}
