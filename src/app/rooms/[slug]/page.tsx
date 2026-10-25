import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { TOOL_LINKS } from '@/lib/navigation';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from '@/lib/schema';
import { RoomPageClient, type RoomArticleRow, type RoomTopic } from '@/components/RoomSubFilterClient';
import { AffiliateButton, AffiliateDisclosureNote, EditorScore } from '@/components/ui/Badges';
import {
  Breadcrumbs,
  ButtonLink,
  Container,
  Figure,
  Kicker,
  SectionHead,
  articleHref,
  articleMeta,
} from '@/components/field';

// ISR: pre-rendered, refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore().rooms.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = readStore();
  const room = store.rooms.find((r) => r.slug === params.slug);
  if (!room) return { title: 'Room Guide Not Found' };

  const hasContent =
    store.articles.some((a) => a.roomSlug === room.slug) || store.products.some((p) => p.roomSlugs.includes(room.slug));

  return buildMetadata({
    title: `${room.name}: Guides, Products & Tips`,
    description: fitDescription(room.description || room.tagline, 'Step-by-step guides, product picks and expert tips.'),
    path: `/rooms/${room.slug}`,
    ogKicker: 'Room guide',
    // Sections without their own content are placeholders: keep them out of the index until filled.
    noindex: !hasContent,
  });
}

const RELATED_TOOL_HREFS = ['/tools/stain-finder', '/tools/surface-checker'];

