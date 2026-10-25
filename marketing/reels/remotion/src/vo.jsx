import {Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, sans} from './theme';
import timeline from './timeline.json';
import vo from './vo.json';

const fps = timeline.fps;

// Scene-local frame at which `word` (first match, punctuation ignored) is spoken.
export const wordFrame = (key, word) => {
  const clean = (w) => w.toLowerCase().replace(/[^a-z0-9’']/g, '');
  const hit = vo.lines[key].words.find((w) => clean(w.w) === clean(word));
  if (!hit) throw new Error(`"${word}" not in ${key}`);
  return Math.round(timeline.voLead[key] + hit.start * fps);
};

export const Voice = ({lineKey}) => (
  <Sequence from={timeline.voLead[lineKey]} layout="none">
    <Html5Audio src={staticFile(`vo/${lineKey}.wav`)} />
  </Sequence>
);

// Captions in sync with the voice: upcoming words are faint, spoken ones solid, the current one underlined in honey.
export const Captions = ({lineKey, size = 46, color = C.ink, dim = 'rgba(41,50,44,0.22)'}) => {
  const frame = useCurrentFrame();
  const t = (frame - timeline.voLead[lineKey]) / fps;
  return (
    <div style={{fontFamily: sans, fontWeight: 600, fontSize: size, lineHeight: 1.3, letterSpacing: '-0.01em'}}>
      {vo.lines[lineKey].words.map((w, i, all) => {
        const on = interpolate(t, [w.start - 0.05, w.start + 0.05], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const current = t >= w.start - 0.05 && t < (all[i + 1] ? all[i + 1].start - 0.05 : w.end + 0.15);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              marginRight: '0.26em',
              color: on > 0.5 ? color : dim,
              transform: `translateY(${(1 - on) * 6}px)`,
              backgroundImage: `linear-gradient(${C.honey}, ${C.honey})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 92%',
              backgroundSize: `${current ? 100 : 0}% 22%`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
