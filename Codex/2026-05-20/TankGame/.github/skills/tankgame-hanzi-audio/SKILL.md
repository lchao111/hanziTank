---
name: tankgame-hanzi-audio
description: Use when generating TankGame Hanzi audio, edge-tts MP3 clips, missing audio download queue files, or speech manifest coverage.
---

# TankGame Hanzi Audio

Use this skill for local Hanzi MP3 generation and speech/audio regressions.

## When to Use

- Generating missing `assets/audio/hanzi/uXXXX.mp3` clips.
- Processing the browser `hanziTankAudioDownloadQueue` into local files.
- Replacing a batch through `edge-tts`.
- Updating tests around `tools/generate-hanzi-audio.mjs`, `assets/audio/README.md`, or `tests/hanzi-audio-manifest.test.js`.

## Workflow

1. Confirm the target set: full batch, grade-one only, one queue JSON file, or a small manual subset.
2. Ensure Python has `edge-tts` installed and prefer the project default voice unless the user requests otherwise: `zh-CN-XiaoxiaoNeural`.
3. Generate missing audio with `npm run utilities:generate-hanzi-audio`.
4. Replace existing clips only when intended with `npm run utilities:replace-hanzi-audio` or `npm run utilities:replace-grade-one-hanzi-audio`.
5. For browser-collected misses, export or provide the queue JSON and run `node tools/generate-hanzi-audio.mjs --download-queue=path/to/queue.json`.
6. Preserve Boss speech behavior: Boss prompts display `??` and replay through `queueChineseSpeech(..., { preserveMessage: true, shouldSpeak })`.
7. Do not let BGM or SFX mask learning audio; Hanzi pronunciation has priority.

## Verification

- Run `node tests/hanzi-audio-manifest.test.js` after audio manifest/file changes.
- Run `node tests/speech-regression.test.js` after speech wrapper, Boss question, or prompt changes.
- Run `npm test` for broad speech, audio lifecycle, question, or learning changes.

## Common Mistakes

- Speaking stale single-Hanzi targets after Boss state changes.
- Overwriting selectable prompts with missing voice warnings.
- Replacing the whole audio set when only a download queue was intended.
- Forgetting that browser localStorage queues are not durable repo state until exported.---
name: tankgame-hanzi-audio
description: "Use when generating TankGame Hanzi audio, edge-tts clips, local MP3 pronunciation assets, missing clip manifests, speech regression fixes, or download queue handling."
---

# TankGame Hanzi Audio

Use this for local Hanzi MP3 generation and speech asset maintenance. Runtime pronunciation must stay clearer and higher priority than music or effects.

## When to Use

- The task mentions Hanzi audio, edge-tts, local MP3 clips, download queue, missing pronunciation, `speechSynthesis`, or Boss speech.
- New word banks or queued missing clips need generated `assets/audio/hanzi/uXXXX.mp3` files.
- Speech changes could affect Boss prompts, voice fallback, BGM ducking, or offline audio probing.

## Workflow

1. Read `assets/audio/README.md`, `tools/generate-hanzi-audio.mjs`, and the speech notes in `PROJECT_STATE.md`.
2. Preserve runtime priority: Chinese pronunciation must duck or override BGM/SFX when needed.
3. For queued missing clips, export or locate the browser `hanziTankAudioDownloadQueue`, then run `node tools/generate-hanzi-audio.mjs --download-queue=<path>`.
4. For grade-one replacement, use `npm run utilities:replace-grade-one-hanzi-audio` only when a full overwrite is intended.
5. For full replacement, use `npm run utilities:replace-hanzi-audio` only with explicit intent.
6. Keep defaults unless there is a reason to change them: `zh-CN-XiaoxiaoNeural`, optional `EDGE_TTS_VOICE`, and optional rate settings.
7. For Boss speech, preserve `queueChineseSpeech(..., { preserveMessage: true, shouldSpeak })` so the `??` prompt is not overwritten.

## Verification

- Run `node tests/hanzi-audio-manifest.test.js` after audio asset or manifest changes.
- Run `node tests/speech-regression.test.js` after speech wrapper, Boss prompt, or autoplay changes.
- Run `npm test` if generated audio paths, word data, or speech behavior changed.
