// Long-form layout for trust and policy pages: breadcrumbs, serif headline, ruled numbered sections,
// readable measure. Server component, no cards or shadows.
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs, Container, Kicker } from '@/components/field';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/schema';

export function DocPage({
  kicker,
  title,
  lede,
  breadcrumb,
  updated,
  children,
  related,
  path,
  description,
  schemaType,
}: {
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  breadcrumb: string;
  updated?: string;
  children: React.ReactNode;
  related?: { href: string; label: string; note?: string }[];
  /** Page URL and meta description, used for the BreadcrumbList + WebPage JSON-LD. */
  path: string;
  description: string;
  schemaType?: string;
}) {
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: breadcrumb, path },
    ]),
    webPageSchema({ path, name: breadcrumb, description, type: schemaType }),
  );
  return (
    <article className="pb-16">
      <JsonLd data={schema} />
      <header className="border-b border-rule">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: breadcrumb }]} />
          <div className="mt-8 max-w-3xl">
            <Kicker tone="accent">{kicker}</Kicker>
            <h1 className="mt-3 font-serif text-[2.5rem] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-[3.25rem]">
              {title}
            </h1>
            {lede && <div className="mt-5 max-w-prose text-lg leading-relaxed text-ink-secondary">{lede}</div>}
            {updated && <p className="kicker mt-6 text-ink-muted">Last reviewed {updated}</p>}
          </div>
        </Container>
      </header>

      <Container className="pt-10 sm:pt-12">
        <div className="max-w-prose space-y-12">{children}</div>

        {related && related.length > 0 && (
          <nav aria-labelledby="related-pages" className="mt-16 max-w-prose border-t border-rule-strong pt-3">
            <h2 id="related-pages" className="kicker text-ink-muted">
              Related pages
            </h2>
            <ul className="mt-3 divide-y divide-rule border-b border-rule">
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="group flex min-h-[44px] items-center justify-between gap-4 py-3">
                    <span>
                      <span className="font-semibold text-ink group-hover:text-terracotta-deep">{r.label}</span>
                      {r.note && <span className="block text-sm text-ink-muted">{r.note}</span>}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Container>
    </article>
  );
}

/** Ruled, numbered section inside a DocPage. */
export function DocSection({
  id,
  index,
  title,
  children,
}: {
  id?: string;
  index?: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-24 border-t border-rule-strong/60 pt-4">
      <div className="flex items-baseline gap-3">
        {index && <span className="kicker shrink-0 text-terracotta-deep">{index}</span>}
        <h2 id={headingId} className="font-serif text-2xl font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[1.75rem]">
          {title}
        </h2>
      </div>
      <div className="prose-field mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Ruled bullet list for long-form documents. */
export function DocList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="border-t border-rule">
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[0.75rem_1fr] gap-3 border-b border-rule py-2.5">
          <span className="mt-[0.6em] h-1.5 w-1.5 bg-honey-deep" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
