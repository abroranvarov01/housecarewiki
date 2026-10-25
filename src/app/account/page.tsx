'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Trash2, X } from 'lucide-react';
import { Breadcrumbs, Container, Kicker, buttonClasses } from '@/components/field';

interface SavedEntry {
  slug: string;
  type: 'article' | 'product' | 'comparison';
  title: string;
  savedAt: string;
}

const STORAGE_KEY = 'hcw_saved_items';

function hrefFor(item: SavedEntry): string {
  if (item.type === 'product') return `/products/${item.slug}`;
  if (item.type === 'comparison') return `/compare/${item.slug}`;
  return item.slug.startsWith('best-') ? `/best/${item.slug}` : `/guides/${item.slug}`;
}

const TYPE_LABEL: Record<SavedEntry['type'], string> = {
  article: 'Guide',
  product: 'Product review',
  comparison: 'Comparison',
};

export default function UserAccountPage() {
  const [savedItems, setSavedItems] = useState<SavedEntry[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedItems(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: SavedEntry[]) => {
    setSavedItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const removeItem = (slug: string) => {
    const item = savedItems.find((i) => i.slug === slug);
    persist(savedItems.filter((i) => i.slug !== slug));
    if (item) setStatusMsg(`Removed “${item.title}”.`);
  };

  const exportPersonalData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      platform: 'HouseCareWiki.com',
      savedItems,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'housecarewiki-personal-data.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Your saved items were downloaded as a JSON file.');
  };

  const deleteAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setSavedItems([]);
    setStatusMsg('All saved items were deleted from this browser.');
  };

  return (
    <div className="pb-16">
      <header className="border-b border-rule">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Saved items' }]} />
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <Kicker tone="accent">Your saved items</Kicker>
              <h1 className="mt-3 font-serif text-[2.5rem] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-[3.25rem]">
                Saved guides and products
              </h1>
              <p className="mt-4 max-w-prose text-[1.0625rem] leading-relaxed text-ink-secondary">
                No account needed. Your list is stored only in this browser, so it won&apos;t follow you to another device.
                Download or delete it whenever you like.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <button type="button" onClick={exportPersonalData} className={buttonClasses('secondary')}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download as JSON
              </button>
              <button
                type="button"
                onClick={deleteAllData}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded border border-terracotta px-5 text-sm font-semibold text-terracotta-deep transition-colors duration-150 hover:bg-terracotta hover:text-white"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete all
              </button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="pt-10">
        <p role="status" aria-live="polite" className={statusMsg ? 'mb-6 border-l-4 border-leaf-deep bg-leaf-soft px-4 py-3 text-sm font-semibold text-leaf-deep' : 'sr-only'}>
          {statusMsg}
        </p>

        <section aria-labelledby="saved-heading" className="max-w-3xl">
          <div className="flex items-baseline justify-between border-t border-rule-strong pt-3">
            <h2 id="saved-heading" className="font-serif text-2xl font-semibold text-ink">
              Your list
            </h2>
            <span className="kicker text-ink-muted">
              {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {savedItems.length === 0 ? (
            <div className="mt-4 border-y border-rule py-8">
              <p className="text-[15px] text-ink-secondary">
                Nothing saved yet. Use the bookmark button on any guide or review to keep it here.
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-6 text-sm font-semibold">
                <li>
                  <Link href="/guides/how-to-remove-coffee-stains-from-fabric-sofa" className="link inline-flex min-h-[44px] items-center">
                    Coffee stain on a sofa
                  </Link>
                </li>
                <li>
                  <Link href="/best/best-portable-carpet-cleaners-home-use-2026" className="link inline-flex min-h-[44px] items-center">
                    Best portable carpet cleaners
                  </Link>
                </li>
              </ul>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {savedItems.map((item) => (
                <li key={item.slug} className="flex items-center justify-between gap-4 py-3">
                  <Link href={hrefFor(item)} className="group min-w-0 py-1">
                    <span className="kicker text-ink-muted">{TYPE_LABEL[item.type] || item.type}</span>
                    <span className="mt-0.5 block font-serif text-lg font-semibold leading-snug text-ink">
                      <span className="hover-title">{item.title}</span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded px-3 text-sm font-semibold text-terracotta-deep hover:bg-terracotta-soft"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Remove<span className="sr-only"> {item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="mt-12 max-w-prose border-l-4 border-leaf bg-leaf-soft/60 px-5 py-4 text-[0.9375rem] leading-relaxed text-ink-secondary">
          <p className="kicker mb-1 text-terracotta-deep">What we keep</p>
          <p>
            We don&apos;t collect home addresses, phone numbers or cross-site profiles. Clicks on Amazon links record only which
            product and page the link was on.{' '}
            <Link href="/privacy" className="link">
              Privacy policy
            </Link>
          </p>
        </aside>
      </Container>
    </div>
  );
}
