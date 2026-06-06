# Spring Soldier Spritesheet Prompt

Runtime id: `springSoldier`
Current fallback: `assets/enemy-heavy-infantry.svg`
Status: pending final bitmap spritesheet

Create a PNG spritesheet for a spring-legged soldier elite in Hanzi Tank.
Style: kid-friendly hand-painted 2D battlefield unit, warm parchment/brass/olive UI compatibility, thick outlines, matte metal, no gore.

Subject: toy-soldier robot with round helmet, compact body, two visible steel coil springs for legs, small shield plate, amber coil highlights. It faces left and reads clearly as a bouncy spring unit.

Strict sheet standard: exactly 6 columns x 5 rows. Each cell is exactly 224 x 144 px. Total canvas size is exactly 1344 x 720 px. Use a solid pure green background, exactly `#00FF00`, across the entire sheet.

Do not include checkerboard, transparent preview background, grid lines, gutters, borders, labels, or frame numbers. The soldier, springs, shield, and all effects must be fully inside each 224 x 144 cell. Keep the body centered inside the central 70% safe area, use the same scale per row, and keep the same bottom baseline/anchor within each row. No dust, blur, sparks, flames, explosion, spring parts, or debris may cross cell boundaries.

Layout rows:
Row 1: movement/driving frames, idle coil bob and spring-step advance toward the player.
Row 2: normal firing/attack frames, spring-hop bounce attack with compact contact puff.
Row 3: heavy firing/attack frames, compressed charge and stronger spring launch with contained amber impact sparks.
Row 4: damaged frames, elastic recoil/hit reaction contained close to the body.
Row 5: destroyed frames, spring scatter destruction with small flames/explosion/debris contained fully inside each cell.

Negative prompt: photorealism, gore, horror, scary face, neon sci-fi glow, glossy 3D, tiny text, cropped springs, inconsistent scale, transparent background, checkerboard background, grid lines, borders, effects crossing cell edges.
