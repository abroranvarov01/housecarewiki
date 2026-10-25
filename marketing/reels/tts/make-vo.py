"""Generate the voiceover with Kokoro (local, Apache-2.0) and word timings for on-screen captions.

Each phrase (split at , . ? !) is synthesized on its own and joined with fixed pauses, so phrase timings
are exact; words inside a phrase are timed in proportion to their length.

Usage: tts/.venv/bin/python tts/make-vo.py <out_dir> <timings.json> [voice] [speed]
"""
import json
import re
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
SR = 24000
PAUSE = {',': 0.14, '.': 0.30, '?': 0.30, '!': 0.30}


def trim(a, thresh=0.01):
    idx = np.where(np.abs(a) > thresh)[0]
    if len(idx) == 0:
        return a
    return a[max(0, idx[0] - int(0.02 * SR)) : idx[-1] + int(0.04 * SR)]


def norm(w):
    return re.sub(r'[^a-z0-9]', '', w.lower().replace('’', "'"))


def main(out_dir, timings_path, voice=None, speed=None):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    cfg = json.loads((HERE / 'vo-script.json').read_text())
    if voice:
        cfg['voice'] = voice
    if speed:
        cfg['speed'] = float(speed)
    kokoro = Kokoro(str(HERE / 'models/kokoro-v1.0.onnx'), str(HERE / 'models/voices-v1.0.bin'))
    result = {'voice': cfg['voice'], 'lines': {}}

    for key, line in cfg['lines'].items():
        phrases = re.findall(r'[^,.?!]+[,.?!]?', line['say'])
        audio, say_words, t = [], [], 0.0
        for ph in phrases:
            ph = ph.strip()
            if not ph:
                continue
            samples, _ = kokoro.create(ph, voice=cfg['voice'], speed=cfg['speed'], lang='en-us')
            samples = trim(samples)
            dur = len(samples) / SR
            words = ph.split()
            weights = [len(norm(w)) + 2 for w in words]
            total = sum(weights)
            acc = t
            for w, wt in zip(words, weights):
                d = dur * wt / total
                say_words.append({'w': w, 'start': acc, 'end': acc + d})
                acc += d
            gap = PAUSE.get(ph[-1], 0.1)
            audio.append(samples)
            audio.append(np.zeros(int(gap * SR), dtype=samples.dtype))
            t += dur + gap
        audio = np.concatenate(audio[:-1])
        sf.write(out_dir / f'{key}.wav', audio, SR)

        # Map displayed words onto spoken words ("House Care Wiki dot com" -> "HouseCareWiki.com", leading "One." skipped).
        shown, i = [], 0
        for sw in line['show'].split():
            target = norm(sw)
            while i < len(say_words) and not target.startswith(norm(say_words[i]['w']).replace('dot', '')):
                i += 1
            start, got = say_words[i]['start'], ''
            while i < len(say_words) and got != target:
                got += norm(say_words[i]['w']).replace('dot', '') if say_words[i]['w'] == 'dot' else norm(say_words[i]['w'])
                end = say_words[i]['end']
                i += 1
            shown.append({'w': sw, 'start': round(start, 3), 'end': round(end, 3)})
        result['lines'][key] = {'duration': round(len(audio) / SR, 3), 'words': shown}
        print(f'{key}: {len(audio) / SR:.2f}s')

    Path(timings_path).write_text(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main(*sys.argv[1:5])
