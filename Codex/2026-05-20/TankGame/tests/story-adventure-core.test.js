const assert = require('assert');
const { createWords, gradeOneWordData } = require('../src/data/grade-one-words.js');
const storyAdventure = require('../src/core/story-adventure-core.js');

const words = createWords(gradeOneWordData);

const state = storyAdventure.createStoryAdventureState(words);
assert.strictEqual(state.hp, 3);
assert.strictEqual(state.position, 0);
assert.deepStrictEqual(state.abilities, []);
const firstEncounter = storyAdventure.getCurrentEncounter(state);
assert.strictEqual(firstEncounter.hanzi, '木');
assert.deepStrictEqual(firstEncounter.scene, { id: 'fallen_bridge', name: '断桥林地', className: 'grove' });
assert.strictEqual(firstEncounter.character.id, 'branch_child');
assert.strictEqual(firstEncounter.character.name, '树枝少年');

const wood = storyAdventure.answerEncounter(state, 'wood');
assert.strictEqual(wood.correct, true);
assert.strictEqual(wood.ability.id, 'wooden_staff');
assert.strictEqual(wood.scene.id, 'fallen_bridge');
assert.strictEqual(wood.character.name, '树枝少年');
assert.strictEqual(state.abilities.includes('wooden_staff'), true);
assert.strictEqual(state.generatedScenes.includes('fallen_bridge'), true);
assert.strictEqual(state.generatedCharacters.includes('branch_child'), true);
assert.strictEqual(state.position, 1);
assert.ok(state.storyBeats.some((beat) => beat.includes('树枝少年')));
assert.ok(state.storyBeats.some((beat) => beat.includes('木棍')));

const forest = storyAdventure.answerEncounter(state, 'forest');
assert.strictEqual(forest.correct, true);
assert.strictEqual(forest.ability.id, 'forest_call');
assert.strictEqual(state.scenery.includes('forest'), true);
assert.strictEqual(state.generatedScenes.includes('living_forest'), true);
assert.strictEqual(state.generatedCharacters.includes('forest_guardian'), true);
assert.strictEqual(state.position, 2);

const failState = storyAdventure.createStoryAdventureState(words);
storyAdventure.answerEncounter(failState, 'water');
storyAdventure.answerEncounter(failState, 'water');
const defeated = storyAdventure.answerEncounter(failState, 'water');
assert.strictEqual(defeated.correct, false);
assert.strictEqual(failState.defeated, true);
assert.strictEqual(failState.hp, 0);
assert.ok(failState.adventureStory.includes('冒险故事'));
assert.ok(failState.adventureStory.includes('木'));

const completeState = storyAdventure.createStoryAdventureState(words);
['wood', 'forest', 'fire', 'water', 'mountain', 'vehicle'].forEach((answer) => {
  const result = storyAdventure.answerEncounter(completeState, answer);
  assert.strictEqual(result.correct, true, `${answer} should advance the story`);
});
assert.strictEqual(completeState.completed, true);
assert.ok(completeState.adventureStory.includes('木棍'));
assert.ok(completeState.adventureStory.includes('森林'));
assert.ok(completeState.adventureStory.includes('河灵'));
assert.ok(completeState.adventureStory.includes('矿车'));

console.log('story adventure core tests passed');
