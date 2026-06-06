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

assert.match(source, /src\/core\/bouncing-tank-boss-core\.js/, 'Game should load the Bouncing Tank Boss core module.');
assert.match(source, /window\.HanziTankBouncingTankBoss/, 'Game should import the Bouncing Tank Boss core API.');
assert.match(source, /let bouncingTankBossState = null/, 'Game should track Bouncing Tank Boss state outside the enemy data object.');
assert.match(source, /bouncingTankBossBattle/, 'Game should load the Bouncing Tank Boss Phaser spritesheet.');
assert.match(source, /assets\/sprites\/enemies\/bouncing-tank-boss-spritesheet\.png\?v=20260605/, 'Game should load the processed Bouncing Tank Boss sheet.');
assert.match(source, /弹跳坦克机械故障冒电火花！先命中它，再领取空投。/, 'Airdrop landing should not hide the Bouncing Tank Boss malfunction window feedback.');
assert.match(source, /\.lane-enemy \.damage-float\s*\{[^}]*transform:\s*translate\(-50%, -50%\) scaleX\(-1\)/, 'Lane MISS and damage floats should counter the mirrored lane enemy container so text is readable.');
assert.match(source, /\.lane-enemy \.lane-status\s*\{[^}]*font-size:\s*14px/s, 'Bouncing Tank Boss lane state labels should be large enough to read.');
assert.match(source, /\.lane-enemy \.lane-status\.paralyzed-status\s*\{[^}]*position:\s*absolute[^}]*top:\s*-68px[^}]*font-size:\s*18px/s, 'Paralyzed countdown should be a large clear overhead badge.');

const isMultiLaneStage = bodyOf('isMultiLaneStage');
assert.match(isMultiLaneStage, /isBouncingTankBossBattle\(\)/, 'Bouncing Tank Boss battles should use the multi-lane battlefield.');

