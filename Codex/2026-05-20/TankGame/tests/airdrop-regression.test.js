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

['battleAirdrop', 'airdropScreen', 'airdropReward', 'airdropOptions'].forEach((id) => {
  assert.match(source, new RegExp(`id="${id}"`), `Missing airdrop DOM id ${id}.`);
  assert.match(source, new RegExp(`document\\.querySelector\\("#${id}"\\)`), `Missing cached selector for ${id}.`);
});

[
  'shouldSpawnBattleAirdrop',
  'spawnBattleAirdrop',
  'updateBattleAirdrop',
  'collectBattleAirdrop',
  'clearBattleAirdrop',
  'showAirdropQuiz',
  'renderAirdropQuestion',
  'chooseAirdropAnswer',
  'grantAirdropReward',
  'closeAirdropChallenge',
].forEach((functionName) => bodyOf(functionName));

const completeLevel = bodyOf('completeLevel');
assert.doesNotMatch(completeLevel, /shouldShowAirdrop|showAirdropChallenge|showAirdropQuiz/, 'Stage clear must not open an airdrop quiz after battle.');

const closeSupplyChallenge = bodyOf('closeSupplyChallenge');
assert.doesNotMatch(closeSupplyChallenge, /shouldShowAirdrop|showAirdropChallenge|showAirdropQuiz/, 'War Supply must not preserve a post-battle airdrop gate.');
assert.match(closeSupplyChallenge, /showPerkChoices\(\)/, 'War Supply should continue to perks after its own reward flow.');

const beginBattleStage = bodyOf('beginBattleStage');
assert.match(beginBattleStage, /spawnBattleAirdrop\(stage\)/, 'Battle start should spawn the in-world parachute airdrop.');

const spawnBattleAirdrop = bodyOf('spawnBattleAirdrop');
assert.match(spawnBattleAirdrop, /shouldSpawnBattleAirdrop\(stage\)/, 'Airdrop spawn should be gated by active battle state and stage resolution.');
assert.match(spawnBattleAirdrop, /updateBattleAirdrop\(\)/, 'Airdrop spawn should update the falling in-battle object.');
assert.match(spawnBattleAirdrop, /setInterval\(updateBattleAirdrop/, 'Airdrop should keep falling through the battle loop until it lands or is cleared.');

const updateBattleAirdrop = bodyOf('updateBattleAirdrop');
assert.match(updateBattleAirdrop, /battleAirdrop\.style\.transform/, 'Airdrop update should move the visible in-battle object.');
assert.match(updateBattleAirdrop, /battleAirdrop\.classList\.add\("landed"\)/, 'Airdrop update should mark the crate as landed and collectible.');

const collectBattleAirdrop = bodyOf('collectBattleAirdrop');
assert.match(collectBattleAirdrop, /showAirdropQuiz\(\)/, 'Collecting the in-battle crate should open the quiz interaction.');
assert.match(collectBattleAirdrop, /stopCountdown/, 'Collecting the crate should pause enemy reload pressure during the quiz.');
assert.doesNotMatch(source, /class="airdrop-screen"/, 'Airdrop quiz should not be styled as a full post-battle screen/modal.');

const grantAirdropReward = bodyOf('grantAirdropReward');
assert.match(grantAirdropReward, /airdropRewards\[Math\.floor\(Math\.random\(\) \* airdropRewards\.length\)\]/, 'Airdrop should choose one reward from a reward table.');
['repair', 'damageBoost', 'absoluteShield', 'shieldSoldier'].forEach((rewardId) => {
  assert.match(source, new RegExp(`id: "${rewardId}"`), `Missing airdrop reward ${rewardId}.`);
});
assert.match(grantAirdropReward, /activeAirdropDamageBoost \+= reward\.amount/, 'Damage reward should boost the current battle only.');
assert.match(grantAirdropReward, /absoluteDefenseAvailable \+= reward\.amount/, 'Absolute shield reward should immediately add one-use protection.');
assert.match(grantAirdropReward, /pendingAirdropEffects\.shieldSoldier \+= reward\.amount/, 'Shield soldier reward should be pending for the next battle.');
assert.doesNotMatch(grantAirdropReward, /runUpgrades\.damage \+=/, 'Temporary airdrop damage must not stack as a permanent run upgrade.');

const applyPendingAirdropEffects = bodyOf('applyPendingAirdropEffects');
assert.match(applyPendingAirdropEffects, /if \(!hasPendingAirdropEffects\(\)\) return/, 'Applying pending effects should preserve restored active damage when no pending effects exist.');
assert.match(applyPendingAirdropEffects, /activeAirdropDamageBoost = Math\.max\(0, Number\(pendingAirdropEffects\.damageBoost\) \|\| 0\)/, 'Pending damage boost should become one-battle active damage.');
assert.match(applyPendingAirdropEffects, /absoluteDefenseAvailable \+= pendingAirdropEffects\.absoluteShield \+ pendingAirdropEffects\.shieldSoldier/, 'Pending shield rewards should block next battle attacks.');
assert.match(applyPendingAirdropEffects, /pendingAirdropEffects = createEmptyAirdropEffects\(\)/, 'Pending airdrop effects should be consumed at battle start.');

const getDamage = bodyOf('getDamage');
assert.match(getDamage, /activeAirdropDamageBoost/, 'Shot damage should include only the active one-battle airdrop boost.');

const buildRunProgress = bodyOf('buildRunProgress');
assert.match(buildRunProgress, /pendingAirdropEffects: \{ \.\.\.pendingAirdropEffects \}/, 'Run progress should save pending airdrop effects.');
assert.match(buildRunProgress, /activeAirdropDamageBoost/, 'Run progress should save active one-battle damage.');

const restoreRunProgress = bodyOf('restoreRunProgress');
assert.match(restoreRunProgress, /pendingAirdropEffects = normalizeAirdropEffects\(progress\.pendingAirdropEffects\)/, 'Run restore should restore pending airdrop effects.');
assert.match(restoreRunProgress, /activeAirdropDamageBoost = Math\.max\(0, Number\(progress\.activeAirdropDamageBoost\) \|\| 0\)/, 'Run restore should restore active one-battle damage.');

console.log('airdrop regression tests passed');