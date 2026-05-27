const assert = require('assert');
const training = require('../src/core/training-core.js');

const words = [
  { hanzi: '一', meaning: 'one' },
  { hanzi: '二', meaning: 'two' },
  { hanzi: '三', meaning: 'three' },
  { hanzi: '四', meaning: 'four' },
  { hanzi: '五', meaning: 'five' },
  { hanzi: '六', meaning: 'six' }
];

assert.strictEqual(training.getLaneCount(1), 3);
assert.strictEqual(training.getTrainingLaneCount(), 5);
assert.deepStrictEqual(training.getActiveLaneIndexes(1), [1]);
assert.deepStrictEqual(training.getActiveLaneIndexes(2), [0, 2]);
assert.deepStrictEqual(training.getActiveLaneIndexes(3), [0, 1, 2]);
assert.deepStrictEqual(training.getTrainingLaneIndexes(), [0, 1, 2, 3, 4]);
assert.strictEqual(training.getLaneTop(0, 5), 12);
assert.strictEqual(training.getLaneTop(4, 5), 88);
assert.strictEqual(training.getLaneEnemyLeft(0), 82);
assert.strictEqual(training.getLaneEnemyLeft(100), 32);

const normalized = training.normalizeLaneEnemy({ id: 'armor', name: 'Armored Tank', hp: 9, maxHp: 9, armor: 3, absoluteDefense: 2, attackInterval: 2 }, 5);
assert.strictEqual(normalized.id, 'infantry');
assert.strictEqual(normalized.name, 'Regular Soldier');
assert.strictEqual(normalized.hp, 1);
assert.strictEqual(normalized.maxHp, 1);
assert.strictEqual(normalized.armor, 0);
assert.strictEqual(normalized.absoluteDefense, 0);
assert.strictEqual(normalized.damage, 1);
assert.strictEqual(normalized.attackInterval, 5);

const selected = training.selectTrainingWords(words, words[0], (list) => list, 5);
assert.deepStrictEqual(selected.map((word) => word.hanzi), ['一', '二', '三', '四', '五']);

let hits = Object.fromEntries(selected.map((word) => [word.hanzi, 0]));
let created = training.createTrainingLaneStates({ stage: 1, trainingWords: selected, previousLaneStates: [], activeLaneIndex: 0, trainingHits: hits, trainingHitsRequired: 1 });
assert.strictEqual(created.laneStates.length, 5);
assert.strictEqual(created.laneStates.filter((lane) => lane.active).length, 5);
assert.strictEqual(created.activeLaneIndex, 0, 'Training should preserve the first active target when it is selectable.');
assert.deepStrictEqual(created.laneStates.map((lane) => lane.word.hanzi), ['一', '二', '三', '四', '五']);
assert.ok(training.isTrainingLaneSelectable(created.laneStates[0], hits, 1));
assert.ok(!training.isTrainingLaneLearned(created.laneStates[0], hits, 1));

hits = training.recordTrainingHit(hits, '一', 1);
assert.strictEqual(hits['一'], 1);
assert.ok(training.isTrainingLaneLearned(created.laneStates[0], hits, 1));
assert.ok(!training.isTrainingLaneSelectable(created.laneStates[0], hits, 1));
assert.deepStrictEqual(training.getTrainingRemainingWords(selected, hits, 1).map((word) => word.hanzi), ['二', '三', '四', '五']);
assert.strictEqual(training.pickTrainingWord(selected, hits, 1, selected[0]).hanzi, '二');

created = training.createTrainingLaneStates({ stage: 1, trainingWords: selected, previousLaneStates: created.laneStates, activeLaneIndex: 0, trainingHits: hits, trainingHitsRequired: 1 });
assert.strictEqual(created.laneStates[0].word.hanzi, '一', 'Completed target should stay in its lane.');
assert.strictEqual(created.activeLaneIndex, 3, 'Completed active lane should be skipped toward an unfinished target.');

const combatLanes = training.createCombatLaneStates({
  stage: 2,
  activeLaneIndexes: training.getActiveLaneIndexes(2),
  createEnemy(stage) { return { id: `enemy-${stage}`, name: `Enemy ${stage}`, hp: 3, maxHp: 3, attackInterval: 4 }; },
  isBossStage(stage) { return stage % 5 === 0; },
  pickLaneWord(used) {
    const word = words.find((candidate) => !used.has(candidate.hanzi));
    return word;
  },
  enemyAttackInterval: 5
});
assert.deepStrictEqual(combatLanes.map((lane) => lane.active), [true, false, true]);
assert.strictEqual(combatLanes[0].enemy.name, 'Regular Soldier');
assert.strictEqual(combatLanes[0].enemy.hp, 1);
assert.strictEqual(combatLanes[1].enemy, null);
assert.strictEqual(combatLanes[2].word.hanzi, '二');
assert.ok(training.isLaneLive(combatLanes[0]));
assert.ok(!training.isLaneLive(combatLanes[1]));

console.log('training core tests passed');
