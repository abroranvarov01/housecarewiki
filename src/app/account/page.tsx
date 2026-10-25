'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, Download, ShieldCheck } from 'lucide-react';

interface SavedEntry {
  slug: string;
  type: 'article' | 'product' | 'comparison';
  title: string;
  savedAt: string;
}

export default function UserAccountPage() {
  const [savedItems, setSavedItems] = useState<SavedEntry[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hcw_saved_items');
      if (raw) {
        setSavedItems(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const removeItem = (slug: string) => {
    const next = savedItems.filter((i) => i.slug !== slug);
    setSavedItems(next);
    localStorage.setItem('hcw_saved_items', JSON.stringify(next));
  };

  const exportPersonalData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      platform: 'HouseCareWiki.com',
      savedItems,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'housecarewiki-personal-data.json';
    a.click();
    setStatusMsg('Personal data exported as JSON (Spec Section 12.2).');
  };

  const deleteAllData = () => {
    localStorage.removeItem('hcw_saved_items');
    setSavedItems([]);
    setStatusMsg('All saved personal data cleared from your device.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-forest">
            SYS-07 · Guest & Account Workspace
          </span>
          <h1 className="font-editorial text-3xl font-bold text-ink mt-1">
            Saved Guides, Products & Privacy Controls
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            No mandatory account registration is required to read guides or save items locally. Export or clear your data at any time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportPersonalData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-paper-border bg-paper-light text-xs font-semibold text-ink hover:border-forest"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={deleteAllData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-800 hover:bg-rose-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-forest px-4 py-3 rounded-xl text-xs font-semibold">
          {statusMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-paper-border p-6 shadow-card">
        <h2 className="font-editorial text-xl font-bold text-ink flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-forest" />
          <span>Your Saved Items ({savedItems.length})</span>
        </h2>

        {savedItems.length === 0 ? (
          <div className="text-sm text-ink-secondary py-6 text-center space-y-3">
            <p>You haven&apos;t bookmarked any guides or products yet.</p>
            <div className="flex justify-center gap-3">
              <Link
                href="/best/best-portable-carpet-cleaners-home-use-2026"
                className="bg-forest text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Browse Top Carpet Cleaners
              </Link>
              <Link
                href="/guides/how-to-remove-coffee-stains-from-fabric-sofa"
                className="bg-paper-warm text-ink text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Coffee Stain Guide
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-paper-border">
            {savedItems.map((item) => {
              const href =
                item.type === 'product'
                  ? `/products/${item.slug}`
                  : item.slug.startsWith('best-')
                  ? `/best/${item.slug}`
                  : `/guides/${item.slug}`;
              return (
                <div
                  key={item.slug}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-coral">
                      {item.type}
                    </span>
                    <Link
                      href={href}
                      className="block font-bold text-sm text-ink hover:text-forest"
                    >
                      {item.title}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="text-xs text-rose-700 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-paper-warm/70 rounded-2xl border border-paper-border p-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-forest shrink-0 mt-0.5" />
        <div className="text-xs text-ink-secondary space-y-1">
          <p className="font-bold text-ink">
            Data Minimization Guarantee (Spec Section 12.3 & 21.4)
          </p>
          <p>
            HouseCareWiki does not collect home addresses, phone numbers, or cross-site behavioral profiles. Outbound Amazon Associates clicks record only anonymous content placement attribution.
          </p>
        </div>
      </div>
    </div>
  );
}
