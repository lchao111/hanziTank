# War Prep Dock Design

## Goal

Separate War Prep from the Stage Clear shopping area and make it a distinctive bottom-screen entry point so children can directly open the equipment and tank view from the main game controls.

## Chosen Direction

Use option A: an independent War Prep dock button.

The footer should contain a standout War Prep button styled like a quartermaster crate or equipment depot. It should be larger and visually warmer than regular square controls, while still fitting the existing footer button system and responsive layout. The button opens the existing War Prep modal, where tanks, ammo, equipment, coins, and current loadout remain visible.

## Experience Changes

- War Prep becomes a direct footer entry rather than primarily a Stage Clear side panel.
- The footer War Prep button should be visible as a stable game tool, not only as a hidden reward-state control.
- Stage Clear should focus on upgrade selection and victory feedback.
- Stage Clear may keep a compact "Go to War Prep" action, but it should not embed the full shop grid.
- The full War Prep modal remains the main equipment/tank browsing surface.

## Visual Requirements

- Keep the existing `assets/sprites/ui/war-prep-button.png` quartermaster crate art as the button identity unless a later asset pass replaces it.
- Make the footer War Prep button visually distinct with a stronger crate/depot treatment: larger footprint, gold/olive accent, hover lift, and a short visible label such as `战备` or `War Prep` if it fits cleanly.
- Do not crowd or resize neighboring controls unpredictably. Mobile footer scrolling/wrapping must remain usable.
- Maintain tooltips and accessible labels in Chinese and English.

## Implementation Shape

- Update footer markup/CSS for `#arsenalButton` and `.war-shop-button` to behave as the independent dock-style War Prep entry.
- Adjust HUD sync so the War Prep button is consistently visible as a footer destination. If purchases must stay unavailable during battle, clicking can either open a read-only/full modal state or keep purchase buttons gated while still showing equipment and tanks.
- Remove or reduce the Stage Clear inline War Prep grid from `.stage-clear-layout` so the victory panel is less crowded.
- Preserve `openArsenal`, `closeArsenal`, modal music suspension, crate-opening animation, and existing shop rendering functions.
- Keep existing tank and ammo preview art inside the War Prep modal.

## Testing

- Update War Prep UI regression coverage to assert the footer War Prep button is a distinct independent entry and Stage Clear no longer requires the embedded full shop grid.
- Keep coverage that War Prep tank previews use generated PNGs and ammo previews use animated spritesheets.
- Keep audio lifecycle tests for modal music suspend/resume.
- Run targeted War Prep, leaderboard/modal, audio lifecycle, and full `npm test` if the final edit touches shared modal or HUD code.

## Out Of Scope

- Generating a new War Prep button asset.
- Changing tank purchase economics, ammo stats, mastery math, or leaderboard behavior.
- Reworking the full War Prep modal layout beyond what is needed for the separated entry.
