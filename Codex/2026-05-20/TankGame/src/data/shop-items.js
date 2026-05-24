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
      name: "Armor-Piercing Shell",
      cost: 45,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 3,
      damageBonus: 1,
      bulletClass: "ap-shell",
      desc: "Consumable ammo. +1 attack for one shot. Buy 3 rounds."
    },
    {
      id: "shell_he",
      type: "shell",
      typeLabel: "Ammo",
      name: "High-Explosive Shell",
      cost: 95,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 3,
      damageBonus: 2,
      bulletClass: "he-shell",
      desc: "Consumable ammo. +2 attack for one shot and bigger explosion. Buy 3 rounds."
    },
    {
      id: "weapon_cannon",
      type: "weapon",
      typeLabel: "Ammo",
      name: "Long-Barrel Shot",
      cost: 120,
      maxLives: 0,
      rewardBonus: 0,
      ammoPerPurchase: 3,
      damageBonus: 3,
      bulletClass: "cannon-shell",
      desc: "Consumable ammo. +3 attack for one shot. Buy 3 rounds."
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
