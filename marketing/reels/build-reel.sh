#!/bin/zsh
# Rebuild a reel end to end: ./build-reel.sh <out.mp4> [voice] [speed]
set -e
cd "${0:A:h}"
OUT=${1:A}; VOICE=$2; SPEED=$3
TMP=$(mktemp -d)
tts/.venv/bin/python tts/make-vo.py $TMP/vo remotion/src/vo.json $VOICE $SPEED 2>/dev/null
for f in $TMP/vo/*.wav; do ffmpeg -y -loglevel error -i $f -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 remotion/public/vo/${f:t}; done
cd remotion
node plan-timeline.mjs
node gen-music.mjs $TMP/music-raw.wav
ffmpeg -y -loglevel error -i $TMP/music-raw.wav -af loudnorm=I=-23:TP=-3 -ar 48000 public/music.wav
npx remotion render src/index.jsx CoffeeCouch $TMP/mix.mov --codec=prores --audio-codec=pcm-16 --log=error
ffmpeg -y -loglevel error -i $TMP/mix.mov -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -movflags +faststart $OUT
echo "built $OUT"
