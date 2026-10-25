// Rule-based logic behind HouseCareWiki's interactive tools (stain finder, equipment finder, surface checker).
// Plain if/then rules written from manufacturer care instructions, upholstery cleaning codes and published
// cleaning guidance. The output is general guidance, not a guarantee: always spot-test first.
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
      chemicalHazardWarning: 'Do not use water, vinegar or dish soap on code S (solvent-only) upholstery. Water can leave rings and shrink or discolor the fabric, often for good.',
      surfaceWarning: 'Your fabric is labeled code S: clean with a dry-cleaning solvent only. Solvents are flammable, so open a window and keep them away from flames and heat.',
      suppliesNeeded: [
        'White absorbent microfiber cloths',
        'Dry-cleaning solvent made for upholstery (follow the label)',
        'Soft white horsehair upholstery brush',
      ],
      steps: [
        {
          title: 'Blot up what you can',
          detail: 'Press a dry white cloth onto the stain without rubbing. Rubbing spreads it and roughs up the fabric.',
        },
        {
          title: 'Test the solvent, then dab it on',
          detail: 'In a ventilated room, try the solvent on a hidden spot first. If the color and texture hold, dampen a clean white cloth and dab from the outside edge inward.',
        },
        {
          title: 'Let it air out, then brush',
          detail: 'Let the solvent evaporate completely with a window open, then brush the nap gently with a soft brush.',
        },
      ],
      whenToCallPro: 'If the stain is larger than your palm, or the fabric is silk, velvet or linen, a professional upholstery cleaner (look for IICRC certification) is the safer call.',
      // Water-based spot cleaners are the wrong tool for code S fabric, so this result recommends no products.
      recommendedProducts: [],
      relatedGuideSlug: 'how-to-remove-coffee-stains-from-fabric-sofa',
    };
  }

  if (input.stainType === 'coffee') {
    return {
      safeToDIY: true,
      difficulty: input.stainAge === 'fresh' ? 'Easy (10 mins)' : 'Moderate (25 mins)',
      chemicalHazardWarning: 'Never mix bleach with ammonia or vinegar. Skip hot water: heat can set the milk proteins in coffee with creamer.',
      surfaceWarning: 'Test the solution on a hidden seam or skirt hem first and wait a few minutes for any color change.',
      suppliesNeeded: [
        'Three clean white cloths',
        '1 cup cool water + 1/2 tsp clear dish soap + 1 tbsp distilled white vinegar',
        input.stainAge !== 'fresh' ? 'Oxygen-based stain remover or a portable spot cleaner' : 'Spray bottle of plain cool water for rinsing',
      ],
      steps: [
        {
          title: 'Blot as much as you can, right away',
          detail: 'Press firmly with a folded white cloth, a few seconds at a time. Don\'t scrub back and forth.',
        },
        {
          title: 'Dab on the cool soap-and-vinegar mix',
          detail: 'Dab the mixture onto the stain and leave it about 5 minutes. The mild acid helps loosen the brown tannins in coffee.',
        },
        {
          title: 'Rinse out the soap',
          detail: 'Blot with a cloth dampened in plain water, or use a portable spot cleaner (a couple of wet passes, then several dry suction passes), until no soap remains.',
        },
        {
          title: 'Dry it quickly',
          detail: 'Point a fan at the damp area until it is fully dry. Fast drying helps prevent water rings.',
        },
      ],
      whenToCallPro: 'If the coffee soaked into the cushion foam and still smells sour after a couple of days, or a ring keeps coming back.',
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
      chemicalHazardWarning: 'Skip ammonia-based cleaners: urine smells like ammonia, which can draw pets back to the same spot. Don\'t steam-clean urine; heat can set the stain and odor.',
      surfaceWarning: 'Enzyme cleaners need time to work. Leave the spot wet for as long as the label says (often 10–15 minutes), and spot-test on a hidden area first.',
      suppliesNeeded: [
        'Enzyme cleaner made for pet stains and odors',
        'Portable carpet and upholstery spot cleaner (optional)',
        'White cloths or paper towels',
      ],
      steps: [
        {
          title: 'Soak up as much as you can first',
          detail: 'Stand on a folded towel over the spot, or run a spot cleaner on suction only, before the urine reaches the pad below.',
        },
        {
          title: 'Apply enzyme cleaner and let it sit',
          detail: 'Apply enough enzyme cleaner to reach as deep as the urine did. Cover with a damp towel and wait as long as the label says.',
        },
        {
          title: 'Rinse with cool water and dry',
          detail: 'Blot or extract with cool water to lift the residue, then let the area dry fully.',
        },
      ],
      whenToCallPro: 'If the smell keeps coming back or many old accidents have soaked through to the pad or subfloor under wall-to-wall carpet.',
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
      chemicalHazardWarning: 'Never mix bleach with vinegar, acidic descalers or ammonia: the fumes are toxic. Don\'t mix hydrogen peroxide and vinegar in the same container either. Run the fan or open a window, and wear gloves.',
      surfaceWarning: 'Don\'t use vinegar or other acids on marble, travertine or limestone. Peroxide can lighten colored grout, so test a small spot first.',
      suppliesNeeded: [
        'Baking soda and 3% hydrogen peroxide (mixed into a paste)',
        'Stiff nylon grout brush or an electric spin scrubber',
        'Gloves and microfiber cloths for drying',
      ],
      steps: [
        {
          title: 'Ventilate and wet the grout',
          detail: 'Turn on the exhaust fan or open a window, then mist the grout lines with warm water.',
        },
        {
          title: 'Spread the paste and wait about 10 minutes',
          detail: 'Spread the paste along the grout lines and let it fizz. It helps loosen soap scum and mildew.',
        },
        {
          title: 'Scrub, rinse and dry',
          detail: 'Scrub with a nylon grout brush or spin scrubber, rinse with warm water and towel dry.',
        },
      ],
      whenToCallPro: 'If mold covers more than about 10 square feet (the EPA\'s rule of thumb for calling a professional), keeps coming back, or tiles feel soft or hollow, which can mean water behind the wall.',
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
    chemicalHazardWarning: 'Never mix cleaning products, especially bleach with ammonia or vinegar. Blot rather than scrub.',
    surfaceWarning: 'Spot-test in a hidden corner before treating the stain itself.',
    suppliesNeeded: [
      'Clean white cloths',
      'Mild soap solution: 1/2 tsp clear dish soap in 1 cup of water (cool for wine, juice and ink; warm for grease)',
      'A damp cloth for rinsing, or a portable spot cleaner',
    ],
    steps: [
      {
        title: 'Lift solids and blot',
        detail: 'Scrape up solids gently with a dull spoon, then blot liquid from the outer edge inward.',
      },
      {
        title: 'Dab on the soap solution',
        detail: 'Dab it on with a cloth, wait about 5 minutes, then blot with clean water.',
      },
      {
        title: 'Blot dry and air out',
        detail: 'Press out as much moisture as you can with dry towels or a spot cleaner, then let it air dry.',
      },
    ],
    whenToCallPro: 'If the stain is permanent dye or paint, the item is antique or delicate, or two careful attempts haven\'t moved it.',
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
      reasons.push('Made for bathroom tile, tubs and fixtures');
    }
    if (input.space === 'carpet-upholstery' && product.category === 'carpet-cleaners') {
      score += 30;
      reasons.push('A carpet and upholstery cleaner: the right type of tool for carpets, rugs and fabric sofas');
    }
    if (input.space === 'pet-areas' && product.roomSlugs.includes('pet-hair-removal')) {
      score += 25;
      reasons.push('Listed by the maker for pet hair or pet messes');
    }
    if (input.space === 'kitchen' && product.roomSlugs.includes('kitchen-cleaning')) {
      score += 25;
      reasons.push('Suited to kitchen sinks, cabinets and hard surfaces');
    }

    if (input.need === 'deep-stains' && product.category === 'carpet-cleaners') {
      score += 25;
      reasons.push('Spray-and-suction design can pull spills out of padding, not just the surface');
    }
    if (input.need === 'scrub-tile-grout' && ['Bathroom-scrubbers', 'brushes-tools'].includes(product.category)) {
      score += 25;
      reasons.push('Nylon bristles reach into grout lines and soap scum');
    }
    if (input.need === 'pet-hair' && product.id === 'prod-chomchom-pet-hair-roller') {
      score += 40;
      reasons.push('Reusable roller lifts fur from fabric without sticky tape');
    }
    if (input.need === 'steam-sanitize' && product.category === 'steam-cleaners') {
      score += 35;
      reasons.push('Hot steam loosens grime without chemical sprays (not for wood, unsealed stone or urine stains)');
    }
    if (input.need === 'organize-storage' && product.category === 'organizers') {
      score += 40;
      reasons.push('Sliding tiers fit around under-sink pipes');
    }

    // Budget is not scored: we hold no verified prices, so price can't influence a match.

    return {
      product,
      matchScore: Math.min(99, Math.max(60, score)),
      reasons: reasons.length > 0 ? reasons : ['A general-purpose pick; it isn\'t a close match for your answers'],
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
    headline: 'Don\'t use it: acid etches the stone',
    explanation: 'Vinegar and lemon juice are acids. They react with the calcium carbonate in marble, travertine and limestone and can leave dull etch marks quickly, even on sealed stone.',
    recommendedAlternative: 'A pH-neutral stone cleaner, or warm water with a couple of drops of mild dish soap.',
  },
  {
    surface: 'Cement Tile Grout',
    agent: 'Oxygen Bleach / Baking Soda + Peroxide',
    status: 'SAFE',
    headline: 'Generally safe: lifts grime without eating the grout',
    explanation: 'Oxygen-based cleaners loosen soap scum and mildew stains in porous grout without the acid that wears cement grout down. Peroxide can lighten colored grout, so test a small spot.',
    recommendedAlternative: 'Use a stiff nylon grout brush, rinse well, and reseal grout as the sealer\'s label recommends.',
  },
  {
    surface: 'Fabric Sofa (Code W / WS)',
    agent: 'Low-Moisture Portable Spot Extractor',
    status: 'SAFE',
    headline: 'Generally safe: a good way to lift spills',
    explanation: 'Fabrics labeled W or WS can take water. Use warm (not hot) water with a low-foam formula, then several slow suction-only passes so the cushion doesn\'t stay wet. Test a hidden spot first.',
    recommendedAlternative: 'A portable spot cleaner such as the Bissell Little Green or Hoover CleanSlate, then a fan to speed drying.',
  },
  {
    surface: 'Carpet & Upholstery (Pet Urine)',
    agent: 'High-Heat Steam Cleaner',
    status: 'UNSAFE',
    headline: 'Avoid: heat can set the stain and smell',
    explanation: 'Steam heat can set protein stains like urine into the fibers, which can make the odor much harder to remove later.',
    recommendedAlternative: 'An enzyme cleaner left on as long as its label says, then a cool-water rinse.',
  },
  {
    surface: 'Hardwood Floors',
    agent: 'Pressurized Steam Mop',
    status: 'UNSAFE',
    headline: 'Avoid: steam pushes moisture between boards',
    explanation: 'Heat and moisture can get into the seams between boards and cause cupping or a cloudy finish. Many flooring makers say not to steam-clean, which can affect the warranty.',
    recommendedAlternative: 'A barely damp microfiber mop with a cleaner your floor maker approves.',
  },
  {
    surface: 'Glazed Ceramic Shower Tile',
    agent: 'Electric Spin Scrubber (Nylon Brush)',
    status: 'SAFE',
    headline: 'Generally safe: nylon won\'t scratch the glaze',
    explanation: 'Nylon bristles are much softer than glazed ceramic or porcelain, so they scrub off soap scum without scratching. Skip stiff wire or abrasive pads.',
    recommendedAlternative: 'Use with warm water and a neutral bathroom cleaner.',
  },
];

