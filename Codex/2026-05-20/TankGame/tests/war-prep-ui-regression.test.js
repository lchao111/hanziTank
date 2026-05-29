const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');
const shop = require('../src/data/shop-items.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const shopPreviewMapStart = source.indexOf('const shopPreviewSheetMap = {');
assert.notStrictEqual(shopPreviewMapStart, -1, 'Missing War Prep preview map.');
const shopPreviewMapEnd = source.indexOf('};', shopPreviewMapStart);
assert.notStrictEqual(shopPreviewMapEnd, -1, 'Missing War Prep preview map end.');
const shopPreviewMap = source.slice(shopPreviewMapStart, shopPreviewMapEnd);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

assert.match(source, /class="stage-clear-layout"/, 'Stage Clear should have a two-column layout.');
assert.match(source, /class="inline-war-prep"/, 'War Prep should be embedded in the centered Stage Clear panel.');
assert.match(source, /id="inlineShopGrid"/, 'Inline War Prep should have a shop grid.');
assert.match(source, /id="inlineShopCoins"/, 'Inline War Prep should show coins.');
assert.match(source, /id="inlineLoadout"/, 'Inline War Prep should show loadout.');
assert.match(source, /id="openFullWarPrepButton"/, 'Inline War Prep should still offer access to full prep.');
assert.match(source, /"shop-preview"/, 'War Prep cards should support sprite preview art.');
assert.match(source, /function getTankMasteryEntry/, 'Tank mastery state should be normalized by the game UI.');
assert.match(source, /function grantEquippedTankXp/, 'Equipped tanks should earn XP from clears.');
assert.match(source, /function getTankMasteryText/, 'War Prep should have a concise tank mastery display.');
assert.match(source, /modal-quartermaster-texture\.png/, 'War Prep should use a bitmap quartermaster surface.');
[
  ['tank_sherman', 'assets/sprites/tanks/war-prep/sherman.png'],
  ['tank_tiger', 'assets/sprites/tanks/war-prep/tiger-i.png'],
  ['tank_panzer4', 'assets/sprites/tanks/war-prep/panzer-iv.png'],
  ['tank_is2', 'assets/sprites/tanks/war-prep/is-2.png'],
  ['tank_t34', 'assets/sprites/tanks/war-prep/t-34.png'],
  ['tank_cromwell', 'assets/sprites/tanks/war-prep/cromwell.png'],
  ['tank_churchill', 'assets/sprites/tanks/war-prep/churchill.png']
].forEach(([tankId, assetPath]) => {
  const entryPattern = new RegExp(`${tankId}:\\s*\\{[^}]*url:\\s*"${escapeRegExp(assetPath)}\\?v=20260529"[^}]*className:\\s*"tank-bitmap-preview"`);
  assert.match(shopPreviewMap, entryPattern, `${tankId} should use the generated War Prep PNG preview.`);
  assert.doesNotMatch(shopPreviewMap, new RegExp(`${tankId}:\\s*\\{[^}]*\\.svg`), `${tankId} must not use SVG art in War Prep.`);

  const fullPath = path.join(__dirname, '..', assetPath);
  assert.ok(fs.existsSync(fullPath), `${tankId} War Prep PNG should exist on disk.`);
  const dimensions = imageSize(fs.readFileSync(fullPath));
  assert.strictEqual(dimensions.width, 512, `${tankId} War Prep PNG should be 512px wide.`);
  assert.strictEqual(dimensions.height, 320, `${tankId} War Prep PNG should be 320px tall.`);
});
assert.doesNotMatch(shopPreviewMap, /tank_[a-z0-9]+:\s*\{[^}]*tank-[a-z0-9-]+\.svg/, 'War Prep tank preview map must not point to tank SVG card art.');
[
  ['shell_ap', 'assets/sprites/effects/armor-piercing-shell-spritesheet.png', 1280, 192],
  ['shell_smoke', 'assets/sprites/effects/smoke-shell-spritesheet.png', 1280, 192],
  ['shell_repair', 'assets/sprites/effects/repair-capsule-shell-spritesheet.png', 1280, 192],
  ['shell_flash', 'assets/sprites/effects/flash-flare-shell-spritesheet.png', 1280, 192],
  ['shell_plating', 'assets/sprites/effects/armor-plate-shell-spritesheet.png', 1280, 192],
  ['shell_he', 'assets/sprites/effects/high-explosive-shell-spritesheet.png', 1280, 192],
  ['shell_arcane', 'assets/sprites/effects/arcane-spark-shell-spritesheet.png', 1024, 160],
  ['weapon_cannon', 'assets/sprites/effects/long-barrel-shot-spritesheet.png', 1280, 192]
].forEach(([itemId, assetPath, width, height]) => {
  const entryPattern = new RegExp(`${itemId}:\\s*\\{[^}]*url:\\s*"${escapeRegExp(assetPath)}\\?v=20260529"[^}]*className:\\s*"shell-preview ammo-sprite-preview"[^}]*animate:\\s*true`);
  assert.match(shopPreviewMap, entryPattern, `${itemId} should use an animated PNG spritesheet in War Prep.`);

  const fullPath = path.join(__dirname, '..', assetPath);
  assert.ok(fs.existsSync(fullPath), `${itemId} War Prep ammo PNG should exist on disk.`);
  const dimensions = imageSize(fs.readFileSync(fullPath));
  assert.strictEqual(dimensions.width, width, `${itemId} War Prep ammo PNG should have the expected width.`);
  assert.strictEqual(dimensions.height, height, `${itemId} War Prep ammo PNG should have the expected height.`);
});
shop.shopItems.filter(shop.isAmmoItem).forEach((item) => {
  assert.match(shopPreviewMap, new RegExp(`${item.id}:\\s*\\{`), `${item.id} should have configured War Prep preview art.`);
});

const syncHud = bodyOf('syncHud');
assert.match(syncHud, /inlineShopCoins\.textContent = playerState\.coins/, 'Inline War Prep coins should sync with HUD.');
assert.match(syncHud, /inlineLoadout\.textContent = loadoutEl\.textContent/, 'Inline War Prep loadout should sync with full shop loadout.');
assert.match(syncHud, /getTankMasteryText\(\)/, 'Inline War Prep loadout should include equipped tank mastery.');

const renderShop = bodyOf('renderShop');
assert.match(renderShop, /renderShopGrid\(shopGrid\)/, 'Full shop grid should render through shared renderer.');
assert.match(renderShop, /renderShopGrid\(inlineShopGrid\)/, 'Inline War Prep grid should render through shared renderer.');

const renderShopGrid = bodyOf('renderShopGrid');
assert.match(renderShopGrid, /getShopPreviewMarkup\(item\)/, 'Shared War Prep renderer should inject sprite preview art when a sheet exists.');
assert.match(renderShopGrid, /getTankMasteryText\(item\.id\)/, 'Tank cards should show their mastery progress and bonuses.');

const completeLevel = bodyOf('completeLevel');
assert.match(completeLevel, /grantEquippedTankXp\(levelNumber\)/, 'Stage clear should grant XP to the equipped tank.');
assert.match(completeLevel, /getTankMasteryClearBonus\(tankXp\.tankId\)/, 'Tank mastery should add a bounded stage-clear bonus.');
assert.match(completeLevel, /Tank \+\$\{tankXp\.gainedXp\} XP/, 'Stage clear feedback should call out tank XP.');

const getShopPreviewMarkup = bodyOf('getShopPreviewMarkup');
assert.match(getShopPreviewMarkup, /shopPreviewSheetMap\[item\.id\]/, 'War Prep previews should only render for items with configured animation sheets.');
assert.match(getShopPreviewMarkup, /animated-preview/, 'War Prep should add the animated preview class when configured.');
assert.match(getShopPreviewMarkup, /--preview-steps/, 'War Prep should expose a CSS step count for spritesheet previews.');
assert.match(source, /background-size: calc\(var\(--preview-columns/, 'War Prep previews should crop the first spritesheet frame with CSS.');
assert.match(source, /@keyframes shop-preview-sheet-play/, 'War Prep should define keyframes for animated ammo preview sheets.');
assert.match(source, /\.shop-preview\.tank-bitmap-preview[\s\S]*background-size: contain/, 'Tank bitmap previews should use contain sizing so full art is visible without stretching.');

const showPerkChoices = bodyOf('showPerkChoices');
assert.match(showPerkChoices, /renderShop\(\)/, 'Stage Clear should render War Prep alongside perk choices.');

assert.match(source, /inlineShopGrid\.addEventListener\("click"/, 'Inline War Prep shop actions should be wired.');
assert.match(source, /openFullWarPrepButton\.addEventListener\("click", openArsenal\)/, 'Inline War Prep should open full prep modal.');

console.log('war prep UI regression tests passed');
