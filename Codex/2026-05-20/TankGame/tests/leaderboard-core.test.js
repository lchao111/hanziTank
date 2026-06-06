const assert = require('assert');
const leaderboard = require('../src/core/leaderboard-core.js');

const state = {
  correctBank: {
    一: { count: 3 },
    二: { count: 1 },
    三: { count: 7 }
  },
  warArchive: [
    { stage: 4, deaths: 1, damage: 12 },
    { stage: 7, maxDamage: 9 },
    { stage: 5, topDamagingWords: [{ damage: 4 }, { damage: 6 }] },
    { mode: 'antiAir', stage: 1, score: 18, antiAirScore: 18 }
  ]
};

const stats = leaderboard.extractLeaderboardStats(state);
assert.deepStrictEqual(stats, {
  mostHanzi: 3,
  highestStage: 7,
  mostDeaths: 4,
  highestDamage: 12,
  antiAirScore: 18
});

const records = leaderboard.getProfileLeaderboardRecords('player-one', 'Player One', state);
assert.deepStrictEqual(records.map((record) => record.type), ['mostHanzi', 'highestStage', 'mostDeaths', 'highestDamage', 'antiAirScore']);
assert.deepStrictEqual(records.map((record) => record.value), [3, 7, 4, 12, 18]);
assert.strictEqual(records[1].tooltip, '最高关卡 / Highest Stage');

console.log('leaderboard core tests passed');
