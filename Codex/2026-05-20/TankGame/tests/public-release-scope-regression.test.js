const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert.match(source, /\[hidden\]\s*\{\s*display:\s*none !important;/, 'Hidden controls should stay hidden even when button classes set display styles.');

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

const isPublicReleaseHost = bodyOf('isPublicReleaseHost');
assert.match(isPublicReleaseHost, /github\\\.io/, 'GitHub Pages should be treated as a public release host.');
assert.match(isPublicReleaseHost, /web\\\.core\\\.windows\\\.net/, 'Azure static website should also use public release scope.');

const getPublicReleaseHiddenControls = bodyOf('getPublicReleaseHiddenControls');
[
  'bossChallengeButton',
  'bossChallengeModeButton',
  'versusModeButton',
  'antiAirModeButton',
  'blockAdventureModeButton',
  'storyAdventureModeButton',
  'hanziTetrisModeButton',
  'debugButton',
  'adminButton'
].forEach((controlName) => {
  assert.match(getPublicReleaseHiddenControls, new RegExp(controlName), `${controlName} should be hidden on public release hosts.`);
});
assert.doesNotMatch(getPublicReleaseHiddenControls, /adventureModeButton/, 'Adventure/TankGame mode should remain public.');
assert.doesNotMatch(getPublicReleaseHiddenControls, /elevatorEscapeModeButton/, 'Rock Shaft mode should remain public.');

const syncPublicReleaseScope = bodyOf('syncPublicReleaseScope');
assert.match(syncPublicReleaseScope, /isPublicReleaseHost\(\)/, 'Public scope sync should only hide controls on public release hosts.');
assert.match(syncPublicReleaseScope, /if \(publicRelease\) \{\s*control\.remove\(\);\s*return;\s*\}/s, 'Internal controls should be removed from the public DOM, not merely hidden.');
assert.match(syncPublicReleaseScope, /control\.hidden = publicRelease/, 'Public-only controls should be hidden on GitHub Pages.');
assert.match(syncPublicReleaseScope, /control\.tabIndex = publicRelease \? -1 : 0/, 'Hidden internal controls should be removed from keyboard navigation.');

assert.match(source, /syncPublicReleaseScope\(\)/, 'Runtime should apply the public release scope during startup.');

console.log('public release scope regression tests passed');