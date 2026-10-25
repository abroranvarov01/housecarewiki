import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readStore } from '@/lib/store';
import { buildMetadata, fitDescription } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, graph, itemListSchema, webPageSchema } from '@/lib/schema';
import { RoomPageClient } from '@/components/RoomSubFilterClient';

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

  const roomArticles = store.articles.filter((a) => a.roomSlug === room.slug);
  const displayArticles =
    roomArticles.length >= 3
      ? roomArticles
      : [...roomArticles, ...store.articles.filter((a) => a.roomSlug !== room.slug)].slice(0, 3);

  const featuredProducts = room.featuredProductIds
    .map((id) => store.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const displayProducts =
    featuredProducts.length >= 4
      ? featuredProducts
      : [
          ...featuredProducts,
          ...store.products.filter((p) => !room.featuredProductIds.includes(p.id)),
        ].slice(0, 4);

  const bathroomRoom = store.rooms.find((r) => r.slug === 'bathroom-cleaning');

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
      roomArticles.map((a) => ({ name: a.title, path: `/${a.routeType}/${a.slug}` })),
    ),
  );

  return (
    <>
    <JsonLd data={schema} />
    <RoomPageClient
      room={room}
      articles={displayArticles}
      products={displayProducts}
      defaultCommunityResults={bathroomRoom?.communityResults || []}
    />
    </>
  );
}
