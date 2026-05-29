# Enemy Design Log

## 2026-05-29 - Elite Enemy Runtime Slice

- Upgraded the existing self-destruct truck data into an elite rush unit with `selfDestruct` attack style, rush warning telegraph, accelerating crash timing, smoke-jolt hit reaction, and self-destruct debris death VFX.
- Added four new elite enemy data entries: Spring Soldier, Drone Swarm, Mechanical Wolf Pack, and Mechanical Fleas.
- Wired direct Chao debug targets for each elite so they can be tested in the single-enemy battlefield without changing the normal adventure cycle.
- Added Phaser primitive VFX routes for each requested mechanic: spring coils/scatter, drone orbit/EM/dispersal, wolf flank/pounce/break-apart, flea hops/squish/pop, and upgraded truck debris.
- Final bitmap spritesheets were not generated in this session. Prompt/spec files were added under `assets/source/enemy-candidates/`; current runtime uses existing project SVG fallback art temporarily.

## 2026-05-29 - Enemy Gallery Bitmap Preview Slice

- Added `enemyGalleryPreviewMap` and `enemyGallerySpriteSheets` to enemy data so Field Guide card thumbnails and large previews use bitmap PNG/spritesheet sources.
- Added deterministic derived gallery previews under `assets/sprites/enemies/gallery/` for all regular enemies, the Tank Dismantler Boss, Self-Destruct Truck, and all current elite enemies.
- Added interim 4x2 gallery spritesheets for Self-Destruct Truck, Spring Soldier, Drone Swarm, Mechanical Wolf Pack, and Mechanical Fleas. These are project-native bitmap derivations for the Field Guide only.
- Final generated truck/elite spritesheets remain open; keep using the prompt specs under `assets/source/enemy-candidates/` before claiming final enemy art complete.
