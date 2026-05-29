# Background Music Source Notes

The current game background music is generated at runtime with WebAudio in
`src/core/bgm-manager.js`. It is original procedural music for this project and
does not depend on third-party music files or samples.

- Source: original procedural WebAudio mood engine
- Author: project code
- License: project-owned code/audio generation, no external sample license

## Environment Moods

- `sunny` / grassland: bright triangle lead, gentle mallet accents, bouncy child-friendly march.
- `desert`: slower sparse motif, soft brush rhythm, warm low drone.
- `night`: slower lullaby-like sine lead, airy pads, no percussion.
- `rain`: light droplet arpeggios with quiet filtered rain ticks.
- `storm`: short dramatic pulses, low thunder-like procedural noise, kept low and non-scary.
- `snow-mountain`: wide echoing bell/pad contour with fewer bass pulses.
- `snowfall`: soft high bell notes and slow lullaby rhythm.

All moods are intentionally low-volume and sparse. During Hanzi MP3 playback,
browser TTS, and queued learning prompts, the BGM ducks and drops transient
accents/percussion so Chinese pronunciation stays clear.

If this is replaced with recorded music later, add the source, author, URL, and
license here before wiring the files into gameplay.
