const assert = require('assert');
const enemies = require('../src/data/enemies.js');

assert.strictEqual(enemies.levelTypes.length, 7, 'Regular enemy cycle should keep 7 enemy types.');
assert.deepStrictEqual(enemies.levelTypes.map((enemy) => enemy.id), [
  'tank',
  'infantry',
  'armor',
  'grenadier',
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
assert.strictEqual(enemies.levelTypes[1].name, 'Regular Soldier', 'Stage 2 should use the regular soldier enemy.');
assert.strictEqual(enemies.levelTypes[1].attackInterval, 4, 'Stage 2 pressure enemy should attack sooner than the baseline timer.');
assert.match(enemies.levelTypes[2].intro, /Stage 3 drill/, 'Stage 3 should introduce defense breaking.');
assert.strictEqual(enemies.levelTypes[2].absoluteDefense, 1, 'Stage 3 should include shield mechanics.');
assert.match(enemies.levelTypes[3].intro, /Stage 4 drill/, 'Stage 4 should introduce grenadier pressure.');
assert.strictEqual(enemies.levelTypes[3].id, 'grenadier', 'Stage 4 should be the grenadier enemy.');
assert.strictEqual(enemies.levelTypes[3].damage, 2, 'Stage 4 grenadier should deal 2 damage.');
assert.strictEqual(enemies.levelTypes[3].attackInterval, 3, 'Stage 4 grenadier should use a shorter attack timer.');

assert.strictEqual(enemies.levelTypes.find((enemy) => enemy.id === 'heavyInfantry').attackStyle, 'melee');
const truck = enemies.levelTypes.find((enemy) => enemy.id === 'truck');
assert.strictEqual(truck.attackStyle, 'selfDestruct');
assert.strictEqual(truck.telegraph, 'rushWarning');
assert.strictEqual(truck.deathVfx, 'selfDestructDebris');
assert.strictEqual(truck.asset.runtimeSpritesheet, 'assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png');
assert.strictEqual(truck.asset.explosionSpritesheet, 'assets/sprites/effects/self-destruct-truck-explosion-interim-spritesheet.png');
assert.deepStrictEqual(truck.asset.frames.idle, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(truck.asset.frames.reloadWarning, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(truck.asset.frames.charge, [12, 13, 14, 15, 16, 17]);
assert.deepStrictEqual(truck.asset.frames.hitSmokeJolt, [18, 19, 20]);
assert.deepStrictEqual(truck.asset.frames.explosionWindup, [21, 22, 23]);
assert.deepStrictEqual(truck.asset.frames.destroyed, [24, 25, 26, 27, 28, 29]);

assert.deepStrictEqual(enemies.eliteTypes.map((enemy) => enemy.id), [
  'springSoldier',
  'droneSwarm',
  'droneSwarmBoss',
  'bouncingTankBoss',
  'wolfPack',
  'mechanicalFleas'
]);
enemies.eliteTypes.forEach((enemy) => {
  assert.ok(enemy.attackStyle, `${enemy.id} should define an attack style.`);
  assert.ok(enemy.telegraph, `${enemy.id} should define a telegraph.`);
  assert.ok(enemy.attackTiming, `${enemy.id} should define attack timing.`);
  assert.ok(enemy.hitReaction, `${enemy.id} should define a hit reaction.`);
  assert.ok(enemy.deathVfx, `${enemy.id} should define destruction VFX.`);
  if (enemy.id === 'bouncingTankBoss') {
    assert.match(enemy.asset.status, /user-provided-bitmap/, `${enemy.id} should record its user-provided bitmap source.`);
  } else {
    assert.match(enemy.asset.status, /pending-final-generation/, `${enemy.id} should not claim final bitmap art.`);
  }
  assert.match(enemy.asset.promptSpec, /^assets\/source\/enemy-candidates\//, `${enemy.id} should point to an enemy prompt spec.`);
  assert.match(enemy.asset.galleryPreview || enemy.asset.runtimePreview, /^assets\/sprites\/enemies\/(?:gallery\/)?.+\.png$/, `${enemy.id} should expose an interim PNG preview.`);
});

assert.strictEqual(enemies.enemySpriteMap.truck, 'assets/sprites/enemies/gallery/self-destruct-truck-interim-preview.png');
assert.doesNotMatch(enemies.enemySpriteMap.truck, /\.svg$/);
assert.strictEqual(enemies.enemySpriteMap.springSoldier, 'assets/enemy-heavy-infantry.svg');
assert.strictEqual(enemies.enemySpriteMap.droneSwarm, 'assets/enemy-scout.svg');
assert.strictEqual(enemies.enemySpriteMap.droneSwarmBoss, 'assets/sprites/enemies/drone-swarm-boss-interim-preview.png');
assert.strictEqual(enemies.enemySpriteMap.bouncingTankBoss, 'assets/sprites/enemies/gallery/bouncing-tank-boss-preview.png');
assert.strictEqual(enemies.enemySpriteMap.droneSwarmBossDrone1, 'assets/sprites/enemies/drone-swarm-boss-drone-1.png');
assert.strictEqual(enemies.enemySpriteMap.wolfPack, 'assets/enemy-armor.svg');
assert.strictEqual(enemies.enemySpriteMap.mechanicalFleas, 'assets/enemy-scout.svg');
assert.strictEqual(enemies.enemySpriteMap.infantry, 'assets/enemy-infantry.svg');
assert.strictEqual(enemies.enemySpriteMap.grenadier, 'assets/enemy-rpg-infantry.svg');
assert.strictEqual(enemies.enemySpriteMap.rpgInfantry, 'assets/enemy-rpg-infantry.svg');
assert.strictEqual(enemies.tankSpriteMap.tank_sherman, 'assets/tank-sherman.svg');
assert.match(enemies.enemyPortraitDetails.boss, /Boss portrait for the Tank Dismantler hammer fight\./);
assert.match(enemies.enemyPortraitDetails.boss, /坦克拆解者铁锤 Boss 战头像/);
assert.ok(enemies.enemyGalleryPreviewMap.truck.cardArt.endsWith('.png'), 'Truck gallery card art should be bitmap-backed.');
assert.ok(enemies.enemyGalleryPreviewMap.boss.cardArt.endsWith('.png'), 'Boss gallery card art should be bitmap-backed.');

const bouncingTankBoss = enemies.eliteTypes.find((enemy) => enemy.id === 'bouncingTankBoss');
assert.strictEqual(bouncingTankBoss.name, 'Bouncing Tank Boss');
assert.strictEqual(bouncingTankBoss.hp, 10);
assert.strictEqual(bouncingTankBoss.role, 'boss');
assert.strictEqual(bouncingTankBoss.attackStyle, 'bouncingDodge');
assert.strictEqual(bouncingTankBoss.bossMechanic.type, 'bouncingTankBoss');
assert.strictEqual(bouncingTankBoss.bossMechanic.dodgesUntilMalfunction, 3);
assert.strictEqual(bouncingTankBoss.asset.runtimeSpritesheet, 'assets/sprites/enemies/bouncing-tank-boss-spritesheet.png');
assert.strictEqual(bouncingTankBoss.asset.galleryPreview, 'assets/sprites/enemies/gallery/bouncing-tank-boss-preview.png');
assert.deepStrictEqual(bouncingTankBoss.asset.frames.malfunctionSpark, [21, 22, 23]);
assert.deepStrictEqual(bouncingTankBoss.asset.frames.destroyed, [24, 25, 26, 27, 28, 29]);
assert.strictEqual(enemies.enemyGallerySpriteSheets.bouncingTankBoss.frameWidth, 469);
assert.strictEqual(enemies.enemyGallerySpriteSheets.bouncingTankBoss.frameHeight, 300);
assert.strictEqual(enemies.enemyGalleryPreviewMap.bouncingTankBoss.sheet, 'bouncingTankBoss');
assert.match(enemies.enemyPortraitDetails.bouncingTankBoss, /dodges three attacks/i);

const debugEnemyIds = enemies.debugTargets.map((target) => target.enemyId).filter(Boolean);
enemies.levelTypes.forEach((enemy) => {
  assert.ok(debugEnemyIds.includes(enemy.id), `Debug targets should include direct ${enemy.id} testing.`);
});
enemies.eliteTypes.forEach((enemy) => {
  assert.ok(debugEnemyIds.includes(enemy.id), `Debug targets should include direct ${enemy.id} testing.`);
});
assert.ok(enemies.debugTargets.filter((target) => target.enemyId === 'boss').length >= 3, 'Debug targets should include multiple direct Boss checkpoints.');
assert.ok(enemies.debugTargets.some((target) => target.enemyId === 'bouncingTankBoss' && target.category === 'Boss'), 'Debug targets should include direct Bouncing Tank Boss testing.');
assert.ok(enemies.debugTargets.every((target) => target.category), 'Debug targets should label Enemy, Boss, or Elite cards.');
assert.ok(enemies.debugTargets.every((target) => target.enemyId), 'Every debug target should directly choose a test enemy.');
assert.ok(!enemies.debugTargets.some((target) => /Scout Car/.test(target.title)), 'Debug targets should not advertise enemies that are not in data.');

console.log('enemies core tests passed');
