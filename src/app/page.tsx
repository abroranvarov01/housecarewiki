import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Search } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { readStore } from '@/lib/store';
import { TOOL_LINKS } from '@/lib/navigation';
import { EditorScore } from '@/components/ui/Badges';
import { JsonLd } from '@/components/JsonLd';
import { graph, itemListSchema, webPageSchema } from '@/lib/schema';
import {
  ButtonLink,
  Container,
  Figure,
  Kicker,
  SectionHead,
  articleHref,
  articleMeta,
  buttonClasses,
} from '@/components/field';

// ISR: refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

const DESCRIPTION =
  'Practical home cleaning guides, stain fixes and honest reviews of carpet cleaners, scrubbers and organizers. Solve the mess first, then pick the right tool.';

export const metadata: Metadata = buildMetadata({
  title: 'HouseCareWiki: Home Cleaning Guides & Honest Reviews',
  description: DESCRIPTION,
  path: '/',
});

// The messes people arrive with most often, phrased the way they would say them.
const COMMON_MESSES = [
  { label: 'Coffee on the sofa', href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa' },
  { label: 'Dog hair on everything', href: '/guides/how-to-remove-pet-hair-from-furniture' },
  { label: 'Grout that won’t come clean', href: '/guides/how-to-clean-grout-in-bathroom-tiles' },
  { label: 'Mold keeps coming back in the shower', href: '/guides/how-to-prevent-mold-in-your-shower' },
  { label: 'Kitchen cabinets out of control', href: '/guides/how-to-keep-your-kitchen-organized' },
  { label: 'Is vinegar safe on this surface?', href: '/tools/surface-checker' },
];

const STAIN_OPTIONS = [
  ['coffee', 'Coffee or tea'],
  ['pet-urine', 'Pet accident'],
  ['red-wine', 'Red wine or juice'],
  ['grease-oil', 'Grease or oil'],
  ['mud-dirt', 'Mud or dirt'],
  ['ink', 'Ink'],
  ['mold-mildew', 'Mold or mildew'],
] as const;

const SURFACE_OPTIONS = [
  ['fabric-sofa', 'Fabric sofa'],
  ['carpet-rug', 'Carpet or rug'],
  ['mattress', 'Mattress'],
  ['cotton-laundry', 'Clothes or laundry'],
  ['tile-grout', 'Tile and grout'],
  ['hardwood', 'Hardwood floor'],
] as const;

export default function HomePage() {
  const store = readStore();
  const published = store.articles.filter((a) => a.status === 'Published');
  const guides = published.filter((a) => a.routeType === 'guides');
  const buyingGuides = published.filter((a) => a.routeType === 'best');
  const lead = guides.find((g) => g.slug === store.config.featuredGuideSlug) || guides[0];
  const moreGuides = guides.filter((g) => g.slug !== lead?.slug);
  const product = (id?: string) => store.products.find((p) => p.id === id);

  const rooms = store.rooms.map((room) => ({
    room,
    count: published.filter((a) => a.roomSlug === room.slug).length,
  }));

  const schema = graph(
    {
      ...webPageSchema({ path: '/', name: 'HouseCareWiki: Home Cleaning Guides & Honest Reviews', description: DESCRIPTION, type: 'CollectionPage' }),
      mainEntity: itemListSchema(
        'Latest home cleaning guides and buying guides',
        [...guides, ...buyingGuides].map((a) => ({ name: a.title, path: articleHref(a) })),
      ),
    },
  );

  return (
    <div className="pb-8">
      <JsonLd data={schema} />
      {/* 1. Problem-first opener over a warm, lived-in scene: question, search and common messes on the
          cream side of the photo, the "life happens" moment on the other. */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[68%] lg:block" aria-hidden="true">
          <img
            src="/images/hero-dog-coffee.webp"
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover object-[78%_60%]"
          />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-paper via-paper/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper/70 to-transparent" />
        </div>

        <Container className="relative pb-10 pt-8 sm:pb-14 sm:pt-12 lg:flex lg:min-h-[640px] lg:items-center lg:py-16">
          <div className="lg:max-w-[36rem]">
            <Kicker tone="accent">Your home care guide</Kicker>
            <h1 className="mt-3 font-serif text-[2.6rem] font-semibold leading-[1.03] tracking-[-0.02em] text-ink sm:text-6xl lg:text-[4.25rem]">
              What needs <span className="mark italic">fixing</span> today?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-secondary">
              Spills, pet hair, grimy grout, a cabinet that won&apos;t close. Tell us what happened and you&apos;ll get clear
              steps, the mistakes to avoid, and honest notes on which tools are worth buying.
            </p>

            <form action="/search" method="GET" role="search" className="mt-8 max-w-xl">
              <label htmlFor="home-search" className="mb-2 block text-[15px] font-semibold text-ink">
                What&apos;s going on at home?
              </label>
              <div className="flex rounded-full border border-ink-muted bg-paper-card p-1 shadow-card focus-within:border-ink">
                <Search className="ml-3 mt-3 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
                <input
                  id="home-search"
                  type="search"
                  name="q"
                  placeholder="e.g. coffee on carpet"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:outline-none"
                />
                <button
                  type="submit"
                  className="min-h-[44px] rounded-full bg-ink px-5 text-[15px] font-semibold text-paper-light transition-colors hover:bg-ink-deep sm:px-6"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-7">
              <p className="mb-3 text-[15px] text-ink-secondary">Or start with one of these:</p>
              <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:max-w-xl sm:flex-wrap sm:overflow-visible sm:px-0">
                {COMMON_MESSES.map((m) => (
                  <li key={m.href} className="shrink-0">
                    <Link
                      href={m.href}
                      className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-rule-strong bg-paper-card/90 px-4 text-[15px] text-ink transition-colors hover:border-terracotta hover:bg-terracotta-soft"
                    >
                      {m.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Handwritten aside: desktop only, sits on the wall in the photo. */}
          <p
            className="pointer-events-none absolute right-[30%] top-16 hidden -rotate-6 font-hand text-[2rem] leading-tight text-ink xl:block"
            aria-hidden="true"
          >
            Life happens.
            <br />
            <span className="pl-8">We&apos;ll help.</span>
            <svg viewBox="0 0 60 40" className="ml-14 mt-1 h-9 w-14 text-ink" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 4c2 16 14 28 46 30" />
              <path d="M42 26l9 8-11 3" />
            </svg>
          </p>
        </Container>

        {/* Mobile and tablet: the same scene as a rounded photo under the search. */}
        <Container className="pb-4 lg:hidden">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-deep sm:aspect-[16/9]">
            <img
              src="/images/hero-dog-coffee.webp"
              alt="A golden retriever lying on a cream carpet next to a tipped-over coffee mug and a fresh spill"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[80%_center]"
            />
          </div>
        </Container>
      </section>

      {/* 2. Browse by room: photo cards right under the hero, a swipeable row on phones. */}
      <section className="pb-4 pt-8 sm:pt-10" aria-labelledby="rooms-heading">
        <Container>
          <h2 id="rooms-heading" className="font-serif text-2xl font-semibold text-ink sm:text-[1.75rem]">
            Where&apos;s the mess?
          </h2>
          <ul className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
            {rooms.map(({ room, count }) => (
              <li key={room.slug} className="w-[42%] shrink-0 snap-start sm:w-auto">
                <Link
                  href={`/rooms/${room.slug}`}
                  className="group block h-full overflow-hidden rounded-2xl border border-rule bg-paper-card shadow-card transition-shadow hover:shadow-elevated"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-paper-deep">
                    <img
                      src={room.cardImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-2 p-3.5">
                    <span>
                      <span className="block font-serif text-[1.0625rem] font-semibold leading-tight text-ink">{room.name}</span>
                      <span className="mt-1 block text-[13px] text-ink-muted">
                        {count > 0 ? `${count} ${count === 1 ? 'guide' : 'guides'}` : 'Coming soon'}
                      </span>
                    </span>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3. Popular fixes: the lead guide as a warm photo card with its answer, then the other guides with photos. */}
      {lead && (
        <section className="py-12 sm:py-16" aria-labelledby="fix-heading">
          <Container>
            <SectionHead id="fix-heading" title="Popular fixes" href="/search" linkLabel="All guides" />

            <article className="mt-8 grid overflow-hidden rounded-3xl border border-rule bg-paper-warm/70 lg:grid-cols-12">
              <div className="p-6 sm:p-10 lg:col-span-6">
                <Kicker tone="accent">Featured guide · {articleMeta(lead)}</Kicker>
                <h3 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[2.5rem]">
                  <Link href={articleHref(lead)} className="group">
                    <span className="hover-title">{lead.title}</span>
                  </Link>
                </h3>
                <div className="mt-6 rounded-xl border-l-4 border-honey-deep bg-paper-card px-5 py-4">
                  <p className="kicker mb-1 text-ink">Here&apos;s what to do</p>
                  <p className="text-base leading-relaxed text-ink-secondary">{lead.quickAnswer}</p>
                </div>
                <ButtonLink href={articleHref(lead)} variant="primary" className="mt-6">
                  {lead.steps?.length ? `See all ${lead.steps.length} steps` : 'Read the guide'}
                </ButtonLink>
              </div>
              <div className="relative min-h-[16rem] lg:col-span-6 lg:min-h-full">
                <img
                  src="/images/featured-coffee-sofa.webp"
                  alt="Hand blotting a coffee stain on a beige fabric sofa cushion with a folded white cloth, a bowl of water beside it"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-paper-warm/70 to-transparent lg:block" aria-hidden="true" />
              </div>
            </article>

            <h3 className="mt-12 font-serif text-xl font-semibold text-ink">More helpful guides</h3>
            <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {moreGuides.map((g) => (
                <li key={g.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
                  <Link href={articleHref(g)} className="group block">
                    <Figure src={g.heroImage} alt="" ratio="4/3" className="[&>div]:rounded-2xl" />
                    <span className="mt-3 block kicker text-ink-muted">{articleMeta(g)}</span>
                    <span className="mt-1 block font-serif text-xl font-semibold leading-snug text-ink">
                      <span className="hover-title">{g.title}</span>
                    </span>
                    <span className="mt-1 block text-[15px] leading-snug text-ink-muted line-clamp-2">{g.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 4. Tool, not a banner: a working two-question stain finder in a warm inset panel. */}
      <section aria-labelledby="finder-heading">
        <Container>
          <div className="grid gap-8 rounded-3xl bg-paper-warm px-5 py-8 sm:px-10 sm:py-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <Kicker tone="accent">Stain Solution Finder</Kicker>
              <h2 id="finder-heading" className="mt-2 font-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Spilled something? Let&apos;s sort it out.
              </h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-ink-secondary">
                Coffee on a sofa needs a different method than coffee on grout. Answer two questions and you&apos;ll get the right
                supplies, steps and warnings.
              </p>
            </div>
            <form action="/tools/stain-finder" method="GET" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] lg:col-span-7">
              <label className="block">
                <span className="mb-2 block text-[15px] font-semibold text-ink">What spilled?</span>
                <select
                  name="stain"
                  defaultValue="coffee"
                  className="h-12 w-full rounded-lg border border-ink-muted bg-paper-card px-3 text-base text-ink focus:border-ink"
                >
                  {STAIN_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[15px] font-semibold text-ink">On what?</span>
                <select
                  name="surface"
                  defaultValue="fabric-sofa"
                  className="h-12 w-full rounded-lg border border-ink-muted bg-paper-card px-3 text-base text-ink focus:border-ink"
                >
                  {SURFACE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={`${buttonClasses('honey')} h-12 self-end`}>
                Show me how <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </Container>
      </section>

      {/* 5. Before you buy: buying guides with their top pick, then head-to-head comparisons. */}
      <section className="py-12 sm:py-16" aria-labelledby="buy-heading">
        <Container>
          <SectionHead
            id="buy-heading"
            title="Before you buy"
            href="/products"
            linkLabel="All product reviews"
            description={
              <>
                We compare products on specifications, manuals, included tools and running costs. We haven&apos;t lab-tested them,
                and each review says so.{' '}
                <Link href="/methodology" className="link">
                  How we evaluate
                </Link>
              </>
            }
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-5">
            {buyingGuides.map((g) => {
              const pick = product(g.topPickProductId || g.recommendedProductIds[0]);
              return (
                <Link
                  key={g.id}
                  href={articleHref(g)}
                  className="group flex flex-col rounded-2xl border border-rule bg-paper-card p-5 transition-colors hover:border-rule-strong sm:p-6"
                >
                  <Kicker>Buying guide · {g.recommendedProductIds.length} picks</Kicker>
                  <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight text-ink">
                    <span className="hover-title">{g.title}</span>
                  </h3>
                  {pick && (
                    <div className="mt-auto flex items-center gap-4 pt-6">
                      <div className="h-20 w-20 shrink-0 rounded-lg bg-white p-1.5">
                        <img src={pick.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="kicker text-terracotta-deep">Our top pick</p>
                        <p className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{pick.shortName}</p>
                        <div className="mt-1.5">
                          <EditorScore score={pick.scores.overall} size="xs" />
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {store.comparisons.length > 0 && (
            <div className="mt-10">
              <h3 className="mb-3 font-serif text-xl font-semibold text-ink">Deciding between two?</h3>
              <ul className="grid gap-4 md:grid-cols-2">
                {store.comparisons.map((c) => {
                  const a = product(c.productAId);
                  const b = product(c.productBId);
                  if (!a || !b) return null;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={`/compare/${c.slug}`}
                        className="group grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-rule bg-paper-card p-4 transition-colors hover:border-rule-strong"
                      >
                        <span className="text-right font-serif text-lg font-semibold leading-tight text-ink">{a.shortName}</span>
                        <span className="rounded-full bg-honey px-2.5 py-1 text-[13px] font-semibold text-ink">vs</span>
                        <span className="font-serif text-lg font-semibold leading-tight text-ink">{b.shortName}</span>
                        <span className="col-span-3 mt-1 text-center text-[14px] text-ink-muted group-hover:text-terracotta-deep">
                          {c.category} · which one fits your home
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Container>
      </section>

      {/* 6. Toolbox + how we work, side by side. */}
      <section className="py-12 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7" aria-labelledby="tools-heading">
            <SectionHead id="tools-heading" title="Free tools" href="/tools" linkLabel="All tools" />
            <ul className="mt-5 divide-y divide-rule">
              {TOOL_LINKS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="group grid grid-cols-[1fr_auto] items-center gap-3 py-3.5">
                    <span>
                      <span className="text-[17px] font-semibold text-ink group-hover:text-terracotta-deep">{t.label}</span>
                      <span className="block text-[15px] text-ink-muted">{t.note}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:col-span-5" aria-labelledby="how-heading">
            <div className="rounded-2xl border border-rule bg-paper-card p-6 shadow-card sm:p-8">
              <Kicker tone="accent">How we work</Kicker>
              <h2 id="how-heading" className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight text-ink">
                We tell you what a recommendation is based on.
              </h2>
              <dl className="mt-6 space-y-5">
                {[
                  ['Research, labeled as research', 'Our product reviews come from specs, manuals and published standards. We say when we have not tested something ourselves.'],
                  ['Sources on the page', 'Guides cite the care standards and manufacturer instructions behind each method.'],
                  ['Affiliate links, disclosed', 'Amazon pays us a commission on some links. Brands can’t buy placement or a better rating.'],
                ].map(([term, desc]) => (
                  <div key={term} className="grid grid-cols-[0.75rem_1fr] gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-terracotta" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold text-ink">{term}</dt>
                      <dd className="mt-0.5 text-[15px] leading-relaxed text-ink-secondary">{desc}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <Link href="/about" className="link mt-6 inline-flex min-h-[44px] items-center text-[15px] font-semibold">
                About HouseCareWiki
              </Link>
            </div>
          </aside>
        </Container>
      </section>
    </div>
  );
}
