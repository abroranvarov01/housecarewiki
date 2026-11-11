import type { Article } from '../../types';
import redWineCarpet from './how-to-get-red-wine-out-of-carpet';
import candleWaxCarpet from './how-to-get-candle-wax-out-of-carpet';
import vomitCarpet from './how-to-get-vomit-out-of-carpet';
import dogUrineCarpet from './how-to-get-dog-urine-out-of-carpet';
import inkFabricCouch from './how-to-get-ink-out-of-a-fabric-couch';
import bloodMattress from './how-to-get-blood-out-of-a-mattress';
import greaseClothes from './how-to-remove-grease-stains-from-clothes';
import armpitStains from './how-to-remove-yellow-armpit-stains-from-white-shirts';
import showerGlass from './how-to-remove-hard-water-stains-from-glass-shower-doors';
import stainlessSteel from './how-to-clean-stainless-steel-appliances-without-streaks';
import quartzCountertops from './how-to-clean-quartz-countertops';
import graniteCountertops from './how-to-clean-granite-countertops';
import oven from './how-to-clean-an-oven';
import glassStovetop from './how-to-clean-a-glass-stovetop';
import microwave from './how-to-clean-a-microwave';
import dishwasher from './how-to-clean-a-dishwasher';
import hardwoodFloors from './how-to-clean-hardwood-floors';
import vinylPlankFloors from './how-to-clean-luxury-vinyl-plank-floors';
import washingMachine from './how-to-clean-a-washing-machine';
import toilet from './how-to-clean-a-toilet';
import catUrineSmell from './how-to-get-rid-of-cat-urine-smell';
import dogSmellHouse from './how-to-get-rid-of-dog-smell-in-house';
import dogSmellCar from './how-to-get-dog-smell-out-of-car';
import disposalSmell from './how-to-get-rid-of-garbage-disposal-smell';
import fridgeSmell from './how-to-get-rid-of-refrigerator-smell';
import sewerSmell from './how-to-get-rid-of-sewer-smell-in-bathroom';
import mustyCarpet from './how-to-get-rid-of-musty-smell-in-carpet';
import mustyTowels from './how-to-get-musty-smell-out-of-towels';
import sweatSmell from './how-to-get-sweat-smell-out-of-clothes';
import mustyCloset from './how-to-get-rid-of-musty-smell-in-closet';
import mixBleachVinegar from './can-you-mix-bleach-and-vinegar';
import neverMix from './cleaning-products-you-should-never-mix';
import bleachGrout from './can-you-use-bleach-on-grout';
import bleachMold from './does-bleach-kill-mold';
import steamLaminate from './can-you-use-a-steam-mop-on-laminate-floors';
import bleachCarpet from './can-you-use-bleach-on-carpet';
import vinegarWasher from './is-vinegar-safe-for-washing-machines';
import bleachSink from './can-you-use-bleach-on-a-stainless-steel-sink';
import magicEraser from './where-not-to-use-a-magic-eraser';
import storeChemicals from './how-to-store-cleaning-products-safely';
import gHowToGetCoffeeOutOfCarpet from './how-to-get-coffee-out-of-carpet';
import gHowToGetMudOutOfCarpet from './how-to-get-mud-out-of-carpet';
import gHowToRemoveRustStainsFromABathtub from './how-to-remove-rust-stains-from-a-bathtub';
import gHowToRemoveMoldFromAShowerCurtain from './how-to-remove-mold-from-a-shower-curtain';
import gHowToGetGrassStainsOutOfClothes from './how-to-get-grass-stains-out-of-clothes';
import gHowToGetBloodOutOfClothes from './how-to-get-blood-out-of-clothes';
import gHowToRemoveWaterStainsFromHardwoodFloors from './how-to-remove-water-stains-from-hardwood-floors';
import gHowToGetDogHairOutOfACar from './how-to-get-dog-hair-out-of-a-car';
import gHowToUnclogAKitchenSinkWithoutChemicals from './how-to-unclog-a-kitchen-sink-without-chemicals';
import gHowToGetInkOutOfClothes from './how-to-get-ink-out-of-clothes';
import gHowToCleanAShowerHead from './how-to-clean-a-shower-head';
import gHowToRemoveSoapScumFromABathtub from './how-to-remove-soap-scum-from-a-bathtub';
import gHowToCleanAFiberglassShower from './how-to-clean-a-fiberglass-shower';
import gHowToCleanAnAcrylicBathtub from './how-to-clean-an-acrylic-bathtub';
import gHowToCleanAJettedTub from './how-to-clean-a-jetted-tub';
import gHowToCleanAShowerDrain from './how-to-clean-a-shower-drain';
import gHowToCleanShowerTiles from './how-to-clean-shower-tiles';
import gHowToCleanTileFloors from './how-to-clean-tile-floors';
import gHowToRemoveHardWaterStainsFromTile from './how-to-remove-hard-water-stains-from-tile';
import gHowToSealGrout from './how-to-seal-grout';
import gHowToRemoveMoldFromShowerCaulk from './how-to-remove-mold-from-shower-caulk';
import gHowToGetRidOfPinkMoldInShower from './how-to-get-rid-of-pink-mold-in-shower';
import gHowToRemoveMoldFromBathroomCeiling from './how-to-remove-mold-from-bathroom-ceiling';
import gHowToCleanABathroomExhaustFan from './how-to-clean-a-bathroom-exhaust-fan';
import gHowToRemoveHardWaterStainsFromAToilet from './how-to-remove-hard-water-stains-from-a-toilet';
import gHowToCleanAToiletTank from './how-to-clean-a-toilet-tank';
import gHowToUnclogAToiletWithoutAPlunger from './how-to-unclog-a-toilet-without-a-plunger';
import gHowToCleanMirrorsWithoutStreaks from './how-to-clean-mirrors-without-streaks';
import gHowToCleanChromeBathroomFixtures from './how-to-clean-chrome-bathroom-fixtures';
import gHowToRemoveCalciumBuildupFromFaucets from './how-to-remove-calcium-buildup-from-faucets';
import gHowToUnclogABathroomSink from './how-to-unclog-a-bathroom-sink';
import gHowToCleanAPorcelainSink from './how-to-clean-a-porcelain-sink';
import gHowToWashABathMat from './how-to-wash-a-bath-mat';
import gHowToDeepCleanABathroom from './how-to-deep-clean-a-bathroom';
import gHowToCleanOvenRacks from './how-to-clean-oven-racks';
import gHowToCleanARangeHoodFilter from './how-to-clean-a-range-hood-filter';
import gHowToCleanACoffeeMaker from './how-to-clean-a-coffee-maker';
import gHowToDescaleAnElectricKettle from './how-to-descale-an-electric-kettle';
import gHowToCleanAnAirFryer from './how-to-clean-an-air-fryer';
import gHowToCleanAToaster from './how-to-clean-a-toaster';
import gHowToCleanABlender from './how-to-clean-a-blender';
import gHowToCleanARefrigeratorIceMaker from './how-to-clean-a-refrigerator-ice-maker';
import gHowToCleanAFreezer from './how-to-clean-a-freezer';
import gHowToCleanRefrigeratorCoils from './how-to-clean-refrigerator-coils';
import gHowToCleanAGasStovetop from './how-to-clean-a-gas-stovetop';
import gHowToCleanStoveGrates from './how-to-clean-stove-grates';
import gHowToCleanACastIronSkillet from './how-to-clean-a-cast-iron-skillet';
import gHowToCleanABurntPot from './how-to-clean-a-burnt-pot';
import gHowToCleanANonstickPan from './how-to-clean-a-nonstick-pan';
import gHowToCleanStainlessSteelPans from './how-to-clean-stainless-steel-pans';
import gHowToCleanGreasyKitchenCabinets from './how-to-clean-greasy-kitchen-cabinets';
import gHowToCleanACuttingBoard from './how-to-clean-a-cutting-board';
import gHowToCleanMarbleCountertops from './how-to-clean-marble-countertops';
import gHowToCleanButcherBlockCountertops from './how-to-clean-butcher-block-countertops';
import gHowToCleanLaminateCountertops from './how-to-clean-laminate-countertops';
import gHowToCleanAKitchenBacksplash from './how-to-clean-a-kitchen-backsplash';
import gHowToCleanAKitchenSponge from './how-to-clean-a-kitchen-sponge';
import gHowToCleanAStainlessSteelSink from './how-to-clean-a-stainless-steel-sink';
import gHowToCleanAGraniteCompositeSink from './how-to-clean-a-granite-composite-sink';
import gHowToCleanAWhitePorcelainKitchenSink from './how-to-clean-a-white-porcelain-kitchen-sink';
import gHowToCleanATrashCan from './how-to-clean-a-trash-can';
import gHowToGetGumOutOfCarpet from './how-to-get-gum-out-of-carpet';
import gHowToGetSlimeOutOfCarpet from './how-to-get-slime-out-of-carpet';
import gHowToGetNailPolishOutOfCarpet from './how-to-get-nail-polish-out-of-carpet';
import gHowToGetPaintOutOfCarpet from './how-to-get-paint-out-of-carpet';
import gHowToGetBloodOutOfCarpet from './how-to-get-blood-out-of-carpet';
import gHowToGetJuiceStainsOutOfCarpet from './how-to-get-juice-stains-out-of-carpet';
import gHowToGetMakeupOutOfCarpet from './how-to-get-makeup-out-of-carpet';
import gHowToGetOilOutOfCarpet from './how-to-get-oil-out-of-carpet';
import gHowToGetDentsOutOfCarpet from './how-to-get-dents-out-of-carpet';
import gHowToCleanAnAreaRug from './how-to-clean-an-area-rug';
import gHowToCleanAWoolRug from './how-to-clean-a-wool-rug';
import gHowToCleanAJuteRug from './how-to-clean-a-jute-rug';
import gHowToCleanAShagRug from './how-to-clean-a-shag-rug';
import gHowToCleanLaminateFloors from './how-to-clean-laminate-floors';
import gHowToCleanEngineeredHardwoodFloors from './how-to-clean-engineered-hardwood-floors';
import gHowToFixScratchesInHardwoodFloors from './how-to-fix-scratches-in-hardwood-floors';
import gHowToRemoveScuffMarksFromFloors from './how-to-remove-scuff-marks-from-floors';
import gHowToCleanBaseboards from './how-to-clean-baseboards';
import gHowToCleanAVacuumFilter from './how-to-clean-a-vacuum-filter';
import gHowToCleanAVacuumBrushRoll from './how-to-clean-a-vacuum-brush-roll';
import gHowToCleanACarpetCleanerMachine from './how-to-clean-a-carpet-cleaner-machine';
import gHowToUseACarpetCleaner from './how-to-use-a-carpet-cleaner';
import gHowToCleanAMopHead from './how-to-clean-a-mop-head';
import gHowToCleanARobotVacuum from './how-to-clean-a-robot-vacuum';
import gHowToGetRedWineOutOfClothes from './how-to-get-red-wine-out-of-clothes';
import gHowToGetCoffeeStainsOutOfClothes from './how-to-get-coffee-stains-out-of-clothes';
import gHowToGetDeodorantStainsOutOfClothes from './how-to-get-deodorant-stains-out-of-clothes';
import gHowToGetMakeupOutOfClothes from './how-to-get-makeup-out-of-clothes';
import gHowToGetLipstickOutOfClothes from './how-to-get-lipstick-out-of-clothes';
import gHowToGetChocolateOutOfClothes from './how-to-get-chocolate-out-of-clothes';
import gHowToGetTomatoSauceOutOfClothes from './how-to-get-tomato-sauce-out-of-clothes';
import gHowToGetMustardOutOfClothes from './how-to-get-mustard-out-of-clothes';
import gHowToGetRustStainsOutOfClothes from './how-to-get-rust-stains-out-of-clothes';
import gHowToGetMildewOutOfClothes from './how-to-get-mildew-out-of-clothes';
import gHowToGetPaintOutOfClothes from './how-to-get-paint-out-of-clothes';
import gHowToGetGumOutOfClothes from './how-to-get-gum-out-of-clothes';
import gHowToGetCandleWaxOutOfClothes from './how-to-get-candle-wax-out-of-clothes';
import gHowToGetSunscreenStainsOutOfClothes from './how-to-get-sunscreen-stains-out-of-clothes';
import gHowToGetPoopStainsOutOfBabyClothes from './how-to-get-poop-stains-out-of-baby-clothes';
import gHowToCleanARoastingPan from './how-to-clean-a-roasting-pan';
import gHowToCleanAnEnameledDutchOven from './how-to-clean-an-enameled-dutch-oven';
import gHowToCleanTarnishedSilverware from './how-to-clean-tarnished-silverware';
import gHowToWashADownComforter from './how-to-wash-a-down-comforter';
import gHowToWashADownJacket from './how-to-wash-a-down-jacket';
import gHowToRemoveSaltStainsFromHardwoodFloors from './how-to-remove-salt-stains-from-hardwood-floors';
import gHowToGetSaltStainsOutOfCarpet from './how-to-get-salt-stains-out-of-carpet';
import gCanYouUseASteamMopOnHardwoodFloors from './can-you-use-a-steam-mop-on-hardwood-floors';
import gHowToGetGravyOutOfClothes from './how-to-get-gravy-out-of-clothes';
import gHowToDisposeOfCookingGrease from './how-to-dispose-of-cooking-grease';
import gHowToCleanABakingSheet from './how-to-clean-a-baking-sheet';
import gHowToCleanAGlassBakingDish from './how-to-clean-a-glass-baking-dish';
import gCanYouPutAluminumFoilOnTheBottomOfTheOven from './can-you-put-aluminum-foil-on-the-bottom-of-the-oven';
import gHowToWashAWoolSweater from './how-to-wash-a-wool-sweater';
import gHowToCleanUggBoots from './how-to-clean-ugg-boots';
import gHowToGetTreeSapOutOfClothes from './how-to-get-tree-sap-out-of-clothes';
import gCanYouUseVinegarOnHardwoodFloors from './can-you-use-vinegar-on-hardwood-floors';
import gHowToWashPillows from './how-to-wash-pillows';
import gHowToCleanAHumidifier from './how-to-clean-a-humidifier';
import gHowToCleanADryerVent from './how-to-clean-a-dryer-vent';
import gHowToCleanFireplaceGlass from './how-to-clean-fireplace-glass';
import gHowToGetRidOfCondensationOnWindows from './how-to-get-rid-of-condensation-on-windows';
import gHowToCleanAKeurig from './how-to-clean-a-keurig';
import gHowToCleanAKitchenaidStandMixer from './how-to-clean-a-kitchenaid-stand-mixer';

