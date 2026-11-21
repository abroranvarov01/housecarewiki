// HouseCareWiki logo (Nov 2026): a soap bubble with a shine, two small peach bubbles rising beside it, next to the
// two-color Bricolage Grotesque wordmark. Concept made with ChatGPT, redrawn as SVG. Colours are the `brand.*` tokens.
// tone="ink" is for light grounds (teal bubble); tone="paper" is for teal grounds (cream bubble).
type Tone = 'ink' | 'paper';

export function BrandMark({ className = 'h-7 w-7', tone = 'ink' }: { className?: string; tone?: Tone }) {
  const bubble = tone === 'paper' ? '#FBF4EC' : '#1F5C5B';
  const shine = tone === 'paper' ? '#F6B996' : '#FBF4EC';
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <circle cx="27" cy="38" r="23" fill={bubble} />
      <path d="M12.5 36.5A15 15 0 0 1 25 22.2" fill="none" stroke={shine} strokeWidth="5" strokeLinecap="round" />
      <circle cx="14.2" cy="43.5" r="2.6" fill={shine} />
      <circle cx="50" cy="12" r="7.5" fill="#F6B996" />
      <circle cx="59" cy="25" r="4" fill="#F6B996" />
    </svg>
  );
}

export function Wordmark({ tone = 'ink' }: { tone?: Tone }) {
  return (
    <span className="font-display text-[1.3rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[1.5rem]">
      <span className={tone === 'paper' ? 'text-brand-cream' : 'text-brand-teal'}>HouseCare</span>
      <span className={tone === 'paper' ? 'text-brand-peach' : 'text-coral-deep'}>Wiki</span>
    </span>
  );
}
