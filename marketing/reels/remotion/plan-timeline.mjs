// Derive scene lengths from the voiceover (src/vo.json) and write src/timeline.json.
// Each scene's line starts `lead` frames in; the scene runs `pad` frames past the end of the line
// (the next 14-frame transition starts inside that pad).
import fs from 'node:fs';

const vo = JSON.parse(fs.readFileSync(new URL('./src/vo.json', import.meta.url)));
const fps = 30;
const transition = 14;
const rules = {hook: [3, 12], title: [2, 18], tip1: [2, 12], tip2: [2, 12], tip3: [2, 12], cta: [2, 28]};

const scenes = {};
const voLead = {};
for (const [key, [lead, pad]] of Object.entries(rules)) {
  scenes[key] = lead + Math.ceil(vo.lines[key].duration * fps) + pad;
  voLead[key] = lead;
}
const total = Object.values(scenes).reduce((a, b) => a + b, 0) - (Object.keys(scenes).length - 1) * transition;
fs.writeFileSync(new URL('./src/timeline.json', import.meta.url), JSON.stringify({fps, transition, scenes, voLead}, null, 2) + '\n');
console.log(scenes, `total ${total} frames = ${(total / fps).toFixed(2)}s`);
