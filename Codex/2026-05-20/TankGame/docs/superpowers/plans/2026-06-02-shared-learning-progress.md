# Shared Learning Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Hanzi game mode select from one shared learning path so learned, review, and new words carry across modes.

**Architecture:** Add pure shared-source helpers to `src/core/learning-core.js`, then have browser mode starts and refreshes use one `getSharedLearningWordSource()` wrapper. Existing `recordCorrectBank()` and `recordWrongBank()` remain the write path.

**Tech Stack:** Vanilla JavaScript UMD modules, Node `assert` tests, browser runtime in `index.html`.

---

### Task 1: Shared Learning Source Core

**Files:**
- Modify: `tests/learning-core.test.js`
- Modify: `src/core/learning-core.js`

- [ ] **Step 1: Write the failing unit test**

Add assertions that `getSharedLearningWordSource()` returns review words first, unseen new words second, learned practice words last, deduped by Hanzi.

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/learning-core.test.js`

Expected: FAIL because `getSharedLearningWordSource` is not exported.

- [ ] **Step 3: Implement minimal helper**

Add `getSharedLearningWordSource(words, playerState)` to `src/core/learning-core.js`. It should tolerate missing banks, preserve word objects, and return all valid unique Hanzi in review/new/practice order.

- [ ] **Step 4: Run focused test**

Run: `node tests/learning-core.test.js`

Expected: PASS.

### Task 2: Browser Runtime Integration

**Files:**
- Modify: `tests/learning-core.test.js`
- Modify: `tests/*regression*.test.js` or add a focused regression test if needed
- Modify: `index.html`

- [ ] **Step 1: Write failing regression coverage**

Add source-level assertions that block adventure, story adventure, Hanzi Tetris, elevator escape, anti-air, and battle word selection use `getSharedLearningWordSource()` or `getBattleWordSource()` instead of raw `words` where the mode picks learning content.

- [ ] **Step 2: Run regression test to verify it fails**

Run the focused regression test.

Expected: FAIL for modes currently passing raw `words`.

- [ ] **Step 3: Wire runtime source**

Import `getSharedLearningWordSource` from `window.HanziTankLearning`. Add `getSharedLearningWordSourceForPlayer()` or update `getBattleWordSource()` so every game mode starts from the same shared source. Replace raw `words` in mode starts/restarts and distractor pools where those choices drive learning progression.

- [ ] **Step 4: Run focused regression test**

Run the focused regression test.

Expected: PASS.

### Task 3: Verification

**Files:**
- No additional files expected

- [ ] **Step 1: Run focused tests**

Run: `node tests/learning-core.test.js` and the focused regression test.

Expected: PASS.

- [ ] **Step 2: Run full suite**

Run: `npm test`

Expected: PASS.