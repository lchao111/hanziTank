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
['reloading', 'enemy-reload-ready', 'boss-slam', 'boss-attack-approach'].forEach((className) => {
  assert.match(showGameOver, new RegExp(`enemyTank\\.classList\\.remove\\([\\s\\S]*"${className}"`), `Game over should clear ${className}.`);
});
assert.doesNotMatch(showGameOver, /enemyTank\.classList\.remove\([^\n]*"fire"/, 'Game over should not clear the enemy firing pose after the player is defeated.');
assert.match(showGameOver, /updatePhaserActors\(\)[\s\S]*playEnemyGameOverPressure\(\)/, 'Game over should keep Phaser enemy actors active before showing enemy pressure.');

const gameOverPressure = bodyOf('playEnemyGameOverPressure');
assert.match(gameOverPressure, /enemyTank\.classList\.add\("fire"\)/, 'Enemy should remain visibly attacking after player defeat.');
assert.match(gameOverPressure, /currentEnemy\.id === "infantry"\) playPhaserRegularInfantryState\("fire", \{ loop: true \}\)/, 'Regular Soldier should keep Phaser fire art visible after defeat.');
assert.match(gameOverPressure, /currentEnemy\.id === "grenadier"\) playPhaserGrenadierState\("fire", \{ loop: true \}\)/, 'Grenadier should keep Phaser fire art visible after defeat.');

const restartGame = bodyOf('restartGame');
assert.match(restartGame, /cancelStageAdvance\(\)/, 'Restart should cancel any stage-clear advance animation.');
assert.match(restartGame, /isGameOver = false/, 'Restart should clear game-over state.');
assert.match(restartGame, /isLevelCleared = false/, 'Restart should clear level-clear state.');

const resetRunForProfile = bodyOf('resetRunForProfile');
assert.match(resetRunForProfile, /cancelStageAdvance\(\)/, 'Profile run reset should cancel any stage-clear advance animation.');
assert.match(resetRunForProfile, /isGameOver = false/, 'Profile run reset should clear game-over state.');
assert.match(resetRunForProfile, /isLevelCleared = false/, 'Profile run reset should clear level-clear state.');

const saveState = bodyOf('saveState');
assert.match(saveState, /syncRunProgressToState\(\)/, 'Saving should autosync current run progress.');

const saveRunProgressNow = bodyOf('saveRunProgressNow');
assert.match(saveRunProgressNow, /if \(!activeProfileId \|\| !playerState \|\| isGameOver\) return/, 'Lifecycle autosave should skip missing profiles and defeated runs.');
assert.match(saveRunProgressNow, /profileGate\.classList\.contains\("hidden"\)[\s\S]*modeGate\.classList\.contains\("hidden"\)/, 'Lifecycle autosave should not overwrite saved runs while profile or mode gates are open.');
assert.match(saveRunProgressNow, /saveState\(\)/, 'Lifecycle autosave should persist the current run.');

const takeDamage = bodyOf('takeDamage');
assert.match(takeDamage, /saveState\(\)/, 'Damage and defense changes should be persisted immediately.');

assert.match(source, /window\.addEventListener\("pagehide", saveRunProgressNow\)/, 'Page hide should flush run progress for refresh or shutdown.');
assert.match(source, /window\.addEventListener\("beforeunload", saveRunProgressNow\)/, 'Before unload should flush run progress for refresh or shutdown.');
assert.match(source, /document\.visibilityState === "hidden"\) saveRunProgressNow\(\)/, 'Backgrounding the tab should flush run progress.');

const restoreRunProgress = bodyOf('restoreRunProgress');
assert.match(restoreRunProgress, /levelNumber = stage/, 'Restoring progress should resume the saved stage.');
assert.match(restoreRunProgress, /renderStageOpeningQuestion\(levelNumber\)/, 'Restoring progress should continue the saved stage flow.');
assert.match(restoreRunProgress, /if \(progress\.phase === "stageClear"\)[\s\S]*restoreStageClearProgress\(\)/, 'Restoring a stage-clear checkpoint should show the continue UI instead of re-entering a terminal battle state.');
assert.match(restoreRunProgress, /catch \(error\)[\s\S]*playerState\.runProgress = null;[\s\S]*saveStoredState\(localStorage, activeProfileId, playerState\)/, 'Corrupt run progress should be cleared instead of blocking play.');

const restoreStageClearProgress = bodyOf('restoreStageClearProgress');
assert.match(restoreStageClearProgress, /warShopAvailable = true/, 'Stage-clear restore should reopen war prep availability.');
assert.match(restoreStageClearProgress, /shouldShowSupplyChallenge\(levelNumber\)/, 'Stage-clear restore should use the War Supply gate.');
assert.doesNotMatch(restoreStageClearProgress, /levelNumber % 5 === 0[\s\S]*showSupplyChallenge\(\)/, 'Restoring a Boss stage-clear checkpoint should not resume War Supply.');
assert.match(restoreStageClearProgress, /showPerkChoices\(\)/, 'Stage-clear restore should resume upgrade choice stages.');

const startAdventureMode = bodyOf('startAdventureMode');
assert.match(startAdventureMode, /if \(!restoreRunProgress\(\)\) resetRunForProfile\(\)/, 'Adventure mode should restore saved run progress before resetting to stage 1.');

const enterProfile = bodyOf('enterProfile');
assert.match(enterProfile, /showModeGate\(\)/, 'Profile entry should show game mode selection before starting play.');

const startBattleScenario = bodyOf('startBattleScenario');
assert.match(startBattleScenario, /cancelStageAdvance\(\)/, 'Direct battle scenarios should cancel any stage-clear advance animation.');
assert.match(startBattleScenario, /isGameOver = false/, 'Direct battle scenarios should clear game-over state.');
assert.match(startBattleScenario, /isLevelCleared = false/, 'Direct battle scenarios should clear level-clear state.');

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
