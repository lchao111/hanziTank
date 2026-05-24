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
- Storage: browser `localStorage`.
- Sound: Web Audio API procedural effects.
- Speech: Web Speech API via `speechSynthesis`.

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

- Boss questions show `??`; they must auto-pronounce the target phrase.
- Boss speech must use `queueChineseSpeech(..., { preserveMessage: true, shouldSpeak })`.
- Do not overwrite the Boss prompt with missing-voice warnings before attempting speech.
- Speak button must replay the current Boss phrase.

Pause:

- Pause preserves remaining `countdown`.
- Pause locks answering.
- Resume continues with `startCountdown(countdown)`, not a full reload reset.

Enemy Reload / Hit Stun:

- Successful non-lethal player hits reset enemy reload to a fresh countdown.
- Pausing should freeze, not reset, reload.
- Game Over is terminal until restart/debug/profile reset; after defeat, enemy reload and enemy firing must not restart.
- Enemy defeat is terminal until the next stage starts; after enemy HP reaches 0, enemy reload and enemy firing must not restart.

Defense:

- Absolute defense blocks any single hit completely.
- Armor absorbs incoming damage before HP.

Ammo:

- Special ammo is consumable.
- AP, HE, and cannon ammo add one-shot damage bonuses.

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
- Phaser effects and gallery scene wiring.
- Audio and speech wrappers.
- Profile form UI wiring.
- Shop modal UI wiring.
- Mastery modal UI wiring.
- Archive modal UI wiring.
- Debug mode UI wiring.
- Battle orchestration and animation timing.

## Near-Term Plan

The code is now refactored enough to start new feature work safely.

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
