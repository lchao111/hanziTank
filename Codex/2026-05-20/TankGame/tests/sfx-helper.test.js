const assert = require('assert');
const { SfxHelper, cuePresets } = require('../src/core/sfx-helper.js');

const expectedCues = ['normal', 'confirm', 'buy', 'close', 'error', 'specialPanel'];
expectedCues.forEach((cue) => {
  assert.ok(Array.isArray(cuePresets[cue]), `${cue} UI SFX should have a WebAudio cue preset.`);
});

let oscillatorStarts = 0;
const context = {
  currentTime: 0,
  destination: {},
  resume() {},
  createOscillator: () => ({
    type: '',
    frequency: {
      setValueAtTime() {},
      exponentialRampToValueAtTime() {}
    },
    connect() {},
    start() { oscillatorStarts += 1; },
    stop() {}
  }),
  createGain: () => ({
    gain: {
      setValueAtTime() {},
      exponentialRampToValueAtTime() {}
    },
    connect() {}
  })
};

const sfx = new SfxHelper({ contextProvider: () => context, duplicateWindowMs: 1000 });
assert.strictEqual(sfx.play('normal'), true, 'Normal click SFX should play when sound is on.');
assert.strictEqual(sfx.play('normal'), false, 'Duplicate normal click SFX should be suppressed.');
assert.ok(oscillatorStarts > 0, 'SFX playback should synthesize WebAudio oscillators.');

sfx.mute();
assert.strictEqual(sfx.play('confirm'), false, 'SFX should be muted during learning speech.');
sfx.unmute();
assert.strictEqual(sfx.play('confirm'), true, 'SFX should resume after learning speech.');

sfx.setSoundOn(false);
assert.strictEqual(sfx.play('buy'), false, 'Sound Off should suppress UI SFX.');

console.log('sfx helper tests passed');
