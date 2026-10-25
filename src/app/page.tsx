import React from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { HandwrittenNote } from '@/components/ui/Badges';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'HouseCareWiki: Home Cleaning Guides & Honest Reviews',
  description:
    'Practical home cleaning guides, stain fixes and honest reviews of carpet cleaners, scrubbers and organizers. Solve the mess first, then pick the right tool.',
  path: '/',
});

const POPULAR_SEARCH_TAGS = [
  { label: 'coffee stain', href: '/guides/how-to-remove-coffee-stains-from-fabric-sofa' },
  { label: 'pet hair', href: '/guides/how-to-remove-pet-hair-from-furniture' },
  { label: 'grout cleaning', href: '/guides/how-to-clean-grout-in-bathroom-tiles' },
  { label: 'carpet cleaner', href: '/best/best-portable-carpet-cleaners-home-use-2026' },
  { label: 'under sink organizer', href: '/products/two-tier-sliding-under-sink-organizer' },
];

const HOME_ROOM_CARDS = [
  {
    name: 'Bathroom\nCleaning',
    slug: 'bathroom-cleaning',
    image: '/images/cat-bathroom.webp',
  },
  {
    name: 'Kitchen\nCleaning',
    slug: 'kitchen-cleaning',
    image: '/images/cat-kitchen.webp',
  },
  {
    name: 'Floor & Carpet\nCare',
    slug: 'floor-carpet-care',
    image: '/images/cat-floor-carpet.webp',
  },
  {
    name: 'Laundry\nCare',
    slug: 'laundry-care',
    image: '/images/cat-laundry.webp',
  },
  {
    name: 'Pet Hair\nRemoval',
    slug: 'pet-hair-removal',
    image: '/images/cat-pet-hair.webp',
  },
  {
    name: 'Home\nOrganization',
    slug: 'home-organization',
    image: '/images/cat-organization.webp',
  },
];

const POPULAR_RIGHT_NOW_CARDS = [
  {
    categoryLabel: 'CLEANING GUIDE',
    badgeColor: 'text-[#2E6B4E]',
    title: 'The best grout cleaners for bathroom tiles in 2026',
    excerpt: 'Tested methods, top products and how to use them.',
    href: '/best/best-grout-cleaners-bathroom-tiles-2026',
    image: '/images/guide-grout-brush.webp',
  },
  {
    categoryLabel: 'BUYING GUIDE',
    badgeColor: 'text-[#D97245]',
    title: 'Best portable carpet cleaners for home use',
    excerpt: 'Compare top models, key features and what to look for.',
    href: '/best/best-portable-carpet-cleaners-home-use-2026',
    image: '/images/hero-carpet-cleaner.webp',
  },
  {
    categoryLabel: 'PRACTICAL TIPS',
    badgeColor: 'text-[#D97245]',
    title: 'How to keep your kitchen organized',
    excerpt: 'Simple storage solutions that actually work.',
    href: '/guides/how-to-keep-your-kitchen-organized',
    image: '/images/guide-kitchen-org.webp',
  },
  {
    categoryLabel: 'CLEANING GUIDE',
    badgeColor: 'text-[#2E6B4E]',
    title: 'How to remove pet hair from furniture',
    excerpt: 'The most effective tools and techniques.',
    href: '/guides/how-to-remove-pet-hair-from-furniture',
    image: '/images/guide-pet-roller.webp',
  },
];

