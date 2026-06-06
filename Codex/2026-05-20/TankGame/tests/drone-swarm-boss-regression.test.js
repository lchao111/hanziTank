const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');
const combat = require('../src/core/combat-core.js');
const droneBoss = require('../src/core/drone-swarm-boss-core.js');
const enemies = require('../src/data/enemies.js');
const assets = require('../src/data/asset-manifest.js');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

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

function readImage(relativePath) {
  const cleanPath = relativePath.split('?')[0];
  const fullPath = path.join(root, cleanPath);
  assert.ok(fs.existsSync(fullPath), `${cleanPath} should exist.`);
  return imageSize(fs.readFileSync(fullPath));
}

const sampleWords = [
  { hanzi: '一', meaning: 'one' },
  { hanzi: '二', meaning: 'two' },
  { hanzi: '三', meaning: 'three' },
  { hanzi: '四', meaning: 'four' },
  { hanzi: '五', meaning: 'five' },
  { hanzi: '一', meaning: 'duplicate one' },
  { hanzi: '六', meaning: 'six' }
];

const bossEnemy = enemies.eliteTypes.find((enemy) => enemy.id === 'droneSwarmBoss');
assert.ok(bossEnemy, 'Drone Swarm Boss should be defined as a direct-test boss enemy.');
assert.strictEqual(bossEnemy.role, 'boss');
assert.strictEqual(bossEnemy.attackStyle, 'droneSwarm');
assert.strictEqual(bossEnemy.splitPhase?.type, 'droneSwarmBoss');
assert.strictEqual(bossEnemy.splitPhase.count, 5);
assert.strictEqual(bossEnemy.splitPhase.droneHp, 2);
assert.strictEqual(bossEnemy.splitPhase.droneVariants.length, 5);
assert.strictEqual(new Set(bossEnemy.splitPhase.droneVariants.map((variant) => variant.id)).size, 5);
assert.match(bossEnemy.asset.status, /interim-derived-bitmap/);
assert.strictEqual(bossEnemy.asset.promptSpec, 'assets/source/enemy-candidates/drone-swarm-boss-spritesheet.prompt.md');
assert.ok(fs.existsSync(path.join(root, bossEnemy.asset.promptSpec)), 'Drone Swarm Boss final-art prompt spec should exist.');

const debugEntry = enemies.debugTargets.find((target) => target.enemyId === 'droneSwarmBoss');
assert.ok(debugEntry, 'Debug Mode should expose a direct Drone Swarm Boss entry.');
assert.strictEqual(debugEntry.category, 'Boss');
assert.strictEqual(debugEntry.stage % 5, 0, 'Drone Swarm Boss debug entry should use a Boss-stage number.');

const split = droneBoss.createDroneSwarmBossSplitLanes({
  words: sampleWords,
  splitPhase: bossEnemy.splitPhase,
  enemyAttackInterval: 5
});
assert.strictEqual(split.laneStates.length, 5, 'Split phase should create five lane drones.');
assert.strictEqual(split.activeLaneIndex, 0, 'Split phase should start on the top live drone lane.');
assert.deepStrictEqual(split.laneStates.map((lane) => lane.word.hanzi), ['一', '二', '三', '四', '五']);
assert.strictEqual(new Set(split.laneStates.map((lane) => lane.word.hanzi)).size, 5, 'Split drones should get unique Hanzi targets.');
split.laneStates.forEach((lane, index) => {
  assert.strictEqual(lane.active, true, `Drone lane ${index + 1} should be active.`);
  assert.strictEqual(lane.droneBoss, true, `Drone lane ${index + 1} should be marked as a Drone Swarm Boss lane.`);
  assert.strictEqual(lane.enemy.id, `droneSwarmBossDrone${index + 1}`);
  assert.strictEqual(lane.enemy.hp, 2);
  assert.strictEqual(lane.enemy.maxHp, 2);
  assert.strictEqual(lane.enemy.attackInterval, 4);
  assert.strictEqual(lane.enemy.attackStyle, 'droneSwarmLane');
});

assert.strictEqual(droneBoss.getNextLiveDroneLaneIndex(split.laneStates, 0, 1), 1, 'Lane movement should move down one live drone.');
assert.strictEqual(droneBoss.getNextLiveDroneLaneIndex(split.laneStates, 0, -1), 0, 'Lane movement should clamp at the top live drone.');
const skippedLaneStates = split.laneStates.map((lane, index) => index === 2 ? { ...lane, defeated: true, enemy: { ...lane.enemy, hp: 0 } } : lane);
assert.strictEqual(droneBoss.getNextLiveDroneLaneIndex(skippedLaneStates, 1, 1), 3, 'Lane movement should skip defeated drones.');