// ---- Shared option lists and labels (used by the tool UI and to validate ?stain= / ?surface= links) ----

export const STAIN_OPTIONS: { value: StainSolverInput['stainType']; label: string }[] = [
  { value: 'coffee', label: 'Coffee or tea' },
  { value: 'pet-urine', label: 'Pet accident' },
  { value: 'red-wine', label: 'Red wine or juice' },
  { value: 'grease-oil', label: 'Grease or oil' },
  { value: 'mud-dirt', label: 'Mud or dirt' },
  { value: 'ink', label: 'Ink' },
  { value: 'mold-mildew', label: 'Mold or mildew' },
];

export const SURFACE_OPTIONS: { value: StainSolverInput['surface']; label: string }[] = [
  { value: 'fabric-sofa', label: 'Fabric sofa' },
  { value: 'carpet-rug', label: 'Carpet or rug' },
  { value: 'mattress', label: 'Mattress' },
  { value: 'cotton-laundry', label: 'Clothes or laundry' },
  { value: 'tile-grout', label: 'Tile and grout' },
  { value: 'hardwood', label: 'Hardwood floor' },
];

export function isStainType(value: unknown): value is StainSolverInput['stainType'] {
  return typeof value === 'string' && STAIN_OPTIONS.some((o) => o.value === value);
}

export function isSurface(value: unknown): value is StainSolverInput['surface'] {
  return typeof value === 'string' && SURFACE_OPTIONS.some((o) => o.value === value);
}

const RELATED_GUIDE_TITLES: Record<string, string> = {
  'how-to-remove-coffee-stains-from-fabric-sofa': 'How to remove coffee stains from a fabric sofa',
  'how-to-clean-grout-in-bathroom-tiles': 'How to clean grout in bathroom tiles',
  'best-portable-carpet-cleaners-home-use-2026': 'Best portable carpet cleaners for home use',
};

/** Guide slugs starting with "best-" are buying guides served under /best, the rest under /guides. */
export function relatedGuide(slug: string): { href: string; title: string; isBuyingGuide: boolean } {
  const isBuyingGuide = slug.startsWith('best-');
  return {
    href: `/${isBuyingGuide ? 'best' : 'guides'}/${slug}`,
    title: RELATED_GUIDE_TITLES[slug] || 'Read the full guide',
    isBuyingGuide,
  };
}
