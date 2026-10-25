import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, mono, sans, serif} from './theme';
import {wordFrame} from './vo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

const rand = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

// Smooth irregular closed blob (Catmull-Rom through jittered points).
export const blobPath = (cx, cy, rx, ry, seed, n = 11, jitter = 0.2) => {
  const r = rand(seed);
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (r() - 0.5) * 2 * jitter;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
};

export const Weave = ({id, base = C.fabric, line = C.fabricShade, size = 14}) => (
  <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
    <rect width={size} height={size} fill={base} />
    <path d={`M0 ${size / 2}H${size}`} stroke={line} strokeWidth="1.6" opacity="0.55" />
    <path d={`M${size / 2} 0V${size}`} stroke={C.fabricLight} strokeWidth="1.2" opacity="0.6" />
  </pattern>
);

const Stain = ({d, scale = 1, origin}) => (
  <g style={{transformOrigin: origin, transform: `scale(${scale})`}}>
    <path d={d} fill={C.coffee} opacity="0.8" />
    <path d={d} fill="none" stroke={C.coffeeDark} strokeWidth="6" opacity="0.5" />
  </g>
);

// Hook: a mug tips over on a sofa cushion.
export const SofaSpill = ({id = 'sofa', still = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = still ? 60 : f;
  const tip = spring({frame: t - 4, fps, config: {damping: 9, mass: 0.6, stiffness: 120}});
  const angle = 84 * tip;
  const spill = spring({frame: t - 11, fps, config: {damping: 14, mass: 0.7}});
  const drip = interpolate(t, [16, 40], [0, 1], clamp);
  const shake = still ? 0 : Math.sin(f * 2.4) * 7 * Math.exp(-Math.max(0, f - 11) / 5) * (f >= 11 ? 1 : 0);
  const drops = Array.from({length: 7}, (_, i) => {
    const r = rand(i + 3);
    const vx = 3 + r() * 9;
    const vy = -6 - r() * 8;
    const dt = Math.max(0, t - 11);
    return {x: 690 + vx * dt, y: 505 + vy * dt + 0.9 * dt * dt, s: 5 + r() * 7, o: interpolate(dt, [0, 2, 12, 16], [0, 1, 1, 0], clamp)};
  });
  const stainD = blobPath(765, 505, 108, 30, 7, 12, 0.3);
  return (
    <svg viewBox="0 0 1080 820" width="1080" height="820" style={{transform: `translateX(${shake}px)`}}>
      <defs>
        <Weave id={`${id}-w`} />
        <Weave id={`${id}-wl`} base={C.fabricLight} />
        <radialGradient id={`${id}-sh`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#29322C" stopOpacity="0.25" />
          <stop offset="1" stopColor="#29322C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="540" cy="790" rx="500" ry="26" fill={`url(#${id}-sh)`} />
      {/* back */}
      <rect x="110" y="150" width="860" height="350" rx="70" fill={`url(#${id}-w)`} />
      <rect x="175" y="185" width="355" height="300" rx="50" fill={`url(#${id}-wl)`} stroke={C.fabricShade} strokeWidth="3" />
      <rect x="550" y="185" width="355" height="300" rx="50" fill={`url(#${id}-wl)`} stroke={C.fabricShade} strokeWidth="3" />
      {/* seat: top surfaces, then front faces */}
      <rect x="190" y="465" width="350" height="110" rx="30" fill={`url(#${id}-wl)`} />
      <rect x="540" y="465" width="350" height="110" rx="30" fill={`url(#${id}-wl)`} />
      <rect x="190" y="540" width="700" height="170" rx="30" fill={`url(#${id}-w)`} />
      <path d="M540 470V705" stroke={C.fabricShade} strokeWidth="4" />
      <path d="M200 548H880" stroke={C.fabricShade} strokeWidth="3" opacity="0.7" />
      {/* spill */}
      <Stain d={stainD} scale={spill} origin="690px 505px" />
      <path d="M842 545 C 846 570, 838 590, 844 612" fill="none" stroke={C.coffee} strokeOpacity="0.8" strokeWidth="12" strokeLinecap="round" strokeDasharray="80" strokeDashoffset={80 * (1 - drip)} />
      {/* base, legs, arms */}
      <rect x="110" y="690" width="860" height="70" rx="26" fill={C.fabricShade} />
      <rect x="170" y="755" width="26" height="38" rx="6" fill="#8A6A4A" />
      <rect x="884" y="755" width="26" height="38" rx="6" fill="#8A6A4A" />
      <rect x="60" y="330" width="160" height="400" rx="74" fill={`url(#${id}-w)`} stroke={C.fabricShade} strokeWidth="3" />
      <rect x="860" y="330" width="160" height="400" rx="74" fill={`url(#${id}-w)`} stroke={C.fabricShade} strokeWidth="3" />
      {/* mug, pivoting on its bottom-right corner */}
      <g style={{transformOrigin: '652px 516px', transform: `rotate(${angle}deg)`}}>
        <path d="M548 432 a26 26 0 1 0 0 52" fill="none" stroke={C.brandTerra} strokeWidth="13" />
        <path d="M560 400 H652 V494 a22 22 0 0 1 -22 22 H582 a22 22 0 0 1 -22 -22 Z" fill={C.brandTerra} />
        <path d="M570 408 V488" stroke="#E08A6A" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
        <ellipse cx="606" cy="400" rx="46" ry="9" fill={C.coffeeDark} opacity={1 - tip} />
      </g>
      {drops.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={C.coffee} opacity={d.o} />
      ))}
    </svg>
  );
};

