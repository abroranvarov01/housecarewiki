import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { DocList, DocPage, DocSection } from '@/components/DocPage';

const DESCRIPTION =
  'How HouseCareWiki researches, fact-checks and updates its home care guides, how we keep reviews independent, and the chemical safety rules we follow.';

export const metadata: Metadata = buildMetadata({
  title: 'Editorial Policy & Safety Standards',
  description: DESCRIPTION,
  path: '/editorial-policy',
});

export default function EditorialPolicyPage() {
  return (
    <DocPage
      path="/editorial-policy"
      description={DESCRIPTION}
      kicker="How we work"
      breadcrumb="Editorial policy"
      title="Editorial and safety policy"
      lede={
        <p>
          The rules our editors follow when we research, write and update a guide or a product review. If a page doesn&apos;t
          meet them, we fix the page.
        </p>
      }
      related={[
        { href: '/methodology', label: 'How we evaluate', note: 'Evidence levels and what our rating means' },
        { href: '/affiliate-disclosure', label: 'Affiliate disclosure', note: 'How the site makes money' },
        { href: '/about', label: 'About HouseCareWiki' },
      ]}
    >
      <DocSection id="useful" index="01" title="Useful first">
        <p>
          Every guide has to solve a real household problem with steps that work even if the reader buys nothing. Products
          appear only where a tool genuinely makes the job easier, and always after the method.
        </p>
      </DocSection>

      <DocSection id="sources" index="02" title="Sources and fact-checking">
        <p>
          Methods, ratios and surface warnings are checked by an editor against manufacturer manuals, care codes and published
          guidance from bodies such as the IICRC, EPA, TCNA, the Natural Stone Institute and AHFA. Each guide lists the sources
          it relies on.
        </p>
        <p>
          We use software to help organize research notes and audit internal links. A person on the editorial team reviews every
          factual claim before it is published.
        </p>
      </DocSection>

      <DocSection id="safety" index="03" title="Chemical safety">
        <DocList
          items={[
            'Every guide involving bleach, acids (vinegar, citric acid), hydrogen peroxide, ammonia or pressurized steam includes a safety note.',
            'We never recommend combining bleach with acids or ammonia, which can release toxic chlorine or chloramine gas.',
            'We tell you when a method can etch, bleach or shrink a surface, and to spot test somewhere hidden first.',
            'We follow the care code on fabric and upholstery, and say when a job is one for a professional.',
          ]}
        />
      </DocSection>

      <DocSection id="reviews" index="04" title="Honest product reviews">
        <p>
          Every review is labeled with the evidence behind it. Today that is research from specifications, manuals and published
          standards; we have not tested products hands-on, and we never write as if we had. We don&apos;t invent measurements,
          testimonials, star ratings or review counts. See{' '}
          <Link href="/methodology" className="link">
            how we evaluate
          </Link>
          .
        </p>
      </DocSection>

      <DocSection id="independence" index="05" title="Independence">
        <p>
          We earn commissions as an Amazon Associate. Brands can&apos;t pay for placement, a rating or a verdict, and commission
          rates don&apos;t decide which products we recommend.
        </p>
      </DocSection>

      <DocSection id="updates" index="06" title="Updates and corrections">
        <p>
          We change the &ldquo;Updated&rdquo; date only when we make a substantive revision, such as a corrected method, a new
          safety check or a changed recommendation, never automatically. If you spot an error, email{' '}
          <a href={`mailto:${SITE.email}`} className="link">
            {SITE.email}
          </a>
          .
        </p>
      </DocSection>
    </DocPage>
  );
}
