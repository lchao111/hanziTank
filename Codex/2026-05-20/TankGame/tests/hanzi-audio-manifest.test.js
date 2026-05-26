const assert = require('assert');
const audio = require('../src/data/hanzi-audio-manifest.js');
const wordsCore = require('../src/data/grade-one-words.js');

assert.ok(Array.isArray(audio.hanziAudioPrompts), 'Hanzi audio prompts should be exported as a list.');
assert.ok(audio.hanziAudioPrompts.length >= 60, 'Batch audio prompt list should include the requested Hanzi set.');
assert.strictEqual(audio.hanziVoiceLines['一'], 'assets/audio/hanzi/u4e00.mp3');
assert.strictEqual(audio.getHanziAudioFile('雨'), 'u96e8.mp3');
assert.strictEqual(audio.hanziAudioPrompts.find((item) => item.hanzi === '雨').text, '雨，下雨，雷阵雨');
assert.strictEqual(audio.hanziAudioPrompts.find((item) => item.hanzi === '东').text, '东，东西，东方');
assert.strictEqual(audio.hanziVoiceLines['东'], 'assets/audio/hanzi/u4e1c.mp3');
assert.strictEqual(audio.hanziAudioPrompts.find((item) => item.hanzi === '厂').text, '厂，工厂，厂长');
assert.ok(audio.hanziAudioPrompts.every((item) => item.file.endsWith('.mp3')), 'Every Hanzi audio prompt should target an mp3 file.');
assert.strictEqual(new Set(audio.hanziAudioPrompts.map((item) => item.hanzi)).size, audio.hanziAudioPrompts.length, 'Hanzi audio prompts should not contain duplicate Hanzi keys.');
assert.strictEqual(new Set(audio.hanziAudioPrompts.map((item) => item.file)).size, audio.hanziAudioPrompts.length, 'Hanzi audio prompts should not contain duplicate output files.');

const manifestHanzi = new Set(audio.hanziAudioPrompts.map((item) => item.hanzi));
const missingGradeOneHanzi = wordsCore.gradeOneWordData
	.map(([hanzi]) => hanzi)
	.filter((hanzi) => !manifestHanzi.has(hanzi));
assert.deepStrictEqual(missingGradeOneHanzi, [], 'Every Grade 1 Hanzi should have an offline TTS MP3 manifest entry.');

console.log('hanzi audio manifest tests passed');
