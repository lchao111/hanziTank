# Drone Swarm Spritesheet Prompt

Runtime id: `droneSwarm`
Current fallback: `assets/enemy-scout.svg`
Status: pending final bitmap spritesheet

Create a PNG spritesheet for a small drone swarm elite in Hanzi Tank.
Style: child-friendly 2D hand-painted game asset, warm brass/olive/rust palette, thick outlines, matte metal, subtle amber energy, no neon sci-fi dominance.

Subject: four to six tiny round rotor drones orbiting as one readable swarm, each with simple propellers, rivets, amber lens, and compact smoke/spark hints. The swarm faces/charges toward the left-side player.

Strict sheet standard: exactly 6 columns x 5 rows. Each cell is exactly 224 x 144 px. Total canvas size is exactly 1344 x 720 px. Use a solid pure green background, exactly `#00FF00`, across the entire sheet.

Do not include checkerboard, transparent preview background, grid lines, gutters, borders, labels, or frame numbers. Every drone and effect must be fully inside its own 224 x 144 cell. Keep the swarm within the central 70% safe area, preserve relative drone spacing across frames, use the same scale per row, and keep the same baseline/anchor within each row. No smoke, blur, muzzle flash, sparks, explosion, debris, or rotor smear may cross cell boundaries.

Layout rows:
Row 1: movement/driving orbit frames, readable swarm motion toward the player.
Row 2: normal firing/attack frames, staggered compact volley with tiny contained muzzle flashes.
Row 3: heavy firing/attack frames, stronger amber pulse volley with all FX contained inside each cell.
Row 4: damaged frames, EM stun and hit sparks contained close to the swarm body.
Row 5: destroyed frames, swarm dispersal with small flames/explosion/debris contained fully inside each cell.

Negative prompt: photorealistic drone, military realism, gore, horror, neon blue cyberpunk, complex unreadable micro details, cropped drones, inconsistent framing, transparent background, checkerboard background, grid lines, borders, effects crossing cell edges.
