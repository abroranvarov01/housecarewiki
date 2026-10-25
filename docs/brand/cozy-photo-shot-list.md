# Cozy photo shot list (homepage warmth)

The homepage hero now uses `public/images/hero-dog-coffee.webp`. It makes the page feel lived-in because it
shows a whole warm room with one small, relatable mishap. The room cards still use tight mid-cleaning close-ups,
which read as "chores", not "home". These prompts give each room the same feel as the hero.
They're illustrations: never caption them as our own test photos.

Style suffix for every prompt:
> Realistic photo, soft natural morning window light, warm cream and wood tones, a few green plants, lived-in
> but tidy American home, one small everyday mess in the scene, no people's faces, no brand names, logos or
> text, landscape 4:3, 2400 px wide.

Save as `public/images/<file>.png`, run `npm run optimize:images` (120 KB WebP budget), and replace
`cardImage` for the room in `src/lib/seed-data.ts` (or in the admin portal).

| File | Room card | Prompt (prepend to the style suffix) |
| --- | --- | --- |
| hero-dog-coffee (2400 px) | Homepage hero | Same scene as the current hero at higher resolution: golden retriever lying on a cream carpet beside a tipped-over mug and a small coffee spill, beige sofa and fig plant behind, bright empty wall on the left third for text |
| room-bathroom | Bathroom Cleaning | Bright bathroom with a wood vanity, round mirror, folded towels on a ladder, a plant on the sill; a few water spots on the glass shower door |
| room-kitchen | Kitchen Cleaning | Light kitchen counter with lemons, a plant and a cutting board; a hand wiping a small spill with a grey cloth |
| room-floor-carpet | Floor & Carpet Care | Living room rug with a light pattern, a cordless stick vacuum resting on it, a clean stripe visible, sofa and window behind |
| room-laundry | Laundry Care | Sunny laundry corner: folded towels, a plain detergent bottle, a basket, a small plant; one shirt with a visible stain on top |
| room-pet-hair | Pet Hair Removal | Dog asleep on a light sofa throw covered in visible fur, a lint roller on the cushion beside it |
| room-organization | Home Organization | Open pantry with plain glass jars and wooden shelves, a few items still on the counter waiting to be put away |
