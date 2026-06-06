const assert = require('assert');
const fs = require('fs');
const path = require('path');
const enemies = require('../src/data/enemies.js');
const combat = require('../src/core/combat-core.js');

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

const truck = enemies.levelTypes.find((enemy) => enemy.id === 'truck');
assert.ok(truck, 'Self-Destruct Truck should exist.');
assert.strictEqual(truck.hp, 10, 'Self-Destruct Truck should have 10 HP.');
assert.strictEqual(truck.armor, 10, 'Self-Destruct Truck should have 10 armor.');
assert.strictEqual(truck.damage, 15, 'Self-Destruct Truck should deal 15 direct damage when it explodes.');
assert.strictEqual(truck.attackInterval, 30, 'Self-Destruct Truck challenge should last 30 seconds.');
assert.strictEqual(truck.scaleWithStage, false, 'Self-Destruct Truck should keep its hand-tuned 10 HP / 10 armor profile.');
assert.deepStrictEqual(truck.challenge, {
  type: 'correctAnswersTimedSelfDestruct',
  requiredCorrect: 10,
  timeLimitSeconds: 30,
  failureDamage: 15,
  successDefeats: true
});

const directTruck = combat.createEnemyById('truck', enemies.levelTypes, enemies.bossTemplate, enemies.eliteTypes, 99);
assert.strictEqual(directTruck.hp, 10, 'Direct truck debug battles should keep base HP.');
assert.strictEqual(directTruck.maxHp, 10);
assert.strictEqual(directTruck.armor, 10);
assert.strictEqual(directTruck.maxArmor, 10);
assert.strictEqual(directTruck.damage, 15);
assert.strictEqual(directTruck.attackInterval, 30);
assert.strictEqual(directTruck.challenge.requiredCorrect, 10);

assert.match(source, /let selfDestructTruckCorrectAnswers = 0/, 'Runtime should track correct answers during the truck challenge.');
assert.match(source, /function isSelfDestructTruckChallenge\(/, 'Runtime should expose a truck challenge guard.');
assert.match(source, /function resetSelfDestructTruckChallenge\(/, 'Runtime should reset truck challenge progress between enemies.');
assert.match(source, /function completeSelfDestructTruckChallenge\(/, 'Runtime should complete the truck after 10 correct answers.');
assert.match(source, /function handleSelfDestructTruckTimeout\(/, 'Runtime should explode the truck at point blank when time runs out.');

const startCountdown = bodyOf('startCountdown');
assert.match(startCountdown, /handleSelfDestructTruckTimeout\(smokeMissed, result\)/, 'Truck timeout should use the point-blank self-destruct handler.');
assert.match(startCountdown, /takeDamage\(currentEnemy\.damage \|\| 1, \{ direct: isSelfDestructTruckChallenge\(\) \}\)/, 'Truck timeout should apply direct damage that bypasses armor and absolute defense.');
assert.match(startCountdown, /startCountdown\(\)/, 'Truck challenge should still use the shared reload timer loop.');

const renderQuestion = bodyOf('renderQuestion');
assert.match(renderQuestion, /resetSelfDestructTruckChallenge\(\)/, 'Rendering a truck should initialize challenge progress.');
assert.match(renderQuestion, /updateSelfDestructTruckChallengeMessage\(\)/, 'Truck prompt should show challenge progress.');

const chooseAnswer = bodyOf('chooseAnswer');
assert.match(chooseAnswer, /recordSelfDestructTruckCorrectAnswer\(\)/, 'Each correct truck answer should advance challenge progress.');
assert.match(chooseAnswer, /completeSelfDestructTruckChallenge\(\)/, 'The tenth correct truck answer should defeat the truck.');
assert.match(chooseAnswer, /takeDamage\(damage, \{ direct: isSelfDestructTruckChallenge\(\) \}\)/, 'Wrong truck answers should use direct self-destruct collision damage.');

const takeDamage = bodyOf('takeDamage');
assert.match(takeDamage, /options\.direct/, 'takeDamage should support direct damage for the self-destruct truck.');
assert.match(takeDamage, /lives = Math\.max\(0, lives - Math\.max\(0, amount\)\)/, 'Direct damage should bypass armor and absolute defense.');

const truckCrashAttack = bodyOf('truckCrashAttack');
assert.match(truckCrashAttack, /pointBlank/, 'Truck crash animation should support a point-blank blast.');

console.log('self-destruct truck challenge tests passed');
