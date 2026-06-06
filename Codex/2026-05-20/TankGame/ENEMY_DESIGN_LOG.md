# Enemy Design Log

## 2026-06-05 - Bouncing Tank Boss Multi-Lane Mobility

- Added `bouncingTankBoss` as a direct Debug Mode Boss entry with user-provided transparent bitmap runtime art.
- The Boss uses three active lanes: the player can move lanes with the existing up/down controls, while the Boss is visible only on its current lane.
- Only the lane currently containing the Boss shows a Hanzi question. Empty lanes show no question tag and the main prompt tells the player which lane to chase.
- Correct shots from the Boss lane trigger a jump dodge and move the Boss to another lane. Correct shots from the wrong lane miss without advancing the dodge counter, with a visible `MISS` near the previous Boss lane.
- After three successful dodge jumps, the Boss enters a 10-second `Paralyzed` window on the lane it jumped to, playing the electric spark animation and showing an overhead `Paralyzed Ns` countdown badge. Correct aligned answers during that window keep the Boss paralyzed and can deal multiple hits before recovery; a failed attempt or timeout closes the window and restarts the jumping pattern without a counterattack.
- Outside the malfunction window, the Boss keeps a 4-second attack countdown. Timeouts and wrong answers trigger a counterattack from the Boss lane: it plays the fire/head-rotation row and shoots a projectile at the player.
- Low HP uses the weak animation row and defeat holds the destroyed row with heavy Boss destruction VFX.

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

## 2026-05-29 - Drone Swarm Boss Split Phase

- Added `droneSwarmBoss` as a direct Debug Mode Boss entry. It uses the existing drone swarm volley as phase 1 pressure.
- First defeat of `droneSwarmBoss` starts a split phase instead of calling stage clear. Five active lane drones appear with unique Hanzi targets selected from the active word pool.
- Each split drone has its own HP, attack countdown, lane HUD, and interim PNG runtime art. Correct answers damage only the currently selected lane drone.
- Drones keep attacking through the reused multi-lane advance loop until all five are defeated, then the normal Boss-stage clear path runs without War Supply.
- Final generated Drone Swarm Boss art remains pending; the current runtime sheet is marked `interim-derived-bitmap`.

## 2026-05-30 - Self-Destruct Truck Runtime Art/VFX Wiring

- Added a deterministic interim transparent truck runtime sheet for `truck`: 5 rows x 6 columns, 469x300 frames.
- Frame mapping:
  - 0-5 idle / rolling menace.
  - 6-11 reload / rush warning.
  - 12-17 accelerating charge.
  - 18-20 hit / smoke jolt.
  - 21-23 explosion wind-up.
  - 24-29 destroyed debris / smoke.
- Added a separate deterministic interim explosion VFX sheet: 2 rows x 4 columns, 320x192 frames, frames 0-7.
- Wired runtime Phaser truck states for reload warning, charge, hit reaction, explosion wind-up, death/destruction, and the crash/death explosion sheet while preserving the existing self-destruct attack timing and damage mechanics.
- Enemy Gallery now uses the interim runtime truck sheet and PNG preview instead of the older regular-tank-derived 4x2 gallery sheet.
- Final generated/imported truck art remains pending; current assets are marked `interim-derived-bitmap-pending-final-generation`.
