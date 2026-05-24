const assert = require('assert');
const mastery = require('../src/core/mastery-core.js');

assert.strictEqual(mastery.masteryGoal, 3000, 'Mastery target should be 3000 Hanzi.');
assert.strictEqual(mastery.rankSize, 300, 'Rank brackets should use 300-Hanzi bands.');
assert.strictEqual(mastery.rankTiers.length, 11, 'Rank ladder should include 0 through 3000.');
assert.deepStrictEqual(mastery.getRankForMastery(0), { name: 'Recruit', zh: '新兵', min: 0 });
assert.deepStrictEqual(mastery.getRankForMastery(299), { name: 'Recruit', zh: '新兵', min: 0 });
assert.deepStrictEqual(mastery.getRankForMastery(300), { name: 'Private', zh: '列兵', min: 300 });
assert.deepStrictEqual(mastery.getRankForMastery(3000), { name: 'Colonel', zh: '上校', min: 3000 });
assert.deepStrictEqual(mastery.getNextRank(299), { name: 'Private', zh: '列兵', min: 300 });
assert.strictEqual(mastery.getNextRank(3000), null);

const bank = {
  一: { hanzi: '一', phrase: '一个', count: 1 },
  二: { hanzi: '二', phrase: '二月', count: 3 },
  broken: { phrase: 'missing hanzi', count: 99 },
  三: { hanzi: '三', phrase: '三天', count: 2 }
};

assert.strictEqual(mastery.countMasteredHanzi(bank), 3, 'Only entries with hanzi should count as mastered.');
assert.deepStrictEqual(mastery.getMasteredEntries(bank).map((entry) => entry.hanzi), ['二', '三', '一'], 'Mastered entries should sort by answer count first.');
assert.strictEqual(mastery.countMasteredHanzi(null), 0);

console.log('mastery core tests passed');
