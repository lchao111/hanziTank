const assert = require('assert');
const combat = require('../src/core/combat-core.js');
const enemies = require('../src/data/enemies.js');

const stage1 = combat.createEnemyForStage(1, enemies.levelTypes, enemies.bossTemplate);
assert.strictEqual(stage1.id, 'tank');
assert.strictEqual(stage1.hp, 1);
assert.strictEqual(stage1.maxHp, 1);
assert.strictEqual(stage1.attackInterval, 5);

const stage2 = combat.createEnemyForStage(2, enemies.levelTypes, enemies.bossTemplate);
assert.strictEqual(stage2.id, 'infantry');
assert.strictEqual(stage2.name, 'Regular Soldier');
assert.strictEqual(stage2.attackInterval, 4, 'Stage 2 should create first-injury pressure with a shorter timer.');

const stage3 = combat.createEnemyForStage(3, enemies.levelTypes, enemies.bossTemplate);
assert.strictEqual(stage3.id, 'armor');
assert.strictEqual(stage3.absoluteDefense, 1, 'Stage 3 should be the shield tutorial enemy.');

const stage4 = combat.createEnemyForStage(4, enemies.levelTypes, enemies.bossTemplate);
assert.strictEqual(stage4.id, 'grenadier');
assert.strictEqual(stage4.damage, 2, 'Stage 4 grenadier should deal 2 damage.');
assert.strictEqual(stage4.attackInterval, 3, 'Stage 4 should be the fast enemy.');

const stage8 = combat.createEnemyForStage(8, enemies.levelTypes, enemies.bossTemplate);
assert.strictEqual(stage8.id, 'tank');
assert.strictEqual(stage8.hp, 2, 'Regular enemies should gain HP after each full enemy cycle.');
assert.strictEqual(stage8.maxHp, 2);

const boss = combat.createEnemyForStage(10, enemies.levelTypes, enemies.bossTemplate);
assert.strictEqual(boss.id, 'boss');
assert.strictEqual(boss.hp, 1, 'Boss HP should not receive regular enemy HP bonus.');
assert.strictEqual(boss.armor, 5);
assert.strictEqual(boss.maxArmor, 5);

const springSoldier = combat.createEnemyById('springSoldier', enemies.levelTypes, enemies.bossTemplate, enemies.eliteTypes, 21);
assert.strictEqual(springSoldier.id, 'springSoldier');
assert.strictEqual(springSoldier.hp, 2, 'Direct elite debug enemies should use their balanced base HP.');
assert.strictEqual(springSoldier.maxHp, 2);
assert.strictEqual(springSoldier.attackStyle, 'springHop');
assert.strictEqual(springSoldier.attackInterval, 4);
assert.strictEqual(springSoldier.deathVfx, 'springScatter');

const directTruck = combat.createEnemyById('truck', enemies.levelTypes, enemies.bossTemplate, enemies.eliteTypes, 12);
assert.strictEqual(directTruck.id, 'truck');
assert.strictEqual(directTruck.attackStyle, 'selfDestruct');
assert.strictEqual(directTruck.damage, 2);

const unknownDirectEnemy = combat.createEnemyById('missingEnemy', enemies.levelTypes, enemies.bossTemplate, enemies.eliteTypes, 3);
assert.strictEqual(unknownDirectEnemy.id, 'armor', 'Unknown direct enemy ids should fall back to normal stage creation.');

const absolute = combat.applyDamageToDefender({ hp: 2, armor: 3, absoluteDefense: 1 }, 99);
assert.deepStrictEqual(absolute.result, { absoluteBlocked: true, armorDamage: 0, hpDamage: 0, totalDamage: 0 });
assert.strictEqual(absolute.defender.absoluteDefense, 0);
assert.strictEqual(absolute.defender.hp, 2);
assert.strictEqual(absolute.defender.armor, 3);

const armored = combat.applyDamageToDefender({ hp: 4, armor: 2, absoluteDefense: 0 }, 5);
assert.deepStrictEqual(armored.result, { absoluteBlocked: false, armorDamage: 2, hpDamage: 3, totalDamage: 5 });
assert.strictEqual(armored.defender.hp, 1);
assert.strictEqual(armored.defender.armor, 0);

const playerBlocked = combat.applyPlayerDamage({ lives: 3, armor: 2, absoluteDefense: 1 }, 7);
assert.deepStrictEqual(playerBlocked.result, { absoluteBlocked: true, armorDamage: 0, hpDamage: 0, totalDamage: 0 });
assert.deepStrictEqual(playerBlocked.state, { lives: 3, armor: 2, absoluteDefense: 0 });

const playerDamaged = combat.applyPlayerDamage({ lives: 3, armor: 1, absoluteDefense: 0 }, 3);
assert.deepStrictEqual(playerDamaged.result, { absoluteBlocked: false, armorDamage: 1, hpDamage: 2, totalDamage: 3 });
assert.deepStrictEqual(playerDamaged.state, { lives: 1, armor: 0, absoluteDefense: 0 });

assert.strictEqual(combat.getShotDamage(1, null), 1);
assert.strictEqual(combat.getShotDamage(1, { damageBonus: 2 }), 3);

console.log('combat core tests passed');
