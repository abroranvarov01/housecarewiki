import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readStore } from '@/lib/store';
import { RoomPageClient } from '@/components/RoomSubFilterClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = readStore();
  const room = store.rooms.find((r) => r.slug === params.slug);
  if (!room) return { title: 'Room Guide Not Found' };

  return {
    title: `${room.name} Guides, Top Products & Tips (2026)`,
    description: room.tagline,
    alternates: {
      canonical: `https://housecarewiki.com/rooms/${room.slug}`,
    },
  };
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

  return (
    <RoomPageClient
      room={room}
      articles={displayArticles}
      products={displayProducts}
      defaultCommunityResults={bathroomRoom?.communityResults || []}
    />
  );
}
