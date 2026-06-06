const assert = require('assert');
const learning = require('../src/core/learning-core.js');

assert.strictEqual(learning.normalizeBankWord(null), null);
assert.strictEqual(learning.normalizeBankWord({ meaning: 'missing hanzi' }), null);
assert.deepStrictEqual(
  learning.normalizeBankWord({ hanzi: '一', meaning: 'one', phrase: '一个' }),
  { hanzi: '一', meaning: 'one', phrase: '一个' }
);
assert.deepStrictEqual(
  learning.normalizeBankWord({ hanzi: '左右' }, '左右'),
  { hanzi: '左右', meaning: 'boss word', phrase: '左右' }
);
assert.deepStrictEqual(
  learning.normalizeBankWord({ hanzi: '天', meaning: 'sky' }, '天空'),
  { hanzi: '天', meaning: 'sky', phrase: '天空' }
);

const playerState = { correctBank: null };
const firstEntry = learning.recordProfileWord(playerState, 'correctBank', { hanzi: '一', meaning: 'one', phrase: '一个' }, { now: '2026-05-24T00:00:00.000Z' });
assert.strictEqual(firstEntry.count, 1);
assert.strictEqual(playerState.correctBank['一'].lastSeen, '2026-05-24T00:00:00.000Z');

const secondEntry = learning.recordProfileWord(playerState, 'correctBank', { hanzi: '一', meaning: 'one', phrase: '一只' }, { now: '2026-05-24T00:01:00.000Z' });
assert.strictEqual(secondEntry.count, 2);
assert.strictEqual(secondEntry.phrase, '一只');
assert.strictEqual(secondEntry.lastSeen, '2026-05-24T00:01:00.000Z');

assert.strictEqual(learning.recordProfileWord(playerState, 'correctBank', null), null);
assert.throws(() => learning.recordProfileWord(null, 'correctBank', { hanzi: '一' }), /valid player state/);
assert.throws(() => learning.recordProfileWord({}, '', { hanzi: '一' }), /valid bank name/);

const sharedWords = [
  { hanzi: '一', meaning: 'one' },
  { hanzi: '二', meaning: 'two' },
  { hanzi: '三', meaning: 'three' },
  { hanzi: '四', meaning: 'four' },
  { hanzi: '三', meaning: 'duplicate three' },
  { meaning: 'missing hanzi' }
];
const sharedSource = learning.getSharedLearningWordSource(sharedWords, {
  review: { 三: 2, 一: 0 },
  correctBank: { 一: { hanzi: '一', count: 3 }, 四: { hanzi: '四', count: 1 } },
  wrongBank: { 三: { hanzi: '三', count: 2 } }
});
assert.deepStrictEqual(
  sharedSource.map((word) => word.hanzi),
  ['三', '二', '一', '四'],
  'Shared source should prioritize review words, then new words, then learned practice words.'
);
assert.strictEqual(sharedSource[0].meaning, 'three', 'Shared source should preserve the first word object for a Hanzi.');
assert.deepStrictEqual(
  learning.getSharedLearningWordSource(sharedWords, null).map((word) => word.hanzi),
  ['一', '二', '三', '四'],
  'Shared source should tolerate missing player state and return unique valid words.'
);

console.log('learning core tests passed');
