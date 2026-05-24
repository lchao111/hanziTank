const assert = require('assert');
const enemies = require('../src/data/enemies.js');

assert.strictEqual(enemies.levelTypes.length, 7, 'Regular enemy cycle should keep 7 enemy types.');
assert.deepStrictEqual(enemies.levelTypes.map((enemy) => enemy.id), [
  'tank',
  'infantry',
  'armor',
  'heavyInfantry',
  'truck',
  'rpgInfantry',
  'scout'
]);

assert.strictEqual(enemies.bossTemplate.id, 'boss');
assert.strictEqual(enemies.bossTemplate.name, 'Tank Dismantler');
assert.strictEqual(enemies.bossTemplate.armor, 5);
assert.strictEqual(enemies.bossTemplate.sprite, 'assets/enemy-boss-dismantler.svg');

assert.strictEqual(enemies.enemySpriteMap.truck, 'assets/enemy-suicide-truck.svg');
assert.strictEqual(enemies.enemySpriteMap.rpgInfantry, 'assets/enemy-rpg-infantry.svg');
assert.strictEqual(enemies.tankSpriteMap.tank_sherman, 'assets/tank-sherman.svg');
assert.strictEqual(enemies.enemyPortraitDetails.boss, 'Boss portrait for the Tank Dismantler hammer fight.');

assert.ok(enemies.debugTargets.some((target) => target.stage === 5 && target.title.includes('Boss')), 'Debug targets should include a boss battle.');
assert.ok(enemies.debugTargets.some((target) => target.stage === 12 && target.title === 'Self-Destruct Truck'), 'Debug targets should include the self-destruct truck.');

console.log('enemies core tests passed');
