'use client';

// Client UI for the interactive tools. All answers come from the rule-based logic in src/lib/tools-engine.ts;
// this file only collects answers and lays out the result. Results recompute on every change (the work is a few
// array lookups), so there is no submit step.
import React, { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Printer, RotateCcw } from 'lucide-react';
import {
  solveStain,
  findEquipment,
  relatedGuide,
  SURFACE_COMPATIBILITY_MATRIX,
  STAIN_OPTIONS,
  SURFACE_OPTIONS,
  StainSolverInput,
  EquipmentFinderInput,
  SurfaceCompatibilityEntry,
} from '@/lib/tools-engine';
import type { Product } from '@/lib/types';
import { AffiliateDisclosureNote, EditorScore, AffiliateButton } from '@/components/ui/Badges';

/* -------------------------------------------------------------------------------------------------
 * Shared building blocks
 * -----------------------------------------------------------------------------------------------*/

type Option<T extends string> = { value: T; label: string; hint?: string };

/** A numbered question rendered as a real radio group, with each option styled as a chip. */
function ChoiceGroup<T extends string>({
  step,
  legend,
  name,
  value,
  options,
  onChange,
  help,
}: {
  step?: number;
  legend: string;
  name: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  help?: React.ReactNode;
}) {
  const helpId = useId();
  return (
    <fieldset className="min-w-0" aria-describedby={help ? helpId : undefined}>
      <legend className="mb-3 flex items-center gap-2.5 text-[17px] font-semibold leading-snug text-ink">
        {step !== undefined && (
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-[13px] font-semibold text-terracotta-deep" aria-hidden="true">
            {step}
          </span>
        )}
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="relative inline-flex cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-rule-strong bg-paper-card px-4 text-[15px] text-ink-secondary transition-colors duration-150 hover:border-ink hover:text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper-light peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terracotta-deep">
              {o.label}
              {o.hint && <span className="text-[13px] opacity-80">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {help && (
        <p id={helpId} className="mt-2.5 text-[14px] leading-snug text-ink-muted">
          {help}
        </p>
      )}
    </fieldset>
  );
}

/** Soft panel that holds the questions. */
function QuestionPanel({ children, title = 'Your answers', note }: { children: React.ReactNode; title?: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-paper-warm/70 p-5 sm:p-7 print:hidden">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
        {note && <p className="mt-1 text-[15px] text-ink-muted">{note}</p>}
      </div>
      <div className="space-y-7">{children}</div>
    </div>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <h3 className="kicker mb-3 text-ink-muted">{children}</h3>;
}

function stripNumber(title: string) {
  return title.replace(/^\s*\d+\.\s*/, '');
}

function SafetyBox({ title = 'Safety check', items }: { title?: string; items: string[] }) {
  return (
    <aside className="rounded-lg border-l-4 border-terracotta bg-terracotta-soft/70 px-4 py-4 sm:px-5">
      <p className="kicker mb-2 text-terracotta-deep">{title}</p>
      <ul className="space-y-1.5 text-[0.9375rem] leading-relaxed text-ink-secondary">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[0.75rem_1fr] gap-2">
            <span className="mt-[0.6em] h-1.5 w-1.5 rounded-full bg-terracotta" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Compact product rows: name, our rating, Amazon link. No prices (they change and we don't track them). */
function ProductRows({ products, contentSlug, heading }: { products: Product[]; contentSlug: string; heading: string }) {
  if (!products.length) return null;
  return (
    <div className="print:hidden">
      <SubHead>{heading}</SubHead>
      <AffiliateDisclosureNote className="mb-3" />
      <ul className="divide-y divide-rule border-y border-rule">
        {products.map((p, i) => (
          <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
            <div className="h-14 w-14 shrink-0 rounded-lg bg-white p-1">
              <img src={p.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/products/${p.slug}`} className="text-[15px] font-semibold leading-snug text-ink hover:text-terracotta-deep hover:underline underline-offset-2">
                {p.shortName}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <EditorScore score={p.scores.overall} size="xs" />
                <span className="text-[13px] text-ink-muted">{p.badge || p.bestFor}</span>
              </div>
            </div>
            <AffiliateButton
              productId={p.id}
              productName={p.name}
              asin={p.asin}
              amazonUrl={p.amazonUrl}
              contentSlug={contentSlug}
              placement={`tool_result_${i + 1}`}
              variant="compact"
              className="min-h-[44px]"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Stain Solution Finder
 * -----------------------------------------------------------------------------------------------*/

const AGE_OPTIONS: Option<StainSolverInput['stainAge']>[] = [
  { value: 'fresh', label: 'Just happened' },
  { value: 'dried-24h', label: 'Dried, under a day' },
  { value: 'set-in-old', label: 'Older, set in' },
];

const CODE_OPTIONS: Option<NonNullable<StainSolverInput['upholsteryCode']>>[] = [
  { value: 'W', label: 'W', hint: 'water' },
  { value: 'WS', label: 'WS', hint: 'water or solvent' },
  { value: 'S', label: 'S', hint: 'solvent only' },
  { value: 'unknown', label: 'Not sure' },
];

const SURFACE_PHRASE: Record<StainSolverInput['surface'], string> = {
  'fabric-sofa': 'a fabric sofa',
  'carpet-rug': 'carpet or a rug',
  mattress: 'a mattress',
  'cotton-laundry': 'clothes or laundry',
  'tile-grout': 'tile and grout',
  hardwood: 'a hardwood floor',
};

/** Plain-language reasons and extra cautions for the chosen combination, shown next to the steps. */
function explainStain(input: StainSolverInput): { why: string[]; cautions: string[]; consultPro: boolean } {
  const why: string[] = [];
  const cautions: string[] = [];
  let consultPro = false;
  const { stainType, surface, stainAge, upholsteryCode } = input;
  const solventOnly = surface === 'fabric-sofa' && upholsteryCode === 'S';

  if (surface === 'fabric-sofa') {
    if (upholsteryCode === 'S') why.push('Because your fabric is code S, water is off the table. These steps use a dry-cleaning solvent only.');
    else if (upholsteryCode === 'unknown')
      cautions.push(
        'You’re not sure of the cleaning code, so check the tag first (usually under a seat cushion or on the frame). Until you know, test on a hidden spot and stop if you see a ring or color change. If the tag says S or X, don’t use these water-based steps.',
      );
    else why.push(`Code ${upholsteryCode} means the fabric can take water-based cleaners, so a mild soap solution is fine.`);
  }

  if (!solventOnly) {
    if (stainType === 'coffee') why.push('Coffee’s brown color comes from tannins. A mild acid like white vinegar helps loosen them; heat can set them.');
    if (stainType === 'red-wine')
      why.push('Red wine and juice are tannin-and-dye stains. Blot, don’t rub, and stick to cool water. An oxygen-based stain remover can help with any faint mark left over, after a spot test.');
    if (stainType === 'grease-oil')
      why.push('Grease doesn’t dissolve in water alone; the dish soap is what breaks it down. On fabric, sprinkle baking soda or cornstarch first to soak up oil, wait 15 minutes, then brush it off.');
    if (stainType === 'ink')
      why.push('Ink is a dye. Rubbing alcohol dabbed on with a white cloth often lifts ballpoint ink, but it can also lift dye from fabric, so test it first.');
    if (stainType === 'mud-dirt')
      why.push('Let mud dry completely, then brush or vacuum off as much as you can before using any liquid. Wet mud smears deeper.');
    if (stainType === 'pet-urine')
      why.push('Enzyme cleaners break down the compounds that cause the smell. Ordinary soap can leave enough behind that your pet still smells it.');
    if (stainType === 'mold-mildew' && surface === 'tile-grout')
      why.push('Mold on tile and grout is usually a surface problem that a paste and a brush can handle.');
  }

  if (surface === 'tile-grout' && !['mold-mildew', 'coffee', 'pet-urine'].includes(stainType))
    why.push('On tile and grout most stains respond to the same paste-and-brush method, so these grout steps apply to your stain too.');
  if (surface === 'tile-grout' && (stainType === 'coffee' || stainType === 'pet-urine'))
    cautions.push('These steps are written for fabric. On sealed tile, wipe up first and use much less liquid; scrub the grout lines with the soap mixture and a brush.');

  if (stainType === 'mold-mildew' && surface !== 'tile-grout') {
    consultPro = true;
    cautions.push(
      'These steps are written for tile and grout. Mold on fabric, a mattress, carpet or wood usually means moisture got inside. Peroxide can bleach fabric and soaking can make it worse. Washable fabric can go through the wash if the care label allows; for anything else, we suggest a professional.',
    );
  }

  if (surface === 'hardwood') {
    cautions.push('On hardwood, use as little liquid as possible: wring the cloth nearly dry and wipe up moisture right away. Don’t use a spot cleaner or steam on wood, and check your floor maker’s care guide.');
    if (stainType === 'pet-urine') {
      consultPro = true;
      cautions.push('Urine that has soaked into wood can stain and smell for good. If the boards have darkened, a flooring professional may need to sand or replace them.');
    }
  }
  if (surface === 'mattress')
    why.push('A mattress can’t be rinsed through, so use as little liquid as you can and let it dry completely before making the bed. Trapped moisture can lead to mildew.');
  if (surface === 'carpet-rug') why.push('Carpet has a backing and pad underneath. Blot rather than pour, so the stain doesn’t spread down where you can’t reach it.');
  if (surface === 'cotton-laundry')
    why.push('Washable fabric is the easy case: after treating, wash on the warmest setting the care label allows, and check the stain is gone before using the dryer. Dryer heat can set what’s left.');

  if (stainAge === 'fresh') why.push('Fresh stains come out most easily, and blotting quickly does a lot of the work.');
  else
    why.push(
      stainAge === 'set-in-old'
        ? 'Older stains have bonded with the material, so expect to repeat the treatment, and accept that some may not come out completely.'
        : 'A dried stain usually needs a longer soak or a second round.',
    );

  return { why, cautions, consultPro };
}

export function StainFinderTool({
  initialStain,
  initialSurface,
}: {
  initialStain?: StainSolverInput['stainType'];
  initialSurface?: StainSolverInput['surface'];
} = {}) {
  const [stainType, setStainType] = useState<StainSolverInput['stainType']>(initialStain ?? 'coffee');
  const [surface, setSurface] = useState<StainSolverInput['surface']>(initialSurface ?? 'fabric-sofa');
  const [stainAge, setStainAge] = useState<StainSolverInput['stainAge']>('fresh');
  const [upholsteryCode, setUpholsteryCode] = useState<StainSolverInput['upholsteryCode']>('WS');

  const input: StainSolverInput = { stainType, surface, stainAge, upholsteryCode };
  const result = useMemo(() => solveStain({ stainType, surface, stainAge, upholsteryCode }), [stainType, surface, stainAge, upholsteryCode]);
  const { why, cautions, consultPro } = explainStain(input);
  const guide = relatedGuide(result.relatedGuideSlug);
  const diy = result.safeToDIY && !consultPro;
  const stainLabel = STAIN_OPTIONS.find((o) => o.value === stainType)?.label ?? 'Stain';

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <QuestionPanel title="Tell us about the stain" note="Change any answer and the steps update right away.">
          <ChoiceGroup
            step={1}
            legend="What spilled?"
            name="stain"
            value={stainType}
            options={STAIN_OPTIONS}
            onChange={setStainType}
            help="Pick the closest match."
          />
          <ChoiceGroup
            step={2}
            legend="What did it land on?"
            name="surface"
            value={surface}
            options={SURFACE_OPTIONS}
            onChange={setSurface}
            help="The material decides which cleaners are safe to use."
          />
          <ChoiceGroup
            step={3}
            legend="How long ago?"
            name="age"
            value={stainAge}
            options={AGE_OPTIONS}
            onChange={setStainAge}
            help="Fresh stains come out most easily."
          />
          {surface === 'fabric-sofa' && (
            <ChoiceGroup
              step={4}
              legend="What letter is on the sofa tag?"
              name="code"
              value={upholsteryCode ?? 'unknown'}
              options={CODE_OPTIONS}
              onChange={setUpholsteryCode}
              help="Look for a letter on the tag under a cushion or on the frame. X means vacuum only: call a professional."
            />
          )}
        </QuestionPanel>
      </div>

      <section className="lg:col-span-7" aria-labelledby="stain-answer">
        <div className="overflow-hidden rounded-2xl border border-rule bg-paper-card shadow-card">
          <div className="border-b border-rule p-5 sm:p-6" aria-live="polite">
            <p className="kicker text-ink-muted">Your answer</p>
            <h2 id="stain-answer" className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight text-ink sm:text-3xl">
              {stainLabel} on {SURFACE_PHRASE[surface]}
            </h2>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-[14px]">
              <div>
                <dt className="kicker text-ink-muted">Can I do it myself?</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
                      diy ? 'bg-leaf-soft text-leaf-deep' : 'bg-terracotta-soft text-terracotta-deep'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${diy ? 'bg-leaf-deep' : 'bg-terracotta'}`} aria-hidden="true" />
                    {diy ? 'Yes, safe to DIY with care' : result.safeToDIY ? 'Small spots only; consider a pro' : 'Careful: solvent only, or call a pro'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="kicker text-ink-muted">Effort</dt>
                <dd className="mt-1 font-semibold text-ink">{result.difficulty}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-7 p-5 sm:p-6">
            <SafetyBox items={[result.chemicalHazardWarning, result.surfaceWarning, ...cautions]} />

            <div>
              <SubHead>Why these steps</SubHead>
              <ul className="space-y-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
                {why.map((w) => (
                  <li key={w} className="grid grid-cols-[1rem_1fr] gap-2">
                    <ArrowRight className="mt-1 h-3.5 w-3.5 text-terracotta-deep" aria-hidden="true" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SubHead>You’ll need</SubHead>
              <ul className="space-y-2">
                {result.suppliesNeeded.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-[0.9375rem] text-ink">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border border-ink" aria-hidden="true">
                      <Check className="h-3.5 w-3.5 text-leaf-deep" />
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SubHead>Steps</SubHead>
              <ol className="divide-y divide-rule border-y border-rule">
                {result.steps.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[2.25rem_1fr] gap-2 py-4">
                    <span className="kicker pt-1 text-terracotta-deep">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="font-semibold text-ink">{stripNumber(s.title)}</p>
                      <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-secondary">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border-l-4 border-leaf bg-leaf-soft/60 px-4 py-4 sm:px-5">
              <p className="kicker mb-1.5 text-leaf-deep">When to call a pro</p>
              <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">{result.whenToCallPro}</p>
            </div>

            <p className="text-[0.9375rem]">
              <span className="text-ink-muted">{guide.isBuyingGuide ? 'Choosing a machine? ' : 'More detail: '}</span>
              <Link href={guide.href} className="link font-semibold">
                {guide.title}
              </Link>
            </p>

            <ProductRows
              // Spot cleaners are carpet and upholstery tools; on wood they would be the wrong suggestion.
              products={surface === 'hardwood' ? [] : result.recommendedProducts}
              contentSlug="stain-finder-tool" heading="Tools that can help" />
          </div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Cleaning Equipment Finder
 * -----------------------------------------------------------------------------------------------*/

const SPACE_OPTIONS: Option<EquipmentFinderInput['space']>[] = [
  { value: 'carpet-upholstery', label: 'Carpets, rugs and sofas' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'pet-areas', label: 'Pet areas' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'whole-home', label: 'All over the house' },
];

const NEED_OPTIONS: Option<EquipmentFinderInput['need']>[] = [
  { value: 'deep-stains', label: 'Lift spills and stains' },
  { value: 'scrub-tile-grout', label: 'Scrub tile and grout' },
  { value: 'pet-hair', label: 'Remove pet hair' },
  { value: 'steam-sanitize', label: 'Clean with steam, no sprays' },
  { value: 'organize-storage', label: 'Organize under the sink' },
];

export function EquipmentFinderTool() {
  const [space, setSpace] = useState<EquipmentFinderInput['space']>('carpet-upholstery');
  const [need, setNeed] = useState<EquipmentFinderInput['need']>('deep-stains');

  // Budget and power are left at "any": product prices change daily and we don't track them, and the
  // engine has no power data to filter on, so asking would suggest a precision the tool doesn't have.
  const matches = useMemo(() => findEquipment({ space, need, budget: 'any', powerPreference: 'any' }), [space, need]);
  const [lead, ...rest] = matches;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <QuestionPanel note="Two questions. Change either one.">
          <ChoiceGroup step={1} legend="Where are you cleaning?" name="space" value={space} options={SPACE_OPTIONS} onChange={setSpace} />
          <ChoiceGroup step={2} legend="What’s the job?" name="need" value={need} options={NEED_OPTIONS} onChange={setNeed} />
          <p className="border-t border-rule pt-4 text-[13px] leading-relaxed text-ink-muted">
            We don’t filter by price. Prices change often and we don’t track them, so check the current price on Amazon.
          </p>
        </QuestionPanel>
      </div>

      <section className="lg:col-span-8" aria-labelledby="equipment-answer">
        <div className="border-t border-rule-strong pt-4" aria-live="polite">
          <p className="kicker text-ink-muted">Best fit for your answers</p>
          <h2 id="equipment-answer" className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight text-ink sm:text-3xl">
            {lead ? lead.product.shortName : 'No close match'}
          </h2>
        </div>

        {lead && (
          <>
            <AffiliateDisclosureNote className="mt-3" />
            <article className="mt-5 grid gap-5 rounded-2xl border border-rule bg-paper-card shadow-card p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
              <div className="aspect-square w-32 bg-paper p-2 sm:w-36">
                <img src={lead.product.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="kicker text-terracotta-deep">01 · Closest match</span>
                  <EditorScore score={lead.product.scores.overall} size="xs" />
                </div>
                <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink">
                  <Link href={`/products/${lead.product.slug}`} className="hover:text-terracotta-deep hover:underline underline-offset-2">
                    {lead.product.name}
                  </Link>
                </h3>
                <p className="kicker mt-4 text-ink-muted">Why it fits</p>
                <ul className="mt-2 space-y-1.5 text-[0.9375rem] leading-relaxed text-ink-secondary">
                  {lead.reasons.map((r) => (
                    <li key={r} className="grid grid-cols-[1rem_1fr] gap-2">
                      <Check className="mt-1 h-3.5 w-3.5 text-leaf-deep" aria-hidden="true" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  <AffiliateButton
                    productId={lead.product.id}
                    productName={lead.product.name}
                    asin={lead.product.asin}
                    amazonUrl={lead.product.amazonUrl}
                    contentSlug="equipment-finder"
                    placement="match_1"
                  />
                  <Link
                    href={`/products/${lead.product.slug}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded border border-ink px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-ink hover:text-paper-light"
                  >
                    Read our review
                  </Link>
                </div>
              </div>
            </article>

            {rest.length > 0 && (
              <div className="mt-8">
                <SubHead>Also worth a look</SubHead>
                <ol className="divide-y divide-rule border-y border-rule">
                  {rest.map(({ product, reasons }, i) => (
                    <li key={product.id} className="grid gap-3 py-4 sm:grid-cols-[2.25rem_1fr_auto] sm:items-start">
                      <span className="kicker pt-1 text-terracotta-deep">{String(i + 2).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <Link href={`/products/${product.slug}`} className="font-semibold text-ink hover:text-terracotta-deep hover:underline underline-offset-2">
                          {product.shortName}
                        </Link>
                        <div className="mt-1">
                          <EditorScore score={product.scores.overall} size="xs" />
                        </div>
                        <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">{reasons.join('. ')}.</p>
                      </div>
                      <AffiliateButton
                        productId={product.id}
                        productName={product.name}
                        asin={product.asin}
                        amazonUrl={product.amazonUrl}
                        contentSlug="equipment-finder"
                        placement={`match_${i + 2}`}
                        variant="compact"
                        className="min-h-[44px] justify-self-start"
                      />
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Cleaning Routine Planner
 * -----------------------------------------------------------------------------------------------*/

const HOME_OPTIONS: Option<string>[] = [
  { value: 'Studio or 1-bedroom apartment', label: 'Studio or 1-bed' },
  { value: '2-bedroom apartment or townhouse', label: '2-bed' },
  { value: '3–4 bedroom house', label: '3–4 bed house' },
];

const MINUTE_OPTIONS: Option<string>[] = [10, 15, 20, 30, 45].map((m) => ({ value: String(m), label: `${m} min` }));

const HOME_TIP: Record<string, string> = {
  'Studio or 1-bedroom apartment': 'In a small place, the daily list keeps most mess from building up. Do the weekly tasks in one go if that suits you.',
  '2-bedroom apartment or townhouse': 'Split the weekly list across two or three days so no single day runs long.',
  '3–4 bedroom house': 'In a bigger house, work zone by zone: one floor or area per day for the weekly list.',
};

export function RoutinePlannerTool() {
  const [homeType, setHomeType] = useState('2-bedroom apartment or townhouse');
  const [hasPets, setHasPets] = useState(true);
  const [minutesPerDay, setMinutesPerDay] = useState(15);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (task: string) => {
    setCheckedTasks((prev) => ({ ...prev, [task]: !prev[task] }));
  };

  // Rough minutes per daily task, used only to say how much of the daily time budget is left.
  const dailyTasks: { task: string; minutes: number }[] = [
    { task: 'Squeegee the shower glass and tile walls after showering', minutes: 1 },
    { task: 'Wipe kitchen counters and the cooktop with a mild all-purpose spray', minutes: 5 },
    ...(hasPets ? [{ task: 'Quick pass over sofa cushions with a pet hair roller', minutes: 2 }] : []),
    { task: 'Rinse the kitchen sink and wipe the faucet base dry', minutes: 2 },
  ];
  const dailyMinutes = dailyTasks.reduce((sum, t) => sum + t.minutes, 0);
  const spare = minutesPerDay - dailyMinutes;

  const weeklyTasks = [
    'Scrub bathroom grout lines and the tub with a nylon brush or spin scrubber',
    'Vacuum high-traffic carpet, area rugs and sofa crevices',
    'Mop bathroom and kitchen floors with a mild, low-residue cleaner',
    'Mist shower caulk seams with 3% hydrogen peroxide (never mixed with other cleaners)',
  ];

  const monthlyTasks = [
    'Spot-clean sofa cushions and entry rugs with a portable carpet cleaner',
    'Clean the washing machine door gasket and detergent drawer',
    'Clear out and wipe the under-sink cabinet',
    'Vacuum the fridge coils (check the manual) and the bathroom fan grille',
  ];

  const columns = [
    { label: 'Every day', note: `About ${dailyMinutes} min`, items: dailyTasks.map((t) => t.task) },
    { label: 'Every week', note: 'Spread across the week', items: weeklyTasks },
    { label: 'Every month', note: 'Pick a regular day', items: monthlyTasks },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* Keep the printout to the checklist: hide the site header, footer and skip link on paper. */}
      <style>{`@media print { body > header, body > footer, body > a { display: none !important; } }`}</style>

      <div className="lg:col-span-4">
        <QuestionPanel note="Change any answer; the plan updates.">
          <ChoiceGroup step={1} legend="Your home" name="home" value={homeType} options={HOME_OPTIONS} onChange={setHomeType} />
          <ChoiceGroup
            step={2}
            legend="Pets?"
            name="pets"
            value={hasPets ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Dog or cat' },
              { value: 'no', label: 'No pets' },
            ]}
            onChange={(v) => setHasPets(v === 'yes')}
          />
          <ChoiceGroup
            step={3}
            legend="Time you have each day"
            name="minutes"
            value={String(minutesPerDay)}
            options={MINUTE_OPTIONS}
            onChange={(v) => setMinutesPerDay(Number(v))}
          />
        </QuestionPanel>
      </div>

      <section className="lg:col-span-8" aria-labelledby="routine-answer">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-rule-strong pt-4">
          <div aria-live="polite">
            <p className="kicker text-ink-muted">Your plan</p>
            <h2 id="routine-answer" className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight text-ink sm:text-3xl">
              Cleaning checklist: {homeType}
            </h2>
            <p className="mt-2 text-[0.9375rem] text-ink-secondary">
              {minutesPerDay} minutes a day{hasPets ? ' · includes pet hair tasks' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded bg-ink px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-ink-deep print:hidden"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print checklist
          </button>
        </div>

        <p className="mt-4 max-w-prose text-[0.9375rem] leading-relaxed text-ink-secondary">
          {spare >= 5
            ? `The daily list takes about ${dailyMinutes} minutes, which leaves roughly ${spare} of your ${minutesPerDay}. Use them to chip away at one weekly task a day.`
            : spare >= 0
            ? `The daily list takes about ${dailyMinutes} minutes, close to your ${minutesPerDay}. Save the weekly tasks for a day with more time.`
            : `The daily list takes about ${dailyMinutes} minutes, a bit over your ${minutesPerDay}. Drop the counter wipe-down to every other day if you need to.`}{' '}
          {HOME_TIP[homeType]}
        </p>

        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-3 print:grid-cols-3">
          {columns.map((col) => (
            <div key={col.label} className="bg-paper-card p-5">
              <h3 className="font-serif text-xl font-semibold text-ink">{col.label}</h3>
              <p className="kicker mt-1 text-ink-muted">{col.note}</p>
              <ul className="mt-4 space-y-1">
                {col.items.map((item) => (
                  <li key={item}>
                    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 py-1.5 text-[0.9375rem] leading-snug text-ink">
                      <input
                        type="checkbox"
                        checked={Boolean(checkedTasks[item])}
                        onChange={() => toggleTask(item)}
                        className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
                      />
                      <span className={checkedTasks[item] ? 'text-ink-muted line-through' : ''}>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-ink-muted">Ticks are kept on this screen only and reset when you leave the page.</p>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Cleaning Cost Calculator
 * -----------------------------------------------------------------------------------------------*/

// Example assumptions only: round numbers for illustration, not quotes and not Amazon prices.
const COST_DEFAULTS = {
  machineCost: '120',
  formulaBottleCost: '15',
  usesPerBottle: '10',
  usesPerYear: '12',
  yearsOwned: '4',
  rentalCostPerSession: '40',
  proCleaningPerSession: '150',
};
type CostKey = keyof typeof COST_DEFAULTS;

const COST_FIELDS: { key: CostKey; label: string; unit: 'usd' | 'count'; min: number; group: 'own' | 'use' | 'alt' }[] = [
  { key: 'machineCost', label: 'Portable cleaner price', unit: 'usd', min: 0, group: 'own' },
  { key: 'formulaBottleCost', label: 'Bottle of cleaning formula', unit: 'usd', min: 0, group: 'own' },
  { key: 'usesPerBottle', label: 'Cleans per bottle', unit: 'count', min: 1, group: 'own' },
  { key: 'usesPerYear', label: 'Cleans per year', unit: 'count', min: 1, group: 'use' },
  { key: 'yearsOwned', label: 'Years you’ll keep it', unit: 'count', min: 1, group: 'use' },
  { key: 'rentalCostPerSession', label: 'Renting a machine, per clean', unit: 'usd', min: 0, group: 'alt' },
  { key: 'proCleaningPerSession', label: 'Hiring a pro, per visit', unit: 'usd', min: 0, group: 'alt' },
];

function toNumber(raw: string, min: number) {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(min, n) : min;
}

const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export function CostCalculatorTool() {
  const [values, setValues] = useState<Record<CostKey, string>>(COST_DEFAULTS);
  const set = (key: CostKey, raw: string) => setValues((prev) => ({ ...prev, [key]: raw }));
  const n = (key: CostKey) => toNumber(values[key], COST_FIELDS.find((f) => f.key === key)!.min);

  const machineCost = n('machineCost');
  const usesPerYear = n('usesPerYear');
  const yearsOwned = n('yearsOwned');
  const rental = n('rentalCostPerSession');
  const pro = n('proCleaningPerSession');

  const totalUses = usesPerYear * yearsOwned;
  const formulaCostPerUse = n('formulaBottleCost') / n('usesPerBottle');
  const totalOwnCost = machineCost + totalUses * formulaCostPerUse;
  const costPerUseOwn = totalOwnCost / totalUses;
  const breakEven = rental > formulaCostPerUse ? Math.ceil(machineCost / (rental - formulaCostPerUse)) : null;

  const options = [
    { id: 'own', label: 'Buy a portable cleaner', perClean: costPerUseOwn, total: totalOwnCost },
    { id: 'rent', label: 'Rent a machine', perClean: rental, total: rental * totalUses },
    { id: 'pro', label: 'Hire a pro', perClean: pro, total: pro * totalUses },
  ];
  const cheapest = options.reduce((a, b) => (b.perClean < a.perClean ? b : a));

  const groups: { id: 'own' | 'use' | 'alt'; title: string }[] = [
    { id: 'own', title: 'Owning' },
    { id: 'use', title: 'How often' },
    { id: 'alt', title: 'The alternatives' },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div className="border-t border-rule-strong pt-4">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold text-ink">Your cost assumptions</h2>
            <button
              type="button"
              onClick={() => setValues(COST_DEFAULTS)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded px-2 text-sm font-semibold text-terracotta-deep hover:bg-leaf-soft"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset examples
            </button>
          </div>
          <p className="mb-6 text-[14px] leading-relaxed text-ink-secondary">
            Edit any number. The starting values are round example figures, not quotes or Amazon prices. Put in the prices you
            actually see where you live.
          </p>

          <div className="space-y-7">
            {groups.map((g, gi) => (
              <fieldset key={g.id}>
                <legend className="kicker mb-3 text-ink">
                  <span className="text-terracotta-deep">{gi + 1} · </span>
                  {g.title}
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  {COST_FIELDS.filter((f) => f.group === g.id).map((f) => (
                    <label key={f.key} className="block">
                      <span className="mb-1.5 block text-[14px] font-medium text-ink-secondary">{f.label}</span>
                      <span className="flex h-12 items-center rounded-lg border border-rule-field bg-paper-card focus-within:border-ink focus-within:outline focus-within:outline-2 focus-within:outline-terracotta-deep">
                        {f.unit === 'usd' && <span className="pl-3 font-mono text-ink-muted" aria-hidden="true">$</span>}
                        <input
                          type="number"
                          inputMode="decimal"
                          min={f.min}
                          step="any"
                          value={values[f.key]}
                          onChange={(e) => set(f.key, e.target.value)}
                          className="h-full w-full bg-transparent px-3 font-mono text-base text-ink focus:outline-none"
                          aria-label={f.unit === 'usd' ? `${f.label}, US dollars` : f.label}
                        />
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      </div>

      <section className="lg:col-span-7" aria-labelledby="cost-answer">
        <div className="border-t border-rule-strong pt-4" aria-live="polite">
          <p className="kicker text-ink-muted">With your numbers</p>
          <h2 id="cost-answer" className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight text-ink sm:text-3xl">
            <span className="mark">{cheapest.label}</span> works out cheapest per clean.
          </h2>
          <p className="mt-3 max-w-prose text-[0.9375rem] leading-relaxed text-ink-secondary">
            Over {yearsOwned} {yearsOwned === 1 ? 'year' : 'years'} at {usesPerYear} cleans a year ({totalUses} cleans).{' '}
            {breakEven !== null
              ? `Buying pays for itself against renting after about ${breakEven} ${breakEven === 1 ? 'clean' : 'cleans'}${
                  breakEven > totalUses ? ', which is more than you plan to do, so renting may make more sense' : ''
                }.`
              : 'With these numbers, renting costs less per clean than the formula alone, so buying never catches up.'}
          </p>
        </div>

        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3">
          {options.map((o) => {
            const best = o.id === cheapest.id;
            return (
              <div key={o.id} className={`p-5 ${best ? 'bg-honey-soft' : 'bg-paper-card'}`}>
                <p className="kicker text-ink-muted">{o.label}</p>
                <p className="mt-3 font-serif text-4xl font-semibold tabular-nums text-ink">{usd(Math.round(o.perClean * 100) / 100)}</p>
                <p className="mt-1 text-[13px] text-ink-muted">per clean</p>
                <p className="mt-4 border-t border-rule pt-3 text-[14px] text-ink-secondary">
                  {usd(Math.round(o.total))} over {totalUses} cleans
                </p>
                {best && <p className="kicker mt-3 text-ink">Cheapest</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t border-rule pt-4">
          <SubHead>The math</SubHead>
          <ul className="space-y-1.5 text-[14px] leading-relaxed text-ink-secondary">
            <li>Formula per clean = bottle price ÷ cleans per bottle = {usd(Math.round(formulaCostPerUse * 100) / 100)}</li>
            <li>Owning total = cleaner price + (cleans × formula per clean) = {usd(Math.round(totalOwnCost))}</li>
            <li>Owning per clean = owning total ÷ {totalUses} cleans</li>
            <li>Not included: electricity, repairs, your time, or a pro’s extra charges for large or heavily soiled areas.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Surface Compatibility Checker
 * -----------------------------------------------------------------------------------------------*/

const STATUS_STYLE: Record<SurfaceCompatibilityEntry['status'], { label: string; chip: string; dot: string; rule: string }> = {
  SAFE: { label: 'Generally safe', chip: 'bg-leaf-soft text-leaf-deep', dot: 'bg-leaf-deep', rule: 'border-leaf-deep' },
  CAUTION: { label: 'Use caution', chip: 'bg-honey-soft text-ink', dot: 'bg-honey-deep', rule: 'border-honey-deep' },
  UNSAFE: { label: 'Avoid', chip: 'bg-terracotta-soft text-terracotta-deep', dot: 'bg-terracotta', rule: 'border-terracotta' },
};

const ALL_SURFACES = 'all';

export function SurfaceCheckerTool() {
  const [surface, setSurface] = useState<string>(ALL_SURFACES);
  const [filterText, setFilterText] = useState('');

  const surfaceOptions: Option<string>[] = [
    { value: ALL_SURFACES, label: 'Show all' },
    ...Array.from(new Set(SURFACE_COMPATIBILITY_MATRIX.map((r) => r.surface))).map((s) => ({ value: s, label: s })),
  ];

  const q = filterText.trim().toLowerCase();
  const filtered = SURFACE_COMPATIBILITY_MATRIX.filter(
    (row) =>
      (surface === ALL_SURFACES || row.surface === surface) &&
      (!q || row.surface.toLowerCase().includes(q) || row.agent.toLowerCase().includes(q)),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <QuestionPanel note="Pick a surface or search.">
          <ChoiceGroup step={1} legend="Which surface?" name="surface" value={surface} options={surfaceOptions} onChange={setSurface} />
          <div>
            <label htmlFor="surface-search" className="kicker mb-3 block text-ink">
              <span className="text-terracotta-deep">2 · </span>Or search by cleaner
            </label>
            <input
              id="surface-search"
              type="search"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="vinegar, steam, peroxide…"
              className="h-12 w-full rounded-lg border border-rule-field bg-paper-card px-3 text-base text-ink placeholder:text-ink-muted focus:border-ink"
            />
          </div>
        </QuestionPanel>
      </div>

      <section className="lg:col-span-8" aria-labelledby="surface-answer">
        <div className="border-t border-rule-strong pt-4">
          <p className="kicker text-ink-muted">Safety check</p>
          <h2 id="surface-answer" className="mt-2 font-serif text-[1.75rem] font-semibold leading-tight text-ink sm:text-3xl">
            {surface === ALL_SURFACES ? 'Common surface and cleaner pairings' : surface}
          </h2>
          <p className="mt-2 text-[14px] text-ink-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'pairing' : 'pairings'} shown. This list covers common mistakes, not every
            product. Your surface maker’s care instructions come first.
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-rule bg-paper-card p-5 text-[0.9375rem] text-ink-secondary">
            Nothing matches that search yet. Try a different word, or use the{' '}
            <Link href="/tools/stain-finder" className="link font-semibold">
              Stain Solution Finder
            </Link>{' '}
            for step-by-step help.
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {filtered.map((item) => {
              const st = STATUS_STYLE[item.status];
              return (
                <li key={`${item.surface}-${item.agent}`} className={`border border-l-4 border-rule bg-paper-card p-5 ${st.rule}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="kicker text-ink-muted">
                      {item.agent} <span aria-hidden="true">→</span>
                      <span className="sr-only">on</span> {item.surface}
                    </p>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${st.chip}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden="true" />
                      {st.label}
                    </span>
                  </div>
                  <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-ink">{item.headline}</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
                    <span className="font-semibold text-ink">Why: </span>
                    {item.explanation}
                  </p>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
                    <span className="font-semibold text-ink">{item.status === 'SAFE' ? 'Tip: ' : 'Use instead: '}</span>
                    {item.recommendedAlternative}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
