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

assert.match(source, /let isGameOver = false/, 'Game over state should be tracked explicitly.');
assert.match(source, /let isLevelCleared = false/, 'Level-clear state should be tracked explicitly.');
assert.match(source, /let smokeCoverCharges = 0/, 'Smoke cover charges should be tracked explicitly.');

const startCountdown = bodyOf('startCountdown');
assert.match(startCountdown, /if \(isPaused \|\| isGameOver \|\| isLevelCleared \|\| lives <= 0 \|\| currentEnemy\.hp <= 0\) return/, 'Reload countdown must not start after game over or enemy defeat.');
assert.match(startCountdown, /if \(isGameOver \|\| isLevelCleared \|\| lives <= 0 \|\| currentEnemy\.hp <= 0\)/, 'Active reload interval should stop if defeat or enemy death happens mid-countdown.');
assert.match(startCountdown, /if \(isGameOver \|\| isLevelCleared \|\| currentEnemy\.hp <= 0\) return/, 'Delayed reload recovery should not resume after enemy defeat.');

const renderQuestion = bodyOf('renderQuestion');
assert.match(renderQuestion, /if \(isGameOver \|\| isLevelCleared \|\| lives <= 0 \|\| currentEnemy\.hp <= 0\) return/, 'Normal questions must not render after defeat or enemy defeat.');

const renderBossQuestion = bodyOf('renderBossQuestion');
assert.match(renderBossQuestion, /if \(isGameOver \|\| isLevelCleared \|\| lives <= 0 \|\| currentEnemy\.hp <= 0\) return/, 'Boss questions must not render after defeat or enemy defeat.');

const completeLevel = bodyOf('completeLevel');
assert.match(completeLevel, /if \(isLevelCleared\) return/, 'Level completion should be idempotent.');
assert.match(completeLevel, /isLevelCleared = true/, 'Level completion should set terminal state before delayed screens.');

const showGameOver = bodyOf('showGameOver');
assert.match(showGameOver, /if \(isGameOver\) return/, 'Game over should be idempotent.');
assert.match(showGameOver, /isGameOver = true/, 'Game over should set terminal state before cleanup.');
assert.match(showGameOver, /stopCountdown\(\)/, 'Game over should stop reload countdown.');
assert.match(showGameOver, /enemyTank\.classList\.remove\("reloading", "fire", "boss-slam", "boss-attack-approach", "crash-attack"\)/, 'Game over should clear enemy attack/reload classes.');

const restartGame = bodyOf('restartGame');
assert.match(restartGame, /cancelStageAdvance\(\)/, 'Restart should cancel any stage-clear advance animation.');
assert.match(restartGame, /isGameOver = false/, 'Restart should clear game-over state.');
assert.match(restartGame, /isLevelCleared = false/, 'Restart should clear level-clear state.');

const resetRunForProfile = bodyOf('resetRunForProfile');
assert.match(resetRunForProfile, /cancelStageAdvance\(\)/, 'Profile run reset should cancel any stage-clear advance animation.');
assert.match(resetRunForProfile, /isGameOver = false/, 'Profile run reset should clear game-over state.');
assert.match(resetRunForProfile, /isLevelCleared = false/, 'Profile run reset should clear level-clear state.');

const startDebugBattle = bodyOf('startDebugBattle');
assert.match(startDebugBattle, /cancelStageAdvance\(\)/, 'Debug battle should cancel any stage-clear advance animation.');
assert.match(startDebugBattle, /isGameOver = false/, 'Debug battle should clear game-over state.');
assert.match(startDebugBattle, /isLevelCleared = false/, 'Debug battle should clear level-clear state.');

const enemyFire = bodyOf('enemyFire');
assert.match(enemyFire, /if \(isGameOver \|\| isLevelCleared \|\| lives <= 0 \|\| currentEnemy\.hp <= 0\) return/, 'Enemy fire should not start after game over or enemy defeat.');
assert.match(enemyFire, /if \(result\.missed\)/, 'Enemy fire should render MISS results without damage.');

const truckCrashAttack = bodyOf('truckCrashAttack');
assert.match(truckCrashAttack, /if \(isGameOver \|\| isLevelCleared \|\| lives <= 0 \|\| currentEnemy\.hp <= 0\) return/, 'Truck attack should not start after game over or enemy defeat.');

const bossHammerAttack = bodyOf('bossHammerAttack');
assert.match(bossHammerAttack, /if \(isGameOver \|\| isLevelCleared \|\| lives <= 0 \|\| currentEnemy\.hp <= 0\) return/, 'Boss attack should not start after game over or enemy defeat.');
assert.match(bossHammerAttack, /if \(result\.missed\)/, 'Boss attack should render MISS results without damage.');

const applyAmmoHitEffects = bodyOf('applyAmmoHitEffects');
assert.match(applyAmmoHitEffects, /smokeCoverCharges \+= ammo\.smokeCover/, 'Smoke shells should add cover charges.');
assert.match(applyAmmoHitEffects, /lives = Math\.min\(getMaxLives\(\), lives \+ ammo\.repairOnHit\)/, 'Repair shells should repair HP on hit.');
assert.match(applyAmmoHitEffects, /playerArmor \+= ammo\.armorOnHit/, 'Armor shells should add armor on hit.');

const consumeSmokeCover = bodyOf('consumeSmokeCover');
assert.match(consumeSmokeCover, /smokeCoverCharges -= 1/, 'Smoke cover should be consumed by the next enemy attack.');

const createMissResult = bodyOf('createMissResult');
assert.match(createMissResult, /missed: true/, 'Smoke miss should use a missed attack result.');

console.log('gameover regression tests passed');
