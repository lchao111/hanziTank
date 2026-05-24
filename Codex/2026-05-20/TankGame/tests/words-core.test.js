const assert = require('assert');
const wordsCore = require('../src/data/grade-one-words.js');

assert.strictEqual(wordsCore.gradeOneWordData.length, 155, 'Grade 1 word bank should keep the current 155 Hanzi.');
assert.deepStrictEqual(wordsCore.gradeOneWordData[0], ['一', 'one', ['一个', '一只']]);
assert.deepStrictEqual(wordsCore.gradeOneWordData[wordsCore.gradeOneWordData.length - 1], ['又', 'again', ['又来', '又大']]);

const words = wordsCore.createWords();
assert.strictEqual(words.length, 155);
assert.deepStrictEqual(words[0], { hanzi: '一', meaning: 'one', phrases: ['一个', '一只'], phrase: '一个' });

const wordMap = wordsCore.createWordMap(words);
assert.strictEqual(wordMap['喝'].meaning, 'drink');
assert.deepStrictEqual(wordMap['喝'].phrases, ['喝水', '喝茶']);
assert.strictEqual(wordMap['又'].phrase, '又来');

const uniqueHanzi = new Set(words.map((word) => word.hanzi));
assert.strictEqual(uniqueHanzi.size, words.length, 'Hanzi entries should be unique.');

console.log('words core tests passed');