const syncLevelHud = bodyOf('syncLevelHud');
assert.match(syncLevelHud, /enemyNameEl\.textContent = "Bouncing Tank Boss"/, 'Bouncing Tank Boss multi-lane HUD should keep the boss name instead of 3-Lane Push.');
assert.match(syncLevelHud, /timerTextEl\.textContent = isPaused \? " · Paused" : ` · Lane/, 'Bouncing Tank Boss HUD should show the boss lane.');
assert.match(syncLevelHud, /enemyReloadText\.textContent = bouncingTankBossState\?\.mode === "malfunction" \? "Paralyzed" : countdown > 0 \? `\$\{countdown\}s` : "4s"/, 'Bouncing Tank Boss HUD should display Paralyzed during malfunction.');

const startCountdown = bodyOf('startCountdown');
assert.match(startCountdown, /if \(isBouncingTankBossBattle\(\)\) \{\s*startBouncingTankBossCountdown\(arguments\.length > 0 \? seconds : undefined\);\s*return;\s*\}/s, 'Bouncing Tank Boss should use its own multi-lane countdown and default malfunction windows to 10 seconds.');

const startBouncingTankBossCountdown = bodyOf('startBouncingTankBossCountdown');
assert.match(source, /function startBouncingTankBossCountdown\(seconds\)/, 'Bouncing Tank Boss countdown helper should not default seconds to 4 because Paralyzed defaults to 10.');
assert.match(startBouncingTankBossCountdown, /const maxSeconds = bouncingTankBossState\?\.mode === "malfunction" \? 10 : 4/, 'Bouncing Tank Boss malfunction window should last 10 seconds.');
assert.match(startBouncingTankBossCountdown, /Math\.min\(maxSeconds, seconds \|\| maxSeconds\)/, 'Bouncing Tank Boss countdown should use 4 seconds normally and 10 seconds while paralyzed.');
assert.match(startBouncingTankBossCountdown, /bouncingTankBossState\?\.mode === "malfunction"/, 'Bouncing Tank Boss malfunction state should suppress its countdown attack.');
assert.match(startBouncingTankBossCountdown, /bouncingTankBossCounterAttack\("timeout"\)/, 'Bouncing Tank Boss timeout should trigger a counterattack.');

const bouncingTankBossCounterAttack = bodyOf('bouncingTankBossCounterAttack');
assert.match(bouncingTankBossCounterAttack, /playPhaserBouncingTankBossState\("fire"/, 'Bouncing Tank Boss counterattack should rotate/fire using the fire animation row.');
assert.match(bouncingTankBossCounterAttack, /playPhaserProjectile\(bossLane\.element, playerTank/, 'Bouncing Tank Boss counterattack should fire a Phaser projectile from its lane.');

const createLaneStates = bodyOf('createLaneStates');
assert.match(createLaneStates, /createBouncingTankBossLaneStates\(/, 'Bouncing Tank Boss should create a dedicated mobile-boss lane set.');

const createBouncingTankBossLaneStates = bodyOf('createBouncingTankBossLaneStates');
assert.match(createBouncingTankBossLaneStates, /bossPresent: index === bouncingTankBossState\.laneIndex/, 'Bouncing Tank Boss lane states should mark only the boss lane.');
assert.match(createBouncingTankBossLaneStates, /word: index === bouncingTankBossState\.laneIndex \? word : null/, 'Only the lane containing the Bouncing Tank Boss should carry a question word.');

const syncLaneHud = bodyOf('syncLaneHud');
assert.match(syncLaneHud, /lane\.bouncingTankBoss && !lane\.bossPresent \? "" : lane\.word\.hanzi/, 'Non-boss Bouncing Tank lanes should not display question tags.');
assert.match(syncLaneHud, /bouncingTankBossState\?\.mode === "malfunction" \? `Paralyzed \$\{countdown > 0 \? countdown : 10\}s` : "Target"/, 'Boss lane status should display Paralyzed with the remaining countdown.');
assert.match(syncLaneHud, /lane\.attackLabel\.classList\.toggle\("paralyzed-status"/, 'Paralyzed status should get a distinct overhead badge style.');

const showBouncingTankBossDodgeMiss = bodyOf('showBouncingTankBossDodgeMiss');
assert.match(showBouncingTankBossDodgeMiss, /showDamage\(laneStates\[previousLaneIndex\]\?\.element, 0, \{ miss: true \}\)/, 'Dodge MISS should be shown on the lane after the boss jumps.');

const createEnemy = bodyOf('createEnemy');
assert.match(createEnemy, /resetBouncingTankBossState\(enemy\)/, 'Creating a single enemy should initialize or clear Bouncing Tank Boss state.');

const chooseMultiLaneAnswer = bodyOf('chooseMultiLaneAnswer');
assert.match(chooseMultiLaneAnswer, /isBouncingTankBossBattle\(\)/, 'Multi-lane answers should recognize the Bouncing Tank Boss battle.');
assert.match(chooseMultiLaneAnswer, /activeLaneIndex !== bouncingTankBossState\.laneIndex/, 'Player should need to move to the boss lane before attacking.');
assert.match(chooseMultiLaneAnswer, /syncBouncingTankBossLaneStates\(\)/, 'Dodge jumps should resync which lane contains the boss.');
assert.match(chooseMultiLaneAnswer, /resolveBouncingTankAttack/, 'Bouncing Tank Boss multi-lane hits should route through the state machine.');
assert.match(chooseMultiLaneAnswer, /const malfunctionCountdownRemaining = isBouncingTankBossBattle\(\) && bouncingTankBossState\?\.mode === "malfunction" \? countdown : 0/, 'Correct malfunction hits should preserve remaining paralyze time.');
assert.match(chooseMultiLaneAnswer, /startBouncingTankBossCountdown\(Math\.max\(1, malfunctionCountdownRemaining\)\)/, 'After a malfunction hit, the player should get another question within the same 10-second window.');
assert.match(chooseMultiLaneAnswer, /bouncingTankBossCounterAttack\("wrong"\)/, 'Wrong answers outside malfunction should trigger Bouncing Tank Boss counterattack.');
assert.match(chooseMultiLaneAnswer, /routedMiss\.result\.vulnerabilityLost[\s\S]*return;/, 'Wrong answers during malfunction should close the window and return before counterattack.');
assert.match(chooseMultiLaneAnswer, /renderMultiLaneQuestion\(\{ preserveAdvance: false \}\);\s*showBouncingTankBossDodgeMiss\(result\.previousLaneIndex\);/, 'Dodge MISS should be shown after lane rerender so it stays visible.');

const chooseAnswer = bodyOf('chooseAnswer');
assert.match(chooseAnswer, /resolveBouncingTankAttack/, 'Correct single-lane hits should route through the Bouncing Tank Boss state machine.');
assert.match(chooseAnswer, /damage\.dodged/, 'Dodged attacks should be handled without damaging the boss.');
assert.match(chooseAnswer, /damage\.malfunctionStarted/, 'Third dodge should surface the malfunction window in combat feedback.');
assert.match(chooseAnswer, /vulnerabilityLost/, 'Wrong answers during malfunction should close the damage window.');

const playEnemyHitReaction = bodyOf('playEnemyHitReaction');
assert.match(playEnemyHitReaction, /playPhaserBouncingTankBossState\("malfunction"/, 'Damage feedback should play the malfunction spark animation.');
assert.match(playEnemyHitReaction, /playPhaserBouncingTankBossState\("weak"/, 'Low HP should play the weak Bouncing Tank Boss animation.');

const hideSingleEnemyPhaserActors = bodyOf('hideSingleEnemyPhaserActors');
assert.match(hideSingleEnemyPhaserActors, /phaserBouncingTankBoss/, 'Hiding single enemies should hide the Bouncing Tank Boss actor.');

console.log('bouncing tank boss regression tests passed');