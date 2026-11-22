// Smaller copies of every /images/* file are generated at build time by scripts/make-image-variants.cjs.
// Keep in sync with WIDTHS in that script.
const VARIANT_WIDTHS = [480, 800];
// Originals are 1000-1600px wide; this only tells the browser when the original is worth fetching.
const ORIGINAL_WIDTH = 1536;

/** srcset for a local /images/<file> path, or undefined for anything else (remote, nested, svg). */
export function imageSrcSet(src: string | undefined | null): string | undefined {
  if (!src) return undefined;
  const m = /^\/images\/([^/]+)\.(webp|jpe?g|png)$/i.exec(src);
  if (!m) return undefined;
  const variants = VARIANT_WIDTHS.map((w) => `/images/w${w}/${m[1]}.webp ${w}w`);
  return [...variants, `${src} ${ORIGINAL_WIDTH}w`].join(', ');
}
