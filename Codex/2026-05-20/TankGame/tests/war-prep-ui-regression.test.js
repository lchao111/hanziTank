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
assert.match(source, /<button[^>]*class="[^"]*war-shop-button[^"]*"[^>]*id="arsenalButton"/, 'Footer War Prep should be the independent dock entry.');
assert.match(source, /<button[^>]*id="arsenalButton"[^>]*aria-label="战备补给 \/ War Prep"|<button[^>]*aria-label="战备补给 \/ War Prep"[^>]*id="arsenalButton"/, 'Footer War Prep should keep bilingual accessible labeling.');
assert.match(source, /war-prep-button\.png\?v=20260529/, 'Footer War Prep dock button should use the quartermaster crate art.');
assert.match(source, /id="openFullWarPrepButton"/, 'Stage Clear should offer a compact action to open full War Prep.');
assert.doesNotMatch(source, /id="inlineShopGrid"/, 'Stage Clear should not embed the full War Prep shop grid.');
assert.doesNotMatch(source, /class="inline-war-prep"/, 'Stage Clear should not render War Prep as an inline shop panel.');
assert.match(source, /"shop-preview"/, 'War Prep cards should support sprite preview art.');
assert.match(source, /--preview-scale:\s*\$\{previewScale\}/, 'War Prep previews should expose a per-item display scale variable.');
assert.match(source, /\.shop-preview\.tank-bitmap-preview\s*\{[^}]*background-size:\s*auto calc\(100% \* var\(--preview-scale, 1\)\)/, 'War Prep bitmap tank previews should honor the per-item display scale.');
assert.match(source, /function getTankMasteryEntry/, 'Tank mastery state should be normalized by the game UI.');
assert.match(source, /function grantEquippedTankXp/, 'Equipped tanks should earn XP from clears.');
assert.match(source, /function getTankMasteryText/, 'War Prep should have a concise tank mastery display.');
assert.match(source, /modal-quartermaster-texture\.png/, 'War Prep should use a bitmap quartermaster surface.');
assert.match(source, /switch-general-button\.png\?v=20260529/, 'Switch General should use the current generated bitmap button asset.');
assert.match(source, /id="switchProfileButton"[^>]*aria-label="换将 \/ Switch General"/, 'Switch General should keep its accessible bilingual label.');
assert.match(source, /id="switchProfileButton"[^>]*title="换将 \/ Switch General"/, 'Switch General should keep its bilingual tooltip.');
assert.match(source, /id="switchProfileButton"[^>]*data-tooltip="换将 \/ Switch General"/, 'Switch General should keep its custom tooltip text.');
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
assert.match(shopPreviewMap, /tank_tiger:\s*\{[^}]*scale:\s*1\.32[^}]*\}/, 'Tiger I should render visibly larger than every other War Prep tank preview.');
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
assert.doesNotMatch(syncHud, /inlineShop/, 'HUD sync should not maintain a removed inline Stage Clear shop.');
assert.match(syncHud, /loadoutEl\.textContent = `Loadout: \$\{equippedNames \|\| "Basic gear"\} · \$\{getTankMasteryText\(\)\}/, 'Full War Prep loadout should include equipped tank mastery.');
assert.doesNotMatch(syncHud, /arsenalButton\.classList\.toggle\("show", warShopAvailable\)/, 'Footer War Prep button should not be hidden behind reward-state availability.');

const renderShop = bodyOf('renderShop');
assert.match(renderShop, /renderShopGrid\(shopGrid\)/, 'Full shop grid should render through shared renderer.');
assert.doesNotMatch(renderShop, /inlineShopGrid/, 'Stage Clear should no longer render a second inline War Prep grid.');

const openArsenal = bodyOf('openArsenal');
assert.doesNotMatch(openArsenal, /if \(!warShopAvailable\) return/, 'Footer War Prep should open as a stable direct destination.');

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

assert.doesNotMatch(source, /inlineShopGrid\.addEventListener\("click"/, 'Removed inline War Prep grid should not have click handlers.');
assert.match(source, /openFullWarPrepButton\.addEventListener\("click", openArsenal\)/, 'Stage Clear compact War Prep action should open full prep modal.');

console.log('war prep UI regression tests passed');