// One file per guide: each is a self-contained, source-backed page. Order here is the order on hub pages.
export const STAIN_GUIDES: Article[] = [
  redWineCarpet,
  dogUrineCarpet,
  vomitCarpet,
  candleWaxCarpet,
  inkFabricCouch,
  bloodMattress,
  greaseClothes,
  armpitStains,
  showerGlass,
  stainlessSteel,
];

// "How to clean {surface}" cluster.
export const SURFACE_CLEANING_GUIDES: Article[] = [
  quartzCountertops,
  graniteCountertops,
  oven,
  glassStovetop,
  microwave,
  dishwasher,
  hardwoodFloors,
  vinylPlankFloors,
  washingMachine,
  toilet,
];

// "How to get rid of {smell}" cluster.
export const ODOR_GUIDES: Article[] = [
  catUrineSmell,
  dogSmellHouse,
  dogSmellCar,
  disposalSmell,
  fridgeSmell,
  sewerSmell,
  mustyCarpet,
  mustyTowels,
  sweatSmell,
  mustyCloset,
];

// "Can you mix / is X safe on Y" chemical-safety cluster.
export const SAFETY_GUIDES: Article[] = [
  mixBleachVinegar,
  neverMix,
  bleachGrout,
  bleachMold,
  steamLaminate,
  bleachCarpet,
  vinegarWasher,
  bleachSink,
  magicEraser,
  storeChemicals,
];

