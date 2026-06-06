const assert = require('assert');
const { createWords, gradeOneWordData } = require('../src/data/grade-one-words.js');
const blockAdventure = require('../src/core/block-adventure-core.js');

const words = createWords(gradeOneWordData);

const gridState = blockAdventure.createBlockAdventureState(words);
assert.deepStrictEqual(gridState.map, { width: 8, height: 6 });
assert.deepStrictEqual(gridState.player, { x: 1, y: 3, facing: 'right' });
assert.strictEqual(blockAdventure.getCell(gridState, 2, 2).object.kind, 'tree');
assert.strictEqual(blockAdventure.movePlayer(gridState, 'up').moved, true);
assert.deepStrictEqual(gridState.player, { x: 1, y: 2, facing: 'up' });
assert.strictEqual(blockAdventure.movePlayer(gridState, 'right').blockedBy, 'tree');
assert.deepStrictEqual(gridState.player, { x: 1, y: 2, facing: 'right' });
const treePrompt = blockAdventure.getInteractionPrompt(gridState);
assert.strictEqual(treePrompt.task.id, 'chop_tree');
assert.strictEqual(treePrompt.target.kind, 'tree');
const chopTree = blockAdventure.answerInteraction(gridState, 'wood');
assert.strictEqual(chopTree.correct, true);
assert.strictEqual(chopTree.removedObject.kind, 'tree');
assert.strictEqual(blockAdventure.getCell(gridState, 2, 2).object, null);
assert.strictEqual(gridState.resources.wood, 1);
assert.strictEqual(blockAdventure.movePlayer(gridState, 'right').moved, true);
assert.deepStrictEqual(gridState.player, { x: 2, y: 2, facing: 'right' });

const poorBuilder = blockAdventure.createBlockAdventureState(words);
poorBuilder.player = { x: 3, y: 5, facing: 'up' };
assert.strictEqual(blockAdventure.getInteractionPrompt(poorBuilder).task.id, 'craft_table');
const tooEarlyCraft = blockAdventure.answerInteraction(poorBuilder, 'wood');
assert.strictEqual(tooEarlyCraft.correct, false);
assert.strictEqual(tooEarlyCraft.reason, 'missing-resources');
assert.strictEqual(poorBuilder.structures.craftingTable, false);
assert.strictEqual(blockAdventure.getCell(poorBuilder, 3, 4).object.kind, 'table');

const state = blockAdventure.createBlockAdventureState(words);
assert.strictEqual(state.hearts, 3);
assert.deepStrictEqual(state.resources, { wood: 0, stone: 0, gold: 0 });
assert.deepStrictEqual(state.discoveries, { cave: false });
assert.strictEqual(state.completed, false);
assert.strictEqual(blockAdventure.getCurrentTask(state).id, 'chop_tree');
assert.strictEqual(blockAdventure.getCurrentTask(state).word.hanzi, '木');

const wrong = blockAdventure.answerCurrentTask(state, 'water');
assert.strictEqual(wrong.correct, false);
assert.strictEqual(state.hearts, 2);
assert.strictEqual(state.resources.wood, 0);
assert.strictEqual(blockAdventure.getCurrentTask(state).id, 'chop_tree');

const expectedProgression = [
  ['wood', 'chop_tree', { wood: 1, stone: 0, gold: 0 }, null],
  ['stone', 'mine_stone', { wood: 1, stone: 1, gold: 0 }, null],
  ['gold', 'mine_gold', { wood: 1, stone: 1, gold: 1 }, null],
  ['person', 'fight_zombie', { wood: 1, stone: 1, gold: 1 }, null],
  ['mountain', 'explore_cave', { wood: 1, stone: 1, gold: 1 }, 'cave'],
  ['wood', 'craft_table', { wood: 0, stone: 0, gold: 1 }, 'craftingTable'],
  ['wood', 'chop_tree', { wood: 1, stone: 0, gold: 1 }, null],
  ['stone', 'mine_stone', { wood: 1, stone: 1, gold: 1 }, null],
  ['home', 'build_house', { wood: 0, stone: 0, gold: 0 }, 'house'],
  ['wood', 'chop_tree', { wood: 1, stone: 0, gold: 0 }, null],
  ['gold', 'mine_gold', { wood: 1, stone: 0, gold: 1 }, null],
  ['vehicle', 'build_minecart', { wood: 0, stone: 0, gold: 0 }, 'minecart']
];

expectedProgression.forEach(([answer, taskId, resources, structure]) => {
  const task = blockAdventure.getCurrentTask(state);
  assert.strictEqual(task.id, taskId);
  const result = blockAdventure.answerCurrentTask(state, answer);
  assert.strictEqual(result.correct, true, `${taskId} should accept ${answer}`);
  assert.deepStrictEqual(state.resources, resources, `${taskId} resources`);
  if (structure === 'cave') assert.strictEqual(state.discoveries.cave, true, 'cave should be discovered');
  else if (structure) assert.strictEqual(state.structures[structure], true, `${structure} should be built`);
});

assert.strictEqual(state.completed, true);
assert.strictEqual(blockAdventure.getCurrentTask(state), null);
assert.ok(state.log.some((entry) => entry.includes('矿车')));

console.log('block adventure core tests passed');
