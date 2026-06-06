# TankGame Asset Factory

The asset factory turns enemy/boss spritesheet generation into a repeatable pipeline:

```text
prompt spec -> Codex/Game Studio imagegen or ComfyUI or manual import -> raw.png -> QC -> transparent sheet -> 30 frame PNGs -> metadata
```

The MVP is intentionally safe: it writes generated outputs under `assets/source/generated/enemies/<enemy-id>/` and does not overwrite live game assets. A future `integrate` command can promote QC-passing output into `assets/sprites/enemies/` and update manifests.

## Provider Order

Use providers in this order:

1. **Codex/Game Studio imagegen** when available in the current agent surface.
2. **Local ComfyUI** when you want a repeatable local model workflow.
3. **Manual import** when the image was generated somewhere else and downloaded as a PNG.

Prepare a strict imagegen packet:

```bash
npm run asset -- imagegen drone-swarm
```

Give the printed packet to Codex/Game Studio imagegen. After the PNG is saved, import it back into the local pipeline:

```bash
npm run asset -- import drone-swarm -- --input "C:\Users\you\Downloads\drone-swarm.png"
npm run asset -- qc drone-swarm
npm run asset -- process drone-swarm
```

## Local ComfyUI

Local ComfyUI does not need an API key. The asset factory talks to the local HTTP server:

```powershell
$env:COMFYUI_URL = "http://127.0.0.1:8188"
```

If `COMFYUI_URL` is not set, the default is `http://127.0.0.1:8188`.

Keep ComfyUI bound to localhost unless you intentionally secure a remote GPU server. Do not commit credentials, tokens, or cloud URLs with secrets.

## Strict Enemy Sheet Contract

Enemy/boss animation sheets generated for this project must use:

- Grid: `6 columns x 5 rows`
- Cell size: `224 x 144 px`
- Total size: `1344 x 720 px`
- Background: solid pure green `#00FF00`
- No checkerboard, transparent preview background, grid lines, or borders
- No unit body, smoke, blur, muzzle flash, flame, or explosion may cross cell boundaries
- Row 1: movement/driving/idle frames
- Row 2: normal firing/attack frames
- Row 3: heavy firing/attack frames
- Row 4: damaged/hit frames
- Row 5: destroyed/flame/explosion frames

## Commands

Print a prompt spec:

```bash
npm run asset -- prompt drone-swarm
```

Prepare a Codex/Game Studio imagegen packet:

```bash
npm run asset -- imagegen drone-swarm
```

Check local ComfyUI and required workflow setup:

```bash
npm run asset -- comfy drone-swarm
```

Manual import fallback after downloading a generated PNG from any tool:

```bash
npm run asset -- import drone-swarm -- --input "C:\Users\you\Downloads\drone-swarm.png"
```

Run strict QC:

```bash
npm run asset -- qc drone-swarm
```

Process a QC-passing sheet into transparent sheet and frames:

```bash
npm run asset -- process drone-swarm
```

Run asset-factory tests:

```bash
npm run test:asset-factory
```

## Output Layout

For `drone-swarm`, the MVP writes:

```text
assets/source/generated/enemies/drone-swarm/
  raw.png
  transparent.png
  pipeline-meta.json
  frames/
    frame-00.png
    frame-01.png
    ...
    frame-29.png
```

## ComfyUI Workflow File

Export a ComfyUI workflow JSON and save it here:

```text
assets/source/comfy-workflows/enemy-strict-6x5.json
```

The MVP verifies ComfyUI availability and workflow presence. Queue submission is deliberately left behind this workflow gate until the exact node inputs and output node mapping are stable.

## Promotion To Game Assets

Do not manually overwrite live spritesheets with raw generated output. The intended promotion path is:

1. `npm run asset -- qc <enemy-id>` passes.
2. `npm run asset -- process <enemy-id>` writes `transparent.png` and 30 frames.
3. Review `transparent.png` and frame outputs visually.
4. A future `integrate <enemy-id>` command copies the approved transparent sheet into `assets/sprites/enemies/` and updates manifest metadata.
