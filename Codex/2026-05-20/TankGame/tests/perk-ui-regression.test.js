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

['armor-icon', 'repair-icon', 'pierce-icon', 'ammo-icon', 'absolute-icon', 'plating-icon'].forEach((iconClass) => {
  assert.match(source, new RegExp(`\\.${iconClass}`), `Missing CSS for ${iconClass}.`);
  assert.match(source, new RegExp(`iconClass: "${iconClass}"`), `Missing perk data for ${iconClass}.`);
});

const showPerkChoices = bodyOf('showPerkChoices');
assert.match(showPerkChoices, /<span class="perk-icon \$\{perk\.iconClass\}" aria-hidden="true"><\/span>/, 'Stage clear choices should render perk icons.');
assert.match(showPerkChoices, /<span class="perk-copy">/, 'Stage clear choices should keep text grouped beside the icon.');
assert.match(source, /\.perk-choice \{\s*display: grid;/, 'Perk choices should use a stable icon/text grid layout.');

const syncHud = bodyOf('syncHud');
assert.match(syncHud, /playerTank\.classList\.toggle\("absolute-shield-active", absoluteDefenseAvailable > 0\)/, 'Player absolute defense shield should be visible only while charges remain.');
assert.match(source, /\.tank\.player\.absolute-shield-active::before/, 'Player absolute defense should render a persistent glowing shield.');
assert.match(source, /@keyframes absolute-shield-idle/, 'Player absolute defense shield should have an idle glow animation.');
assert.match(source, /@keyframes absolute-shield-scan/, 'Player absolute defense shield should have a scanning energy animation.');

console.log('perk UI regression tests passed');
