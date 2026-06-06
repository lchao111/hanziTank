const assert = require('assert');
const {
  createBouncingTankBossState,
  resolveBouncingTankAttack,
  getBouncingTankVisualState
} = require('../src/core/bouncing-tank-boss-core.js');

let state = createBouncingTankBossState({ maxHp: 10, dodgesUntilMalfunction: 3 });
assert.deepStrictEqual(state, {
  hp: 10,
  maxHp: 10,
  mode: 'bouncing',
  dodgeCount: 0,
  dodgesUntilMalfunction: 3,
  laneIndex: 1,
  laneCount: 3
});

let turn = resolveBouncingTankAttack(state, { correct: true, damage: 2 });
assert.strictEqual(turn.result.dodged, true, 'First correct attack should be dodged.');
assert.strictEqual(turn.result.hpDamage, 0, 'Dodged attacks must not damage the boss.');
assert.strictEqual(turn.state.hp, 10);
assert.strictEqual(turn.state.dodgeCount, 1);
assert.strictEqual(turn.state.mode, 'bouncing');
assert.strictEqual(turn.state.laneIndex, 2, 'Dodged attacks should move the boss to another lane.');

const wrongLane = resolveBouncingTankAttack(turn.state, { correct: true, damage: 2, playerLaneIndex: 0 });
assert.strictEqual(wrongLane.result.laneMiss, true, 'Correct attacks from the wrong lane should miss the mobile boss.');
assert.strictEqual(wrongLane.result.hpDamage, 0);
assert.strictEqual(wrongLane.state.hp, 10);
assert.strictEqual(wrongLane.state.dodgeCount, 1, 'Wrong-lane shots should not advance the dodge counter.');
assert.strictEqual(wrongLane.state.laneIndex, 2, 'Wrong-lane shots should not move the boss.');

turn = resolveBouncingTankAttack(turn.state, { correct: true, damage: 2, playerLaneIndex: 2 });
assert.strictEqual(turn.state.dodgeCount, 2);
assert.strictEqual(turn.state.mode, 'bouncing');
assert.strictEqual(turn.state.laneIndex, 0);

turn = resolveBouncingTankAttack(turn.state, { correct: true, damage: 2, playerLaneIndex: 0 });
assert.strictEqual(turn.result.dodged, true);
assert.strictEqual(turn.result.malfunctionStarted, true, 'Third dodge should start mechanical malfunction.');
assert.strictEqual(turn.state.hp, 10);
assert.strictEqual(turn.state.dodgeCount, 3);
assert.strictEqual(turn.state.mode, 'malfunction');
assert.strictEqual(turn.state.laneIndex, 1, 'The malfunction window should happen on the lane the boss jumped to.');
assert.strictEqual(getBouncingTankVisualState(turn.state), 'malfunction');

const missedWindow = resolveBouncingTankAttack(turn.state, { correct: false, damage: 2 });
assert.strictEqual(missedWindow.result.vulnerabilityLost, true, 'Failed attack during malfunction should close the damage window.');
assert.strictEqual(missedWindow.state.mode, 'bouncing');
assert.strictEqual(missedWindow.state.dodgeCount, 0);
assert.strictEqual(missedWindow.state.hp, 10);

state = createBouncingTankBossState({ maxHp: 10, dodgesUntilMalfunction: 3 });
state = resolveBouncingTankAttack(state, { correct: true, playerLaneIndex: 1 }).state;
state = resolveBouncingTankAttack(state, { correct: true, playerLaneIndex: 2 }).state;
state = resolveBouncingTankAttack(state, { correct: true, playerLaneIndex: 0 }).state;
turn = resolveBouncingTankAttack(state, { correct: true, damage: 4, playerLaneIndex: 1 });
assert.strictEqual(turn.result.dodged, false, 'Correct attack during malfunction should hit.');
assert.strictEqual(turn.result.hpDamage, 4);
assert.strictEqual(turn.state.hp, 6);
assert.strictEqual(turn.state.mode, 'malfunction', 'Correct malfunction hits should keep the damage window open.');
assert.strictEqual(turn.state.dodgeCount, 3);

turn = resolveBouncingTankAttack(turn.state, { correct: true, damage: 4, playerLaneIndex: 1 });
assert.strictEqual(turn.result.hpDamage, 4, 'A second quick answer during malfunction should deal more damage.');
assert.strictEqual(turn.state.hp, 2);
assert.strictEqual(turn.state.mode, 'malfunction');

const failedAfterDamage = resolveBouncingTankAttack(turn.state, { correct: false, damage: 0, playerLaneIndex: 1 });
assert.strictEqual(failedAfterDamage.result.vulnerabilityLost, true);
assert.strictEqual(failedAfterDamage.state.mode, 'bouncing');
assert.strictEqual(failedAfterDamage.state.dodgeCount, 0);

assert.strictEqual(getBouncingTankVisualState({ ...turn.state, hp: 5 }), 'malfunction');
assert.strictEqual(getBouncingTankVisualState({ ...turn.state, mode: 'bouncing', hp: 5 }), 'weak');
assert.strictEqual(getBouncingTankVisualState({ ...turn.state, hp: 0 }), 'destroyed');

console.log('bouncing tank boss core tests passed');