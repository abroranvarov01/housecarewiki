import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, mono, serif} from './theme';

const ROOF_LEN = 71;
const RAY_LEN = 7;

// The BrandMark SVG from src/components/BrandMark.tsx, with an optional draw-on animation.
export const BrandMark = ({size = 64, tone = 'ink', animateFrom = null}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const roof = tone === 'paper' ? C.cream : C.brandTerra;
  const t = animateFrom === null ? 1000 : frame - animateFrom;
  const roofP = interpolate(t, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chimney = spring({frame: t - 10, fps, config: {damping: 14}});
  const pane = (i) => spring({frame: t - 14 - i * 3, fps, config: {damping: 12, mass: 0.6}});
  const ray = (i) => interpolate(t, [26 + i * 3, 34 + i * 3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const panes = [
    [23.5, 31],
    [32, 31],
    [23.5, 39.5],
    [32, 39.5],
  ];
  const rays = ['M45 11.5 43.5 5.5', 'M50.5 12 54 6.5', 'M54 17l6-2.5'];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={{overflow: 'visible'}}>
      <path
        d="M5 44 31 21l27 23"
        fill="none"
        stroke={roof}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={ROOF_LEN}
        strokeDashoffset={ROOF_LEN * (1 - roofP)}
      />
      <path d="M43 17h7v18l-7-6z" fill={roof} style={{transformOrigin: '46.5px 35px', transform: `scaleY(${chimney})`}} />
      <g fill={C.brandHoney}>
        {panes.map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="6.5"
            height="6.5"
            rx="1.2"
            style={{transformOrigin: `${x + 3.25}px ${y + 3.25}px`, transform: `scale(${pane(i)})`}}
          />
        ))}
      </g>
      <g stroke={C.brandHoney} strokeWidth="3.4" strokeLinecap="round" fill="none">
        {rays.map((d, i) => (
          <path key={i} d={d} strokeDasharray={RAY_LEN} strokeDashoffset={RAY_LEN * (1 - ray(i))} />
        ))}
      </g>
    </svg>
  );
};

export const Wordmark = ({size = 40, tone = 'ink'}) => (
  <span style={{fontFamily: serif, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap'}}>
    <span style={{color: tone === 'paper' ? C.cream : C.forest}}>HouseCare</span>
    <span style={{color: tone === 'paper' ? C.brandHoney : C.brandTerra}}>Wiki</span>
  </span>
);

// Logo #3 on the brand sheet: the stacked version (mark over wordmark, honey brush underline, tagline).
export const StackedLogo = ({tone = 'paper', scale = 1, animateFrom = null, tagline = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = animateFrom === null ? 1000 : frame - animateFrom;
  const word = spring({frame: t - 12, fps, config: {damping: 200}});
  const swoosh = interpolate(t, [24, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tag = interpolate(t, [34, 48], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${scale})`}}>
      <div style={{marginBottom: -34}}>
        <BrandMark size={250} tone={tone} animateFrom={animateFrom} />
      </div>
      <div style={{opacity: word, transform: `translateY(${(1 - word) * 30}px)`}}>
        <Wordmark size={132} tone={tone} />
      </div>
      <svg viewBox="0 0 600 40" width={560} height={37} style={{marginTop: 6}}>
        <defs>
          <clipPath id={`swoosh-${animateFrom}`}>
            <rect x="0" y="0" width={600 * swoosh} height="40" />
          </clipPath>
        </defs>
        <path
          d="M8 26 C 150 12, 380 6, 592 14 C 596 17, 594 21, 588 21 C 400 18, 180 24, 14 34 C 4 35, 2 28, 8 26 Z"
          fill={C.brandHoney}
          clipPath={`url(#swoosh-${animateFrom})`}
        />
      </svg>
      {tagline && (
        <div
          style={{
            marginTop: 26,
            fontFamily: mono,
            fontSize: 27,
            letterSpacing: '0.32em',
            color: tone === 'paper' ? 'rgba(248,244,235,0.85)' : C.ink2,
            opacity: tag,
            whiteSpace: 'nowrap',
          }}
        >
          THE PRACTICAL HOME CARE GUIDE
        </div>
      )}
    </div>
  );
};
