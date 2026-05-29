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

const bossHammerAttack = bodyOf('bossHammerAttack');
const tweenEnemyAttackToBase = bodyOf('tweenEnemyAttackToBase');
const stopCountdown = bodyOf('stopCountdown');
// 检查攻击未命中前不会 reset/reload/回原位
assert.doesNotMatch(bossHammerAttack, /tweenEnemyAttackToBase\([^,]*,[^)]*outDuration: 520/,
  'Boss should not retreat immediately after impact (outDuration: 520 should not be used after impact)');
assert.match(stopCountdown, /const preserveMeleePose = preserveEnemyPosition && enemyUsesReloadApproach\(currentEnemy\)/,
  'Countdown handoff should detect that a reload-approach enemy is already holding its close pose.');
assert.match(stopCountdown, /if \(!preserveMeleePose\) enemyTank\.classList\.remove\("reloading"\)/,
  'Preserved melee attacks should not remove the close-pose class before the attack animation starts.');
assert.match(bossHammerAttack, /enemyMeleePoseHeldForAttack/,
  'Boss hammer should honor the preserved close-pose handoff after countdown cleanup.');
assert.match(bossHammerAttack, /if \(!wasApproaching\) enemyTank\.classList\.remove\("reloading"\)/,
  'Boss should only remove the reload approach pose early when it really needs a fresh approach.');
assert.match(bossHammerAttack, /const chargeHold = 360/,
  'Boss attack should include a readable charge/hold phase before the swing impact');
assert.match(bossHammerAttack, /const impactTime = approachDuration \+ chargeHold \+ swingWindup/,
  'Boss impact timing should occur after approach, charge, and swing phases');
assert.match(bossHammerAttack, /}, impactTime \+ postImpactHold\)/,
  'Boss should hold at attack position after impact before retreating');
assert.match(tweenEnemyAttackToBase, /typeof windup\.outDuration === "number" \? windup\.outDuration : 360/,
  'Attack tween helper should honor an explicit zero outDuration.');
assert.match(tweenEnemyAttackToBase, /if \(outDuration <= 0\) return/,
  'Attack tween helper should not schedule a default snap-back when outDuration is zero.');
console.log('boss no reset before impact test passed');
