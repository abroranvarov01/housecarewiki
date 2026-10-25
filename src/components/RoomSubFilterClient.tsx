'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShowerHead,
  Grid,
  Droplets,
  Maximize2,
  ShieldAlert,
  Wrench,
  Layers,
  Box,
  Cpu,
} from 'lucide-react';
import { Article, Product, RoomCategory } from '@/lib/types';
import { AffiliateDisclosureNote, PriceNote,
  EditorScore,
  HandwrittenNote,
  AffiliateButton,
} from '@/components/ui/Badges';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  ShowerHead,
  Grid,
  Droplets,
  Maximize2,
  ShieldAlert,
  Wrench,
  Layers,
  Box,
  Cpu,
};

export function RoomPageClient({
  room,
  articles,
  products,
  defaultCommunityResults,
}: {
  room: RoomCategory;
  articles: Article[];
  products: Product[];
  defaultCommunityResults: RoomCategory['communityResults'];
}) {
  const [activeSub, setActiveSub] = useState<string>('all');

  const filteredArticles =
    activeSub === 'all'
      ? articles
      : articles.filter((a) => a.subCategory === activeSub);

  const displayArticles = filteredArticles.length > 0 ? filteredArticles : articles;

  const communityList =
    room.communityResults.length > 0 ? room.communityResults : defaultCommunityResults;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <nav aria-label="Breadcrumb" className="pt-4 text-xs text-[#6E756F]">
        <Link href="/" className="hover:text-[#1F4D3A]">
          Home
        </Link>{' '}
        › <span className="text-[#1F2421] font-medium">{room.name}</span>
      </nav>

      {/* 1. HERO BANNER (Matches Screen 2 "Bathroom Cleaning") */}
      <div className="mt-3 rounded-2xl overflow-hidden relative shadow-card border border-[#E2DACB] h-52 sm:h-60 md:h-64">
        <img
          src={room.heroImage}
          fetchPriority="high"
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        <div className="absolute inset-0 p-6 sm:p-10 md:p-12 flex flex-col justify-center max-w-xl text-white">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight leading-tight">
            {room.name}
          </h1>
          <p className="text-sm sm:text-[15px] text-white/95 mt-2.5 leading-relaxed max-w-md">
            {room.tagline}
          </p>
        </div>
      </div>

      {/* 2. SUB-CATEGORY ICON FILTER BAR (All, Showers & Tubs, Tile & Grout, Toilets, Mirrors & Glass, Mold & Mildew, Tools) */}
      <div className="mt-4 bg-[#FBF9F5] rounded-xl border border-[#E4DDD0] shadow-card px-3 py-2.5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max gap-2 sm:gap-4">
          {room.subCategories.map((sub) => {
            const IconComponent = ICON_MAP[sub.icon] || Sparkles;
            const isSelected = activeSub === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveSub(sub.id)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition min-w-[90px] ${
                  isSelected
                    ? 'bg-[#E2ECE5] text-[#1F4D3A] font-bold border-b-2 border-[#1F4D3A]'
                    : 'text-[#4A504C] hover:bg-[#EFE9DC]/60 hover:text-[#1F2421] font-medium'
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 mb-1 ${
                    isSelected ? 'text-[#1F4D3A] stroke-[2.2]' : 'text-[#2E6B4E]'
                  }`}
                />
                <span className="text-[11.5px] whitespace-nowrap">{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. POPULAR GUIDES IN THIS ROOM (Matches Screen 2 "Popular bathroom guides") */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-editorial text-2xl sm:text-[26px] font-bold text-[#1F2421]">
            Popular {room.shortName.toLowerCase().replace(' cleaning', '')} guides
          </h2>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-semibold text-[#3F4641] hover:text-[#1F4D3A] inline-flex items-center gap-1"
          >
            <span>View all</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {displayArticles.slice(0, 3).map((art) => {
            const href =
              art.routeType === 'best' ? `/best/${art.slug}` : `/guides/${art.slug}`;
            const isBuyingGuide = art.categoryLabel === 'BUYING GUIDE';
            const isTips = art.categoryLabel === 'TIPS & TRICKS';

            return (
              <Link
                key={art.id}
                href={href}
                className="group bg-white rounded-xl overflow-hidden border border-[#E4DDD0] shadow-card hover:shadow-elevated transition flex flex-col"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#EFE9DC]">
                  <img
                    src={art.heroImage}
                    loading="lazy"
                    decoding="async"
                    alt={art.heroImageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                        isBuyingGuide
                          ? 'text-[#2E6B4E]'
                          : isTips
                          ? 'text-[#8C6D46]'
                          : 'text-[#2E6B4E]'
                      }`}
                    >
                      {art.categoryLabel}
                    </span>
                    <h3 className="font-editorial text-lg sm:text-[19px] font-bold text-[#1F2421] mt-1 leading-snug group-hover:text-[#1F4D3A]">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#5C645E] mt-1.5 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. TOP RECOMMENDED PRODUCTS (Matches Screen 2 4-product Amazon grid on pure white studio cards) */}
        <AffiliateDisclosureNote className="mb-4" />
      <section className="mt-9">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-editorial text-2xl sm:text-[26px] font-bold text-[#1F2421]">
            Top recommended products
          </h2>
          <Link
            href="/compare"
            className="text-xs sm:text-sm font-semibold text-[#3F4641] hover:text-[#1F4D3A] inline-flex items-center gap-1"
          >
            <span>View comparison</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((prod, idx) => {
            const isPrimaryBadge = idx === 0;
            return (
              <div
                key={prod.id}
                className="bg-white rounded-xl border border-[#E4DDD0] p-4 shadow-card hover:shadow-elevated transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Pill Badge */}
                  <div className="mb-2">
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md ${
                        isPrimaryBadge
                          ? 'bg-[#1F4D3A] text-white'
                          : 'bg-[#E9EFEA] text-[#2B3B32]'
                      }`}
                    >
                      {prod.badge || `Best for ${prod.bestFor}`}
                    </span>
                  </div>

                  {/* Pure White Studio Product Cutout */}
                  <Link
                    href={`/products/${prod.slug}`}
                    className="block aspect-square rounded-lg overflow-hidden bg-white mb-3 p-2 flex items-center justify-center"
                  >
                    <img
                      src={prod.image}
                      loading="lazy"
                      decoding="async"
                      alt={prod.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                    />
                  </Link>

                  {/* Product Title */}
                  <Link
                    href={`/products/${prod.slug}`}
                    className="font-sans font-bold text-[13.5px] text-[#1F2421] hover:text-[#1F4D3A] line-clamp-2 leading-snug"
                  >
                    {prod.name}
                  </Link>

                  {/* Star Rating */}
                  <div className="mt-1.5">
                    <EditorScore score={prod.scores.overall}
                      size="xs" />
                  </div>
                </div>

                {/* Price + Prime Badge + View on Amazon Button */}
                <div className="mt-3 pt-2.5">
                  <div className="flex items-baseline gap-1 mb-3">
                    <PriceNote />
                  </div>

                  <AffiliateButton
                    productId={prod.id}
                    productName={prod.name}
                    asin={prod.asin}
                    amazonUrl={prod.amazonUrl}
                    contentSlug={room.slug}
                    placement={`room_card_${idx + 1}`}
                    variant="forest"
                    label="Check price on Amazon"
                    className="w-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. REAL HOMES. REAL RESULTS. (Matches Screen 2 Before/After Verified Buyer Section) */}
      <section className="mt-10 bg-[#F2ECE1] rounded-2xl p-6 sm:p-7 border border-[#E2DACB] relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-5 gap-3 relative">
          <div>
            <h2 className="font-editorial text-2xl sm:text-[26px] font-bold text-[#1F2421]">
              Real homes. Real results.
            </h2>
            <p className="text-xs sm:text-sm text-[#4A504C] mt-0.5">
              See how people are solving their cleaning challenges.
            </p>
          </div>

          {/* Handwritten Note floating in header pointing down to the cards */}
          <div className="hidden md:block absolute right-44 -top-2 z-10">
            <HandwrittenNote
              text={"Real results\nfrom real people"}
              arrowDirection="down"
            />
          </div>

          <Link
            href="/methodology"
            className="text-xs sm:text-sm font-semibold text-[#3F4641] hover:text-[#1F4D3A] inline-flex items-center gap-1 mt-1"
          >
            <span>From our community</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {communityList.map((item) => {
            const isSameSplitImage = item.beforeImage === item.afterImage;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden border border-[#E4DDD0] shadow-card flex flex-col justify-between"
              >
                {/* Before / After Image Container */}
                {isSameSplitImage ? (
                  <div className="aspect-[16/10] relative overflow-hidden bg-[#EFE9DC]">
                    <img
                      src={item.beforeImage}
                      loading="lazy"
                      decoding="async"
                      alt={`Before and after cleaning ${item.surfaceLabel}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-y-0 left-1/2 w-[1.5px] bg-white/80" />
                    <span className="absolute bottom-2 left-2.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      Before
                    </span>
                    <span className="absolute bottom-2 right-2.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      After
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-[1.5px] bg-white aspect-[16/10] relative overflow-hidden">
                    <div className="relative h-full overflow-hidden">
                      <img
                        src={item.beforeImage}
                        loading="lazy"
                        decoding="async"
                        alt={`Before cleaning ${item.surfaceLabel}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        Before
                      </span>
                    </div>
                    <div className="relative h-full overflow-hidden">
                      <img
                        src={item.afterImage}
                        loading="lazy"
                        decoding="async"
                        alt={`After cleaning ${item.surfaceLabel}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        After
                      </span>
                    </div>
                  </div>
                )}

                {/* Quote & Verified Buyer Footer */}
                <div className="p-4 space-y-3">
                  <p className="font-editorial font-bold text-[15px] text-[#1F2421] leading-snug">
                    {item.quote}
                  </p>
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.avatar}
                      loading="lazy"
                      decoding="async"
                      alt={item.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-[#E2DACB]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1F2421]">{item.authorName}</p>
                      <p className="text-[11px] text-[#6E756F]">{item.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