export default function RoomCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const room = store.rooms.find((r) => r.slug === params.slug);
  if (!room) {
    notFound();
  }

  // Only this room's own content: no padding with unrelated articles or products.
  const roomArticles = store.articles.filter((a) => a.roomSlug === room.slug && a.status === 'Published');
  const fixGuides = roomArticles.filter((a) => a.routeType !== 'best');
  const startHere = fixGuides[0] || roomArticles[0];

  const roomProducts = store.products
    .filter((p) => p.roomSlugs.includes(room.slug))
    .sort((a, b) => {
      const rank = (id: string) => {
        const i = room.featuredProductIds.indexOf(id);
        return i === -1 ? Number.MAX_SAFE_INTEGER : i;
      };
      return rank(a.id) - rank(b.id);
    });

  const surfaceSlugs = new Set(roomArticles.flatMap((a) => a.surfaceSlugs));
  const productIds = new Set(roomProducts.map((p) => p.id));
  let surfaces = store.surfaces.filter((s) => surfaceSlugs.has(s.slug));
  if (!surfaces.length) surfaces = store.surfaces.filter((s) => s.recommendedProductIds.some((id) => productIds.has(id)));

  const tools = TOOL_LINKS.filter((t) => RELATED_TOOL_HREFS.includes(t.href));

  const allTopics = room.subCategories.filter((s) => s.id !== 'all');
  const topics: RoomTopic[] = allTopics
    .map((s) => ({ id: s.id, label: s.label, count: roomArticles.filter((a) => a.subCategory === s.id).length }))
    .filter((t) => t.count > 0);
  const plannedTopics = allTopics.filter((s) => !topics.some((t) => t.id === s.id));

  const rows: RoomArticleRow[] = roomArticles.map((a) => ({
    id: a.id,
    href: articleHref(a),
    title: a.title,
    excerpt: a.excerpt,
    meta: articleMeta(a),
    topic: a.subCategory,
    kind: a.routeType === 'best' ? 'buy' : 'fix',
    image: a.heroImage,
  }));

  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: room.name, path: `/rooms/${room.slug}` },
    ]),
    webPageSchema({
      path: `/rooms/${room.slug}`,
      name: room.name,
      description: room.description || room.tagline,
      type: 'CollectionPage',
      about: room.name,
    }),
    itemListSchema(
      `${room.name} guides`,
      roomArticles.map((a) => ({ name: a.title, path: articleHref(a) })),
    ),
  );

  let section = 0;
  const nextIndex = () => String(++section).padStart(2, '0');

  return (
    <div className="pb-16">
      <JsonLd data={schema} />

      {/* Compact header: what this room covers, then a slim image strip instead of a full-bleed hero. */}
      <header>
        <Container className="pt-6 sm:pt-8">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: room.name }]} />
          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Kicker tone="accent">Room guide</Kicker>
              <h1 className="mt-3 font-serif text-[2.5rem] font-medium leading-[1.04] tracking-[-0.025em] text-ink sm:text-[3.5rem]">
                {room.name}
              </h1>
            </div>
            <div className="lg:col-span-5">
              <p className="max-w-prose text-[1.0625rem] leading-relaxed text-ink-secondary">{room.description || room.tagline}</p>
              <p className="kicker mt-3 text-ink-muted">
                {roomArticles.length > 0
                  ? `${roomArticles.length} ${roomArticles.length === 1 ? 'guide' : 'guides'}`
                  : 'Guides in progress'}
                {roomProducts.length > 0 && ` · ${roomProducts.length} ${roomProducts.length === 1 ? 'tool' : 'tools'} reviewed`}
              </p>
            </div>
          </div>
          <Figure
            src={room.heroImage}
            alt=""
            ratio="16/3"
            priority
            sizes="(min-width: 1216px) 1216px, 100vw"
            className="mt-8 [&>div]:min-h-[7rem] [&>div]:w-full"
          />
        </Container>
      </header>

      {/* Start here: the most useful guide with its short answer. */}
      {startHere && (
        <section className="pt-12 sm:pt-14" aria-labelledby="start-heading">
          <Container>
            <SectionHead id="start-heading" index={nextIndex()} title="Start here" />
            <article className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-10">
              <Link href={articleHref(startHere)} className="group block lg:col-span-5">
                <Figure src={startHere.heroImage} alt={startHere.heroImageAlt} ratio="16/10" sizes="(min-width: 1024px) 40vw, 100vw" />
              </Link>
              <div className="lg:col-span-7">
                <Kicker>{articleMeta(startHere)}</Kicker>
                <h3 className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[2rem]">
                  <Link href={articleHref(startHere)} className="group">
                    <span className="hover-title">{startHere.title}</span>
                  </Link>
                </h3>
                {startHere.quickAnswer && (
                  <div className="mt-4 border-l-4 border-honey-deep bg-honey-soft px-4 py-3">
                    <p className="kicker mb-1 text-ink">The short answer</p>
                    <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">{startHere.quickAnswer}</p>
                  </div>
                )}
                <ButtonLink href={articleHref(startHere)} variant="secondary" className="mt-5">
                  {startHere.steps?.length ? `See all ${startHere.steps.length} steps` : 'Read the guide'}
                </ButtonLink>
              </div>
            </article>
          </Container>
        </section>
      )}

      {/* All guides, grouped, with topic filter. Every link is in the server HTML. */}
      <section className="pt-12 sm:pt-14" aria-labelledby="guides-heading">
        <Container>
          <SectionHead
            id="guides-heading"
            index={nextIndex()}
            title={`${room.shortName} guides`}
            href="/search"
            linkLabel="Search all guides"
          />
          {rows.length > 0 ? (
            <div className="mt-6">
              <RoomPageClient topics={topics} articles={rows} />
              {plannedTopics.length > 0 && (
                <p className="mt-6 text-sm text-ink-muted">
                  Still to come in this room: {plannedTopics.map((t) => t.label).join(', ')}.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 max-w-prose border-l-4 border-leaf bg-leaf-soft/60 px-5 py-5">
              <p className="font-serif text-xl font-semibold text-ink">We&apos;re still writing guides for this room.</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
                Planned topics: {allTopics.map((t) => t.label).join(', ')}. Until they&apos;re published, search the guides we
                have or use the free tools below.
              </p>
              <ButtonLink href="/search" variant="secondary" className="mt-4">
                Search all guides
              </ButtonLink>
            </div>
          )}
        </Container>
      </section>

      {/* Tools for this room: compact research-based list, no prices. */}
      {roomProducts.length > 0 && (
        <section className="pt-12 sm:pt-14" aria-labelledby="products-heading">
          <Container>
            <SectionHead
              id="products-heading"
              index={nextIndex()}
              title="Tools for this room"
              href="/products"
              linkLabel="All product reviews"
              description={
                <>
                  Research-based picks from specs, manuals and warranty terms; we haven&apos;t tested them hands-on.{' '}
                  <Link href="/methodology" className="link">
                    How we evaluate
                  </Link>
                </>
              }
            />
            <AffiliateDisclosureNote className="mt-4" />
            <ul className="mt-4 divide-y divide-rule border-y border-rule">
              {roomProducts.map((p, idx) => (
                <li key={p.id} className="grid grid-cols-[4rem_1fr] gap-4 py-4 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center">
                  <Link href={`/products/${p.slug}`} className="block aspect-square bg-paper-card p-1" tabIndex={-1} aria-hidden="true">
                    <img src={p.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/products/${p.slug}`} className="group">
                      <span className="font-serif text-lg font-semibold leading-snug text-ink">
                        <span className="hover-title">{p.shortName}</span>
                      </span>
                    </Link>
                    <p className="kicker mt-1 text-ink-muted">Best for · {p.bestFor}</p>
                    <div className="mt-1.5">
                      <EditorScore score={p.scores.overall} size="xs" />
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <AffiliateButton
                      productId={p.id}
                      productName={p.name}
                      asin={p.asin}
                      amazonUrl={p.amazonUrl}
                      contentSlug={room.slug}
                      placement={`room_list_${idx + 1}`}
                      variant="compact"
                      className="!min-h-[44px] w-full sm:w-auto"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Related surfaces and tools side by side. */}
      <section className="pt-12 sm:pt-14">
        <Container className="grid gap-12 lg:grid-cols-12">
          {surfaces.length > 0 && (
            <div className="lg:col-span-7" aria-labelledby="surfaces-heading">
              <SectionHead id="surfaces-heading" index={nextIndex()} title="Surface care guides" />
              <ul className="mt-4 divide-y divide-rule border-b border-rule">
                {surfaces.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/surfaces/${s.slug}`} className="group grid grid-cols-[1fr_auto] items-center gap-4 py-3.5">
                      <span className="min-w-0">
                        <span className="text-[16px] font-semibold text-ink group-hover:text-terracotta-deep">{s.name}</span>
                        <span className="block text-[14px] leading-snug text-ink-muted line-clamp-2">{s.summary}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={surfaces.length > 0 ? 'lg:col-span-5' : 'lg:col-span-7'} aria-labelledby="tools-heading">
            <SectionHead id="tools-heading" index={nextIndex()} title="Free tools" href="/tools" linkLabel="All tools" />
            <ol className="mt-4 divide-y divide-rule border-b border-rule">
              {tools.map((t, i) => (
                <li key={t.href}>
                  <Link href={t.href} className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 py-3.5">
                    <span className="kicker text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="text-[16px] font-semibold text-ink group-hover:text-terracotta-deep">{t.label}</span>
                      <span className="block text-[14px] text-ink-muted">{t.note}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </div>
  );
}
