# SEO recovery: guides held out of the index (2026-11-22)

## Why

Google showed HouseCareWiki up to 350 times a day from 4 to 13 Nov 2026. From 14 Nov it showed it almost never. Before that, about 210 templated guides had gone up in two weeks: 141 on 2 Nov and 8 a day from 9 to 16 Nov. In Search Console, 71 pages were indexed and 131 were "crawled – currently not indexed".

The site has no technical faults: all pages return 200, they load fast and every page is internally linked. Google judged the site as a whole to be low-value.

## What was done

Search Console data was read for the last 90 days. A guide stays indexable if it got any impressions or Google indexed it. That keeps 126 guides, the gift guide from 22 Nov included.

The 79 guides below had no impressions and were not indexed. Each now has `seo.indexable: false`, which means:
- they are dropped from the sitemap;
- their pages carry `noindex, follow`;
- they still exist and are linked for readers.

## Re-release rule

Do not flip these back in bulk; a bulk release is how the site got here. Re-enable at most 5 a week. Only re-enable a guide after it has gained something a template cannot give it, such as:
- a named human reviewer (`reviewedBy`);
- the author's own photos or test notes;
- a merge with a stronger page.

Do not add new guides in bulk either.

## Step 2: merging overlapping guides (2026-11-25)

The drop started on 10 Nov, the first day of Google's November 2026 core update (10 to 24 Nov). It is a site-wide quality demotion, not a technical fault. Search Console shows no manual actions and no security issues. John Mueller said in Nov 2026 that a site-wide "crawled – currently not indexed" status means Google's quality systems are "unconvinced" about the site. He also said that making a site smaller does not, by itself, raise its quality. Holding guides out of the index was therefore not enough.

So overlapping guides are now merged. The useful facts, FAQs and sources of each retired guide go into a stronger guide on the same topic, as sections placed after the steps (`placement: 'afterSteps'`). The retired URL 301-redirects to that guide. The redirect map is `mergedGuides` in `next.config.mjs`.

| Retired guide | Merged into |
|---|---|
| can-you-mix-bleach-and-ammonia, can-you-mix-bleach-and-rubbing-alcohol, can-you-mix-hydrogen-peroxide-and-vinegar | cleaning-products-you-should-never-mix |
| can-you-put-cast-iron-in-the-dishwasher | how-to-clean-a-cast-iron-skillet |
| can-you-use-vinegar-on-hardwood-floors, can-you-use-a-steam-mop-on-hardwood-floors | how-to-clean-hardwood-floors |
| how-to-clean-a-white-porcelain-kitchen-sink | how-to-clean-a-porcelain-sink |
| how-to-clean-a-keurig, how-to-descale-a-nespresso-machine | how-to-clean-a-coffee-maker |
| how-to-clean-ugg-boots | how-to-clean-suede-boots |
| can-you-put-a-yeti-in-the-dishwasher | how-to-clean-a-stanley-cup |
| how-to-clean-fireplace-glass | how-to-clean-out-a-fireplace |
| how-to-get-red-wine-out-of-a-couch, how-to-get-red-wine-out-of-clothes | how-to-get-red-wine-out-of-carpet |

Round 2 (same day):

| Retired guide | Merged into |
|---|---|
| how-to-get-candle-wax-off-wood, how-to-get-candle-wax-out-of-clothes | how-to-get-candle-wax-out-of-carpet |
| how-to-get-gum-out-of-clothes | how-to-get-gum-out-of-carpet |
| how-to-get-gravy-out-of-clothes | how-to-remove-grease-stains-from-clothes |
| how-to-get-deodorant-stains-out-of-clothes | how-to-remove-yellow-armpit-stains-from-white-shirts |
| how-to-get-lipstick-out-of-clothes | how-to-get-makeup-out-of-clothes |
| how-to-remove-hard-water-stains-from-tile | how-to-clean-shower-tiles |
| how-to-wash-a-down-jacket | how-to-wash-a-down-comforter |
| how-to-wash-cashmere | how-to-wash-a-wool-sweater |
| how-to-clean-a-roasting-pan, how-to-clean-a-glass-baking-dish | how-to-clean-a-baking-sheet |
| how-to-clean-a-roaster-oven | how-to-clean-a-slow-cooker |