// Batch 5: more stain and household fixes.
export const BATCH5_GUIDES: Article[] = [
  gHowToGetCoffeeOutOfCarpet,
  gHowToGetMudOutOfCarpet,
  gHowToRemoveRustStainsFromABathtub,
  gHowToRemoveMoldFromAShowerCurtain,
  gHowToGetGrassStainsOutOfClothes,
  gHowToGetBloodOutOfClothes,
  gHowToRemoveWaterStainsFromHardwoodFloors,
  gHowToGetDogHairOutOfACar,
  gHowToUnclogAKitchenSinkWithoutChemicals,
  gHowToGetInkOutOfClothes,
];

// Batch 6: showers, tubs and tile.
export const BATCH6_GUIDES: Article[] = [
  gHowToCleanAShowerHead,
  gHowToRemoveSoapScumFromABathtub,
  gHowToCleanAFiberglassShower,
  gHowToCleanAnAcrylicBathtub,
  gHowToCleanAJettedTub,
  gHowToCleanAShowerDrain,
  gHowToCleanShowerTiles,
  gHowToCleanTileFloors,
  gHowToRemoveHardWaterStainsFromTile,
  gHowToSealGrout,
];

// Batch 7: bathroom mold, toilets, mirrors and fixtures.
export const BATCH7_GUIDES: Article[] = [
  gHowToRemoveMoldFromShowerCaulk,
  gHowToGetRidOfPinkMoldInShower,
  gHowToRemoveMoldFromBathroomCeiling,
  gHowToCleanABathroomExhaustFan,
  gHowToRemoveHardWaterStainsFromAToilet,
  gHowToCleanAToiletTank,
  gHowToUnclogAToiletWithoutAPlunger,
  gHowToCleanMirrorsWithoutStreaks,
  gHowToCleanChromeBathroomFixtures,
  gHowToRemoveCalciumBuildupFromFaucets,
];

