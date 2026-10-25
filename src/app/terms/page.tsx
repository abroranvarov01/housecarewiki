import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { DocPage, DocSection } from '@/components/DocPage';

const DESCRIPTION =
  'The terms that apply when you use HouseCareWiki guides, smart tools and product reviews, including safety disclaimers and affiliate link information.';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Use & Safety Disclaimers',
  description: DESCRIPTION,
  path: '/terms',
});

export default function TermsPage() {
  return (
    <DocPage
      path="/terms"
      description={DESCRIPTION}
      kicker="The fine print"
      breadcrumb="Terms of use"
      title="Terms of use"
      lede={<p>The plain terms that apply when you use HouseCareWiki&apos;s guides, tools and product reviews.</p>}
      related={[
        { href: '/privacy', label: 'Privacy policy' },
        { href: '/affiliate-disclosure', label: 'Affiliate disclosure' },
        { href: '/editorial-policy', label: 'Editorial policy' },
      ]}
    >
      <DocSection id="information" index="01" title="General information, not professional advice">
        <p>
          HouseCareWiki publishes general information about household cleaning, stain removal and organization. Always read the
          care manual for your appliance, furniture or flooring, and test any cleaning solution somewhere hidden before using it
          on a whole surface. For valuable, antique or &ldquo;X&rdquo; care-code items, consult a professional.
        </p>
      </DocSection>

      <DocSection id="safety" index="02" title="Chemical safety">
        <p>
          Follow every precaution on product labels, keep the room ventilated, and never mix bleach with acids (including
          vinegar) or ammonia. You are responsible for how you apply the methods described on this site.
        </p>
      </DocSection>

      <DocSection id="retail" index="03" title="We don’t sell products">
        <p>
          HouseCareWiki doesn&apos;t sell products, take payments, or handle shipping or returns. Purchases happen on Amazon.com
          or the retailer&apos;s own site, under their terms. Some links earn us a commission; see our{' '}
          <Link href="/affiliate-disclosure" className="link">
            affiliate disclosure
          </Link>
          .
        </p>
      </DocSection>

      <DocSection id="reviews" index="04" title="Reviews and ratings">
        <p>
          Our product reviews and ratings are editorial opinions based on the evidence each review declares. Specifications and
          availability can change after publication; check the manufacturer&apos;s current information before you buy.
        </p>
      </DocSection>

      <DocSection id="contact" index="05" title="Contact">
        <p>
          Questions about these terms:{' '}
          <a href={`mailto:${SITE.email}`} className="link">
            {SITE.email}
          </a>
          .
        </p>
      </DocSection>
    </DocPage>
  );
}
