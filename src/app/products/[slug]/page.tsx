import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, productReviewSchema } from '@/lib/schema';
import { AffiliateDisclosureNote, PriceNote,
  EditorScore,
  AffiliateButton,
  SaveItemButton,
} from '@/components/ui/Badges';

// ISR: pre-rendered, refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore().products.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = readStore();
  const product = store.products.find((p) => p.slug === params.slug);
  if (!product) return { title: 'Product Not Found' };

  return buildMetadata({
    title: `${product.shortName} Review: Specs, Pros & Cons`,
    description: product.summary,
    path: `/products/${product.slug}`,
    ogKicker: `${product.brand} review`,
  });
}

export default function ProductProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const product = store.products.find((p) => p.slug === params.slug);
  if (!product) {
    notFound();
  }

  const alternatives = store.products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const reviewer = store.authors[0];
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Products', path: '/products' },
      { name: product.shortName, path: `/products/${product.slug}` },
    ]),
    productReviewSchema(product, reviewer),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <JsonLd data={schema} />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="py-4 flex items-center justify-between text-xs text-ink-muted">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-forest">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5" />
          </li>
          <li>
            <Link href="/products" className="hover:text-forest">
              Products
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5" />
          </li>
          <li className="text-ink font-medium truncate max-w-xs">
            {product.shortName}
          </li>
        </ol>
        <SaveItemButton
          itemSlug={product.slug}
          itemType="product"
          title={product.name}
        />
      </nav>
      <AffiliateDisclosureNote className="mb-4" />

      {/* Main Product Profile Card */}
      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-10 shadow-elevated">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Product Image */}
          <div className="lg:col-span-5">
            <div className="aspect-square rounded-2xl overflow-hidden bg-paper-light border border-paper-border p-4">
              <img
                src={product.image}
                fetchPriority="high"
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Right: Editorial Verdict, Scores, & Amazon Affiliate CTA */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {product.badge && (
                <span className="bg-forest text-white text-xs font-bold px-3 py-1 rounded-md">
                  {product.badge}
                </span>
              )}
              <span className="bg-paper-warm text-forest-dark text-xs font-semibold px-3 py-1 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                {product.evidenceStatus}
              </span>
              <span className="text-xs text-ink-muted">
                Model: {product.model} · ASIN: {product.asin}
              </span>
            </div>

            <h1 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
              {product.name}
            </h1>

            <EditorScore score={product.scores.overall}
              size="md" />

            <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
              {product.summary}
            </p>

            {/* Lab Sub-scores Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-paper-light p-3 rounded-xl border border-paper-border text-center">
                <span className="text-[11px] text-ink-muted block">Cleaning Power</span>
                <span className="font-editorial text-xl font-bold text-forest">
                  {product.scores.cleaningPower}/10
                </span>
              </div>
              <div className="bg-paper-light p-3 rounded-xl border border-paper-border text-center">
                <span className="text-[11px] text-ink-muted block">Ease of Use</span>
                <span className="font-editorial text-xl font-bold text-forest">
                  {product.scores.easeOfUse}/10
                </span>
              </div>
              <div className="bg-paper-light p-3 rounded-xl border border-paper-border text-center">
                <span className="text-[11px] text-ink-muted block">Build Quality</span>
                <span className="font-editorial text-xl font-bold text-forest">
                  {product.scores.buildQuality}/10
                </span>
              </div>
              <div className="bg-paper-light p-3 rounded-xl border border-paper-border text-center">
                <span className="text-[11px] text-ink-muted block">Value Score</span>
                <span className="font-editorial text-xl font-bold text-forest">
                  {product.scores.valueForMoney}/10
                </span>
              </div>
            </div>

            {/* Price & CTA Box */}
            <div className="pt-4 border-t border-paper-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <PriceNote />
                </div>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  As an Amazon Associate we earn from qualifying purchases.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/compare?p1=${product.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-paper-border text-xs sm:text-sm font-semibold text-ink hover:border-forest transition"
                >
                  <Scale className="w-4 h-4" />
                  <span>Compare</span>
                </Link>
                <AffiliateButton
                  productId={product.id}
                  productName={product.name}
                  asin={product.asin}
                  amazonUrl={product.amazonUrl}
                  contentSlug={product.slug}
                  placement="product_profile_hero"
                  variant="coral"
                  label="Check price on Amazon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pros, Cons & Who Should Buy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-paper-border p-6 shadow-card">
          <h2 className="font-editorial text-xl font-bold text-forest flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5" />
            <span>Strengths & Advantages</span>
          </h2>
          <ul className="space-y-2.5 text-sm text-ink">
            {product.pros.map((pro) => (
              <li key={pro} className="flex items-start gap-2">
                <span className="font-bold text-forest">+</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-paper-border p-6 shadow-card">
          <h2 className="font-editorial text-xl font-bold text-rose-800 flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5" />
            <span>Limitations to Consider</span>
          </h2>
          <ul className="space-y-2.5 text-sm text-ink">
            {product.cons.map((con) => (
              <li key={con} className="flex items-start gap-2">
                <span className="font-bold text-rose-700">–</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Structured Specifications Table */}
      <div className="mt-8 bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card">
        <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
          Verified Technical Specifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(product.specs).map(([label, val]) => (
            <div
              key={label}
              className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-paper-light border border-paper-border text-sm"
            >
              <span className="text-ink-secondary font-medium">{label}</span>
              <span className="font-bold text-ink">{val}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-paper-light border border-paper-border text-sm sm:col-span-2">
            <span className="text-ink-secondary font-medium">Compatible Surfaces</span>
            <span className="font-bold text-ink">{product.surfaces.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <section className="mt-12">
          <h2 className="font-editorial text-2xl font-bold text-ink mb-5">
            Compared Alternatives in This Class
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="bg-white rounded-xl border border-paper-border p-4 shadow-card flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold bg-mist text-forest-dark px-2.5 py-0.5 rounded">
                    {alt.badge || `Best for ${alt.bestFor}`}
                  </span>
                  <Link
                    href={`/products/${alt.slug}`}
                    className="font-bold text-base text-ink hover:text-forest block mt-2"
                  >
                    {alt.name}
                  </Link>
                  <p className="text-xs text-ink-secondary mt-1 line-clamp-2">
                    {alt.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between">
                  <div>
                    <PriceNote />
                  </div>
                  <Link
                    href={`/products/${alt.slug}`}
                    className="text-xs font-semibold text-forest hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
