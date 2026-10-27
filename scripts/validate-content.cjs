// Content validator, run before every build (npm prebuild). Fails the build on missing required
// fields, duplicate titles / intents, broken cross-references, missing images and raw markdown.
// Length issues are reported as warnings.
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

function loadTs(file) {
  const source = fs.readFileSync(file, 'utf-8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  });
  const m = new Module(file);
  m.filename = file;
  m.paths = Module._nodeModulePaths(path.dirname(file));
  // Resolve relative imports between lib files (e.g. seed-data -> site) to their .ts sources.
  m.require = (id) => (id.startsWith('.') ? loadTs(require.resolve(path.join(path.dirname(file), id) + '.ts')) : require(id));
  m._compile(outputText, file);
  return m.exports;
}

const data = loadTs(path.join(ROOT, 'src/lib/seed-data.ts'));
const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const productIds = new Set(data.PRODUCTS.map((p) => p.id));
const authorSlugs = new Set(data.AUTHORS.map((a) => a.slug));
const roomSlugs = new Set(data.ROOM_CATEGORIES.map((r) => r.slug));

function localImageExists(src) {
  return !src.startsWith('/') || fs.existsSync(path.join(PUBLIC, src));
}

const RAW_MARKUP = /\*\*|\]\(|^#{1,6}\s|<a\s|https?:\/\/\S+/m;
function checkText(where, field, value) {
  if (typeof value === 'string' && RAW_MARKUP.test(value)) err(where, `raw markdown/link in "${field}"`);
}

function checkUnique(items, key, label) {
  const seen = new Map();
  for (const item of items) {
    const v = String(key(item) || '').trim().toLowerCase();
    if (!v) continue;
    if (seen.has(v)) err(label, `"${key(item)}" is used by both ${seen.get(v)} and ${item.slug}`);
    else seen.set(v, item.slug);
  }
}

// Articles
for (const a of data.ARTICLES) {
  const where = `article ${a.slug}`;
  for (const field of ['title', 'subtitle', 'quickAnswer', 'authorSlug', 'heroImage', 'heroImageAlt', 'updatedAt', 'publishedAt']) {
    if (!a[field]) err(where, `missing required field "${field}"`);
  }
  if (!a.seo || !a.seo.title || !a.seo.description || !a.seo.focusKeyword) err(where, 'missing seo.title / seo.description / seo.focusKeyword');
  if (!a.faqs || a.faqs.length === 0) err(where, 'needs at least one FAQ');
  if (!a.sources || a.sources.length === 0) err(where, 'needs at least one primary source');
  if (!authorSlugs.has(a.authorSlug)) err(where, `unknown author "${a.authorSlug}"`);
  if (!roomSlugs.has(a.roomSlug)) err(where, `unknown room "${a.roomSlug}"`);
  if (!localImageExists(a.heroImage)) err(where, `hero image not found: ${a.heroImage}`);
  for (const id of a.recommendedProductIds || []) if (!productIds.has(id)) err(where, `unknown product "${id}"`);
  if (a.topPickProductId && !productIds.has(a.topPickProductId)) err(where, `unknown top pick "${a.topPickProductId}"`);
  if (a.routeType === 'best' && (!a.recommendedProductIds || a.recommendedProductIds.length < 2)) err(where, 'best-of list needs 2+ products');
  for (const field of ['title', 'subtitle', 'quickAnswer']) checkText(where, field, a[field]);
  for (const f of a.faqs || []) checkText(where, 'faq', `${f.question} ${f.answer}`);
  for (const s of a.steps || []) checkText(where, `step ${s.stepNumber}`, s.instruction);

  if (a.seo) {
    if (a.seo.title.length > 60) warn(where, `seo.title is ${a.seo.title.length} chars (max 60)`);
    if (a.seo.description.length < 140 || a.seo.description.length > 160) warn(where, `seo.description is ${a.seo.description.length} chars (140–160)`);
  }
  const sentences = (a.quickAnswer || '').split(/[.!?](\s|$)/).filter((s) => s && s.trim()).length;
  if (sentences > 5) warn(where, `quickAnswer has ~${sentences} sentences (2–5)`);
}
checkUnique(data.ARTICLES, (a) => a.slug, 'duplicate slug');
checkUnique(data.ARTICLES, (a) => a.title, 'duplicate H1/title');
checkUnique(data.ARTICLES, (a) => a.seo && a.seo.title, 'duplicate seo.title');
checkUnique(data.ARTICLES, (a) => a.seo && a.seo.focusKeyword, 'duplicate intent (focusKeyword)');

// Products
for (const p of data.PRODUCTS) {
  const where = `product ${p.slug}`;
  if (!/^[A-Z0-9]{10}$/.test(p.asin)) err(where, `invalid ASIN "${p.asin}"`);
  if (!p.amazonUrl.includes(`/dp/${p.asin}`)) err(where, 'amazonUrl does not point to its ASIN');
  if (!p.amazonUrl.includes(`tag=${p.trackingTag}`)) err(where, 'amazonUrl is missing the tracking tag');
  if (!localImageExists(p.image)) err(where, `image not found: ${p.image}`);
  for (const id of [p.id, p.slug]) if (!id) err(where, 'missing id/slug');
}
checkUnique(data.PRODUCTS, (p) => p.slug, 'duplicate product slug');
checkUnique(data.PRODUCTS, (p) => p.asin, 'duplicate ASIN');

// Rooms, surfaces, comparisons
for (const r of data.ROOM_CATEGORIES) {
  for (const id of r.featuredProductIds) if (!productIds.has(id)) err(`room ${r.slug}`, `unknown product "${id}"`);
  if (!localImageExists(r.heroImage)) err(`room ${r.slug}`, `hero image not found: ${r.heroImage}`);
}
for (const s of data.SURFACE_GUIDES) {
  for (const id of s.recommendedProductIds) if (!productIds.has(id)) err(`surface ${s.slug}`, `unknown product "${id}"`);
}
for (const c of data.COMPARISONS) {
  for (const id of [c.productAId, c.productBId, c.winnerId]) if (!productIds.has(id)) err(`comparison ${c.slug}`, `unknown product "${id}"`);
}

for (const w of warnings) console.warn(`  warn  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);
console.log(`Content validation: ${errors.length} error(s), ${warnings.length} warning(s).`);
if (errors.length) process.exit(1);
