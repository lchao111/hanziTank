# Custom Voice Recordings

Place custom voice recordings here.

Expected file names:

- `high-explosive-ready.mp3` - played before the TTS fallback for the high-explosive loading call.
- `hanzi/` - generated Hanzi pronunciation clips. The current list is defined in `src/data/hanzi-audio-manifest.js`.

Keep clips short and normalized so they do not mask gameplay sound effects.

To generate or replace the batch with local Edge TTS MP3 files, install the Python CLI once and run:

```powershell
py -m pip install --user edge-tts
npm run utilities:generate-hanzi-audio
```

Optional overrides:

- `EDGE_TTS_VOICE` - voice to use, defaults to `zh-CN-XiaoxiaoNeural`.
- `EDGE_TTS_RATE` - speech rate, defaults to `-8%`.
- `EDGE_TTS_PITCH` - pitch adjustment, defaults to `+0Hz`.
- `EDGE_TTS_VOLUME` - volume adjustment, defaults to `+0%`.
- `HANZI_AUDIO_OVERWRITE=1` or `npm run utilities:replace-hanzi-audio` - replace existing clips instead of only filling missing clips.
- `HANZI_AUDIO_DOWNLOAD_QUEUE=path/to/queue.json` or `node tools/generate-hanzi-audio.mjs --download-queue=path/to/queue.json` - generate only Hanzi captured from the browser-side missing-audio queue.

Generated Hanzi clips use Unicode codepoint file names such as `u4e00.mp3` for `一`. This avoids pinyin collisions from homophones and polyphonic characters. The default generator skips any file that already exists; the replace script rewrites the whole batch so gameplay can use local MP3 files instead of runtime TTS.

During gameplay, missing or unplayable Hanzi MP3 files are recorded in browser `localStorage` under `hanziTankAudioDownloadQueue`. Export that JSON array when you want to generate only the captured misses, or run the normal generator to fill every missing manifest clip.

## Adding Missing Hanzi Clips

When a Hanzi is found to have no usable offline clip in gameplay:

1. Check `src/data/hanzi-audio-manifest.js` for a standalone prompt line such as `下，下面，下去`.
1. Check `assets/audio/hanzi/u<codepoint>.mp3` for the local MP3 file.
1. If the MP3 exists but the manifest entry is missing, add the manifest entry so `hanziVoiceLines` can route gameplay to the file.
1. If the MP3 is missing, add the manifest entry and generate it with local Edge TTS:

```powershell
node tools/generate-hanzi-audio.mjs --overwrite --start-at=<new-entry-number> --concurrency=1
```

1. Recheck coverage with a small manifest/file audit and run `npm test`.
