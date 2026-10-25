// Converts public/images/*.jpg|png to compressed WebP and renders PNG app icons from app-icon.svg.
// Usage: npm run optimize:images   (requires sharp: `npm i -D sharp`, or set NODE_PATH to a folder with it)
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', 'public');
const IMAGES = path.join(ROOT, 'images');
const MAX_WIDTH = { prod: 800, default: 1600 };
const MAX_BYTES = 120 * 1024;

async function main() {
  for (const file of fs.readdirSync(IMAGES)) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    const src = path.join(IMAGES, file);
    const out = path.join(IMAGES, file.replace(/\.(jpe?g|png)$/i, '.webp'));
    const width = file.startsWith('prod-') ? MAX_WIDTH.prod : MAX_WIDTH.default;
    // Step quality down (then width) until the WebP fits the size budget; busy textures can blow past it at q78.
    fit: for (const w of [width, Math.min(width, 1200), Math.min(width, 1000)]) {
      for (let quality = 78; quality >= 50; quality -= 6) {
        await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality }).toFile(out);
        if (fs.statSync(out).size <= MAX_BYTES) break fit;
      }
    }
    const before = fs.statSync(src).size;
    const after = fs.statSync(out).size;
    console.log(`${file} ${(before / 1024).toFixed(0)}KB -> ${path.basename(out)} ${(after / 1024).toFixed(0)}KB`);
  }

  // Home-screen icons use the forest-green app tile; the browser-tab favicon stays the cream favicon.svg.
  const svg = fs.readFileSync(path.join(ROOT, 'app-icon.svg'));
  await sharp(svg, { density: 600 }).resize(512, 512).png().toFile(path.join(ROOT, 'icon.png'));
  await sharp(svg, { density: 300 }).resize(180, 180).png().toFile(path.join(ROOT, 'apple-icon.png'));
  console.log('icons: icon.png (512), apple-icon.png (180)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
