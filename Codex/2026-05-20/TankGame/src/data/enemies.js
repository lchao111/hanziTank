(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankEnemies = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const levelTypes = [
    {
      id: "tank",
      name: "Tank",
      hp: 1,
      damage: 1,
      intro: "Stage 1 drill. Match one Hanzi meaning to fire."
    },
    {
      id: "infantry",
      name: "Infantry Squad",
      hp: 2,
      damage: 1,
      attackInterval: 4,
      intro: "Stage 2 drill. A harder Hanzi appears and the squad fires sooner."
    },
    {
      id: "armor",
      name: "Armored Tank",
      hp: 2,
      damage: 1,
      absoluteDefense: 1,
      armor: 1,
      intro: "Stage 3 drill. Break absolute defense and armor with steady answers."
    },
    {
      id: "scout",
      name: "Scout Car",
      hp: 1,
      damage: 2,
      attackInterval: 3,
      intro: "Stage 4 drill. A fast scout attacks quickly if you hesitate."
    },
    {
      id: "truck",
      name: "Self-Destruct Truck",
      hp: 1,
      damage: 1,
      attackStyle: "melee",
      approachDistance: 120,
      intro: "Self-destruct truck incoming. It attacks every 5 seconds."
    },
    {
      id: "rpgInfantry",
      name: "RPG Soldier",
      hp: 1,
      damage: 2,
      intro: "Anti-tank RPG soldier. Its missile deals 2 HP damage."
    },
    {
      id: "heavyInfantry",
      name: "Heavy Soldier",
      hp: 2,
      damage: 1,
      attackStyle: "melee",
      approachDistance: 92,
      intro: "Heavy soldier. It closes in while you answer."
    }
  ];

  const bossTemplate = {
    id: "boss",
    name: "Tank Dismantler",
    hp: 1,
    damage: 1,
    armor: 5,
    attackStyle: "melee",
    approachDistance: 150,
    sprite: "assets/enemy-boss-dismantler.svg",
    intro: "Stage 5 Boss. Listen to one Hanzi, find it, then fire before the hammer lands."
  };

  const enemyPortraitDetails = {
    tank: "Basic armored target. Clean silhouette for early stages.",
    infantry: "Light infantry group with small profile and low damage.",
    armor: "Armored tank with absolute defense and plating.",
    heavyInfantry: "Heavy soldier with thicker armor and bigger stance.",
    truck: "Closest Phaser-style version of the reference: rusted suicide truck, front spikes, explosive cargo, smoke, and hand-painted markings.",
    rpgInfantry: "Anti-tank RPG soldier. Low HP but dangerous burst damage.",
    scout: "Fast light vehicle that hits harder than a basic tank.",
    boss: "Boss portrait for the Tank Dismantler hammer fight."
  };

  const tankSpriteMap = {
    tank_sherman: "assets/tank-sherman.svg",
    tank_tiger: "assets/tank-tiger.svg",
    tank_panzer4: "assets/tank-panzer4.svg",
    tank_is2: "assets/tank-is2.svg",
    tank_t34: "assets/tank-t34.svg",
    tank_cromwell: "assets/tank-cromwell.svg",
    tank_churchill: "assets/tank-churchill.svg"
  };

  const enemySpriteMap = {
    tank: "assets/enemy-tank.svg",
    armor: "assets/enemy-armor.svg",
    truck: "assets/enemy-suicide-truck.svg",
    scout: "assets/enemy-scout.svg",
    infantry: "assets/enemy-infantry.svg",
    heavyInfantry: "assets/enemy-heavy-infantry.svg",
    rpgInfantry: "assets/enemy-rpg-infantry.svg"
  };

  const debugTargets = [
    { stage: 1, title: "Tank", desc: "Basic tank battle." },
    { stage: 2, title: "Infantry Squad", desc: "Harder Hanzi pressure. 2 HP, faster first injury risk." },
    { stage: 3, title: "Armored Tank", desc: "Absolute defense + armor test." },
    { stage: 4, title: "Scout Car", desc: "Fast enemy pressure. 1 HP, 2 damage, shorter attack timer." },
    { stage: 5, title: "Tank Dismantler Boss", desc: "Boss intro, listening challenge, hammer attack." },
    { stage: 6, title: "RPG Soldier", desc: "1 HP, 2 damage anti-tank unit." },
    { stage: 7, title: "Scout Car", desc: "Fast light vehicle with 2 damage." },
    { stage: 12, title: "Self-Destruct Truck", desc: "Self-destruct truck approach and crash attack." },
    { stage: 10, title: "Boss Stage 10", desc: "Boss scaling and repeated boss flow." }
  ];

  return {
    levelTypes,
    bossTemplate,
    enemyPortraitDetails,
    tankSpriteMap,
    enemySpriteMap,
    debugTargets
  };
});
