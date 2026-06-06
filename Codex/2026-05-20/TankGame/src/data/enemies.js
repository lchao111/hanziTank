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
      intro: "Stage 1 drill. Match one Hanzi meaning to fire. / 第 1 关训练：选对汉字意思即可开火。"
    },
    {
      id: "infantry",
      name: "Regular Soldier",
      hp: 2,
      damage: 1,
      attackInterval: 4,
      intro: "Stage 2 drill. A regular soldier appears and fires sooner. / 第 2 关训练：普通士兵出现，开火更快。"
    },
    {
      id: "armor",
      name: "Armored Tank",
      hp: 2,
      damage: 1,
      absoluteDefense: 1,
      armor: 1,
      intro: "Stage 3 drill. Break absolute defense and armor with steady answers. / 第 3 关训练：稳定答题，击破绝对防御和护甲。"
    },
    {
      id: "grenadier",
      name: "Grenadier",
      hp: 1,
      damage: 2,
      attackInterval: 3,
      intro: "Stage 4 drill. A grenadier hits for 2 damage if you hesitate. / 第 4 关训练：榴弹兵来袭，犹豫太久会受到 2 点伤害。"
    },
    {
      id: "truck",
      name: "Self-Destruct Truck",
      hp: 1,
      damage: 2,
      attackInterval: 4,
      attackStyle: "selfDestruct",
      role: "elite",
      reloadMotion: "approach",
      approachDistance: 150,
      telegraph: "rushWarning",
      attackTiming: "warning-accelerate-impact",
      hitReaction: "smokeJolt",
      deathVfx: "selfDestructDebris",
      asset: {
        status: "interim-derived-bitmap-pending-final-generation",
        promptSpec: "assets/source/enemy-candidates/self-destruct-truck-spritesheet.prompt.md",
        runtimeSpritesheet: "assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png",
        explosionSpritesheet: "assets/sprites/effects/self-destruct-truck-explosion-interim-spritesheet.png",
        galleryPreview: "assets/sprites/enemies/gallery/self-destruct-truck-interim-preview.png",
        gallerySpritesheet: "assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png",
        frameWidth: 469,
        frameHeight: 300,
        columns: 6,
        rows: 5,
        frames: {
          idle: [0, 1, 2, 3, 4, 5],
          reloadWarning: [6, 7, 8, 9, 10, 11],
          charge: [12, 13, 14, 15, 16, 17],
          hitSmokeJolt: [18, 19, 20],
          explosionWindup: [21, 22, 23],
          destroyed: [24, 25, 26, 27, 28, 29]
        },
        explosionFrames: [0, 1, 2, 3, 4, 5, 6, 7],
        fallback: "assets/enemy-suicide-truck.svg"
      },
      intro: "Elite truck. Watch the red rush warning, then stop its accelerating crash before the blast. / 精英自爆卡车：看到红色冲锋预警后，赶在加速撞击和爆炸前拦截。"
    },
    {
      id: "rpgInfantry",
      name: "RPG Soldier",
      hp: 1,
      damage: 2,
      intro: "Anti-tank RPG soldier. Its missile deals 2 HP damage. / 反坦克火箭兵，导弹会造成 2 点生命伤害。"
    },
    {
      id: "heavyInfantry",
      name: "Heavy Soldier",
      hp: 2,
      damage: 1,
      attackStyle: "melee",
      approachDistance: 92,
      intro: "Heavy soldier. It closes in while you answer. / 重装士兵会在你答题时不断逼近。"
    }
  ];

  const eliteTypes = [
    {
      id: "springSoldier",
      name: "Spring Soldier",
      hp: 2,
      damage: 1,
      attackInterval: 4,
      attackStyle: "springHop",
      role: "elite",
      reloadMotion: "approach",
      approachDistance: 118,
      telegraph: "coilCompress",
      attackTiming: "hop-hop-bounce",
      hitReaction: "elasticRecoil",
      deathVfx: "springScatter",
      scaleWithStage: false,
      asset: {
        status: "interim-gallery-bitmap-pending-final-generation",
        promptSpec: "assets/source/enemy-candidates/spring-soldier-spritesheet.prompt.md",
        galleryPreview: "assets/sprites/enemies/gallery/spring-soldier-interim-preview.png",
        gallerySpritesheet: "assets/sprites/enemies/gallery/spring-soldier-interim-spritesheet.png",
        fallback: "assets/enemy-heavy-infantry.svg"
      },
      intro: "Elite spring soldier. It compresses, hops forward, then rebounds from hits. / 精英弹簧兵：压缩弹簧后跳跃接近，被击中会弹性后退。"
    },
    {
      id: "droneSwarm",
      name: "Drone Swarm",
      hp: 3,
      damage: 1,
      attackInterval: 4,
      attackStyle: "droneSwarm",
      role: "elite",
      reloadMotion: "orbit",
      telegraph: "orbitCharge",
      attackTiming: "orbit-lock-volley",
      hitReaction: "emStun",
      deathVfx: "swarmDispersal",
      scaleWithStage: false,
      asset: {
        status: "interim-gallery-bitmap-pending-final-generation",
        promptSpec: "assets/source/enemy-candidates/drone-swarm-spritesheet.prompt.md",
        galleryPreview: "assets/sprites/enemies/gallery/drone-swarm-interim-preview.png",
        gallerySpritesheet: "assets/sprites/enemies/gallery/drone-swarm-interim-spritesheet.png",
        fallback: "assets/enemy-scout.svg"
      },
      intro: "Elite drone swarm. Small drones orbit, lock on, and fire a staggered volley. / 精英无人机群：小无人机环绕锁定，随后分段齐射。"
    },
    {
      id: "droneSwarmBoss",
      name: "Drone Swarm Boss",
      hp: 4,
      damage: 1,
      attackInterval: 4,
      attackStyle: "droneSwarm",
      role: "boss",
      reloadMotion: "orbit",
      telegraph: "orbitCharge",
      attackTiming: "first-defeat-split-five-lanes",
      hitReaction: "emStun",
      deathVfx: "swarmDispersal",
      scaleWithStage: false,
      splitPhase: {
        type: "droneSwarmBoss",
        count: 5,
        droneHp: 2,
        droneDamage: 1,
        droneAttackInterval: 4,
        droneVariants: [
          { id: "droneSwarmBossDrone1", name: "Scout Drone", asset: "assets/sprites/enemies/drone-swarm-boss-drone-1.png" },
          { id: "droneSwarmBossDrone2", name: "Shield Drone", asset: "assets/sprites/enemies/drone-swarm-boss-drone-2.png" },
          { id: "droneSwarmBossDrone3", name: "Pulse Drone", asset: "assets/sprites/enemies/drone-swarm-boss-drone-3.png" },
          { id: "droneSwarmBossDrone4", name: "Spark Drone", asset: "assets/sprites/enemies/drone-swarm-boss-drone-4.png" },
          { id: "droneSwarmBossDrone5", name: "Command Drone", asset: "assets/sprites/enemies/drone-swarm-boss-drone-5.png" }
        ]
      },
      asset: {
        status: "interim-derived-bitmap-pending-final-generation",
        promptSpec: "assets/source/enemy-candidates/drone-swarm-boss-spritesheet.prompt.md",
        runtimePreview: "assets/sprites/enemies/drone-swarm-boss-interim-preview.png",
        runtimeSpritesheet: "assets/sprites/enemies/drone-swarm-boss-interim-spritesheet.png",
        fallback: "assets/enemy-scout.svg"
      },
      intro: "Boss drone swarm. Defeat the formation once, then it splits into five Hanzi drones across lanes. / Boss 无人机群：先击破编队，再分裂为五条路线上的汉字无人机。"
    },
    {
      id: "bouncingTankBoss",
      name: "Bouncing Tank Boss",
      hp: 10,
      damage: 1,
      attackInterval: 4,
      attackStyle: "bouncingDodge",
      role: "boss",
      reloadMotion: "hop",
      telegraph: "malfunctionSpark",
      attackTiming: "dodge-three-then-malfunction-window",
      hitReaction: "electricFault",
      deathVfx: "bossExplosion",
      scaleWithStage: false,
      bossMechanic: {
        type: "bouncingTankBoss",
        dodgesUntilMalfunction: 3
      },
      asset: {
        status: "user-provided-bitmap",
        promptSpec: "assets/source/enemy-candidates/bouncing-tank-boss-spritesheet.prompt.md",
        sourceImagePath: "assets/source/enemy-candidates/bouncing-tank-boss-reference.png",
        runtimeSpritesheet: "assets/sprites/enemies/bouncing-tank-boss-spritesheet.png",
        galleryPreview: "assets/sprites/enemies/gallery/bouncing-tank-boss-preview.png",
        gallerySpritesheet: "assets/sprites/enemies/bouncing-tank-boss-spritesheet.png",
        frameWidth: 469,
        frameHeight: 300,
        columns: 6,
        rows: 5,
        frames: {
          idle: [0, 1, 2, 3, 4, 5],
          dodge: [0, 1, 2, 3, 4, 5],
          fire: [6, 7, 8, 9, 10, 11],
          smoke: [12, 13, 14, 15, 16, 17],
          weak: [18, 19, 20],
          malfunctionSpark: [21, 22, 23],
          destroyed: [24, 25, 26, 27, 28, 29]
        },
        fallback: "assets/enemy-armor.svg"
      },
      intro: "Boss Bouncing Tank. Correct attacks make it leap away three times. When it sparks and malfunctions, strike fast before it recovers. / Boss 弹跳坦克：答对开火会让它连续弹跳躲避三次；冒电火花机械故障时，立刻抓住机会攻击。"
    },
    {
      id: "wolfPack",
      name: "Mechanical Wolf Pack",
      hp: 4,
      damage: 2,
      attackInterval: 5,
      attackStyle: "wolfPack",
      role: "elite",
      reloadMotion: "approach",
      approachDistance: 138,
      telegraph: "flankPounce",
      attackTiming: "dash-flank-pounce",
      hitReaction: "metalSparks",
      deathVfx: "packBreakApart",
      scaleWithStage: false,
      asset: {
        status: "interim-gallery-bitmap-pending-final-generation",
        promptSpec: "assets/source/enemy-candidates/mechanical-wolf-pack-spritesheet.prompt.md",
        galleryPreview: "assets/sprites/enemies/gallery/mechanical-wolf-pack-interim-preview.png",
        gallerySpritesheet: "assets/sprites/enemies/gallery/mechanical-wolf-pack-interim-spritesheet.png",
        fallback: "assets/enemy-armor.svg"
      },
      intro: "Elite wolf pack. It splits into flanking dashes, then pounces in staggered hits. / 精英机械狼群：分散侧翼冲刺，再分段扑击。"
    },
    {
      id: "mechanicalFleas",
      name: "Mechanical Fleas",
      hp: 2,
      damage: 1,
      attackInterval: 3,
      attackStyle: "fleaHop",
      role: "elite",
      reloadMotion: "approach",
      approachDistance: 92,
      telegraph: "rapidHops",
      attackTiming: "tiny-hop-chip",
      hitReaction: "squishSpark",
      deathVfx: "popBurst",
      scaleWithStage: false,
      asset: {
        status: "interim-gallery-bitmap-pending-final-generation",
        promptSpec: "assets/source/enemy-candidates/mechanical-fleas-spritesheet.prompt.md",
        galleryPreview: "assets/sprites/enemies/gallery/mechanical-fleas-interim-preview.png",
        gallerySpritesheet: "assets/sprites/enemies/gallery/mechanical-fleas-interim-spritesheet.png",
        fallback: "assets/enemy-scout.svg"
      },
      intro: "Elite mechanical fleas. Tiny jumpers hop quickly and chip the tank if ignored. / 精英机械跳蚤：小型跳跃单位快速骚扰，拖延会造成轻伤害。"
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
    intro: "Stage 5 Boss. Listen to one Hanzi, find it, then fire before the hammer lands. / 第 5 关 Boss：听一个汉字，找出它，在铁锤落下前开火。"
  };

  const enemyPortraitDetails = {
    tank: "Basic armored target. Clean silhouette for early stages. / 基础装甲目标，轮廓清晰，适合前期关卡。",
    infantry: "Regular soldier with rifle spritesheet and low damage. / 持步枪的普通士兵动画，伤害较低。",
    armor: "Armored tank with absolute defense and plating. / 带绝对防御和护甲板的装甲坦克。",
    heavyInfantry: "Heavy soldier with thicker armor and bigger stance. / 重装士兵，护甲更厚，体型更有压迫感。",
    truck: "Elite rush unit with a red warning, accelerating crash, explosion impact, and debris death burst. / 带红色预警、加速撞击、爆炸冲击和碎片死亡效果的精英冲锋单位。",
    springSoldier: "Spring-legged elite that telegraphs with coil compression, bounces into attack, recoils elastically on hit, and scatters springs on defeat. / 弹簧腿精英：压缩预警、跳跃攻击、受击弹回、击毁时弹簧散落。",
    droneSwarm: "Orbiting mini-drone elite with charge rings, staggered volley fire, EM stun sparks on hit, and swarm dispersal on defeat. / 环绕小无人机精英：充能环、分段齐射、受击电磁火花、击毁时群体散开。",
    droneSwarmBoss: "Multi-phase drone swarm Boss. First defeat splits into five separate lane drones, each carrying its own Hanzi target until every drone is destroyed. / 多阶段无人机群 Boss：第一次击破后分裂成五个带独立汉字目标的路线无人机，全部击毁才算胜利。",
    bouncingTankBoss: "Bouncing Tank Boss that dodges three attacks, then suffers a spark-filled mechanical malfunction that creates a short damage window. / 弹跳坦克 Boss：连续弹跳躲避三次后机械故障冒电火花，短暂露出可攻击窗口。",
    wolfPack: "Mechanical pack elite that flanks before staggered pounces, throws metal sparks on hit, and breaks apart into multiple chassis pieces. / 机械狼群精英：侧翼包抄、分段扑击、受击金属火花、击毁时多机体解体。",
    mechanicalFleas: "Tiny jumping elite swarm with rapid hop telegraphs, chip-damage pressure, squish sparks on hit, and pop bursts on defeat. / 小型跳跃精英群：快速跳跃预警、轻伤害压迫、受击压扁火花、击毁时爆裂弹出。",
    rpgInfantry: "Anti-tank RPG soldier. Low HP but dangerous burst damage. / 反坦克火箭兵，生命低但爆发伤害危险。",
    grenadier: "Grenadier with explosives. Low HP but hits for 2 damage. / 携带爆炸物的榴弹兵，生命低但可造成 2 点伤害。",
    boss: "Boss portrait for the Tank Dismantler hammer fight. / 坦克拆解者铁锤 Boss 战头像。"
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
    truck: "assets/sprites/enemies/gallery/self-destruct-truck-interim-preview.png",
    scout: "assets/enemy-scout.svg",
    springSoldier: "assets/enemy-heavy-infantry.svg",
    droneSwarm: "assets/enemy-scout.svg",
    droneSwarmBoss: "assets/sprites/enemies/drone-swarm-boss-interim-preview.png",
    bouncingTankBoss: "assets/sprites/enemies/gallery/bouncing-tank-boss-preview.png",
    droneSwarmBossDrone1: "assets/sprites/enemies/drone-swarm-boss-drone-1.png",
    droneSwarmBossDrone2: "assets/sprites/enemies/drone-swarm-boss-drone-2.png",
    droneSwarmBossDrone3: "assets/sprites/enemies/drone-swarm-boss-drone-3.png",
    droneSwarmBossDrone4: "assets/sprites/enemies/drone-swarm-boss-drone-4.png",
    droneSwarmBossDrone5: "assets/sprites/enemies/drone-swarm-boss-drone-5.png",
    wolfPack: "assets/enemy-armor.svg",
    mechanicalFleas: "assets/enemy-scout.svg",
    grenadier: "assets/enemy-rpg-infantry.svg",
    infantry: "assets/enemy-infantry.svg",
    heavyInfantry: "assets/enemy-heavy-infantry.svg",
    rpgInfantry: "assets/enemy-rpg-infantry.svg"
  };

  const enemyGallerySpriteSheets = {
    enemyTank: {
      url: "assets/sprites/enemies/enemy-tank-spritesheet.png?v=20260525",
      frameWidth: 224,
      frameHeight: 144,
      columns: 4
    },
    regularEnemyTank: {
      url: "assets/sprites/enemies/regular-enemy-tank-spritesheet.png?v=20260525",
      frameWidth: 469,
      frameHeight: 300,
      columns: 6
    },
    regularInfantry: {
      url: "assets/sprites/enemies/regular-infantry-spritesheet.png?v=20260525",
      frameWidth: 469,
      frameHeight: 300,
      columns: 6
    },
    grenadier: {
      url: "assets/sprites/enemies/grenadier-spritesheet.png?v=20260525",
      frameWidth: 469,
      frameHeight: 300,
      columns: 6
    },
    bossTankDismantler: {
      url: "assets/sprites/enemies/tank-dismantler-spritesheet.png?v=20260525",
      frameWidth: 224,
      frameHeight: 224,
      columns: 6
    },
    selfDestructTruckInterim: {
      url: "assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png?v=20260530",
      frameWidth: 469,
      frameHeight: 300,
      columns: 6
    },
    springSoldierInterim: {
      url: "assets/sprites/enemies/gallery/spring-soldier-interim-spritesheet.png?v=20260529",
      frameWidth: 256,
      frameHeight: 192,
      columns: 4
    },
    droneSwarmInterim: {
      url: "assets/sprites/enemies/gallery/drone-swarm-interim-spritesheet.png?v=20260529",
      frameWidth: 256,
      frameHeight: 192,
      columns: 4
    },
    droneSwarmBossInterim: {
      url: "assets/sprites/enemies/drone-swarm-boss-interim-spritesheet.png?v=20260529",
      frameWidth: 256,
      frameHeight: 192,
      columns: 4
    },
    bouncingTankBoss: {
      url: "assets/sprites/enemies/bouncing-tank-boss-spritesheet.png?v=20260605",
      frameWidth: 469,
      frameHeight: 300,
      columns: 6
    },
    wolfPackInterim: {
      url: "assets/sprites/enemies/gallery/mechanical-wolf-pack-interim-spritesheet.png?v=20260529",
      frameWidth: 256,
      frameHeight: 192,
      columns: 4
    },
    mechanicalFleasInterim: {
      url: "assets/sprites/enemies/gallery/mechanical-fleas-interim-spritesheet.png?v=20260529",
      frameWidth: 256,
      frameHeight: 192,
      columns: 4
    }
  };

  const enemyGalleryPreviewMap = {
    tank: {
      cardArt: "assets/sprites/enemies/gallery/tank-preview.png",
      sheet: "enemyTank",
      artStatus: "project-native-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/enemy-tank-spritesheet.png",
      fallbackSvg: "assets/enemy-tank.svg",
      animation: { start: 0, end: 3, frameRate: 6, attackStart: 4, attackEnd: 7, attackFrameRate: 10, maxHeight: 205, y: 198 }
    },
    armor: {
      cardArt: "assets/sprites/enemies/gallery/armored-tank-preview.png",
      sheet: "regularEnemyTank",
      artStatus: "project-native-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/regular-enemy-tank-spritesheet.png",
      fallbackSvg: "assets/enemy-armor.svg",
      animation: { start: 0, end: 5, frameRate: 8, attackStart: 6, attackEnd: 11, attackFrameRate: 10, maxHeight: 230, y: 198 }
    },
    truck: {
      cardArt: "assets/sprites/enemies/gallery/self-destruct-truck-interim-preview.png",
      sheet: "selfDestructTruckInterim",
      artStatus: "interim-derived-bitmap-pending-final-generation",
      sourceSpritesheetPath: "assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png",
      promptSpec: "assets/source/enemy-candidates/self-destruct-truck-spritesheet.prompt.md",
      fallbackSvg: "assets/enemy-suicide-truck.svg",
      animation: { start: 0, end: 5, frameRate: 8, attackStart: 6, attackEnd: 17, attackFrameRate: 12, maxHeight: 235, displayScale: 1.02, y: 198 }
    },
    infantry: {
      cardArt: "assets/sprites/enemies/gallery/regular-soldier-preview.png",
      sheet: "regularInfantry",
      artStatus: "project-native-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/regular-infantry-spritesheet.png",
      fallbackSvg: "assets/enemy-infantry.svg",
      animation: { start: 0, end: 5, frameRate: 8, attackStart: 6, attackEnd: 11, attackFrameRate: 10, maxHeight: 235, y: 214 }
    },
    grenadier: {
      cardArt: "assets/sprites/enemies/gallery/grenadier-preview.png",
      sheet: "grenadier",
      artStatus: "project-native-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/grenadier-spritesheet.png",
      fallbackSvg: "assets/enemy-rpg-infantry.svg",
      animation: { start: 0, end: 5, frameRate: 8, attackStart: 6, attackEnd: 11, attackFrameRate: 10, maxHeight: 235, y: 214 }
    },
    rpgInfantry: {
      cardArt: "assets/sprites/enemies/gallery/rpg-soldier-preview.png",
      sheet: "grenadier",
      artStatus: "derived-bitmap-from-infantry-sheet",
      sourceSpritesheetPath: "assets/sprites/enemies/grenadier-spritesheet.png",
      fallbackSvg: "assets/enemy-rpg-infantry.svg",
      animation: { start: 0, end: 5, frameRate: 8, attackStart: 6, attackEnd: 11, attackFrameRate: 10, maxHeight: 235, y: 214 }
    },
    heavyInfantry: {
      cardArt: "assets/sprites/enemies/gallery/heavy-soldier-preview.png",
      sheet: "regularInfantry",
      artStatus: "derived-bitmap-from-infantry-sheet",
      sourceSpritesheetPath: "assets/sprites/enemies/regular-infantry-spritesheet.png",
      fallbackSvg: "assets/enemy-heavy-infantry.svg",
      animation: { start: 0, end: 5, frameRate: 7, attackStart: 6, attackEnd: 11, attackFrameRate: 9, maxHeight: 245, displayScale: 1.04, y: 214 }
    },
    springSoldier: {
      cardArt: "assets/sprites/enemies/gallery/spring-soldier-interim-preview.png",
      sheet: "springSoldierInterim",
      artStatus: "interim-derived-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/regular-infantry-spritesheet.png",
      promptSpec: "assets/source/enemy-candidates/spring-soldier-spritesheet.prompt.md",
      fallbackSvg: "assets/enemy-heavy-infantry.svg",
      animation: { start: 0, end: 3, frameRate: 10, attackStart: 4, attackEnd: 7, attackFrameRate: 12, maxHeight: 236, displayScale: 0.96, y: 214 }
    },
    droneSwarm: {
      cardArt: "assets/sprites/enemies/gallery/drone-swarm-interim-preview.png",
      sheet: "droneSwarmInterim",
      artStatus: "interim-derived-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/enemy-tank-spritesheet.png",
      promptSpec: "assets/source/enemy-candidates/drone-swarm-spritesheet.prompt.md",
      fallbackSvg: "assets/enemy-scout.svg",
      animation: { start: 0, end: 3, frameRate: 11, attackStart: 4, attackEnd: 7, attackFrameRate: 14, maxHeight: 205, displayScale: 0.92, y: 198 }
    },
    droneSwarmBoss: {
      cardArt: "assets/sprites/enemies/drone-swarm-boss-interim-preview.png",
      sheet: "droneSwarmBossInterim",
      artStatus: "interim-derived-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/enemy-tank-spritesheet.png",
      promptSpec: "assets/source/enemy-candidates/drone-swarm-boss-spritesheet.prompt.md",
      fallbackSvg: "assets/enemy-scout.svg",
      animation: { start: 0, end: 3, frameRate: 10, attackStart: 8, attackEnd: 11, attackFrameRate: 13, maxHeight: 210, displayScale: 0.94, y: 198 }
    },
    bouncingTankBoss: {
      cardArt: "assets/sprites/enemies/gallery/bouncing-tank-boss-preview.png",
      sheet: "bouncingTankBoss",
      artStatus: "user-provided-bitmap",
      sourceSpritesheetPath: "assets/source/enemy-candidates/bouncing-tank-boss-reference.png",
      promptSpec: "assets/source/enemy-candidates/bouncing-tank-boss-spritesheet.prompt.md",
      fallbackSvg: "assets/enemy-armor.svg",
      animation: { start: 0, end: 5, frameRate: 10, attackStart: 21, attackEnd: 23, attackFrameRate: 12, maxHeight: 242, displayScale: 1.08, y: 198 }
    },
    wolfPack: {
      cardArt: "assets/sprites/enemies/gallery/mechanical-wolf-pack-interim-preview.png",
      sheet: "wolfPackInterim",
      artStatus: "interim-derived-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/regular-enemy-tank-spritesheet.png",
      promptSpec: "assets/source/enemy-candidates/mechanical-wolf-pack-spritesheet.prompt.md",
      fallbackSvg: "assets/enemy-armor.svg",
      animation: { start: 0, end: 3, frameRate: 9, attackStart: 4, attackEnd: 7, attackFrameRate: 13, maxHeight: 218, displayScale: 0.98, y: 202 }
    },
    mechanicalFleas: {
      cardArt: "assets/sprites/enemies/gallery/mechanical-fleas-interim-preview.png",
      sheet: "mechanicalFleasInterim",
      artStatus: "interim-derived-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/enemy-tank-spritesheet.png",
      promptSpec: "assets/source/enemy-candidates/mechanical-fleas-spritesheet.prompt.md",
      fallbackSvg: "assets/enemy-scout.svg",
      animation: { start: 0, end: 3, frameRate: 12, attackStart: 4, attackEnd: 7, attackFrameRate: 15, maxHeight: 160, displayScale: 0.78, y: 232 }
    },
    boss: {
      cardArt: "assets/sprites/enemies/gallery/tank-dismantler-preview.png",
      sheet: "bossTankDismantler",
      artStatus: "project-native-bitmap",
      sourceSpritesheetPath: "assets/sprites/enemies/tank-dismantler-spritesheet.png",
      fallbackSvg: "assets/enemy-boss-dismantler.svg",
      animation: { start: 0, end: 5, frameRate: 8, attackStart: 6, attackEnd: 11, attackFrameRate: 10, maxHeight: 210, y: 154 }
    }
  };

  const debugTargets = [
    { stage: 1, enemyId: "tank", category: "Enemy", title: "Tank", desc: "Direct enemy test: basic tank battle. / 敌人直测：基础坦克战。" },
    { stage: 2, enemyId: "infantry", category: "Enemy", title: "Regular Soldier", desc: "Direct enemy test: regular soldier spritesheet, 2 HP, faster first injury risk. / 敌人直测：普通士兵动画，2 点生命，受伤风险更快到来。" },
    { stage: 3, enemyId: "armor", category: "Enemy", title: "Armored Tank", desc: "Direct enemy test: absolute defense plus armor. / 敌人直测：绝对防御加护甲。" },
    { stage: 4, enemyId: "grenadier", category: "Enemy", title: "Grenadier", desc: "Direct enemy test: 1 HP, 2 damage, shorter attack timer. / 敌人直测：1 点生命、2 点伤害、攻击倒计时更短。" },
    { stage: 6, enemyId: "rpgInfantry", category: "Enemy", title: "RPG Soldier", desc: "Direct enemy test: 1 HP, 2 damage anti-tank unit. / 敌人直测：1 点生命、2 点伤害的反坦克单位。" },
    { stage: 7, enemyId: "heavyInfantry", category: "Enemy", title: "Heavy Soldier", desc: "Direct enemy test: melee approach pressure. / 敌人直测：近战逼近压力。" },
    { stage: 5, enemyId: "boss", category: "Boss", title: "Tank Dismantler Boss", desc: "Direct Boss test: first listening challenge and hammer attack. / Boss 直测：首次听力挑战和铁锤攻击。" },
    { stage: 10, enemyId: "boss", category: "Boss", title: "Tank Dismantler Boss II", desc: "Direct Boss test: repeated Boss flow at Stage 10 pacing. / Boss 直测：第 10 关节奏下的重复 Boss 流程。" },
    { stage: 15, enemyId: "boss", category: "Boss", title: "Tank Dismantler Boss III", desc: "Direct Boss test: later-run Boss checkpoint for scaling and rewards. / Boss 直测：后期 Boss 节点，检查成长和奖励节奏。" },
    { stage: 12, enemyId: "truck", category: "Elite", title: "Self-Destruct Truck", desc: "Direct elite test: rush warning, acceleration, explosion, debris death. / 精英直测：冲锋预警、加速、爆炸、碎片击毁。" },
    { stage: 21, enemyId: "springSoldier", category: "Elite", title: "Spring Soldier", desc: "Direct elite test: spring-hop approach, bounce attack, elastic recoil, spring scatter. / 精英直测：弹簧跳跃、反弹攻击、弹性受击、弹簧散落。" },
    { stage: 22, enemyId: "droneSwarm", category: "Elite", title: "Drone Swarm", desc: "Direct elite test: orbiting drones, volley attack, EM stun sparks, swarm dispersal. / 精英直测：无人机环绕、齐射、电磁火花、群体散开。" },
    { stage: 25, enemyId: "droneSwarmBoss", category: "Boss", title: "Drone Swarm Boss", desc: "Direct Boss test: defeat the swarm once, split into five Hanzi lane drones, clear all five. / Boss 直测：先击破无人机群，再分裂为五个汉字路线无人机并全部清除。" },
    { stage: 26, enemyId: "bouncingTankBoss", category: "Boss", title: "Bouncing Tank Boss", desc: "Direct Boss test: three dodge jumps, spark malfunction window, 10 HP weak and destroyed states. / Boss 直测：三次弹跳躲避、冒电火花故障窗口、10 点血弱化和损毁状态。" },
    { stage: 23, enemyId: "wolfPack", category: "Elite", title: "Mechanical Wolf Pack", desc: "Direct elite test: flank dash, staggered pounce, metal sparks, pack break-apart. / 精英直测：侧翼冲刺、分段扑击、金属火花、狼群解体。" },
    { stage: 24, enemyId: "mechanicalFleas", category: "Elite", title: "Mechanical Fleas", desc: "Direct elite test: rapid hops, chip pressure, squish sparks, pop destruction. / 精英直测：快速跳跃、轻伤压迫、压扁火花、爆裂击毁。" }
  ];

  return {
    levelTypes,
    eliteTypes,
    bossTemplate,
    enemyPortraitDetails,
    tankSpriteMap,
    enemySpriteMap,
    enemyGallerySpriteSheets,
    enemyGalleryPreviewMap,
    debugTargets
  };
});
