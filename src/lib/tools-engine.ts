// Deterministic Rule Engines for HouseCareWiki's 6 Interactive Smart Tools (Spec Section 10)
import { PRODUCTS } from './seed-data';
import { Product } from './types';

export interface StainSolverInput {
  stainType: 'coffee' | 'pet-urine' | 'red-wine' | 'grease-oil' | 'mud-dirt' | 'mold-mildew' | 'ink';
  surface: 'fabric-sofa' | 'carpet-rug' | 'tile-grout' | 'mattress' | 'hardwood' | 'cotton-laundry';
  stainAge: 'fresh' | 'dried-24h' | 'set-in-old';
  upholsteryCode?: 'W' | 'WS' | 'S' | 'unknown';
}

export interface StainSolverOutput {
  safeToDIY: boolean;
  difficulty: 'Easy (10 mins)' | 'Moderate (25 mins)' | 'Advanced / Extraction Needed';
  chemicalHazardWarning: string;
  surfaceWarning: string;
  suppliesNeeded: string[];
  steps: { title: string; detail: string }[];
  whenToCallPro: string;
  recommendedProducts: Product[];
  relatedGuideSlug: string;
}

export function solveStain(input: StainSolverInput): StainSolverOutput {
  // Check solvent-only restriction first
  if (input.surface === 'fabric-sofa' && input.upholsteryCode === 'S') {
    return {
      safeToDIY: false,
      difficulty: 'Advanced / Extraction Needed',
      chemicalHazardWarning: 'NEVER apply water, vinegar, or liquid dish soap to Code "S" (Solvent-Only) upholstery—water dissolves fabric sizing and leaves permanent brown rings.',
      surfaceWarning: 'Your furniture is labeled Code "S" (Dry-Clean Solvent Only).',
      suppliesNeeded: [
        'White absorbent microfiber cloths',
        'IICRC-approved dry-cleaning upholstery solvent',
        'Soft white horsehair upholstery brush',
      ],
      steps: [
        {
          title: '1. Blot Excess Liquid Dry',
          detail: 'Press a dry white microfiber towel onto the stain without rubbing.',
        },
        {
          title: '2. Apply Dry-Cleaning Solvent Only in a Ventilated Room',
          detail: 'Dampen a clean white cloth with mineral-spirit upholstery solvent and dab from the outside edge inward.',
        },
        {
          title: '3. Feather-Dry and Brush Pile',
          detail: 'Allow solvent to evaporate completely with windows open, then brush the nap gently.',
        },
      ],
      whenToCallPro: 'If the stain covers more than a 4-inch circle on silk, velvet, or Code S linen, contact an IICRC-certified upholstery cleaner.',
      recommendedProducts: PRODUCTS.filter((p) => p.id === 'prod-chomchom-pet-hair-roller'),
      relatedGuideSlug: 'how-to-remove-coffee-stains-from-fabric-sofa',
    };
  }

  if (input.stainType === 'coffee') {
    return {
      safeToDIY: true,
      difficulty: input.stainAge === 'fresh' ? 'Easy (10 mins)' : 'Moderate (25 mins)',
      chemicalHazardWarning: 'Do not mix household ammonia with chlorine bleach. Avoid boiling water, which permanently sets milk/creamer proteins.',
      surfaceWarning: 'Test your solution on an inconspicuous inner seam or skirt hem for 2 minutes first.',
      suppliesNeeded: [
        '3 Clean white microfiber cloths',
        '1 cup cool water + 1/2 tsp clear dish soap + 1 tbsp distilled white vinegar',
        input.stainAge !== 'fresh' ? 'Oxygenated stain remover or portable spot extractor' : 'Spray bottle with plain cool rinse water',
      ],
      steps: [
        {
          title: '1. Blot Up to 80% of the Liquid Immediately',
          detail: 'Press firmly with a folded white microfiber towel for 10 seconds at a time. Never scrub back and forth.',
        },
        {
          title: '2. Apply Cool Dish Soap + Vinegar Tannin Solution',
          detail: 'Dab the mildly acidic surfactant mixture onto the brown coffee ring and let dwell for 5 minutes to break down coffee tannins.',
        },
        {
          title: '3. Extract or Blot-Rinse with Plain Water',
          detail: 'Use a portable carpet/upholstery extractor (2 wet passes, 3 dry suction passes) or blot with a water-dampened cloth until no soap remains.',
        },
        {
          title: '4. Speed-Dry with Airflow',
          detail: 'Point a room fan across the damp area for 45 minutes to prevent water rings.',
        },
      ],
      whenToCallPro: 'If coffee soaked deep into polyurethane sofa foam core and smells sour after 48 hours.',
      recommendedProducts: PRODUCTS.filter((p) =>
        ['prod-bissell-little-green', 'prod-hoover-cleanslate', 'prod-shark-stainstriker'].includes(p.id)
      ),
      relatedGuideSlug: 'how-to-remove-coffee-stains-from-fabric-sofa',
    };
  }

  if (input.stainType === 'pet-urine') {
    return {
      safeToDIY: true,
      difficulty: 'Moderate (25 mins)',
      chemicalHazardWarning: 'NEVER use ammonia-based cleaners on pet urine (urine already contains ammonia, which encourages pets to re-mark the spot). Never use steam cleaners on urine—heat bonds uric acid crystals permanently into synthetic fibers.',
      surfaceWarning: 'Enzyme cleaners require 10–15 minutes of wet dwell time to digest uric acid crystals.',
      suppliesNeeded: [
        'Bio-enzymatic pet stain & odor destroyer',
        'Portable carpet/upholstery spot extractor',
        'White microfiber towels',
      ],
      steps: [
        {
          title: '1. Extract Fresh Liquid Before It Reaches the Pad',
          detail: 'Stand on a folded towel over the spot or use your portable spot cleaner on dry-suction mode first.',
        },
        {
          title: '2. Saturate with Bio-Enzymatic Formula (15-Min Dwell)',
          detail: 'Apply enzyme cleaner generously so it reaches the same depth as the urine. Cover with a damp towel for 15 minutes.',
        },
        {
          title: '3. Rinse-Extract with Cool Water',
          detail: 'Flush and suction out the dissolved residue using a portable spot cleaner with cool water.',
        },
      ],
      whenToCallPro: 'If multiple old accidents have penetrated the subfloor beneath wall-to-wall carpeting.',
      recommendedProducts: PRODUCTS.filter((p) =>
        ['prod-hoover-cleanslate', 'prod-bissell-little-green', 'prod-shark-stainstriker'].includes(p.id)
      ),
      relatedGuideSlug: 'best-portable-carpet-cleaners-home-use-2026',
    };
  }

  if (input.stainType === 'mold-mildew' || input.surface === 'tile-grout') {
    return {
      safeToDIY: true,
      difficulty: 'Moderate (25 mins)',
      chemicalHazardWarning: 'CRITICAL SAFETY RULE: Never mix chlorine bleach with vinegar, acidic tub descalers, or ammonia. Mixing bleach and acid releases toxic chlorine gas.',
      surfaceWarning: 'Do not use acidic vinegar or lime removers on natural marble, travertine, or limestone.',
      suppliesNeeded: [
        'Baking soda + 3% Hydrogen peroxide (oxygen paste)',
        'Stiff V-trimmed nylon grout brush or 400 RPM Electric Spin Scrubber',
        'Microfiber drying cloths',
      ],
      steps: [
        {
          title: '1. Ventilate the Room & Pre-Wet Grout',
          detail: 'Turn on the bathroom exhaust fan and mist tile joints with warm water.',
        },
        {
          title: '2. Apply Baking Soda + Peroxide Paste (10 Mins)',
          detail: 'Spread paste along grout lines and let oxygenated bubbles loosen soap scum and mildew biofilm.',
        },
        {
          title: '3. Agitate with Nylon Bristles & Rinse Dry',
          detail: 'Scrub with a V-shaped nylon grout brush or electric spin scrubber, rinse with warm water, and towel dry.',
        },
      ],
      whenToCallPro: 'If mold covers more than 10 sq ft (EPA threshold) or tiles feel soft/hollow due to wet drywall behind them.',
      recommendedProducts: PRODUCTS.filter((p) =>
        ['prod-electric-spin-scrubber', 'prod-grout-brush-set', 'prod-steam-cleaner-bathroom'].includes(p.id)
      ),
      relatedGuideSlug: 'how-to-clean-grout-in-bathroom-tiles',
    };
  }

  // Default general stain protocol
  return {
    safeToDIY: true,
    difficulty: 'Easy (10 mins)',
    chemicalHazardWarning: 'Never mix different household chemical sprays. Always blot rather than scrubbing.',
    surfaceWarning: 'Spot-test in a hidden corner before treating the center of the surface.',
    suppliesNeeded: [
      'Clean white microfiber cloths',
      'pH-neutral surfactant solution (1/2 tsp clear dish soap in 1 cup warm water)',
      'Portable spot cleaner or damp rinse towel',
    ],
    steps: [
      {
        title: '1. Lift Solid Debris & Blot Excess Liquid',
        detail: 'Scrape solids gently with a dull spoon and blot liquid from the outer edge inward.',
      },
      {
        title: '2. Apply Mild Surfactant Solution',
        detail: 'Dab with a damp microfiber cloth, allow 5 minutes to loosen soil, and blot with clean water.',
      },
      {
        title: '3. Extract & Air Dry',
        detail: 'Remove moisture completely with dry towels or a portable spot cleaner.',
      },
    ],
    whenToCallPro: 'If stain involves permanent dye, oil paint, or delicate antique textiles.',
    recommendedProducts: PRODUCTS.slice(0, 3),
    relatedGuideSlug: 'best-portable-carpet-cleaners-home-use-2026',
  };
}

