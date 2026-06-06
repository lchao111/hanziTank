const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');
const assets = require('../src/data/asset-manifest.js');

assert.ok(assets.assetSourceGuidelines.preferredSources.includes('Itch.io'));
assert.ok(assets.assetSourceGuidelines.preferredSources.includes('OpenGameArt.org'));
assert.ok(assets.assetSourceGuidelines.preferredSearches.includes('Top down Tank Sprite'));
assert.strictEqual(assets.assetSourceGuidelines.requiredLicenseNoteFolder, 'assets/licenses/');
assert.strictEqual(assets.plannedAssetFolders.tankSprites, 'assets/sprites/tanks/');
assert.strictEqual(assets.plannedAssetFolders.warPrepTankPreviews, 'assets/sprites/tanks/war-prep/');
assert.strictEqual(assets.plannedAssetFolders.effectSprites, 'assets/sprites/effects/');
assert.strictEqual(assets.plannedAssetFolders.rankSprites, 'assets/sprites/ranks/');
assert.strictEqual(assets.plannedAssetFolders.uiSprites, 'assets/sprites/ui/');
assert.strictEqual(assets.plannedAssetFolders.licenses, 'assets/licenses/');
assert.ok(Object.prototype.hasOwnProperty.call(assets.spriteActorSchema, 'hullTexture'));
assert.ok(Object.prototype.hasOwnProperty.call(assets.spriteActorSchema, 'turretTexture'));
assert.ok(Object.prototype.hasOwnProperty.call(assets.spriteActorSchema, 'fallbackSvg'));
assert.ok(assets.importedSpriteTrials.length >= 66, 'Asset manifest should include gallery preview bitmap provenance entries.');
assert.strictEqual(assets.importedSpriteTrials[0].license.includes('CC0'), true);
assert.strictEqual(assets.importedSpriteTrials[0].hullTexture, 'kenney:playerHull');
assert.strictEqual(assets.importedSpriteTrials[1].turretTexture, 'kenney:enemyTurret');
assert.strictEqual(assets.importedSpriteTrials[2].texture, 'bossTankDismantler');
assert.strictEqual(assets.importedSpriteTrials[2].spritesheetPath, 'assets/sprites/enemies/tank-dismantler-spritesheet.png');
assert.deepStrictEqual(assets.importedSpriteTrials[2].walkFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(assets.importedSpriteTrials[2].attackFrames, [6, 7, 8, 9, 10, 11]);
const byTexture = Object.fromEntries(assets.importedSpriteTrials.map((entry) => [entry.texture, entry]));
assert.strictEqual(byTexture.playerTankBattle.spritesheetPath, 'assets/sprites/tanks/player-tank-spritesheet.png');
assert.deepStrictEqual(byTexture.playerTankBattle.idleFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.playerTankBattle.fireFrames, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(byTexture.playerTankBattle.heavyFireFrames, [12, 13, 14, 15, 16, 17]);
assert.deepStrictEqual(byTexture.playerTankBattle.hitFrames, [18, 19, 20, 21, 22, 23]);
assert.deepStrictEqual(byTexture.playerTankBattle.weakFrames, [18, 19, 20, 21, 22, 23]);
assert.deepStrictEqual(byTexture.playerTankBattle.destroyedFrames, [24, 25, 26, 27, 28, 29]);
assert.strictEqual(byTexture.playerTankTigerBattle.shopItemId, 'tank_tiger');
assert.strictEqual(byTexture.playerTankTigerBattle.spritesheetPath, 'assets/sprites/tanks/tiger-i-player-tank-spritesheet.png');
assert.strictEqual(byTexture.playerTankTigerBattle.sourceImagePath, 'assets/source/war-prep-tank-previews/tiger-i-player-reference.png');
assert.strictEqual(byTexture.playerTankTigerBattle.sourceWidth, 2816);
assert.strictEqual(byTexture.playerTankTigerBattle.sourceHeight, 1504);
assert.strictEqual(byTexture.playerTankTigerBattle.sourceColumns, 6);
assert.strictEqual(byTexture.playerTankTigerBattle.sourceRows, 5);
assert.strictEqual(byTexture.playerTankTigerBattle.frameWidth, 224);
assert.strictEqual(byTexture.playerTankTigerBattle.frameHeight, 144);
assert.strictEqual(byTexture.playerTankTigerBattle.pipelineMeta, 'assets/source/war-prep-tank-previews/tiger-i-player-pipeline-meta.json');
assert.deepStrictEqual(byTexture.playerTankTigerBattle.idleFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.playerTankTigerBattle.fireFrames, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(byTexture.playerTankTigerBattle.heavyFireFrames, [12, 13, 14, 15, 16, 17]);
assert.deepStrictEqual(byTexture.playerTankTigerBattle.hitFrames, [18, 19, 20, 21, 22, 23]);
assert.deepStrictEqual(byTexture.playerTankTigerBattle.weakFrames, [18, 19, 20, 21, 22, 23]);
assert.deepStrictEqual(byTexture.playerTankTigerBattle.destroyedFrames, [24, 25, 26, 27, 28, 29]);
assert.match(byTexture.playerTankTigerBattle.license, /user_provided_tiger_i_player_reference_LICENSE/);
assert.strictEqual(byTexture.playerTankTigerBattle.fallbackSvg, 'assets/tank-tiger.svg');
{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', byTexture.playerTankTigerBattle.spritesheetPath)));
  assert.strictEqual(dimensions.width, 1344);
  assert.strictEqual(dimensions.height, 720);
  const meta = JSON.parse(fs.readFileSync(path.join(__dirname, '..', byTexture.playerTankTigerBattle.pipelineMeta), 'utf8'));
  assert.strictEqual(meta.qc.greenResiduePixels, 0);
  assert.deepStrictEqual(meta.qc.edgeTouchFrames, []);
  assert.deepStrictEqual(meta.qc.transparentCornerAlpha, { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 });
}
assert.strictEqual(byTexture.playerTankCromwellBattle.spritesheetPath, 'assets/sprites/tanks/cromwell-player-tank-spritesheet.png');
assert.deepStrictEqual(byTexture.playerTankCromwellBattle.idleFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.playerTankCromwellBattle.destroyedFrames, [24, 25, 26, 27, 28, 29]);
assert.strictEqual(byTexture.playerTankIs2Battle.spritesheetPath, 'assets/sprites/tanks/is2-player-tank-spritesheet.png');
assert.deepStrictEqual(byTexture.playerTankIs2Battle.idleFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.playerTankIs2Battle.destroyedFrames, [24, 25, 26, 27, 28, 29]);
[
  ['css:war-prep-tank-sherman', 'tank_sherman', 'assets/sprites/tanks/war-prep/sherman.png', 'assets/source/wwii-common-tank-spritesheet.png', 'assets/tank-sherman.svg'],
  ['css:war-prep-tank-tiger', 'tank_tiger', 'assets/sprites/tanks/war-prep/tiger-i.png', 'assets/source/war-prep-tank-previews/tiger-i-player-reference.png', 'assets/tank-tiger.svg'],
  ['css:war-prep-tank-panzer4', 'tank_panzer4', 'assets/sprites/tanks/war-prep/panzer-iv.png', 'assets/source/war-prep-tank-previews/panzer-iv-player-reference.png', 'assets/tank-panzer4.svg'],
  ['css:war-prep-tank-is2', 'tank_is2', 'assets/sprites/tanks/war-prep/is-2.png', 'assets/source/is2-player-reference.png', 'assets/tank-is2.svg'],
  ['css:war-prep-tank-t34', 'tank_t34', 'assets/sprites/tanks/war-prep/t-34.png', 'assets/source/war-prep-tank-previews/t-34-player-reference.png', 'assets/tank-t34.svg'],
  ['css:war-prep-tank-cromwell', 'tank_cromwell', 'assets/sprites/tanks/war-prep/cromwell.png', 'assets/source/cromwell-player-reference.png', 'assets/tank-cromwell.svg'],
  ['css:war-prep-tank-churchill', 'tank_churchill', 'assets/sprites/tanks/war-prep/churchill.png', 'assets/source/war-prep-tank-previews/churchill-player-reference.png', 'assets/tank-churchill.svg']
].forEach(([texture, shopItemId, imagePath, sourceImagePath, fallbackSvg]) => {
  const entry = byTexture[texture];
  assert.ok(entry, `Missing manifest entry for ${texture}`);
  assert.strictEqual(entry.shopItemId, shopItemId);
  assert.strictEqual(entry.imagePath, imagePath);
  assert.match(entry.imagePath, /\.png$/);
  assert.doesNotMatch(entry.imagePath, /\.svg$/);
  assert.strictEqual(entry.sourceImagePath, sourceImagePath);
  assert.strictEqual(entry.width, 512);
  assert.strictEqual(entry.height, 320);
  assert.match(entry.license, /generated_war_prep_tank_previews_LICENSE/);
  assert.strictEqual(entry.fallbackSvg, fallbackSvg);
});
[
  ['armorPiercingShell', 'shell_ap', 'assets/sprites/effects/armor-piercing-shell-spritesheet.png'],
  ['smokeShell', 'shell_smoke', 'assets/sprites/effects/smoke-shell-spritesheet.png'],
  ['repairCapsuleShell', 'shell_repair', 'assets/sprites/effects/repair-capsule-shell-spritesheet.png'],
  ['flashFlareShell', 'shell_flash', 'assets/sprites/effects/flash-flare-shell-spritesheet.png'],
  ['longBarrelShot', 'weapon_cannon', 'assets/sprites/effects/long-barrel-shot-spritesheet.png']
].forEach(([texture, shopItemId, spritesheetPath]) => {
  const entry = byTexture[texture];
  assert.ok(entry, `Missing manifest entry for ${texture}`);
  assert.strictEqual(entry.shopItemId, shopItemId);
  assert.strictEqual(entry.spritesheetPath, spritesheetPath);
  assert.strictEqual(entry.frameWidth, 320);
  assert.strictEqual(entry.frameHeight, 192);
  assert.deepStrictEqual(entry.effectFrames, [0, 1, 2, 3]);
  assert.match(entry.license, /derived_war_prep_ammo_LICENSE/);
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', spritesheetPath)));
  assert.strictEqual(dimensions.width, 1280);
  assert.strictEqual(dimensions.height, 192);
});
assert.strictEqual(byTexture.arcaneSparkShell.spritesheetPath, 'assets/sprites/effects/arcane-spark-shell-spritesheet.png');
assert.strictEqual(byTexture.arcaneSparkShell.frameWidth, 256);
assert.strictEqual(byTexture.arcaneSparkShell.frameHeight, 160);
assert.deepStrictEqual(byTexture.arcaneSparkShell.effectFrames, [0, 1, 2, 3]);
assert.strictEqual(byTexture.highExplosiveShell.spritesheetPath, 'assets/sprites/effects/high-explosive-shell-spritesheet.png');
assert.strictEqual(byTexture.highExplosiveShell.frameWidth, 320);
assert.strictEqual(byTexture.highExplosiveShell.frameHeight, 192);
assert.deepStrictEqual(byTexture.highExplosiveShell.effectFrames, [0, 1, 2, 3]);
assert.strictEqual(byTexture.armorPlateShell.spritesheetPath, 'assets/sprites/effects/armor-plate-shell-spritesheet.png');
assert.strictEqual(byTexture.armorPlateShell.frameWidth, 320);
assert.strictEqual(byTexture.armorPlateShell.frameHeight, 192);
assert.deepStrictEqual(byTexture.armorPlateShell.effectFrames, [0, 1, 2, 3]);
assert.strictEqual(byTexture.regularInfantry.spritesheetPath, 'assets/sprites/enemies/regular-infantry-spritesheet.png');
assert.strictEqual(byTexture.regularInfantry.frameWidth, 469);
assert.strictEqual(byTexture.regularInfantry.frameHeight, 300);
assert.deepStrictEqual(byTexture.regularInfantry.walkFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.regularInfantry.fireFrames, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(byTexture.regularInfantry.hitFrames, [18, 19, 20, 21, 22, 23]);
assert.strictEqual(byTexture.regularEnemyTank.spritesheetPath, 'assets/sprites/enemies/regular-enemy-tank-spritesheet.png');
assert.strictEqual(byTexture.regularEnemyTank.frameWidth, 469);
assert.strictEqual(byTexture.regularEnemyTank.frameHeight, 300);
assert.deepStrictEqual(byTexture.regularEnemyTank.idleFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.regularEnemyTank.fireFrames, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(byTexture.regularEnemyTank.hitFrames, [18, 19, 20, 21, 22, 23]);
assert.strictEqual(byTexture.grenadier.spritesheetPath, 'assets/sprites/enemies/grenadier-spritesheet.png');
assert.strictEqual(byTexture.grenadier.frameWidth, 469);
assert.strictEqual(byTexture.grenadier.frameHeight, 300);
assert.deepStrictEqual(byTexture.grenadier.walkFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.grenadier.fireFrames, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(byTexture.grenadier.hitFrames, [18, 19, 20, 21, 22, 23]);
assert.strictEqual(byTexture.selfDestructTruckBattle.spritesheetPath, 'assets/sprites/enemies/self-destruct-truck-interim-spritesheet.png');
assert.strictEqual(byTexture.selfDestructTruckBattle.frameWidth, 469);
assert.strictEqual(byTexture.selfDestructTruckBattle.frameHeight, 300);
assert.strictEqual(byTexture.selfDestructTruckBattle.columns, 6);
assert.strictEqual(byTexture.selfDestructTruckBattle.rows, 5);
assert.deepStrictEqual(byTexture.selfDestructTruckBattle.idleFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.selfDestructTruckBattle.reloadWarningFrames, [6, 7, 8, 9, 10, 11]);
assert.deepStrictEqual(byTexture.selfDestructTruckBattle.chargeFrames, [12, 13, 14, 15, 16, 17]);
assert.deepStrictEqual(byTexture.selfDestructTruckBattle.hitFrames, [18, 19, 20]);
assert.deepStrictEqual(byTexture.selfDestructTruckBattle.explosionWindupFrames, [21, 22, 23]);
assert.deepStrictEqual(byTexture.selfDestructTruckBattle.destroyedFrames, [24, 25, 26, 27, 28, 29]);
assert.match(byTexture.selfDestructTruckBattle.license, /derived_self_destruct_truck_interim_LICENSE/);
{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', byTexture.selfDestructTruckBattle.spritesheetPath)));
  assert.strictEqual(dimensions.width, 2814);
  assert.strictEqual(dimensions.height, 1500);
}
assert.strictEqual(byTexture.bouncingTankBoss.spritesheetPath, 'assets/sprites/enemies/bouncing-tank-boss-spritesheet.png');
assert.strictEqual(byTexture.bouncingTankBoss.sourceImagePath, 'assets/source/enemy-candidates/bouncing-tank-boss-reference.png');
assert.strictEqual(byTexture.bouncingTankBoss.frameWidth, 469);
assert.strictEqual(byTexture.bouncingTankBoss.frameHeight, 300);
assert.strictEqual(byTexture.bouncingTankBoss.columns, 6);
assert.strictEqual(byTexture.bouncingTankBoss.rows, 5);
assert.deepStrictEqual(byTexture.bouncingTankBoss.idleFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.bouncingTankBoss.dodgeFrames, [0, 1, 2, 3, 4, 5]);
assert.deepStrictEqual(byTexture.bouncingTankBoss.malfunctionSparkFrames, [21, 22, 23]);
assert.deepStrictEqual(byTexture.bouncingTankBoss.weakFrames, [18, 19, 20]);
assert.deepStrictEqual(byTexture.bouncingTankBoss.destroyedFrames, [24, 25, 26, 27, 28, 29]);
assert.match(byTexture.bouncingTankBoss.license, /user_provided_bouncing_tank_boss_LICENSE/);
{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', byTexture.bouncingTankBoss.spritesheetPath)));
  assert.strictEqual(dimensions.width, 2814);
  assert.strictEqual(dimensions.height, 1500);
}
assert.strictEqual(byTexture['css:enemy-gallery-card-bouncing-tank-boss'].imagePath, 'assets/sprites/enemies/gallery/bouncing-tank-boss-preview.png');
assert.strictEqual(byTexture['css:enemy-gallery-card-bouncing-tank-boss'].enemyId, 'bouncingTankBoss');
assert.strictEqual(byTexture.selfDestructTruckExplosion.spritesheetPath, 'assets/sprites/effects/self-destruct-truck-explosion-interim-spritesheet.png');
assert.strictEqual(byTexture.selfDestructTruckExplosion.frameWidth, 320);
assert.strictEqual(byTexture.selfDestructTruckExplosion.frameHeight, 192);
assert.strictEqual(byTexture.selfDestructTruckExplosion.columns, 4);
assert.strictEqual(byTexture.selfDestructTruckExplosion.rows, 2);
assert.deepStrictEqual(byTexture.selfDestructTruckExplosion.effectFrames, [0, 1, 2, 3, 4, 5, 6, 7]);
assert.match(byTexture.selfDestructTruckExplosion.license, /derived_self_destruct_truck_interim_LICENSE/);
{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', byTexture.selfDestructTruckExplosion.spritesheetPath)));
  assert.strictEqual(dimensions.width, 1280);
  assert.strictEqual(dimensions.height, 384);
}
assert.strictEqual(byTexture.burnedTrees.spritesheetPath, 'assets/sprites/environment/burned-trees-spritesheet.png');
assert.strictEqual(byTexture.burnedTrees.frameWidth, 704);
assert.strictEqual(byTexture.burnedTrees.frameHeight, 1536);
assert.deepStrictEqual(byTexture.burnedTrees.propFrames, [0, 1, 2, 3]);
assert.strictEqual(byTexture.ruinedHouses.frameWidth, 938);
assert.strictEqual(byTexture.ruinedHouses.frameHeight, 768);
assert.strictEqual(byTexture.trenchStrips.frameWidth, 2816);
assert.strictEqual(byTexture.trenchStrips.frameHeight, 512);
assert.deepStrictEqual(byTexture.craterTracks.propFrames, [0, 1, 2, 3, 4, 5]);
assert.strictEqual(byTexture.forestClusters.frameWidth, 1408);
assert.strictEqual(byTexture.forestClusters.frameHeight, 768);
assert.strictEqual(byTexture['css:battlefield-background'].imagePath, 'assets/sprites/environment/battlefield-background.png');
assert.strictEqual(byTexture['css:battlefield-background'].width, 2752);
assert.strictEqual(byTexture['css:battlefield-background'].height, 1536);
[
  ['battlefield:snow-mountain', 'assets/sprites/environment/battlefield-snow-mountain.png', 'snow mountain'],
  ['battlefield:dunes', 'assets/sprites/environment/battlefield-dunes.png', 'dunes'],
  ['battlefield:desert', 'assets/sprites/environment/battlefield-desert.png', 'desert'],
  ['battlefield:night', 'assets/sprites/environment/battlefield-night.png', 'night'],
  ['battlefield:rain', 'assets/sprites/environment/battlefield-rain.png', 'rain'],
  ['battlefield:sunny', 'assets/sprites/environment/battlefield-sunny.png', 'sunny'],
  ['battlefield:storm', 'assets/sprites/environment/battlefield-storm.png', 'storm'],
  ['battlefield:snowfall', 'assets/sprites/environment/battlefield-snowfall.png', 'snowfall']
].forEach(([texture, imagePath, environment]) => {
  assert.strictEqual(byTexture[texture].imagePath, imagePath);
  assert.strictEqual(byTexture[texture].width, 1672);
  assert.strictEqual(byTexture[texture].height, 941);
  assert.strictEqual(byTexture[texture].environment, environment);
  assert.match(byTexture[texture].license, /generated_battlefield_backgrounds_LICENSE/);
});
assert.strictEqual(byTexture['css:mastery-rank-icons'].spritesheetPath, 'assets/sprites/ranks/rank-icons.png');
assert.strictEqual(byTexture['css:mastery-rank-icons'].imagePaths.length, 11);
assert.strictEqual(byTexture['css:mastery-rank-icons'].imagePaths[0], 'assets/sprites/ranks/recruit.png');
assert.strictEqual(byTexture['css:mastery-rank-icons'].imagePaths[10], 'assets/sprites/ranks/colonel.png');
assert.strictEqual(byTexture['css:war-archives-button'].spritesheetPath, 'assets/sprites/ui/war-archives-button-spritesheet.png');
assert.strictEqual(byTexture['css:war-archives-button'].frameWidth, 1024);
assert.strictEqual(byTexture['css:war-archives-button'].frameHeight, 1024);
assert.strictEqual(byTexture['css:war-archives-button'].stateFrames.hover, 1);
assert.strictEqual(byTexture['css:codex-book-button'].spritesheetPath, 'assets/sprites/ui/codex-book-spritesheet.png');
assert.strictEqual(byTexture['css:codex-book-button'].frameWidth, 512);
assert.strictEqual(byTexture['css:codex-book-button'].frameHeight, 512);
assert.strictEqual(byTexture['css:codex-book-button'].stateFrames.focus, 1);
assert.strictEqual(byTexture['css:codex-book-button'].stateFrames.click, 2);
assert.strictEqual(byTexture['css:codex-book-button'].stateFrames.open, 5);
assert.strictEqual(byTexture['css:war-supply-crate'].imagePath, 'assets/sprites/ui/war-supply-crate.png');
assert.strictEqual(byTexture['css:war-supply-crate'].width, 512);
assert.match(byTexture['css:war-supply-crate'].license, /generated_war_ui_crates_LICENSE/);
assert.strictEqual(byTexture['css:war-prep-button'].imagePath, 'assets/sprites/ui/war-prep-button.png');
assert.strictEqual(byTexture['css:war-prep-button'].height, 512);
assert.strictEqual(byTexture['css:boss-challenge-button'].imagePath, 'assets/sprites/ui/boss-challenge-button.png');
assert.strictEqual(byTexture['css:boss-challenge-button'].width, 1024);
assert.strictEqual(byTexture['css:boss-challenge-button'].height, 1024);
assert.match(byTexture['css:boss-challenge-button'].license, /generated_boss_challenge_button_LICENSE/);
{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', byTexture['css:boss-challenge-button'].imagePath)));
  assert.strictEqual(dimensions.width, 1024);
  assert.strictEqual(dimensions.height, 1024);
}
assert.strictEqual(byTexture['css:switch-general-button'].imagePath, 'assets/sprites/ui/switch-general-button.png');
assert.strictEqual(byTexture['css:switch-general-button'].width, 512);
assert.strictEqual(byTexture['css:switch-general-button'].height, 512);
assert.match(byTexture['css:switch-general-button'].license, /generated_switch_general_button_LICENSE/);
{
  const dimensions = imageSize(fs.readFileSync(path.join(__dirname, '..', byTexture['css:switch-general-button'].imagePath)));
  assert.strictEqual(dimensions.width, 512);
  assert.strictEqual(dimensions.height, 512);
}
[
  ['css:modal-supply-depot-texture', 'assets/sprites/ui/modal-supply-depot-texture.png'],
  ['css:modal-quartermaster-texture', 'assets/sprites/ui/modal-quartermaster-texture.png'],
  ['css:modal-war-dossier-texture', 'assets/sprites/ui/modal-war-dossier-texture.png'],
  ['css:modal-password-book-texture', 'assets/sprites/ui/modal-password-book-texture.png'],
  ['css:modal-enemy-field-guide-texture', 'assets/sprites/ui/modal-enemy-field-guide-texture.png'],
  ['css:modal-medal-board-texture', 'assets/sprites/ui/modal-medal-board-texture.png']
].forEach(([texture, imagePath]) => {
  assert.strictEqual(byTexture[texture].imagePath, imagePath);
  assert.strictEqual(byTexture[texture].width, 1536);
  assert.strictEqual(byTexture[texture].height, 960);
  assert.match(byTexture[texture].license, /generated_modal_surfaces_LICENSE/);
});
assert.strictEqual(byTexture['css:sound-button'].spritesheetPath, 'assets/sprites/ui/sound-button-spritesheet.png');
assert.strictEqual(byTexture['css:sound-button'].frameWidth, 192);
assert.strictEqual(byTexture['css:sound-button'].frameHeight, 192);
assert.strictEqual(byTexture['css:sound-button'].stateFrames.soundOff, 1);

console.log('asset manifest tests passed');
