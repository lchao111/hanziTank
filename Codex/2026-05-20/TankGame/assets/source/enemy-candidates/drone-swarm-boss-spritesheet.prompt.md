# Drone Swarm Boss Spritesheet Prompt

Runtime id: `droneSwarmBoss`
Split drone runtime ids: `droneSwarmBossDrone1` through `droneSwarmBossDrone5`
Current interim runtime sheet: `assets/sprites/enemies/drone-swarm-boss-interim-spritesheet.png`
Status: pending final generated transparent bitmap spritesheet

Create a PNG spritesheet for a multi-phase Drone Swarm Boss in Hanzi Tank.
Style: child-friendly 2D hand-painted game asset, warm war-room palette, olive and dark steel drone bodies, brass rivets, amber lenses, matte metal, thick readable outlines, slight painterly texture, no gore, no photorealism, no neon sci-fi dominance.

Subject: a readable formation of five small rotor drones that fight as one swarm, with each drone clear at small in-game size. All drones face or charge toward the left-side player. Do not include text; Hanzi targets are rendered by the game UI.

Strict sheet standard: exactly 6 columns x 5 rows. Each cell is exactly 224 x 144 px. Total canvas size is exactly 1344 x 720 px. Use a solid pure green background, exactly `#00FF00`, across the entire sheet.

Do not include checkerboard, transparent preview background, grid lines, gutters, borders, labels, or frame numbers. Every drone and effect must be fully inside its own 224 x 144 cell. Keep the boss formation centered inside the central 70% safe area, preserve scale across each row, and keep the same baseline/anchor within each row. Keep projectiles, warning rings, sparks, smoke, flames, explosion, debris, and rotor blur compact enough that nothing crosses cell boundaries and the drone bodies do not shrink.

Layout rows:
Row 1: movement/driving orbit frames, boss formation advancing or repositioning as one readable swarm.
Row 2: normal firing/attack frames, compact volley with contained muzzle flashes and recoil.
Row 3: heavy firing/attack frames, charge/lock-on pulse and stronger amber volley with all FX contained inside each cell.
Row 4: damaged frames, hit/EM stun reaction with contained sparks close to the drone bodies.
Row 5: destroyed frames, final death/dispersal with small flames/explosion/falling parts contained fully inside each cell.

If individual split-drone variants are needed later, create separate prompt specs for those variants using this same 6 columns x 5 rows, 224 x 144 px cell, 1344 x 720 px canvas, solid `#00FF00` standard. Do not pack variant sheets into this boss spritesheet prompt.

Negative prompt: photorealistic drone, military realism, gore, blood, horror, skull emblem, real-world flags, political symbols, neon cyberpunk, glossy 3D, tiny unreadable detail, text baked into sprites, cropped drones, inconsistent framing, blurred rotor smears that obscure the silhouette, transparent background, checkerboard background, grid lines, borders, effects crossing cell edges.
