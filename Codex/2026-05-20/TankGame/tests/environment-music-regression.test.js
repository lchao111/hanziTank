const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { BGM_MOOD_CONFIGS, getBgmMoodForEnvironment } = require('../src/core/bgm-manager.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function bodyOf(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notStrictEqual(start, -1, `${functionName} should exist.`);
  const parameterEnd = source.indexOf(')', start);
  const braceStart = source.indexOf('{', parameterEnd);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart + 1, index);
    }
  }
  throw new Error(`Could not parse ${functionName}.`);
}

const environmentIds = ['sunny', 'desert', 'snow-mountain', 'rain', 'night', 'storm', 'snowfall'];
environmentIds.forEach((environmentId) => {
  assert.match(source, new RegExp(`id: "${environmentId}"`), `Battlefield should define the ${environmentId} environment.`);
  assert.ok(BGM_MOOD_CONFIGS[environmentId], `${environmentId} should have a matching BGM mood.`);
  assert.strictEqual(getBgmMoodForEnvironment({ id: environmentId }), environmentId, `${environmentId} should map directly to its mood.`);
});

const applyBattlefieldEnvironment = bodyOf('applyBattlefieldEnvironment');
const moodCallIndex = applyBattlefieldEnvironment.indexOf('setBattleMusicEnvironment(environment)');
const earlyReturnIndex = applyBattlefieldEnvironment.indexOf('if (activeBattlefieldEnvironmentId === environment.id)');
assert.ok(moodCallIndex >= 0, 'Battlefield environment changes should update the BGM mood.');
assert.ok(moodCallIndex < earlyReturnIndex, 'BGM mood should stay synced even when the visual environment is already active.');
assert.match(applyBattlefieldEnvironment, /playPhaserEnvironmentWeather\(environment\)/, 'Environment changes should keep weather VFX wiring.');

assert.match(bodyOf('setBattleMusicEnvironment'), /bgmManager\.setMood\(environment\)/, 'Battle music environment helper should delegate to the BGM mood API.');
assert.match(bodyOf('startBattleMusic'), /setBattleMusicEnvironment\(getBattlefieldEnvironment\(levelNumber\)\)/, 'Starting battle music should use the current battlefield environment.');

console.log('environment music regression tests passed');
