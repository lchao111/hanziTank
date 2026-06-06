const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');
const enemies = require('../src/data/enemies.js');
const assets = require('../src/data/asset-manifest.js');

function assetPath(relativePath) {
  return path.join(__dirname, '..', relativePath.split('?')[0]);
}

function assertPngAsset(relativePath, width, height, label) {
  assert.ok(relativePath, `${label} should define a preview asset path.`);
  assert.match(relativePath, /\.png(?:\?|$)/, `${label} should use PNG bitmap art.`);
  assert.doesNotMatch(relativePath, /\.svg(?:\?|$)/, `${label} should not use SVG art.`);
  const fullPath = assetPath(relativePath);
  assert.ok(fs.existsSync(fullPath), `${label} file should exist: ${relativePath}`);
  const dimensions = imageSize(fs.readFileSync(fullPath));
  if (typeof width === 'number') assert.strictEqual(dimensions.width, width, `${label} width should match manifest.`);
  if (typeof height === 'number') assert.strictEqual(dimensions.height, height, `${label} height should match manifest.`);
}

const allGalleryEnemyIds = [
  ...enemies.levelTypes.map((enemy) => enemy.id),
  ...enemies.eliteTypes.map((enemy) => enemy.id),
  'boss'
];

assert.ok(enemies.enemyGalleryPreviewMap, 'Enemy data should export a durable gallery preview map.');
assert.ok(enemies.enemyGallerySpriteSheets, 'Enemy data should export gallery spritesheet metadata.');

const manifestCardsByEnemyId = new Map(
  assets.importedSpriteTrials
    .filter((entry) => entry.texture && entry.texture.startsWith('css:enemy-gallery-card-'))
    .map((entry) => [entry.enemyId, entry])
);

allGalleryEnemyIds.forEach((enemyId) => {
  const preview = enemies.enemyGalleryPreviewMap[enemyId];
  assert.ok(preview, `${enemyId} should have a gallery preview mapping.`);
  assertPngAsset(preview.cardArt, 256, 192, `${enemyId} card art`);

  const manifestEntry = manifestCardsByEnemyId.get(enemyId);
  assert.ok(manifestEntry, `${enemyId} card art should be recorded in the asset manifest.`);
  assert.strictEqual(manifestEntry.imagePath, preview.cardArt, `${enemyId} manifest should match preview map card art.`);
  assert.strictEqual(manifestEntry.width, 256, `${enemyId} manifest card width should be 256.`);
  assert.strictEqual(manifestEntry.height, 192, `${enemyId} manifest card height should be 192.`);
  if (enemyId === 'bouncingTankBoss') {
    assert.match(manifestEntry.license, /user_provided_bouncing_tank_boss_LICENSE/, `${enemyId} manifest should cite the user-provided boss asset provenance.`);
  } else {
    assert.match(manifestEntry.license, /derived_enemy_gallery_previews_LICENSE/, `${enemyId} manifest should cite gallery preview provenance.`);
  }

  assert.ok(preview.sheet, `${enemyId} should use an animated spritesheet preview.`);
  const sheet = enemies.enemyGallerySpriteSheets[preview.sheet];
  assert.ok(sheet, `${enemyId} should reference a known gallery spritesheet.`);
  assertPngAsset(sheet.url, sheet.frameWidth * sheet.columns, sheet.url.includes('/gallery/') ? 384 : undefined, `${enemyId} spritesheet`);
  if (enemyId === 'truck') {
    assert.strictEqual(sheet.url.split('?')[0], 'assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png');
    assert.strictEqual(sheet.frameWidth, 469);
    assert.strictEqual(sheet.frameHeight, 300);
    assert.strictEqual(sheet.columns, 6);
    assert.strictEqual(preview.sourceSpritesheetPath, 'assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png');
    assert.doesNotMatch(preview.cardArt, /\.svg(?:\?|$)/);
    assert.match(preview.artStatus, /pending-final-generation/);
  }
  assert.ok(Number.isInteger(preview.animation.start), `${enemyId} should define animation start frame.`);
  assert.ok(Number.isInteger(preview.animation.end), `${enemyId} should define animation end frame.`);
  assert.ok(Number.isInteger(preview.animation.attackStart), `${enemyId} should define attack start frame.`);
  assert.ok(Number.isInteger(preview.animation.attackEnd), `${enemyId} should define attack end frame.`);
});

[
  'truck',
  ...enemies.eliteTypes.map((enemy) => enemy.id)
].forEach((enemyId) => {
  const preview = enemies.enemyGalleryPreviewMap[enemyId];
  if (enemyId === 'bouncingTankBoss') {
    assert.match(preview.artStatus, /user-provided-bitmap/, `${enemyId} should be clearly marked as user-provided bitmap art.`);
  } else {
    assert.match(preview.artStatus, /interim-derived-bitmap/, `${enemyId} should be clearly marked as interim derived bitmap art.`);
  }
  assert.match(preview.promptSpec, /^assets\/source\/enemy-candidates\//, `${enemyId} should keep a final-art prompt spec.`);
  const sheetEntry = assets.importedSpriteTrials.find((entry) => entry.texture === `gallerySheet:${preview.sheet}`);
  assert.ok(sheetEntry, `${enemyId} interim spritesheet should be recorded in the asset manifest.`);
  assert.strictEqual(sheetEntry.spritesheetPath, enemies.enemyGallerySpriteSheets[preview.sheet].url.split('?')[0]);
  if (enemyId === 'truck') {
    assert.strictEqual(sheetEntry.frameWidth, 469);
    assert.strictEqual(sheetEntry.frameHeight, 300);
    assert.deepStrictEqual(sheetEntry.idleFrames, [0, 1, 2, 3, 4, 5]);
    assert.deepStrictEqual(sheetEntry.attackFrames, [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    assert.deepStrictEqual(sheetEntry.hitFrames, [18, 19, 20]);
    assert.deepStrictEqual(sheetEntry.destroyedFrames, [24, 25, 26, 27, 28, 29]);
    assert.match(sheetEntry.artStatus, /pending-final-generation/);
  } else if (enemyId === 'droneSwarmBoss') {
    assert.strictEqual(sheetEntry.frameWidth, 256);
    assert.strictEqual(sheetEntry.frameHeight, 192);
    assert.deepStrictEqual(sheetEntry.idleFrames, [0, 1, 2, 3]);
    assert.deepStrictEqual(sheetEntry.bossFrames.attack, [8, 9, 10, 11]);
    assert.strictEqual(sheetEntry.individualDroneVariants.length, 5);
  } else if (enemyId === 'bouncingTankBoss') {
    assert.strictEqual(sheetEntry.frameWidth, 469);
    assert.strictEqual(sheetEntry.frameHeight, 300);
    assert.deepStrictEqual(sheetEntry.idleFrames, [0, 1, 2, 3, 4, 5]);
    assert.deepStrictEqual(sheetEntry.malfunctionSparkFrames, [21, 22, 23]);
    assert.deepStrictEqual(sheetEntry.destroyedFrames, [24, 25, 26, 27, 28, 29]);
    assert.match(sheetEntry.artStatus, /user-provided-bitmap/);
  } else {
    assert.strictEqual(sheetEntry.frameWidth, 256);
    assert.strictEqual(sheetEntry.frameHeight, 192);
    assert.deepStrictEqual(sheetEntry.idleFrames, [0, 1, 2, 3]);
    assert.deepStrictEqual(sheetEntry.attackFrames, [4, 5, 6, 7]);
    assert.match(sheetEntry.artStatus, /interim-derived-bitmap/);
  }
});

console.log('enemy gallery preview tests passed');
