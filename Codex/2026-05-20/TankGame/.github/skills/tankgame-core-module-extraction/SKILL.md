---
name: tankgame-core-module-extraction
description: Use when TankGame work needs a core module, pure logic extraction, UMD shared code, or Node tests for gameplay/data behavior.
---

# TankGame Core Module Extraction

Use this skill when moving repeated gameplay or data behavior out of `index.html` into testable project modules.

## When to Use

- Extracting pure logic into `src/core/` or static configuration into `src/data/`.
- Adding behavior that should be reused by battle, mini-games, storage, mastery, questions, learning, enemies, or shop code.
- Protecting rules from `DEVELOPMENT_GUIDELINES.md`, especially module boundaries and gameplay invariants.

Do not extract code that directly needs DOM nodes, Phaser scene objects, Web Audio nodes, or browser-only side effects. First isolate the pure calculation, then keep the wrapper in `index.html`.

## Workflow

1. Identify the smallest pure behavior and the existing call site in `index.html`, `src/core/`, or `src/data/`.
2. Add or update the focused Node test under `tests/` before implementation.
3. Use the current UMD pattern from `DEVELOPMENT_GUIDELINES.md` so the module works through both Node `require()` and browser globals.
4. Export stable, named helpers. Pass state and dependencies as parameters instead of reaching into globals.
5. Leave DOM rendering, event listeners, animation timing, Phaser effects, audio, and speech orchestration in `index.html` unless a later Phaser migration explicitly changes ownership.
6. Add a regression assertion if `index.html` must keep loading or calling the extracted helper.

## Verification

- Run the focused test, for example `node tests/learning-core.test.js`, `node tests/combat-core.test.js`, or the paired test for the new module.
- Run `npm test` after meaningful behavior changes.
- For UI, Phaser, speech, or gameplay wiring, also perform browser validation through `npm start` and `http://127.0.0.1:5173/index.html`.

## Common Mistakes

- Moving DOM-dependent code into `src/core/`.
- Changing localStorage key names while extracting storage helpers.
- Forgetting to preserve browser globals such as `window.HanziTankLearning`.
- Testing only the wrapper while leaving the pure helper untested.---
name: tankgame-core-module-extraction
description: "Use when extracting TankGame core module code, pure logic, UMD shared JavaScript, data modules, storage helpers, learning rules, combat math, or browser-to-Node testable behavior."
---

# TankGame Core Module Extraction

Use this when moving reusable TankGame behavior out of `index.html` into `src/core/` or `src/data/` while keeping browser globals and Node tests working.

## When to Use

- A change touches combat math, learning banks, mastery/ranks, storage merge rules, question selection, shop data, enemy data, or other pure logic.
- Logic is repeated in `index.html` and can be tested without DOM, Phaser, Web Audio, or browser storage side effects.
- A future feature needs a stable `src/core/` helper before UI wiring.

Do not extract code that directly needs DOM nodes, Phaser scene objects, timers, or speech/audio globals. Extract the pure calculation first and leave the side-effect wrapper in `index.html`.

## Workflow

1. Read `DEVELOPMENT_GUIDELINES.md`, especially module boundaries, the UMD pattern, and testing rules.
2. Name the new module by responsibility: `src/core/<feature>-core.js` for behavior or `src/data/<feature>.js` for static configuration.
3. Write a focused Node test in `tests/` before implementing the helper.
4. Export with the current UMD style so Node `require()` and `window.HanziTank...` both work.
5. Wire `index.html` through a tiny wrapper that passes dependencies as parameters instead of reaching into globals from the module.
6. Add regression coverage when the browser wrapper contract matters, such as required script order or a gameplay invariant.
7. Update `PROJECT_STATE.md` if the architecture or source of truth changes.

## Verification

- Run the focused test, for example `node tests/learning-core.test.js` or `node tests/combat-core.test.js`.
- Run related regression tests if `index.html` wiring changed.
- Run `npm test` before claiming the extraction is complete.
