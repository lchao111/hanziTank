---
name: tankgame-phaser-vfx
description: Use when changing TankGame Phaser VFX, battle effects, projectiles, particles, camera shake, bitmap effects, or browser validation.
---

# TankGame Phaser VFX

Use this skill when changing the battle-feel layer handled by Phaser.

## When to Use

- Adding or changing Phaser effects, projectiles, particles, shockwaves, smoke, camera flash, camera shake, or bitmap VFX.
- Wiring enemy attack wind-ups, hit reactions, destruction effects, or actor texture states.
- Updating `index.html` effects functions or tests such as `tests/phaser-vfx-regression.test.js` and `tests/phaser-vfx-enemies-asset.test.js`.
- Following Phaser runtime notes in `PROJECT_STATE.md`.

## Workflow

1. Keep Phaser as the effects/actor enhancement layer unless a dedicated migration changes architecture.
2. Preserve DOM tank/enemy bodies as reliable fallbacks while adding Phaser sprites or effects.
3. Prefer visible warnings before enemy impacts: targeting lines, wind-up, recoil, flash, sound, or movement cue.
4. Combine bitmap assets with Phaser primitives when useful: muzzle flashes, trails, glints, smoke, debris, shockwaves, and camera feedback.
5. Guard effects against missing textures and stale game states. Do not restart reloads or attacks after game over or enemy defeat.
6. Add source-level regression tests for new effect branches, texture keys, and display-list/tween expectations.
7. Browser validate because WebGL pixel reads may be unreliable without `preserveDrawingBuffer`.

## Verification

- Run `node tests/phaser-vfx-regression.test.js` after effects logic changes.
- Run `node tests/phaser-vfx-enemies-asset.test.js` after enemy texture/spritesheet wiring.
- Run enemy or combat tests when VFX changes touch attack timing or damage.
- Start `npm start` and inspect `http://127.0.0.1:5173/index.html` for nonblank, correctly layered, fair, readable effects.

## Common Mistakes

- Treating a source-level test as proof that the canvas looks right.
- Letting Phaser overlays cover Hanzi UI or speech prompts.
- Adding impact effects without a pre-impact warning.
- Forgetting fallback behavior when a texture is unavailable.---
name: tankgame-phaser-vfx
description: "Use when adding or changing TankGame Phaser VFX, projectile effects, camera shake, particles, weather overlays, bitmap effect sheets, or browser validation for battle feel."
---

# TankGame Phaser VFX

Use this for battle feel work in the Phaser effects layer. Phaser currently augments the DOM game rather than replacing all actors.

## When to Use

- The task mentions Phaser, VFX, projectile, muzzle flash, trail, impact, debris, camera shake, weather, actor sprite sheets, or browser validation.
- A combat mechanic needs visible telegraphing, hit reaction, explosion, destruction, or environmental effects.
- Runtime asset loading or display-list behavior needs regression coverage.

## Workflow

1. Read the current Phaser notes in `PROJECT_STATE.md` and inspect the relevant `index.html` effect functions before editing.
2. Keep DOM tank/enemy bodies as the reliable primary display path unless the task is explicitly a Phaser actor migration.
3. Prefer Phaser primitives, tweens, particles, camera shake/flash, and promoted bitmap effect sheets over CSS-only effects.
4. Make effects state-aware: no new attacks after Game Over, enemy defeat, pause, or stale phase transitions.
5. Add source-level or behavior regression coverage in `tests/phaser-vfx-regression.test.js` or `tests/phaser-vfx-enemies-asset.test.js`.
6. Use browser validation for UI/gameplay/VFX because source tests cannot prove the canvas looks correct.
7. Do not rely only on WebGL pixel reads; display-list growth and camera/effect state checks are often more reliable here.

## Verification

- Run `node tests/phaser-vfx-regression.test.js` after effect wiring changes.
- Run `node tests/phaser-vfx-enemies-asset.test.js` after enemy or texture asset changes.
- Browser-test the battle path that triggers the effect.
- Run `npm test` for shared combat, pause, Game Over, or asset changes.
