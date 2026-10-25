import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { DocList, DocPage, DocSection } from '@/components/DocPage';

const DESCRIPTION =
  'What HouseCareWiki collects, how affiliate click attribution works, which cookies Amazon sets, and how to export or delete your saved data at any time.';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy & Cookie Preferences',
  description: DESCRIPTION,
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <DocPage
      path="/privacy"
      description={DESCRIPTION}
      kicker="Your data"
      breadcrumb="Privacy policy"
      title="Privacy policy"
      lede={
        <p>
          You can read every guide, review and tool on HouseCareWiki without an account and without giving us any personal
          information. Here is what we do collect, and why.
        </p>
      }
      related={[
        { href: '/account', label: 'Saved items', note: 'Export or delete what is stored in your browser' },
        { href: '/affiliate-disclosure', label: 'Affiliate disclosure' },
        { href: '/terms', label: 'Terms of use' },
      ]}
    >
      <DocSection id="saved" index="01" title="Saved items stay in your browser">
        <p>
          When you save a guide or product, the list is stored in your own browser (local storage), not on our servers. You can
          export it as a file or delete it at any time on the{' '}
          <Link href="/account" className="link">
            saved items page
          </Link>
          . Clearing your browser data removes it too.
        </p>
      </DocSection>

      <DocSection id="affiliate" index="02" title="Affiliate link clicks">
        <p>When you click a &ldquo;Check price on Amazon&rdquo; link, we record an anonymous attribution entry with:</p>
        <DocList
          items={[
            'which product and which page the link was on;',
            'where on the page the link was (for example, a comparison table);',
            'whether the screen was mobile or desktop sized, and the time of the click.',
          ]}
        />
        <p>
          We don&apos;t record your name, email or IP address with these entries. Once you are on Amazon, Amazon sets its own
          cookies and handles your data under the Amazon.com Privacy Notice.
        </p>
      </DocSection>

      <DocSection id="email" index="03" title="Email sign-ups">
        <p>
          If you give us your email address to hear about new guides, we store only the address, the date and its subscription
          status. We send occasional emails when we publish new guides, and every email includes an unsubscribe link. We
          don&apos;t sell or share the list.
        </p>
      </DocSection>

      <DocSection id="not-collected" index="04" title="What we don’t collect">
        <p>
          We don&apos;t ask for home addresses or phone numbers, and we don&apos;t build cross-site advertising profiles.
        </p>
      </DocSection>

      <DocSection id="contact" index="05" title="Requests and questions">
        <p>
          To ask about your data or have an email address removed, write to{' '}
          <a href={`mailto:${SITE.email}`} className="link">
            {SITE.email}
          </a>
          .
        </p>
      </DocSection>
    </DocPage>
  );
}
