import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { BrandMark, Wordmark } from '@/components/BrandMark';
import type { NavLink, NavModel } from '@/lib/navigation';

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <span className="mb-3 block h-[3px] w-8 rounded-full bg-leaf" aria-hidden="true" />
      <h2 className="kicker mb-2 text-leaf-deep">{title}</h2>
      <ul className="text-[15px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-[44px] items-center text-ink-secondary transition-colors hover:text-leaf-deep hover:underline underline-offset-4 lg:min-h-[36px]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ nav }: { nav: NavModel }) {
  return (
    <footer className="mt-24 rounded-t-[2rem] border-t border-rule bg-paper-warm text-ink">
      <div className="mx-auto max-w-page px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 max-w-sm space-y-4 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1.5" aria-label="HouseCareWiki home">
              <BrandMark className="h-11 w-11" />
              <Wordmark />
            </Link>
            <p className="flex gap-2.5 font-serif text-xl leading-snug text-ink">
              <Leaf className="mt-1 h-5 w-5 shrink-0 text-leaf" aria-hidden="true" />
              <span>Solve the problem first. Recommend the product second.</span>
            </p>
            <p className="text-[15px] leading-relaxed text-ink-secondary">
              An independent home care guide. Our methods come from manufacturer instructions and published care standards, and
              each product review says what it is based on.
            </p>
          </div>

          <FooterColumn title="Fix & learn" links={[...nav.rooms, { label: 'All guides', href: '/search' }]} />
          <FooterColumn title="Tools" links={nav.tools} />
          <FooterColumn
            title="About"
            links={[
              { label: 'About HouseCareWiki', href: '/about' },
              { label: 'How we evaluate products', href: '/methodology' },
              { label: 'Editorial & safety policy', href: '/editorial-policy' },
              { label: 'Affiliate disclosure', href: '/affiliate-disclosure' },
              { label: 'Privacy policy', href: '/privacy' },
              { label: 'Terms of use', href: '/terms' },
            ]}
          />
        </div>

        <div className="mt-12 grid gap-4 border-t border-rule-strong/60 pt-6 text-[13px] leading-relaxed text-ink-muted md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-3xl space-y-1.5">
            <p className="font-medium text-ink-secondary">As an Amazon Associate, HouseCareWiki earns from qualifying purchases.</p>
            <p>
              HouseCareWiki is a participant in the Amazon Services LLC Associates Program. We don&apos;t display prices or
              availability; use the &ldquo;Check price on Amazon&rdquo; links for current details. Brands cannot pay for placement or
              ratings.
            </p>
          </div>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf" aria-hidden="true" />© {new Date().getFullYear()} HouseCareWiki
          </p>
        </div>
      </div>
    </footer>
  );
}
