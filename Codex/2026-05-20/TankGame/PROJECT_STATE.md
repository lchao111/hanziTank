# Hanzi Tank Project State

Last updated: 2026-05-24

## Purpose

Hanzi Tank is a browser-based educational tank game for children learning Chinese characters. The long-term goal is to help a player master 3000 Hanzi through battle, speech, review, mastery records, ranks, and eventually idiom-based boosts.

This file is the first place to read after context loss. It records the current architecture, important behavior, test commands, and near-term development plan.

## Current Runtime

- Main entry: `index.html`
- Browser launch: open `index.html` directly with a `file:///` URL.
- Game engine: Phaser 3.80.1 loaded from CDN.
- Phaser currently handles effects/projectile/gallery previews; DOM still owns most primary UI and tank/enemy body sprites.
- Battle VFX has been upgraded toward Phaser-native effects: camera shake/flash, enemy targeting lines, projectile muzzle flashes, projectile trails, impact glints, shockwaves, fire cores, sparks/debris, and smoke puffs are generated with Phaser primitives rather than texture assets.
- Tank destruction now uses Phaser armor debris particles and smoke. The DOM tank body receives `fragmented` and fades out instead of relying on a destroyed texture.
- Storage: browser `localStorage`.
- Sound: Web Audio API procedural effects.
- Speech: Web Speech API via `speechSynthesis`.
- Hanzi word speech now tries local `assets/audio/hanzi/uXXXX.mp3` clips first. Randomly generated normal and Stage 5 Boss questions probe the offline MP3 in the background; missing or unplayable clips are queued in browser `localStorage` under `hanziTankAudioDownloadQueue` and can be generated with `tools/generate-hanzi-audio.mjs --download-queue=path/to/queue.json`.
- The visible footer build tag is driven by `appVersion` in `index.html`; bump it on each behavior change so browser validation can be matched against the tested code.
- The first five encounters now form an explicit learning arc: stage 1 one-shot tank, stage 2 Regular Soldier spritesheet enemy with a shorter injury timer, stage 3 regular enemy tank spritesheet with shield/armor mechanics, stage 4 Grenadier spritesheet enemy that deals 2 damage, then the stage 5 single-Hanzi listening Boss. Correct-answer feedback calls out new Hanzi, review cleanup, practice count, and distance to the next rank.

## Important Commands

Run all regression tests before and after meaningful code changes:

```bash
npm test
```

Current test suite:

- `tests/speech-regression.test.js`
- `tests/pause-regression.test.js`
- `tests/words-core.test.js`
- `tests/enemies-core.test.js`
- `tests/shop-core.test.js`
- `tests/storage-core.test.js`
- `tests/combat-core.test.js`
- `tests/learning-core.test.js`
- `tests/question-core.test.js`
- `tests/mastery-core.test.js`
- `tests/mastery-regression.test.js`

## Module Layout

Data modules:

- `src/data/grade-one-words.js`
  - Grade 1 Hanzi data.
  - Exports `gradeOneWordData`, `createWords`, `createWordMap`.
  - Browser global: `window.HanziTankWords`.

- `src/data/enemies.js`
  - Enemy cycle, Boss template, enemy/tank sprite maps, portrait text, debug targets.
  - Browser global: `window.HanziTankEnemies`.

- `src/data/shop-items.js`
  - Tank and ammo shop data.
  - Exports `shopItems`, `getShopItem`, `isAmmoItem`.
  - Browser global: `window.HanziTankShop`.

Core modules:

- `src/core/mastery-core.js`
  - 3000-Hanzi goal, rank ladder, mastered-word counting.
  - Browser global: `window.HanziTankMastery`.

- `src/core/storage-core.js`
  - Default player state, profile helpers, password hashing, localStorage state merge, daily reset.
  - Browser global: `window.HanziTankStorage`.

- `src/core/combat-core.js`
  - Enemy creation by stage, defender damage, player damage, shot damage.
  - Browser global: `window.HanziTankCombat`.

- `src/core/learning-core.js`
  - `correctBank` / `wrongBank` normalization and recording.
  - Browser global: `window.HanziTankLearning`.

- `src/core/question-core.js`
  - Shuffle, weighted word selection, Boss phrase generation, Boss choice generation.
  - Browser global: `window.HanziTankQuestions`.

All extracted modules use UMD-style exports so they work both in browser globals and in Node `require()` tests. Keep this style until the project moves to a bundler.

## Key Gameplay Rules

Profiles:

- Each player has a profile name and password.
- Profiles are stored under `hanziTankProfiles`.
- State is stored under `hanziTankState:<profileId>`.

Defeat:

