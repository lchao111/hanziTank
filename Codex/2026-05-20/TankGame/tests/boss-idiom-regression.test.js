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

assert.match(source, /id="bossIdiomScreen"/, 'Boss battles should have an idiom prep overlay.');
assert.match(source, /id="bossSpecialEffect"/, 'Boss idiom attacks should have a visual effect layer.');
assert.match(source, /phrase: "雷霆万钧"/, 'Thunder idiom technique should exist.');
assert.match(source, /phrase: "冰天雪地"/, 'Ice idiom technique should exist.');
assert.match(source, /phrase: "迅如疾风"/, 'Wind idiom technique should exist.');
assert.match(source, /\.boss-special-effect\.thunder/, 'Thunder idiom should have a distinct effect style.');
assert.match(source, /\.boss-special-effect\.ice/, 'Ice idiom should have a distinct effect style.');
assert.match(source, /\.boss-special-effect\.wind/, 'Wind idiom should have a distinct effect style.');
assert.match(source, /animation: boss-special-flash 2400ms/, 'Boss idiom special effects should stay visible long enough to read.');
assert.match(source, /\.tank\.enemy-boss\.boss-charred \.tank-sprite/, 'Thunder idiom should have a visible charred Boss state.');

const renderBossQuestion = bodyOf('renderBossQuestion');
assert.match(renderBossQuestion, /debugBossIdiomMode && shownBossIdiomStage !== levelNumber/, 'Boss idiom prep should only gate Debug Mode Boss battles.');
assert.match(renderBossQuestion, /showBossIdiomPrep\(\(\) => renderBossQuestion\(options\)\)/, 'Boss idiom prep should resume the Boss question flow after completion.');
assert.match(renderBossQuestion, /shownBossIntroStage !== levelNumber/, 'Boss intro should still run after idiom prep.');

const showBossIdiomPrep = bodyOf('showBossIdiomPrep');
assert.match(showBossIdiomPrep, /activeBossIdiom = pickBossIdiomTechnique\(\)/, 'Boss idiom prep should select a technique.');
assert.match(showBossIdiomPrep, /renderBossIdiomTiles\(activeBossIdiom, onDone\)/, 'Boss idiom prep should render draggable tiles.');
assert.match(showBossIdiomPrep, /bossIdiomScreen\.classList\.add\("show"\)/, 'Boss idiom prep should show its overlay.');

const renderBossIdiomTiles = bodyOf('renderBossIdiomTiles');
assert.match(renderBossIdiomTiles, /tile\.draggable = true/, 'Idiom tiles should support drag sorting.');
assert.match(renderBossIdiomTiles, /dragstart/, 'Idiom tiles should wire drag start.');
assert.match(renderBossIdiomTiles, /drop/, 'Idiom tiles should wire drop sorting.');
assert.match(renderBossIdiomTiles, /tap two tiles to swap|selectedBossIdiomTileIndex/, 'Idiom tiles should also support click/tap swapping.');

const completeBossIdiomPrep = bodyOf('completeBossIdiomPrep');
assert.match(completeBossIdiomPrep, /pendingBossIdiomAttack = activeBossIdiom/, 'Completing the idiom should charge a pending Boss attack.');
assert.match(completeBossIdiomPrep, /shownBossIdiomStage = levelNumber/, 'Completing the idiom should only happen once per Boss stage.');

const chooseBossAnswer = bodyOf('chooseBossAnswer');
assert.match(chooseBossAnswer, /applyBossIdiomAttack\(\)/, 'Correct Boss hits should consume the charged idiom attack.');

const applyBossIdiomAttack = bodyOf('applyBossIdiomAttack');
assert.match(applyBossIdiomAttack, /pendingBossIdiomAttack = null/, 'Boss idiom attack should be one-shot.');
assert.match(applyBossIdiomAttack, /damageEnemy\(technique\.bonusDamage\)/, 'Boss idiom attack should deal bonus damage.');
assert.match(applyBossIdiomAttack, /playBossIdiomEffect\(technique\)/, 'Boss idiom attack should trigger its visual effect.');

const playBossIdiomEffect = bodyOf('playBossIdiomEffect');
assert.match(playBossIdiomEffect, /queueChineseSpeech\(technique\.phrase/, 'Boss idiom attack should read the idiom aloud.');
assert.match(playBossIdiomEffect, /setBossCharredState\(true\)/, 'Thunder idiom attack should char the Boss.');
assert.match(playBossIdiomEffect, /\}, 2400\)/, 'Boss idiom visual cleanup should match the longer effect duration.');

const startDebugBattle = bodyOf('startDebugBattle');
assert.match(startDebugBattle, /debugBossIdiomMode = currentEnemy\.id === "boss"/, 'Only Debug Mode Boss battles should enable idiom prep.');

const resetRunForProfile = bodyOf('resetRunForProfile');
assert.match(resetRunForProfile, /shownBossIdiomStage = 0/, 'Profile reset should clear Boss idiom stage state.');
assert.match(resetRunForProfile, /debugBossIdiomMode = false/, 'Profile reset should disable Debug Boss idiom mode.');
assert.match(resetRunForProfile, /clearBossIdiomPrep\(\)/, 'Profile reset should hide Boss idiom prep UI.');

const restartGame = bodyOf('restartGame');
assert.match(restartGame, /shownBossIdiomStage = 0/, 'Restart should clear Boss idiom stage state.');
assert.match(restartGame, /debugBossIdiomMode = false/, 'Restart should disable Debug Boss idiom mode.');
assert.match(restartGame, /clearBossIdiomPrep\(\)/, 'Restart should hide Boss idiom prep UI.');

console.log('boss idiom regression tests passed');
