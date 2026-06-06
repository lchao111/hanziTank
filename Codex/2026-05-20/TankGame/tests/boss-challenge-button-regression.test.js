const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

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

const footerStart = source.indexOf('<footer class="controls">');
assert.notStrictEqual(footerStart, -1, 'Footer controls should exist.');
const footerEnd = source.indexOf('</footer>', footerStart);
assert.notStrictEqual(footerEnd, -1, 'Footer controls should close.');
const footer = source.slice(footerStart, footerEnd);

assert.match(footer, /id="bossChallengeButton"/, 'Boss Challenge should be a regular footer button for every player.');
assert.doesNotMatch(footer, /id="bossChallengeButton"[^>]*hidden/, 'Boss Challenge button must not be hidden behind Debug Mode.');
assert.match(footer, /boss-challenge-button/, 'Boss Challenge should use a dedicated visual button class.');
assert.match(source, /assets\/sprites\/ui\/boss-challenge-button\.png\?v=20260606/, 'Boss Challenge should use the generated Gemini button art.');
assert.match(source, /id="bossChallengeModeButton"/, 'Boss Challenge should be a first-class mode choice after login.');
assert.match(source, /const bossChallengeButton = document\.querySelector\("#bossChallengeButton"\)/, 'Runtime should capture the Boss Challenge button.');
assert.match(source, /const bossChallengeModeButton = document\.querySelector\("#bossChallengeModeButton"\)/, 'Runtime should capture the Boss Challenge mode button.');
assert.match(source, /bossChallengeButton\.addEventListener\("click", startBossChallenge\)/, 'Boss Challenge button should start the public Boss challenge directly.');
assert.match(source, /bossChallengeModeButton\.addEventListener\("click", startBossChallenge\)/, 'Boss Challenge mode choice should start the same public Boss challenge.');

const startBossChallenge = bodyOf('startBossChallenge');
assert.match(startBossChallenge, /startBattleScenario\(5, "bouncingTankBoss", \{ publicChallenge: true \}\)/, 'Public Boss Challenge should reuse the Bouncing Tank Boss scenario without requiring Debug Mode.');

const startBattleScenario = bodyOf('startBattleScenario');
assert.match(startBattleScenario, /publicChallenge/, 'The shared battle launcher should know when it is serving a public challenge.');
assert.match(startBattleScenario, /publicChallenge[\s\S]*hideModeGate\(\)/, 'Public Boss Challenge should dismiss the mode picker before the battle starts.');

const startDebugBattle = bodyOf('startDebugBattle');
assert.match(startDebugBattle, /if \(!canUseDebugMode\(\)\)/, 'Debug Mode itself should remain restricted to the Chao profile.');
assert.match(startDebugBattle, /startBattleScenario\(stage, enemyId, \{ debug: true \}\)/, 'Debug battles should reuse the shared scenario launcher after passing the guard.');

assert.ok(
  fs.existsSync(path.join(root, 'assets/source/ui-candidates/boss-challenge-button-gemini.prompt.md')),
  'The Gemini prompt used for the Boss Challenge button should be tracked for later asset generation.'
);
assert.ok(
  fs.existsSync(path.join(root, 'assets/sprites/ui/boss-challenge-button.png')),
  'The generated Boss Challenge button PNG should be available to the runtime.'
);
assert.ok(
  fs.existsSync(path.join(root, 'assets/licenses/generated_boss_challenge_button_LICENSE.txt')),
  'The generated Boss Challenge button should have a license/provenance note.'
);

const generatedButton = fs.readFileSync(path.join(root, 'assets/sprites/ui/boss-challenge-button.png'));
assert.strictEqual(generatedButton[24], 8, 'Boss Challenge button should be an RGBA PNG with transparency.');

console.log('boss challenge button regression tests passed');