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
  assert.match(manifestEntry.license, /derived_enemy_gallery_previews_LICENSE/, `${enemyId} manifest should cite gallery preview provenance.`);

  assert.ok(preview.sheet, `${enemyId} should use an animated spritesheet preview.`);
  const sheet = enemies.enemyGallerySpriteSheets[preview.sheet];
  assert.ok(sheet, `${enemyId} should reference a known gallery spritesheet.`);
  assertPngAsset(sheet.url, sheet.frameWidth * sheet.columns, sheet.url.includes('/gallery/') ? 384 : undefined, `${enemyId} spritesheet`);
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
  assert.match(preview.artStatus, /interim-derived-bitmap/, `${enemyId} should be clearly marked as interim derived bitmap art.`);
  assert.match(preview.promptSpec, /^assets\/source\/enemy-candidates\//, `${enemyId} should keep a final-art prompt spec.`);
  const sheetEntry = assets.importedSpriteTrials.find((entry) => entry.texture === `gallerySheet:${preview.sheet}`);
  assert.ok(sheetEntry, `${enemyId} interim spritesheet should be recorded in the asset manifest.`);
  assert.strictEqual(sheetEntry.spritesheetPath, enemies.enemyGallerySpriteSheets[preview.sheet].url.split('?')[0]);
  assert.strictEqual(sheetEntry.frameWidth, 256);
  assert.strictEqual(sheetEntry.frameHeight, 192);
  assert.deepStrictEqual(sheetEntry.idleFrames, [0, 1, 2, 3]);
  assert.deepStrictEqual(sheetEntry.attackFrames, [4, 5, 6, 7]);
  assert.match(sheetEntry.artStatus, /interim-derived-bitmap/);
});

console.log('enemy gallery preview tests passed');
