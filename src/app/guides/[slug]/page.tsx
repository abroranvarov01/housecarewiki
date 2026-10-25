import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { articleSchema, breadcrumbSchema, faqSchema, graph, howToSchema, isoDate } from '@/lib/schema';
import { AffiliateButton, AffiliateDisclosureNote, EditorScore, SaveItemButton } from '@/components/ui/Badges';
import {
  Breadcrumbs,
  Byline,
  Callout,
  Container,
  EvidenceLabel,
  FaqList,
  Figure,
  Kicker,
  SectionHead,
  SourceList,
  articleHref,
  articleMeta,
} from '@/components/field';

// ISR: pages are pre-rendered and refreshed hourly (and on every CMS publish via revalidatePath).
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore()
    .articles.filter((a) => a.routeType === 'guides')
    .map((a) => ({ slug: a.slug }));
}

function findGuide(slug: string) {
  return readStore().articles.find((a) => a.slug === slug && a.routeType === 'guides');
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = findGuide(params.slug);
  if (!article) return { title: 'Guide Not Found' };
  const author = readStore().authors.find((au) => au.slug === article.authorSlug);

  return buildMetadata({
    title: article.seo.title,
    description: article.seo.description,
    path: `/guides/${article.slug}`,
    type: 'article',
    ogKicker: 'Step-by-step guide',
    noindex: !article.seo.indexable || article.status !== 'Published',
    article: {
      publishedTime: isoDate(article.publishedAt),
      modifiedTime: isoDate(article.updatedAt),
      section: article.categoryLabel,
      tags: [article.seo.focusKeyword],
      authors: author ? [absoluteUrl(`/authors/${author.slug}`)] : undefined,
    },
  });
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Step index shared by the sticky desktop rail and the collapsible mobile version. */
function StepIndex({
  steps,
  hasSupplies,
  hasFixes,
  hasFaq,
}: {
  steps: { stepNumber: number; title: string }[];
  hasSupplies: boolean;
  hasFixes: boolean;
  hasFaq: boolean;
}) {
  const linkClass =
    'group flex min-h-[44px] items-baseline gap-3 border-b border-rule py-2.5 text-[15px] leading-snug text-ink hover:text-terracotta-deep';
  return (
    <ol className="border-t border-rule">
      {hasSupplies && (
        <li>
          <a href="#supplies" className={linkClass}>
            <span className="kicker w-6 shrink-0 text-ink-muted">—</span>
            <span className="hover-title">What you&apos;ll need</span>
          </a>
        </li>
      )}
      {steps.map((step) => (
        <li key={step.stepNumber}>
          <a href={`#step-${step.stepNumber}`} className={linkClass}>
            <span className="kicker w-6 shrink-0 text-terracotta-deep">{pad(step.stepNumber)}</span>
            <span className="hover-title">{step.title}</span>
          </a>
        </li>
      ))}
      {hasFixes && (
        <li>
          <a href="#if-it-did-not-work" className={linkClass}>
            <span className="kicker w-6 shrink-0 text-ink-muted">—</span>
            <span className="hover-title">If that didn&apos;t work</span>
          </a>
        </li>
      )}
      {hasFaq && (
        <li>
          <a href="#faq" className={linkClass}>
            <span className="kicker w-6 shrink-0 text-ink-muted">—</span>
            <span className="hover-title">Common questions</span>
          </a>
        </li>
      )}
    </ol>
  );
}

export default function StepByStepGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const article = findGuide(params.slug);
  if (!article) {
    notFound();
  }

  const author =
    store.authors.find((au) => au.slug === article.authorSlug) || store.authors[0];

  const recommendedProducts = article.recommendedProductIds
    .map((id) => store.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const path = `/guides/${article.slug}`;
  const roomName = store.rooms.find((r) => r.slug === article.roomSlug)?.name || article.roomSlug.replace(/-/g, ' ');
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: roomName, path: `/rooms/${article.roomSlug}` },
      { name: article.title, path },
    ]),
    articleSchema(article, author, path),
    howToSchema(article, path),
    faqSchema(article.faqs),
  );

  const steps = article.steps || [];
  const supplies = article.materialsNeeded || [];
  const fixes = article.ifMethodFails || [];
  const related = store.articles.filter(
    (a) =>
      a.routeType === 'guides' && a.status === 'Published' && a.roomSlug === article.roomSlug && a.slug !== article.slug,
  );
  const hasIndex = steps.length > 0;

  return (
    <article className="pb-16">
      <JsonLd data={schema} />

      <Container>
        {/* Breadcrumbs + save */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: roomName, href: `/rooms/${article.roomSlug}` },
              { name: article.title },
            ]}
          />
          <SaveItemButton itemSlug={article.slug} itemType="article" title={article.title} />
        </div>

        {/* Header: title block + hero plate */}
        <header className="grid gap-8 border-b border-rule pb-10 pt-4 lg:grid-cols-12 lg:gap-12 lg:pt-6">
          <div className="lg:col-span-7">
            <Kicker tone="accent">{articleMeta(article)}</Kicker>
            <h1 className="mt-4 font-serif text-[2.25rem] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-5xl lg:text-[3.5rem]">
              {article.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-secondary">{article.subtitle}</p>
            <div className="mt-6 space-y-3">
              <Byline author={author} updatedAt={article.updatedAt} publishedAt={article.publishedAt} />
              <EvidenceLabel status={article.evidenceStatus} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <Figure
              src={article.heroImage}
              alt={article.heroImageAlt}
              ratio="4/3"
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </header>

        {/* The answer first, then what could go wrong */}
        <div className="mx-auto mt-8 max-w-3xl space-y-4 lg:mx-0">
          <Callout tone="answer" title="The short answer">
            <p className="text-base leading-relaxed text-ink sm:text-[17px]">{article.quickAnswer}</p>
          </Callout>

          {article.safetyWarnings.length > 0 && (
            <Callout tone="safety" title="Before you start">
              <ul className="space-y-2">
                {article.safetyWarnings.map((w) => (
                  <li key={w} className="grid grid-cols-[0.875rem_1fr] gap-2">
                    <span className="mt-[0.6em] h-1.5 w-1.5 bg-terracotta" aria-hidden="true" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Callout>
          )}
        </div>

        {/* Mobile: collapsible step index */}
        {hasIndex && (
          <details className="group mt-8 border-y border-rule-strong lg:hidden">
            <summary className="flex min-h-[48px] items-center justify-between gap-4 py-3">
              <span className="kicker text-ink">Jump to a step</span>
              <ChevronDown className="details-icon h-5 w-5 text-ink-muted transition-transform duration-200" aria-hidden="true" />
            </summary>
            <nav aria-label="Guide steps" className="pb-3">
              <StepIndex
                steps={steps}
                hasSupplies={supplies.length > 0}
                hasFixes={fixes.length > 0}
                hasFaq={article.faqs.length > 0}
              />
            </nav>
          </details>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Desktop: sticky step index */}
          {hasIndex && (
            <aside className="hidden lg:col-span-3 lg:block">
              <nav aria-labelledby="on-this-page" className="sticky top-24">
                <p id="on-this-page" className="kicker mb-3 text-ink">
                  On this page
                </p>
                <StepIndex
                  steps={steps}
                  hasSupplies={supplies.length > 0}
                  hasFixes={fixes.length > 0}
                  hasFaq={article.faqs.length > 0}
                />
              </nav>
            </aside>
          )}

          <div className={`min-w-0 ${hasIndex ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
            <div className="max-w-3xl space-y-14">
              {/* Supplies checklist */}
              {supplies.length > 0 && (
                <section aria-labelledby="supplies-heading" id="supplies" className="scroll-mt-24">
                  <SectionHead id="supplies-heading" title="What you’ll need" />
                  <ul className="mt-5 grid border-t border-rule sm:grid-cols-2 sm:gap-x-8">
                    {supplies.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 border-b border-rule py-3 text-base leading-snug text-ink sm:text-[17px]"
                      >
                        <span className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 border-2 border-ink" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Steps */}
              {steps.length > 0 && (
                <section aria-labelledby="steps-heading">
                  <SectionHead id="steps-heading" title="Step by step" />
                  <ol className="mt-2">
                    {steps.map((step) => (
                      <li
                        key={step.stepNumber}
                        id={`step-${step.stepNumber}`}
                        className="grid scroll-mt-24 grid-cols-[3rem_1fr] gap-x-4 border-b border-rule py-7 sm:grid-cols-[4.5rem_1fr] sm:gap-x-6"
                      >
                        <span
                          className="font-serif text-[2.5rem] font-medium leading-none tracking-[-0.02em] text-terracotta-deep sm:text-[3.25rem]"
                          aria-hidden="true"
                        >
                          {pad(step.stepNumber)}
                        </span>
                        <div className="min-w-0">
                          <Kicker className="mb-1">
                            Step {step.stepNumber} of {steps.length}
                          </Kicker>
                          <h3 className="font-serif text-2xl font-semibold leading-snug text-ink">{step.title}</h3>
                          <p className="mt-3 max-w-prose text-base leading-relaxed text-ink-secondary sm:text-[17px]">
                            {step.instruction}
                          </p>
                          {step.image && (
                            <Figure
                              src={step.image}
                              alt={`Step ${step.stepNumber}: ${step.title}`}
                              ratio="16/10"
                              className="mt-5"
                              sizes="(min-width: 1024px) 45vw, 100vw"
                            />
                          )}
                          {step.proTip && (
                            <Callout tone="note" title="Field note" className="mt-5">
                              {step.proTip}
                            </Callout>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* If that didn't work */}
              {fixes.length > 0 && (
                <section aria-labelledby="fails-heading" id="if-it-did-not-work" className="scroll-mt-24">
                  <SectionHead
                    id="fails-heading"
                    title="If that didn’t work"
                    description="Stubborn or set-in? Try these next, in order."
                  />
                  <ol className="mt-5 border-t border-rule">
                    {fixes.map((tip, i) => (
                      <li
                        key={tip}
                        className="grid grid-cols-[2rem_1fr] gap-3 border-b border-rule py-3.5 text-base leading-relaxed text-ink-secondary sm:text-[17px]"
                      >
                        <span className="kicker pt-1 text-terracotta-deep">{String.fromCharCode(65 + i)}</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Tools, only after the method */}
              {recommendedProducts.length > 0 && (
                <section aria-labelledby="tools-heading">
                  <SectionHead
                    id="tools-heading"
                    title="Tools that help"
                    description="You can do this with cloths and a spray bottle. These make it faster:"
                  />
                  <AffiliateDisclosureNote className="mt-3" />
                  <ul className="mt-4 border-t border-rule">
                    {recommendedProducts.map((prod) => (
                      <li
                        key={prod.id}
                        className="grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-3 border-b border-rule py-4 sm:grid-cols-[4.5rem_1fr_auto]"
                      >
                        <Link href={`/products/${prod.slug}`} tabIndex={-1} aria-hidden="true">
                          <Figure src={prod.image} alt="" ratio="1/1" />
                        </Link>
                        <div className="min-w-0">
                          <Link href={`/products/${prod.slug}`} className="group flex min-h-[44px] items-center">
                            <span className="font-serif text-lg font-semibold leading-snug text-ink">
                              <span className="hover-title">{prod.shortName}</span>
                            </span>
                          </Link>
                          <p className="mt-0.5 text-sm leading-snug text-ink-muted">Best for {prod.bestFor}</p>
                          <div className="mt-1.5">
                            <EditorScore score={prod.scores.overall} size="xs" />
                          </div>
                        </div>
                        <AffiliateButton
                          productId={prod.id}
                          productName={prod.name}
                          asin={prod.asin}
                          amazonUrl={prod.amazonUrl}
                          contentSlug={article.slug}
                          placement="guide_recommended_tool"
                          variant="compact"
                          label="Check price on Amazon"
                          className="col-span-2 min-h-[44px] sm:col-span-1"
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* FAQ */}
              {article.faqs.length > 0 && (
                <section aria-labelledby="faq-heading" id="faq" className="scroll-mt-24">
                  <SectionHead id="faq-heading" title="Common questions" />
                  <FaqList faqs={article.faqs} className="mt-5" />
                </section>
              )}

              {article.sources.length > 0 && <SourceList sources={article.sources} className="border-t border-rule pt-6" />}

              {/* Related */}
              <section aria-labelledby="related-heading">
                <SectionHead
                  id="related-heading"
                  title={`More in ${roomName}`}
                  href={`/rooms/${article.roomSlug}`}
                  linkLabel={`All ${roomName} guides`}
                />
                {related.length > 0 ? (
                  <ul className="mt-4 border-t border-rule">
                    {related.map((g) => (
                      <li key={g.id}>
                        <Link href={articleHref(g)} className="group grid grid-cols-[4.5rem_1fr] gap-4 border-b border-rule py-4">
                          <Figure src={g.heroImage} alt="" ratio="1/1" />
                          <span className="min-w-0">
                            <span className="kicker text-ink-muted">{articleMeta(g)}</span>
                            <span className="mt-1 block font-serif text-lg font-semibold leading-snug text-ink">
                              <span className="hover-title">{g.title}</span>
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Link
                    href={`/rooms/${article.roomSlug}`}
                    className="group mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-terracotta-deep"
                  >
                    <span className="hover-title">Browse the {roomName} hub</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                )}
              </section>
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}
