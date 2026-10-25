import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Search } from 'lucide-react';
import { NOINDEX_ROBOTS } from '@/lib/seo';
import { Container, Kicker, buttonClasses } from '@/components/field';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: NOINDEX_ROBOTS,
};

const SECTIONS = [
  { href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa', label: 'Remove coffee stains from a sofa' },
  { href: '/best/best-portable-carpet-cleaners-home-use-2026', label: 'Best portable carpet cleaners' },
  { href: '/rooms/bathroom-cleaning', label: 'Bathroom cleaning' },
  { href: '/rooms/floor-carpet-care', label: 'Floor & carpet care' },
  { href: '/tools/stain-finder', label: 'Stain Solution Finder' },
  { href: '/products', label: 'All product reviews' },
];

export default function NotFound() {
  return (
    <section className="border-b border-rule">
      <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Kicker tone="accent">Error 404</Kicker>
          <h1 className="mt-4 font-serif text-[2.75rem] font-medium leading-[1.03] tracking-[-0.025em] text-ink sm:text-6xl">
            This page has gone <span className="mark italic">missing</span>.
          </h1>
          <p className="mt-5 max-w-prose text-lg leading-relaxed text-ink-secondary">
            The link may be old or mistyped. Describe the mess you&apos;re dealing with, or start from one of the pages below.
          </p>

          <form action="/search" method="GET" role="search" className="mt-8 max-w-xl">
            <label htmlFor="nf-search" className="mb-2 block text-[15px] font-semibold text-ink">
              Search HouseCareWiki
            </label>
            <div className="flex rounded-full border border-ink-muted bg-paper-card p-1 focus-within:border-ink">
              <Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
              <input
                id="nf-search"
                name="q"
                type="search"
                placeholder="e.g. coffee stain on sofa"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:outline-none"
              />
              <button type="submit" className="min-h-[44px] rounded-full bg-ink px-5 text-[15px] font-semibold text-paper-light transition-colors hover:bg-ink-deep">
                Search
              </button>
            </div>
          </form>

          <Link href="/" className={`${buttonClasses('ghost')} mt-6 -ml-5`}>
            Back to the homepage
          </Link>
        </div>

        <nav className="lg:col-span-5" aria-labelledby="nf-links">
          <div className="border-t border-rule-strong pt-3">
            <h2 id="nf-links" className="font-serif text-2xl font-semibold text-ink">
              Common starting points
            </h2>
            <ol className="mt-3 divide-y divide-rule border-b border-rule">
              {SECTIONS.map((s, i) => (
                <li key={s.href}>
                  <Link href={s.href} className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-3.5">
                    <span className="kicker text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-[16px] font-semibold text-ink group-hover:text-terracotta-deep">{s.label}</span>
                    <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      </Container>
    </section>
  );
}
