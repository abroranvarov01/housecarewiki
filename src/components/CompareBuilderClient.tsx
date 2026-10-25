'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product, ComparisonEntry } from '@/lib/types';
import { AffiliateDisclosureNote, PriceNote, EditorScore, AffiliateButton } from '@/components/ui/Badges';
import { Scale, Check, ArrowRight } from 'lucide-react';

export function CompareBuilderClient({
  products,
  editorialComparisons,
}: {
  products: Product[];
  editorialComparisons: ComparisonEntry[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'prod-bissell-little-green',
    'prod-hoover-cleanslate',
    'prod-shark-stainstriker',
  ]);
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  const toggleProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) return; // keep at least 2
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) return; // max 4 per Spec Section 10.3
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const allSpecKeys = Array.from(
    new Set(comparedProducts.flatMap((p) => Object.keys(p.specs)))
  );

  const displayedSpecKeys = onlyDifferences
    ? allSpecKeys.filter((key) => {
        const values = new Set(comparedProducts.map((p) => p.specs[key] || '—'));
        return values.size > 1;
      })
    : allSpecKeys;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F5F0E6] to-[#E8DEC8] rounded-2xl p-6 sm:p-10 border border-paper-border shadow-soft">
        <span className="text-xs font-extrabold uppercase tracking-widest text-coral">
          Spec 10.3 · Interactive Side-by-Side Matrix
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink mt-1">
          Product Comparison Builder
        </h1>
        <p className="text-sm sm:text-base text-ink-secondary mt-2 max-w-2xl">
          Select 2 to 4 tested appliances or tools below to compare specifications, lab scores, noise levels, and surface compatibility side by side.
        <AffiliateDisclosureNote className="mt-2" />
        </p>
      </div>

      {/* Product Selector Chips */}
      <div className="bg-white rounded-2xl border border-paper-border p-5 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-forest">
            Select 2 to 4 Products ({selectedIds.length}/4 active):
          </span>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)}
              className="rounded accent-forest"
            />
            <span>Show Only Differing Specifications</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {products.map((p) => {
            const active = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProduct(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  active
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'bg-paper-light text-ink-secondary border-paper-border hover:border-forest'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5" />}
                <span>{p.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-2xl border border-paper-border shadow-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-paper-border bg-paper-light/60">
                <th className="p-4 w-44 text-xs font-bold uppercase tracking-wider text-ink-muted align-top">
                  Model Overview
                </th>
                {comparedProducts.map((prod) => (
                  <th key={prod.id} className="p-4 min-w-[220px] align-top">
                    <div className="space-y-2">
                      <span className="inline-block bg-forest text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {prod.badge || prod.bestFor}
                      </span>
                      <img
                        src={prod.image}
                        loading="lazy"
                        decoding="async"
                        alt={prod.name}
                        className="w-24 h-24 rounded-xl object-cover border border-paper-border"
                      />
                      <Link
                        href={`/products/${prod.slug}`}
                        className="font-editorial font-bold text-base text-ink hover:text-forest block"
                      >
                        {prod.shortName}
                      </Link>
                      <EditorScore score={prod.scores.overall}
                        size="xs" />
                      <div className="pt-1 flex items-baseline gap-1">
                        <PriceNote />
                      </div>
                      <AffiliateButton
                        productId={prod.id}
                        productName={prod.name}
                        asin={prod.asin}
                        amazonUrl={prod.amazonUrl}
                        contentSlug="compare-builder"
                        placement="matrix_header"
                        variant="forest"
                        label="Check price on Amazon"
                        className="w-full mt-2"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border text-xs sm:text-sm">
              <tr className="bg-paper-warm/40">
                <td className="p-4 font-bold text-ink">Overall Lab Score</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-editorial text-lg font-bold text-forest">
                    {p.scores.overall} / 10
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-ink">Best For</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-ink">
                    {p.bestFor}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-ink">Cleaning Power</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-ink-secondary">
                    {p.scores.cleaningPower} / 10
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-bold text-ink">Ease of Use</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-ink-secondary">
                    {p.scores.easeOfUse} / 10
                  </td>
                ))}
              </tr>
              {displayedSpecKeys.map((specKey) => (
                <tr key={specKey}>
                  <td className="p-4 font-bold text-ink">{specKey}</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-4 text-ink-secondary">
                      {p.specs[specKey] || '—'}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-4 font-bold text-ink">Compatible Surfaces</td>
                {comparedProducts.map((p) => (
                  <td key={p.id} className="p-4 text-ink-secondary">
                    {p.surfaces.join(', ')}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Editorial Head-to-Head Comparisons */}
      <section>
        <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
          Editorial Head-to-Head Showdowns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {editorialComparisons.map((comp) => (
            <Link
              key={comp.slug}
              href={`/compare/${comp.slug}`}
              className="group bg-white rounded-2xl border border-paper-border p-6 shadow-card hover:shadow-elevated transition flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-coral">
                  {comp.category}
                </span>
                <h3 className="font-editorial text-xl font-bold text-ink group-hover:text-forest mt-1">
                  {comp.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed">
                  {comp.verdict}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between text-xs font-bold text-forest">
                <span>Read Head-to-Head Verdict</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
