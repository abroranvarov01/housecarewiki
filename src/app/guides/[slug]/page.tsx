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
import { AffiliateButton, AffiliateDisclosureNote, BrandPromotionNote, EditorScore, SaveItemButton } from '@/components/ui/Badges';
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
  sections = [],
  hasTable = false,
  hasSupplies,
  hasFixes,
  hasFaq,
}: {
  steps: { stepNumber: number; title: string }[];
  sections?: { id: string; heading: string; placement?: 'afterSteps' }[];
  hasTable?: boolean;
  hasSupplies: boolean;
  hasFixes: boolean;
  hasFaq: boolean;
}) {
  const linkClass =
    'group flex min-h-[44px] items-baseline gap-3 border-b border-rule py-2.5 text-[15px] leading-snug text-ink hover:text-coral-deep';
  const leadSections = sections.filter((sec) => sec.placement !== 'afterSteps');
  const laterSections = sections.filter((sec) => sec.placement === 'afterSteps');
  return (
    <ol className="border-t border-rule">
      {hasTable && (
        <li>
          <a href="#at-a-glance" className={linkClass}>
            <span className="kicker w-6 shrink-0 text-ink-muted">—</span>
            <span className="hover-title">At a glance</span>
          </a>
        </li>
      )}
      {leadSections.map((sec, i) => (
        <li key={sec.id}>
          <a href={`#${sec.id}`} className={linkClass}>
            <span className="kicker w-6 shrink-0 text-coral-deep">{pad(i + 1)}</span>
            <span className="hover-title">{sec.heading}</span>
          </a>
        </li>
      ))}
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
            <span className="kicker w-6 shrink-0 text-coral-deep">{pad(step.stepNumber)}</span>
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
      {laterSections.map((sec) => (
        <li key={sec.id}>
          <a href={`#${sec.id}`} className={linkClass}>
            <span className="kicker w-6 shrink-0 text-ink-muted">—</span>
            <span className="hover-title">{sec.heading}</span>
          </a>
        </li>
      ))}
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
  const reviewer = store.authors.find((au) => au.slug === article.reviewedBy?.authorSlug);
  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: roomName, path: `/rooms/${article.roomSlug}` },
      { name: article.title, path },
    ]),
    articleSchema(article, author, path, { reviewer, roomName }),
    howToSchema(article, path),
    faqSchema(article.faqs),
  );

  const steps = article.steps || [];
  const supplies = article.materialsNeeded || [];
  const fixes = article.ifMethodFails || [];
  // Closest topic first: guides on the same sub-topic (mold, stains…) lead, the rest of the room follows.
  const related = store.articles
    .filter(
      (a) =>
        a.routeType === 'guides' && a.status === 'Published' && a.roomSlug === article.roomSlug && a.slug !== article.slug,
    )
    .sort((a, b) => Number(b.subCategory === article.subCategory) - Number(a.subCategory === article.subCategory))
    .slice(0, 8);
  // Head-to-head pages that list this guide as one of their use cases link back from here.
  const comparisonsHere = store.comparisons.filter((c) => c.relatedGuideSlugs?.includes(article.slug));
  const productName = (id: string) => store.products.find((p) => p.id === id)?.shortName || '';
  const publishedArticle = (slug: string) =>
    store.articles.find((a) => a.slug === slug && a.status === 'Published' && a.slug !== article.slug);
  const sections = (article.sections || []).map((sec) => ({
    ...sec,
    products: (sec.productIds || [])
      .map((id) => store.products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    guides: (sec.guideSlugs || []).map(publishedArticle).filter((g): g is NonNullable<typeof g> => Boolean(g)),
  }));
  // A product already shown inside a section is not repeated under "Tools that help".
  const shownInSections = new Set(sections.flatMap((s) => s.products.map((p) => p.id)));
  const toolProducts = recommendedProducts.filter((p) => !shownInSections.has(p.id));
  const firstProductSection = sections.find((s) => s.products.length > 0)?.id;
  const seeAlso = (article.relatedGuideSlugs || [])
    .map(publishedArticle)
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const relatedRest = related.filter((g) => !seeAlso.some((s) => s.slug === g.slug));
  const table = article.summaryTable;
  const hasIndex = steps.length > 0 || sections.length > 0;

  // Topic sections: prose, a checklist, the products discussed and the guides behind the advice.
  const renderSection = (sec: (typeof sections)[number]) => (
                <section key={sec.id} aria-labelledby={`${sec.id}-heading`} id={sec.id} className="scroll-mt-24">
                  <SectionHead id={`${sec.id}-heading`} title={sec.heading} />
                  <div className="mt-4 max-w-prose space-y-4 text-base leading-relaxed text-ink-secondary sm:text-[17px]">
                    {sec.paragraphs.map((para) => (
                      <p key={para}>{para}</p>
                    ))}
                  </div>
                  {sec.checklist && sec.checklist.length > 0 && (
                    <ul className="mt-5 border-t border-rule">
                      {sec.checklist.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 border-b border-rule py-3 text-base leading-snug text-ink sm:text-[17px]"
                        >
                          <span className="mt-0.5 h-[1.125rem] w-[1.125rem] shrink-0 border-2 border-ink" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.products.length > 0 && (
                    <>
                      {sec.id === firstProductSection && <AffiliateDisclosureNote className="mt-5" />}
                      <ul className="mt-4 border-t border-rule">
                        {sec.products.map((prod) => productRow(prod, `guide_section_${sec.id}`))}
                      </ul>
                    </>
                  )}
                  {sec.guides.length > 0 && (
                    <div className="mt-6">
                      <Kicker as="p" tone="ink">
                        From our guides
                      </Kicker>
                      <ul className="mt-1">
                        {sec.guides.map((g) => (
                          <li key={g.id}>
                            <Link
                              href={articleHref(g)}
                              className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-coral-deep"
                            >
                              <span className="hover-title">{g.title}</span>
                              <ArrowRight
                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                                aria-hidden="true"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
  );

  const productRow = (prod: (typeof recommendedProducts)[number], placement: string) => (
    <li
      key={prod.id}
      className="grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-3 border-b border-rule py-4 sm:grid-cols-[4.5rem_1fr_auto]"
    >
      <Link href={`/products/${prod.slug}`} tabIndex={-1} aria-hidden="true">
        <Figure src={prod.image} alt="" ratio="1/1" />
      </Link>
      <div className="min-w-0">
        <Link href={`/products/${prod.slug}`} className="group flex min-h-[44px] items-center">
          <span className="font-display text-lg font-bold leading-snug text-ink">
            <span className="hover-title">{prod.shortName}</span>
          </span>
        </Link>
        <p className="mt-0.5 text-sm leading-snug text-ink-muted">Best for {prod.bestFor}</p>
        <div className="mt-1.5">
          <EditorScore score={prod.scores.overall} size="xs" />
        </div>
        <BrandPromotionNote promotion={prod.brandPromotion} className="mt-1.5" />
      </div>
      <AffiliateButton
        productId={prod.id}
        productName={prod.name}
        asin={prod.asin}
        amazonUrl={prod.amazonUrl}
        contentSlug={article.slug}
        placement={placement}
        variant="compact"
        label="Check price on Amazon"
        className="col-span-2 min-h-[44px] sm:col-span-1"
      />
    </li>
  );

  const guideLinkRow = (g: (typeof store.articles)[number]) => (
    <li key={g.id}>
      <Link href={articleHref(g)} className="group grid grid-cols-[4.5rem_1fr] gap-4 border-b border-rule py-4">
        <Figure src={g.heroImage} alt="" ratio="1/1" />
        <span className="min-w-0">
          <span className="kicker text-ink-muted">{articleMeta(g)}</span>
          <span className="mt-1 block font-display text-lg font-bold leading-snug text-ink">
            <span className="hover-title">{g.title}</span>
          </span>
        </span>
      </Link>
    </li>
  );

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
            <h1 className="mt-4 font-display text-[2.375rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[3.25rem] lg:text-[3.75rem]">
              {article.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-secondary">{article.subtitle}</p>
            <div className="mt-6 space-y-3">
              <Byline
                author={author}
                updatedAt={article.updatedAt}
                publishedAt={article.publishedAt}
                reviewer={reviewer && article.reviewedBy ? { author: reviewer, reviewedAt: article.reviewedBy.reviewedAt } : undefined}
              />
              <EvidenceLabel status={article.evidenceStatus} />
            </div>
          </div>
          {/* Phones get the answer first; the same photo follows the answer below (one download). */}
          <div className="hidden lg:col-span-5 lg:block">
            <Figure
              className="[&>div]:rounded-3xl"
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
                    <span className="mt-[0.6em] h-1.5 w-1.5 bg-coral" aria-hidden="true" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Callout>
          )}
        </div>

        <Figure
          className="mt-6 lg:hidden [&>div]:rounded-3xl"
          src={article.heroImage}
          alt={article.heroImageAlt}
          ratio="4/3"
          sizes="100vw"
        />

        {/* Mobile: collapsible step index */}
        {hasIndex && (
          <details className="group mt-8 border-y border-rule-strong lg:hidden">
            <summary className="flex min-h-[48px] items-center justify-between gap-4 py-3">
              <span className="kicker text-ink">{steps.length > 0 ? 'Jump to a step' : 'Jump to a section'}</span>
              <ChevronDown className="details-icon h-5 w-5 text-ink-muted transition-transform duration-200" aria-hidden="true" />
            </summary>
            <nav aria-label={steps.length > 0 ? 'Guide steps' : 'Guide sections'} className="pb-3">
              <StepIndex
                steps={steps}
                sections={sections}
                hasTable={Boolean(table)}
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
                  sections={sections}
                  hasTable={Boolean(table)}
                  hasSupplies={supplies.length > 0}
                  hasFixes={fixes.length > 0}
                  hasFaq={article.faqs.length > 0}
                />
              </nav>
            </aside>
          )}

          <div className={`min-w-0 ${hasIndex ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
            <div className="max-w-3xl space-y-14">
              {/* Optional summary table */}
              {table && (
                <section aria-labelledby="glance-heading" id="at-a-glance" className="scroll-mt-24">
                  <SectionHead id="glance-heading" title="At a glance" />
                  <div className="table-scroll mt-5 border border-rule">
                    <table className="w-full min-w-[36rem] border-collapse text-left text-[14px]">
                      <caption className="sr-only">{table.caption}</caption>
                      <thead>
                        <tr className="border-b border-rule-strong bg-paper-warm">
                          {table.columns.map((col, i) => (
                            <th
                              key={col}
                              scope="col"
                              className={`kicker px-4 py-3 text-ink ${i === 0 ? 'sticky left-0 z-10 bg-paper-warm' : ''}`}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rule">
                        {table.rows.map((row) => (
                          <tr key={row.join('|')}>
                            {row.map((cell, i) =>
                              i === 0 ? (
                                <th
                                  key={i}
                                  scope="row"
                                  className="sticky left-0 z-10 min-w-[8rem] border-r border-rule bg-paper-card px-4 py-3 align-top font-semibold text-ink"
                                >
                                  {cell}
                                </th>
                              ) : (
                                <td key={i} className="px-4 py-3 align-top leading-relaxed text-ink-secondary">
                                  {cell}
                                </td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Optional topic sections that lead into the method */}
              {sections.filter((sec) => sec.placement !== 'afterSteps').map(renderSection)}

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
                          className="font-display text-[2.5rem] font-bold leading-none tracking-[-0.02em] text-coral-deep sm:text-[3.25rem]"
                          aria-hidden="true"
                        >
                          {pad(step.stepNumber)}
                        </span>
                        <div className="min-w-0">
                          <Kicker className="mb-1">
                            Step {step.stepNumber} of {steps.length}
                          </Kicker>
                          <h3 className="font-display text-2xl font-bold leading-snug text-ink">{step.title}</h3>
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
                        <span className="kicker pt-1 text-coral-deep">{String.fromCharCode(65 + i)}</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Sections that follow the method, e.g. related questions merged in from retired guides */}
              {sections.filter((sec) => sec.placement === 'afterSteps').map(renderSection)}

              {/* Tools, only after the method */}
              {toolProducts.length > 0 && (
                <section aria-labelledby="tools-heading">
                  <SectionHead
                    id="tools-heading"
                    title="Tools that help"
                    description="You can do this with cloths and a spray bottle. These make it faster:"
                  />
                  <AffiliateDisclosureNote className="mt-3" />
                  <ul className="mt-4 border-t border-rule">
                    {toolProducts.map((prod) => productRow(prod, 'guide_recommended_tool'))}
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
                {comparisonsHere.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {comparisonsHere.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/compare/${c.slug}`}
                          className="group inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-coral-deep"
                        >
                          <span className="hover-title">
                            Choosing a machine? {productName(c.productAId)} vs {productName(c.productBId)}
                          </span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {seeAlso.length > 0 && (
                  <div className="mt-4">
                    <Kicker as="p" tone="ink" className="mb-2">
                      See also
                    </Kicker>
                    <ul className="border-t border-rule">{seeAlso.map(guideLinkRow)}</ul>
                  </div>
                )}
                {relatedRest.length > 0 ? (
                  <ul className="mt-4 border-t border-rule">{relatedRest.map(guideLinkRow)}</ul>
                ) : (
                  <Link
                    href={`/rooms/${article.roomSlug}`}
                    className="group mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] font-semibold text-coral-deep"
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
