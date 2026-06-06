# Self-Destruct Truck Spritesheet Prompt

Runtime id: `truck`
Current fallback: `assets/enemy-suicide-truck.svg`
Status: pending final model-generated bitmap spritesheet

Interim deterministic package, generated 2026-05-30 because built-in image generation was not exposed in the Codex sandbox:

- Runtime sheet: `assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png`
- Explosion VFX sheet: `assets/sprites/effects/self-destruct-truck-explosion-interim-spritesheet.png`
- Gallery preview: `assets/sprites/enemies/gallery/self-destruct-truck-interim-preview.png`
- QC/provenance: `assets/source/enemy-candidates/self-destruct-truck-interim-pipeline-meta.json`
- License/provenance note: `assets/licenses/derived_self_destruct_truck_interim_LICENSE.txt`

The interim package is transparent PNG runtime art and is wired for gameplay/QC, but it is not final production art and must not be described as final generated/imported bitmap art.

Final generation prompt:

Create a PNG spritesheet for a self-destruct truck elite in Hanzi Tank.
Style: children's educational tank game, warm illustrated war-room palette, matte hand-painted 2D, olive/rust/desaturated red metal, amber warning accents, thick dark outlines, readable at small battlefield size.

Subject: chunky rust-red toy-like armored truck facing left, front bumper spikes, boxed explosive cargo with safe stylized warning markings, smoke puffs, rivets, dented panels. Kid-friendly and non-gory.

Strict sheet standard: exactly 6 columns x 5 rows. Each cell is exactly 224 x 144 px. Total canvas size is exactly 1344 x 720 px. Use a solid pure green background, exactly `#00FF00`, across the entire sheet.

Do not include checkerboard, transparent preview background, grid lines, gutters, borders, labels, UI, text, or frame numbers. The truck and all effects must be fully inside each 224 x 144 cell. Keep the truck centered inside the central 70% safe area, use the same scale per row, and keep the same bottom baseline/anchor within each row. No smoke, blur, warning glow, flame, explosion, debris, or cargo parts may cross cell boundaries.

Layout rows:
Row 1: movement/driving frames, idle rolling menace and forward truck motion.
Row 2: normal firing/attack frames, rush warning with compact amber-red warning lights.
Row 3: heavy firing/attack frames, accelerating charge and explosion wind-up with contained cargo shake/glow.
Row 4: damaged frames, hit reaction and smoke jolt contained close to the truck body.
Row 5: destroyed frames, contained flame/explosion/debris and smoke settle fully inside each cell.

Do not generate a separate VFX strip from this enemy spritesheet prompt. If a layered explosion VFX asset is needed later, write a separate prompt spec for that runtime effect with its own approved sheet standard and QC requirements.

Negative prompt: photorealism, gore, blood, horror, skulls, real flags, political symbols, neon cyberpunk, glossy 3D, tiny unreadable text, cropped subject, inconsistent framing, blurry edges, transparent background, checkerboard background, grid lines, borders, effects crossing cell edges.