// Tip 1: a folded white cloth presses on the stain.
export const BlotArt = () => {
  const t = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: t - 10, fps, config: {damping: 15}});
  const cycle = 30;
  const ph = t < 24 ? 0 : ((t - 24) % cycle) / cycle;
  const ease = (x) => x * x * (3 - 2 * x);
  const down = t < 24 ? 0 : ph < 0.25 ? ease(ph / 0.25) : ph < 0.6 ? 1 : 1 - ease((ph - 0.6) / 0.4);
  const lift = 1 - down;
  const noRub = spring({frame: t - 54, fps, config: {damping: 12}});
  const xDraw = interpolate(t, [70, 82], [0, 1], clamp);
  const spin = t * 9;
  const stainD = blobPath(460, 330, 200, 150, 11, 12, 0.18);
  return (
    <svg viewBox="0 0 920 650" width="920" height="650">
      <defs>
        <Weave id="blot-w" />
        <filter id="blot-sh" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy={6 + lift * 22} stdDeviation={4 + lift * 12} floodColor="#29322C" floodOpacity={0.28 - lift * 0.08} />
        </filter>
      </defs>
      <rect width="920" height="650" fill="url(#blot-w)" />
      <Stain d={stainD} origin="460px 330px" />
      {/* press arrows */}
      <g opacity={enter} fill="none" stroke={C.terraDeep} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        {[0, 1].map((i) => (
          <path key={i} d={`M425 ${52 + i * 34 + down * 14} l35 26 35-26`} opacity={0.5 + i * 0.5} />
        ))}
      </g>
      <g style={{transform: `translateY(${(1 - enter) * -520 - lift * 14}px) scale(${1 + lift * 0.05})`, transformOrigin: '460px 340px'}}>
        <g filter="url(#blot-sh)" transform="rotate(-6 460 340)">
          <rect x="300" y="190" width="320" height="280" rx="18" fill="#FFFFFF" />
          <path d="M300 300 Q460 312 620 296" stroke="#E7E1D6" strokeWidth="4" fill="none" />
          <path d="M455 190 Q462 330 452 470" stroke="#EDE8DF" strokeWidth="3" fill="none" />
          <rect x="300" y="190" width="320" height="280" rx="18" fill="none" stroke="#E4DACA" strokeWidth="3" />
        </g>
      </g>
      {/* "no rubbing" inset */}
      <g style={{transformOrigin: '800px 545px', transform: `scale(${noRub})`}}>
        <circle cx="800" cy="545" r="88" fill={C.card} stroke={C.rule} strokeWidth="4" />
        <g style={{transformOrigin: '800px 545px', transform: `rotate(${spin}deg)`}}>
          <path d="M800 495 a50 50 0 1 1 -48 36" fill="none" stroke={C.muted} strokeWidth="9" strokeLinecap="round" />
          <path d="M738 520 l14 13 13-17" fill="none" stroke={C.muted} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path d="M750 495 L850 595" stroke={C.terraDeep} strokeWidth="13" strokeLinecap="round" strokeDasharray="142" strokeDashoffset={142 * (1 - xDraw)} />
        <path d="M850 495 L750 595" stroke={C.terraDeep} strokeWidth="13" strokeLinecap="round" strokeDasharray="142" strokeDashoffset={142 * (1 - interpolate(t, [78, 90], [0, 1], clamp))} />
      </g>
    </svg>
  );
};

