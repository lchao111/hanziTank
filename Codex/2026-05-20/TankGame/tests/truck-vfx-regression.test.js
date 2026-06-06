const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');
const enemies = require('../src/data/enemies.js');
const assets = require('../src/data/asset-manifest.js');

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

const importedByTexture = Object.fromEntries(assets.importedSpriteTrials.map((entry) => [entry.texture, entry]));
const truck = [...enemies.levelTypes, ...enemies.eliteTypes].find((enemy) => enemy.id === 'truck');

assert.ok(truck, 'Self-Destruct Truck should remain registered as the truck enemy.');
assert.strictEqual(truck.asset.status, 'interim-derived-bitmap-pending-final-generation');
assert.strictEqual(truck.asset.runtimeSpritesheet, 'assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png');
assert.strictEqual(truck.asset.explosionSpritesheet, 'assets/sprites/effects/self-destruct-truck-explosion-interim-spritesheet.png');
assert.deepStrictEqual(truck.asset.frames.reloadWarning, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(truck.asset.frames.charge, [12, 13, 14, 15, 16, 17]);
assert.deepStrictEqual(truck.asset.frames.hitSmokeJolt, [18, 19, 20]);
assert.deepStrictEqual(truck.asset.frames.explosionWindup, [21, 22, 23]);
assert.deepStrictEqual(truck.asset.frames.destroyed, [24, 25, 26, 27, 28, 29]);

const galleryPreview = enemies.enemyGalleryPreviewMap.truck;
assert.strictEqual(galleryPreview.cardArt, 'assets/sprites/enemies/gallery/self-destruct-truck-interim-preview.png');
assert.strictEqual(galleryPreview.sheet, 'selfDestructTruckInterim');
assert.strictEqual(galleryPreview.artStatus, 'interim-derived-bitmap-pending-final-generation');
assert.doesNotMatch(galleryPreview.cardArt, /\.svg(?:\?|$)/);

const gallerySheet = enemies.enemyGallerySpriteSheets.selfDestructTruckInterim;
assert.strictEqual(gallerySheet.url.split('?')[0], 'assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png');
assert.strictEqual(gallerySheet.frameWidth, 469);
assert.strictEqual(gallerySheet.frameHeight, 300);
assert.strictEqual(gallerySheet.columns, 6);

const runtimeManifest = importedByTexture.selfDestructTruckBattle;
assert.strictEqual(runtimeManifest.artStatus, 'interim-derived-bitmap-pending-final-generation');
assert.strictEqual(runtimeManifest.spritesheetPath, 'assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png');
assert.deepStrictEqual(runtimeManifest.reloadWarningFrames, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(runtimeManifest.chargeFrames, [12, 13, 14, 15, 16, 17]);
assert.deepStrictEqual(runtimeManifest.hitFrames, [18, 19, 20]);
assert.deepStrictEqual(runtimeManifest.explosionWindupFrames, [21, 22, 23]);
assert.deepStrictEqual(runtimeManifest.destroyedFrames, [24, 25, 26, 27, 28, 29]);
assert.match(runtimeManifest.license, /derived_self_destruct_truck_interim_LICENSE/);

const explosionManifest = importedByTexture.selfDestructTruckExplosion;
assert.strictEqual(explosionManifest.artStatus, 'interim-derived-bitmap-pending-final-generation');
assert.strictEqual(explosionManifest.spritesheetPath, 'assets/sprites/effects/self-destruct-truck-explosion-interim-spritesheet.png');
assert.deepStrictEqual(explosionManifest.effectFrames, [0, 1, 2, 3, 4, 5, 6, 7]);

{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', runtimeManifest.spritesheetPath)));
  assert.strictEqual(dimensions.width, 2814);
  assert.strictEqual(dimensions.height, 1500);
}
{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', explosionManifest.spritesheetPath)));
  assert.strictEqual(dimensions.width, 1280);
  assert.strictEqual(dimensions.height, 384);
}
{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', galleryPreview.cardArt)));
  assert.strictEqual(dimensions.width, 256);
  assert.strictEqual(dimensions.height, 192);
}

const initPhaserEffects = bodyOf('initPhaserEffects');
assert.match(initPhaserEffects, /this\.load\.spritesheet\("selfDestructTruckBattle"/, 'Phaser should preload the truck runtime spritesheet.');
assert.match(initPhaserEffects, /self-destruct-truck-interim-spritesheet\.png\?v=20260530[\s\S]*frameWidth: 469[\s\S]*frameHeight: 300/, 'Truck runtime spritesheet should use fixed 469x300 frames.');
assert.match(initPhaserEffects, /this\.load\.spritesheet\("selfDestructTruckExplosion"/, 'Phaser should preload the truck explosion spritesheet.');
assert.match(initPhaserEffects, /self-destruct-truck-explosion-interim-spritesheet\.png\?v=20260530[\s\S]*frameWidth: 320[\s\S]*frameHeight: 192/, 'Truck explosion spritesheet should use fixed 320x192 frames.');

const truckBuilder = bodyOf('buildPhaserSelfDestructTruck');
assert.match(truckBuilder, /scene\.textures\.exists\("selfDestructTruckBattle"\)/, 'Truck builder should verify runtime texture availability.');
assert.match(truckBuilder, /generateFrameNumbers\("selfDestructTruckBattle", \{ start: 6, end: 11 \}\)/, 'Truck reload warning should use row 2 frames.');
assert.match(truckBuilder, /generateFrameNumbers\("selfDestructTruckBattle", \{ start: 12, end: 17 \}\)/, 'Truck charge should use row 3 frames.');
assert.match(truckBuilder, /generateFrameNumbers\("selfDestructTruckBattle", \{ start: 18, end: 20 \}\)/, 'Truck hit reaction should use smoke-jolt frames.');
assert.match(truckBuilder, /generateFrameNumbers\("selfDestructTruckBattle", \{ start: 21, end: 23 \}\)/, 'Truck wind-up should use dedicated frames.');
assert.match(truckBuilder, /generateFrameNumbers\("selfDestructTruckBattle", \{ start: 24, end: 29 \}\)/, 'Truck destruction should use debris/smoke frames.');
assert.match(truckBuilder, /generateFrameNumbers\("selfDestructTruckExplosion", \{ start: 0, end: 7 \}\)/, 'Truck explosion should use all VFX frames.');

const truckUpdater = bodyOf('updatePhaserSelfDestructTruck');
assert.match(truckUpdater, /currentEnemy\.id === "truck"/, 'Truck Phaser actor should only appear for truck enemies.');
assert.match(truckUpdater, /phaser-self-destruct-truck-active/, 'Truck DOM fallback should be hidden while Phaser truck is active.');
assert.match(truckUpdater, /setDisplaySize\(rect\.width \* 1\.34, rect\.height \* 0\.96\)/, 'Truck should scale from the current enemy slot.');

const reloadTelegraph = bodyOf('playEnemyReloadTelegraph');
assert.match(reloadTelegraph, /enemy\.telegraph === "rushWarning"[\s\S]*playPhaserSelfDestructTruckState\("warning", \{ loop: true \}\)/, 'Reload telegraph should play the truck warning row.');

const enemyHitReaction = bodyOf('playEnemyHitReaction');
assert.match(enemyHitReaction, /currentEnemy\.id === "truck"\) playPhaserSelfDestructTruckState\("hit"\)/, 'Damage should play the truck hit/smoke-jolt frames.');

const truckCrash = bodyOf('truckCrashAttack');
assert.match(truckCrash, /playPhaserSelfDestructTruckState\("charge", \{ loop: true \}\)/, 'Truck crash should play charge frames.');
assert.match(truckCrash, /playPhaserSelfDestructTruckState\("windup"\)/, 'Truck crash should play wind-up frames before impact.');
assert.match(truckCrash, /playPhaserSelfDestructTruckExplosion\(playerTank/, 'Truck crash impact should layer the dedicated explosion VFX.');

const truckExplosion = bodyOf('playPhaserSelfDestructTruckExplosion');
assert.match(truckExplosion, /scene\.add\.sprite\(x, y, "selfDestructTruckExplosion", 0\)/, 'Truck explosion should instantiate a spritesheet VFX sprite.');
assert.match(truckExplosion, /blast\.play\("self-destruct-truck-explosion", true\)/, 'Truck explosion should animate the VFX sheet.');

const deathVfx = bodyOf('playEnemyDeathVfx');
assert.match(deathVfx, /playPhaserSelfDestructTruckState\("destroyed"/, 'Truck death should hold the destroyed debris/smoke row.');

console.log('truck VFX regression tests passed');
