# Hanzi Tank Development Guidelines

These rules guide future development for Hanzi Tank. Read this file before changing architecture, gameplay systems, storage, tests, or UI behavior.

## 1. Work in Small Slices

- Make one coherent change at a time.
- Prefer pure module extraction before feature wiring.
- Keep the game playable after every slice.
- Run `npm test` after each meaningful change.
- Use browser validation for any UI, Phaser, speech, or gameplay change.

## 2. Module Boundaries

Use data modules for static configuration:

- Word banks.
- Enemy data.
- Shop items.
- Idiom boost definitions.
- Rank tables.

Use core modules for pure logic:

- Mastery/rank calculations.
- Storage/state merge rules.
- Combat damage calculations.
- Question selection.
- Learning-bank updates.
- Idiom unlock and equipment rules.

Keep `index.html` focused on orchestration:

- DOM selection.
- Event listeners.
- Rendering.
- Animation timing.
- Audio/Phaser side effects.

Do not move behavior into a module if the module needs direct DOM access. Extract a pure calculation first, then leave the DOM wrapper in `index.html`.

## 3. Module Format

Until the project adopts a bundler, new shared modules should use the existing UMD-style pattern:

```js
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankSomething = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return { /* exports */ };
});
```

This keeps modules usable in both:

- Browser globals through `window.HanziTankSomething`.
- Node tests through `require()`.

## 4. Testing Rules

Every new core module needs a direct Node test.

Examples:

- `src/core/combat-core.js` -> `tests/combat-core.test.js`
- `src/data/shop-items.js` -> `tests/shop-core.test.js`
- Future `src/core/idiom-boosts-core.js` -> `tests/idiom-boosts-core.test.js`

Regression tests should protect integration contracts:

- Required scripts are loaded in `index.html`.
- Existing wrappers still call extracted helpers.
- Critical gameplay rules are not silently removed.

Run:

```bash
npm test
```

before considering a task done.

## 5. Code Quality Standards

Follow these principles:

- DRY: extract repeated logic after it appears more than twice.
- SRP: each module and function should do one thing.
- Clear interfaces: pass dependencies as parameters instead of reaching into globals.
- Defensive input handling: tolerate nulls, empty arrays, malformed storage, and missing optional fields.
- Clear errors: throw concrete errors for invalid internal calls in core modules.
- Semantic names: avoid vague names like `data`, `temp`, `obj`, `x`, `y` except in tiny local math contexts.
- Comments should explain why, not what.

Because this is currently plain JavaScript, type annotations are not available. Use explicit validation, stable object shapes, and targeted tests to compensate. If the project later moves to TypeScript, public functions should receive explicit parameter and return types.

## 6. Storage and Security

- Do not change localStorage key names casually.
- Existing profile key: `hanziTankProfiles`.
- Existing state key pattern: `hanziTankState:<profileId>`.
- Passwords are currently hashed with a simple local hash and salt. This is only local child-profile protection, not real security.
- Do not hardcode secrets.
- Validate profile names and password length before profile creation/login.

## 7. Gameplay Invariants

Do not break these rules without explicit product decision:

- Defeat resets `score`, `playerState.coins`, and `dailyScore`.
- Defeat does not clear `correctBank`.
- Mastery derives from unique `correctBank` Hanzi.
- Player leaderboard shows best stage, mastered Hanzi count, and rank.
- Boss questions must pronounce the target phrase because the prompt is `??`.
- Pause freezes reload countdown and resumes from the same remaining seconds.
- Successful non-lethal hits reset enemy reload to a fresh countdown.
- Absolute defense blocks one hit regardless of damage.
- Armor absorbs damage before HP.
- Special ammo is consumable.

## 8. UI Guidelines

- Keep educational workflows visible and simple.
- Avoid hiding learning progress behind combat-only UI.
- Kids should be able to inspect learned Hanzi, rank, and future idiom boosts without starting a battle.
- Prefer concise labels and stable layouts.
- Do not add tutorial text inside the primary battle surface unless it is needed for the current interaction.

## 9. Phaser Guidelines

- Keep Phaser as an effects layer unless a feature has been verified visually.
- DOM tank/enemy bodies remain the reliable primary display path for now.
- When adding Phaser-rendered sprites or canvases, validate in the browser.
- For SVG assets in Phaser, use `load.svg`, not `load.image`.

## 10. Speech Guidelines

- Boss auto speech must use `queueChineseSpeech` with `preserveMessage: true` and a stale-state guard.
- Speak button must replay the current Boss phrase.
- Do not show missing-voice warnings before attempting speech; browsers may still pronounce `zh-CN` without exposing a named Chinese voice.
- Run speech regression tests after any speech, Boss question, or prompt change.

## 11. Idiom Boost Development Plan

When implementing idiom boosts, proceed in this order:

1. Create `src/core/idiom-boosts-core.js`.
2. Add `tests/idiom-boosts-core.test.js`.
3. Define boost data and required Hanzi.
4. Implement unlock checks from mastered Hanzi.
5. Implement one-equipped-boost rule in pure logic.
6. Add a read-only Idiom Boosts section to Mastery Records.
7. Add equip/unequip UI.
8. Add one simple battle effect.
9. Add regression tests for the battle effect.

Do not implement multiple boost battle effects at once.

## 12. Definition of Done

A change is done only when:

- The code is scoped to one feature/refactor slice.
- `npm test` passes.
- Browser validation is done for UI/gameplay changes.
- `PROJECT_STATE.md` is updated if architecture, workflow, or next steps changed.
- The final summary names changed files and verification performed.
