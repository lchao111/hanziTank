# TankGame Skills Design

## Goal

Turn the repeated TankGame development steps into project-level skills so future agents can start from the right workflow instead of rediscovering process from handoff notes, logs, and tests.

## Chosen Direction

Use workspace skills under `.github/skills/`. These workflows are specific to this game: they reference TankGame paths, package scripts, visual standards, test names, and PM rules. User/global skills would be too broad and would likely trigger incorrectly in other projects.

The split keeps long-lived state in docs such as `AGENT_HANDOFF.md`, `PROJECT_STATE.md`, and `IMAGE_GENERATION_WORK_LOG.md`. Skills only cover repeated, action-oriented workflows.

## Reviewed Sources

- `AGENT_HANDOFF.md`: PM rules, release blockers, release checkpoint, human QA focus.
- `PROJECT_STATE.md`: runtime architecture, commands, gameplay invariants, Phaser and asset direction.
- `DEVELOPMENT_GUIDELINES.md`: module boundaries, UMD format, tests, definition of done.
- `ART_STYLE_GUIDE.md`: visual quality bar and asset acceptance checklist.
- `IMAGE_GENERATION_WORK_LOG.md`: historical asset generation/import/promote patterns.
- `ENEMY_DESIGN_LOG.md`: enemy/Boss creation and interim art status patterns.
- `docs/ASSET_FACTORY.md`: strict asset factory pipeline.
- `DEPLOYMENT.md`: build and production publish process.
- Existing tests under `tests/`: the concrete verification surface for each workflow.

## Skill Set

| Skill | Purpose | Primary verification |
| --- | --- | --- |
| `tankgame-core-module-extraction` | Extract pure gameplay/data logic into UMD modules with paired Node tests. | Focused core test plus `npm test`. |
| `tankgame-asset-factory` | Run prompt/imagegen/import/QC/process for strict enemy and Boss sheets. | `npm run test:asset-factory`, QC output, visual frame review. |
| `tankgame-boss-enemy-creation` | Add or change bosses, elites, attacks, debug entries, and enemy tests. | Enemy/combat tests plus Debug Mode browser validation. |
| `tankgame-hanzi-audio` | Generate Hanzi MP3s, process download queues, and preserve Boss speech rules. | Hanzi audio manifest and speech regression tests. |
| `tankgame-war-prep-assets` | Upgrade War Prep tank previews, ammo sheets, buttons, and shop visuals. | War Prep UI, asset manifest, and shop core tests. |
| `tankgame-phaser-vfx` | Add Phaser battle effects, projectile feedback, particles, and browser validation. | Phaser VFX tests plus browser smoke validation. |
| `tankgame-release-checkpoint` | Stop feature expansion, run final verification, build, and publish safely. | Focused tests, `npm test`, `git diff --check`, `npm run build`. |
| `tankgame-pm-agent-coordination` | Dispatch and report PM-style parallel agent work without personally implementing. | Concise status plus verified job outputs. |

## What Stayed As Docs

- Project recovery stays in `AGENT_HANDOFF.md`; it is onboarding context, not a repeated task workflow.
- Art style stays in `ART_STYLE_GUIDE.md`; it is shared reference loaded by several skills.
- Production hosting details stay in `DEPLOYMENT.md`; the release skill points to it rather than duplicating all commands.
- Completion TTS stays in `.github/hooks/agent-complete-tts.json` and `.github/copilot-instructions.md`; it is a deterministic hook, not a workflow skill.

## Validation

`tests/tankgame-skills-regression.test.js` verifies that the expected skill folders exist, each `SKILL.md` has discoverable frontmatter, and each skill includes the project references and sections future agents need.

Run it directly with:

```bash
npm run test:skills
```
