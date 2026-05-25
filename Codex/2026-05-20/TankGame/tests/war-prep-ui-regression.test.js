const assert = require('assert');
const fs = require('fs');
const path = require('path');

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

assert.match(source, /class="stage-clear-layout"/, 'Stage Clear should have a two-column layout.');
assert.match(source, /class="inline-war-prep"/, 'War Prep should be embedded in the centered Stage Clear panel.');
assert.match(source, /id="inlineShopGrid"/, 'Inline War Prep should have a shop grid.');
assert.match(source, /id="inlineShopCoins"/, 'Inline War Prep should show coins.');
assert.match(source, /id="inlineLoadout"/, 'Inline War Prep should show loadout.');
assert.match(source, /id="openFullWarPrepButton"/, 'Inline War Prep should still offer access to full prep.');

const syncHud = bodyOf('syncHud');
assert.match(syncHud, /inlineShopCoins\.textContent = playerState\.coins/, 'Inline War Prep coins should sync with HUD.');
assert.match(syncHud, /inlineLoadout\.textContent = loadoutEl\.textContent/, 'Inline War Prep loadout should sync with full shop loadout.');

const renderShop = bodyOf('renderShop');
assert.match(renderShop, /renderShopGrid\(shopGrid\)/, 'Full shop grid should render through shared renderer.');
assert.match(renderShop, /renderShopGrid\(inlineShopGrid\)/, 'Inline War Prep grid should render through shared renderer.');

const showPerkChoices = bodyOf('showPerkChoices');
assert.match(showPerkChoices, /renderShop\(\)/, 'Stage Clear should render War Prep alongside perk choices.');

assert.match(source, /inlineShopGrid\.addEventListener\("click"/, 'Inline War Prep shop actions should be wired.');
assert.match(source, /openFullWarPrepButton\.addEventListener\("click", openArsenal\)/, 'Inline War Prep should open full prep modal.');

console.log('war prep UI regression tests passed');
