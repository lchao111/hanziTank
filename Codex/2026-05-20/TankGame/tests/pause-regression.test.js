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

const pauseButtonMarkupMatch = source.match(/<button(?=[^>]*id="pauseButton")[^>]*>/);
assert.ok(pauseButtonMarkupMatch, 'Pause button should exist.');
const pauseButtonMarkup = pauseButtonMarkupMatch[0];
assert.match(pauseButtonMarkup, /aria-pressed="false"/, 'Pause button should expose pressed state.');
assert.match(pauseButtonMarkup, /class="[^"]*pause-icon-button[^"]*"/, 'Pause button should use the generated pause icon treatment.');
assert.match(source, /pause-button-spritesheet\.png\?v=20260528/, 'Pause icon should use the generated two-frame spritesheet.');
assert.match(source, /const pauseButton = document\.querySelector\("#pauseButton"\)/, 'Pause button should be wired in JavaScript.');
assert.match(source, /id="pauseOverlay"/, 'Pause should show a centered overlay.');
assert.match(source, /暂停[\s\S]*PAUSED/, 'Pause overlay should include bilingual pause text.');
assert.match(source, /@keyframes pause-card-breathe/, 'Pause overlay should have a light animation.');
assert.match(source, /const pauseOverlay = document\.querySelector\("#pauseOverlay"\)/, 'Pause overlay should be wired in JavaScript.');
assert.match(source, /let isPaused = false/, 'Pause state should be tracked explicitly.');

const pauseCountdown = bodyOf('pauseCountdown');
assert.match(pauseCountdown, /pausedCountdownWasActive\s*=\s*countdownId\s*>\s*0/, 'Pausing should remember whether reload was active.');
assert.doesNotMatch(pauseCountdown, /countdown\s*=\s*0/, 'Pausing must preserve remaining countdown seconds.');
assert.match(pauseCountdown, /stopPhaserEnemyApproach\(false\)/, 'Pausing should freeze enemy approach without snapping back.');

const startCountdown = bodyOf('startCountdown');
assert.match(source, /function startCountdown\(seconds = getEnemyAttackInterval\(\)\)/, 'Countdown should accept a remaining-seconds resume value and default to the active enemy interval.');
assert.match(startCountdown, /if \(isPaused \|\| isGameOver \|\| isLevelCleared \|\| lives <= 0 \|\| currentEnemy\.hp <= 0\) return/, 'Countdown should not start while paused, after defeat, or after enemy defeat.');
assert.match(startCountdown, /countdown\s*=\s*Math\.max\(1, Math\.min\(attackInterval, seconds \|\| attackInterval\)\)/, 'Countdown should resume from supplied remaining seconds.');

const pauseGame = bodyOf('pauseGame');
assert.match(pauseGame, /pausedLockedState\s*=\s*locked/, 'Pause should remember whether the question was locked.');
assert.match(pauseGame, /locked\s*=\s*true/, 'Pause should lock answering.');
assert.match(pauseGame, /pauseCountdown\(\)/, 'Pause should stop reload ticking.');

const resumeGame = bodyOf('resumeGame');
assert.match(resumeGame, /startCountdown\(countdown\)/, 'Resume should continue from the saved countdown value.');
assert.match(resumeGame, /locked\s*=\s*pausedLockedState/, 'Resume should restore prior lock state.');

const syncPauseButton = bodyOf('syncPauseButton');
assert.match(syncPauseButton, /pauseButton\.setAttribute\("aria-label", pauseLabel\)/, 'Pause icon should keep an accessible label in sync.');
assert.match(syncPauseButton, /pauseButton\.title\s*=\s*pauseLabel/, 'Pause icon tooltip should describe the current action.');
assert.match(syncPauseButton, /pauseOverlay\.classList\.toggle\("show", isPaused\)/, 'Pause overlay should appear while paused.');
assert.match(syncPauseButton, /pauseOverlay\.setAttribute\("aria-hidden", String\(!isPaused\)\)/, 'Pause overlay hidden state should sync with pause state.');

const playPauseButtonAction = bodyOf('playPauseButtonAction');
assert.match(playPauseButtonAction, /pauseButton\.classList\.add\("is-activating"\)/, 'Pause icon should play its pressed action animation.');

const chooseAnswer = bodyOf('chooseAnswer');
assert.match(chooseAnswer, /if \(locked \|\| isPaused\) return/, 'Normal answers should be ignored while paused.');

const chooseBossAnswer = bodyOf('chooseBossAnswer');
assert.match(chooseBossAnswer, /if \(locked \|\| isPaused \|\| !bossPhrase\) return/, 'Boss answers should be ignored while paused.');

assert.match(source, /pauseButton\.addEventListener\("click", togglePause\)/, 'Pause button should toggle pause state.');
assert.match(source, /syncPauseButton\(\);\s*\n\s*syncHud\(\);/, 'Pause button label should be initialized before gameplay starts.');

console.log('pause regression tests passed');
