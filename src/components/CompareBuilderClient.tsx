'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { AffiliateDisclosureNote, EditorScore, AffiliateButton } from '@/components/ui/Badges';

const MAX_SELECTED = 4;
const MIN_SELECTED = 2;
const DEFAULT_IDS = ['prod-bissell-little-green', 'prod-hoover-cleanslate', 'prod-shark-stainstriker'];

// Interactive side-by-side matrix: pick 2 to 4 products, read their specs in one table.
export function CompareBuilderClient({ products }: { products: Product[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const valid = DEFAULT_IDS.filter((id) => products.some((p) => p.id === id));
    return valid.length >= MIN_SELECTED ? valid : products.slice(0, MIN_SELECTED).map((p) => p.id);
  });
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [notice, setNotice] = useState('');

  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= MIN_SELECTED) {
        setNotice(`Keep at least ${MIN_SELECTED} products to compare. Add another before removing this one.`);
        return;
      }
      setNotice('');
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= MAX_SELECTED) {
        setNotice(`You can compare up to ${MAX_SELECTED} products. Remove one to add another.`);
        return;
      }
      setNotice('');
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const allSpecKeys = Array.from(new Set(comparedProducts.flatMap((p) => Object.keys(p.specs))));
  const differs = (key: string) => new Set(comparedProducts.map((p) => p.specs[key] || '—')).size > 1;
  const displayedSpecKeys = onlyDifferences ? allSpecKeys.filter(differs) : allSpecKeys;

  const stickyTh = 'sticky left-0 z-10 w-36 min-w-[9rem] border-r border-rule px-4 py-3 text-left align-top sm:w-48 sm:min-w-[12rem]';

  return (
    <div className="space-y-10">
      {/* Picker */}
      <fieldset className="border-t border-rule-strong pt-4">
        <legend className="flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <span className="font-serif text-2xl font-semibold text-ink">Choose 2 to 4 products</span>
          <span className="kicker text-ink" aria-live="polite">
            {selectedIds.length} of {MAX_SELECTED} selected
          </span>
        </legend>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const active = selectedIds.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggleProduct(p.id)}
                  aria-pressed={active}
                  className={`flex min-h-[56px] w-full items-center gap-3 rounded-sm border px-3 py-2 text-left transition-colors duration-150 ${
                    active
                      ? 'border-ink bg-ink text-paper-light'
                      : 'border-rule-strong/70 bg-paper-card text-ink hover:border-ink'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border ${
                      active ? 'border-honey bg-honey text-ink' : 'border-rule-strong bg-paper'
                    }`}
                    aria-hidden="true"
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="h-10 w-10 shrink-0 bg-paper-card p-0.5">
                    <img src={p.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold leading-snug">{p.shortName}</span>
                    <span className={`block text-[12px] leading-snug ${active ? 'text-paper-light/70' : 'text-ink-muted'}`}>
                      Best for: {p.bestFor}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 min-h-[1.25rem] text-[13px] text-terracotta-deep" role="status">
          {notice}
        </p>
      </fieldset>

      {/* Matrix */}
      <section aria-labelledby="matrix-heading">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-rule-strong pt-4">
          <h2 id="matrix-heading" className="font-serif text-2xl font-semibold text-ink">
            Side by side
          </h2>
          <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 text-[14px] font-medium text-ink">
            <input
              type="checkbox"
              checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)}
              className="h-5 w-5 accent-ink"
            />
            <span>Only show specs that differ</span>
          </label>
        </div>
        <AffiliateDisclosureNote className="mt-2" />

        <div className="table-scroll mt-4 border border-rule">
          <table className="w-full border-collapse text-left text-[14px]">
            <caption className="sr-only">Specifications of the selected products, side by side</caption>
            <thead>
              <tr className="border-b border-rule-strong">
                <th scope="col" className={`${stickyTh} kicker bg-paper-card text-ink-muted`}>
                  Product
                </th>
                {comparedProducts.map((prod) => (
                  <th key={prod.id} scope="col" className="min-w-[200px] bg-paper-card px-4 py-4 align-top font-normal">
                    <div className="aspect-square w-24 bg-paper p-1">
                      <img src={prod.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                    </div>
                    <Link
                      href={`/products/${prod.slug}`}
                      className="mt-2 flex min-h-[44px] items-center font-serif text-lg font-semibold leading-snug text-ink hover:text-terracotta-deep"
                    >
                      {prod.shortName}
                    </Link>
                    <AffiliateButton
                      productId={prod.id}
                      productName={prod.name}
                      asin={prod.asin}
                      amazonUrl={prod.amazonUrl}
                      contentSlug="compare-builder"
                      placement="matrix_header"
                      variant="compact"
                      label="Check price on Amazon"
                      className="mt-3 min-h-[44px] w-full"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              <tr>
                <th scope="row" className={`${stickyTh} bg-paper font-semibold text-ink`}>
                  Our rating{' '}
                  <Link href="/methodology" className="block text-[12px] font-normal text-ink-muted underline underline-offset-2 hover:text-terracotta-deep">
                    research-based
                  </Link>
                </th>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="bg-paper px-4 py-3 align-top">
                    <EditorScore score={p.scores.overall} size="xs" />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className={`${stickyTh} bg-paper font-semibold text-ink`}>
                  Best for
                </th>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="bg-paper px-4 py-3 align-top font-medium text-ink">
                    {p.bestFor}
                  </td>
                ))}
              </tr>
              {(
                [
                  ['Cleaning power', 'cleaningPower'],
                  ['Ease of use', 'easeOfUse'],
                ] as const
              ).map(([label, key]) => (
                <tr key={key}>
                  <th scope="row" className={`${stickyTh} bg-paper font-semibold text-ink`}>
                    {label}
                    <span className="block text-[12px] font-normal text-ink-muted">Research assessment</span>
                  </th>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="bg-paper px-4 py-3 align-top font-mono text-[13px] tabular-nums text-ink-secondary">
                      {p.scores[key].toFixed(1)} / 10
                    </td>
                  ))}
                </tr>
              ))}
              {displayedSpecKeys.map((specKey) => {
                const shade = differs(specKey) ? 'bg-honey-soft/40' : 'bg-paper';
                return (
                  <tr key={specKey}>
                    <th scope="row" className={`${stickyTh} bg-paper font-semibold text-ink`}>
                      {specKey}
                    </th>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className={`${shade} px-4 py-3 align-top text-ink-secondary`}>
                        {p.specs[specKey] || '—'}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr>
                <th scope="row" className={`${stickyTh} bg-paper font-semibold text-ink`}>
                  Suited surfaces
                </th>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="bg-paper px-4 py-3 align-top text-ink-secondary">
                    {p.surfaces.join(', ')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-ink-muted">
          Specs come from manufacturer listings and manuals; shaded cells differ between the selected products. Ratings are our
          editorial judgment, not measurements.{' '}
          <Link href="/methodology" className="underline underline-offset-2 hover:text-terracotta-deep">
            How we evaluate
          </Link>
        </p>
      </section>
    </div>
  );
}
