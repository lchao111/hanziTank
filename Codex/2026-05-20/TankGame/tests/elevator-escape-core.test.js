const assert = require('assert');
const { createWords, gradeOneWordData } = require('../src/data/grade-one-words.js');
const elevatorEscape = require('../src/core/elevator-escape-core.js');

const words = createWords(gradeOneWordData);

const state = elevatorEscape.createElevatorEscapeState(words, { wordSequence: ['木', '水'] });
assert.strictEqual(state.maxHp, 10);
assert.strictEqual(state.hp, 10);
assert.strictEqual(state.round, 1);
assert.strictEqual(state.currentQuestion.word.hanzi, '木');
assert.strictEqual(state.currentQuestion.speechText, '木');
assert.strictEqual(state.currentQuestion.timeLimitMs, 4000);
assert.strictEqual(state.floorDepth, 1);
assert.strictEqual(state.playerStatus, 'standing');
assert.strictEqual(state.platformCount, 4);
assert.strictEqual(state.playerColumn, 0);
assert.strictEqual(state.awaitingNextLayer, false);
assert.strictEqual(state.collapsedColumn, -1);
assert.strictEqual(state.risingColumn, -1);
assert.strictEqual(state.risingLayer, null);
assert.strictEqual(state.wrongRisingColumn, -1);
assert.strictEqual(state.wrongRisingLayer, null);
assert.strictEqual(state.correctFloatColumn, -1);
assert.deepStrictEqual(state.wrongCarrierColumns, []);
assert.deepStrictEqual(state.wrongColumns, []);
assert.strictEqual(state.currentQuestion.options.length, 4);
assert.ok(state.currentQuestion.options.some((word) => word.hanzi === '木'));

const correctColumn = state.currentQuestion.options.findIndex((word) => word.hanzi === '木');
for (let index = 0; index < correctColumn; index += 1) {
  assert.strictEqual(elevatorEscape.movePlayer(state, 'right').moved, true);
}
assert.strictEqual(state.playerColumn, correctColumn);
assert.strictEqual(elevatorEscape.getPlayerWord(state).hanzi, '木');

const correct = elevatorEscape.answerCurrentPlatform(state);
assert.strictEqual(correct.correct, true);
assert.strictEqual(state.hp, 10);
assert.strictEqual(state.score, 10);
assert.strictEqual(state.playerStatus, 'free-falling');
assert.strictEqual(state.floorDepth, 2);
assert.strictEqual(state.currentQuestion.answered, true);
assert.strictEqual(state.awaitingNextLayer, true);
assert.strictEqual(state.collapsedColumn, -1);
assert.strictEqual(state.risingColumn, correctColumn);
assert.deepStrictEqual(state.risingLayer.options.map((word) => word.hanzi), state.currentQuestion.options.map((word) => word.hanzi));
assert.strictEqual(state.risingLayer.column, correctColumn);

elevatorEscape.advanceRound(state);
assert.strictEqual(state.currentQuestion.word.hanzi, '水');
assert.strictEqual(state.playerStatus, 'standing');
assert.strictEqual(state.awaitingNextLayer, false);
assert.strictEqual(state.collapsedColumn, -1);
assert.strictEqual(state.risingColumn, correctColumn);
assert.ok(state.risingLayer, 'Previous answered layer should still be visible while the new layer catches the player.');
assert.strictEqual(state.playerColumn, correctColumn, 'Player should fall straight down into the same column on the new layer.');
assert.strictEqual(state.currentQuestion.options.length, 4);

const waterColumn = state.currentQuestion.options.findIndex((word) => word.hanzi === '水');
assert.ok(waterColumn >= 0);
const wrongColumn = waterColumn === 0 ? 1 : 0;
while (state.playerColumn > wrongColumn) elevatorEscape.movePlayer(state, 'left');
while (state.playerColumn < wrongColumn) elevatorEscape.movePlayer(state, 'right');
assert.notStrictEqual(elevatorEscape.getPlayerWord(state).hanzi, '水');

const missed = elevatorEscape.answerCurrentPlatform(state);
assert.strictEqual(missed.correct, false);
assert.strictEqual(missed.reason, 'wrong');
assert.strictEqual(missed.correctHanzi, '水');
assert.strictEqual(state.hp, 10);
assert.strictEqual(state.playerStatus, 'standing');
assert.strictEqual(state.revealedHanzi, '');
assert.deepStrictEqual(state.wrongColumns, [wrongColumn]);
assert.strictEqual(state.wrongRisingColumn, -1);
assert.strictEqual(state.wrongRisingLayer, null);
assert.strictEqual(state.currentQuestion.answered, false);

