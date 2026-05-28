const assert = require('assert');
const storage = require('../src/core/storage-core.js');

function createMemoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
    data
  };
}

const today = '2026-05-24';
const defaults = storage.createDefaultState(today);
assert.strictEqual(defaults.coins, 0);
assert.deepStrictEqual(defaults.owned, ['tank_sherman']);
assert.deepStrictEqual(defaults.equipped, { tank: 'tank_sherman', shell: '', weapon: '' });
assert.strictEqual(defaults.runProgress, null);

const clone = storage.cloneDefaultState(defaults);
clone.owned.push('tank_tiger');
clone.correctBank['一'] = { hanzi: '一' };
assert.deepStrictEqual(defaults.owned, ['tank_sherman'], 'Clone should not share owned array with defaults.');
assert.deepStrictEqual(defaults.correctBank, {}, 'Clone should not share banks with defaults.');

assert.strictEqual(storage.normalizeProfileName('  Kid   One  '), 'Kid One');
assert.strictEqual(storage.getProfileId('  Kid   One  '), 'kid one');
assert.strictEqual(storage.getStateKey('kid'), 'hanziTankState:kid');
assert.strictEqual(storage.getStateKey(''), 'hanziTankState');
assert.strictEqual(storage.hashPassword('abc', 'salt'), storage.hashPassword('abc', 'salt'));
assert.notStrictEqual(storage.hashPassword('abc', 'salt'), storage.hashPassword('abc', 'other'));
assert.strictEqual(storage.createSalt(() => 123456, () => 0.5), '2n9ci');

const staleState = {
  coins: 10,
  dailyDate: '2026-05-23',
  dailyScore: 99,
  equipped: { tank: 'tank_tiger' },
  runProgress: { stage: 6, phase: 'battle', lives: 2, score: 120 },
  correctBank: { 一: { hanzi: '一', count: 2 } },
  owned: []
};
const merged = storage.mergeSavedState(staleState, defaults, today);
assert.strictEqual(merged.dailyDate, today);
assert.strictEqual(merged.dailyScore, 0, 'Daily score should reset across dates.');
assert.strictEqual(merged.coins, 10);
assert.strictEqual(merged.equipped.tank, 'tank_tiger');
assert.deepStrictEqual(merged.runProgress, staleState.runProgress, 'Run progress should persist so players can resume later.');
assert.ok(merged.owned.includes('tank_sherman'), 'Sherman should always be owned.');
assert.deepStrictEqual(merged.correctBank, staleState.correctBank);

const memory = createMemoryStorage();
storage.saveProfiles(memory, { kid: { name: 'Kid' } });
assert.deepStrictEqual(storage.getProfiles(memory), { kid: { name: 'Kid' } });
storage.saveState(memory, 'kid', merged);
assert.strictEqual(JSON.parse(memory.data['hanziTankState:kid']).coins, 10);
assert.strictEqual(JSON.parse(memory.data['hanziTankState:kid']).runProgress.stage, 6);
assert.strictEqual(storage.loadState(memory, 'missing', defaults, today).equipped.tank, 'tank_sherman');

console.log('storage core tests passed');
