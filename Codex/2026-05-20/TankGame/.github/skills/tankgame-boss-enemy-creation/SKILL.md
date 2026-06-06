---
name: tankgame-boss-enemy-creation
description: Use when creating or changing a TankGame boss, enemy, elite unit, enemy attack, enemy debug entry, or Boss-style encounter.
---

# TankGame Boss And Enemy Creation

Use this skill when adding or changing enemies that affect combat behavior, debug mode, VFX, or Field Guide previews.

## When to Use

- Adding a regular enemy, elite enemy, boss, Boss phase, or special attack.
- Updating enemy data in `src/data/enemies.js`.
- Extending mechanics documented in `ENEMY_DESIGN_LOG.md`.
- Touching coverage such as `tests/enemy-elites-regression.test.js`, `tests/enemies-core.test.js`, or `tests/combat-core.test.js`.

## Workflow

1. Define the gameplay role first: pressure pattern, telegraph, fair timing, reward, and child-readable visual cue.
2. Add or update the enemy data in `src/data/enemies.js`, including stable ids, attack metadata, debug targets, texture keys, preview mappings, and any Boss phase metadata.
3. Keep combat math in `src/core/combat-core.js` or another pure module when possible; leave DOM/Phaser orchestration in `index.html`.
4. Add a direct Debug Mode entry for hand testing through `enemyId` when the unit has unique mechanics.
5. Wire VFX and sprites only after behavior is testable. Use `tankgame-asset-factory` for new strict enemy spritesheets.
6. Record final or interim asset status in provenance files and avoid claiming placeholder or interim-derived bitmap art as final.
7. Update `ENEMY_DESIGN_LOG.md` or `PROJECT_STATE.md` when a durable enemy pattern changes.

## Verification

- Run the focused enemy/combat tests: `node tests/enemies-core.test.js`, `node tests/enemy-elites-regression.test.js`, and any specific regression for the Boss or enemy.
- Run Phaser-related tests when effects or textures change.
- Browser validate the Debug Mode entry and confirm telegraphs, hit reactions, defeat behavior, and no reload-after-defeat regressions.

## Common Mistakes

- Adding an enemy without a direct debug target.
- Creating a visual spectacle without a fair warning window.
- Forgetting terminal defeat/game-over guards.
- Mixing final-art claims with interim-derived assets.---
name: tankgame-boss-enemy-creation
description: "Use when creating or changing a TankGame boss, enemy, elite unit, debug enemy entry, attack style, telegraph, destruction behavior, or enemy regression coverage."
---

# TankGame Boss And Enemy Creation

Use this when adding or revising combat units. The goal is a playable enemy with clear data, fair warning, visible feedback, tests, and asset provenance.

## When to Use

- The task asks for a boss, enemy, elite, attack style, special phase, direct debug entry, gallery preview, or destruction VFX.
- A unit needs new fields in `src/data/enemies.js` or new behavior in combat/VFX paths.
- Existing enemy mechanics need regression coverage.

Do not use this for pure art generation alone; use `tankgame-asset-factory` for spritesheet production.

## Workflow

1. Read `ENEMY_DESIGN_LOG.md`, `src/data/enemies.js`, and the relevant sections of `AGENT_HANDOFF.md`.
2. Define the unit role in one sentence: pressure pattern, child-readable telegraph, damage timing, defeat behavior.
3. Add or update enemy data first, keeping stable IDs and debug targets explicit.
4. Add focused tests in `tests/enemy-elites-regression.test.js`, `tests/enemies-core.test.js`, or a narrower regression file before wiring runtime behavior.
5. Wire runtime behavior in the smallest path that controls attack, hit reaction, phase transition, or destruction.
6. Add Phaser/DOM visual feedback only after the mechanics are test-covered.
7. Record asset status honestly: final generated/imported art, interim-derived-bitmap, SVG fallback, or prompt-only pending state.
8. Update gallery/manifest/provenance when a unit gains promoted bitmap assets.

## Verification

- Run the focused enemy tests, commonly `node tests/enemies-core.test.js`, `node tests/enemy-elites-regression.test.js`, and `node tests/combat-core.test.js`.
- Run Phaser asset/VFX regressions when visual effects or runtime sheets changed.
- Browser-test the direct Debug Mode entry for the new unit.
- Run `npm test` before claiming the enemy is complete.
