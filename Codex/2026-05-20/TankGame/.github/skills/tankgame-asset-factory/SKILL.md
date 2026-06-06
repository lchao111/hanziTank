---
name: tankgame-asset-factory
description: Use when running TankGame asset factory, enemy spritesheet imagegen, strict spritesheet QC, ComfyUI/manual imports, or asset processing.
---

# TankGame Asset Factory

Use this skill for repeatable enemy and boss spritesheet production using the project asset factory.

## When to Use

- Generating or importing an enemy/boss spritesheet for TankGame.
- Preparing a prompt packet for Codex/Game Studio imagegen, local ComfyUI, or manual import.
- Running strict spritesheet QC before promotion.
- Working from the process in `docs/ASSET_FACTORY.md` and the art rules in `ART_STYLE_GUIDE.md`.

## Workflow

1. Read `docs/ASSET_FACTORY.md` and the relevant prompt/spec under `assets/source/enemy-candidates/`.
2. Confirm the target `enemy-id` and strict contract: 6 columns x 5 rows, 224 x 144 cells, 1344 x 720 total, solid `#00FF00` background.
3. Use provider order: built-in imagegen when available, local ComfyUI when configured, then manual import from a downloaded PNG.
4. Print the prompt or provider packet with `npm run asset -- prompt <enemy-id>` or `npm run asset -- imagegen <enemy-id>`.
5. Import downloaded/generated output with `npm run asset -- import <enemy-id> -- --input "path\to\raw.png"`.
6. Run `npm run asset -- qc <enemy-id>` and fix the source image if QC fails.
7. Run `npm run asset -- process <enemy-id>` only after QC passes.
8. Keep output under `assets/source/generated/enemies/<enemy-id>/` until visually approved. Do not overwrite live `assets/sprites/enemies/` from raw output.

## Verification

- Run `npm run test:asset-factory` after tool or contract changes.
- Inspect `transparent.png`, frames, and `pipeline-meta.json` before promotion.
- Update asset provenance/license notes under `assets/licenses/` for generated or third-party-derived work.

## Common Mistakes

- Accepting checkerboard or transparent preview backgrounds instead of strict green raw sheets.
- Letting smoke, muzzle flash, or weapons cross cell boundaries.
- Promoting assets before QC and visual review.
- Treating interim generated art as final when manifest/status says otherwise.---
name: tankgame-asset-factory
description: "Use when running the TankGame asset factory for enemy or boss spritesheet generation, imagegen packets, manual import, ComfyUI checks, transparent processing, or QC."
---

# TankGame Asset Factory

Use this for the repeatable asset factory pipeline:

```text
prompt spec -> image generation or manual import -> raw.png -> QC -> transparent sheet -> frames -> metadata
```

## When to Use

- The task says asset factory, spritesheet, QC, imagegen packet, ComfyUI, manual import, or generated enemy/boss art.
- A new enemy or boss needs a strict 6 x 5 runtime sheet before game integration.
- A generated sheet must be checked before promotion into live `assets/sprites/` paths.

Do not use this for one-off UI CSS, DOM-only layout work, or unverified placeholder art.

## Workflow

1. Read `docs/ASSET_FACTORY.md` and `ART_STYLE_GUIDE.md`.
2. Confirm the strict enemy sheet contract: 6 columns x 5 rows, 224 x 144 cells, 1344 x 720 total, pure green `#00FF00` background.
3. Use provider order: built-in image generation if available, local ComfyUI if configured, then manual import.
4. Print the prompt or packet with `npm run asset -- prompt <enemy-id>` or `npm run asset -- imagegen <enemy-id>`.
5. Import downloaded/generated PNGs with `npm run asset -- import <enemy-id> -- --input "<path>"`.
6. Run `npm run asset -- qc <enemy-id>` and fix source issues before processing.
7. Run `npm run asset -- process <enemy-id>` only after QC passes.
8. Keep outputs under `assets/source/generated/enemies/<enemy-id>/` until visual review and a separate promotion step.

## Verification

- Run `npm run test:asset-factory` after tool or pipeline changes.
- Re-run `npm run asset -- qc <enemy-id>` after any source replacement.
- Visually inspect `transparent.png` and frame outputs before wiring runtime art.
