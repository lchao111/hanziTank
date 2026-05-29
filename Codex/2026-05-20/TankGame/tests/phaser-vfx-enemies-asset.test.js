const assert = require('assert');
const fs = require('fs');
const path = require('path');
const imageSizeModule = require('image-size');
const sizeOf = imageSizeModule.imageSize || imageSizeModule.default || imageSizeModule;

// Asset existence and dimension checks for enemy spritesheets
const ENEMY_SPRITES = [
  {
    id: 'regular-infantry',
    path: 'assets/sprites/enemies/regular-infantry-spritesheet.png',
    expected: { width: 469 * 6, height: 300 * 5 },
  },
  {
    id: 'grenadier',
    path: 'assets/sprites/enemies/grenadier-spritesheet.png',
    expected: { width: 469 * 6, height: 300 * 5 },
  },
  {
    id: 'regular-enemy-tank',
    path: 'assets/sprites/enemies/regular-enemy-tank-spritesheet.png',
    expected: { width: 469 * 6, height: 300 * 5 },
  },
  {
    id: 'tank-dismantler',
    path: 'assets/sprites/enemies/tank-dismantler-spritesheet.png',
    expected: { width: 224 * 6, height: 224 * 5 },
  },
  {
    id: 'target-dummy',
    path: 'assets/sprites/enemies/target-dummy-spritesheet.png',
    expected: null, // No strict dimension check
  },
];

const ENVIRONMENT_BACKGROUNDS = [
  'assets/sprites/environment/battlefield-snow-mountain.png',
  'assets/sprites/environment/battlefield-desert.png',
  'assets/sprites/environment/battlefield-night.png',
  'assets/sprites/environment/battlefield-rain.png',
  'assets/sprites/environment/battlefield-sunny.png',
  'assets/sprites/environment/battlefield-storm.png',
  'assets/sprites/environment/battlefield-snowfall.png',
];

ENEMY_SPRITES.forEach(({ id, path: spritePath, expected }) => {
  assert.ok(fs.existsSync(spritePath), `Missing enemy sprite: ${spritePath}`);
  if (expected) {
    const dim = sizeOf(fs.readFileSync(spritePath));
    assert.strictEqual(dim.height, expected.height, `${id} sprite height`);
    assert.strictEqual(dim.width, expected.width, `${id} sprite width`);
  }
});

ENVIRONMENT_BACKGROUNDS.forEach((backgroundPath) => {
  assert.ok(fs.existsSync(backgroundPath), `Missing environment background: ${backgroundPath}`);
  const dim = sizeOf(fs.readFileSync(backgroundPath));
  assert.strictEqual(dim.width, 1672, `${path.basename(backgroundPath)} width`);
  assert.strictEqual(dim.height, 941, `${path.basename(backgroundPath)} height`);
});

console.log('phaser-vfx/enemies/asset tests passed');
