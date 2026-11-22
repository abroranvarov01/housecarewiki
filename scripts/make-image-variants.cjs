// Writes smaller WebP copies of public/images/* into public/images/w480 and public/images/w800 so <img srcset>
// can send phones a small file instead of the 1000-1600px original. Runs before `next dev` and `next build`;
// the copies are build output (gitignored), and only missing or outdated ones are regenerated.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES = path.join(__dirname, '..', 'public', 'images');
// Keep in sync with VARIANT_WIDTHS in src/lib/responsive-image.ts.
const WIDTHS = [480, 800];
// Lower quality on the larger copy keeps it well under the originals' 120 KB budget.
const QUALITY = { 480: 68, 800: 60 };

async function main() {
  for (const w of WIDTHS) fs.mkdirSync(path.join(IMAGES, `w${w}`), { recursive: true });
  let made = 0;
  for (const file of fs.readdirSync(IMAGES)) {
    if (!/\.(webp|jpe?g|png)$/i.test(file)) continue;
    const src = path.join(IMAGES, file);
    const srcTime = fs.statSync(src).mtimeMs;
    for (const w of WIDTHS) {
      const out = path.join(IMAGES, `w${w}`, file.replace(/\.(webp|jpe?g|png)$/i, '.webp'));
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) continue;
      await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: QUALITY[w], effort: 6 }).toFile(out);
      made++;
    }
  }
  console.log(`image variants: ${made} written`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
