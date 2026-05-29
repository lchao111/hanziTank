# Immersive Modal Candidate Specs

This folder contains production prompt/spec files for the TankGame immersive modal assets. Bitmap generation was not available in this Codex session, so no placeholder PNGs were created.

## Shared Art Direction

- Match `ART_STYLE_GUIDE.md`: warm illustrated war-room UI, parchment, brass, olive military greens, amber highlights, dark battlefield panels, thick readable outlines, matte hand-painted 2D rendering.
- Keep every asset child-friendly, non-gory, and readable in a square UI slot.
- Prefer transparent PNG output. If the generator cannot produce transparency, use a flat chroma-key background and remove it during post-processing.
- Avoid burned-in UI labels or tiny text. Leave title plates blank so the app can render crisp HTML text.
- Avoid real-world flags, political symbols, skull emblems, realistic battlefield trauma, neon colors, glossy 3D, and photorealism.

## Candidate Set

- `enemy-field-guide-book.prompt.md`
- `password-codex-book.prompt.md`
- `war-dossier-folder.prompt.md`
- `war-supply-crate.prompt.md`
- `quartermaster-war-prep-icon.prompt.md`
- `generation-prompts.jsonl`
- `manifest.json`

## Recommended Generation Targets

- Source image: 2048x2048 transparent PNG.
- UI export: 512x512 transparent PNG for single icons.
- Codex/password book export: preserve the existing 6x1, 512x512-frame spritesheet pattern if animated states are needed.
- Keep source references in this folder until a selected final asset is promoted into `assets/sprites/ui/`.
