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

assert.match(source, /id="versusModal"/, 'Versus mode should render inside its own modal.');
assert.match(source, /id="versusBattleLane"/, 'Versus mode should have one central battle lane.');
assert.match(source, /\.versus-battle-lane \{[\s\S]*top: 52%/, 'The versus battlefield should use one central lane.');
assert.match(source, /\.versus-options \{[\s\S]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/, 'Versus answers should stay in one row.');
assert.match(source, /\.versus-soldier \{[\s\S]*regular-infantry-spritesheet\.png/, 'Versus soldiers should use the regular soldier model.');
assert.match(source, /const versusHqMaxHp = 5/, 'Each side should start with 5 HQ HP.');
assert.match(source, /const versusSoldierStep = 2\.2/, 'Versus soldiers should advance on a timed tug-of-war cadence.');

const startVersusMode = bodyOf('startVersusMode');
assert.match(startVersusMode, /soldiers: \[\]/, 'Versus mode should start with no soldiers in the lane.');
assert.match(startVersusMode, /scheduleVersusTick\(\)/, 'Versus mode should start automatic soldier advancement.');

const answerVersusQuestion = bodyOf('answerVersusQuestion');
assert.match(answerVersusQuestion, /spawnVersusSoldier\(side, player\.question\.word\)/, 'Correct answers should spawn a soldier for that side.');
assert.doesNotMatch(answerVersusQuestion, /defendVersusLane/, 'One-lane versus should not require manual lane defense.');
assert.doesNotMatch(answerVersusQuestion, /getVersusActivePrompt/, 'One-lane versus should not switch prompts based on lane threats.');

const handleVersusKeydown = bodyOf('handleVersusKeydown');
assert.match(handleVersusKeydown, /key === "a"[\s\S]*moveVersusChoice\("left", -1\)/, 'P1 should use A/D to choose answers.');
assert.match(handleVersusKeydown, /key === " "[\s\S]*answerVersusQuestion\("left"\)/, 'P1 should confirm with Space.');
assert.match(handleVersusKeydown, /key === "arrowleft"[\s\S]*moveVersusChoice\("right", -1\)/, 'P2 should use arrow keys to choose answers.');
assert.match(handleVersusKeydown, /key === "enter"[\s\S]*answerVersusQuestion\("right"\)/, 'P2 should confirm with Enter.');
assert.doesNotMatch(handleVersusKeydown, /moveVersusLane/, 'One-lane versus should not use lane movement controls.');

const advanceVersusBattle = bodyOf('advanceVersusBattle');
assert.match(advanceVersusBattle, /soldier\.owner === "left" \? versusSoldierStep : -versusSoldierStep/, 'Soldiers should move toward the opponent base.');
assert.match(advanceVersusBattle, /resolveVersusCollisions\(\)/, 'Soldiers should fight when they meet in the center lane.');
assert.match(advanceVersusBattle, /resolveVersusInvasions\(\)/, 'Soldiers reaching a base should damage HQ.');

const resolveVersusCollisions = bodyOf('resolveVersusCollisions');
assert.match(resolveVersusCollisions, /Math\.abs\(leftSoldier\.position - rightSoldier\.position\) <= 4/, 'Opposing soldiers should remove each other when they meet.');

const resolveVersusInvasions = bodyOf('resolveVersusInvasions');
assert.match(resolveVersusInvasions, /soldier\.owner === "left" && soldier\.position >= 100/, 'Left soldiers should damage Right HQ at the far side.');
assert.match(resolveVersusInvasions, /soldier\.owner === "right" && soldier\.position <= 0/, 'Right soldiers should damage Left HQ at the far side.');
assert.match(resolveVersusInvasions, /finishVersusMode\("Right"\)/, 'Right should win when Left HQ reaches zero.');
assert.match(resolveVersusInvasions, /finishVersusMode\("Left"\)/, 'Left should win when Right HQ reaches zero.');

const renderVersusBattleLane = bodyOf('renderVersusBattleLane');
assert.match(renderVersusBattleLane, /versus-frontline/, 'The one lane should show a central battle line.');
assert.match(renderVersusBattleLane, /soldier\.position/, 'Soldiers should render according to their tug-of-war position.');

const renderVersusHearts = bodyOf('renderVersusHearts');
assert.match(renderVersusHearts, /versus-heart/, 'HQ health should render as hearts.');

console.log('versus one-lane regression tests passed');
