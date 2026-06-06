(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankBgm = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const DEFAULT_MOOD_ID = "sunny";

  const BGM_MOOD_CONFIGS = {
    sunny: {
      id: "sunny",
      label: "Sunny Grassland",
      rootFrequency: 220,
      stepMs: 480,
      volumeScale: 1,
      rhythm: [1, 1, 1, 0, 1, 1, 0, 1],
      motif: [0, 2, 4, 7, 4, 2, 9, 7],
      bass: [-12, -12, -5, -7],
      leadWave: "triangle",
      padWave: "sine",
      accentWave: "triangle",
      leadGain: 0.052,
      padGain: 0.035,
      bassGain: 0.035,
      accentGain: 0.028,
      leadDuration: 0.22,
      padDuration: 0.48,
      bassDuration: 0.28,
      accentDuration: 0.16,
      padEvery: 4,
      bassEvery: 2,
      accentEvery: 4,
      accentSemitone: 12,
      percussion: "wood",
      percussionEvery: 4
    },
    desert: {
      id: "desert",
      label: "Desert Caravan",
      rootFrequency: 174.61,
      stepMs: 560,
      volumeScale: 0.94,
      rhythm: [1, 0, 1, 0, 1, 0, 0, 1],
      motif: [0, 3, 5, 6, 5, 3, 0, -2],
      bass: [-12, -7, -12, -5],
      leadWave: "sine",
      padWave: "triangle",
      accentWave: "square",
      leadGain: 0.043,
      padGain: 0.038,
      bassGain: 0.04,
      accentGain: 0.012,
      leadDuration: 0.26,
      padDuration: 0.62,
      bassDuration: 0.34,
      accentDuration: 0.08,
      padEvery: 4,
      bassEvery: 2,
      accentEvery: 8,
      accentSemitone: 10,
      percussion: "brush",
      percussionEvery: 4
    },
    night: {
      id: "night",
      label: "Night Patrol",
      rootFrequency: 196,
      stepMs: 700,
      volumeScale: 0.82,
      rhythm: [1, 0, 0, 1, 0, 1, 0, 0],
      motif: [0, 3, 7, 5, 3, 0, -2, 0],
      bass: [-12, -5, -9, -7],
      leadWave: "sine",
      padWave: "triangle",
      accentWave: "sine",
      leadGain: 0.034,
      padGain: 0.04,
      bassGain: 0.026,
      accentGain: 0.018,
      leadDuration: 0.34,
      padDuration: 0.9,
      bassDuration: 0.42,
      accentDuration: 0.22,
      padEvery: 4,
      bassEvery: 4,
      accentEvery: 8,
      accentSemitone: 12,
      percussion: "",
      percussionEvery: 0
    },
    rain: {
      id: "rain",
      label: "Rain March",
      rootFrequency: 207.65,
      stepMs: 430,
      volumeScale: 0.9,
      rhythm: [1, 1, 0, 1, 1, 0, 1, 0],
      motif: [0, 5, 7, 12, 9, 7, 5, 2],
      bass: [-12, -5, -9, -7],
      leadWave: "sine",
      padWave: "triangle",
      accentWave: "sine",
      leadGain: 0.036,
      padGain: 0.032,
      bassGain: 0.024,
      accentGain: 0.02,
      leadDuration: 0.15,
      padDuration: 0.46,
      bassDuration: 0.22,
      accentDuration: 0.09,
      padEvery: 4,
      bassEvery: 2,
      accentEvery: 2,
      accentSemitone: 14,
      percussion: "rain",
      percussionEvery: 2
    },
    storm: {
      id: "storm",
      label: "Storm Watch",
      rootFrequency: 164.81,
      stepMs: 390,
      volumeScale: 0.88,
      rhythm: [1, 0, 1, 1, 0, 1, 0, 1],
      motif: [0, 0, 7, 5, 3, 10, 7, 5],
      bass: [-12, -12, -7, -10],
      leadWave: "triangle",
      padWave: "sawtooth",
      accentWave: "square",
      leadGain: 0.038,
      padGain: 0.022,
      bassGain: 0.045,
      accentGain: 0.013,
      leadDuration: 0.18,
      padDuration: 0.42,
      bassDuration: 0.36,
      accentDuration: 0.07,
      padEvery: 4,
      bassEvery: 2,
      accentEvery: 6,
      accentSemitone: 15,
      percussion: "thunder",
      percussionEvery: 8
    },
    "snow-mountain": {
      id: "snow-mountain",
      label: "Snow Mountain Echo",
      rootFrequency: 196,
      stepMs: 620,
      volumeScale: 0.88,
      rhythm: [1, 0, 1, 0, 1, 0, 1, 0],
      motif: [0, 5, 7, 12, 9, 7, 5, 0],
      bass: [-12, -5, -12, -7],
      leadWave: "sine",
      padWave: "triangle",
      accentWave: "sine",
      leadGain: 0.038,
      padGain: 0.044,
      bassGain: 0.028,
      accentGain: 0.021,
      leadDuration: 0.32,
      padDuration: 0.82,
      bassDuration: 0.34,
      accentDuration: 0.2,
      padEvery: 4,
      bassEvery: 4,
      accentEvery: 4,
      accentSemitone: 19,
      percussion: "bell",
      percussionEvery: 8
    },
    snowfall: {
      id: "snowfall",
      label: "Snowfall Lullaby",
      rootFrequency: 220,
      stepMs: 660,
      volumeScale: 0.84,
      rhythm: [1, 0, 1, 0, 0, 1, 0, 1],
      motif: [12, 9, 7, 4, 2, 0, 4, 7],
      bass: [-12, -8, -5, -7],
      leadWave: "sine",
      padWave: "sine",
      accentWave: "triangle",
      leadGain: 0.032,
      padGain: 0.038,
      bassGain: 0.024,
      accentGain: 0.018,
      leadDuration: 0.3,
      padDuration: 0.78,
      bassDuration: 0.3,
      accentDuration: 0.18,
      padEvery: 4,
      bassEvery: 4,
      accentEvery: 6,
      accentSemitone: 16,
      percussion: "snow",
      percussionEvery: 4
    },
    cave: {
      id: "cave",
      label: "Cave Tension",
      rootFrequency: 146.83,
      stepMs: 420,
      volumeScale: 0.82,
      rhythm: [1, 0, 1, 0, 1, 1, 0, 1],
      motif: [0, 1, 6, 5, 1, -2, 3, -5],
      bass: [-12, -12, -6, -13],
      leadWave: "sawtooth",
      padWave: "triangle",
      accentWave: "square",
      leadGain: 0.026,
      padGain: 0.03,
      bassGain: 0.05,
      accentGain: 0.012,
      leadDuration: 0.12,
      padDuration: 0.7,
      bassDuration: 0.38,
      accentDuration: 0.06,
      padEvery: 4,
      bassEvery: 2,
      accentEvery: 3,
      accentSemitone: 13,
      percussion: "stone",
      percussionEvery: 2
    }
  };

  const MOOD_ALIASES = {
    grassland: "sunny",
    "sunny-grassland": "sunny",
    "snow mountain": "snow-mountain",
    snow_mountain: "snow-mountain",
    snow: "snowfall",
    "rock-shaft": "cave",
    rock_shaft: "cave",
    elevator: "cave"
  };

  function cloneMoodConfig(config) {
    return {
      ...config,
      rhythm: [...config.rhythm],
      motif: [...config.motif],
      bass: [...config.bass]
    };
  }

  function getBgmMoodForEnvironment(environment) {
    const rawId = typeof environment === "string"
      ? environment
      : environment?.musicMood || environment?.id || "";
    const normalizedId = String(rawId).trim().toLowerCase();
    const idCandidate = MOOD_ALIASES[normalizedId] || normalizedId;
    if (BGM_MOOD_CONFIGS[idCandidate]) return idCandidate;

    const weather = typeof environment === "object" && environment
      ? String(environment.weather || "").trim().toLowerCase()
      : "";
    const weatherCandidate = MOOD_ALIASES[weather] || weather;
    if (BGM_MOOD_CONFIGS[weatherCandidate]) return weatherCandidate;
    return DEFAULT_MOOD_ID;
  }

  function getBgmMoodConfig(environmentOrMood = DEFAULT_MOOD_ID) {
    return cloneMoodConfig(BGM_MOOD_CONFIGS[getBgmMoodForEnvironment(environmentOrMood)] || BGM_MOOD_CONFIGS[DEFAULT_MOOD_ID]);
  }

  function noteFrequency(rootFrequency, semitoneOffset) {
    return rootFrequency * Math.pow(2, semitoneOffset / 12);
  }

  function patternHit(pattern, index, fallback = true) {
    if (!Array.isArray(pattern) || pattern.length === 0) return fallback;
    return Boolean(pattern[index % pattern.length]);
  }

  class BgmManager {
    constructor({
      contextProvider = null,
      volume = 0.24,
      duckVolume = 0.045,
      fadeMs = 360,
      stepMs = 520,
      scheduler = null,
      mood = DEFAULT_MOOD_ID
    } = {}) {
      this.contextProvider = contextProvider;
      this.volume = volume;
      this.duckVolume = duckVolume;
      this.fadeMs = fadeMs;
      this.stepMs = stepMs;
      this.scheduler = scheduler || {
        setTimeout: (callback, delay) => setTimeout(callback, delay),
        clearTimeout: (id) => clearTimeout(id)
      };
      this.context = null;
      this.masterGain = null;
      this.enabled = true;
      this.gameplayActive = false;
      this.paused = false;
      this.stopped = false;
      this.modalDepth = 0;
      this.duckDepth = 0;
      this.timerId = 0;
      this.noteIndex = 0;
      this.moodId = getBgmMoodForEnvironment(mood);
    }

    setEnabled(enabled) {
      this.enabled = Boolean(enabled);
      if (!this.enabled) {
        this._haltScheduler();
        this._setGain(0, 120);
        return;
      }
      this.resume();
    }

    setMood(environmentOrMood) {
      const nextMoodId = getBgmMoodForEnvironment(environmentOrMood);
      if (nextMoodId === this.moodId) return this.getMood();
      this.moodId = nextMoodId;
      this.noteIndex = 0;
      if (this.enabled && this.gameplayActive && !this.paused && !this.stopped && this.modalDepth === 0) {
        this._setGain(this._getTargetVolume(), this.fadeMs);
        this._scheduleNextStep(0);
      }
      return this.getMood();
    }

    getMood() {
      return this.moodId;
    }

    getMoodConfig() {
      return getBgmMoodConfig(this.moodId);
    }

    start() {
      this.gameplayActive = true;
      this.stopped = false;
      this.paused = false;
      this.resume();
    }

    pause() {
      this.paused = true;
      this._haltScheduler();
      this._setGain(0, 180);
    }

    resume() {
      this.paused = false;
      if (!this.enabled || !this.gameplayActive || this.stopped || this.modalDepth > 0) return;
      const context = this._getContext();
      if (!context) return;
      context.resume?.();
      this._setGain(this._getTargetVolume(), this.fadeMs);
      this._ensureScheduler();
    }

    stop() {
      this.stopped = true;
      this.gameplayActive = false;
      this.paused = false;
      this._haltScheduler();
      this._setGain(0, 220);
    }

    suspendForModal() {
      this.modalDepth += 1;
      this._haltScheduler();
      this._setGain(0, 180);
    }

    resumeFromModal() {
      this.modalDepth = Math.max(0, this.modalDepth - 1);
      if (!this.paused) this.resume();
    }

    duck() {
      this.duckDepth += 1;
      if (this.enabled) this._setGain(this.duckVolume, 120);
    }

    unduck() {
      this.duckDepth = Math.max(0, this.duckDepth - 1);
      if (this.duckDepth === 0) this.resume();
    }

    _getContext() {
      if (this.context) return this.context;
      this.context = this.contextProvider?.() || null;
      if (!this.context) return null;
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0;
      this.masterGain.connect(this.context.destination);
      return this.context;
    }

    _getMoodConfig() {
      return BGM_MOOD_CONFIGS[this.moodId] || BGM_MOOD_CONFIGS[DEFAULT_MOOD_ID];
    }

    _getCurrentStepMs() {
      return this._getMoodConfig().stepMs || this.stepMs;
    }

    _getTargetVolume() {
      if (this.duckDepth > 0) return this.duckVolume;
      const mood = this._getMoodConfig();
      return this.volume * (mood.volumeScale || 1);
    }

    _ensureScheduler() {
      if (this.timerId) return;
      this._scheduleNextStep(0);
    }

    _haltScheduler() {
      if (!this.timerId) return;
      this.scheduler.clearTimeout(this.timerId);
      this.timerId = 0;
    }

    _scheduleNextStep(delay = this._getCurrentStepMs()) {
      this._haltScheduler();
      this.timerId = this.scheduler.setTimeout(() => {
        this.timerId = 0;
        if (!this.enabled || !this.gameplayActive || this.paused || this.stopped || this.modalDepth > 0) return;
        this._playStep();
        this._scheduleNextStep(this._getCurrentStepMs());
      }, delay);
    }

    _playStep() {
      const context = this._getContext();
      if (!context || !this.masterGain) return;
      const mood = this._getMoodConfig();
      const now = context.currentTime;
      const step = this.noteIndex;
      const isDucked = this.duckDepth > 0;
      const motifSemitone = mood.motif[step % mood.motif.length];
      const leadStart = now + (step % 2 === 1 ? (mood.swing || 0) : 0);

      if (step % Math.max(1, mood.padEvery || 4) === 0) {
        this._tone(noteFrequency(mood.rootFrequency, motifSemitone - 12), now, mood.padDuration, mood.padWave, mood.padGain, { attack: 0.05 });
        this._tone(noteFrequency(mood.rootFrequency, motifSemitone - 5), now + 0.025, mood.padDuration * 0.85, mood.padWave, mood.padGain * 0.65, { attack: 0.06 });
      }

      if (step % Math.max(1, mood.bassEvery || 2) === 0) {
        const bassSemitone = mood.bass[Math.floor(step / Math.max(1, mood.bassEvery || 2)) % mood.bass.length];
        this._tone(noteFrequency(mood.rootFrequency, bassSemitone), now + 0.01, mood.bassDuration, "triangle", mood.bassGain, { attack: 0.035 });
      }

      if (patternHit(mood.rhythm, step)) {
        this._tone(noteFrequency(mood.rootFrequency, motifSemitone), leadStart, mood.leadDuration, mood.leadWave, mood.leadGain, { attack: 0.018 });
      }

      if (!isDucked && mood.accentEvery && step % mood.accentEvery === 0) {
        this._tone(noteFrequency(mood.rootFrequency, motifSemitone + mood.accentSemitone), now + 0.12, mood.accentDuration, mood.accentWave, mood.accentGain, { attack: 0.012 });
      }

      if (!isDucked && mood.percussion && mood.percussionEvery && step % mood.percussionEvery === 0) {
        this._playPercussion(mood.percussion, now, mood);
      }

      this.noteIndex += 1;
    }

    _playPercussion(kind, startTime, mood) {
      if (kind === "wood") {
        this._tone(noteFrequency(mood.rootFrequency, 19), startTime + 0.04, 0.04, "square", 0.01, { attack: 0.006 });
        return;
      }
      if (kind === "bell") {
        this._tone(noteFrequency(mood.rootFrequency, 24), startTime + 0.08, 0.28, "sine", 0.016, { attack: 0.012 });
        return;
      }
      if (kind === "snow") {
        this._tone(noteFrequency(mood.rootFrequency, 28), startTime + 0.1, 0.16, "sine", 0.01, { attack: 0.02 });
        return;
      }
      if (kind === "rain") {
        this._noiseBurst(startTime + 0.08, 0.035, { frequency: 2200, volume: 0.01, type: "highpass" });
        return;
      }
      if (kind === "brush") {
        this._noiseBurst(startTime + 0.03, 0.055, { frequency: 820, volume: 0.012, type: "bandpass" });
        return;
      }
      if (kind === "thunder") {
        this._tone(noteFrequency(mood.rootFrequency, -19), startTime + 0.02, 0.16, "triangle", 0.026, { attack: 0.02 });
        this._noiseBurst(startTime + 0.05, 0.09, { frequency: 240, volume: 0.018, type: "lowpass" });
      }
    }

    _tone(frequency, startTime, duration, type, gainValue, options = {}) {
      if (!this.context?.createOscillator || !this.context?.createGain || !this.masterGain) return;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      const attack = Math.max(0.004, options.attack ?? 0.025);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), startTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.max(attack + 0.01, duration));
      oscillator.connect(gain);
      gain.connect(this.masterGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.03);
    }

    _noiseBurst(startTime, duration, options = {}) {
      if (!this.context?.createBuffer || !this.context?.createBufferSource || !this.context?.createGain || !this.masterGain) return;
      const sampleRate = this.context.sampleRate || 44100;
      const sampleCount = Math.max(1, Math.floor(sampleRate * duration));
      const buffer = this.context.createBuffer(1, sampleCount, sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < sampleCount; index += 1) {
        const fade = 1 - index / sampleCount;
        data[index] = (Math.random() * 2 - 1) * fade;
      }

      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(options.volume || 0.01, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      if (this.context.createBiquadFilter) {
        const filter = this.context.createBiquadFilter();
        filter.type = options.type || "bandpass";
        filter.frequency.setValueAtTime(options.frequency || 1000, startTime);
        source.connect(filter);
        filter.connect(gain);
      } else {
        source.connect(gain);
      }
      gain.connect(this.masterGain);
      source.start(startTime);
      source.stop?.(startTime + duration + 0.02);
    }

    _setGain(value, fadeMs = this.fadeMs) {
      if (!this.masterGain || !this.context) return;
      const gain = this.masterGain.gain;
      const now = this.context.currentTime;
      gain.cancelScheduledValues?.(now);
      gain.setValueAtTime(gain.value, now);
      gain.linearRampToValueAtTime(Math.max(0, value), now + Math.max(0.01, fadeMs / 1000));
    }
  }

  return { BgmManager, BGM_MOOD_CONFIGS, DEFAULT_MOOD_ID, getBgmMoodForEnvironment, getBgmMoodConfig };
});
