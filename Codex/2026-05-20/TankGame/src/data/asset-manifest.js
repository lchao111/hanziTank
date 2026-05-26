(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankAssets = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const assetSourceGuidelines = {
    preferredSources: ["Itch.io", "OpenGameArt.org"],
    preferredSearches: ["Top down Tank Sprite", "WW2 tank sprites", "top down vehicle pack", "orthographic tank"],
    requiredLicenseNoteFolder: "assets/licenses/",
    preferredFormats: ["transparent PNG spritesheet", "Phaser texture atlas", "separate hull and turret sprites"],
    importStrategy: "Import one actor or equipment category at a time and keep existing SVGs as fallback until verified."
  };

  const plannedAssetFolders = {
    tankSprites: "assets/sprites/tanks/",
    enemySprites: "assets/sprites/enemies/",
    effectSprites: "assets/sprites/effects/",
    atlases: "assets/atlases/",
    licenses: "assets/licenses/"
  };

  const spriteActorSchema = {
    id: "unique actor id matching shop/enemy data where possible",
    source: "asset source name or URL",
    license: "license identifier and local note path",
    hullTexture: "Phaser texture key for hull sprite",
    turretTexture: "optional Phaser texture key for turret sprite",
    destroyedFrames: "optional destruction animation frame prefix or atlas key",
    muzzleFlashFrames: "optional muzzle flash animation frame prefix or atlas key",
    fallbackSvg: "existing SVG path to keep DOM fallback available"
  };

  const importedSpriteTrials = [
    {
      id: "kenney-green-player-trial",
      source: "Kenney Top-down Tanks Redux via OpenGameArt.org",
      license: "CC0; see assets/licenses/kenney_topdownTanksRedux_LICENSE.txt",
      hullTexture: "kenney:playerHull",
      hullPath: "assets/sprites/tanks/kenney/tankBody_green.png",
      turretTexture: "kenney:playerTurret",
      turretPath: "assets/sprites/tanks/kenney/tankGreen_barrel1.png",
      fallbackSvg: "assets/tank-sherman.svg"
    },
    {
      id: "kenney-red-enemy-trial",
      source: "Kenney Top-down Tanks Redux via OpenGameArt.org",
      license: "CC0; see assets/licenses/kenney_topdownTanksRedux_LICENSE.txt",
      hullTexture: "kenney:enemyHull",
      hullPath: "assets/sprites/tanks/kenney/tankBody_red.png",
      turretTexture: "kenney:enemyTurret",
      turretPath: "assets/sprites/tanks/kenney/tankRed_barrel1.png",
      fallbackSvg: "assets/enemy-tank.svg"
    },
    {
      id: "tank-dismantler-boss-spritesheet",
      source: "User-provided Tank Breaker Robot reference, grid-cropped into Phaser frames",
      license: "User-provided reference asset; store source at assets/source/tank-dismantler-level5-boss-reference.png",
      texture: "bossTankDismantler",
      spritesheetPath: "assets/sprites/enemies/tank-dismantler-spritesheet.png",
      frameWidth: 224,
      frameHeight: 224,
      walkFrames: [0, 1, 2, 3, 4, 5],
      attackFrames: [6, 7, 8, 9, 10, 11],
      fallbackSvg: "assets/enemy-boss-dismantler.svg"
    },
    {
      id: "player-tank-battle-spritesheet",
      source: "Generated side-view player tank battle states",
      license: "Project-generated asset",
      texture: "playerTankBattle",
      spritesheetPath: "assets/sprites/tanks/player-tank-spritesheet.png",
      frameWidth: 224,
      frameHeight: 144,
      idleFrames: [0, 1, 2, 3, 4, 5],
      fireFrames: [6, 7, 8, 9, 10, 11],
      heavyFireFrames: [12, 13, 14, 15, 16, 17],
      hitFrames: [18, 19, 20, 21, 22, 23],
      weakFrames: [18, 19, 20, 21, 22, 23],
      destroyedFrames: [24, 25, 26, 27, 28, 29],
      fallbackSvg: "assets/tank-sherman.svg"
    },
    {
      id: "regular-infantry-spritesheet",
      source: "User-provided regular soldier spritesheet, green-screen removed into Phaser frames",
      license: "User-provided reference asset; source file from Downloads/普通士兵.png",
      texture: "regularInfantry",
      spritesheetPath: "assets/sprites/enemies/regular-infantry-spritesheet.png",
      frameWidth: 469,
      frameHeight: 300,
      walkFrames: [0, 1, 2, 3, 4, 5],
      fireFrames: [6, 7, 8, 9, 10, 11],
      hitFrames: [18, 19, 20, 21, 22, 23],
      fallbackSvg: "assets/enemy-infantry.svg"
    },
    {
      id: "regular-enemy-tank-spritesheet",
      source: "User-provided regular enemy tank spritesheet, green-screen removed into Phaser frames",
      license: "User-provided reference asset; source file from Downloads/普通敌方坦克.png",
      texture: "regularEnemyTank",
      spritesheetPath: "assets/sprites/enemies/regular-enemy-tank-spritesheet.png",
      frameWidth: 469,
      frameHeight: 300,
      idleFrames: [0, 1, 2, 3, 4, 5],
      fireFrames: [6, 7, 8, 9, 10, 11],
      hitFrames: [18, 19, 20, 21, 22, 23],
      fallbackSvg: "assets/enemy-armor.svg"
    },
    {
      id: "grenadier-spritesheet",
      source: "User-provided grenadier spritesheet, green-screen removed into Phaser frames",
      license: "User-provided reference asset; source file from Downloads/榴弹兵.png",
      texture: "grenadier",
      spritesheetPath: "assets/sprites/enemies/grenadier-spritesheet.png",
      frameWidth: 469,
      frameHeight: 300,
      walkFrames: [0, 1, 2, 3, 4, 5],
      fireFrames: [6, 7, 8, 9, 10, 11],
      hitFrames: [18, 19, 20, 21, 22, 23],
      fallbackSvg: "assets/enemy-rpg-infantry.svg"
    },
    {
      id: "burned-trees-spritesheet",
      source: "User-provided Gemini burned tree reference, green-screen removed into Phaser prop frames",
      license: "User-provided reference asset; source file from Downloads/Gemini_Generated_Image_8ghsnv8ghsnv8ghs.png",
      texture: "burnedTrees",
      spritesheetPath: "assets/sprites/environment/burned-trees-spritesheet.png",
      frameWidth: 704,
      frameHeight: 1536,
      propFrames: [0, 1, 2, 3]
    },
    {
      id: "ruined-houses-spritesheet",
      source: "User-provided Gemini burned houses sheet, green-screen removed into Phaser prop frames",
      license: "User-provided reference asset; source file from Downloads/Gemini_Generated_Image_7h7d9n7h7d9n7h7d.png",
      texture: "ruinedHouses",
      spritesheetPath: "assets/sprites/environment/ruined-houses-spritesheet.png",
      frameWidth: 938,
      frameHeight: 768,
      propFrames: [0, 1, 2, 3, 4]
    },
    {
      id: "trench-strips-spritesheet",
      source: "User-provided Gemini trench and sandbag strips, green-screen removed into Phaser prop frames",
      license: "User-provided reference asset; source file from Downloads/Gemini_Generated_Image_hwzxzhwzxzhwzxzh.png",
      texture: "trenchStrips",
      spritesheetPath: "assets/sprites/environment/trench-strips-spritesheet.png",
      frameWidth: 2816,
      frameHeight: 512,
      propFrames: [0, 1, 2]
    },
    {
      id: "crater-tracks-spritesheet",
      source: "User-provided Gemini craters and muddy tracks sheet, green-screen removed into Phaser prop frames",
      license: "User-provided reference asset; source file from Downloads/Gemini_Generated_Image_o6kd99o6kd99o6kd.png",
      texture: "craterTracks",
      spritesheetPath: "assets/sprites/environment/crater-tracks-spritesheet.png",
      frameWidth: 938,
      frameHeight: 768,
      propFrames: [0, 1, 2, 3, 4, 5]
    },
    {
      id: "forest-clusters-spritesheet",
      source: "User-provided Gemini forest cluster sheet, white background removed into Phaser prop frames",
      license: "User-provided reference asset; source file from Downloads/Gemini_Generated_Image_ij3iccij3iccij3i.png",
      texture: "forestClusters",
      spritesheetPath: "assets/sprites/environment/forest-clusters-spritesheet.png",
      frameWidth: 1408,
      frameHeight: 768,
      propFrames: [0, 1, 2, 3]
    },
    {
      id: "cohesive-battlefield-background",
      source: "User-provided Gemini cohesive battlefield background with built-in roads, ruins, trees, wrecks, and lane space",
      license: "User-provided reference asset; source file from Downloads/Gemini_Generated_Image_y11swmy11swmy11s.png",
      texture: "css:battlefield-background",
      imagePath: "assets/sprites/environment/battlefield-background.png",
      width: 2752,
      height: 1536
    }
  ];

  return {
    assetSourceGuidelines,
    plannedAssetFolders,
    spriteActorSchema,
    importedSpriteTrials
  };
});
