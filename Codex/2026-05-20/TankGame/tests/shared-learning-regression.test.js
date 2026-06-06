const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function bodyOf(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notStrictEqual(start, -1, `Missing function ${functionName}`);
  const parametersEnd = source.indexOf(') {', start);
  assert.notStrictEqual(parametersEnd, -1, `Could not find body start for function ${functionName}`);
  const braceStart = source.indexOf('{', parametersEnd);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(braceStart + 1, index);
  }
  throw new Error(`Could not parse function ${functionName}`);
}

assert.match(source, /getSharedLearningWordSource\s*\}\s*=\s*window\.HanziTankLearning/, 'Runtime should import shared learning source helper from learning-core.');
assert.match(bodyOf('getSharedLearningWordSourceForPlayer'), /getSharedLearningWordSource\(sourceWords, playerState\)/, 'Runtime wrapper should use the shared learning path.');
assert.match(bodyOf('getBattleWordSource'), /getSharedLearningWordSourceForPlayer\(words\)/, 'Battle source should use the shared learning path.');

[
  ['startBlockAdventureMode', /createBlockAdventureState\(getSharedLearningWordSourceForPlayer\(\)\)/],
  ['chooseBlockAdventureAnswer', /createBlockAdventureState\(getSharedLearningWordSourceForPlayer\(\)\)/],
  ['startStoryAdventureMode', /createStoryAdventureState\(getSharedLearningWordSourceForPlayer\(\)\)/],
  ['chooseStoryAdventureAnswer', /createStoryAdventureState\(getSharedLearningWordSourceForPlayer\(\)\)/],
  ['startHanziTetrisMode', /createHanziTetrisState\(getSharedLearningWordSourceForPlayer\(\)\)/],
  ['handleHanziTetrisAnswer', /createHanziTetrisState\(getSharedLearningWordSourceForPlayer\(\)\)/],
  ['startElevatorEscapeMode', /createElevatorEscapeState\(getSharedLearningWordSourceForPlayer\(\)\)/],
  ['restartElevatorEscapeRun', /createElevatorEscapeState\(getSharedLearningWordSourceForPlayer\(\)\)/]
].forEach(([functionName, expected]) => {
  assert.match(bodyOf(functionName), expected, `${functionName} should start from the shared learning path.`);
});

assert.doesNotMatch(source, /create(?:BlockAdventure|StoryAdventure|HanziTetris|ElevatorEscape)State\(words\)/, 'Mini-games should not start from raw words because that resets cross-mode learning priority.');

console.log('shared learning regression tests passed');