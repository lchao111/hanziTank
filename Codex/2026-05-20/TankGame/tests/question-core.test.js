const assert = require('assert');
const wordsCore = require('../src/data/grade-one-words.js');
const questions = require('../src/core/question-core.js');

const words = wordsCore.createWords();
const wordByHanzi = wordsCore.createWordMap(words);

assert.deepStrictEqual(questions.shuffleList([1, 2, 3], () => 0), [2, 3, 1], 'Shuffle should be deterministic when random is injected.');
assert.deepStrictEqual(questions.shuffleList(null), [], 'Shuffle should tolerate non-arrays.');

const seenWords = ['一', '百', '千', '万', '左', '右'].map((hanzi) => wordByHanzi[hanzi]);
const options = questions.getBossPhraseOptions(seenWords, wordByHanzi);
assert.ok(options.some((option) => option.text === '一'), 'Boss options should include single learned Hanzi.');
assert.ok(options.some((option) => option.text === '右'), 'Boss options should include each seen Hanzi as a target.');
assert.ok(options.every((option) => option.chars.length === 1), 'Boss options should stay single-Hanzi prompts.');
assert.ok(options.every((option) => option.word?.hanzi === option.text), 'Boss options should keep the target word for learning records.');
assert.strictEqual(options.find((option) => option.text === '左').speechText, '左', 'Boss audio should speak only the target Hanzi.');
const lookOptions = questions.getBossPhraseOptions(['看', '见'].map((hanzi) => wordByHanzi[hanzi]), wordByHanzi);
assert.strictEqual(lookOptions.find((option) => option.text === '看').speechText, '看', 'Boss audio should not include a word hint.');

const fallbackOptions = questions.getBossPhraseOptions([{ hanzi: '甲' }, { hanzi: '乙' }], {});
assert.deepStrictEqual(fallbackOptions, [
	{ text: '甲', speechText: '甲', chars: ['甲'], word: { hanzi: '甲' } },
	{ text: '乙', speechText: '乙', chars: ['乙'], word: { hanzi: '乙' } }
]);
assert.deepStrictEqual(questions.getBossPhraseOptions([], {}), []);

const pickedPhrase = questions.pickBossPhrase(seenWords, wordByHanzi, () => 0);
assert.deepStrictEqual(pickedPhrase, options[0]);

const bossChoices = questions.getBossChoiceWords({ text: '左', chars: ['左'], word: wordByHanzi['左'] }, seenWords, words, wordByHanzi, () => 0);
assert.strictEqual(bossChoices.length, 6);
assert.ok(bossChoices.some((word) => word.hanzi === '左'));
assert.strictEqual(new Set(bossChoices.map((word) => word.hanzi)).size, bossChoices.length, 'Boss choices should not contain duplicates.');

assert.strictEqual(questions.getCorrectBankCount({ 一: { count: 5 } }, '一'), 5);
assert.strictEqual(questions.getCorrectBankCount({}, '一'), 0);
assert.strictEqual(questions.getPracticeCount({ hanzi: '一' }, { 一: { count: 5 } }, { 一: 2 }), 5, 'Lifetime count should survive new runs and dominate lower run counts.');
assert.strictEqual(questions.getPracticeCount({ hanzi: '二' }, {}, { 二: 3 }), 3, 'Run count should still down-weight repeated words within a run.');
assert.strictEqual(questions.getPracticeBucket(0), 'new');
assert.strictEqual(questions.getPracticeBucket(1), 'learning');
assert.strictEqual(questions.getPracticeBucket(5), 'strong');
assert.strictEqual(questions.getPracticeBucket(10), 'mastered');
assert.strictEqual(questions.getSpacedRepetitionWeight(0), 8);
assert.strictEqual(questions.getSpacedRepetitionWeight(1), 3);
assert.strictEqual(questions.getSpacedRepetitionWeight(5), 0.75);
assert.strictEqual(questions.getSpacedRepetitionWeight(10), 0.05);
assert.strictEqual(questions.getWordWeight({ hanzi: '一' }, { 一: { count: 1 } }, {}), 3);
assert.strictEqual(questions.getWordWeight({ hanzi: '一' }, { 一: { count: 5 } }, {}), 0.75);
assert.strictEqual(questions.getWordWeight({ hanzi: '一' }, { 一: { count: 10 } }, {}), 0.05);
assert.strictEqual(questions.getWordWeight(null, {}), 0);

const weightedOptions = [{ hanzi: '一' }, { hanzi: '二' }];
assert.deepStrictEqual(questions.pickWeightedWord(weightedOptions, { 一: { count: 10 } }, {}, () => 0), { hanzi: '一' });
assert.deepStrictEqual(questions.pickWeightedWord(weightedOptions, { 一: { count: 10 } }, {}, () => 0.99), { hanzi: '二' });
assert.strictEqual(questions.pickWeightedWord([], {}, {}, () => 0), null);

