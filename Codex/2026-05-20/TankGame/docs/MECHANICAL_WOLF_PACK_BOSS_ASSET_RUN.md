# Mechanical Wolf Pack Boss Asset Run

Status date: 2026-05-30

## Active Agents

Current active subagents: 0

Completed supervision agents:

- `Find imagegen path`: confirmed no direct callable imagegen tool is exposed in this VS Code/Copilot tool surface; use Codex/Game Studio imagegen UI/auto-generation handoff or local ComfyUI/manual import.
- `Prepare boss pipeline`: confirmed the asset factory flow is ready, but its report used `mechanical-wolf-pack` in some examples. The correct target for this run is `mechanical-wolf-pack-boss`.

## Correct Target

Use this enemy id for this trial:

```text
mechanical-wolf-pack-boss
```

Prompt spec:

```text
assets/source/enemy-candidates/mechanical-wolf-pack-boss-spritesheet.prompt.md
```

Generated output folder:

```text
assets/source/generated/enemies/mechanical-wolf-pack-boss/
```

## Current State

- Prompt exists: yes
- Generated raw PNG exists: yes, for fallback candidates v1/v2/v3
- QC passed: yes, for fallback candidates v1/v2/v3
- Processed transparent sheet exists: yes, for fallback candidates v1/v2/v3
- Frame split exists: yes, for fallback candidates v1/v2/v3
- Integrated into live game assets: no

## Iteration Log

The generated candidates below are local fallback/procedural candidates. They validate the Asset Factory pipeline but are not final imagegen-quality boss art.

```text
v1: assets/source/generated/enemies/mechanical-wolf-pack-boss/raw.png
    QC passed; too tank/armored-vehicle-like.

v2: assets/source/generated/enemies/mechanical-wolf-pack-boss-v2/raw.png
    QC passed; more wolf-like with ears/snout/legs, but still reads like armored boar/vehicle.

v3: assets/source/generated/enemies/mechanical-wolf-pack-boss-v3/raw.png
    QC passed; larger head and clearer legs, but still not high-quality imagegen boss art.
```

Current best fallback candidate: `mechanical-wolf-pack-boss-v3`.

Quality blocker: local ComfyUI is not reachable and the VS Code Copilot tool surface does not expose a direct imagegen callable. Codex CLI can read the imagegen skill, but in these runs it did not produce model-native imagegen output and used local fallback generation instead.

## Image Generation Command

Prepare the Codex/Game Studio imagegen packet:

```powershell
npm run asset -- imagegen mechanical-wolf-pack-boss
```

If using local ComfyUI, first place a workflow at:

```text
assets/source/comfy-workflows/enemy-strict-6x5.json
```

Then check local ComfyUI:

```powershell
npm run asset -- comfy mechanical-wolf-pack-boss
```

## Import, QC, Process

After imagegen or ComfyUI produces a PNG, run:

```powershell
npm run asset -- import mechanical-wolf-pack-boss -- --input "<path-to-generated-png>"
npm run asset -- qc mechanical-wolf-pack-boss
npm run asset -- process mechanical-wolf-pack-boss
```

Expected outputs:

```text
assets/source/generated/enemies/mechanical-wolf-pack-boss/raw.png
assets/source/generated/enemies/mechanical-wolf-pack-boss/transparent.png
assets/source/generated/enemies/mechanical-wolf-pack-boss/pipeline-meta.json
assets/source/generated/enemies/mechanical-wolf-pack-boss/frames/frame-00.png
...
assets/source/generated/enemies/mechanical-wolf-pack-boss/frames/frame-29.png
```

## Strict Sheet Contract

- 6 columns x 5 rows
- 224 x 144 px per cell
- 1344 x 720 px total canvas
- Solid pure green `#00FF00` background
- No checkerboard
- No transparent preview background
- No grid lines, gutters, borders, labels, or frame numbers
- All bodies and FX stay inside their own cells

## Game Integration After QC Passes

Do not integrate until `qc` and `process` pass and the generated image is visually accepted.

Likely integration targets:

- `assets/sprites/enemies/mechanical-wolf-pack-boss-spritesheet.png`
- `assets/sprites/enemies/mechanical-wolf-pack-boss-preview.png`
- `src/data/enemies.js`
- `src/data/asset-manifest.js`
- `tests/asset-manifest.test.js`
- `tests/phaser-vfx-enemies-asset.test.js`
- possibly a new boss/enemy regression test if this becomes a playable boss type

Suggested promotion commands after approval:

```powershell
Copy-Item "assets/source/generated/enemies/mechanical-wolf-pack-boss/transparent.png" "assets/sprites/enemies/mechanical-wolf-pack-boss-spritesheet.png" -Force
Copy-Item "assets/source/generated/enemies/mechanical-wolf-pack-boss/frames/frame-00.png" "assets/sprites/enemies/mechanical-wolf-pack-boss-preview.png" -Force
```

## Current Blocker

The raw image has not been generated yet. In this tool surface, no callable imagegen tool is exposed. The next required action is to run Codex/Game Studio imagegen using the packet from:

```powershell
npm run asset -- imagegen mechanical-wolf-pack-boss
```

Then import the generated PNG with the commands above.
