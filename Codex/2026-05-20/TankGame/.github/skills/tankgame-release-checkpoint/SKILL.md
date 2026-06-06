---
name: tankgame-release-checkpoint
description: Use when TankGame reaches a release, deploy, build, publishable checkpoint, GitHub Pages publish, or Azure static site publish.
---

# TankGame Release Checkpoint

Use this skill when a development slice is ready to become a publishable TankGame build.

## When to Use

- Preparing a release, deploy, GitHub Pages publish, or Azure static website publish.
- Deciding whether to stop expanding scope and ship a coherent checkpoint.
- Running the release checklist from `AGENT_HANDOFF.md` and deployment steps from `DEPLOYMENT.md`.

## Workflow

1. Stop feature expansion once the checkpoint is coherent enough to test.
2. Review known release blockers in `AGENT_HANDOFF.md` and decide whether any block the current release claim.
3. Inspect `git status --short` and separate your changes from unrelated/user changes.
4. Run focused tests for changed areas.
5. Run `npm test`.
6. Run `git diff --check`.
7. Run `npm run build` and confirm `.deploy/site` is the deploy output, not the project root.
8. Browser smoke-test locally with `npm start`, including a child profile and Chao/debug profile when gameplay changed.
9. For GitHub Pages, rely on the Pages workflow after pushing the intended branch. For Azure, follow the clean upload steps in `DEPLOYMENT.md`.
10. Verify production URL, hashed bundle reference, absent source paths, and matching visible build tag.

## Verification

- Do not claim release readiness until focused tests, `npm test`, `git diff --check`, and `npm run build` have succeeded or any exception is explicitly reported.
- For Azure verification, confirm expected `200` for `/`, production bundle reference, and `404` for source-only paths described in `DEPLOYMENT.md`.

## Common Mistakes

- Uploading the repository root instead of `.deploy/site`.
- Continuing to add features after a releasable checkpoint.
- Forgetting browser smoke tests for UI/gameplay changes.
- Claiming production success before checking the actual hosted site.---
name: tankgame-release-checkpoint
description: "Use when preparing a TankGame release, deploy, build, GitHub Pages publish, Azure publish, regression pass, release checkpoint, or production verification."
---

# TankGame Release Checkpoint

Use this when a coherent slice is ready to stop expanding and move toward a publishable build.

## When to Use

- The task mentions release, deploy, build, production, GitHub Pages, Azure, checkpoint, public URL, or final validation.
- A group of feature or asset jobs has finished and needs integrated verification.
- The user asks whether the game is ready for a human test pass.

## Workflow

1. Read the release checklist in `AGENT_HANDOFF.md` and deployment details in `DEPLOYMENT.md`.
2. Check known blockers before running long validation. Do not claim release readiness with unresolved blockers that affect the intended test pass.
3. Inspect `git status --short` and avoid reverting unrelated user changes.
4. Run targeted tests for touched areas first.
5. Run `npm test`.
6. Run `git diff --check`.
7. Run `npm run build` and verify `.deploy/site` is the deploy package, not the repository root.
8. Browser smoke-test the local build or dev server with a child profile and a debug profile when UI/gameplay changed.
9. For deployment, confirm target first: GitHub Pages workflow, Azure static website, or both.

## Verification

- Success claims require command output showing the relevant tests/build passed.
- Production verification should confirm the index loads, hashed bundle is referenced, old `src/` paths are not public, and the footer build tag matches the intended version.
- If a command fails, stop and resolve or report the blocker instead of continuing the release checklist.
