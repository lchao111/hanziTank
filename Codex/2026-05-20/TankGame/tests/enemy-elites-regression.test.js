const assert = require('assert');
const fs = require('fs');
const path = require('path');
const enemies = require('../src/data/enemies.js');

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

const requiredEnemies = [
  ['truck', enemies.levelTypes.find((enemy) => enemy.id === 'truck')],
  ...enemies.eliteTypes.map((enemy) => [enemy.id, enemy])
];

requiredEnemies.forEach(([id, enemy]) => {
  assert.ok(enemy, `${id} should exist.`);
  assert.ok(enemy.attackStyle, `${id} should have an attack style.`);
  assert.ok(enemy.telegraph, `${id} should have a telegraph key.`);
  assert.ok(enemy.attackTiming, `${id} should have attack timing metadata.`);
  assert.ok(enemy.hitReaction, `${id} should have hit reaction metadata.`);
  assert.ok(enemy.deathVfx, `${id} should have destruction VFX metadata.`);
  assert.ok(enemy.asset?.promptSpec, `${id} should have a pending-art prompt spec.`);
  assert.ok(fs.existsSync(path.join(root, enemy.asset.promptSpec)), `${id} prompt spec should exist.`);
});

assert.match(source, /eliteTypes = \[\]/, 'Runtime should read eliteTypes from enemy data.');
assert.match(source, /createEnemyById: createCombatEnemyById/, 'Runtime should import direct enemy creation for debug targets.');

const createEnemy = bodyOf('createEnemy');
assert.match(createEnemy, /debugSingleEnemyId[\s\S]*createCombatEnemyById\(debugSingleEnemyId, levelTypes, bossTemplate, eliteTypes, number\)/, 'Debug direct enemy ids should instantiate through combat-core.');

const isMultiLaneStage = bodyOf('isMultiLaneStage');
assert.match(isMultiLaneStage, /if \(debugSingleEnemyId\) return false/, 'Direct elite debug targets should use the single-enemy battlefield.');

const renderDebugTargets = bodyOf('renderDebugTargets');
assert.match(renderDebugTargets, /data-debug-enemy-id="\$\{target\.enemyId \|\| ""\}"/, 'Debug target cards should carry direct enemy ids.');
assert.match(renderDebugTargets, /target\.category \|\| "Stage"/, 'Debug target cards should show whether the entry is an Enemy, Boss, or Elite.');

const startDebugBattle = bodyOf('startDebugBattle');
assert.match(source, /function startDebugBattle\(stage, enemyId = ""\)/, 'Debug battle should accept a direct enemy id.');
assert.match(startDebugBattle, /debugSingleEnemyId = enemyId \|\| ""/, 'Debug battle should store the direct enemy id.');
assert.match(startDebugBattle, /trainedStage = debugSingleEnemyId \? stage : 0/, 'Direct elite debug battles should skip training and enter battle directly.');

const debugEnemyIds = enemies.debugTargets.map((target) => target.enemyId).filter(Boolean);
enemies.levelTypes.forEach((enemy) => {
  assert.ok(debugEnemyIds.includes(enemy.id), `Debug mode should directly expose ${enemy.id}.`);
});
enemies.eliteTypes.forEach((enemy) => {
  assert.ok(debugEnemyIds.includes(enemy.id), `Debug mode should directly expose ${enemy.id}.`);
});
assert.ok(enemies.debugTargets.filter((target) => target.enemyId === 'boss').length >= 3, 'Debug mode should expose several Boss checkpoints for hand testing.');

const enemyFire = bodyOf('enemyFire');
assert.match(enemyFire, /currentEnemy\.attackStyle === "springHop"[\s\S]*springSoldierBounceAttack/, 'Spring Soldier should route to its bounce attack.');
assert.match(enemyFire, /currentEnemy\.attackStyle === "droneSwarm"[\s\S]*droneSwarmVolleyAttack/, 'Drone Swarm should route to its volley attack.');
assert.match(enemyFire, /currentEnemy\.attackStyle === "wolfPack"[\s\S]*wolfPackPounceAttack/, 'Wolf Pack should route to its pack pounce.');
assert.match(enemyFire, /currentEnemy\.attackStyle === "fleaHop"[\s\S]*mechanicalFleaHopAttack/, 'Mechanical Fleas should route to rapid hop attack.');

const showDamage = bodyOf('showDamage');
assert.match(showDamage, /playEnemyHitReaction\(targetTank, options\)/, 'Enemy hits should route through unique hit reactions.');

const hitReaction = bodyOf('playEnemyHitReaction');
assert.match(hitReaction, /elasticRecoil[\s\S]*playPhaserElasticRecoil/, 'Spring Soldier should use elastic recoil on hit.');
assert.match(hitReaction, /emStun[\s\S]*playPhaserEmStun/, 'Drone Swarm should use EM stun on hit.');
assert.match(hitReaction, /metalSparks[\s\S]*playPhaserMetalSparks/, 'Wolf Pack should throw metal sparks on hit.');
assert.match(hitReaction, /squishSpark[\s\S]*playPhaserFleaSquish/, 'Mechanical Fleas should squish/spark on hit.');
assert.match(hitReaction, /smokeJolt[\s\S]*playPhaserTruckSmokeJolt/, 'Self-Destruct Truck should smoke-jolt on hit.');

const deathVfx = bodyOf('playEnemyDeathVfx');
assert.match(deathVfx, /selfDestructDebris[\s\S]*playPhaserSelfDestructDebris/, 'Truck death should add self-destruct debris.');
assert.match(deathVfx, /springScatter[\s\S]*playPhaserSpringScatter/, 'Spring Soldier death should scatter springs.');
assert.match(deathVfx, /swarmDispersal[\s\S]*playPhaserSwarmDispersal/, 'Drone Swarm death should disperse drones.');
assert.match(deathVfx, /packBreakApart[\s\S]*playPhaserPackBreakApart/, 'Wolf Pack death should break apart.');
assert.match(deathVfx, /popBurst[\s\S]*playPhaserFleaPopBurst/, 'Mechanical Fleas death should pop.');

['springSoldierBounceAttack', 'droneSwarmVolleyAttack', 'wolfPackPounceAttack', 'mechanicalFleaHopAttack'].forEach((functionName) => {
  assert.match(bodyOf(functionName), /renderEnemyAttackImpact/, `${functionName} should resolve damage through the shared readable impact helper.`);
});

assert.match(source, /spring-bounce-attack/, 'Spring Soldier should have a DOM attack class.');
assert.match(source, /swarm-volley/, 'Drone Swarm should have a DOM attack class.');
assert.match(source, /pack-pounce/, 'Wolf Pack should have a DOM attack class.');
assert.match(source, /flea-burst-attack/, 'Mechanical Fleas should have a DOM attack class.');

console.log('enemy elites regression tests passed');
