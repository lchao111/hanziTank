# Shared Learning Progress Design

## Goal

All game modes must advance the same child learning path. A child who learns, misses, or reviews a Hanzi in one mode should carry that progress into every other mode without restarting the vocabulary journey.

## Scope

This change uses the existing profile state fields instead of creating a second progress system:

- `correctBank` remains the learned/mastery archive and drives rank progress.
- `review` remains the high-priority review queue.
- `wrongBank` remains the mistake history.
- The full `words` list remains the source of new Hanzi.

The implementation should centralize word-pool selection so battle, anti-air, block adventure, story adventure, Hanzi Tetris, elevator escape, and any future Hanzi game can ask for the same learning source.

## Learning Rules

The shared source is ordered by learning need:

1. Review words: Hanzi with a positive `review` count are always first.
2. New words: Hanzi not present in `correctBank` follow review words.
3. Practice words: Hanzi already present in `correctBank` appear last for low-frequency reinforcement.

When a mode needs random weighted selection, it should still use the existing spaced-repetition weighting. The shared source only decides which words are eligible and in what priority order.

## Runtime Integration

Add pure helpers to `src/core/learning-core.js` so tests and browser runtime share one implementation. `index.html` should expose a single runtime helper such as `getSharedLearningWordSource()` and use it for mode starts and per-question refreshes instead of passing raw `words` directly.

Answer recording should continue through `recordCorrectBank()` and `recordWrongBank()`. Those functions already update the shared profile state and save progress, so the new work should not duplicate persistence logic.

## Compatibility

Existing saves remain valid. Profiles without one of the learning banks should keep loading through the current storage merge behavior.

## Tests

Add focused unit coverage for the shared learning source in `tests/learning-core.test.js`. Add regression coverage that browser mode starts use the shared source rather than raw `words` for cross-mode continuity.

Verification should include the focused tests and full `npm test` because learning selection affects multiple game modes.