while (state.playerColumn > waterColumn) elevatorEscape.movePlayer(state, 'left');
while (state.playerColumn < waterColumn) elevatorEscape.movePlayer(state, 'right');
const correctAfterWrong = elevatorEscape.answerCurrentPlatform(state);
assert.strictEqual(correctAfterWrong.correct, true);
assert.strictEqual(state.hp, 10);
assert.strictEqual(state.currentQuestion.answered, true);

const afterReveal = elevatorEscape.advanceRound(state);
assert.strictEqual(afterReveal.round, 3);
assert.strictEqual(state.playerStatus, 'standing');
assert.strictEqual(state.revealedHanzi, '');
assert.strictEqual(state.wrongRisingColumn, -1);
assert.strictEqual(state.wrongRisingLayer, null);
assert.strictEqual(state.correctFloatColumn, -1);
assert.deepStrictEqual(state.wrongCarrierColumns, []);
assert.deepStrictEqual(state.wrongColumns, []);
assert.strictEqual(state.currentQuestion.answered, false);

const timeoutState = elevatorEscape.createElevatorEscapeState(words, { wordSequence: ['木'] });
const timeout = elevatorEscape.expireQuestion(timeoutState);
assert.strictEqual(timeout.correct, false);
assert.strictEqual(timeout.reason, 'timeout');
assert.strictEqual(timeout.hazard, 'ceiling-spikes');
assert.strictEqual(timeout.correctHanzi, '木');
assert.strictEqual(timeoutState.hp, 9);
assert.strictEqual(timeoutState.playerStatus, 'ceiling-spiked');
assert.strictEqual(timeoutState.revealedHanzi, '木');

const rockHazardState = elevatorEscape.createElevatorEscapeState(words, { wordSequence: ['水'], hazardSequence: ['flying-rock'] });
assert.strictEqual(rockHazardState.currentQuestion.timeoutHazard, 'flying-rock');
const rockHit = elevatorEscape.expireQuestion(rockHazardState);
assert.strictEqual(rockHit.correct, false);
assert.strictEqual(rockHit.reason, 'timeout');
assert.strictEqual(rockHit.hazard, 'flying-rock');
assert.strictEqual(rockHazardState.hp, 9);
assert.strictEqual(rockHazardState.playerStatus, 'rock-hit');
assert.strictEqual(rockHazardState.activeHazard, 'flying-rock');

const vampireBatState = elevatorEscape.createElevatorEscapeState(words, { wordSequence: ['木'], hazardSequence: ['vampire-bat'] });
assert.strictEqual(vampireBatState.currentQuestion.timeoutHazard, 'vampire-bat');
const batBite = elevatorEscape.expireQuestion(vampireBatState);
assert.strictEqual(batBite.correct, false);
assert.strictEqual(batBite.reason, 'timeout');
assert.strictEqual(batBite.hazard, 'vampire-bat');
assert.strictEqual(vampireBatState.hp, 9);
assert.strictEqual(vampireBatState.playerStatus, 'bat-bitten');
assert.strictEqual(vampireBatState.activeHazard, 'vampire-bat');

const centipedeState = elevatorEscape.createElevatorEscapeState(words, { wordSequence: ['木'], hazardSequence: ['centipede'] });
assert.strictEqual(centipedeState.currentQuestion.timeoutHazard, 'centipede');
const centipedeBite = elevatorEscape.expireQuestion(centipedeState);
assert.strictEqual(centipedeBite.correct, false);
assert.strictEqual(centipedeBite.reason, 'timeout');
assert.strictEqual(centipedeBite.hazard, 'centipede');
assert.strictEqual(centipedeState.hp, 9);
assert.strictEqual(centipedeState.playerStatus, 'centipede-bitten');
assert.strictEqual(centipedeState.activeHazard, 'centipede');

const defeatState = elevatorEscape.createElevatorEscapeState(words, { wordSequence: ['木'] });
for (let index = 0; index < 10; index += 1) {
  elevatorEscape.expireQuestion(defeatState);
  if (!defeatState.gameOver) elevatorEscape.advanceRound(defeatState);
}
assert.strictEqual(defeatState.hp, 0);
assert.strictEqual(defeatState.gameOver, true);
assert.strictEqual(defeatState.playerStatus, 'defeated');
assert.strictEqual(elevatorEscape.answerQuestion(defeatState, '木').reason, 'game-over');

console.log('elevator escape core tests passed');