Left for later on purpose: the salt-stain guides (the leather-boots page carries a Creator Connections campaign) and the mold guides (each covers a different surface).

Rules for the next rounds:
- Merge only when the pages answer the same need. Keep the URL with the most impressions, or the broader topic, as the target.
- Do not paste a whole guide in. Keep only what the target does not already say.
- Measure from about 1 Dec 2026, one week after the core update finished. Google has announced a December 2026 core update; that is the next big chance for the site to be re-evaluated.

## Held out of the index (79, now 71)

On 27 Nov 2026 eight guides were taken off this list and made indexable again, because they became merge targets on 25 Nov and the retired URLs 301 into them: how-to-clean-a-baking-sheet, how-to-clean-a-slow-cooker, how-to-clean-a-stanley-cup, how-to-clean-out-a-fireplace, how-to-clean-suede-boots, how-to-get-red-wine-out-of-carpet, how-to-wash-a-down-comforter, how-to-wash-a-wool-sweater. Rule: a merge target must be indexable; check `seo.indexable` before folding guides into it.

- can-you-mix-bleach-and-ammonia
- can-you-mix-bleach-and-rubbing-alcohol
- can-you-mix-hydrogen-peroxide-and-vinegar
- can-you-put-a-yeti-in-the-dishwasher
- can-you-put-aluminum-foil-on-the-bottom-of-the-oven
- can-you-put-cast-iron-in-the-dishwasher
- can-you-put-knives-in-the-dishwasher
- can-you-use-a-steam-mop-on-hardwood-floors
- can-you-use-vinegar-on-hardwood-floors
- how-to-clean-a-carbon-steel-pan
- how-to-clean-a-coffee-grinder
- how-to-clean-a-cutting-board
- how-to-clean-a-dryer-vent
- how-to-clean-a-fiberglass-shower
- how-to-clean-a-food-processor
- how-to-clean-a-french-press
- how-to-clean-a-glass-baking-dish
- how-to-clean-a-humidifier
- how-to-clean-a-keurig
- how-to-clean-a-kitchenaid-stand-mixer
- how-to-clean-a-leather-couch
- how-to-clean-a-meat-thermometer
- how-to-clean-a-microfiber-couch
- how-to-clean-a-pizza-stone
- how-to-clean-a-roaster-oven
- how-to-clean-a-roasting-pan
- how-to-clean-a-silicone-baking-mat
- how-to-clean-a-space-heater
- how-to-clean-a-toilet
- how-to-clean-a-waffle-maker
- how-to-clean-a-wool-coat
- how-to-clean-air-vents
- how-to-clean-an-air-purifier
- how-to-clean-an-area-rug
- how-to-clean-an-artificial-christmas-tree
- how-to-clean-an-enameled-dutch-oven
- how-to-clean-an-instant-pot
- how-to-clean-crystal-glasses
- how-to-clean-fireplace-glass
- how-to-clean-laminate-floors
- how-to-clean-stainless-steel-appliances-without-streaks
- how-to-clean-tarnished-silverware
- how-to-clean-tile-floors
- how-to-clean-ugg-boots
- how-to-descale-a-nespresso-machine
- how-to-dispose-of-cooking-grease
- how-to-get-candle-wax-off-wood
- how-to-get-dog-hair-out-of-a-car
- how-to-get-gravy-out-of-clothes
- how-to-get-oil-out-of-carpet
- how-to-get-red-wine-out-of-a-couch
- how-to-get-red-wine-out-of-clothes
- how-to-get-rid-of-condensation-on-windows
- how-to-get-salt-stains-out-of-carpet
- how-to-get-tree-sap-out-of-clothes
- how-to-get-wax-out-of-a-candle-jar
- how-to-remove-mold-from-window-sills
- how-to-remove-salt-stains-from-hardwood-floors
- how-to-remove-salt-stains-from-leather-boots
- how-to-remove-soap-scum-from-a-bathtub
- how-to-unclog-a-bathroom-sink
- how-to-unclog-a-toilet-without-a-plunger
- how-to-use-a-carpet-cleaner
- how-to-wash-a-down-jacket
- how-to-wash-a-fleece-blanket
- how-to-wash-a-mattress-protector
- how-to-wash-a-weighted-blanket
- how-to-wash-an-electric-blanket
- how-to-wash-cashmere
- how-to-wash-flannel-sheets
- how-to-wash-pillows
