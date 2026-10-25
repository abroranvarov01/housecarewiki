// Shared editorial building blocks for the "Warm Editorial Home Guide" design system.
// Server components only (no client JS). Page-specific layouts compose these instead of re-styling cards.
import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ArrowUpRight, ChevronRight, Info, Plus } from 'lucide-react';
import type { Article, ArticleFAQ, Author, EvidenceBadge, SourceCitation } from '@/lib/types';
import { isoDate } from '@/lib/schema';

type WithChildren = { children: React.ReactNode; className?: string };

export function Container({ children, className = '' }: WithChildren) {
  return <div className={`mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

/**
 * Small sentence-case label for section kickers and metadata. `field` switches to the mono caps
 * "field note" style; keep that for a few editorial labels per page ("Field note 01"), not metadata.
 */
export function Kicker({
  children,
  className = '',
  tone = 'muted',
  field = false,
  as: Tag = 'p',
}: WithChildren & { tone?: 'muted' | 'accent' | 'ink'; field?: boolean; as?: 'p' | 'span' | 'div' }) {
  const color = tone === 'accent' ? 'text-terracotta-deep' : tone === 'ink' ? 'text-ink' : 'text-ink-muted';
  return <Tag className={`${field ? 'kicker-field' : 'kicker'} ${color} ${className}`}>{children}</Tag>;
}

/**
 * Section header: serif title with a short terracotta stroke above it, optional kicker and an optional link.
 * Used instead of centered "section title + subtitle" blocks. `index` is kept for older call sites but no
 * longer rendered: numbered sections read as a manual, not a home guide.
 */
export function SectionHead({
  title,
  index,
  kicker,
  description,
  href,
  linkLabel,
  id,
  as: Tag = 'h2',
  className = '',
}: {
  title: React.ReactNode;
  index?: string;
  kicker?: string;
  description?: React.ReactNode;
  href?: string;
  linkLabel?: string;
  id?: string;
  as?: 'h2' | 'h3';
  className?: string;
}) {
  return (
    <div className={className} data-index={index}>
      <span className="mb-3 block h-[3px] w-10 rounded-full bg-terracotta" aria-hidden="true" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-3 min-w-0">
          <div className="min-w-0">
            {kicker && <Kicker className="mb-1">{kicker}</Kicker>}
            <Tag id={id} className="font-serif text-[1.625rem] sm:text-3xl font-semibold leading-tight tracking-[-0.01em] text-ink">
              {title}
            </Tag>
          </div>
        </div>
        {href && linkLabel && (
          <Link href={href} className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-terracotta-deep">
            <span className="hover-title">{linkLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      {description && <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-secondary">{description}</p>}
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'honey' | 'ghost';

export function buttonClasses(variant: ButtonVariant = 'primary', size: 'sm' | 'md' = 'md') {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 ease-out active:translate-y-px disabled:opacity-50 disabled:pointer-events-none';
  const sizes = size === 'sm' ? 'min-h-[44px] px-4 text-[14px] rounded-full' : 'min-h-[48px] px-6 text-[15px] rounded-full';
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-ink text-paper-light hover:bg-ink-deep',
    secondary: 'border border-ink/70 text-ink bg-paper-card hover:border-ink hover:bg-paper-warm',
    honey: 'bg-honey text-ink hover:bg-honey-deep',
    ghost: 'text-terracotta-deep hover:bg-terracotta-soft',
  };
  return `${base} ${sizes} ${variants[variant]}`;
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  arrow = true,
}: WithChildren & { href: string; variant?: ButtonVariant; size?: 'sm' | 'md'; arrow?: boolean }) {
  return (
    <Link href={href} className={`group ${buttonClasses(variant, size)} ${className}`}>
      <span>{children}</span>
      {arrow && (
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
      )}
    </Link>
  );
}

export function Breadcrumbs({ items, className = '' }: { items: { name: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`text-[14px] text-ink-muted ${className}`}>
      <ol className="-my-3 flex flex-wrap items-center gap-x-1.5">
        {items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-rule-strong" aria-hidden="true" />}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="inline-flex min-h-[44px] items-center hover:text-terracotta-deep hover:underline underline-offset-2">
                {item.name}
              </Link>
            ) : (
              <span className="truncate max-w-[16rem] sm:max-w-md text-ink-secondary" aria-current={i === items.length - 1 ? 'page' : undefined}>
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Plain-language explanation of each evidence level. Shown wherever a review or guide declares one. */
export const EVIDENCE_COPY: Record<EvidenceBadge, { label: string; short: string; detail: string }> = {
  'Hands-on Tested': {
    label: 'Hands-on tested',
    short: 'We used this product ourselves.',
    detail: 'We used this product ourselves under the conditions described in our methodology.',
  },
  'Research-Based Review': {
    label: 'Research-based',
    short: 'Not hands-on tested',
    detail:
      'Based on manufacturer specifications, manuals and published care standards. We have not hands-on tested the products mentioned.',
  },
  'Specifications Overview': {
    label: 'Specs overview',
    short: 'Specifications only',
    detail: 'A summary of the manufacturer’s published specifications, without an editorial verdict.',
  },
};

export function EvidenceLabel({ status, className = '', withDetail = false }: { status: EvidenceBadge; className?: string; withDetail?: boolean }) {
  const copy = EVIDENCE_COPY[status] || EVIDENCE_COPY['Research-Based Review'];
  const tested = status === 'Hands-on Tested';
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      <Link
        href="/methodology#evidence"
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 py-1 text-[13px] sm:min-h-[36px] font-semibold transition-colors ${
          tested ? 'border-leaf-deep/40 bg-leaf-soft text-leaf-deep' : 'border-rule-strong/60 bg-paper-card text-ink-secondary hover:border-terracotta-deep hover:text-terracotta-deep'
        }`}
        title={copy.detail}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${tested ? 'bg-leaf-deep' : 'bg-honey-deep'}`} aria-hidden="true" />
        {copy.label}
        {!tested && <span className="font-normal text-ink-muted">· {copy.short}</span>}
      </Link>
      {withDetail && <span className="text-[13px] text-ink-muted">{copy.detail}</span>}
    </span>
  );
}

/** Byline for guides and reviews: team credit, dates and the evidence level. */
export function Byline({
  author,
  updatedAt,
  publishedAt,
  readingTime,
  className = '',
}: {
  author: Pick<Author, 'name' | 'slug'>;
  updatedAt: string;
  publishedAt?: string;
  readingTime?: string;
  className?: string;
}) {
  return (
    <p className={`text-[13px] leading-relaxed text-ink-muted ${className}`}>
      By{' '}
      <Link href={`/authors/${author.slug}`} className="font-semibold text-ink hover:text-terracotta-deep hover:underline underline-offset-2">
        {author.name}
      </Link>
      <span aria-hidden="true"> · </span>
      Updated <time dateTime={isoDate(updatedAt)}>{formatDate(updatedAt)}</time>
      {publishedAt && publishedAt !== updatedAt && (
        <>
          <span aria-hidden="true"> · </span>
          First published <time dateTime={isoDate(publishedAt)}>{formatDate(publishedAt)}</time>
        </>
      )}
      {readingTime && (
        <>
          <span aria-hidden="true"> · </span>
          {readingTime}
        </>
      )}
    </p>
  );
}

/** "Oct 20, 2026" or "2026-10-20" → "Oct 20, 2026". */
export function formatDate(value: string): string {
  const iso = isoDate(value);
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

type CalloutTone = 'safety' | 'note' | 'answer' | 'info';

/** Callouts: safety (terracotta), field note (sage), answer (honey), info (neutral). */
export function Callout({
  tone = 'note',
  title,
  children,
  className = '',
  id,
}: WithChildren & { tone?: CalloutTone; title?: React.ReactNode; id?: string }) {
  const styles: Record<CalloutTone, string> = {
    safety: 'border-l-4 border-terracotta bg-terracotta-soft/70',
    note: 'border-l-4 border-leaf bg-leaf-soft/70',
    answer: 'border-l-4 border-honey-deep bg-honey-soft',
    info: 'border border-rule bg-paper-card',
  };
  const titleColor: Record<CalloutTone, string> = {
    safety: 'text-terracotta-deep',
    note: 'text-leaf-deep',
    answer: 'text-ink',
    info: 'text-ink-muted',
  };
  return (
    <aside id={id} className={`rounded-lg px-5 py-5 sm:px-6 ${styles[tone]} ${className}`}>
      {title && (
        <p className={`${tone === 'note' ? 'kicker-field' : 'kicker'} mb-2 flex items-center gap-1.5 ${titleColor[tone]}`}>
          {tone === 'safety' && <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
          {tone === 'info' && <Info className="h-3.5 w-3.5" aria-hidden="true" />}
          {title}
        </p>
      )}
      <div className="text-base leading-relaxed text-ink-secondary">{children}</div>
    </aside>
  );
}

/** FAQ as native disclosure widgets: works without JavaScript and keeps answers in the HTML for search engines. */
export function FaqList({ faqs, className = '' }: { faqs: ArticleFAQ[]; className?: string }) {
  if (!faqs.length) return null;
  return (
    <div className={`divide-y divide-rule border-y border-rule ${className}`}>
      {faqs.map((faq) => (
        <details key={faq.question} className="group py-1">
          <summary className="flex items-start justify-between gap-4 py-3.5 text-left">
            <h3 className="font-serif text-lg font-semibold leading-snug text-ink group-hover:text-terracotta-deep">{faq.question}</h3>
            <Plus className="details-icon mt-1 h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200" aria-hidden="true" />
          </summary>
          <p className="pb-4 pr-8 text-[0.9375rem] leading-relaxed text-ink-secondary">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Sources list with outbound links. */
export function SourceList({ sources, className = '' }: { sources: SourceCitation[]; className?: string }) {
  if (!sources.length) return null;
  return (
    <section className={className} aria-labelledby="sources-heading">
      <Kicker as="div" className="mb-3">
        <span id="sources-heading">Sources we relied on</span>
      </Kicker>
      <ol className="space-y-3 text-sm text-ink-secondary">
        {sources.map((s, i) => (
          <li key={s.id} className="grid grid-cols-[1.75rem_1fr] gap-1">
            <span className="pt-px text-sm tabular-nums text-ink-muted">{i + 1}.</span>
            <span>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="link font-medium">
                {s.title}
                <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" />
              </a>
              <span className="text-ink-muted"> — {s.publisher}. </span>
              <span>{s.verifiedClaim}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Meta line for article lists: "Cleaning guide · 6 steps · 8 min read". */
export function articleMeta(article: Pick<Article, 'categoryLabel' | 'steps' | 'readingTime'>): string {
  const parts = [labelCase(article.categoryLabel)];
  if (article.steps?.length) parts.push(`${article.steps.length} steps`);
  if (article.readingTime) parts.push(article.readingTime);
  return parts.join(' · ');
}

/** "CLEANING GUIDE" → "Cleaning guide". */
export function labelCase(label: string): string {
  const lower = label.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function articleHref(article: Pick<Article, 'routeType' | 'slug'>): string {
  return `/${article.routeType}/${article.slug}`;
}

/** Image with fixed aspect ratio so layout never shifts while it loads (CLS). */
export function Figure({
  src,
  alt,
  ratio = '4/3',
  className = '',
  imgClassName = '',
  priority = false,
  caption,
  sizes,
}: {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  caption?: React.ReactNode;
  sizes?: string;
}) {
  return (
    <figure className={className}>
      <div className="relative overflow-hidden rounded-xl bg-paper-deep" style={{ aspectRatio: ratio }}>
        <img
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      </div>
      {caption && <figcaption className="mt-2 text-[13px] leading-snug text-ink-muted">{caption}</figcaption>}
    </figure>
  );
}
