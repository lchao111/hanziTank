const assert = require('assert');
const enemies = require('../src/data/enemies.js');

assert.strictEqual(enemies.levelTypes.length, 7, 'Regular enemy cycle should keep 7 enemy types.');
assert.deepStrictEqual(enemies.levelTypes.map((enemy) => enemy.id), [
  'tank',
  'infantry',
  'armor',
  'scout',
  'truck',
  'rpgInfantry',
  'heavyInfantry'
]);

assert.strictEqual(enemies.bossTemplate.id, 'boss');
assert.strictEqual(enemies.bossTemplate.name, 'Tank Dismantler');
assert.strictEqual(enemies.bossTemplate.armor, 5);
assert.strictEqual(enemies.bossTemplate.attackStyle, 'melee');
assert.strictEqual(enemies.bossTemplate.approachDistance, 150);
assert.strictEqual(enemies.bossTemplate.sprite, 'assets/enemy-boss-dismantler.svg');
assert.match(enemies.bossTemplate.intro, /Stage 5 Boss/, 'Boss intro should frame the first boss as the stage 5 milestone.');
assert.match(enemies.bossTemplate.intro, /Listen to one Hanzi/, 'Boss intro should describe the single-Hanzi listening challenge.');

assert.match(enemies.levelTypes[0].intro, /Stage 1 drill/, 'Stage 1 should introduce basic matching feedback.');
assert.match(enemies.levelTypes[1].intro, /Stage 2 drill/, 'Stage 2 should introduce harder Hanzi pressure.');
assert.strictEqual(enemies.levelTypes[1].attackInterval, 4, 'Stage 2 pressure enemy should attack sooner than the baseline timer.');
assert.match(enemies.levelTypes[2].intro, /Stage 3 drill/, 'Stage 3 should introduce defense breaking.');
assert.strictEqual(enemies.levelTypes[2].absoluteDefense, 1, 'Stage 3 should include shield mechanics.');
assert.match(enemies.levelTypes[3].intro, /Stage 4 drill/, 'Stage 4 should introduce fast enemy pressure.');
assert.strictEqual(enemies.levelTypes[3].id, 'scout', 'Stage 4 should be the fast scout enemy.');
assert.strictEqual(enemies.levelTypes[3].attackInterval, 3, 'Stage 4 scout should use a shorter attack timer.');

assert.strictEqual(enemies.levelTypes.find((enemy) => enemy.id === 'heavyInfantry').attackStyle, 'melee');
assert.strictEqual(enemies.levelTypes.find((enemy) => enemy.id === 'truck').attackStyle, 'melee');

assert.strictEqual(enemies.enemySpriteMap.truck, 'assets/enemy-suicide-truck.svg');
assert.strictEqual(enemies.enemySpriteMap.rpgInfantry, 'assets/enemy-rpg-infantry.svg');
assert.strictEqual(enemies.tankSpriteMap.tank_sherman, 'assets/tank-sherman.svg');
assert.strictEqual(enemies.enemyPortraitDetails.boss, 'Boss portrait for the Tank Dismantler hammer fight.');

assert.ok(enemies.debugTargets.some((target) => target.stage === 5 && target.title.includes('Boss')), 'Debug targets should include a boss battle.');
assert.ok(enemies.debugTargets.some((target) => target.stage === 12 && target.title === 'Self-Destruct Truck'), 'Debug targets should include the self-destruct truck.');

console.log('enemies core tests passed');
