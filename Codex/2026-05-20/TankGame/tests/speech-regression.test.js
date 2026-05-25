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
assert.match(renderBossQuestion, /autoRetry:\s*true/, 'Boss auto-pronunciation should retry across delayed voice readiness.');
assert.match(renderBossQuestion, /currentEnemy\.id\s*===\s*"boss"/, 'Boss speech should only run while still in a boss question.');
assert.match(renderBossQuestion, /bossPhrase\s*===\s*phraseToSpeak/, 'Boss speech should not pronounce stale phrases after rerenders.');
assert.match(renderBossQuestion, /!locked/, 'Boss speech should only fire after the question is selectable.');

const speakCurrentWord = bodyOf('speakCurrentWord');
assert.match(speakCurrentWord, /currentEnemy\.id\s*===\s*"boss"\s*&&\s*bossPhrase/, 'Speak button must detect boss questions.');
assert.match(speakCurrentWord, /speakChinese\(bossPhrase\.text/, 'Speak button must repeat the current boss phrase.');

const queueChineseSpeech = bodyOf('queueChineseSpeech');
assert.match(queueChineseSpeech, /pendingSpeechText\s*=\s*text/, 'Queued speech should be remembered for retry.');
assert.match(queueChineseSpeech, /queuedSpeechRequest\s*=\s*\{/, 'Queued speech should store a structured retry request.');
assert.match(queueChineseSpeech, /flushQueuedSpeech\(token\)/, 'Queued speech should flush through retry-aware logic.');

const flushQueuedSpeech = bodyOf('flushQueuedSpeech');
assert.match(flushQueuedSpeech, /request\.options\.shouldSpeak/, 'Queued speech should support stale-state guards.');
assert.match(flushQueuedSpeech, /!voicesReady/, 'Speech queue should wait for delayed browser voices.');
assert.match(flushQueuedSpeech, /request\.attempts < request\.maxAttempts/, 'Speech queue should retry a bounded number of times.');
assert.match(flushQueuedSpeech, /speakChinese\(request\.text, request\.options\)/, 'Speech queue must eventually call the speech engine.');

const retryPendingSpeech = bodyOf('retryPendingSpeech');
assert.match(retryPendingSpeech, /if \(queuedSpeechRequest\)/, 'User interaction should flush queued speech first.');
assert.match(retryPendingSpeech, /speakChinese\(text, \{ preserveMessage:\s*true \}\)/, 'Pending speech retry should not overwrite gameplay prompts.');

const announceHighExplosiveReady = bodyOf('announceHighExplosiveReady');
assert.match(announceHighExplosiveReady, /unlockAudio\(\)/, 'Equipping high-explosive ammo should unlock audio during the user click.');
assert.match(announceHighExplosiveReady, /if \(options\.playLoadSound !== false\) playHighExplosiveLoadSound\(\)/, 'Equipping high-explosive ammo should play a loading sound unless a debug voice-only test disables it.');
assert.match(announceHighExplosiveReady, /const speakFallback = \(\) =>/, 'High-explosive ready speech should define a TTS fallback for missing custom recordings.');
assert.match(announceHighExplosiveReady, /speakChinese\("高爆弹，装填完毕", speechOptions\)/, 'High-explosive ready fallback should speak immediately during the user click.');
assert.match(announceHighExplosiveReady, /rate: 0\.58, pitch: 0\.48, voiceStyle: "military"/, 'High-explosive ready speech should use a lower male military-style voice shape.');
assert.match(announceHighExplosiveReady, /delete speechOptions\.playLoadSound/, 'Speech-only debug options should not leak into SpeechSynthesis options.');
assert.match(announceHighExplosiveReady, /queueChineseSpeech\("高爆弹，装填完毕", \{ \.\.\.speechOptions, delay: 40 \}\)/, 'High-explosive ready speech should still queue a fallback if direct speech fails.');
assert.match(announceHighExplosiveReady, /playCustomVoiceLine\(customVoiceLines\.highExplosiveReady, speechOptions, speakFallback\)/, 'High-explosive ready speech should prefer the custom recorded voice line.');
assert.doesNotMatch(source, /announceHighExplosiveFire/, 'High-explosive firing should not trigger a launch voice line.');
assert.doesNotMatch(source, /queueChineseSpeech\("发射"/, 'The removed firing voice line should not be queued.');

const playCustomVoiceLine = bodyOf('playCustomVoiceLine');
assert.match(playCustomVoiceLine, /new Audio\(src\)/, 'Custom voice lines should use browser audio playback.');
assert.match(playCustomVoiceLine, /audio\.onerror = \(\) =>/, 'Custom voice lines should fallback if the recording fails to load.');
assert.match(playCustomVoiceLine, /playback\.catch/, 'Custom voice lines should fallback if browser playback is blocked.');

assert.match(source, /highExplosiveReady: "assets\/audio\/high-explosive-ready\.mp3"/, 'High-explosive ready should look for the custom recording in assets/audio.');
assert.match(source, /<script src="src\/data\/hanzi-audio-manifest\.js"><\/script>/, 'Browser should load the Hanzi audio manifest before game orchestration.');
assert.match(source, /hanzi: window\.HanziTankAudio\?\.hanziVoiceLines \|\| \{ "一": "assets\/audio\/hanzi\/u4e00\.mp3" \}/, 'Word speech should use the generated Hanzi audio manifest with a fallback for 一.');

const speakWord = bodyOf('speakWord');
assert.match(speakWord, /const customVoiceLine = customVoiceLines\.hanzi\[word\.hanzi\]/, 'Word speech should check for custom Hanzi recordings.');
assert.match(speakWord, /playCustomVoiceLine\(customVoiceLine, speechOptions, speakFallback\)/, 'Custom Hanzi recordings should play before TTS fallback.');
assert.match(speakWord, /queueChineseSpeech\(getSpokenWordText\(word\), \{ \.\.\.speechOptions, delay: 80 \}\)/, 'Custom Hanzi recording failures should fallback to the normal word TTS queue.');

const playHighExplosiveLoadSound = bodyOf('playHighExplosiveLoadSound');
assert.match(playHighExplosiveLoadSound, /playNoise\(0\.09/, 'High-explosive load cue should include a short mechanical noise.');
assert.match(playHighExplosiveLoadSound, /playTone\(154/, 'High-explosive load cue should include a low command-like tone.');

const getSpeechDebugStatus = bodyOf('getSpeechDebugStatus');
assert.match(getSpeechDebugStatus, /speechSynthesis/, 'Debug speech status should inspect Web Speech availability.');
assert.match(getSpeechDebugStatus, /Chinese \$\{chineseVoices\.length\}/, 'Debug speech status should report Chinese voice count.');
assert.match(getSpeechDebugStatus, /getChineseVoice\(\{ voiceStyle: "military" \}\)/, 'Debug speech status should show the military voice selection.');
assert.match(getSpeechDebugStatus, /military \$\{militaryName\}/, 'Debug speech status should name the selected military voice.');

const getDebugSpeechOptions = bodyOf('getDebugSpeechOptions');
assert.match(getDebugSpeechOptions, /onStart: \(\) => setDebugSpeechStatus\(`Playing: \$\{label\}\.\`\)/, 'Debug speech tests should report when speech starts.');
assert.match(getDebugSpeechOptions, /onError: \(\) => setDebugSpeechStatus/, 'Debug speech tests should report speech errors.');

const testDebugSpeech = bodyOf('testDebugSpeech');
assert.match(testDebugSpeech, /announceHighExplosiveReady\(getDebugSpeechOptions\("高爆装填", \{ playLoadSound: false \}\)\)/, 'Debug high-explosive speech test should be voice-only and avoid the loading sound effect.');
assert.match(testDebugSpeech, /speakChinese\("坦克，前进", getDebugSpeechOptions\("Boss 短语"/, 'Debug speech tests should include a Boss-style phrase.');
assert.match(testDebugSpeech, /const customVoiceLine = customVoiceLines\.hanzi\[word\.hanzi\]/, 'Debug current Hanzi speech test should use custom recordings when available.');
assert.match(testDebugSpeech, /playCustomVoiceLine\(customVoiceLine, getDebugSpeechOptions\(`当前汉字 \$\{word\.hanzi\}`\)/, 'Debug current Hanzi speech test should play custom Hanzi recordings before TTS.');
assert.match(testDebugSpeech, /speakChinese\(getSpokenWordText\(word\), getDebugSpeechOptions\("当前汉字"\)\)/, 'Debug current Hanzi speech test should fallback to normal TTS.');
assert.match(testDebugSpeech, /speakChinese\("语音测试", getDebugSpeechOptions\("普通中文"/, 'Debug speech tests should include direct plain Chinese speech.');

const openDebugMode = bodyOf('openDebugMode');
assert.match(openDebugMode, /debugOpenedFromProfileGate = !profileGate\.classList\.contains\("hidden"\)/, 'Debug Mode should remember whether it was opened from the login screen.');
assert.match(openDebugMode, /if \(debugOpenedFromProfileGate\) hideProfileGate\(\)/, 'Debug Mode should hide the login screen while open.');

const closeDebugMode = bodyOf('closeDebugMode');
assert.match(closeDebugMode, /shouldReturnToProfileGate = debugOpenedFromProfileGate && !options\.keepProfileHidden/, 'Closing Debug Mode should know when to return to login.');
assert.match(closeDebugMode, /profileGate\.classList\.remove\("hidden"\)/, 'Closing Debug Mode from login should restore the login screen.');

const speakChinese = bodyOf('speakChinese');
assert.match(speakChinese, /utterance\.lang\s*=\s*"zh-CN"/, 'Chinese speech must request zh-CN pronunciation.');
assert.match(speakChinese, /utterance\.rate\s*=\s*options\.rate \|\| 0\.75/, 'Chinese speech should allow specialized voice-line rate overrides.');
assert.match(speakChinese, /utterance\.pitch\s*=\s*options\.pitch \|\| 1/, 'Chinese speech should allow specialized voice-line pitch overrides.');
assert.match(speakChinese, /getChineseVoice\(options\)/, 'Chinese speech should pass voice style preferences into voice selection.');
assert.match(speakChinese, /utterance\.onstart = \(\) => options\.onStart\?\.\(\)/, 'Chinese speech should expose start callbacks for Debug Mode.');
assert.match(speakChinese, /utterance\.onend = \(\) => options\.onEnd\?\.\(\)/, 'Chinese speech should expose end callbacks for Debug Mode.');
assert.match(speakChinese, /pendingSpeechText\s*=\s*text/, 'Speech errors should preserve text for retry.');
assert.match(speakChinese, /options\.onError\?\.\(event\)/, 'Chinese speech should expose error callbacks for Debug Mode.');
assert.match(speakChinese, /options\.autoRetry/, 'Speech errors should support one automatic retry.');
assert.match(speakChinese, /return true/, 'Successful speech requests should report success.');
assert.doesNotMatch(speakChinese, /No Chinese voice found/, 'Missing named Chinese voices should not overwrite gameplay prompts before speech is attempted.');

const getChineseVoice = bodyOf('getChineseVoice');
assert.match(getChineseVoice, /options\.voiceStyle === "military"/, 'Chinese voice selection should support a military voice style.');
assert.match(getChineseVoice, /yunxi\|yunjian\|yunyang\|kangkang\|male\|男/i, 'Military voice style should prefer common Chinese male voice names.');
assert.match(getChineseVoice, /!\/xiaoxiao\|xiaoyi\|xiaobei\|xiaoni\|female\|女\/i\.test\(voice\.name\)/, 'Military voice style should avoid common feminine voice names when possible.');

assert.match(source, /document\.addEventListener\("pointerdown", \(\) => setTimeout\(retryPendingSpeech, 0\)\)/, 'User interaction should retry pending speech.');
assert.match(source, /id="debugSpeechStatus"/, 'Debug Mode should show browser speech status.');
assert.match(source, /<button class="profile-debug" id="debugButton" type="button">Debug Mode<\/button>/, 'Debug Mode entry should live on the login screen.');
assert.doesNotMatch(source, /<button class="primary" id="debugButton" type="button">Debug Mode<\/button>/, 'Debug Mode entry should not remain in the in-game controls.');
assert.match(source, /data-debug-speech="plain"/, 'Debug Mode should include a plain Chinese speech test.');
assert.match(source, /data-debug-speech="word"/, 'Debug Mode should include a current Hanzi speech test.');
assert.match(source, /data-debug-speech="boss"/, 'Debug Mode should include a Boss phrase speech test.');
assert.match(source, /data-debug-speech="he"/, 'Debug Mode should include a high-explosive loading speech test.');
assert.match(source, /debugSpeechGrid\.addEventListener\("click"/, 'Debug speech buttons should be wired to click handling.');

console.log('speech regression tests passed');