export default function HomePage() {
  return (
    <div className="pb-12 bg-[#F7F4EC]">
      {/* 1. SEAMLESS HERO SECTION — Matches Screen 1 of Photo */}
      <section className="relative overflow-hidden border-b border-[#E6DFD3] bg-[#F6F1E7]">
        <div className="max-w-7xl mx-auto relative">
          {/* Right-side Seamless Background Image */}
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-[64%] h-72 sm:h-96 lg:h-full relative overflow-hidden">
            <img
              src="/images/hero-dog-coffee.webp"
              fetchPriority="high"
              alt="Golden retriever lying on a cozy living room rug next to an overturned coffee mug and spilled coffee"
              className="w-full h-full object-cover object-right"
            />
            {/* Smooth left & bottom fade into the warm cream background */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#F6F1E7] via-[#F6F1E7]/85 to-transparent" />
            <div className="lg:hidden absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#F6F1E7] to-transparent" />

            {/* Handwritten Note directly on the cream wall above the sofa/dog */}
            <div className="absolute top-6 left-[18%] sm:left-[24%] lg:top-[15%] lg:left-[18%] z-10">
              <HandwrittenNote
                text={"Life happens.\nWe help."}
                arrowDirection="down-right"
              />
            </div>
          </div>

          {/* Left Column Content */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14 lg:w-[54%]">
            <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-[#2E5A44] mb-3">
              A CLEANER HOME. A CALMER YOU.
            </p>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[52px] font-bold text-[#1F2421] leading-[1.06] tracking-tight">
              Real solutions
              <br />
              for everyday
              <br />
              messy moments.
            </h1>

            <p className="text-sm sm:text-[15.5px] text-[#4A504C] max-w-md leading-relaxed mt-4">
              Practical guides, honest reviews and expert tips to help you keep your home fresh, organized and comfortable.
            </p>

            {/* Search Input Pill with Orange Circle Button */}
            <form action="/search" method="GET" className="relative max-w-lg mt-6">
              <div className="flex items-center bg-white rounded-full p-1.5 pl-4 shadow-elevated border border-[#E2DACB] focus-within:border-[#1F4D3A]">
                <Search className="w-4 h-4 text-[#8C857B] shrink-0 mr-2.5" />
                <input
                  type="text"
                  name="q"
                  placeholder="What do you want to clean or organize?"
                  className="w-full bg-transparent text-sm text-[#1F2421] placeholder:text-[#8C857B] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E07A4B] hover:bg-[#C96538] text-white flex items-center justify-center shrink-0 transition shadow-sm"
                >
                  <Search className="w-4 h-4 stroke-[2.4]" />
                </button>
              </div>
            </form>

            {/* Popular Searches Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-4">
              <span className="text-[11.5px] font-medium text-[#6E756F] mr-1">
                Popular searches:
              </span>
              {POPULAR_SEARCH_TAGS.map((tag) => (
                <Link
                  key={tag.label}
                  href={tag.href}
                  className="text-[11.5px] font-medium text-[#3F4641] bg-[#EFE9DC]/90 hover:bg-white hover:text-[#1F4D3A] px-2.5 py-1 rounded-md border border-[#DFD7C8] transition"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. 6-CARD CATEGORY ROW — Matches Screen 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-7">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {HOME_ROOM_CARDS.map((room) => (
            <Link
              key={room.slug}
              href={`/rooms/${room.slug}`}
              className="group bg-white rounded-xl overflow-hidden border border-[#E4DDD0] shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#EFE9DC]">
                <img
                  src={room.image}
                  loading="lazy"
                  decoding="async"
                  alt={room.name.replace('\n', ' ')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 flex items-end justify-between gap-1.5 flex-1 bg-white">
                <span className="font-editorial font-bold text-[13.5px] text-[#1F2421] leading-tight whitespace-pre-line group-hover:text-[#1F4D3A]">
                  {room.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#5C645E] group-hover:text-[#1F4D3A] group-hover:translate-x-0.5 transition-transform shrink-0 mb-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED GUIDE BANNER ("How to remove coffee stains from a fabric sofa") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="relative rounded-2xl bg-[#F2ECE1] border border-[#E2DACB] shadow-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 p-6 sm:p-9 lg:p-10 space-y-3.5 relative z-10">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#D97245]">
                FEATURED GUIDE
              </span>
              <h2 className="font-editorial text-3xl sm:text-[36px] font-bold text-[#1F2421] leading-[1.12]">
                How to remove coffee
                <br />
                stains from a fabric sofa
              </h2>
              <p className="text-sm sm:text-[15px] text-[#4A504C] leading-relaxed max-w-md">
                Step-by-step instructions, the best tools, and proven methods for different fabrics.
              </p>
              <div className="pt-1.5">
                <Link
                  href="/guides/how-to-remove-coffee-stains-from-fabric-sofa"
                  className="inline-flex items-center gap-2 bg-[#1F4D3A] hover:bg-[#173B2C] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-sm"
                >
                  <span>Read the guide</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Right Seamless Sofa Stain Image + Handwritten "Step-by-step with real photos" */}
            <div className="lg:col-span-6 relative h-64 sm:h-72 lg:h-[290px]">
              <img
                src="/images/featured-coffee-sofa.webp"
                loading="lazy"
                decoding="async"
                alt="Hand blotting a coffee stain from a beige fabric sofa with a white cloth"
                className="w-full h-full object-cover object-right"
              />
              {/* Left gradient blend into banner background */}
              <div className="hidden lg:block absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#F2ECE1] via-[#F2ECE1]/70 to-transparent" />

              {/* Handwritten annotation directly on the sofa cushion */}
              <div className="absolute top-[22%] left-4 sm:left-8 z-10">
                <HandwrittenNote
                  text={"Step-by-step\nwith real photos"}
                  arrowDirection="right"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR RIGHT NOW (4-Column Grid from Screen 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-9">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-editorial text-2xl sm:text-[26px] font-bold text-[#1F2421]">
            Popular right now
          </h2>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-semibold text-[#3F4641] hover:text-[#1F4D3A] inline-flex items-center gap-1"
          >
            <span>View all guides</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_RIGHT_NOW_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-white rounded-xl overflow-hidden border border-[#E4DDD0] shadow-card hover:shadow-elevated transition flex flex-col"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-[#EFE9DC]">
                <img
                  src={card.image}
                  loading="lazy"
                  decoding="async"
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${card.badgeColor}`}
                  >
                    {card.categoryLabel}
                  </span>
                  <h3 className="font-editorial font-bold text-[17px] text-[#1F2421] leading-snug mt-1 group-hover:text-[#1F4D3A]">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#5C645E] mt-1.5 leading-relaxed">
                    {card.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. FIND THE RIGHT PRODUCTS FOR YOUR HOME (Bottom Banner with Potted Plants) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-9">
        <div className="rounded-2xl bg-gradient-to-b from-[#E5ECE6] to-[#DAE4DC] border border-[#CBD8CE] px-6 py-7 sm:px-10 sm:py-8 shadow-card relative overflow-hidden">
          {/* Left Decorative Potted Plant Illustration */}
          <svg
            viewBox="0 0 120 140"
            fill="none"
            className="hidden md:block w-24 h-28 absolute -bottom-2 left-3 pointer-events-none opacity-90"
          >
            <path d="M42 98H78L72 134H48L42 98Z" fill="#C89D7C" />
            <path d="M38 92H82V100H38V92Z" fill="#B58867" />
            <path d="M60 92C58 68 42 46 22 36C28 56 42 76 60 92Z" fill="#3B6E52" />
            <path d="M60 92C62 64 78 40 98 30C92 54 78 76 60 92Z" fill="#2E5A44" />
            <path d="M60 92C60 60 60 32 60 14C52 38 52 66 60 92Z" fill="#4E8C6F" />
            <path d="M60 92C48 74 30 64 12 62C24 76 42 86 60 92Z" fill="#528A68" />
            <path d="M60 92C72 74 90 64 108 62C96 76 78 86 60 92Z" fill="#3B6E52" />
          </svg>

          {/* Right Decorative Foliage Illustration */}
          <svg
            viewBox="0 0 120 140"
            fill="none"
            className="hidden md:block w-24 h-28 absolute -bottom-2 right-2 pointer-events-none opacity-90"
          >
            <path d="M65 135C62 98 78 62 104 38C96 72 82 104 65 135Z" fill="#2E5A44" />
            <path d="M55 135C52 102 36 74 16 56C26 84 40 110 55 135Z" fill="#4E8C6F" />
            <path d="M60 135C60 95 64 55 74 24C56 56 54 96 60 135Z" fill="#3B6E52" />
          </svg>

          <div className="text-center max-w-xl mx-auto relative z-10">
            <h2 className="font-editorial text-2xl sm:text-[28px] font-bold text-[#1F2421]">
              Find the right products for your home
            </h2>
            <p className="text-xs sm:text-sm text-[#4A504C] mt-1">
              Answer a few questions and get personalized recommendations.
            </p>
          </div>

          {/* Handwritten Note on Right */}
          <div className="hidden lg:block absolute top-3 right-24 z-20">
            <HandwrittenNote
              text={"Personalized\nfor your home"}
              arrowDirection="down-left"
            />
          </div>

          {/* 3-Step Horizontal Bar */}
          <div className="mt-5 max-w-5xl mx-auto bg-[#F7F5F0]/95 rounded-xl p-3.5 sm:px-6 sm:py-3.5 shadow-sm border border-[#D8E0D9] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="font-editorial font-bold text-xl text-[#2E5A44] shrink-0">
                  1
                </span>
                <div>
                  <p className="text-xs font-bold text-[#1F2421]">Choose a space</p>
                  <p className="text-[11px] text-[#6E756F]">
                    Kitchen, bathroom, living room...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:border-l sm:border-[#DCE2DD] sm:pl-4">
                <span className="font-editorial font-bold text-xl text-[#2E5A44] shrink-0">
                  2
                </span>
                <div>
                  <p className="text-xs font-bold text-[#1F2421]">Select your need</p>
                  <p className="text-[11px] text-[#6E756F]">
                    Clean, organize, remove stains...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:border-l sm:border-[#DCE2DD] sm:pl-4">
                <span className="font-editorial font-bold text-xl text-[#2E5A44] shrink-0">
                  3
                </span>
                <div>
                  <p className="text-xs font-bold text-[#1F2421]">Get recommendations</p>
                  <p className="text-[11px] text-[#6E756F]">
                    Products that fit your home.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/tools/equipment-finder"
              className="inline-flex items-center justify-center gap-2 bg-[#1F4D3A] hover:bg-[#173B2C] text-white text-xs sm:text-[13px] font-semibold px-5 py-2.5 rounded-full transition shrink-0 shadow-sm"
            >
              <span>Try our product finder</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
