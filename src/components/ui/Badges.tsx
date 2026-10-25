'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Bookmark } from 'lucide-react';

// Our own editorial rating (out of 10). It is a research-based judgment, not a lab measurement, and it is
// labeled that way. Amazon star ratings and review counts are never displayed from static data.
export function EditorScore({
  score,
  size = 'sm',
}: {
  score: number;
  size?: 'xs' | 'sm' | 'md';
}) {
  return (
    <span
      className="inline-flex items-center gap-2"
      title="HouseCareWiki rating: an editorial judgment from specs, manuals and published standards, not a lab measurement."
    >
      <span
        className={`inline-flex items-baseline gap-0.5 rounded-full bg-honey-soft font-semibold tabular-nums text-ink ring-1 ring-inset ring-honey-deep/60 ${
          size === 'md' ? 'px-3 py-1 text-base' : 'px-2.5 py-0.5 text-[13px]'
        }`}
      >
        {score.toFixed(1)}
        <span className="text-[11px] font-medium text-ink-muted">/10</span>
      </span>
      {size !== 'xs' && <span className="text-[13px] text-ink-muted">Our rating</span>}
      <span className="sr-only">HouseCareWiki rating {score.toFixed(1)} out of 10, research-based</span>
    </span>
  );
}

// Static prices break Amazon's pricing policy (live API data only, timestamped, max 24h old),
// so price slots point readers to Amazon for the current price instead.
export function PriceNote({ className = '' }: { className?: string }) {
  return (
    <span className={`text-[12px] text-ink-muted ${className}`}>
      Price varies; check it on Amazon
    </span>
  );
}

// Inline FTC / Amazon Associates disclosure shown next to product links.
export function AffiliateDisclosureNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[12px] leading-snug text-ink-muted ${className}`}>
      As an Amazon Associate, HouseCareWiki earns from qualifying purchases. It costs you nothing extra.{' '}
      <a href="/affiliate-disclosure" className="underline underline-offset-2 hover:text-terracotta-deep">
        How we make money
      </a>
    </p>
  );
}

// Retired: the handwritten "notes" read as decoration rather than information. Kept as a no-op so stray
// imports render nothing; remove remaining usages when touching those pages.
export function HandwrittenNote(_props: { text: string; className?: string; arrowDirection?: string }) {
  return null;
}

export function AffiliateButton({
  productId,
  productName,
  asin,
  amazonUrl,
  contentSlug = 'site',
  placement = 'card',
  variant = 'forest',
  label = 'Check price on Amazon',
  className = '',
}: {
  productId: string;
  productName: string;
  asin: string;
  amazonUrl: string;
  contentSlug?: string;
  placement?: string;
  variant?: 'forest' | 'coral' | 'compact';
  label?: string;
  className?: string;
}) {
  const handleTrackClick = async () => {
    try {
      await fetch('/api/affiliate/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          asin,
          contentSlug,
          placement,
          device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
        }),
      });
    } catch {
      // Non-blocking attribution ping
    }
  };

  // forest = primary (charcoal), coral = high-emphasis (honey), compact = small outline for tables and lists.
  // Variant names are kept for older call sites.
  const styles =
    variant === 'coral'
      ? 'min-h-[48px] bg-honey hover:bg-honey-deep text-ink px-6 text-[15px] font-semibold rounded-full'
      : variant === 'compact'
      ? 'min-h-[44px] border border-ink/70 bg-paper-card text-ink hover:border-ink hover:bg-paper-warm px-4 text-[14px] font-semibold rounded-full'
      : 'min-h-[48px] bg-ink hover:bg-ink-deep text-paper-light px-5 text-[15px] font-semibold rounded-full';

  return (
    <a
      href={amazonUrl}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      onClick={handleTrackClick}
      className={`group inline-flex items-center justify-center gap-1.5 transition-colors duration-150 active:translate-y-px ${styles} ${className}`}
    >
      <span>{label}</span>
      <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      <span className="sr-only">(opens Amazon in a new tab, affiliate link)</span>
    </a>
  );
}

export function SaveItemButton({
  itemSlug,
  itemType,
  title,
}: {
  itemSlug: string;
  itemType: 'article' | 'product' | 'comparison';
  title: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hcw_saved_items');
      if (raw) {
        const list = JSON.parse(raw) as { slug: string }[];
        setSaved(list.some((i) => i.slug === itemSlug));
      }
    } catch {}
  }, [itemSlug]);

  const toggleSave = () => {
    try {
      const raw = localStorage.getItem('hcw_saved_items');
      const list: { slug: string; type: string; title: string; savedAt: string }[] = raw
        ? JSON.parse(raw)
        : [];
      const exists = list.some((i) => i.slug === itemSlug);
      const updated = exists
        ? list.filter((i) => i.slug !== itemSlug)
        : [...list, { slug: itemSlug, type: itemType, title, savedAt: new Date().toISOString() }];
      localStorage.setItem('hcw_saved_items', JSON.stringify(updated));
      setSaved(!exists);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggleSave}
      className={`inline-flex min-h-[44px] items-center gap-1.5 px-4 rounded-full text-[13px] font-medium border transition-colors ${
        saved
          ? 'bg-ink text-paper-light border-ink'
          : 'bg-transparent text-ink-secondary border-rule-strong hover:border-ink hover:text-ink'
      }`}
      aria-pressed={saved}
      title={saved ? 'Remove from saved items' : 'Save for later'}
    >
      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
      <span>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
