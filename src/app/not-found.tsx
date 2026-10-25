import Link from 'next/link';
import type { Metadata } from 'next';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: NOINDEX_ROBOTS,
};

const SECTIONS = [
  { href: '/best/best-portable-carpet-cleaners-home-use-2026', label: 'Best portable carpet cleaners' },
  { href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa', label: 'Remove coffee stains from a sofa' },
  { href: '/rooms/bathroom-cleaning', label: 'Bathroom cleaning' },
  { href: '/rooms/floor-carpet-care', label: 'Floor & carpet care' },
  { href: '/products', label: 'All product reviews' },
  { href: '/tools', label: 'Cleaning tools & calculators' },
];

export default function NotFound() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <p className="text-xs font-extrabold uppercase tracking-wider text-coral">Error 404</p>
      <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink mt-2">
        We couldn&apos;t find that page
      </h1>
      <p className="text-sm sm:text-base text-ink-secondary mt-3">
        The link may be outdated or mistyped. Try a search, or start from one of our most popular sections.
      </p>

      <form action="/search" method="GET" className="mt-6 flex gap-2 max-w-md mx-auto">
        <label htmlFor="nf-search" className="sr-only">
          Search HouseCareWiki
        </label>
        <input
          id="nf-search"
          name="q"
          type="search"
          placeholder="e.g. coffee stain on sofa"
          className="flex-1 rounded-lg border border-paper-border bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-forest text-white px-4 py-2 text-sm font-semibold">
          Search
        </button>
      </form>

      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block rounded-xl border border-paper-border bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-forest"
            >
              {s.label} →
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/" className="inline-block mt-8 text-sm font-semibold text-forest hover:underline">
        ← Back to the homepage
      </Link>
    </section>
  );
}