// Batch 8: bathroom sinks and mats, small kitchen appliances.
export const BATCH8_GUIDES: Article[] = [
  gHowToUnclogABathroomSink,
  gHowToCleanAPorcelainSink,
  gHowToWashABathMat,
  gHowToDeepCleanABathroom,
  gHowToCleanOvenRacks,
  gHowToCleanARangeHoodFilter,
  gHowToCleanACoffeeMaker,
  gHowToDescaleAnElectricKettle,
  gHowToCleanAnAirFryer,
  gHowToCleanAToaster,
];

// Batch 9: fridge, stovetop and cookware.
export const BATCH9_GUIDES: Article[] = [
  gHowToCleanABlender,
  gHowToCleanARefrigeratorIceMaker,
  gHowToCleanAFreezer,
  gHowToCleanRefrigeratorCoils,
  gHowToCleanAGasStovetop,
  gHowToCleanStoveGrates,
  gHowToCleanACastIronSkillet,
  gHowToCleanABurntPot,
  gHowToCleanANonstickPan,
  gHowToCleanStainlessSteelPans,
];

// Batch 10: kitchen counters, cabinets and sinks.
export const BATCH10_GUIDES: Article[] = [
  gHowToCleanGreasyKitchenCabinets,
  gHowToCleanACuttingBoard,
  gHowToCleanMarbleCountertops,
  gHowToCleanButcherBlockCountertops,
  gHowToCleanLaminateCountertops,
  gHowToCleanAKitchenBacksplash,
  gHowToCleanAKitchenSponge,
  gHowToCleanAStainlessSteelSink,
  gHowToCleanAGraniteCompositeSink,
  gHowToCleanAWhitePorcelainKitchenSink,
];

