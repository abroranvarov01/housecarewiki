import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, isoDate, personSchema, webPageSchema } from '@/lib/schema';
import { Breadcrumbs, Container, Kicker, SectionHead, articleHref, articleMeta, formatDate } from '@/components/field';

// ISR: pre-rendered, refreshed hourly and on every CMS publish via revalidatePath.
export const revalidate = 3600;

export function generateStaticParams() {
  return readStore().authors.map((x) => ({ slug: x.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const store = readStore();
  const author = store.authors.find((a) => a.slug === params.slug);
  if (!author) return { title: 'Author Not Found' };
  return buildMetadata({
    title: `${author.name}, ${author.role}`,
    description: fitDescription(author.bio),
    path: `/authors/${author.slug}`,
    type: 'profile',
    ogKicker: 'Author',
  });
}

export default function AuthorProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const store = readStore();
  const author = store.authors.find((a) => a.slug === params.slug);
  if (!author) {
    notFound();
  }

  const authored = store.articles.filter((art) => art.authorSlug === author.slug && art.status === 'Published');
  const groups = [
    { title: 'Fix it guides', items: authored.filter((a) => a.routeType !== 'best') },
    { title: 'Buying guides', items: authored.filter((a) => a.routeType === 'best') },
  ].filter((g) => g.items.length > 0);

  const schema = graph(
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: author.name, path: `/authors/${author.slug}` },
    ]),
    {
      ...webPageSchema({ path: `/authors/${author.slug}`, name: author.name, description: author.bio, type: 'ProfilePage' }),
      mainEntity: personSchema(author),
    },
  );

  return (
    <div className="pb-16">
      <JsonLd data={schema} />

      <header className="border-b border-rule">
        <Container className="py-8 sm:py-12">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: author.name }]} />
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Kicker tone="accent">{author.kind === 'team' ? 'The byline' : 'Author'}</Kicker>
              <h1 className="mt-3 font-serif text-[2.5rem] font-medium leading-[1.04] tracking-[-0.025em] text-ink sm:text-[3.5rem]">
                {author.name}
              </h1>
              <p className="kicker mt-3 text-ink-muted">{author.role}</p>
              <p className="mt-5 max-w-prose text-[1.0625rem] leading-relaxed text-ink-secondary">{author.bio}</p>
            </div>

            {author.credentials.length > 0 && (
              <aside className="lg:col-span-5" aria-labelledby="how-heading">
                <div className="border-t border-rule-strong pt-3">
                  <h2 id="how-heading" className="font-serif text-2xl font-semibold text-ink">
                    How we work
                  </h2>
                  <ol className="mt-3 border-t border-rule">
                    {author.credentials.map((c, i) => (
                      <li key={c} className="grid grid-cols-[2rem_1fr] gap-2 border-b border-rule py-3 text-[15px] leading-relaxed text-ink-secondary">
                        <span className="kicker pt-1 text-terracotta-deep">{String(i + 1).padStart(2, '0')}</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ol>
                  <ul className="mt-4 flex flex-wrap gap-x-6 text-sm font-semibold">
                    <li>
                      <Link href="/methodology" className="link inline-flex min-h-[44px] items-center">
                        How we evaluate products
                      </Link>
                    </li>
                    <li>
                      <Link href="/editorial-policy" className="link inline-flex min-h-[44px] items-center">
                        Editorial policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </aside>
            )}
          </div>
        </Container>
      </header>

      <section className="pt-12 sm:pt-14" aria-labelledby="articles-heading">
        <Container>
          <SectionHead
            id="articles-heading"
            index="01"
            title={`Published by ${author.name}`}
            description={`${authored.length} ${authored.length === 1 ? 'article' : 'articles'} carry this byline.`}
          />
          {groups.length === 0 ? (
            <p className="mt-6 text-[15px] text-ink-muted">Nothing published under this byline yet.</p>
          ) : (
            <div className={`mt-6 grid gap-10 lg:gap-12 ${groups.length > 1 ? 'lg:grid-cols-2' : 'max-w-3xl'}`}>
              {groups.map((g) => (
                <div key={g.title}>
                  <h3 className="border-b border-rule-strong pb-2 font-serif text-xl font-semibold text-ink">{g.title}</h3>
                  <ul className="divide-y divide-rule border-b border-rule">
                    {g.items.map((a) => (
                      <li key={a.id}>
                        <Link href={articleHref(a)} className="group grid grid-cols-[1fr_auto] items-center gap-4 py-4">
                          <span className="min-w-0">
                            <span className="kicker text-ink-muted">{articleMeta(a)}</span>
                            <span className="mt-1 block font-serif text-lg font-semibold leading-snug text-ink">
                              <span className="hover-title">{a.title}</span>
                            </span>
                            <span className="mt-1 block text-[13px] text-ink-muted">
                              Updated <time dateTime={isoDate(a.updatedAt)}>{formatDate(a.updatedAt)}</time>
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-terracotta-deep" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="pt-12 sm:pt-14" aria-labelledby="corrections-heading">
        <Container>
          <div className="max-w-prose border-l-4 border-leaf bg-leaf-soft/60 px-5 py-5">
            <h2 id="corrections-heading" className="font-serif text-xl font-semibold text-ink">
              Spotted a mistake?
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
              Email corrections to{' '}
              <a href={`mailto:${SITE.email}`} className="link">
                {SITE.email}
              </a>
              . We fix verified errors and update the page date when the change is substantive.{' '}
              <Link href="/about" className="link">
                About HouseCareWiki
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