- On battle failure, reset current score to `0`.
- Reset `playerState.coins` to `0`.
- Reset `playerState.dailyScore` to `0`.
- Preserve `correctBank` and mastered Hanzi.
- Preserve war archive records.
- War summary records the pre-defeat score and coins.

Mastery:

- Mastered Hanzi currently come from unique entries in `playerState.correctBank`.
- Mastery target is `3000` Hanzi.
- Rank ladder advances every `300` Hanzi.
- Player leaderboard must show mastered Hanzi count and current rank.

Question selection:

- Normal battles use persistent spaced-repetition weights from `playerState.correctBank`.
- New Hanzi weight: `8`.
- Correct 1-4 times weight: `3`.
- Correct 5-9 times weight: `0.75`.
- Correct 10+ times weight: `0.05`.
- This persists across new runs, so mastered words become extremely rare even from stage 1.
- Review mode can still surface missed words through the review queue.

Speech:

- Boss questions show `??`; they must auto-pronounce one target Hanzi for a single-click matching challenge.
- Boss speech must use `queueChineseSpeech(..., { preserveMessage: true, shouldSpeak })`.
- `queueChineseSpeech` stores a structured queued request and retries while browser voices are delayed. `warmUpVoices()` flushes queued speech once voices are ready.
- Do not overwrite the Boss prompt with missing-voice warnings before attempting speech.
- Speak button must replay the current Boss Hanzi.

Pause:

- Pause preserves remaining `countdown`.
- Pause locks answering.
- Resume continues with `startCountdown(countdown)`, not a full reload reset.

Enemy Reload / Hit Stun:

- Successful non-lethal player hits reset enemy reload to a fresh countdown.
- Pausing should freeze, not reset, reload.
- Game Over is terminal until restart/debug/profile reset; after defeat, enemy reload and enemy firing must not restart.
- Enemy defeat is terminal until the next stage starts; after enemy HP reaches 0, enemy reload and enemy firing must not restart.
- Melee enemies use `attackStyle: "melee"` and `approachDistance` metadata. During reload they gradually move toward the player, then attack near the player and retreat. The visible DOM enemy must also approach, not only hidden Phaser actors. Visible melee approach distances use responsive `clamp(...vw...)` values instead of fixed pixels so large screens still show close-range pressure.

Defense:

- Absolute defense blocks any single hit completely.
- Armor absorbs incoming damage before HP.

Ammo:

- Special ammo is consumable.
- AP, HE, and cannon ammo add one-shot damage bonuses.
- Ammo now supports build archetypes through `doctrine` metadata: Defense, Magic, Agility, Recovery, Violent Attack, and Tactics.
- Smoke Shell and Flash Flare Shell both add smoke cover; the next enemy attack must miss and consumes one smoke cover charge.
- Repair Capsule repairs 1 HP on hit.
- Armor Plate Round adds 1 armor on hit.
- Arcane Spark Shell is the first Magic ammo and adds +1 damage with a distinct projectile style.

## Current Refactor Status

Completed refactor slices:

- Mastery/rank pure logic extracted.
- Word data extracted.
- Enemy/Boss/debug/texture data extracted.
- Shop/tank/ammo data extracted.
- Profile/storage helpers extracted.
- Combat damage/enemy creation extracted.
- Learning bank helpers extracted.
- Question selection/Boss phrase helpers extracted.

Still mostly in `index.html`:

- DOM rendering and CSS.
- Phaser effects and gallery scene wiring. Phaser effects should stay primitive/tween/camera based unless a full Phaser scene migration is planned.
- Audio and speech wrappers.
- Profile form UI wiring.
- Shop modal UI wiring.
- Mastery modal UI wiring.
- Archive modal UI wiring.
- Debug mode UI wiring.
- Battle orchestration and animation timing.

## Near-Term Plan

The code is now refactored enough to start new feature work safely.

Phaser migration note:

- The immediate direction is not to rewrite the whole game into Phaser Editor in one jump.
- Keep migrating the highest-impact game feel first: explosions, hit effects, screen shake, projectiles, enemy approach, and eventually actor movement.
- Projectiles should feel like Phaser VFX: muzzle flash, trail puffs, projectile glow, and impact glint rather than a lone DOM bullet.
- Enemy attacks should show Phaser targeting/wind-up feedback before the projectile impact.
- Destroyed tanks should look like Phaser particles/debris flying apart, not like a static destroyed sprite.
- Validate Phaser effects in-browser by checking scene display-list growth and camera shake/flash effects, because WebGL pixel reads may return zero without preserveDrawingBuffer.

Asset sourcing plan:

