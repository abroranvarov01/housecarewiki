import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/schema';
import { Breadcrumbs, Container, Kicker } from '@/components/field';
import { DocList, DocSection } from '@/components/DocPage';

const DESCRIPTION =
  'HouseCareWiki is an independent US home-care guide: how our editors research cleaning methods, how product reviews are labeled, and how the site makes money.';

export const metadata: Metadata = buildMetadata({
  title: 'About HouseCareWiki: Our Team, Standards & Funding',
  description: DESCRIPTION,
  path: '/about',
});

const WE_DO = [
  'Write step-by-step fixes that work even if you buy nothing.',
  'Check methods against manufacturer instructions, care codes and published standards.',
  'List the sources behind every guide on the page.',
  'Label every product review with the evidence it is based on.',
  'Correct mistakes and note substantive updates with a new date.',
];

const WE_DONT = [
  'Claim hands-on testing we haven’t done.',
  'Publish fictional writers, stock-photo “experts” or invented testimonials.',
  'Show prices, star ratings or review counts copied from retailers.',
  'Accept payment for placement, ratings or a better verdict.',
  'Change the “Updated” date without changing the content.',
];

export default function AboutPage() {
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ]),
    webPageSchema({ path: '/about', name: 'About HouseCareWiki', description: DESCRIPTION, type: 'AboutPage' }),
  );

  return (
    <article className="pb-16">
      <JsonLd data={schema} />

      <header className="border-b border-rule">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'About' }]} />
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <Kicker tone="accent">About HouseCareWiki</Kicker>
              <h1 className="mt-4 font-serif text-[2.5rem] font-medium leading-[1.04] tracking-[-0.025em] text-ink sm:text-6xl">
                A home-care guide that tells you <span className="mark italic">what its advice is based on</span>.
              </h1>
            </div>
            <p className="max-w-prose text-lg leading-relaxed text-ink-secondary lg:col-span-8">
              HouseCareWiki is an independent guide to cleaning, stain removal and keeping a home in working order. This is the
              US edition: products, standards and safety rules are the ones that apply in American homes.
            </p>
          </div>
        </Container>
      </header>

      {/* What we do / what we don't: the short version of everything below. */}
      <section aria-labelledby="dos-heading" className="border-b border-rule bg-paper-warm/60">
        <Container className="py-10 sm:py-12">
          <h2 id="dos-heading" className="sr-only">
            What we do and what we don’t do
          </h2>
          <div className="grid gap-10 md:grid-cols-2 md:gap-12">
            {[
              { label: 'What we do', items: WE_DO, dot: 'bg-leaf-deep' },
              { label: 'What we don’t do', items: WE_DONT, dot: 'bg-terracotta' },
            ].map((col) => (
              <div key={col.label} className="border-t border-rule-strong pt-3">
                <h3 className="font-serif text-2xl font-semibold text-ink">{col.label}</h3>
                <ul className="mt-4 border-t border-rule-strong/50">
                  {col.items.map((item, i) => (
                    <li key={item} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-rule-strong/50 py-3 text-[15px] leading-relaxed text-ink-secondary">
                      <span className="kicker flex items-center gap-1.5 pt-1 text-ink-muted">
                        <span className={`h-1.5 w-1.5 ${col.dot}`} aria-hidden="true" />
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Container className="pt-10 sm:pt-12">
        <div className="max-w-prose space-y-12">
          <DocSection id="who" index="01" title="Who writes it">
            <p>
              HouseCareWiki is written and edited by a small editorial team. Guides carry the byline{' '}
              <Link href="/authors/housecarewiki-editors" className="link">
                HouseCareWiki Editors
              </Link>
              . We don&apos;t publish fictional bylines or invented personas, and we won&apos;t put a name and a stock portrait on
              a page to make it look more authoritative than the work behind it.
            </p>
          </DocSection>

          <DocSection id="research" index="02" title="How guides are researched">
            <p>Every method starts from the people who made the thing you are cleaning, and from the bodies that set care standards:</p>
            <DocList
              items={[
                'Manufacturer instructions, manuals and warranty terms.',
                'Care codes on upholstery and fabric (W, S, W/S, X) and garment care labels.',
                'Published standards and guidance from the IICRC, EPA, TCNA, the Natural Stone Institute and AHFA.',
              ]}
            />
            <p>
              Each guide lists the sources it relies on at the bottom of the page, and every method involving bleach, acids,
              ammonia, peroxide or steam carries a safety note. Our{' '}
              <Link href="/editorial-policy" className="link">
                editorial policy
              </Link>{' '}
              covers the rules in full.
            </p>
          </DocSection>

          <DocSection id="reviews" index="03" title="How product reviews work">
            <p>
              We have not tested products hands-on yet. Our reviews are <strong>research-based</strong>: we compare
              specifications, manuals, included tools, warranty terms and running costs, and we say so on every review. When we
              do start testing products ourselves, those reviews will be labeled hands-on tested and we&apos;ll describe how.
            </p>
            <p>
              The score you see is &ldquo;Our rating&rdquo;, an editorial judgment from that research, not a measurement.{' '}
              <Link href="/methodology" className="link">
                How we evaluate products
              </Link>{' '}
              explains the rubric.
            </p>
          </DocSection>

          <DocSection id="money" index="04" title="How we make money">
            <p>
              HouseCareWiki is a participant in the Amazon Associates program. When you follow a &ldquo;Check price on
              Amazon&rdquo; link and buy something, Amazon may pay us a commission at no extra cost to you.
            </p>
            <p>
              Brands can&apos;t buy placement, a rating or a verdict. Details are in our{' '}
              <Link href="/affiliate-disclosure" className="link">
                affiliate disclosure
              </Link>
              .
            </p>
          </DocSection>

          <DocSection id="contact" index="05" title="Corrections and contact">
            <p>
              If something on the site is wrong, unclear or unsafe, tell us at{' '}
              <a href={`mailto:${SITE.email}`} className="link">
                {SITE.email}
              </a>
              . We fix verified errors and update the page date when the change is substantive.
            </p>
          </DocSection>
        </div>

        <nav aria-labelledby="about-more" className="mt-16 max-w-prose border-t border-rule-strong pt-3">
          <h2 id="about-more" className="kicker text-ink-muted">
            Read more about how we work
          </h2>
          <ul className="mt-3 grid gap-x-8 sm:grid-cols-3">
            {[
              ['/methodology', 'How we evaluate'],
              ['/editorial-policy', 'Editorial policy'],
              ['/affiliate-disclosure', 'Affiliate disclosure'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="group flex min-h-[44px] items-center border-b border-rule py-2 font-semibold text-ink hover:text-terracotta-deep">
                  <span className="hover-title">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </article>
  );
}