assert.strictEqual(questions.getAntiAirFlightDuration(0), 7000, 'Anti-air wave should start with a 7 second flight.');
assert.strictEqual(questions.getAntiAirFlightDuration(4), 7000, 'Anti-air speed should hold until each fifth score.');
assert.strictEqual(questions.getAntiAirFlightDuration(5), 7000, 'Anti-air flight duration should no longer speed up after 5 points.');
assert.strictEqual(questions.getAntiAirFlightDuration(20), 7000, 'Anti-air flight duration should stay fixed while plane count scales.');
assert.strictEqual(questions.getAntiAirPlaneCount(1), 4, 'Anti-air should start with four planes.');
assert.strictEqual(questions.getAntiAirPlaneCount(5), 4, 'Anti-air should keep four planes through wave 5.');
assert.strictEqual(questions.getAntiAirPlaneCount(6), 5, 'Anti-air should add one plane every five waves.');
assert.strictEqual(questions.getAntiAirPlaneCount(11), 6, 'Anti-air should keep scaling plane count by wave bands.');

const antiAirWords = ['一', '二', '三', '四', '五', '六'].map((hanzi) => wordByHanzi[hanzi]);
const antiAirWave = questions.createAntiAirWave({
	words: antiAirWords,
	currentHanzi: '一',
	correctBank: { 二: { count: 10 } },
	runCorrectCounts: {},
	score: 6,
	waveNumber: 6,
	random: () => 0.01
});
assert.strictEqual(antiAirWave.planes.length, 5, 'Anti-air wave 6 should launch five planes.');
assert.strictEqual(antiAirWave.target.hanzi, '三', 'Anti-air target should use the same weighted Hanzi selection logic while excluding the current word.');
assert.ok(antiAirWave.planes.some((plane) => plane.word.hanzi === antiAirWave.target.hanzi), 'One anti-air plane should carry the spoken target Hanzi.');
assert.strictEqual(antiAirWave.planes.filter((plane) => plane.isTarget).length, 1, 'Only the spoken Hanzi plane should be marked as the real plane.');
assert.strictEqual(antiAirWave.planes.find((plane) => plane.isTarget).word.hanzi, antiAirWave.target.hanzi, 'The real plane should be the spoken Hanzi plane.');
assert.ok(antiAirWave.planes.filter((plane) => !plane.isTarget).every((plane) => plane.word.hanzi !== antiAirWave.target.hanzi), 'Fake planes should not be marked as bomb-dropping targets.');
assert.strictEqual(new Set(antiAirWave.planes.map((plane) => plane.word.hanzi)).size, antiAirWave.planes.length, 'Anti-air planes should carry unique Hanzi.');
assert.ok(new Set(antiAirWave.planes.map((plane) => plane.startYPercent)).size > 1, 'Anti-air planes should be vertically staggered.');
assert.ok(new Set(antiAirWave.planes.map((plane) => plane.xOffsetPercent)).size > 1, 'Anti-air planes should not fly as one vertical line.');
const antiAirRouteKeys = antiAirWave.planes.map((plane) => [plane.startXPercent, plane.startYPercent, plane.endXPercent, plane.endYPercent, plane.launchDelayMs].join(':'));
assert.strictEqual(new Set(antiAirRouteKeys).size, antiAirWave.planes.length, 'Extra anti-air planes should not overlap an earlier plane route and launch timing.');
assert.ok(antiAirWave.planes.some((plane) => plane.endXPercent > plane.startXPercent), 'Some anti-air planes should fly left-to-right.');
assert.ok(antiAirWave.planes.some((plane) => plane.endXPercent < plane.startXPercent), 'Some anti-air planes should fly right-to-left.');
assert.ok(antiAirWave.planes.some((plane) => plane.endYPercent !== plane.startYPercent), 'Anti-air planes should include diagonal flight paths.');
assert.ok(antiAirWave.planes.every((plane) => Number.isFinite(plane.headingDeg)), 'Each anti-air plane should carry a heading angle for nose direction.');
assert.ok(new Set(antiAirWave.planes.map((plane) => Math.round(plane.headingDeg))).size > 1, 'Anti-air plane heading angles should vary with their flight direction.');
assert.strictEqual(antiAirWave.flightDurationMs, 7000, 'Anti-air wave should keep a fixed 7 second flight duration.');
assert.strictEqual(questions.applyAntiAirMiss(10), 9, 'Missing one anti-air plane should cost one tank HP.');
assert.strictEqual(questions.applyAntiAirMiss(0), 0, 'Anti-air HP should not drop below zero.');

console.log('question core tests passed');
