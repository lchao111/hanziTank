const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const assetRoot = path.join(__dirname, '..', 'assets', 'sprites', 'rock-shaft');

function bodyOf(name) {
  const start = source.indexOf(`function ${name}`);
  assert.notStrictEqual(start, -1, `Missing function ${name}.`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  throw new Error(`Could not parse function ${name}.`);
}

const freeFallRule = source.match(/\.elevator-player\.free-falling,[\s\S]*?\.elevator-player\.dropping\s*\{([\s\S]*?)\}/);
assert.ok(freeFallRule, 'Free-falling player CSS rule should exist.');
assert.match(freeFallRule[1], /transform:\s*translate\(-50%,\s*150px\);/, 'Free fall should be a straight vertical drop.');
assert.doesNotMatch(freeFallRule[1], /rotate\(/, 'Free fall should not rotate or pose the character.');

assert.match(source, /\.elevator-shaft::before/, 'Rock shaft should render an incoming upper rock layer.');
assert.match(source, /\.elevator-shaft::after/, 'Rock shaft should render an incoming lower rock layer.');
assert.match(source, /assets\/sprites\/rock-shaft\/cave-background-clean\.png/, 'Rock shaft should use the generated cave background art.');
assert.match(source, /assets\/sprites\/rock-shaft\/stalactite-spikes\.png/, 'Rock shaft should use the generated stalactite spike art.');
assert.match(source, /\.elevator-spikes::after/, 'Rock shaft should visually sharpen the stalactite hazard layer.');
assert.match(source, /\.elevator-cave-decor/, 'Rock shaft should include extra cave danger decorations.');
assert.match(source, /\.elevator-vines/, 'Cave decorations should include dangling vines.');
assert.match(source, /\.elevator-web/, 'Cave decorations should include spider webs.');
assert.match(source, /\.elevator-bats/, 'Cave decorations should include bat silhouettes.');
assert.match(source, /assets\/sprites\/rock-shaft\/cave-decoration-sheet\.png/, 'Rock shaft should use the generated cave decoration animation sheet.');
assert.ok(fs.existsSync(path.join(assetRoot, 'cave-decoration-sheet.png')), 'Missing cave decoration animation sheet.');
assert.match(source, /\.elevator-drip-sprite/, 'Cave decoration sheet should provide animated dripping water.');
assert.match(source, /\.elevator-spider-sprite/, 'Cave decoration sheet should provide animated spider sprites.');
assert.match(source, /\.elevator-bat-sprite/, 'Cave decoration sheet should provide animated bat sprites.');
assert.match(source, /@keyframes elevator-cave-sprite-frames/, 'Cave decoration sprites should animate through sheet frames.');
assert.match(source, /@keyframes elevator-vine-sway/, 'Cave vines should subtly sway.');
assert.match(source, /@keyframes elevator-spider-dangle/, 'Cave spider should dangle or move.');
assert.match(source, /@keyframes elevator-bat-drift/, 'Cave bats should fly around as animated silhouettes.');
assert.match(source, /assets\/sprites\/rock-shaft\/rock-platform-single\.png/, 'Rock boards should use the generated rock platform art.');
assert.match(source, /\.elevator-board\.active:not\(\.reveal\):not\(\.trap\)\s*\{[\s\S]*color:\s*#fff/, 'Active rock Hanzi should be white for readability.');
assert.match(source, /\.elevator-board\.active:not\(\.reveal\):not\(\.trap\)\s*\{[\s\S]*text-shadow:/, 'Active rock Hanzi should have a strong shadow/outline.');
assert.match(source, /assets\/sprites\/rock-shaft\/adventurer-stand\.png/, 'Player should use the generated standing adventurer art.');
assert.match(source, /assets\/sprites\/rock-shaft\/adventurer-fall\.png/, 'Player falling should use the generated falling adventurer art.');
assert.match(source, /assets\/sprites\/rock-shaft\/adventurer-hammer-sheet\.png/, 'Hammering should use a generated adventurer hammer spritesheet.');
assert.match(source, /assets\/sprites\/rock-shaft\/rock-break-sheet\.png/, 'Correct rock hits should use a generated rock-breaking spritesheet.');
['cave-background-clean.png', 'stalactite-spikes.png', 'rock-platform-single.png', 'adventurer-stand.png', 'adventurer-fall.png', 'adventurer-hammer-sheet.png', 'rock-break-sheet.png'].forEach((fileName) => {
  assert.ok(fs.existsSync(path.join(assetRoot, fileName)), `Missing rock-shaft raster asset ${fileName}.`);
});
assert.match(source, /\.elevator-panel\s*\{[\s\S]*width:\s*min\(1280px/, 'Rock shaft mode should use a larger play panel.');
assert.match(source, /\.elevator-shaft\s*\{[\s\S]*min-height:\s*min\(720px/, 'Rock shaft should have a taller play space.');
assert.match(source, /\.elevator-board\.answered-rising/, 'Answered rock should keep rising after the player falls.');
assert.match(source, /@keyframes elevator-rock-rise-to-spikes/, 'Answered rock should shatter at the top spikes.');
assert.match(source, /\.elevator-board\.breaking/, 'Correct rock should visibly break before the player drops.');
assert.match(source, /@keyframes elevator-rock-break-frames/, 'Correct rock should animate through generated break frames.');
assert.match(source, /elevator-platform-row rising/, 'UI should render a real upper row for the previous answered rock layer.');
assert.match(source, /elevator-platform-row current/, 'UI should render a real lower row for the next active rock layer.');
assert.match(source, /\.elevator-player\.landing-drop/, 'Player should have a landing-drop class for falling onto the next layer.');
assert.match(source, /@keyframes elevator-player-drop-to-layer/, 'Player should animate from the previous layer into the new rock layer.');
assert.match(source, /0% \{ transform: translate\(-50%, -150px\);/, 'Landing drop should begin at the previous rock layer height.');
assert.doesNotMatch(source, /translate\(-50%, -214px\)/, 'Landing drop should not start from the whole screen top.');
assert.match(source, /\.elevator-player\.hammering/, 'Selecting a rock should make the adventurer swing a hammer first.');
assert.match(source, /@keyframes elevator-hammer-swing/, 'Hammer swing should have a visible animation.');
assert.doesNotMatch(source, /\.elevator-player\.hammering::after/, 'Hammering should animate the whole adventurer sprite, not a CSS-only hammer stuck to a still body.');
assert.match(source, /background-size:\s*200% 200%/, 'Hammer spritesheet should be used as a 2x2 animation sheet.');
assert.match(source, /\.elevator-board\.wrong-marked/, 'Wrong rock should turn red instead of breaking.');
assert.doesNotMatch(source, /\.elevator-platform-row\.wrong-rising/, 'Wrong answer should not immediately carry the player upward anymore.');
assert.match(source, /\.elevator-damage-float/, 'Rock shaft should show a -1 heart damage float when HP drops.');
assert.match(source, /@keyframes elevator-damage-float/, 'Damage float should animate visibly.');
assert.match(source, /\.elevator-player\.ceiling-spiked\s*\{[\s\S]*filter:\s*sepia\(1\) saturate\(5\)/, 'Top spike hit should tint the raster player sprite red.');
assert.match(source, /\.elevator-player\.ceiling-spiked::before[\s\S]*background:\s*#ef4444/, 'Top spike hit should turn the player head red.');
assert.match(source, /\.elevator-player\.ceiling-spiked::after[\s\S]*background:[\s\S]*#b91c1c/, 'Top spike hit should turn the whole player body red.');
assert.match(source, /\.elevator-player\.rock-hit/, 'Flying rock hazard should have a distinct player hit state.');
assert.match(source, /\.elevator-rock-projectile/, 'Flying rock hazard should render rock projectiles.');
assert.match(source, /@keyframes elevator-rock-projectile-hit/, 'Flying rock projectiles should visibly travel into the player.');
assert.match(source, /\.elevator-player\.bat-bitten/, 'Vampire bat hazard should have a distinct bitten player state.');
assert.match(source, /\.elevator-vampire-bat-hazard/, 'Vampire bat hazard should render an approaching bat.');
assert.match(source, /@keyframes elevator-vampire-bat-approach/, 'Vampire bat should gradually approach before timeout.');
assert.match(source, /@keyframes elevator-vampire-bat-bite/, 'Vampire bat should visibly bite on timeout.');
assert.match(source, /\.elevator-player\.centipede-bitten/, 'Centipede hazard should have a distinct bitten player state.');
assert.match(source, /\.elevator-centipede-hazard/, 'Centipede hazard should render a dangling centipede.');
assert.match(source, /@keyframes elevator-centipede-descend/, 'Centipede should gradually descend from the ceiling before timeout.');
assert.match(source, /@keyframes elevator-centipede-bite/, 'Centipede should visibly bite on timeout.');

const timerBody = bodyOf('updateElevatorEscapeTimerFill');
assert.match(timerBody, /pressure \* 430/, 'The 4-second countdown should lift the rock layer high enough for the player head to reach top spikes.');
assert.match(timerBody, /--incoming-rock-offset/, 'Timer should also animate the next rock layers upward continuously.');

const renderBody = bodyOf('renderElevatorEscape');
assert.match(renderBody, /risingColumn/, 'Rendering should track the previous answered rock as it rises to the top spikes.');
assert.match(renderBody, /risingLayer/, 'Rendering should preserve the previous answered layer while the next layer catches the player.');
assert.match(renderBody, /answered-rising/, 'Rendering should mark the answered rock as rising instead of immediately disappearing.');
assert.match(renderBody, /landing-drop/, 'Rendering should apply the landing-drop class during next-layer catch animation.');
assert.match(renderBody, /elevatorEscapeHammering/, 'Rendering should apply hammering state while the player swings.');
assert.match(renderBody, /elevatorEscapeRockBreaking/, 'Rendering should keep the struck rock breaking before advancing to the next layer.');
assert.match(renderBody, /breaking/, 'Rendering should apply the rock-breaking class to the struck platform.');
assert.match(renderBody, /wrongColumns/, 'Rendering should mark wrong attempts red while the countdown continues.');
assert.match(renderBody, /wrong-marked/, 'Rendering should apply the red wrong-marked class.');
assert.match(renderBody, /activeHazard/, 'Rendering should inspect the active timeout hazard.');
assert.match(renderBody, /elevator-rock-projectile/, 'Rendering should show flying rock projectiles for rock hazards.');
assert.match(renderBody, /vampire-bat/, 'Rendering should handle vampire bat hazards.');
assert.match(renderBody, /elevator-vampire-bat-hazard/, 'Rendering should show the vampire bat hazard element.');
assert.match(renderBody, /centipede/, 'Rendering should handle centipede hazards.');
assert.match(renderBody, /elevator-centipede-hazard/, 'Rendering should show the dangling centipede hazard element.');

const submitBody = bodyOf('submitElevatorEscapeCurrentPlatform');
assert.doesNotMatch(submitBody, /queueChineseSpeech\(result\.speechText/, 'Correct rock-shaft answers should not replay the old Hanzi audio over the next question.');
assert.doesNotMatch(submitBody, /previousQuestionHanzi/, 'Correct rock-shaft answers should not keep stale speech guards for old questions.');
assert.match(submitBody, /elevatorEscapeRockBreaking\s*=\s*true/, 'Correct rock-shaft answers should enter a visible rock-breaking phase.');
assert.match(submitBody, /setTimeout[\s\S]*scheduleElevatorEscapeNextRound[\s\S]*360/, 'Correct rock-shaft answers should wait for the break animation before dropping to the next layer.');
assert.match(source, /\.elevator-hearts\s*\{[\s\S]*position:\s*absolute/, 'Ten HP hearts should sit on the game frame.');
assert.match(source, /\.elevator-hearts\s*\{[\s\S]*grid-template-columns:\s*repeat\(10/, 'HP frame should reserve ten heart slots.');
assert.match(source, /\.elevator-heart\.breaking/, 'Lost hearts should get a breaking class.');
assert.match(source, /@keyframes elevator-heart-break/, 'Lost hearts should animate with a breaking effect.');
assert.match(renderBody, /elevatorEscapePreviousHp/, 'Rendering should compare previous HP to animate newly lost hearts.');
assert.match(renderBody, /breaking/, 'Rendering should mark newly lost hearts as breaking.');
assert.match(renderBody, /-1 ❤/, 'Rendering should show a -1 heart text feedback when HP drops.');
assert.match(source, /\.elevator-failure-scene/, 'Rock shaft should have a dedicated failure scene.');
assert.match(source, /\.elevator-failure-boy/, 'Failure scene should show the battered adventurer.');
assert.match(source, /\.elevator-failure-boy::after/, 'Failure scene should add tattered clothing/dust overlay without new art.');
assert.match(renderBody, /闯关失败/, 'Game over rendering should show a clear failure title.');
assert.match(renderBody, /历经艰险/, 'Failure copy should communicate the adventurer survived a difficult run.');

const scheduleBody = bodyOf('scheduleElevatorEscapeNextRound');
assert.doesNotMatch(scheduleBody, /1100/, 'Correct-answer transition should not pause before showing the next rock layer.');
assert.match(scheduleBody, /setTimeout[\s\S]*80/, 'Once the rock has broken, the next rock layer should catch the falling player almost immediately.');

console.log('elevator escape UI regression tests passed');
