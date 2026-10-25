// HouseCareWiki logo (docs/brand/logo-sheet.webp): a brush-stroke terracotta roof with a chimney, a honey
// four-pane window and three honey rays, next to the two-color serif wordmark. Logo colors are the `brand.*` tokens.
type Tone = 'ink' | 'paper';

export function BrandMark({ className = 'h-7 w-7', tone = 'ink' }: { className?: string; tone?: Tone }) {
  const roof = tone === 'paper' ? '#F8F4EB' : '#C75E3D';
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <path d="M5 44 31 21l27 23" fill="none" stroke={roof} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M43 17h7v18l-7-6z" fill={roof} />
      <g fill="#F6C343">
        <rect x="23.5" y="31" width="6.5" height="6.5" rx="1.2" />
        <rect x="32" y="31" width="6.5" height="6.5" rx="1.2" />
        <rect x="23.5" y="39.5" width="6.5" height="6.5" rx="1.2" />
        <rect x="32" y="39.5" width="6.5" height="6.5" rx="1.2" />
      </g>
      <g stroke="#F6C343" strokeWidth="3.4" strokeLinecap="round">
        <path d="M45 11.5 43.5 5.5" />
        <path d="M50.5 12 54 6.5" />
        <path d="M54 17l6-2.5" />
      </g>
    </svg>
  );
}

export function Wordmark({ tone = 'ink' }: { tone?: Tone }) {
  return (
    <span className="font-serif text-[1.3rem] font-bold sm:text-[1.5rem] leading-none tracking-[-0.02em]">
      <span className={tone === 'paper' ? 'text-brand-cream' : 'text-brand-forest'}>HouseCare</span>
      <span className={tone === 'paper' ? 'text-brand-honey' : 'text-brand-terracotta'}>Wiki</span>
    </span>
  );
}
