'use client';

// Topic filter for a room hub. The first render (server HTML) shows every article, so all guide links are
// crawlable; the topic buttons only narrow the list on the client.
import React, { useState } from 'react';
import Link from 'next/link';

export interface RoomArticleRow {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  meta: string;
  topic: string;
  kind: 'fix' | 'buy';
  image: string;
}

export interface RoomTopic {
  id: string;
  label: string;
  count: number;
}

export function RoomPageClient({ topics, articles }: { topics: RoomTopic[]; articles: RoomArticleRow[] }) {
  const [active, setActive] = useState<string>('all');
  const visible = active === 'all' ? articles : articles.filter((a) => a.topic === active);
  const groups: { kind: RoomArticleRow['kind']; title: string; note: string }[] = [
    { kind: 'fix', title: 'Fix it guides', note: 'Step-by-step methods' },
    { kind: 'buy', title: 'Buying guides', note: 'What to look for and our picks' },
  ];
  const activeLabel = topics.find((t) => t.id === active)?.label;
  const present = groups.filter((g) => articles.some((a) => a.kind === g.kind));

  return (
    <div>
      {topics.length > 1 && (
        <div role="group" aria-label="Filter guides by topic" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
            {[{ id: 'all', label: 'All topics', count: articles.length }, ...topics].map((t) => {
              const pressed = active === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setActive(t.id)}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 ${
                    pressed ? 'border-ink bg-ink text-paper-light' : 'border-rule-strong/70 bg-paper-card text-ink hover:border-ink'
                  }`}
                >
                  {t.label}
                  <span className={`kicker ${pressed ? 'text-paper-light/70' : 'text-ink-muted'}`}>{t.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {active === 'all' ? `Showing all ${articles.length} guides` : `Showing ${visible.length} guides about ${activeLabel}`}
      </p>

      <div className={`mt-8 grid gap-10 lg:gap-12 ${present.length > 1 ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>
        {present.map((g) => {
          const rows = visible.filter((a) => a.kind === g.kind);
          return (
            <div key={g.kind}>
              <div className="flex items-baseline justify-between gap-4 border-b border-rule-strong pb-2">
                <h3 className="font-serif text-xl font-semibold text-ink">{g.title}</h3>
                <span className="kicker text-ink-muted">{g.note}</span>
              </div>
              {rows.length === 0 ? (
                <p className="py-4 text-[15px] text-ink-muted">No {g.title.toLowerCase()} for {activeLabel} yet.</p>
              ) : (
                <ul className="divide-y divide-rule border-b border-rule">
                  {rows.map((a) => (
                    <li key={a.id}>
                      <Link href={a.href} className="group grid grid-cols-[4.5rem_1fr] gap-4 py-4">
                        <span className="relative block aspect-square overflow-hidden bg-paper-deep">
                          <img src={a.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="kicker text-ink-muted">{a.meta}</span>
                          <span className="mt-1 block font-serif text-lg font-semibold leading-snug text-ink">
                            <span className="hover-title">{a.title}</span>
                          </span>
                          <span className="mt-1 block text-sm leading-snug text-ink-muted line-clamp-2">{a.excerpt}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