// Batch 11: carpet spots and a kitchen trash can.
export const BATCH11_GUIDES: Article[] = [
  gHowToCleanATrashCan,
  gHowToGetGumOutOfCarpet,
  gHowToGetSlimeOutOfCarpet,
  gHowToGetNailPolishOutOfCarpet,
  gHowToGetPaintOutOfCarpet,
  gHowToGetBloodOutOfCarpet,
  gHowToGetJuiceStainsOutOfCarpet,
  gHowToGetMakeupOutOfCarpet,
  gHowToGetOilOutOfCarpet,
  gHowToGetDentsOutOfCarpet,
];

// Batch 12: rugs, hard floors and vacuum filters.
export const BATCH12_GUIDES: Article[] = [
  gHowToCleanAnAreaRug,
  gHowToCleanAWoolRug,
  gHowToCleanAJuteRug,
  gHowToCleanAShagRug,
  gHowToCleanLaminateFloors,
  gHowToCleanEngineeredHardwoodFloors,
  gHowToFixScratchesInHardwoodFloors,
  gHowToRemoveScuffMarksFromFloors,
  gHowToCleanBaseboards,
  gHowToCleanAVacuumFilter,
];

// Batch 13: cleaning machines and clothing stains.
export const BATCH13_GUIDES: Article[] = [
  gHowToCleanAVacuumBrushRoll,
  gHowToCleanACarpetCleanerMachine,
  gHowToUseACarpetCleaner,
  gHowToCleanAMopHead,
  gHowToCleanARobotVacuum,
  gHowToGetRedWineOutOfClothes,
  gHowToGetCoffeeStainsOutOfClothes,
  gHowToGetDeodorantStainsOutOfClothes,
  gHowToGetMakeupOutOfClothes,
  gHowToGetLipstickOutOfClothes,
];

