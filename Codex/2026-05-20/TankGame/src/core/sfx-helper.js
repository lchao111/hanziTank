(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankSfx = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const cuePresets = {
    normal: [{ f: 540, d: 0.055, type: "triangle", v: 0.045 }],
    confirm: [
      { f: 523, d: 0.07, type: "triangle", v: 0.045 },
      { f: 784, d: 0.09, type: "triangle", v: 0.04, delay: 0.055 }
    ],
    buy: [
      { f: 740, d: 0.045, type: "sine", v: 0.04 },
      { f: 988, d: 0.07, type: "sine", v: 0.035, delay: 0.045 },
      { f: 1319, d: 0.075, type: "triangle", v: 0.03, delay: 0.09 }
    ],
    close: [{ f: 420, d: 0.065, type: "sine", v: 0.036, end: 300 }],
    error: [{ f: 220, d: 0.13, type: "square", v: 0.035, end: 150 }],
    specialPanel: [
      { f: 330, d: 0.08, type: "triangle", v: 0.035 },
      { f: 660, d: 0.12, type: "sine", v: 0.035, delay: 0.07 }
    ]
  };

  class SfxHelper {
    constructor({ contextProvider = null, soundOn = true, volume = 1, duplicateWindowMs = 75 } = {}) {
      this.contextProvider = contextProvider;
      this.soundOn = soundOn;
      this.volume = volume;
      this.duplicateWindowMs = duplicateWindowMs;
      this.lastPlayed = {};
      this.mutedDepth = 0;
    }

    setSoundOn(soundOn) {
      this.soundOn = Boolean(soundOn);
    }

    mute() {
      this.mutedDepth += 1;
    }

    unmute() {
      this.mutedDepth = Math.max(0, this.mutedDepth - 1);
    }

    play(type = "normal") {
      if (!this.soundOn || this.mutedDepth > 0) return false;
      const nowMs = Date.now();
      if (nowMs - (this.lastPlayed[type] || 0) < this.duplicateWindowMs) return false;
      this.lastPlayed[type] = nowMs;
      const context = this.contextProvider?.();
      if (!context) return false;
      context.resume?.();
      const preset = cuePresets[type] || cuePresets.normal;
      preset.forEach((cue) => this._playCue(context, cue));
      return true;
    }

    _playCue(context, cue) {
      const start = context.currentTime + (cue.delay || 0);
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = cue.type;
      oscillator.frequency.setValueAtTime(cue.f, start);
      if (cue.end) oscillator.frequency.exponentialRampToValueAtTime(cue.end, start + cue.d);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime((cue.v || 0.04) * this.volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + cue.d);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + cue.d + 0.02);
    }
  }

  return { SfxHelper, cuePresets };
});
