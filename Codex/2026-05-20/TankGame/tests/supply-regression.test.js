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

assert.match(source, /id="supplyReward"/, 'War Supply should have a dedicated reward feedback line.');
assert.match(source, /war-supply-crate\.png/, 'War Supply should use a bitmap crate asset instead of a plain modal chest.');
assert.match(source, /modal-supply-depot-texture\.png/, 'War Supply should use a bitmap depot surface behind the reward crate.');
assert.match(source, /@keyframes supply-chest-reward/, 'War Supply chest should animate on reward.');
assert.match(source, /@keyframes supply-reward-pop/, 'War Supply reward text should pop in.');

const grantSupplyReward = bodyOf('grantSupplyReward');
assert.match(grantSupplyReward, /const rewardCoins = 35 \+ levelNumber \* 5/, 'War Supply coin reward should be stronger but stage-bounded.');
assert.match(grantSupplyReward, /const repairAmount = 2/, 'War Supply should grant a short-term repair boost.');
assert.match(grantSupplyReward, /const smokeBonus = 1/, 'War Supply should grant one short-term smoke cover.');
assert.match(grantSupplyReward, /const ammoRewardId = "shell_ap"/, 'War Supply should grant a storage-compatible ammo reward.');
assert.match(grantSupplyReward, /playerState\.ammo\[ammoRewardId\] = getAmmoCount\(ammoRewardId\) \+ 1/, 'War Supply ammo reward should store in the existing ammo object.');
assert.match(grantSupplyReward, /supplyReward\.classList\.add\("pop"\)/, 'War Supply reward text should animate.');

const shouldShowSupplyChallenge = bodyOf('shouldShowSupplyChallenge');
assert.match(shouldShowSupplyChallenge, /return false/, 'War Supply should no longer appear after Boss battles.');

const completeLevel = bodyOf('completeLevel');
assert.doesNotMatch(completeLevel, /levelNumber % 5 === 0[\s\S]*showSupplyChallenge\(\)/, 'Boss stage clear should not trigger War Supply directly.');
assert.match(completeLevel, /shouldShowSupplyChallenge\(levelNumber\)[\s\S]*showPerkChoices\(\)/, 'Stage clear should route through the supply gate before continuing to perks.');

console.log('supply regression tests passed');
