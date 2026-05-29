const assert = require('assert');
const {
  BgmManager,
  BGM_MOOD_CONFIGS,
  getBgmMoodForEnvironment
} = require('../src/core/bgm-manager.js');

const expectedMoodIds = ['sunny', 'desert', 'night', 'rain', 'storm', 'snow-mountain', 'snowfall'];
assert.deepStrictEqual(Object.keys(BGM_MOOD_CONFIGS), expectedMoodIds, 'BGM should define one mood for each battlefield environment.');
expectedMoodIds.forEach((id) => {
  assert.strictEqual(getBgmMoodForEnvironment({ id }), id, `${id} environment should map to the matching BGM mood.`);
  assert.ok(BGM_MOOD_CONFIGS[id].motif.length >= 6, `${id} mood should have a recognizable motif.`);
  assert.ok(BGM_MOOD_CONFIGS[id].leadWave, `${id} mood should define an instrument/timbre.`);
});
assert.strictEqual(getBgmMoodForEnvironment('grassland'), 'sunny', 'Grassland alias should use the sunny mood.');
assert.strictEqual(getBgmMoodForEnvironment({ id: 'unknown', weather: 'snow' }), 'snowfall', 'Snow weather should fall back to snowfall music.');
assert.ok(new Set(expectedMoodIds.map((id) => BGM_MOOD_CONFIGS[id].stepMs)).size >= 5, 'Environment moods should not all share one tempo.');
assert.notStrictEqual(BGM_MOOD_CONFIGS.rain.percussion, BGM_MOOD_CONFIGS.night.percussion, 'Rain and night should use distinct rhythmic texture.');

function createMockContext() {
  const calls = [];
  const gainParam = {
    value: 0,
    cancelScheduledValues: () => calls.push('cancel'),
    setValueAtTime(value) {
      this.value = value;
      calls.push(`gain:${value}`);
    },
    linearRampToValueAtTime(value) {
      this.value = value;
      calls.push(`ramp:${value}`);
    },
    exponentialRampToValueAtTime(value) {
      this.value = value;
      calls.push(`exp:${value}`);
    }
  };
  const context = {
    currentTime: 0,
    destination: {},
    resume: () => calls.push('resume'),
    createGain: () => ({ gain: gainParam, connect: () => calls.push('gain-connect') }),
    createOscillator: () => {
      const oscillator = {
        type: '',
        frequencyValue: 0,
        frequency: {
          setValueAtTime(value) {
            oscillator.frequencyValue = value;
          },
          exponentialRampToValueAtTime: () => {}
        },
        connect: () => calls.push('osc-connect'),
        start: () => calls.push(`osc-start:${oscillator.type}:${Math.round(oscillator.frequencyValue)}`),
        stop: () => calls.push('osc-stop')
      };
      return oscillator;
    },
    calls,
    gainParam
  };
  return context;
}

const timers = [];
const scheduler = {
  setTimeout(callback, delay) {
    const timer = { callback, delay, cancelled: false };
    timers.push(timer);
    return timer;
  },
  clearTimeout(timer) {
    if (timer) timer.cancelled = true;
  }
};

function runNextActiveTimer() {
  while (timers.length > 0) {
    const timer = timers.shift();
    if (!timer.cancelled) {
      timer.callback();
      return timer;
    }
  }
  throw new Error('No active timer to run.');
}

const context = createMockContext();
const bgm = new BgmManager({
  contextProvider: () => context,
  volume: 0.5,
  duckVolume: 0.1,
  scheduler
});

assert.strictEqual(bgm.getMood(), 'sunny', 'BGM should start in the sunny grassland mood.');
bgm.start();
assert.strictEqual(bgm.gameplayActive, true, 'BGM should mark gameplay as active when started.');
assert.ok(timers.length > 0, 'BGM should schedule procedural music after start.');
assert.strictEqual(timers[timers.length - 1].delay, 0, 'BGM should start the first procedural step immediately.');
assert.strictEqual(context.gainParam.value, 0.5, 'BGM should fade to normal volume on start.');

runNextActiveTimer();
assert.ok(context.calls.some((call) => call.startsWith('osc-start')), 'BGM scheduled steps should synthesize notes.');
assert.strictEqual(timers[timers.length - 1].delay, BGM_MOOD_CONFIGS.sunny.stepMs, 'Sunny mood should control the scheduler tempo.');

bgm.setMood({ id: 'rain', weather: 'rain' });
assert.strictEqual(bgm.getMood(), 'rain', 'BGM mood API should accept battlefield environment objects.');
assert.strictEqual(context.gainParam.value, 0.5 * BGM_MOOD_CONFIGS.rain.volumeScale, 'Mood changes should apply the mood volume scale.');
assert.strictEqual(timers[timers.length - 1].delay, 0, 'Active mood changes should reschedule promptly.');

bgm.duck();
assert.strictEqual(bgm.duckDepth, 1, 'BGM should track active duck requests.');
assert.strictEqual(context.gainParam.value, 0.1, 'BGM duck should lower volume for speech.');

bgm.duck();
bgm.unduck();
assert.strictEqual(bgm.duckDepth, 1, 'Nested speech ducking should require matching unduck calls.');
assert.strictEqual(context.gainParam.value, 0.1, 'BGM should stay ducked until all speech finishes.');

bgm.unduck();
assert.strictEqual(bgm.duckDepth, 0, 'BGM should clear duck requests after speech.');
assert.strictEqual(context.gainParam.value, 0.5 * BGM_MOOD_CONFIGS.rain.volumeScale, 'BGM should restore mood-scaled volume after speech.');

bgm.pause();
assert.strictEqual(bgm.paused, true, 'Pause should mark BGM paused.');
assert.strictEqual(context.gainParam.value, 0, 'Pause should fade BGM out.');

bgm.resume();
assert.strictEqual(context.gainParam.value, 0.5 * BGM_MOOD_CONFIGS.rain.volumeScale, 'Resume should restore BGM after pause.');

bgm.suspendForModal();
assert.strictEqual(bgm.modalDepth, 1, 'Opening a modal should suspend BGM.');
assert.strictEqual(context.gainParam.value, 0, 'Modal suspension should fade BGM out.');
bgm.resumeFromModal();
assert.strictEqual(bgm.modalDepth, 0, 'Closing a modal should clear suspension.');
assert.strictEqual(context.gainParam.value, 0.5 * BGM_MOOD_CONFIGS.rain.volumeScale, 'Closing the modal should restore BGM when gameplay is active.');

bgm.stop();
assert.strictEqual(bgm.gameplayActive, false, 'Game over should stop active BGM.');
assert.strictEqual(context.gainParam.value, 0, 'Game over should fade BGM out.');

console.log('bgm manager tests passed');
