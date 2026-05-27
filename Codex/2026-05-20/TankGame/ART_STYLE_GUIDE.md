# Hanzi Tank Art Style Guide

Use this guide whenever generating new Hanzi Tank visuals with an AI image tool or adding art assets to the game. The goal is to keep ranks, enemies, tanks, UI icons, badges, items, and future feature art consistent with the current game UI.

## Core Look

- Children's educational tank game, serious enough to feel like a battle game but friendly and readable for kids.
- Warm illustrated war-room UI: parchment, brass, dark battlefield panels, olive military greens, amber highlights, and thick readable outlines.
- Stylized 2D game art, not photorealistic, not gritty realism, not horror, not gore.
- Clear silhouettes first. Every icon or unit should be understandable at small UI sizes.
- Slightly chunky shapes, soft painterly texture, subtle pixel/Phaser-game feeling, and hand-painted edges.

## Palette

- Primary UI surfaces: warm parchment, cream, tan, muted brass, dark brown outlines.
- Action accents: golden yellow, amber, soft orange, limited red for danger.
- Military objects: olive green, muted khaki, dark steel, dusty gray, desaturated red for enemies.
- Backgrounds: smoky dark battlefield gray, deep green-black, low contrast scenery.
- Avoid neon colors, glossy sci-fi blue, pure black/white dominance, purple gradients, and highly saturated cartoon palettes.

## Shape Language

- Use bold outer strokes and simple inner detail.
- Prefer shield, chevron, stripe, star, laurel, rivet, tank tread, armor plate, and medal shapes for progression art.
- Corners should match the UI: compact, sturdy, mostly 8px-radius style rather than pill-shaped softness.
- Rank and item icons should read well inside square UI slots.

## Texture And Rendering

- Matte painted materials with gentle highlights.
- Use subtle scratches, rivets, canvas fabric, brushed metal, and dust only when they improve readability.
- Keep shadows soft and grounded. Avoid dramatic cinematic lighting that hides the subject.
- Transparent PNG output is preferred for icons, units, badges, items, and UI overlays.

## Characters And Units

- Units should feel toy-soldier/game-piece safe for children, not realistic violence.
- Weapons can be implied by shape, but no gore, wounds, blood, or frightening facial detail.
- Enemy art should face left when shown on the enemy side, or be easy to flip horizontally.
- Spritesheets should keep consistent framing across frames so animation does not jump.

## Spritesheet Requirements

- Preferred format: transparent PNG spritesheet.
- Keep every frame the same width and height.
- Leave enough padding so weapons, smoke, recoil, and attack poses do not crop.
- Use rows by state when possible:
  - Row 1: idle / walk loop.
  - Row 2: attack / fire / throw.
  - Row 3: hit / damage reaction.
  - Row 4+: weak, destroyed, special, or alternate states.
- Recommended frame counts: 4 or 6 frames per row.

## Rank Badge Direction

The rank ladder is based on mastered Hanzi. Badges should become more decorated as the player advances, while staying simple and child-friendly.

| Mastered Hanzi | Chinese | English |
| ---: | --- | --- |
| 0 | 新兵 | Recruit |
| 300 | 列兵 | Private |
| 600 | 下士 | Corporal |
| 900 | 中士 | Sergeant |
| 1200 | 上士 | Staff Sergeant |
| 1500 | 少尉 | Second Lieutenant |
| 1800 | 中尉 | First Lieutenant |
| 2100 | 上尉 | Captain |
| 2400 | 少校 | Major |
| 2700 | 中校 | Lieutenant Colonel |
| 3000 | 上校 | Colonel |

## Reusable AI Prompt

```text
Create game-ready 2D art for Hanzi Tank, a children's Chinese-learning tank game.
Style: warm illustrated war-room UI, parchment and brass interface, dark battlefield panels, olive military greens, amber highlights, thick readable outlines, matte hand-painted texture, clear silhouettes, kid-friendly and non-gory.
Rendering: stylized 2D game asset, transparent background, readable at small UI size, consistent square framing, no photorealism, no horror, no blood, no neon colors, no sci-fi glow, no glossy 3D.
Asset should match an educational tank game UI with sturdy 8px-radius panels, brass borders, parchment cards, and Phaser-style sprites.
```

## Rank Badge AI Prompt

```text
Create a complete set of square rank badge icons for Hanzi Tank, a children's Chinese-learning tank game.
Use the Hanzi Tank style: warm parchment and brass UI, olive military green, amber highlights, dark brown outlines, matte hand-painted 2D game icon, friendly and readable for children, transparent background.
Ranks, from lowest to highest: 新兵 Recruit, 列兵 Private, 下士 Corporal, 中士 Sergeant, 上士 Staff Sergeant, 少尉 Second Lieutenant, 中尉 First Lieutenant, 上尉 Captain, 少校 Major, 中校 Lieutenant Colonel, 上校 Colonel.
Make each badge progressively more advanced using simple combinations of chevrons, stripes, stars, shield plates, rivets, laurels, tank tread motifs, and subtle Hanzi-learning motifs. Keep all badges consistent in size, camera angle, palette, outline thickness, and lighting.
Avoid photorealism, gore, skulls, flags of real countries, modern political symbols, neon colors, glossy 3D, and tiny unreadable text.
```

## Negative Prompt

```text
photorealistic, realistic war photo, gore, blood, horror, skull emblem, national flag, propaganda poster, political symbol, neon cyberpunk, purple gradient, glossy 3D render, tiny unreadable text, cluttered detail, low contrast, cropped subject, inconsistent framing, blurry icon
```

## Asset Acceptance Checklist

- Fits the warm parchment/brass/olive Hanzi Tank UI.
- Clear silhouette at small size.
- Transparent background unless it is a full background image.
- No gore, horror, real-world politics, or realistic battlefield trauma.
- Uses consistent frame size and padding if animated.
- Includes license/source notes under `assets/licenses/` if generated by or derived from a third-party asset source.
