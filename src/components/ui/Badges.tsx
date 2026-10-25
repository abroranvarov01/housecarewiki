'use client';

import React, { useState, useEffect } from 'react';
import { Check, Bookmark, Star } from 'lucide-react';

export function PrimeBadge() {
  return (
    <span
      className="inline-flex items-center font-sans text-[11px] font-extrabold tracking-tight select-none ml-1"
      title="Amazon Prime"
    >
      <Check className="w-3 h-3 text-[#FF9900] stroke-[3.5] -mr-0.5" />
      <span className="text-[#00A8E1] font-bold">prime</span>
    </span>
  );
}

export function StarRating({
  rating,
  reviewCount,
  size = 'sm',
}: {
  rating: number;
  reviewCount?: number;
  size?: 'xs' | 'sm' | 'md';
}) {
  const fullStars = Math.floor(rating);
  const starSize = size === 'xs' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center text-[#F59E0B]" aria-label={`Rated ${rating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < fullStars ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#F59E0B]/35 text-[#F59E0B]'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-[#3F4641] ml-0.5">{rating.toFixed(1)}</span>
      {typeof reviewCount === 'number' && (
        <span className="text-[11px] text-[#6E756F]">
          ({reviewCount.toLocaleString()}{size === 'md' ? ' reviews' : ''})
        </span>
      )}
    </div>
  );
}

export function HandwrittenNote({
  text,
  className = '',
  arrowDirection = 'down-right',
}: {
  text: string;
  className?: string;
  arrowDirection?: 'down-right' | 'down-left' | 'right' | 'down';
}) {
  return (
    <div className={`inline-flex flex-col items-center select-none pointer-events-none ${className}`}>
      <div className="flex items-center gap-1">
        <span className="font-handwritten text-[22px] sm:text-[25px] font-bold text-[#252A27] leading-[1.05] -rotate-6 text-center whitespace-pre-line drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]">
          {text}
        </span>
        {arrowDirection === 'right' && (
          <svg
            width="44"
            height="28"
            viewBox="0 0 44 28"
            fill="none"
            className="text-[#252A27] mt-1"
          >
            <path
              d="M2 20C14 22 26 16 39 7M39 7L30 6M39 7L35 15"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {arrowDirection === 'down-right' && (
        <svg
          width="48"
          height="34"
          viewBox="0 0 48 34"
          fill="none"
          className="text-[#252A27] mt-0.5 ml-6"
        >
          <path
            d="M6 3C10 18 22 26 41 27M41 27L34 21M41 27L35 32"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {arrowDirection === 'down-left' && (
        <svg
          width="46"
          height="34"
          viewBox="0 0 46 34"
          fill="none"
          className="text-[#252A27] mt-0.5 mr-4"
        >
          <path
            d="M38 3C36 16 25 24 8 27M8 27L15 21M8 27L14 32"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {arrowDirection === 'down' && (
        <svg
          width="28"
          height="36"
          viewBox="0 0 28 36"
          fill="none"
          className="text-[#252A27] mt-0.5"
        >
          <path
            d="M16 2C12 12 12 22 15 32M15 32L9 26M15 32L20 26"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export function TestedInRealHomesSeal({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-[86px] h-[86px] sm:w-[96px] sm:h-[96px] rounded-full bg-white/95 shadow-elevated border border-[#E2DACB] flex items-center justify-center p-1.5 select-none ${className}`}
    >
      <div className="w-full h-full rounded-full border border-dashed border-[#C7BFA9] flex flex-col items-center justify-center text-center px-1">
        <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.14em] uppercase text-[#1F2421] leading-tight">
          TESTED
        </span>
        <span className="text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.1em] uppercase text-[#3F4641] my-0.5">
          IN REAL
        </span>
        <span className="text-[9px] sm:text-[10px] font-extrabold tracking-[0.14em] uppercase text-[#1F2421] leading-tight">
          HOMES
        </span>
      </div>
    </div>
  );
}

export function AffiliateButton({
  productId,
  productName,
  asin,
  amazonUrl,
  contentSlug = 'site',
  placement = 'card',
  variant = 'forest',
  label = 'View on Amazon',
  className = '',
}: {
  productId: string;
  productName: string;
  asin: string;
  amazonUrl: string;
  contentSlug?: string;
  placement?: string;
  variant?: 'forest' | 'coral' | 'compact';
  label?: string;
  className?: string;
}) {
  const handleTrackClick = async () => {
    try {
      await fetch('/api/affiliate/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          asin,
          contentSlug,
          placement,
          device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop',
        }),
      });
    } catch {
      // Non-blocking attribution ping
    }
  };

  const styles =
    variant === 'coral'
      ? 'bg-[#E07A4B] hover:bg-[#CC6738] text-white px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm'
      : variant === 'compact'
      ? 'bg-[#1F4D3A] hover:bg-[#173B2C] text-white px-4 py-1.5 text-xs font-semibold rounded-md'
      : 'bg-[#1F4D3A] hover:bg-[#173B2C] text-white px-4 py-2 text-xs sm:text-[13px] font-semibold rounded-lg';

  return (
    <a
      href={amazonUrl}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      onClick={handleTrackClick}
      className={`inline-flex items-center justify-center gap-1.5 transition-all duration-150 ${styles} ${className}`}
    >
      <span>{label}</span>
      {variant !== 'compact' && <span aria-hidden="true">→</span>}
    </a>
  );
}

export function SaveItemButton({
  itemSlug,
  itemType,
  title,
}: {
  itemSlug: string;
  itemType: 'article' | 'product' | 'comparison';
  title: string;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hcw_saved_items');
      if (raw) {
        const list = JSON.parse(raw) as { slug: string }[];
        setSaved(list.some((i) => i.slug === itemSlug));
      }
    } catch {}
  }, [itemSlug]);

  const toggleSave = () => {
    try {
      const raw = localStorage.getItem('hcw_saved_items');
      const list: { slug: string; type: string; title: string; savedAt: string }[] = raw
        ? JSON.parse(raw)
        : [];
      const exists = list.some((i) => i.slug === itemSlug);
      const updated = exists
        ? list.filter((i) => i.slug !== itemSlug)
        : [...list, { slug: itemSlug, type: itemType, title, savedAt: new Date().toISOString() }];
      localStorage.setItem('hcw_saved_items', JSON.stringify(updated));
      setSaved(!exists);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggleSave}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition ${
        saved
          ? 'bg-[#1F4D3A] text-white border-[#1F4D3A]'
          : 'bg-white text-[#5C645E] border-[#E2DACB] hover:border-[#1F4D3A]'
      }`}
      title={saved ? 'Remove from saved items' : 'Save for later'}
    >
      <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
      <span>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
