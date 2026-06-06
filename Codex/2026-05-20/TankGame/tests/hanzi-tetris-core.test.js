const assert = require('assert');
const { createWords, gradeOneWordData } = require('../src/data/grade-one-words.js');
const hanziTetris = require('../src/core/hanzi-tetris-core.js');

const words = createWords(gradeOneWordData);

const state = hanziTetris.createHanziTetrisState(words, { pieceSequence: ['I'], wordSequence: ['木'] });
assert.deepStrictEqual(state.boardSize, { width: 10, height: 20 });
assert.strictEqual(state.currentPiece.type, 'I');
assert.strictEqual(state.currentQuestion.word.hanzi, '木');
assert.strictEqual(state.currentQuestion.speechText, '木');
assert.ok(Array.isArray(state.currentQuestion.options));
const fixedOptions = state.currentQuestion.options.map((word) => word.meaning);
assert.strictEqual(fixedOptions.includes('wood'), true);
assert.strictEqual(state.currentPiece.lockedControls, true);
assert.strictEqual(hanziTetris.movePiece(state, 'left').moved, false);
hanziTetris.tick(state);
assert.deepStrictEqual(state.currentQuestion.options.map((word) => word.meaning), fixedOptions);

const wrong = hanziTetris.answerQuestion(state, 'water');
assert.strictEqual(wrong.correct, false);
assert.strictEqual(state.currentPiece.fastDrop, true);
assert.strictEqual(state.currentPiece.lockedControls, true);
const wrongTick = hanziTetris.tick(state);
assert.strictEqual(wrongTick.locked, true);
assert.strictEqual(state.lockedCells.length, 4);
assert.notStrictEqual(state.currentPiece, null);
assert.strictEqual(state.currentPiece.lockedControls, true);

const playState = hanziTetris.createHanziTetrisState(words, { pieceSequence: ['O'], wordSequence: ['木'] });
const correct = hanziTetris.answerQuestion(playState, 'wood');
assert.strictEqual(correct.correct, true);
assert.strictEqual(correct.phrase, '木头');
assert.strictEqual(correct.speechText, '木。木头。');
assert.strictEqual(playState.currentPiece.lockedControls, false);
assert.strictEqual(playState.currentPiece.fastDrop, false);
assert.strictEqual(hanziTetris.movePiece(playState, 'left').moved, true);
assert.strictEqual(playState.currentPiece.x, 2);
assert.strictEqual(hanziTetris.movePiece(playState, 'right').moved, true);
assert.strictEqual(playState.currentPiece.x, 3);
assert.strictEqual(hanziTetris.rotatePiece(playState).rotated, true);
const dropped = hanziTetris.hardDrop(playState);
assert.strictEqual(dropped.locked, true);
assert.strictEqual(playState.lockedCells.length, 4);
assert.strictEqual(playState.score, 10);
assert.notStrictEqual(playState.currentPiece, null);

const lineState = hanziTetris.createHanziTetrisState(words, { pieceSequence: ['I'], wordSequence: ['一'] });
lineState.lockedCells = Array.from({ length: 9 }, (_, x) => ({ x, y: 19, color: '#64748b' }));
lineState.currentPiece = { type: 'I', rotation: 1, x: 9, y: 16, color: '#38bdf8', lockedControls: false, fastDrop: false };
const lineDrop = hanziTetris.hardDrop(lineState);
assert.strictEqual(lineDrop.linesCleared, 1);
assert.strictEqual(lineState.lines, 1);
assert.strictEqual(lineState.score, 110);

console.log('hanzi tetris core tests passed');