// Tip 2: upholstery care tag + what each code means.
const CODES = [
  {code: 'W', title: 'Water-based OK', sub: 'Mild soap and water', bg: C.sageSoft, fg: C.sageDeep},
  {code: 'S', title: 'Solvent only', sub: 'No water at all', bg: C.terraSoft, fg: C.terraDeep},
  {code: 'W/S', title: 'Either works', sub: 'Water or solvent', bg: C.honeySoft, fg: C.ink},
  {code: 'X', title: 'Vacuum only', sub: 'Ask a pro for stains', bg: C.paperDeep, fg: C.ink},
];

export const TagArt = () => {
  const t = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame: t - 6, fps, config: {damping: 13}});
  const swing = 9 * Math.exp(-Math.max(0, t - 10) / 18) * Math.sin(Math.max(0, t - 10) / 3.2);
  const sAt = wordFrame('tip2', 'S,');
  const warn = interpolate(t, [sAt - 4, sAt + 4], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex'}}>
      <svg viewBox="0 0 360 650" width="360" height="650" style={{flexShrink: 0}}>
        <defs>
          <Weave id="tag-w" base={C.fabricShade} line={C.fabric} />
        </defs>
        <rect width="360" height="70" fill="url(#tag-w)" />
        <path d="M0 64H360" stroke={C.ink2} strokeWidth="3" strokeDasharray="12 8" opacity="0.5" />
        <g style={{transformOrigin: '180px 62px', transform: `translateY(${(1 - drop) * -420}px) rotate(${swing}deg)`}}>
          <rect x="62" y="56" width="236" height="510" rx="12" fill="#FDFBF6" stroke={C.ruleStrong} strokeWidth="3" />
          <rect x="76" y="70" width="208" height="482" rx="6" fill="none" stroke={C.rule} strokeWidth="3" strokeDasharray="10 7" />
          <text x="180" y="130" textAnchor="middle" fontFamily={mono} fontSize="21" letterSpacing="3" fill={C.muted}>
            UPHOLSTERY
          </text>
          <text x="180" y="160" textAnchor="middle" fontFamily={mono} fontSize="21" letterSpacing="3" fill={C.muted}>
            CLEANING CODE
          </text>
          <text x="180" y="300" textAnchor="middle" fontFamily={serif} fontWeight="700" fontSize="88" fill={C.ink}>
            W/S
          </text>
          <rect x="108" y="342" width="144" height="8" rx="4" fill={C.rule} />
          <rect x="96" y="370" width="168" height="8" rx="4" fill={C.rule} />
          <rect x="116" y="398" width="128" height="8" rx="4" fill={C.rule} />
          <rect x="104" y="460" width="152" height="8" rx="4" fill={C.rule} />
          <rect x="124" y="488" width="112" height="8" rx="4" fill={C.rule} />
        </g>
      </svg>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, paddingRight: 36, flex: 1}}>
        {CODES.map((c, i) => {
          const p = spring({frame: t - 22 - i * 9, fps, config: {damping: 200}});
          const isS = c.code === 'S';
          return (
            <div
              key={c.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '14px 18px',
                borderRadius: 26,
                backgroundColor: isS ? `rgba(246,228,218,${warn})` : 'transparent',
                boxShadow: isS ? `inset 0 0 0 ${3 * warn}px ${C.terra}` : 'none',
                opacity: p,
                transform: `translateX(${(1 - p) * 60}px) scale(${isS ? 1 + 0.03 * warn : 1})`,
              }}
            >
              <div
                style={{
                  width: 104,
                  height: 92,
                  borderRadius: 20,
                  backgroundColor: c.bg,
                  color: c.fg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: serif,
                  fontWeight: 700,
                  fontSize: c.code.length > 1 ? 40 : 54,
                  flexShrink: 0,
                }}
              >
                {c.code}
              </div>
              <div>
                <div style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: C.ink, lineHeight: 1.1}}>{c.title}</div>
                <div style={{fontFamily: sans, fontWeight: 400, fontSize: 27, color: C.muted, marginTop: 6}}>{c.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Tip 3: spray on a hidden spot, let it dry, then look.
const QUESTIONS = ['Color change?', 'Water ring?', 'Texture change?'];

export const SpotTestArt = () => {
  const t = useCurrentFrame();
  const {fps} = useVideoConfig();
  const label = spring({frame: t - 8, fps, config: {damping: 13}});
  const bottleIn = spring({frame: t - 12, fps, config: {damping: 15}});
  const tilt = interpolate(t, [26, 32, 46, 54], [0, -24, -24, 0], clamp);
  const dab = spring({frame: t - 40, fps, config: {damping: 200}});
  const dryAt = wordFrame('tip3', 'dry');
  const dry = interpolate(t, [dryAt - 6, dryAt + 30], [0, 1], clamp);
  const dryChip = spring({frame: t - dryAt + 6, fps, config: {damping: 13}});
  const bottleOut = spring({frame: t - dryAt + 14, fps, config: {damping: 200}});
  const ringLen = 2 * Math.PI * 150;
  const mist = Array.from({length: 26}, (_, i) => {
    const r = rand(i + 21);
    const p = (t - 32 - i * 0.45) / 12;
    return {
      x: -150 - p * (200 + r() * 120),
      y: -19 + p * (r() - 0.5) * 120,
      s: 5 + r() * 7,
      o: p > 0 && p < 1 ? Math.sin(p * Math.PI) * 0.95 : 0,
    };
  });
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg viewBox="0 0 920 650" width="920" height="650" style={{position: 'absolute', inset: 0}}>
        <defs>
          <Weave id="spot-w" />
        </defs>
        <rect width="920" height="650" fill="url(#spot-w)" />
        <circle cx="330" cy="370" r="130" fill="none" stroke={C.ink2} strokeWidth="5" strokeDasharray="18 14" strokeDashoffset={-t * 1.5} opacity="0.75" />
        <path d={blobPath(330, 370, 72, 60, 5, 10, 0.18)} fill={C.fabricShade} opacity={0.85 * dab} style={{transformOrigin: '330px 370px', transform: `scale(${0.4 + 0.6 * dab})`}} />
        <circle
          cx="330"
          cy="370"
          r="150"
          fill="none"
          stroke={C.honeyDeep}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={ringLen}
          strokeDashoffset={ringLen * (1 - dry)}
          transform="rotate(-90 330 370)"
          opacity={dry > 0 ? 1 : 0}
        />
        <g transform={`translate(${740 + (1 - bottleIn) * 300 + bottleOut * 460} 240) rotate(${tilt})`}>
          {mist.map((m, i) => (
            <circle key={i} cx={m.x} cy={m.y} r={m.s} fill="#FFFFFF" stroke="#B9CCB4" strokeWidth="2" opacity={m.o} />
          ))}
          <path d="M-60 14 L-82 84" stroke={C.ink2} strokeWidth="18" strokeLinecap="round" />
          <rect x="-112" y="-40" width="152" height="56" rx="16" fill={C.ink2} />
          <rect x="-146" y="-31" width="40" height="24" rx="6" fill={C.ink} />
          <rect x="-30" y="12" width="60" height="38" rx="8" fill={C.sageDeep} />
          <rect x="-66" y="46" width="132" height="230" rx="34" fill="#DCE7D6" stroke={C.sageDeep} strokeWidth="4" />
          <rect x="-48" y="120" width="96" height="86" rx="10" fill={C.card} />
          <rect x="-34" y="142" width="68" height="8" rx="4" fill={C.rule} />
          <rect x="-34" y="162" width="50" height="8" rx="4" fill={C.rule} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 28, top: 28, opacity: label, transform: `scale(${0.7 + 0.3 * label})`, transformOrigin: 'left top'}}>
        <Tag>Hidden spot</Tag>
      </div>
      <div style={{position: 'absolute', left: 250, top: 560, opacity: dryChip, transform: `translateY(${(1 - dryChip) * 20}px)`}}>
        <Tag bg={C.honey} border={C.honeyDeep}>
          Let it dry
        </Tag>
      </div>
      <div style={{position: 'absolute', right: 40, top: 250, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12}}>
        {QUESTIONS.map((q, i) => {
          const p = spring({frame: t - dryAt + 2 - i * 5, fps, config: {damping: 14}});
          return (
            <div key={q} style={{opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
              <Tag small>{q}</Tag>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Tag = ({children, bg = C.card, border = C.ruleStrong, small = false}) => (
  <div
    style={{
      display: 'inline-block',
      padding: small ? '8px 20px' : '10px 24px',
      borderRadius: 999,
      backgroundColor: bg,
      border: `2px solid ${border}`,
      fontFamily: sans,
      fontWeight: 600,
      fontSize: small ? 28 : 32,
      color: C.ink,
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 18px -10px rgba(41,50,44,0.4)',
    }}
  >
    {children}
  </div>
);
