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

console.log('question core tests passed');
