import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ChevronRight,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { readStore } from '@/lib/store';
import {
  PrimeBadge,
  StarRating,
  HandwrittenNote,
  AffiliateButton,
  SaveItemButton,
} from '@/components/ui/Badges';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = readStore();
  const article = store.articles.find((a) => a.slug === params.slug);
  if (!article) return { title: 'Guide Not Found' };

  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: {
      canonical: article.seo.canonical,
    },
  };
}

export default function StepByStepGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const article = store.articles.find((a) => a.slug === params.slug);
  if (!article) {
    notFound();
  }

  const author =
    store.authors.find((au) => au.slug === article.authorSlug) || store.authors[0];

  const recommendedProducts = article.recommendedProductIds
    .map((id) => store.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="py-4 flex items-center justify-between flex-wrap gap-2 text-xs text-ink-muted"
      >
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
            <Link href={`/rooms/${article.roomSlug}`} className="hover:text-forest capitalize">
              {article.roomSlug.replace(/-/g, ' ')}
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5" />
          </li>
          <li className="text-ink font-medium truncate max-w-xs sm:max-w-md">
            {article.title}
          </li>
        </ol>
        <SaveItemButton
          itemSlug={article.slug}
          itemType="article"
          title={article.title}
        />
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-br from-[#FBF9F5] via-[#F4EFE4] to-[#EAE1D0] rounded-2xl border border-paper-border p-6 sm:p-10 shadow-soft">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-coral">
                {article.categoryLabel}
              </span>
              <span className="text-xs text-ink-muted">·</span>
              <span className="text-xs font-semibold text-forest">
                {article.evidenceStatus}
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold text-ink leading-tight">
              {article.title}
            </h1>

            <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
              {article.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
              />
              <div>
                <Link
                  href={`/authors/${author.slug}`}
                  className="text-xs sm:text-sm font-bold text-ink hover:text-forest"
                >
                  By {author.name}
                </Link>
                <p className="text-xs text-ink-muted">
                  Updated {article.updatedAt} · {article.readingTime}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="rounded-xl overflow-hidden shadow-elevated border border-white/70 aspect-[4/3] relative">
              <img
                src={article.heroImage}
                alt={article.heroImageAlt}
                className="w-full h-full object-cover"
              />
              {article.handwrittenBadge && (
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-soft">
                  <HandwrittenNote
                    text={article.handwrittenBadge.replace(' with ', '\nwith ')}
                    arrowDirection="down-right"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Answer Box (Solve the problem first philosophy — Spec Section 6.1 A) */}
      <section className="mt-8 bg-white rounded-2xl border-l-4 border-l-forest border border-paper-border p-6 shadow-card">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-forest mb-2">
          <Sparkles className="w-4 h-4 text-coral" />
          <span>The Quick Answer (Solve It in 60 Seconds)</span>
        </div>
        <p className="text-sm sm:text-base text-ink leading-relaxed font-medium">
          {article.quickAnswer}
        </p>
      </section>

      {/* Surface & Chemical Safety Warnings */}
      {article.safetyWarnings.length > 0 && (
        <section className="mt-6 bg-amber-50/90 border border-amber-300 rounded-2xl p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-950">
                Before You Start: Surface & Safety Check
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-amber-900">
                {article.safetyWarnings.map((w) => (
                  <li key={w} className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Materials Needed */}
      {article.materialsNeeded && article.materialsNeeded.length > 0 && (
        <section className="mt-8 bg-white rounded-2xl border border-paper-border p-6 shadow-card">
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-ink flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-forest" />
            <span>What You&apos;ll Need</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {article.materialsNeeded.map((mat) => (
              <div
                key={mat}
                className="flex items-center gap-2.5 bg-paper-light p-3 rounded-xl border border-paper-border text-xs sm:text-sm text-ink"
              >
                <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                <span>{mat}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Step-by-Step Instructions */}
      {article.steps && article.steps.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-ink">
            Step-by-Step Instructions
          </h2>

          {article.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white rounded-2xl border border-paper-border p-6 shadow-card flex flex-col sm:flex-row gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-forest text-white font-editorial font-bold text-lg flex items-center justify-center shrink-0">
                {step.stepNumber}
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-editorial text-xl font-bold text-ink">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
                  {step.instruction}
                </p>
                {step.proTip && (
                  <div className="mt-3 bg-forest-pale/60 border border-forest/20 rounded-xl p-3.5 text-xs sm:text-sm text-forest-dark">
                    <strong>Field Tester Pro Tip:</strong> {step.proTip}
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* What to Do If the Method Fails */}
      {article.ifMethodFails && article.ifMethodFails.length > 0 && (
        <section className="mt-8 bg-paper-warm rounded-2xl border border-paper-border p-6">
          <h2 className="font-editorial text-xl font-bold text-ink flex items-center gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-coral" />
            <span>What to Do for Set-In or Stubborn Stains</span>
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-ink-secondary">
            {article.ifMethodFails.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="font-bold text-coral">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recommended Tools & Products */}
      {recommendedProducts.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-ink">
                Recommended Tools for This Job
              </h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Independently tested tools that speed up this task. We earn a commission on qualifying purchases.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recommendedProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-paper-border p-4 shadow-card flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block bg-forest text-white text-[11px] font-bold px-2.5 py-0.5 rounded mb-2.5">
                    {prod.badge || `Best for ${prod.bestFor}`}
                  </span>
                  <Link
                    href={`/products/${prod.slug}`}
                    className="block aspect-[4/3] rounded-lg overflow-hidden bg-paper-light mb-3"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <Link
                    href={`/products/${prod.slug}`}
                    className="font-bold text-sm text-ink hover:text-forest line-clamp-2"
                  >
                    {prod.name}
                  </Link>
                  <div className="mt-1.5">
                    <StarRating
                      rating={prod.rating}
                      reviewCount={prod.reviewCount}
                      size="xs"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-paper-border">
                  <div className="flex items-baseline gap-1 mb-2.5">
                    <span className="text-lg font-extrabold text-ink">
                      {prod.price}
                    </span>
                    {prod.isPrime && <PrimeBadge />}
                  </div>
                  <AffiliateButton
                    productId={prod.id}
                    productName={prod.name}
                    asin={prod.asin}
                    amazonUrl={prod.amazonUrl}
                    contentSlug={article.slug}
                    placement="guide_recommended_tool"
                    variant="forest"
                    label="View on Amazon"
                    className="w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      {article.faqs.length > 0 && (
        <section className="mt-10 bg-white rounded-2xl border border-paper-border p-6 shadow-card">
          <h2 className="font-editorial text-2xl font-bold text-ink mb-4">
            Common Questions
          </h2>
          <div className="space-y-4 divide-y divide-paper-border">
            {article.faqs.map((faq, i) => (
              <div key={faq.question} className={i > 0 ? 'pt-4' : ''}>
                <h3 className="font-editorial font-bold text-base text-ink">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mt-1.5 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sources */}
      {article.sources.length > 0 && (
        <section className="mt-8 bg-paper-warm/60 rounded-xl border border-paper-border p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5 mb-2">
            <BookOpen className="w-4 h-4" />
            Sources & Standards Cited
          </h3>
          <ul className="space-y-1.5 text-xs text-ink-secondary">
            {article.sources.map((s) => (
              <li key={s.id}>
                <strong>{s.title}</strong> ({s.publisher}) — {s.verifiedClaim}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
