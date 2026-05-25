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

const getAmmoPriority = bodyOf('getAmmoPriority');
assert.match(getAmmoPriority, /playerState\.equipped\?\.shell/, 'Equipped shell slot should control special ammo priority.');
assert.match(getAmmoPriority, /playerState\.equipped\?\.weapon/, 'Equipped weapon slot should control second special ammo priority.');
assert.doesNotMatch(getAmmoPriority, /weapon_cannon.*shell_he.*shell_ap/, 'Special ammo should not auto-consume from all reserves.');

const equipAmmo = bodyOf('equipAmmo');
assert.match(equipAmmo, /if \(!playerState\.equipped\.shell\)/, 'First ammo type should equip into shell slot.');
assert.match(equipAmmo, /if \(!playerState\.equipped\.weapon\)/, 'Second ammo type should equip into weapon slot.');
assert.match(equipAmmo, /Only two special ammo types can be equipped/, 'Third ammo type should be blocked with a clear message.');

const buyOrEquip = bodyOf('buyOrEquip');
assert.match(buyOrEquip, /if \(item\.id === "shell_he"\) announceHighExplosiveReady\(\)/, 'Equipping high-explosive ammo should announce readiness.');

const consumeSpecialAmmo = bodyOf('consumeSpecialAmmo');
assert.match(consumeSpecialAmmo, /if \(playerState\.ammo\[ammoId\] <= 0\) unequipAmmo\(ammoId\)/, 'Used-up ammo should unequip automatically.');

const sellAmmo = bodyOf('sellAmmo');
assert.match(sellAmmo, /playerState\.ammo\[itemId\] = getAmmoCount\(itemId\) - 1/, 'Selling ammo should remove exactly one round.');
assert.match(sellAmmo, /Math\.floor\(item\.cost \/ 2\)/, 'Selling ammo should refund half cost.');

const renderShopGrid = bodyOf('renderShopGrid');
assert.match(renderShopGrid, /data-action="buy"/, 'Ammo cards should support buy action.');
assert.match(renderShopGrid, /data-action="\$\{ammoEquipped \? "unequip" : "equip"\}"/, 'Ammo cards should support equip/unequip actions.');
assert.match(renderShopGrid, /data-action="sell"/, 'Ammo cards should support sell action.');

const completeLevel = bodyOf('completeLevel');
assert.match(completeLevel, /warShopAvailable = true/, 'War prep should open after every cleared stage.');

const fire = bodyOf('fire');
assert.doesNotMatch(fire, /announceHighExplosiveFire/, 'Firing high-explosive ammo should not announce a launch voice line.');

assert.match(source, /\.bullet\.he-shell \{[\s\S]*width: 48px;[\s\S]*height: 22px;/, 'High-Explosive Shell should render as a visibly larger DOM projectile.');

console.log('ammo regression tests passed');
