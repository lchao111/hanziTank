# Mechanical Wolf Pack Boss Spritesheet Prompt

Runtime id: `wolfPackBoss`
Current fallback: `assets/enemy-armor.svg`
Status: pending final bitmap spritesheet

Create a PNG spritesheet for a mechanical wolf pack boss in Hanzi Tank.
Style: premium kid-friendly 2D hand-painted boss game asset, toy-like mechanical animals, warm illustrated battlefield palette, olive/rust/dark steel, brass armor plates, amber power cores, thick readable outlines, matte texture, dramatic but not frightening.

Subject: a commanding mechanical alpha wolf flanked by two smaller mechanical wolf units. The boss formation reads as one coordinated pack: the alpha is larger with brass shoulder armor, amber chest core, tread-like paws, segmented tail antenna, and friendly angular silhouette. The two escorts stay close enough to fit the cell and preserve the pack identity. They face left toward the player.

Strict sheet standard: exactly 6 columns x 5 rows. Each cell is exactly 224 x 144 px. Total canvas size is exactly 1344 x 720 px. Use a solid pure green background, exactly `#00FF00`, across the entire sheet.

Do not include checkerboard, transparent preview background, grid lines, gutters, borders, labels, or frame numbers. Every wolf, escort, projectile, spark, flame, explosion, and debris element must be fully inside its own 224 x 144 cell. Keep the boss pack within the central 70% safe area, preserve pack spacing across frames, use the same scale per row, and keep the same baseline/anchor within each row. No dust, blur, sparks, flames, explosion, debris, or motion smear may cross cell boundaries. Avoid scary teeth, realistic predator aggression, gore, or horror.

Layout rows:
Row 1: movement/driving frames, alpha wolf boss advances with tread-paw motion while escorts keep formation.
Row 2: normal firing/attack frames, compact staggered pounce or short amber bolt attack with contained muzzle flashes and no wide FX.
Row 3: heavy firing/attack frames, synchronized pack command strike with contained amber shock sparks close to the bodies.
Row 4: damaged frames, alpha core flickers, escorts recoil, contained metal sparks close to the pack.
Row 5: destroyed frames, boss pack break-apart destruction with small contained flame, explosion, falling armor plates, and debris fully inside each cell.

Boss readability requirements:
- The alpha boss must remain visibly larger than escorts but still fit inside each cell.
- The silhouette must read clearly at small in-game size.
- The amber chest core and brass shoulder armor should be stable identity markers across all rows.
- Escorts must not drift away or force the boss to shrink.
- Effects stay close to the bodies so the full pack remains large and readable.

Negative prompt: horror wolf, sharp gore, blood, realistic predator, skulls, neon glow, photorealism, cropped pack members, inconsistent frame layout, transparent background, checkerboard background, grid lines, borders, labels, text, effects crossing cell edges, oversized explosion, blurry motion trails.
