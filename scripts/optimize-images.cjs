// Converts public/images/*.jpg|png to compressed WebP and renders PNG app icons from favicon.svg.
// Usage: npm run optimize:images   (requires sharp: `npm i -D sharp`, or set NODE_PATH to a folder with it)
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..', 'public');
const IMAGES = path.join(ROOT, 'images');
const MAX_WIDTH = { prod: 800, default: 1600 };

async function main() {
  for (const file of fs.readdirSync(IMAGES)) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    const src = path.join(IMAGES, file);
    const out = path.join(IMAGES, file.replace(/\.(jpe?g|png)$/i, '.webp'));
    const width = file.startsWith('prod-') ? MAX_WIDTH.prod : MAX_WIDTH.default;
    await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
    const before = fs.statSync(src).size;
    const after = fs.statSync(out).size;
    console.log(`${file} ${(before / 1024).toFixed(0)}KB -> ${path.basename(out)} ${(after / 1024).toFixed(0)}KB`);
  }

  const svg = fs.readFileSync(path.join(ROOT, 'favicon.svg'));
  await sharp(svg, { density: 600 }).resize(512, 512).png().toFile(path.join(ROOT, 'icon.png'));
  await sharp(svg, { density: 300 }).resize(180, 180).png().toFile(path.join(ROOT, 'apple-icon.png'));
  console.log('icons: icon.png (512), apple-icon.png (180)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
