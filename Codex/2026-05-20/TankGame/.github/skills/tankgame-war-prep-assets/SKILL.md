---
name: tankgame-war-prep-assets
description: Use when upgrading TankGame War Prep assets, tank preview PNG art, ammo spritesheets, War Prep buttons, or shop preview visuals.
---

# TankGame War Prep Assets

Use this skill for War Prep tank, ammo, equipment, and button visual upgrades.

## When to Use

- Replacing low-quality War Prep SVG fallback art with real bitmap previews.
- Generating tank preview PNGs under `assets/sprites/tanks/war-prep/`.
- Generating or wiring ammo spritesheets/effects.
- Updating War Prep tests such as `tests/war-prep-ui-regression.test.js` and asset manifest coverage.
- Following prior decisions in `IMAGE_GENERATION_WORK_LOG.md`.

## Workflow

1. Read `ART_STYLE_GUIDE.md` and the relevant section of `IMAGE_GENERATION_WORK_LOG.md` before changing visuals.
2. Prefer high-quality project-owned/generated bitmap assets or license-safe imported assets. Avoid placeholder-looking CSS/SVG/procedural substitutes for final War Prep surfaces.
3. Keep source images under `assets/source/` and promoted previews under `assets/sprites/`.
4. For tank previews, maintain transparent, stable card art under `assets/sprites/tanks/war-prep/` and preserve old SVGs as fallback only.
5. For ammo, keep named projectile sheet metadata in shop data and ensure War Prep cards animate spritesheet previews.
6. Update asset manifest entries and `assets/licenses/` provenance notes for every generated or imported visual.
7. Keep purchase economics, tank stats, and ammo stats out of scope unless explicitly requested.

## Verification

- Run `node tests/war-prep-ui-regression.test.js` after War Prep UI/preview changes.
- Run `node tests/asset-manifest.test.js` after asset manifest or provenance changes.
- Run `node tests/shop-core.test.js` after shop metadata changes.
- Browser validate the War Prep modal and confirm previews are crisp, nonblank, transparent, and not SVG fallbacks.

## Common Mistakes

- Wiring a preview path without adding manifest/provenance coverage.
- Using generated sheets that still contain green-screen residue or cropped frames.
- Letting War Prep cards diverge from in-battle asset quality.
- Hiding placeholder art behind CSS instead of replacing the actual source.---
name: tankgame-war-prep-assets
description: "Use when upgrading TankGame War Prep assets, tank preview PNGs, ammo spritesheets, equipment card art, shop previews, arsenal buttons, or related UI regressions."
---

# TankGame War Prep Assets

Use this for War Prep visual upgrades that affect tank cards, ammo cards, equipment previews, shop/arsenal UI, or asset manifest coverage.

## When to Use

- The task mentions War Prep, tank preview, ammo, equipment cards, arsenal button art, shop preview quality, or placeholder SVG replacement.
- Tank cards must use high-quality bitmap PNG previews rather than low-quality SVG fallbacks.
- Ammo cards or attack VFX need named spritesheet previews and matching runtime effects.

## Workflow

1. Read `IMAGE_GENERATION_WORK_LOG.md`, `ART_STYLE_GUIDE.md`, and the relevant War Prep tests.
2. Prefer high-quality real/generated bitmap assets. Keep procedural or SVG art as fallback only unless the user explicitly asks for a temporary placeholder.
3. Store source files under `assets/source/` and record provenance under `assets/licenses/`.
4. Generate or import deterministic tank preview outputs under `assets/sprites/tanks/war-prep/`.
5. Generate or import ammo/effect sheets under `assets/sprites/effects/` with stable names used by shop data.
6. Update War Prep mappings in `index.html` or data modules so previews use promoted PNG/spritesheet paths.
7. Update asset manifest coverage and keep old fallback assets untouched unless removal is explicitly requested.

## Verification

- Run `node tests/war-prep-ui-regression.test.js` after War Prep UI mapping changes.
- Run `node tests/asset-manifest.test.js` after adding promoted assets or provenance.
- Run `node tests/shop-core.test.js` after tank/ammo metadata changes.
- Use browser validation for card sizing, animation, and no text overlap.
