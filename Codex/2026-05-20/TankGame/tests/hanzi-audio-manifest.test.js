const assert = require('assert');
const audio = require('../src/data/hanzi-audio-manifest.js');
const wordsCore = require('../src/data/grade-one-words.js');

assert.ok(Array.isArray(audio.hanziAudioPrompts), 'Hanzi audio prompts should be exported as a list.');
assert.ok(audio.hanziAudioPrompts.length >= 620, 'Batch audio prompt list should include multiple phrase prompts for each Grade 1 Hanzi.');
assert.strictEqual(audio.hanziVoiceLines['一'], 'assets/audio/hanzi/u4e00-p01.mp3');
assert.deepStrictEqual(audio.hanziPhraseVoiceLines['天'].slice(0, 6), [
	'assets/audio/hanzi/u5929-p01.mp3',
	'assets/audio/hanzi/u5929-p02.mp3',
	'assets/audio/hanzi/u5929-p03.mp3',
	'assets/audio/hanzi/u5929-p04.mp3',
	'assets/audio/hanzi/u5929-p05.mp3'
]);
assert.strictEqual(audio.getHanziAudioFile('雨'), 'u96e8.mp3');
assert.strictEqual(audio.getHanziPhraseAudioFile('雨', 2), 'u96e8-p03.mp3');
assert.strictEqual(audio.hanziAudioPrompts.find((item) => item.hanzi === '雨' && item.phrase === '下雨').text, '雨，下雨');
assert.strictEqual(audio.hanziAudioPrompts.find((item) => item.hanzi === '东' && item.phrase === '东方').file, 'u4e1c-p02.mp3');
assert.strictEqual(audio.hanziVoiceLines['东'], 'assets/audio/hanzi/u4e1c-p01.mp3');
assert.ok(audio.hanziAudioPrompts.some((item) => item.hanzi === '天' && item.phrase === '蓝天'));
assert.ok(audio.hanziAudioPrompts.some((item) => item.hanzi === '天' && item.phrase === '星期天'));
assert.ok(audio.hanziAudioPrompts.every((item) => item.file.endsWith('.mp3')), 'Every Hanzi audio prompt should target an mp3 file.');
assert.strictEqual(new Set(audio.hanziAudioPrompts.map((item) => `${item.hanzi}:${item.phrase}`)).size, audio.hanziAudioPrompts.length, 'Hanzi audio prompts should not contain duplicate Hanzi/phrase pairs.');
assert.strictEqual(new Set(audio.hanziAudioPrompts.map((item) => item.file)).size, audio.hanziAudioPrompts.length, 'Hanzi audio prompts should not contain duplicate output files.');

const manifestHanzi = new Set(audio.hanziAudioPrompts.map((item) => item.hanzi));
const missingGradeOneHanzi = wordsCore.gradeOneWordData
	.map(([hanzi]) => hanzi)
	.filter((hanzi) => !manifestHanzi.has(hanzi));
assert.deepStrictEqual(missingGradeOneHanzi, [], 'Every Grade 1 Hanzi should have an offline TTS MP3 manifest entry.');

console.log('hanzi audio manifest tests passed');
