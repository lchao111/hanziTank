# Agent Skill And Plugin Rebuild Notes

This document records the agent skills, plugins, local tools, and project commands used while building TankGame. Use it to rebuild the working setup quickly on a new machine.

## Core Editor Setup

Required:

- Windows with PowerShell
- VS Code
- GitHub Copilot / Copilot Chat in agent mode
- Node.js and npm
- Git

Project root used in this session:

```text
c:\Users\chlia\Documents\Codex\2026-05-20\TankGame
```

After restoring the repo, run:

```powershell
npm install
npm test
```

## Project NPM Dependencies

Current project dependencies from `package.json`:

```text
phaser 3.80.1
image-size ^2.0.2
pixel-tools ^0.9.11
terser ^5.31.0
```

Important scripts:

```powershell
npm run start
npm run build
npm test
npm run asset -- imagegen drone-swarm
npm run asset -- import drone-swarm -- --input "C:\Path\To\generated.png"
npm run asset -- qc drone-swarm
npm run asset -- process drone-swarm
npm run test:asset-factory
npm run utilities:generate-hanzi-audio
```

## Installed Plugin Roots

These local plugin folders were present on the machine:

```text
c:\Users\chlia\.copilot\installed-plugins\superpowers-marketplace
c:\Users\chlia\.copilot\installed-plugins\fabric-collection
c:\Users\chlia\.copilot\installed-plugins\copilot-plugins
```

The TankGame work in this session primarily relied on `superpowers-marketplace` plus local game-asset skills under `.agents`.

## Local Skill Roots

These local game-asset skills were present:

```text
c:\Users\chlia\.agents\skills\generate2dmap
c:\Users\chlia\.agents\skills\generate2dsprite
c:\Users\chlia\.agents\skills\sprite-animation-assets
c:\Users\chlia\.agents\skills\transparent-visual-assets
```

Keep these folders backed up. They provide the domain guidance for map generation, sprite sheets, animation assets, and transparent asset cleanup.

## Superpowers Skills Used

The following Superpowers skills were used or relied on for process control:

```text
using-superpowers
brainstorming
writing-plans
subagent-driven-development
dispatching-parallel-agents
systematic-debugging
test-driven-development
verification-before-completion
```

Recommended rebuild path:

1. Restore or reinstall `superpowers-marketplace` under:

   ```text
   c:\Users\<user>\.copilot\installed-plugins\superpowers-marketplace
   ```

2. Confirm these skill files exist under:

   ```text
   c:\Users\<user>\.copilot\installed-plugins\superpowers-marketplace\superpowers\skills
   ```

3. In future TankGame sessions, require agents to use the relevant Superpowers skill before planning, debugging, coding, reviewing, or completing work.

## TankGame Workspace Rule

Repository memory contains this process rule:

```text
For every TankGame task, use the relevant Superpowers skill to supervise the workflow before planning, coding, debugging, review, or completion.
```

If memory is lost, recreate that rule in repo memory or in `.github/copilot-instructions.md`.

## Asset Factory Setup

The project now includes an asset factory MVP:

```text
tools/asset-factory.mjs
tests/asset-factory.test.js
docs/ASSET_FACTORY.md
```

Provider order:

1. Codex/Game Studio built-in imagegen
2. Local ComfyUI
3. Manual PNG import

Core flow:

```powershell
npm run asset -- imagegen drone-swarm
npm run asset -- import drone-swarm -- --input "C:\Path\To\generated.png"
npm run asset -- qc drone-swarm
npm run asset -- process drone-swarm
```

Generated output goes to:

```text
assets/source/generated/enemies/<enemy-id>/
```

The MVP is safe by default: it does not overwrite live game spritesheets.

## ComfyUI Local Setup

Local ComfyUI does not need an API key.

Default URL:

```text
http://127.0.0.1:8188
```

Optional environment variable:

```powershell
$env:COMFYUI_URL = "http://127.0.0.1:8188"
```

Workflow JSON location expected by the asset factory:

```text
assets/source/comfy-workflows/enemy-strict-6x5.json
```

Security rule: keep ComfyUI bound to localhost unless a remote GPU server is intentionally secured.

## Image Generation Contract For Enemy Sheets

Strict TankGame enemy/boss sheet standard:

```text
6 columns x 5 rows
224 x 144 px per cell
1344 x 720 px total canvas
solid pure green #00FF00 background
no checkerboard
no transparent preview background
no grid lines
no borders
no labels or frame numbers
all bodies and effects stay inside their cells
```

Row semantics:

```text
Row 1: movement / driving / idle
Row 2: normal firing / attack
Row 3: heavy firing / attack
Row 4: damaged / hit
Row 5: destroyed / flame / explosion
```

Prompt specs live in:

```text
assets/source/enemy-candidates/*.prompt.md
```

## Skills For Visual Assets

Use these skills when creating or revising visual assets:

- `generate2dsprite`: enemy spritesheets, boss sheets, projectiles, effects, transparent frame/GIF exports.
- `sprite-animation-assets`: continuous frame sets, GIF previews, transparent spritesheet atlases.
- `transparent-visual-assets`: stickers, icons, mascots, transparent UI/game assets.
- `generate2dmap`: battlefield maps, dune/desert backgrounds, parallax/layered maps, prop packs.

## Fabric And WorkIQ Plugins

These plugins were installed but not required for TankGame asset work in this session:

```text
c:\Users\chlia\.copilot\installed-plugins\fabric-collection
c:\Users\chlia\.copilot\installed-plugins\copilot-plugins\workiq
```

Restore them only if future work needs Microsoft Fabric or WorkIQ workplace queries.

## Rebuild Checklist

- [ ] Install VS Code and GitHub Copilot.
- [ ] Restore TankGame repo.
- [ ] Run `npm install`.
- [ ] Restore `.copilot\installed-plugins\superpowers-marketplace`.
- [ ] Restore `.agents\skills\generate2dmap`.
- [ ] Restore `.agents\skills\generate2dsprite`.
- [ ] Restore `.agents\skills\sprite-animation-assets`.
- [ ] Restore `.agents\skills\transparent-visual-assets`.
- [ ] Run `npm test`.
- [ ] Run `npm run test:asset-factory`.
- [ ] If using ComfyUI, install/start it locally and place workflow JSON at `assets/source/comfy-workflows/enemy-strict-6x5.json`.
- [ ] Verify `npm run asset -- imagegen drone-swarm` prints a valid imagegen packet.

## Do Not Store Secrets

Do not commit API keys, cloud GPU tokens, model host credentials, or private service URLs with embedded tokens.

Use environment variables for anything sensitive:

```powershell
$env:COMFYUI_URL = "http://127.0.0.1:8188"
```

Local ComfyUI on localhost does not require an API key.
