import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandMark, Wordmark} from './Brand';
import {C, mono, sans, serif} from './theme';

// Instagram covers roughly the top 200px and bottom 360px; keep anything that matters between these.
export const SAFE = {top: 200, bottom: 1560, x: 80};

export const Paper = ({color = C.paper, children}) => (
  <AbsoluteFill style={{backgroundColor: color}}>
    {children}
    <Grain />
  </AbsoluteFill>
);

const Grain = () => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.07}}>
    <svg width="1080" height="1920">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1080" height="1920" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

// Word-by-word rise behind a mask. `lines` is an array of lines, each an array of {t, mark?, color?, italic?}.
export const Headline = ({lines, size = 120, delay = 0, color = C.ink, align = 'left', lineHeight = 1.04, weight = 600}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let idx = 0;
  return (
    <div style={{fontFamily: serif, fontWeight: weight, fontSize: size, lineHeight, color, letterSpacing: '-0.028em', textAlign: align}}>
      {lines.map((line, li) => (
        <div key={li}>
          {line.map((tok, ti) => {
            const i = idx++;
            const p = spring({frame: frame - delay - i * 3, fps, config: {damping: 200, mass: 0.55}});
            const mark = tok.mark ? spring({frame: frame - delay - i * 3 - 9, fps, config: {damping: 200}}) : 0;
            return (
              <span
                key={ti}
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  verticalAlign: 'top',
                  padding: '0.1em 0.04em 0.18em',
                  margin: `-0.1em ${ti < line.length - 1 ? 0.2 : -0.04}em -0.18em -0.04em`,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${(1 - p) * 115}%)`,
                    color: tok.color ?? color,
                    fontStyle: tok.italic ? 'italic' : 'normal',
                    fontWeight: tok.italic ? 500 : weight,
                    backgroundImage: tok.mark ? `linear-gradient(${C.honey}, ${C.honey})` : 'none',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '0 84%',
                    backgroundSize: `${mark * 100}% 32%`,
                  }}
                >
                  {tok.t}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Rise = ({delay = 0, distance = 40, children, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * distance}px)`, ...style}}>{children}</div>;
};

export const Pop = ({delay = 0, children, style, rotate = 0, from = 0.6}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 11, mass: 0.7}});
  const o = interpolate(frame - delay, [0, 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{opacity: o, transform: `scale(${from + (1 - from) * p}) rotate(${rotate}deg)`, ...style}}>{children}</div>;
};

export const Kicker = ({children, delay = 0, color = C.terraDeep}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 12], [0, 56], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Rise delay={delay} distance={16}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: mono, fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color}}>
        <div style={{width: w, height: 4, borderRadius: 2, backgroundColor: C.terra}} />
        {children}
      </div>
    </Rise>
  );
};

export const Body = ({children, delay = 0, size = 44, color = C.ink2, style}) => (
  <Rise delay={delay} distance={24}>
    <div style={{fontFamily: sans, fontWeight: 400, fontSize: size, lineHeight: 1.32, color, letterSpacing: '-0.005em', ...style}}>{children}</div>
  </Rise>
);

// Brand + 3-step progress shown on each tip.
export const TopBar = ({step}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [6, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: SAFE.top - 20, left: SAFE.x, right: SAFE.x, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <BrandMark size={58} />
        <Wordmark size={40} />
      </div>
      <div style={{display: 'flex', gap: 10}}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{width: 64, height: 10, borderRadius: 5, backgroundColor: C.paperDeep, overflow: 'hidden'}}>
            <div
              style={{
                height: '100%',
                width: `${n < step ? 100 : n === step ? fill * 100 : 0}%`,
                backgroundColor: n <= step ? C.terraDeep : 'transparent',
                borderRadius: 5,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const Card = ({children, top = 690, height = 650, delay = 4}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: SAFE.x,
        width: 1080 - SAFE.x * 2,
        height,
        borderRadius: 44,
        backgroundColor: C.card,
        border: `2px solid ${C.rule}`,
        boxShadow: '0 30px 60px -30px rgba(41,50,44,0.35)',
        overflow: 'hidden',
        opacity: p,
        transform: `translateY(${(1 - p) * 60}px) scale(${0.96 + 0.04 * p})`,
      }}
    >
      {children}
    </div>
  );
};

export const Chip = ({children, bg = C.card, color = C.ink, border = C.ruleStrong, size = 30, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 22px',
      borderRadius: 999,
      backgroundColor: bg,
      border: `2px solid ${border}`,
      fontFamily: sans,
      fontWeight: 600,
      fontSize: size,
      color,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);
