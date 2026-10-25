// Original soundtrack, synthesized from scratch (no samples, no third-party music): warm lo-fi chords,
// plucked arpeggio, soft drums, whooshes on each scene transition and a chime on the logo.
// The bed ducks under the voiceover (src/vo.json). Usage: node gen-music.mjs out.wav
import fs from 'node:fs';
import timeline from './src/timeline.json' with {type: 'json'};
import vo from './src/vo.json' with {type: 'json'};

const SR = 48000;
const {fps, transition, scenes} = timeline;
const durs = Object.values(scenes);
const totalFrames = durs.reduce((a, b) => a + b, 0) - (durs.length - 1) * transition;
const N = Math.ceil((totalFrames / fps) * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const add = (i, l, r = l) => {
  if (i >= 0 && i < N) {
    L[i] += l;
    R[i] += r;
  }
};

const BPM = 96;
const beat = 60 / BPM;
const bar = beat * 4;
const chords = [
  [53, 57, 60, 64], // Fmaj7
  [50, 53, 57, 60, 64], // Dm9
  [46, 50, 53, 57], // Bbmaj7
  [48, 52, 55, 62], // Cadd9
];

// Sidechain-ish duck from kicks.
const duck = new Float32Array(N).fill(1);

// Kick on 1 and 3, soft snare on 2 and 4, hats on off-beats.
for (let b = 0; b * beat < N / SR; b++) {
  const t0 = Math.floor(b * beat * SR);
  if (b % 2 === 0) {
    let ph = 0;
    for (let i = 0; i < 0.35 * SR; i++) {
      const t = i / SR;
      ph += (2 * Math.PI * (45 + 75 * Math.exp(-t * 30))) / SR;
      const v = Math.sin(ph) * Math.exp(-t * 9) * 0.55;
      add(t0 + i, v);
      if (t0 + i < N) duck[t0 + i] = Math.min(duck[t0 + i], 0.55 + 0.45 * Math.min(1, t / 0.25));
    }
  } else {
    let lp = 0;
    for (let i = 0; i < 0.2 * SR; i++) {
      const t = i / SR;
      const n = rnd() * 2 - 1;
      lp += 0.35 * (n - lp);
      const v = (lp * 0.5 + Math.sin(2 * Math.PI * 190 * t) * 0.3) * Math.exp(-t * 22) * 0.22;
      add(t0 + i, v * 0.9, v);
    }
  }
  const h0 = Math.floor((b + 0.5) * beat * SR);
  let prev = 0;
  for (let i = 0; i < 0.05 * SR; i++) {
    const n = rnd() * 2 - 1;
    const hp = n - prev;
    prev = n;
    const v = hp * Math.exp(-(i / SR) * 80) * 0.05;
    add(h0 + i, v * 0.7, v);
  }
}

// Pads + bass + plucks, one chord per bar.
for (let k = 0; k * bar < N / SR; k++) {
  const ch = chords[k % chords.length];
  const s0 = Math.floor(k * bar * SR);
  const len = Math.floor((bar + 0.8) * SR);
  for (const m of ch) {
    const f = mtof(m);
    const det = [0.998, 1.002];
    for (let i = 0; i < len; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.35) * (t > bar ? Math.max(0, 1 - (t - bar) / 0.8) : 1);
      let v = 0;
      for (let h = 1; h <= 4; h++) v += Math.sin(2 * Math.PI * f * h * det[0] * t) / h ** 1.6 + Math.sin(2 * Math.PI * f * h * det[1] * t + 1.3) / h ** 1.6;
      v *= 0.017 * env;
      const d = duck[s0 + i] ?? 1;
      add(s0 + i, v * d * 1.05, v * d * 0.95);
    }
  }
  // Bass on beats 1 and 3.
  const root = ch[0] - 12;
  for (const off of [0, 2]) {
    const b0 = s0 + Math.floor(off * beat * SR);
    for (let i = 0; i < beat * 1.6 * SR; i++) {
      const t = i / SR;
      const v = Math.sin(2 * Math.PI * mtof(root) * t) * Math.min(1, t / 0.01) * Math.exp(-t * 2.2) * 0.22;
      add(b0 + i, v);
    }
  }
  // Karplus-Strong plucked arpeggio in eighths.
  const arp = [0, 1, 2, 3, 2, 1, 3, 2].map((j) => ch[j % ch.length] + 12);
  arp.forEach((m, j) => {
    const p0 = s0 + Math.floor(j * (beat / 2) * SR);
    const period = Math.round(SR / mtof(m));
    const buf = Float32Array.from({length: period}, () => rnd() * 2 - 1);
    const pan = j % 2 ? 0.7 : 1.0;
    for (let i = 0; i < 0.9 * SR; i++) {
      const idx = i % period;
      const nxt = (i + 1) % period;
      const v = buf[idx];
      buf[idx] = 0.497 * (buf[idx] + buf[nxt]);
      const out = v * 0.06 * (k === 0 && j < 2 ? 0.6 : 1);
      add(p0 + i, out * pan, out * (1.7 - pan));
    }
  });
}

