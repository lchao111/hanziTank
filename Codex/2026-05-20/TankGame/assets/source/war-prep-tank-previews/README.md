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

## Source Mapping

- Sherman: `assets/source/wwii-common-tank-spritesheet.png`
- Tiger I: `tiger-i-player-reference.png`
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
