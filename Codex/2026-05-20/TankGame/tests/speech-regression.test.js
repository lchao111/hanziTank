const assert = require('assert');
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
const source = fs.readFileSync(indexPath, 'utf8');

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

const renderBossQuestion = bodyOf('renderBossQuestion');
assert.match(renderBossQuestion, /questionWordEl\.textContent\s*=\s*"\?\?"/, 'Boss question should hide the answer and rely on audio.');
assert.match(renderBossQuestion, /queueChineseSpeech\(phraseToSpeak\.text/, 'Boss question must queue pronunciation every time it renders.');
assert.match(renderBossQuestion, /preserveMessage:\s*true/, 'Boss auto-pronunciation must not overwrite the question prompt.');
assert.match(renderBossQuestion, /currentEnemy\.id\s*===\s*"boss"/, 'Boss speech should only run while still in a boss question.');
assert.match(renderBossQuestion, /bossPhrase\s*===\s*phraseToSpeak/, 'Boss speech should not pronounce stale phrases after rerenders.');
assert.match(renderBossQuestion, /!locked/, 'Boss speech should only fire after the question is selectable.');

const speakCurrentWord = bodyOf('speakCurrentWord');
assert.match(speakCurrentWord, /currentEnemy\.id\s*===\s*"boss"\s*&&\s*bossPhrase/, 'Speak button must detect boss questions.');
assert.match(speakCurrentWord, /speakChinese\(bossPhrase\.text/, 'Speak button must repeat the current boss phrase.');

const queueChineseSpeech = bodyOf('queueChineseSpeech');
assert.match(queueChineseSpeech, /pendingSpeechText\s*=\s*text/, 'Queued speech should be remembered for retry.');
assert.match(queueChineseSpeech, /options\.shouldSpeak/, 'Queued speech should support stale-state guards.');
assert.match(queueChineseSpeech, /speakChinese\(text, options\)/, 'Queued speech must call the speech engine.');

const retryPendingSpeech = bodyOf('retryPendingSpeech');
assert.match(retryPendingSpeech, /speakChinese\(text, \{ preserveMessage:\s*true \}\)/, 'Pending speech retry should not overwrite gameplay prompts.');

const speakChinese = bodyOf('speakChinese');
assert.match(speakChinese, /utterance\.lang\s*=\s*"zh-CN"/, 'Chinese speech must request zh-CN pronunciation.');
assert.match(speakChinese, /utterance\.rate\s*=\s*0\.75/, 'Chinese speech should keep the slower learning-friendly rate.');
assert.match(speakChinese, /pendingSpeechText\s*=\s*text/, 'Speech errors should preserve text for retry.');
assert.match(speakChinese, /return true/, 'Successful speech requests should report success.');
assert.doesNotMatch(speakChinese, /No Chinese voice found/, 'Missing named Chinese voices should not overwrite gameplay prompts before speech is attempted.');

assert.match(source, /document\.addEventListener\("pointerdown", \(\) => setTimeout\(retryPendingSpeech, 0\)\)/, 'User interaction should retry pending speech.');

console.log('speech regression tests passed');
