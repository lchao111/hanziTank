# TankGame Agent Handoff

Last updated: 2026-05-29

This file is the durable cross-machine handoff for TankGame. Read it first after cloning the repo on a new machine or after losing local chat/terminal context.

## Product Direction

- Build TankGame into a best-in-class children's Hanzi tank game: fun, cool, positive, readable, and genuinely useful for learning Chinese characters.
- Ship in fast publishable iterations. When a releasable checkpoint is reached, stop expanding scope and move to tests, build, commit, and release.
- Visual/audio quality matters: avoid placeholder-looking SVG/CSS art for final UI, enemies, tanks, ammo, modal surfaces, and VFX.
- Chinese pronunciation and learning prompts always take priority over music and effects.

## Recovery Order On A New Machine

1. Clone or pull the repository and restore the current release branch.
2. Read these files in order:
   - `AGENT_HANDOFF.md`
   - `PROJECT_STATE.md`
   - `DEVELOPMENT_GUIDELINES.md`
   - `ART_STYLE_GUIDE.md`
   - `IMAGE_GENERATION_WORK_LOG.md`
   - `.github/copilot-instructions.md`
3. Install dependencies with `npm install`.
4. Run `npm test` to establish the local baseline.
5. Run `npm run build` before any deploy/release claim.
6. Start local validation with `npm start` and open `http://127.0.0.1:5173/index.html`.

## Durable Memory Rule

Local Copilot memory, open terminals, chat transcripts, and Codex sessions are not enough. Anything important for future work must be copied into tracked repo files:

- Current architecture and behavior: `PROJECT_STATE.md`.
- Asset generation/tooling/provenance: `IMAGE_GENERATION_WORK_LOG.md`.
- PM handoff, active blockers, and recovery context: `AGENT_HANDOFF.md`.
- Deployment/release steps: `DEPLOYMENT.md`.
- Tests and regression expectations: add or update tests under `tests/`.

If a machine is lost, assume active terminal jobs are gone. Continue from committed repo state plus the handoff notes, not from terminal IDs.

## Current PM Operating Rules

- The user wants the agent to act as PM: dispatch work, track progress, and report concise status. The user performs final human play-test acceptance.
- When the user says to assign work, reply with acknowledgement and current agent/job progress.
- Do not keep polling every job forever. Check progress when asked or when needed for release readiness.
- At a release checkpoint, switch to: collect job outputs, resolve blockers, run tests/build, commit, create release.

## Current Known Release Blockers

These must be cleared before claiming a publishable game build:

- Boss-stage training dummy body can disappear because lane-layer logic is gated on multi-lane state instead of training activity.
- Generated background art is strong, but Phaser prop overlays can clash stylistically; gate or replace mismatched overlays.
- `switch-general-button.png` is a bad green 2x2/raw sheet and needs a real button asset.
- War Prep tank previews must use high-quality bitmap tank art, not low-quality SVG fallbacks.
- Ammo previews and attack VFX must use high-quality named assets/effects and appear in War Prep previews.
- Environment-based BGM must vary by battlefield without interfering with Hanzi MP3/TTS.
- New elite/boss enemy set must have unique attacks, hit reactions, destruction behavior, tests, and asset provenance.

## Recently Dispatched Local Codex Jobs

These terminal sessions are local-only. If this machine is lost, treat them as context, not recoverable state.

- `89de969e-5f4d-4bd3-bcd8-b7f18cf0b1e7`: adaptive background music by battlefield/weather. Completed with exit code 0; PM targeted validation passed on 2026-05-29: `node tests/bgm-manager.test.js`, `node tests/environment-music-regression.test.js`, `node tests/audio-lifecycle-regression.test.js`, and `node tests/speech-regression.test.js`.
- `666a40ab-9d29-4739-b7fc-cd15d9a59786`: new elite/boss enemy set: self-destruct truck, spring soldier, drone swarm, mechanical wolf pack, mechanical fleas.
- `0b1bbf16-833e-4214-8148-069df110aa1d`: War Prep tank preview art upgrade / related asset work. Completed with exit code 0; generated/connected War Prep tank PNG previews. Needs final combined test/build validation with the rest of the active work.
- War Prep ammo/VFX job completed with exit code 0; generated/connected named ammo spritesheets and VFX hooks. Needs final combined test/build validation with the rest of the active work.
- `caceebf8-85e3-4eab-8c79-addeeeca5d2c`: Enemy Gallery / Field Guide high-quality bitmap and spritesheet preview upgrade. Completed with exit code 0 in the Codex task: generated/wired PNG gallery card previews for all current enemies, added interim gallery spritesheets for truck/elites, updated provenance/tests, and passed `npm test` plus `git diff --check` on 2026-05-29. Final generated truck/elite art remains pending.
- Earlier diagnostics completed for dummy visibility, prop overlay mismatch, and Switch General button asset.
- Debug Mode now exposes direct hand-test entries for every regular enemy, several Tank Dismantler Boss checkpoints, and every elite/new Boss-style enemy via `enemyId`. PM targeted validation passed: `node tests/enemies-core.test.js`, `node tests/enemy-elites-regression.test.js`, `node tests/combat-core.test.js`, and `node tests/security-regression.test.js`.

After any job finishes, copy its actual result into this file or `PROJECT_STATE.md`, then run the relevant tests.

## Release Checkpoint Checklist

Use this once blockers are cleared enough for a small release:

1. `git status --short` and inspect unrelated/user changes.
2. Run targeted tests for changed areas.
3. Run `npm test`.
4. Run `git diff --check`.
5. Run `npm run build`.
6. Browser smoke-test with a child profile and Chao/debug profile.
7. Commit a small coherent release slice.
8. Create the release/tag/deploy package according to `DEPLOYMENT.md`.

## Human QA Focus

- A child can understand what is happening without reading instructions.
- Hanzi pronunciation is clear even when music/VFX are active.
- Boss and elite attacks have visible warnings, fair timing, and satisfying damage/destruction feedback.
- War Prep previews match the quality of in-battle assets.
- No obvious placeholder art remains on the first screen, War Prep, modals, enemy gallery, or battle scene.
