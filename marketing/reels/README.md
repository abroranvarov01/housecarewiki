# HouseCareWiki Reels

- `01-coffee-couch/`: deliverables (`reel.mp4`, `cover.jpg`, `caption.txt`).
- `remotion/`: the Remotion project (JSX, so the site's TypeScript build ignores it).
- `tts/`: Kokoro voiceover (local, Apache-2.0). Script and voice in `tts/vo-script.json`.

All audio is original: Kokoro TTS voice + a soundtrack synthesized by `remotion/gen-music.mjs`.
All illustrations are vector art in code; no site photos are used.

## Rebuild

```bash
# one-time: TTS venv + model (~350 MB, git-ignored)
python3 -m venv tts/.venv && tts/.venv/bin/pip install kokoro-onnx soundfile
curl -L -o tts/models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -L -o tts/models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
cd remotion && npm install && cd ..

# 1. voice + word timings, normalized to -16 LUFS
tts/.venv/bin/python tts/make-vo.py /tmp/vo-raw remotion/src/vo.json
for f in /tmp/vo-raw/*.wav; do ffmpeg -y -i $f -af loudnorm=I=-16:TP=-1.5 -ar 48000 remotion/public/vo/$(basename $f); done

# 2. scene lengths from the voice, then the music bed (ducks under the voice)
cd remotion
node plan-timeline.mjs
node gen-music.mjs /tmp/music-raw.wav && ffmpeg -y -i /tmp/music-raw.wav -af loudnorm=I=-23:TP=-3 -ar 48000 public/music.wav

# 3. render, then encode for Instagram at -14 LUFS
npx remotion render src/index.jsx CoffeeCouch /tmp/mix.mov --codec=prores --audio-codec=pcm-16
ffmpeg -y -i /tmp/mix.mov -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -movflags +faststart ../01-coffee-couch/reel.mp4
npx remotion still src/index.jsx Cover /tmp/cover.png && ffmpeg -y -i /tmp/cover.png -q:v 2 ../01-coffee-couch/cover.jpg
```
