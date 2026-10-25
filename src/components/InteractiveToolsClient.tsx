'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Sparkles,
  CalendarCheck,
  Calculator,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Printer,
  RotateCcw,
} from 'lucide-react';
import {
  solveStain,
  findEquipment,
  SURFACE_COMPATIBILITY_MATRIX,
  StainSolverInput,
  EquipmentFinderInput,
} from '@/lib/tools-engine';
import { PrimeBadge, StarRating, AffiliateButton } from '@/components/ui/Badges';

export function StainFinderTool() {
  const [stainType, setStainType] = useState<StainSolverInput['stainType']>('coffee');
  const [surface, setSurface] = useState<StainSolverInput['surface']>('fabric-sofa');
  const [stainAge, setStainAge] = useState<StainSolverInput['stainAge']>('fresh');
  const [upholsteryCode, setUpholsteryCode] = useState<StainSolverInput['upholsteryCode']>('WS');

  const result = solveStain({ stainType, surface, stainAge, upholsteryCode });

  return (
    <div className="space-y-8">
      {/* Selector Controls */}
      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
              1. Type of Stain
            </label>
            <select
              value={stainType}
              onChange={(e) => setStainType(e.target.value as StainSolverInput['stainType'])}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
            >
              <option value="coffee">Coffee / Tea / Latte</option>
              <option value="pet-urine">Pet Urine / Accident</option>
              <option value="red-wine">Red Wine / Berry Juice</option>
              <option value="grease-oil">Cooking Grease / Butter</option>
              <option value="mud-dirt">Mud / Tracked Soil</option>
              <option value="mold-mildew">Mold / Shower Mildew</option>
              <option value="ink">Ballpoint Pen / Ink</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
              2. Surface / Material
            </label>
            <select
              value={surface}
              onChange={(e) => setSurface(e.target.value as StainSolverInput['surface'])}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
            >
              <option value="fabric-sofa">Fabric Sofa / Upholstery</option>
              <option value="carpet-rug">Carpet / Area Rug</option>
              <option value="tile-grout">Bathroom Tile & Grout</option>
              <option value="mattress">Mattress Surface</option>
              <option value="cotton-laundry">Washable Cotton / Linen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
              3. Age of Stain
            </label>
            <select
              value={stainAge}
              onChange={(e) => setStainAge(e.target.value as StainSolverInput['stainAge'])}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
            >
              <option value="fresh">Fresh Spill (&lt; 1 hour)</option>
              <option value="dried-24h">Dried (1 – 24 hours)</option>
              <option value="set-in-old">Set-In (&gt; 24 hours)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
              4. Fabric Care Tag (If Sofa)
            </label>
            <select
              value={upholsteryCode}
              onChange={(e) =>
                setUpholsteryCode(e.target.value as StainSolverInput['upholsteryCode'])
              }
              disabled={surface !== 'fabric-sofa'}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
            >
              <option value="W">Code W (Water-Safe)</option>
              <option value="WS">Code WS (Water or Solvent)</option>
              <option value="S">Code S (Solvent Only — No Water!)</option>
              <option value="unknown">Not Sure / No Tag</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chemical & Surface Safety Alert */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm text-amber-950">
          <p className="font-bold uppercase tracking-wider text-xs">
            Verified Chemical & Surface Safety Check
          </p>
          <p>{result.chemicalHazardWarning}</p>
          <p className="text-amber-800 font-medium">{result.surfaceWarning}</p>
        </div>
      </div>

      {/* Output Protocol */}
      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-elevated space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-border pb-4">
          <div>
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                result.safeToDIY
                  ? 'bg-emerald-100 text-forest'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {result.safeToDIY
                ? 'Safe for Home DIY Treatment'
                : 'Caution: Solvent / Specialist Protocol Required'}
            </span>
            <h3 className="font-editorial text-2xl font-bold text-ink mt-2">
              Your Customized Stain Removal Protocol
            </h3>
          </div>
          <span className="text-xs font-semibold bg-paper-warm px-3 py-1.5 rounded-lg text-ink-secondary">
            Estimated Time: {result.difficulty}
          </span>
        </div>

        {/* Supplies */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-forest mb-2.5">
            Required Supplies
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.suppliesNeeded.map((sup) => (
              <span
                key={sup}
                className="inline-flex items-center gap-1.5 bg-paper-light border border-paper-border px-3 py-1.5 rounded-lg text-xs font-medium text-ink"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                {sup}
              </span>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {result.steps.map((s) => (
            <div
              key={s.title}
              className="bg-paper-light rounded-xl p-4 border border-paper-border"
            >
              <h5 className="font-bold text-sm text-ink">{s.title}</h5>
              <p className="text-xs sm:text-sm text-ink-secondary mt-1">{s.detail}</p>
            </div>
          ))}
        </div>

        <div className="bg-paper-warm/60 rounded-xl p-4 text-xs text-ink-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            <strong>When to call a professional:</strong> {result.whenToCallPro}
          </span>
          <Link
            href={`/guides/${result.relatedGuideSlug}`}
            className="text-forest font-bold hover:underline shrink-0"
          >
            Read Full Photo Guide →
          </Link>
        </div>
      </div>

      {/* Matching Tested Equipment */}
      <div>
        <h3 className="font-editorial text-xl font-bold text-ink mb-4">
          Compatible Tested Tools for This Stain
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {result.recommendedProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-xl border border-paper-border p-4 shadow-card flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-bold bg-forest text-white px-2.5 py-0.5 rounded">
                  {prod.badge || prod.bestFor}
                </span>
                <Link
                  href={`/products/${prod.slug}`}
                  className="font-bold text-sm text-ink hover:text-forest block mt-2"
                >
                  {prod.name}
                </Link>
                <div className="mt-1">
                  <StarRating rating={prod.rating} reviewCount={prod.reviewCount} size="xs" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-ink">{prod.price}</span>
                  {prod.isPrime && <PrimeBadge />}
                </div>
                <AffiliateButton
                  productId={prod.id}
                  productName={prod.name}
                  asin={prod.asin}
                  amazonUrl={prod.amazonUrl}
                  contentSlug="stain-finder-tool"
                  placement="tool_output"
                  variant="compact"
                  label="Amazon →"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EquipmentFinderTool() {
  const [space, setSpace] = useState<EquipmentFinderInput['space']>('carpet-upholstery');
  const [need, setNeed] = useState<EquipmentFinderInput['need']>('deep-stains');
  const [budget, setBudget] = useState<EquipmentFinderInput['budget']>('under-160');
  const [powerPreference, setPowerPreference] =
    useState<EquipmentFinderInput['powerPreference']>('any');

  const matches = findEquipment({ space, need, budget, powerPreference });

  return (
    <div className="space-y-8">
      {/* 3-Step Interactive Filter Wizard matching Screen 1 Banner */}
      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
              Step 1: Choose a Space
            </label>
            <select
              value={space}
              onChange={(e) => setSpace(e.target.value as EquipmentFinderInput['space'])}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
            >
              <option value="carpet-upholstery">Carpets, Rugs & Sofas</option>
              <option value="bathroom">Bathroom Tile, Tubs & Showers</option>
              <option value="pet-areas">Pet Areas & Car Interiors</option>
              <option value="kitchen">Kitchen & Under-Sink Cabinets</option>
              <option value="whole-home">Whole Home Multi-Surface</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
              Step 2: Select Your Need
            </label>
            <select
              value={need}
              onChange={(e) => setNeed(e.target.value as EquipmentFinderInput['need'])}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
            >
              <option value="deep-stains">Extract Deep Spills & Pet Stains</option>
              <option value="scrub-tile-grout">Scrub Tile Grout & Soap Scum</option>
              <option value="pet-hair">Remove Embedded Pet Fur</option>
              <option value="steam-sanitize">Chemical-Free Steam Sanitation</option>
              <option value="organize-storage">Organize Under-Sink Storage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
              Step 3: Target Budget
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value as EquipmentFinderInput['budget'])}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
            >
              <option value="under-40">Under $40</option>
              <option value="under-100">Under $100</option>
              <option value="under-160">Under $160</option>
              <option value="any">Any Budget (Best Performance)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
              Power Preference
            </label>
            <select
              value={powerPreference}
              onChange={(e) =>
                setPowerPreference(e.target.value as EquipmentFinderInput['powerPreference'])
              }
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
            >
              <option value="any">No Preference</option>
              <option value="corded-max-power">Corded (Continuous Suction)</option>
              <option value="cordless-convenience">Cordless Rechargeable</option>
              <option value="manual-zero-power">Manual / Zero Electricity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ranked Deterministic Matches */}
      <div className="space-y-4">
        <h3 className="font-editorial text-2xl font-bold text-ink">
          Top Compatible Equipment for Your Home
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map(({ product, matchScore, reasons }, index) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-paper-border p-6 shadow-card flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="bg-forest text-white text-xs font-bold px-3 py-1 rounded-full">
                    #{index + 1} Match · {matchScore}% Compatibility
                  </span>
                  <span className="text-xs font-semibold text-ink-muted">
                    {product.evidenceStatus}
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-paper-border shrink-0"
                  />
                  <div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-editorial font-bold text-lg text-ink hover:text-forest leading-snug"
                    >
                      {product.name}
                    </Link>
                    <div className="mt-1">
                      <StarRating
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                        size="xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-paper-light rounded-xl p-3.5 border border-paper-border">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-forest mb-1.5">
                    Why It Fits Your Selection:
                  </p>
                  <ul className="space-y-1 text-xs text-ink-secondary">
                    {reasons.map((r) => (
                      <li key={r} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-paper-border flex items-center justify-between">
                <div>
                  <span className="text-xl font-extrabold text-ink">
                    {product.price}
                  </span>
                  {product.isPrime && <PrimeBadge />}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    className="px-3 py-2 rounded-lg border border-paper-border text-xs font-semibold text-ink hover:border-forest"
                  >
                    Specs
                  </Link>
                  <AffiliateButton
                    productId={product.id}
                    productName={product.name}
                    asin={product.asin}
                    amazonUrl={product.amazonUrl}
                    contentSlug="equipment-finder"
                    placement={`match_${index + 1}`}
                    variant="coral"
                    label="View on Amazon"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RoutinePlannerTool() {
  const [homeType, setHomeType] = useState('2-Bedroom Apartment / Townhouse');
  const [hasPets, setHasPets] = useState(true);
  const [minutesPerDay, setMinutesPerDay] = useState(15);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (task: string) => {
    setCheckedTasks((prev) => ({ ...prev, [task]: !prev[task] }));
  };

  const dailyTasks = [
    'Squeegee shower glass & tile walls after bathing (30 seconds)',
    'Wipe kitchen countertops & induction/gas cooktop with pH-neutral spray',
    ...(hasPets
      ? ['Quick 2-minute ChomChom electrostatic pass over sofa cushions']
      : []),
    'Run kitchen sink disposal and wipe faucet base dry',
  ];

  const weeklyTasks = [
    'Scrub bathroom grout lines & tub basin with nylon brush or spin scrubber',
    'Vacuum high-traffic carpet lanes, area rugs, and sofa crevices',
    'Mop hard bathroom & kitchen floors with residue-free neutral cleaner',
    'Mist shower silicone caulk seams with 3% hydrogen peroxide',
  ];

  const monthlyTasks = [
    'Spot-extract sofa cushions and entryway rugs with portable carpet cleaner',
    'Clean washing machine rubber door gasket and detergent drawer',
    'Audit under-sink sliding organizer and wipe cabinet tray',
    'Vacuum refrigerator condenser coils & bathroom exhaust fan grille',
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-paper-border p-6 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
            Home Size / Layout
          </label>
          <select
            value={homeType}
            onChange={(e) => setHomeType(e.target.value)}
            className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
          >
            <option>Studio / 1-Bedroom Apartment</option>
            <option>2-Bedroom Apartment / Townhouse</option>
            <option>3–4 Bedroom Single-Family Home</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
            Pets in Household
          </label>
          <select
            value={hasPets ? 'yes' : 'no'}
            onChange={(e) => setHasPets(e.target.value === 'yes')}
            className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2.5 text-sm font-semibold text-ink"
          >
            <option value="yes">Yes — Dogs or Cats</option>
            <option value="no">No Pets</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-forest mb-2">
            Daily Time Budget: {minutesPerDay} mins
          </label>
          <input
            type="range"
            min={10}
            max={45}
            step={5}
            value={minutesPerDay}
            onChange={(e) => setMinutesPerDay(Number(e.target.value))}
            className="w-full accent-forest mt-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-elevated space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-border pb-4">
          <div>
            <h3 className="font-editorial text-2xl font-bold text-ink">
              Personalized Maintenance Schedule ({homeType})
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Designed for {minutesPerDay} mins/day · {hasPets ? 'Includes Pet Hair & Odor Protocol' : 'Standard Low-Moisture Protocol'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="inline-flex items-center gap-1.5 bg-forest text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-forest-light"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Checklist</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Daily Reset (10–15m)', items: dailyTasks },
            { label: 'Weekly Deep Care', items: weeklyTasks },
            { label: 'Monthly & Seasonal', items: monthlyTasks },
          ].map((col) => (
            <div
              key={col.label}
              className="bg-paper-light rounded-xl p-4 border border-paper-border space-y-3"
            >
              <h4 className="font-editorial font-bold text-base text-forest">
                {col.label}
              </h4>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item}>
                    <label className="flex items-start gap-2.5 text-xs text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(checkedTasks[item])}
                        onChange={() => toggleTask(item)}
                        className="mt-0.5 rounded accent-forest"
                      />
                      <span
                        className={
                          checkedTasks[item] ? 'line-through text-ink-muted' : ''
                        }
                      >
                        {item}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CostCalculatorTool() {
  const [machineCost, setMachineCost] = useState(124);
  const [formulaBottleCost, setFormulaBottleCost] = useState(16);
  const [usesPerYear, setUsesPerYear] = useState(12);
  const [yearsOwned, setYearsOwned] = useState(4);

  const totalUses = usesPerYear * yearsOwned;
  const formulaCostPerUse = Number((formulaBottleCost / 10).toFixed(2));
  const totalOwnCost = machineCost + totalUses * formulaCostPerUse;
  const costPerUseOwn = Number((totalOwnCost / totalUses).toFixed(2));

  const rentalCostPerSession = 48; // Machine rental + formula
  const proCleaningPerSession = 165;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-paper-border p-6 sm:p-8 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-editorial text-xl font-bold text-ink">
            Editable Cost Assumptions (Transparent Math — Spec Section 10.5)
          </h3>
          <button
            type="button"
            onClick={() => {
              setMachineCost(124);
              setFormulaBottleCost(16);
              setUsesPerYear(12);
              setYearsOwned(4);
            }}
            className="text-xs font-semibold text-forest inline-flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">
              Machine Purchase Price ($)
            </label>
            <input
              type="number"
              value={machineCost}
              onChange={(e) => setMachineCost(Math.max(10, Number(e.target.value)))}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2 text-sm font-bold text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">
              32 oz Formula Refill ($)
            </label>
            <input
              type="number"
              value={formulaBottleCost}
              onChange={(e) => setFormulaBottleCost(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2 text-sm font-bold text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">
              Spot/Deep Cleans Per Year
            </label>
            <input
              type="number"
              value={usesPerYear}
              onChange={(e) => setUsesPerYear(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2 text-sm font-bold text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1">
              Expected Lifespan (Years)
            </label>
            <input
              type="number"
              value={yearsOwned}
              onChange={(e) => setYearsOwned(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-paper-border bg-paper-light px-3.5 py-2 text-sm font-bold text-ink"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-forest text-white rounded-2xl p-6 shadow-elevated">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Owning a Portable Extractor
          </span>
          <p className="font-editorial text-4xl font-bold mt-2">${costPerUseOwn}</p>
          <p className="text-xs text-paper-light/80 mt-1">
            Per cleaning session ({totalUses} total sessions over {yearsOwned} yrs)
          </p>
          <p className="text-xs text-emerald-200 mt-4 pt-3 border-t border-white/15">
            Total {yearsOwned}-Year Cost: <strong>${totalOwnCost.toFixed(0)}</strong>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-paper-border p-6 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Supermarket Machine Rental
          </span>
          <p className="font-editorial text-4xl font-bold text-ink mt-2">
            ${rentalCostPerSession}
          </p>
          <p className="text-xs text-ink-secondary mt-1">
            Per 24-hour rental + solution bottle
          </p>
          <p className="text-xs text-ink-muted mt-4 pt-3 border-t border-paper-border">
             Breaks even after just <strong>3 uses</strong> when you own your machine.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-paper-border p-6 shadow-card">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            In-Home Upholstery Service
          </span>
          <p className="font-editorial text-4xl font-bold text-ink mt-2">
            ${proCleaningPerSession}
          </p>
          <p className="text-xs text-ink-secondary mt-1">
            Average US minimum trip charge for 1 sofa
          </p>
          <p className="text-xs text-ink-muted mt-4 pt-3 border-t border-paper-border">
            Owning saves <strong>${proCleaningPerSession - machineCost}</strong> on the very first emergency spill.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SurfaceCheckerTool() {
  const [filterText, setFilterText] = useState('');

  const filtered = SURFACE_COMPATIBILITY_MATRIX.filter(
    (row) =>
      row.surface.toLowerCase().includes(filterText.toLowerCase()) ||
      row.agent.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-paper-border p-5 shadow-card">
        <input
          type="search"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter by surface or cleaner (e.g., marble, vinegar, grout, steam, hardwood)..."
          className="w-full px-4 py-2.5 rounded-xl border border-paper-border bg-paper-light text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={`${item.surface}-${item.agent}`}
            className="bg-white rounded-2xl border border-paper-border p-5 shadow-card space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                {item.surface} + {item.agent}
              </span>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  item.status === 'SAFE'
                    ? 'bg-emerald-100 text-forest'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {item.status}
              </span>
            </div>
            <h3 className="font-editorial font-bold text-lg text-ink">
              {item.headline}
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
              {item.explanation}
            </p>
            <p className="text-xs text-forest font-semibold pt-1">
              Recommended protocol: {item.recommendedAlternative}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