// Batch 14: food, rust, paint and other clothing stains.
export const BATCH14_GUIDES: Article[] = [
  gHowToGetChocolateOutOfClothes,
  gHowToGetTomatoSauceOutOfClothes,
  gHowToGetMustardOutOfClothes,
  gHowToGetRustStainsOutOfClothes,
  gHowToGetMildewOutOfClothes,
  gHowToGetPaintOutOfClothes,
  gHowToGetGumOutOfClothes,
  gHowToGetCandleWaxOutOfClothes,
  gHowToGetSunscreenStainsOutOfClothes,
  gHowToGetPoopStainsOutOfBabyClothes,
];

// Batch 15: holiday cookware, down bedding and outerwear, winter salt and floors.
export const BATCH15_GUIDES: Article[] = [
  gHowToCleanARoastingPan,
  gHowToCleanAnEnameledDutchOven,
  gHowToCleanTarnishedSilverware,
  gHowToWashADownComforter,
  gHowToWashADownJacket,
  gHowToRemoveSaltStainsFromHardwoodFloors,
  gHowToGetSaltStainsOutOfCarpet,
  gCanYouUseASteamMopOnHardwoodFloors,
];

// Batch 16: Thanksgiving cleanup, holiday bakeware, oven foil, wool and sheepskin, tree sap.
export const BATCH16_GUIDES: Article[] = [
  gHowToGetGravyOutOfClothes,
  gHowToDisposeOfCookingGrease,
  gHowToCleanABakingSheet,
  gHowToCleanAGlassBakingDish,
  gCanYouPutAluminumFoilOnTheBottomOfTheOven,
  gHowToWashAWoolSweater,
  gHowToCleanUggBoots,
  gHowToGetTreeSapOutOfClothes,
];

// Batch 17: winter humidity and heating (humidifier, dryer vent, fireplace glass, window condensation), holiday kitchen appliances, wood floors, pillows.
export const BATCH17_GUIDES: Article[] = [
  gCanYouUseVinegarOnHardwoodFloors,
  gHowToWashPillows,
  gHowToCleanAHumidifier,
  gHowToCleanADryerVent,
  gHowToCleanFireplaceGlass,
  gHowToGetRidOfCondensationOnWindows,
  gHowToCleanAKeurig,
  gHowToCleanAKitchenaidStandMixer,
];
