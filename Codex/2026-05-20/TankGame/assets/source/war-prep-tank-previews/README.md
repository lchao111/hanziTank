# War Prep Tank Preview Sources

This folder keeps local source sheets used to derive the War Prep tank card previews.

## Promotion Target

Generated previews are written to:

- `assets/sprites/tanks/war-prep/sherman.png`
- `assets/sprites/tanks/war-prep/tiger-i.png`
- `assets/sprites/tanks/war-prep/panzer-iv.png`
- `assets/sprites/tanks/war-prep/is-2.png`
- `assets/sprites/tanks/war-prep/t-34.png`
- `assets/sprites/tanks/war-prep/cromwell.png`
- `assets/sprites/tanks/war-prep/churchill.png`

Run `tools/generate-war-prep-tank-previews.ps1` from the project root to rebuild the previews.

Tiger I also has a promoted runtime Phaser battle sheet:

- `assets/sprites/tanks/tiger-i-player-tank-spritesheet.png`

Run `tools/generate-tiger-i-player-spritesheet.ps1` from the project root to rebuild the Tiger I runtime sheet and QC metadata.

## Source Mapping

- Sherman: `assets/source/wwii-common-tank-spritesheet.png`
- Tiger I: `tiger-i-player-reference.png` copied from the user-provided `C:\Users\chlia\Downloads\Tiger1.png` source on 2026-05-30. The source image is 2816x1504 with a logical 6x5 grid.
- Panzer IV: `panzer-iv-player-reference.png`
- IS-2: `assets/source/is2-player-reference.png`
- T-34: `t-34-player-reference.png`
- Cromwell: `assets/source/cromwell-player-reference.png`
- Churchill: `churchill-player-reference.png`

The imported source sheets are local Gemini-generated bitmap sheets from the project machine. The original exact prompts were not embedded in the PNG metadata; future regeneration should use the shared `ART_STYLE_GUIDE.md` direction with tank-specific silhouette wording.

## Processing

- Crop the first idle frame from each source sheet.
- Remove the green-screen background deterministically.
- Trim visible pixels, preserve safe padding, and scale to a transparent 512x320 PNG.
- Keep old SVG tank files as fallback assets only; War Prep card art uses the PNG outputs above.

## Tiger I Runtime Sheet

- Source copy: `assets/source/war-prep-tank-previews/tiger-i-player-reference.png`
- QC metadata: `assets/source/war-prep-tank-previews/tiger-i-player-pipeline-meta.json`
- Output: `assets/sprites/tanks/tiger-i-player-tank-spritesheet.png`
- Runtime sheet size: 1344x720.
- Runtime frame size: 224x144.
- Runtime grid: 6 columns x 5 rows.
- Frame ranges:
  - Idle: 0-5.
  - Fire: 6-11.
  - Heavy fire: 12-17.
  - Hit / weak: 18-23.
  - Destroyed / burning: 24-29.
