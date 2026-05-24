const assert = require('assert');
const shop = require('../src/data/shop-items.js');

assert.strictEqual(shop.shopItems.length, 10, 'Shop should include 7 tanks and 3 ammo items.');
assert.strictEqual(shop.shopItems.filter((item) => item.type === 'tank').length, 7);
assert.strictEqual(shop.shopItems.filter(shop.isAmmoItem).length, 3);

assert.strictEqual(shop.getShopItem('tank_sherman').cost, 0, 'Sherman should remain the free starter tank.');
assert.strictEqual(shop.getShopItem('tank_sherman').maxLives, 3);
assert.strictEqual(shop.getShopItem('tank_is2').maxLives, 5);
assert.strictEqual(shop.getShopItem('tank_cromwell').rewardBonus, 4);

assert.strictEqual(shop.getShopItem('shell_ap').damageBonus, 1);
assert.strictEqual(shop.getShopItem('shell_he').damageBonus, 2);
assert.strictEqual(shop.getShopItem('weapon_cannon').damageBonus, 3);
assert.strictEqual(shop.getShopItem('shell_he').ammoPerPurchase, 3);
assert.strictEqual(shop.getShopItem('missing'), null);
assert.strictEqual(shop.isAmmoItem(shop.getShopItem('tank_tiger')), false);
assert.strictEqual(shop.isAmmoItem(shop.getShopItem('shell_ap')), true);

console.log('shop core tests passed');
