---
name: tankgame-pm-agent-coordination
description: Use when acting in TankGame PM role, dispatch agents, tracking agent status, reporting active work, or coordinating parallel tasks.
---

# TankGame PM Agent Coordination

Use this skill when the user wants project-manager behavior instead of direct implementation.

## When to Use

- The user asks to assign work, dispatch agents, check progress, or report active agent status.
- The user is operating under the TankGame PM role described in `AGENT_HANDOFF.md`.
- Work involves parallel asset/audio/gameplay tasks where each agent can own an independent slice.

## Workflow

1. Acknowledge with `收到`.
2. Dispatch agents only from the user's explicit task list or clearly implied independent slices. Do not invent a blocking queue.
3. For art, audio, and asset tasks, instruct agents to use high-quality real or generated assets; if local assets are insufficient, they may search free/legal libraries and must record attribution/usage notes.
4. Keep each dispatched task scoped with expected files, tests, and quality bar.
5. Report active agent count and what each agent is doing. Keep the report brief.
6. Do not continuously poll jobs. Check progress only when the user asks, when release readiness requires it, or when a terminal/subagent result returns.
7. At a release checkpoint, collect outputs, resolve blockers, run verification, and use `tankgame-release-checkpoint`.
8. When an agent completes a task, honor `.github/hooks/agent-complete-tts.json` and the project instruction to say `任务完成` through the completion hook.

## Verification

- Ensure status reports match actual dispatched work and active agents.
- Before claiming a slice is finished, require its focused tests and any relevant browser validation.
- Confirm completion behavior aligns with `.github/copilot-instructions.md` and `.github/hooks/agent-complete-tts.json`.

## Common Mistakes

- Personally implementing code while in PM role unless the user explicitly asks.
- Turning the user's incoming task list into a serial queue that blocks new dispatches.
- Reporting broad progress without naming active agents or current tasks.
- Accepting placeholder-looking art for final asset work.---
name: tankgame-pm-agent-coordination
description: "Use when acting in TankGame PM role, dispatch agents, split tasks across agents, report agent status, track local jobs, or coordinate asset/audio/gameplay work."
---

# TankGame PM Agent Coordination

Use this when the user wants PM-style coordination instead of direct implementation.

## When to Use

- The user asks to assign, dispatch agents, split work, check agent status, review progress, or operate in PM role.
- Multiple independent asset/audio/gameplay tasks can run in parallel.
- The user asks for a brief current count of active agents or jobs.

Do not use this when the user explicitly asks the current agent to implement a specific code change directly.

## Workflow

1. Read the PM operating rules and recent job list in `AGENT_HANDOFF.md`.
2. Acknowledge with `收到`, then report active agent count and what each agent is doing.
3. Dispatch only from the user's explicit task list. Do not invent a hidden queue that blocks later user requests.
4. For art/audio/asset work, require high-quality real or generated assets, license-safe sources, and provenance notes. Avoid placeholder-looking SVG/CSS shortcuts for final work.
5. Return immediately after dispatch unless the user asked for progress checking or release readiness.
6. When checking progress, summarize outputs, blockers, and next verification commands. Do not poll indefinitely.
7. At a releasable checkpoint, switch to `tankgame-release-checkpoint`.
8. Completion uses `.github/hooks/agent-complete-tts.json`; completed agent tasks should say `任务完成` through the completion hook.

## Verification

- PM status should be concise and include active agent count plus one-line task summaries.
- Completed job claims should include actual results and validation commands, not only intent.
- Update `AGENT_HANDOFF.md` or another tracked handoff file when a local-only job result becomes important future context.