const assert = require('assert');
const shop = require('../src/data/shop-items.js');

assert.strictEqual(shop.shopItems.length, 15, 'Shop should include 7 tanks and 8 ammo items.');
assert.strictEqual(shop.shopItems.filter((item) => item.type === 'tank').length, 7);
assert.strictEqual(shop.shopItems.filter(shop.isAmmoItem).length, 8);

assert.strictEqual(shop.getShopItem('tank_sherman').cost, 0, 'Sherman should remain the free starter tank.');
assert.strictEqual(shop.getShopItem('tank_sherman').maxLives, 3);
assert.strictEqual(shop.getShopItem('tank_is2').maxLives, 5);
assert.strictEqual(shop.getShopItem('tank_cromwell').rewardBonus, 4);

assert.strictEqual(shop.getShopItem('shell_ap').damageBonus, 1);
assert.strictEqual(shop.getShopItem('shell_he').damageBonus, 2);
assert.strictEqual(shop.getShopItem('shell_he').projectileWidth, 48, 'High-Explosive Shell should use a larger projectile body.');
assert.strictEqual(shop.getShopItem('shell_he').projectileHeight, 22, 'High-Explosive Shell should use a taller projectile body.');
assert.strictEqual(shop.getShopItem('shell_he').explosionVariant, 'massive', 'High-Explosive Shell should use the largest explosion VFX.');
assert.strictEqual(shop.getShopItem('shell_arcane').damageBonus, 1);
assert.strictEqual(shop.getShopItem('shell_arcane').projectileSheet, 'arcaneSparkShell');
assert.strictEqual(shop.getShopItem('shell_arcane').projectileDuration, 2200);
assert.strictEqual(shop.getShopItem('shell_arcane').projectileWidth, 110);
assert.strictEqual(shop.getShopItem('weapon_cannon').damageBonus, 3);
assert.strictEqual(shop.getShopItem('shell_he').ammoPerPurchase, 1);
assert.ok(shop.shopItems.filter(shop.isAmmoItem).every((item) => item.ammoPerPurchase === 1), 'All special ammo should be one-shot purchases.');
assert.strictEqual(shop.getShopItem('shell_smoke').smokeCover, 1);
assert.strictEqual(shop.getShopItem('shell_flash').smokeCover, 1);
assert.strictEqual(shop.getShopItem('shell_repair').repairOnHit, 1);
assert.strictEqual(shop.getShopItem('shell_plating').armorOnHit, 1);
assert.strictEqual(shop.getShopItem('shell_smoke').doctrine, 'Tactics');
assert.strictEqual(shop.getShopItem('shell_flash').doctrine, 'Agility');
assert.strictEqual(shop.getShopItem('shell_repair').doctrine, 'Recovery');
assert.strictEqual(shop.getShopItem('shell_plating').doctrine, 'Defense');
assert.strictEqual(shop.getShopItem('shell_arcane').doctrine, 'Magic');
assert.strictEqual(shop.getShopItem('missing'), null);
assert.strictEqual(shop.isAmmoItem(shop.getShopItem('tank_tiger')), false);
assert.strictEqual(shop.isAmmoItem(shop.getShopItem('shell_ap')), true);
assert.strictEqual(shop.isAmmoItem(shop.getShopItem('shell_smoke')), true);
assert.strictEqual(shop.isAmmoItem(shop.getShopItem('shell_flash')), true);

console.log('shop core tests passed');