const damaged = droneBoss.damageDroneSwarmBossLane(split.laneStates, 3, 1, combat.applyDamageToDefender);
assert.strictEqual(damaged.laneStates[3].enemy.hp, 1, 'Damage should route only to the selected drone lane.');
assert.strictEqual(damaged.laneStates[0].enemy.hp, 2, 'Unselected drone lanes should keep their HP.');
assert.strictEqual(damaged.laneStates[3].defeated, false);
const defeated = droneBoss.damageDroneSwarmBossLane(damaged.laneStates, 3, 1, combat.applyDamageToDefender);
assert.strictEqual(defeated.laneStates[3].defeated, true, 'A defeated drone lane should be marked defeated.');
assert.strictEqual(droneBoss.areAllDroneSwarmBossLanesDefeated(defeated.laneStates), false, 'The boss should continue until every split drone is defeated.');
const allDefeated = defeated.laneStates.map((lane) => ({ ...lane, defeated: true, enemy: { ...lane.enemy, hp: 0 } }));
assert.strictEqual(droneBoss.areAllDroneSwarmBossLanesDefeated(allDefeated), true, 'All five defeated drones should clear the split phase.');

const byTexture = Object.fromEntries(assets.importedSpriteTrials.map((entry) => [entry.texture, entry]));
const sheetEntry = byTexture['gallerySheet:droneSwarmBossInterim'];
assert.ok(sheetEntry, 'Asset manifest should record the Drone Swarm Boss interim framesheet.');
assert.strictEqual(sheetEntry.spritesheetPath, 'assets/sprites/enemies/drone-swarm-boss-interim-spritesheet.png');
assert.strictEqual(sheetEntry.artStatus, 'interim-derived-bitmap');
assert.deepStrictEqual(sheetEntry.bossFrames.idle, [0, 1, 2, 3]);
assert.deepStrictEqual(sheetEntry.bossFrames.charge, [4, 5, 6, 7]);
assert.deepStrictEqual(sheetEntry.bossFrames.attack, [8, 9, 10, 11]);
assert.deepStrictEqual(sheetEntry.bossFrames.hit, [12, 13, 14, 15]);
assert.deepStrictEqual(sheetEntry.bossFrames.split, [16, 17, 18, 19]);
assert.deepStrictEqual(sheetEntry.bossFrames.death, [20, 21, 22, 23]);
assert.strictEqual(sheetEntry.individualDroneVariants.length, 5);
const sheetSize = readImage(sheetEntry.spritesheetPath);
assert.strictEqual(sheetSize.width, 1024);
assert.strictEqual(sheetSize.height, 2112);
readImage('assets/sprites/enemies/drone-swarm-boss-interim-preview.png');
bossEnemy.splitPhase.droneVariants.forEach((variant) => {
  assert.match(enemies.enemySpriteMap[variant.id], /\.png$/, `${variant.id} should use interim PNG art in runtime.`);
  const dimensions = readImage(enemies.enemySpriteMap[variant.id]);
  assert.strictEqual(dimensions.width, 256);
  assert.strictEqual(dimensions.height, 192);
});

assert.match(source, /src\/core\/drone-swarm-boss-core\.js/, 'index.html should load the Drone Swarm Boss core module.');
assert.match(source, /HanziTankDroneSwarmBoss/, 'Runtime should import Drone Swarm Boss helpers from the UMD core.');

const isMultiLaneStage = bodyOf('isMultiLaneStage');
assert.match(isMultiLaneStage, /isDroneSwarmBossSplitActive\(\)[\s\S]*return true/, 'Split phase should enable the multi-lane battlefield even in direct debug.');

const startSplit = bodyOf('startDroneSwarmBossSplitPhase');
assert.match(startSplit, /createDroneSwarmBossSplitLanes/, 'Runtime should build split lanes through the core helper.');
assert.match(startSplit, /laneStates = split\.laneStates/, 'Runtime should adopt the five split lane states.');
assert.match(startSplit, /renderMultiLaneQuestion\(\{ preserveAdvance: false \}\)/, 'Split phase should immediately enter lane combat.');

const renderLaneLayer = bodyOf('renderLaneLayer');
assert.match(renderLaneLayer, /isDroneSwarmBossSplitActive\(\)/, 'Lane rendering should preserve boss split lanes instead of recreating normal lanes.');

const syncLaneHud = bodyOf('syncLaneHud');
assert.match(syncLaneHud, /drone-boss-lane/, 'Split drones should get a dedicated lane CSS state.');
assert.match(syncLaneHud, /lane\.attackLabel/, 'Split drone HUD should show attack countdown or defeated state.');

const chooseAnswer = bodyOf('chooseAnswer');
assert.match(chooseAnswer, /shouldStartDroneSwarmBossSplit\(\)[\s\S]*startDroneSwarmBossSplitPhase\(\)/, 'First Drone Swarm Boss defeat should start split phase instead of completing the stage.');

const chooseMultiLaneAnswer = bodyOf('chooseMultiLaneAnswer');
assert.match(chooseMultiLaneAnswer, /damageDroneSwarmBossLane\(laneStates, activeLaneIndex, shotDamage, applyDamageToDefender\)/, 'Correct split-lane answers should damage only the selected drone.');
assert.match(chooseMultiLaneAnswer, /areAllDroneSwarmBossLanesDefeated\(laneStates\)[\s\S]*completeLevel\(\)/, 'Stage should complete only after all five split drones are defeated.');

const completeLevel = bodyOf('completeLevel');
assert.match(completeLevel, /shouldShowSupplyChallenge\(levelNumber\)/, 'Drone Swarm Boss completion should preserve the normal no-War-Supply gate.');

console.log('drone swarm boss regression tests passed');