export interface EquipmentFinderInput {
  space: 'bathroom' | 'carpet-upholstery' | 'kitchen' | 'pet-areas' | 'whole-home';
  need: 'deep-stains' | 'scrub-tile-grout' | 'pet-hair' | 'steam-sanitize' | 'organize-storage';
  budget: 'under-40' | 'under-100' | 'under-160' | 'any';
  powerPreference: 'corded-max-power' | 'cordless-convenience' | 'manual-zero-power' | 'any';
}

export function findEquipment(input: EquipmentFinderInput) {
  const scored = PRODUCTS.map((product) => {
    let score = 50;
    const reasons: string[] = [];

    if (input.space === 'bathroom' && product.roomSlugs.includes('bathroom-cleaning')) {
      score += 25;
      reasons.push('Engineered specifically for high-moisture bathroom tile, tubs, and fixtures');
    }
    if (input.space === 'carpet-upholstery' && product.category === 'carpet-cleaners') {
      score += 30;
      reasons.push('Dedicated deep-extraction suction for carpets, area rugs, and fabric sofas');
    }
    if (input.space === 'pet-areas' && product.roomSlugs.includes('pet-hair-removal')) {
      score += 25;
      reasons.push('Top-rated in our pet hair and pet accident lab tests');
    }
    if (input.space === 'kitchen' && product.roomSlugs.includes('kitchen-cleaning')) {
      score += 25;
      reasons.push('Fits standard kitchen cabinets, sinks, and hard surfaces');
    }

    if (input.need === 'deep-stains' && product.category === 'carpet-cleaners') {
      score += 25;
      reasons.push('Pressurized spray + vacuum extraction lifts stains out of cushion padding');
    }
    if (input.need === 'scrub-tile-grout' && ['Bathroom-scrubbers', 'brushes-tools'].includes(product.category)) {
      score += 25;
      reasons.push('High-density nylon bristles target recessed mortar joints and soap scum');
    }
    if (input.need === 'pet-hair' && product.id === 'prod-chomchom-pet-hair-roller') {
      score += 40;
      reasons.push('Reusable electrostatic weave removes embedded fur without sticky tape');
    }
    if (input.need === 'steam-sanitize' && product.category === 'steam-cleaners') {
      score += 35;
      reasons.push('212°F+ pressurized steam sanitizes without chemical sprays');
    }
    if (input.need === 'organize-storage' && product.category === 'organizers') {
      score += 40;
      reasons.push('L-shaped sliding tiers maximize under-sink cabinet storage around pipes');
    }

    if (input.budget === 'under-40' && product.priceNumeric <= 40) {
      score += 15;
      reasons.push(`Fits comfortably within your under-$40 budget (${product.price})`);
    } else if (input.budget === 'under-100' && product.priceNumeric <= 100) {
      score += 15;
      reasons.push(`Under your $100 budget cap (${product.price})`);
    } else if (input.budget === 'under-160' && product.priceNumeric <= 160) {
      score += 15;
      reasons.push(`Within your $160 budget range (${product.price})`);
    } else if (input.budget === 'under-40' && product.priceNumeric > 40) {
      score -= 20;
    }

    return {
      product,
      matchScore: Math.min(99, Math.max(60, score)),
      reasons: reasons.length > 0 ? reasons : ['Proven high-reliability pick across US households'],
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

export interface SurfaceCompatibilityEntry {
  surface: string;
  agent: string;
  status: 'SAFE' | 'CAUTION' | 'UNSAFE';
  headline: string;
  explanation: string;
  recommendedAlternative: string;
}

export const SURFACE_COMPATIBILITY_MATRIX: SurfaceCompatibilityEntry[] = [
  {
    surface: 'Natural Marble & Travertine',
    agent: 'White Vinegar / Lemon Juice',
    status: 'UNSAFE',
    headline: 'DO NOT USE: Acid Etches Calcium Carbonate Instantly',
    explanation: 'Vinegar (acetic acid) reacts chemically with calcium carbonate in marble, travertine, and limestone, leaving permanent dull white etch marks within 30 seconds.',
    recommendedAlternative: 'pH-neutral stone cleaner or warm water with 2 drops of mild dish soap.',
  },
  {
    surface: 'Cement Tile Grout',
    agent: 'Oxygen Bleach / Baking Soda + Peroxide',
    status: 'SAFE',
    headline: 'SAFE & RECOMMENDED: Brightens Without Eroding Mortar',
    explanation: 'Alkaline oxygen-release solutions lift organic soap scum and mildew stains out of porous grout lines without dissolving cement binders.',
    recommendedAlternative: 'Pair with a stiff V-trimmed nylon grout brush and reseal annually.',
  },
  {
    surface: 'Fabric Sofa (Code W / WS)',
    agent: 'Low-Moisture Portable Spot Extractor',
    status: 'SAFE',
    headline: 'SAFE: Best Method for Deep Spill Extraction',
    explanation: 'Water-safe synthetic and blended fabrics respond best to warm water (<110°F) + low-foam extraction formula followed by slow dry-suction passes.',
    recommendedAlternative: 'Bissell Little Green or Hoover CleanSlate with fan drying.',
  },
  {
    surface: 'Carpet & Upholstery (Pet Urine)',
    agent: 'High-Heat Steam Cleaner',
    status: 'UNSAFE',
    headline: 'AVOID: High Heat Bonds Uric Acid Odor Permanently',
    explanation: 'Applying 212°F steam to protein or pet urine stains cooks the organic proteins into synthetic carpet fibers, making the odor nearly impossible to remove later.',
    recommendedAlternative: 'Cool water extraction + bio-enzymatic cleaner with a 15-minute dwell time.',
  },
  {
    surface: 'Hardwood Floors',
    agent: 'Pressurized Steam Mop',
    status: 'UNSAFE',
    headline: 'UNSAFE: Forces Moisture Between Planks & Warps Wood',
    explanation: 'High-pressure steam penetrates micro-seams between hardwood boards, causing cupping, finish clouding, and voided flooring warranties.',
    recommendedAlternative: 'Slightly dampened flat microfiber pad with pH-neutral hardwood spray.',
  },
  {
    surface: 'Glazed Ceramic Shower Tile',
    agent: '400 RPM Electric Spin Scrubber (Nylon)',
    status: 'SAFE',
    headline: 'SAFE: Removes Soap Scum Without Scratching Glaze',
    explanation: 'Soft-to-medium nylon bristles score 2.5 on the Mohs hardness scale—far softer than glazed porcelain or ceramic tile (Mohs 6–7).',
    recommendedAlternative: 'Use with warm water and neutral bathroom cleaner.',
  },
];
