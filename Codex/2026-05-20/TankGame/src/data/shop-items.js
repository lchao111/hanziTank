(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankShop = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const shopItems = [
    {
      id: "tank_sherman",
      type: "tank",
      typeLabel: "Tank",
      name: "USA: M4 Sherman",
      cost: 0,
      maxLives: 3,
      rewardBonus: 0,
      bulletClass: "",
      desc: "Classic American medium tank. Balanced starter vehicle."
    },
    {
      id: "tank_tiger",
      type: "tank",
      typeLabel: "Tank",
      name: "Germany: Tiger I",
      cost: 80,
      maxLives: 4,
      rewardBonus: 1,
      bulletClass: "",
      desc: "Iconic German heavy tank. Max HP +1 and +1 coin per correct answer."
    },
    {
      id: "tank_panzer4",
      type: "tank",
      typeLabel: "Tank",
      name: "Germany: Panzer IV",
      cost: 55,
      maxLives: 3,
      rewardBonus: 3,
      bulletClass: "",
      desc: "Reliable German medium tank. Lower armor, better coin bonus."
    },
    {
      id: "tank_is2",
      type: "tank",
      typeLabel: "Tank",
      name: "Soviet: IS-2",
      cost: 160,
      maxLives: 5,
      rewardBonus: 2,
      bulletClass: "",
      desc: "Soviet heavy breakthrough tank. Max HP +2 and +2 coins per correct answer."
    },
    {
      id: "tank_t34",
      type: "tank",
      typeLabel: "Tank",
      name: "Soviet: T-34",
      cost: 70,
      maxLives: 4,
      rewardBonus: 2,
      bulletClass: "",
      desc: "Sloped armor and fast attacks. Max HP +1 and +2 coins."
    },
    {
      id: "tank_cromwell",
      type: "tank",
      typeLabel: "Tank",
      name: "Britain: Cromwell",
      cost: 65,
      maxLives: 3,
      rewardBonus: 4,
      bulletClass: "",
      desc: "Fast British cruiser tank. Best early coin bonus."
    },
    {
      id: "tank_churchill",
      type: "tank",
      typeLabel: "Tank",
      name: "Britain: Churchill",
      cost: 130,
      maxLives: 5,
      rewardBonus: 1,
      bulletClass: "",
      desc: "Thick British infantry tank. Max HP +2."
    },
    {
      id: "shell_ap",
      type: "shell",
      typeLabel: "Ammo",
      doctrine: "Violent Attack",
      name: "Armor-Piercing Shell",
      cost: 45,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 1,
      damageBonus: 1,
      bulletClass: "ap-shell",
      projectileColor: 0xfff2a1,
      projectileWidth: 56,
      projectileHeight: 18,
      projectileDuration: 640,
      projectileSheet: "armorPiercingShell",
      desc: "Consumable ammo. +1 attack for one equipped shot. Buy 1 round."
    },
    {
      id: "shell_smoke",
      type: "shell",
      typeLabel: "Ammo",
      doctrine: "Tactics",
      name: "Smoke Shell",
      cost: 60,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 1,
      damageBonus: 0,
      smokeCover: 1,
      bulletClass: "smoke-shell",
      projectileColor: 0x94a3b8,
      projectileWidth: 78,
      projectileHeight: 14,
      projectileDuration: 780,
      projectileSheet: "smokeShell",
      desc: "Consumable tactics ammo. Next enemy attack must miss. Buy 1 round."
    },
    {
      id: "shell_repair",
      type: "shell",
      typeLabel: "Ammo",
      doctrine: "Recovery",
      name: "Repair Capsule",
      cost: 65,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 1,
      damageBonus: 0,
      repairOnHit: 1,
      bulletClass: "repair-shell",
      projectileColor: 0x22c55e,
      projectileWidth: 72,
      projectileHeight: 30,
      projectileDuration: 720,
      projectileSheet: "repairCapsuleShell",
      desc: "Consumable recovery ammo. Repair 1 HP after a hit. Buy 1 round."
    },
    {
      id: "shell_flash",
      type: "shell",
      typeLabel: "Ammo",
      doctrine: "Agility",
      name: "Flash Flare Shell",
      cost: 75,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 1,
      damageBonus: 0,
      smokeCover: 1,
      bulletClass: "flash-shell",
      projectileColor: 0xfef08a,
      projectileWidth: 74,
      projectileHeight: 14,
      projectileDuration: 680,
      projectileSheet: "flashFlareShell",
      desc: "Consumable agility ammo. Blind and dodge the next enemy attack. Buy 1 round."
    },
    {
      id: "shell_plating",
      type: "shell",
      typeLabel: "Ammo",
      doctrine: "Defense",
      name: "Armor Plate Round",
      cost: 70,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 1,
      damageBonus: 0,
      armorOnHit: 1,
      bulletClass: "armor-shell",
      projectileColor: 0x60a5fa,
      projectileWidth: 72,
      projectileHeight: 34,
      projectileDuration: 980,
      projectileSheet: "armorPlateShell",
      desc: "Consumable defense ammo. Gain 1 armor after a hit. Buy 1 round."
    },
    {
      id: "shell_he",
      type: "shell",
      typeLabel: "Ammo",
      doctrine: "Violent Attack",
      name: "High-Explosive Shell",
      cost: 95,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 1,
      damageBonus: 2,
      bulletClass: "he-shell",
      projectileColor: 0xff7a2f,
      projectileWidth: 48,
      projectileHeight: 22,
      projectileDuration: 900,
      projectileSheet: "highExplosiveShell",
      explosionVariant: "massive",
      desc: "Consumable ammo. +2 attack for one equipped shot and bigger explosion. Buy 1 round."
    },
    {
      id: "shell_arcane",
      type: "shell",
      typeLabel: "Ammo",
      doctrine: "Magic",
      name: "Arcane Spark Shell",
      cost: 105,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 1,
      damageBonus: 1,
      bulletClass: "arcane-shell",
      projectileColor: 0xa78bfa,
      projectileWidth: 110,
      projectileHeight: 44,
      projectileDuration: 2200,
      projectileSheet: "arcaneSparkShell",
      desc: "Consumable magic ammo. +1 attack with bright arcane impact. Buy 1 round."
    },
    {
      id: "weapon_cannon",
      type: "weapon",
      typeLabel: "Ammo",
      doctrine: "Violent Attack",
      name: "Long-Barrel Shot",
      cost: 120,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 1,
      damageBonus: 3,
      bulletClass: "cannon-shell",
      projectileColor: 0xdbeafe,
      projectileWidth: 88,
      projectileHeight: 28,
      projectileDuration: 820,
      projectileSheet: "longBarrelShot",
      explosionVariant: "heavy",
      desc: "Consumable ammo. +3 attack for one equipped shot. Buy 1 round."
    }
  ];

  function getShopItem(id) {
    return shopItems.find((item) => item.id === id) || null;
  }

  function isAmmoItem(item) {
    return Boolean(item && item.ammoPerPurchase);
  }

  return {
    shopItems,
    getShopItem,
    isAmmoItem
  };
});