- For Phaser actor migration, prefer real 2D game sprites over generated SVG art.
- Primary sources to search:
  - Itch.io: search `Top down Tank Sprite`, `WW2 tank sprites`, `top down vehicle pack`.
  - OpenGameArt.org: search `Tank`, `top down tank`, `orthographic vehicle`.
- Preferred asset traits:
  - Top-down or orthographic view.
  - Hull and turret separated when possible.
  - Destruction animation frames included when possible.
  - Muzzle flash / projectile / impact frames included when possible.
  - Transparent PNG spritesheets or Phaser-ready texture atlases.
  - Clear license compatible with this project.
- Proposed future asset folders:
  - `assets/sprites/tanks/`
  - `assets/sprites/enemies/`
  - `assets/sprites/effects/`
  - `assets/atlases/`
  - `assets/licenses/`
- Do not replace all SVGs at once. Import one tank pack first, wire one player tank and one enemy tank, validate, then continue.
- Keep current SVGs as fallback until Phaser sprite actors are stable.
- Imported trial pack: Kenney Top-down Tanks Redux from OpenGameArt.org, CC0. License stored at `assets/licenses/kenney_topdownTanksRedux_LICENSE.txt`.
- Kenney green/red hull/turret sprites are imported and preloadable, but they are not currently active as battlefield actors because the tiny top-down pixel sprites do not fit the current side-view battlefield scale. Current DOM SVG bodies remain visible as fallback until a full top-down actor scene is implemented.
- Tank Dismantler Boss now has a Phaser spritesheet path: `assets/sprites/enemies/tank-dismantler-spritesheet.png`, loaded as `bossTankDismantler` with `frameWidth: 224` and `frameHeight: 224`. Frames `0-5` are the walking loop and frames `6-11` are the hammer attack.
- To rebuild the Boss spritesheet from the user-provided reference image, save the source as `assets/source/tank-breaker-robot-reference.png`, then run `./tools/crop-dismantler-spritesheet.ps1`. The script crops the 2x6 reference grid and removes the white background for Phaser.
- Player tank battle art now uses `assets/sprites/tanks/player-tank-spritesheet.png`, loaded as `playerTankBattle` with `frameWidth: 224` and `frameHeight: 144`. Rows are idle (`0-5`), fire (`6-11`), heavy fire (`12-17`), hit/weak smoking (`18-23`), and destroyed/burning (`24-29`). The DOM tank SVG stays as fallback if the Phaser texture is unavailable.
- Stage 2 Regular Soldier art now uses `assets/sprites/enemies/regular-infantry-spritesheet.png`, loaded as `regularInfantry` with `frameWidth: 469` and `frameHeight: 300`. Frames `0-5` are walk/idle, `6-11` are rifle firing, and `18-23` are hit frames. The DOM infantry SVG stays as fallback.
- Stage 3 regular enemy tank art now uses `assets/sprites/enemies/regular-enemy-tank-spritesheet.png`, loaded as `regularEnemyTank` with `frameWidth: 469` and `frameHeight: 300`. Frames `0-5` are idle, `6-11` are cannon firing, and `18-23` are hit frames. The DOM armor SVG stays as fallback.
- Stage 4 Grenadier art now uses `assets/sprites/enemies/grenadier-spritesheet.png`, loaded as `grenadier` with `frameWidth: 469` and `frameHeight: 300`. Frames `0-5` are walk/idle, `6-11` are grenade throw/fire, and `18-23` are hit frames. The DOM RPG infantry SVG stays as fallback.
- Enemy side-view spritesheets should face the left-side player in battle. If source art faces right, set `setFlipX(true)` in the Phaser actor builder/updater and cover it with regression tests.

Next recommended feature slice:

1. Add `src/core/idiom-boosts-core.js`.
2. Add tests for idiom unlock and one-equipped-boost rule.
3. Add idiom boost data without battle effects first.
4. Add a read-only Idiom Boosts section to Mastery Records.
5. Only after that, wire one simple battle effect.

Suggested first idiom boost data:

- `一石二鸟`
- `一日千里`
- `七上八下`
- `五花八门`
- `千山万水`
- `上下一心`
- `上天入地`
- `开门见山`
- `不明不白`
- `春夏秋冬`
- `明明白白`

## Git Notes

- Last pushed commit before the current refactor series: `1a91db6 Expand Hanzi Tank progression and testing`.
- `.vscode/` has local settings and should not be committed unless explicitly requested.
- Before committing, run `npm test`.

## Recovery Checklist After Context Loss

1. Read this file.
2. Read `DEVELOPMENT_GUIDELINES.md`.
3. Run `npm test`.
4. Inspect `git status --short -- .`.
5. Continue with one small refactor or feature slice.
