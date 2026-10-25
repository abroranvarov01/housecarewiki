import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, webPageSchema } from '@/lib/schema';
import { AffiliateDisclosureNote, PriceNote, EditorScore, AffiliateButton } from '@/components/ui/Badges';

// ISR: pre-rendered, refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore().surfaces.map((x) => ({ slug: x.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const store = readStore();
  const surface = store.surfaces.find((s) => s.slug === params.slug);
  if (!surface) return { title: 'Surface Guide Not Found' };
  return buildMetadata({
    title: `${surface.name} Cleaning & Safety Guide`,
    description: fitDescription(surface.summary, 'Safe cleaners, what to avoid, routine care and deep-clean steps.'),
    path: `/surfaces/${surface.slug}`,
    ogKicker: 'Surface safety guide',
  });
}

export default function SurfaceGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const surface = store.surfaces.find((s) => s.slug === params.slug);
  if (!surface) {
    notFound();
  }

  const recommendedProducts = surface.recommendedProductIds
    .map((id) => store.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Surfaces', path: '/tools/surface-checker' },
      { name: surface.name, path: `/surfaces/${surface.slug}` },
    ]),
    webPageSchema({
      path: `/surfaces/${surface.slug}`,
      name: `${surface.name} Cleaning & Safety Guide`,
      description: surface.summary,
      about: surface.name,
    }),
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="py-4 flex items-center gap-1.5 text-xs text-ink-muted">
        <Link href="/" className="hover:text-forest">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/tools/surface-checker" className="hover:text-forest">
          Surfaces
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium">{surface.name}</span>
      </nav>
      <AffiliateDisclosureNote className="mb-4" />

      {/* Surface Switcher Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {store.surfaces.map((s) => (
          <Link
            key={s.slug}
            href={`/surfaces/${s.slug}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
              s.slug === surface.slug
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-ink-secondary border-paper-border hover:border-forest'
            }`}
          >
            {s.name}
          </Link>
        ))}
      </div>

      {/* Hero Header */}
      <header className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-coral">
            Surface Safety Encyclopedia · {surface.category}
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-ink">
            {surface.name}
          </h1>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            {surface.summary}
          </p>
        </div>
        <div className="md:col-span-5">
          <img
            src={surface.image}
            loading="lazy"
            decoding="async"
            alt={surface.name}
            className="w-full h-52 object-cover rounded-xl border border-paper-border"
          />
        </div>
      </header>

      {/* Safe vs Unsafe Chemical Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6">
          <h2 className="font-editorial text-xl font-bold text-forest flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5" />
            <span>Approved Safe Cleaners & Tools</span>
          </h2>
          <ul className="space-y-2.5 text-sm text-ink">
            {surface.safeAgents.map((agent) => (
              <li key={agent} className="flex items-start gap-2">
                <span className="font-bold text-forest">✓</span>
                <span>{agent}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-6">
          <h2 className="font-editorial text-xl font-bold text-rose-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-700" />
            <span>Never Use on {surface.name}</span>
          </h2>
          <ul className="space-y-3 text-sm text-ink">
            {surface.unsafeAgents.map((u) => (
              <li key={u.agent}>
                <strong className="text-rose-800">✗ {u.agent}:</strong>{' '}
                <span className="text-ink-secondary">{u.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Routine vs Deep Clean */}
      <div className="mt-8 bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-editorial text-xl font-bold text-ink mb-3">
            Weekly Routine Maintenance
          </h2>
          <ul className="space-y-2 text-sm text-ink-secondary">
            {surface.routineCare.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <span className="text-forest font-bold">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-editorial text-xl font-bold text-ink mb-3">
            Deep Cleaning Protocol
          </h2>
          <ol className="space-y-2 text-sm text-ink-secondary list-decimal list-inside">
            {surface.deepCleanSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Compatible Products */}
      {recommendedProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
            Surface-Safe Tested Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recommendedProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-paper-border p-4 shadow-card flex flex-col justify-between"
              >
                <div>
                  <Link
                    href={`/products/${prod.slug}`}
                    className="font-bold text-sm text-ink hover:text-forest block"
                  >
                    {prod.name}
                  </Link>
                  <div className="mt-1">
                    <EditorScore score={prod.scores.overall}
                      size="xs" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between">
                  <div>
                    <PriceNote />
                  </div>
                  <AffiliateButton
                    productId={prod.id}
                    productName={prod.name}
                    asin={prod.asin}
                    amazonUrl={prod.amazonUrl}
                    contentSlug={surface.slug}
                    placement="surface_guide_card"
                    variant="compact"
                    label="Amazon →"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