// Duck the music bed under the voiceover (-10 dB, 120 ms ramps).
{
  const keys = Object.keys(timeline.scenes);
  let f = 0;
  const spans = keys.map((k) => {
    const s0 = (f + timeline.voLead[k]) / fps;
    f += timeline.scenes[k] - transition;
    return [s0, s0 + vo.lines[k].duration];
  });
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let g = 1;
    for (const [a, b] of spans) {
      const inside = Math.min(1, Math.max(0, (t - (a - 0.12)) / 0.12), Math.max(0, (b + 0.2 - t) / 0.12));
      g = Math.min(g, 1 - 0.68 * inside);
    }
    L[i] *= g;
    R[i] *= g;
  }
}

// Whoosh: noise through a sweeping band-pass, centered on each transition.
const whoosh = (center, dur = 0.5, gain = 0.32) => {
  const s0 = Math.floor((center - dur * 0.6) * SR);
  let low = 0;
  let band = 0;
  for (let i = 0; i < dur * SR; i++) {
    const x = i / (dur * SR);
    const fc = 300 + 3500 * Math.sin(x * Math.PI * 0.9);
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    const n = rnd() * 2 - 1;
    low += f * band;
    const high = n - low - 0.5 * band;
    band += f * high;
    const env = Math.sin(Math.PI * x) ** 2;
    add(s0 + i, band * env * gain * (1 - x * 0.6), band * env * gain * (0.4 + x * 0.6));
  }
};
let start = 0;
const starts = [];
durs.forEach((d, i) => {
  starts.push(start);
  if (i < durs.length - 1) {
    const t = (start + d - transition) / fps;
    whoosh(t + transition / fps / 2);
    start += d - transition;
  }
});

// Hook: soft "plop" as the coffee hits the cushion (frame ~11).
{
  const s0 = Math.floor((11 / fps) * SR);
  let ph = 0;
  for (let i = 0; i < 0.25 * SR; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * (520 * Math.exp(-t * 18) + 140)) / SR;
    add(s0 + i, Math.sin(ph) * Math.exp(-t * 16) * 0.35);
  }
}

// Chime on the logo reveal.
{
  const s0 = Math.floor(((starts[starts.length - 1] + 18) / fps) * SR);
  for (const [m, g] of [
    [77, 0.12],
    [81, 0.09],
    [84, 0.08],
  ]) {
    const f = mtof(m);
    for (let i = 0; i < 2.5 * SR; i++) {
      const t = i / SR;
      const v = (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 4)) * Math.exp(-t * 1.6) * g;
      add(s0 + i, v);
    }
  }
}

// Fade in 30ms, fade out last 1.2s, soft clip.
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const g = Math.min(1, t / 0.03) * Math.min(1, (N / SR - t) / 1.2);
  L[i] = Math.tanh(L[i] * g * 1.2);
  R[i] = Math.tanh(R[i] * g * 1.2);
}

const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0);
out.writeUInt32LE(36 + N * 4, 4);
out.write('WAVEfmt ', 8);
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20);
out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 4, 28);
out.writeUInt16LE(4, 32);
out.writeUInt16LE(16, 34);
out.write('data', 36);
out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
}
fs.writeFileSync(process.argv[2] ?? 'music.wav', out);
console.log(`wrote ${totalFrames} frames / ${(N / SR).toFixed(2)}s`);
