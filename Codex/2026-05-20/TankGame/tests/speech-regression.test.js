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
assert.match(renderBossQuestion, /listen to one Hanzi/, 'Boss prompt should ask for a single Hanzi.');
assert.match(renderBossQuestion, /const bossWord = bossPhrase\.word \|\| wordByHanzi\[bossPhrase\.text\]/, 'Boss question should resolve the single target Hanzi word.');
assert.match(renderBossQuestion, /queueHanziAudioBackgroundDownload\(bossWord, getBossSpeechText\(bossPhrase\)\)/, 'Boss question should enqueue missing offline Hanzi audio as soon as it is generated.');
assert.match(renderBossQuestion, /speakBossPhrase\(phraseToSpeak/, 'Boss question must play the single-Hanzi pronunciation every time it renders.');
assert.match(renderBossQuestion, /preserveMessage:\s*true/, 'Boss auto-pronunciation must not overwrite the question prompt.');
assert.match(renderBossQuestion, /autoRetry:\s*true/, 'Boss auto-pronunciation should retry across delayed voice readiness.');
assert.match(renderBossQuestion, /currentEnemy\.id\s*===\s*"boss"/, 'Boss speech should only run while still in a boss question.');
assert.match(renderBossQuestion, /bossPhrase\s*===\s*phraseToSpeak/, 'Boss speech should not pronounce stale phrases after rerenders.');
assert.match(renderBossQuestion, /!locked/, 'Boss speech should only fire after the question is selectable.');

assert.doesNotMatch(source, /id="speakButton"/, 'The manual Speak control should stay out of the battle toolbar.');
assert.doesNotMatch(source, /id="nextButton"/, 'The manual Next Word control should stay out of the battle toolbar.');
assert.doesNotMatch(source, />Next Word</, 'The battle toolbar should not show the removed Next Word label.');
assert.doesNotMatch(source, /Click Speak/, 'Speech fallback copy should not refer to a removed Speak button.');

const getBossSpeechText = bodyOf('getBossSpeechText');
assert.match(getBossSpeechText, /phrase\.speechText/, 'Boss speech should prefer the prompt-specific speech text.');
assert.doesNotMatch(getBossSpeechText, /getSpokenWordText\(word\)/, 'Boss speech should not fall back to word-context audio.');
assert.match(getBossSpeechText, /phrase\.text/, 'Boss speech should fall back to the single target Hanzi.');

const chooseBossAnswer = bodyOf('chooseBossAnswer');
assert.match(chooseBossAnswer, /const correct = button\.dataset\.hanzi === bossPhrase\.text/, 'Boss answer should be a single matching Hanzi click.');
assert.doesNotMatch(chooseBossAnswer, /bossSelection\.length < 2/, 'Boss answer should not require a two-character sequence.');
assert.match(chooseBossAnswer, /playerState\.review\[targetWord\.hanzi\]/, 'Wrong Boss Hanzi should enter the review queue.');
assert.match(chooseBossAnswer, /recordCorrectWord\(targetWord\)/, 'Correct Boss Hanzi should count as learned practice.');
assert.match(chooseBossAnswer, /getCorrectLearningFeedback\(targetWord, wasNew\)/, 'Correct Boss Hanzi should show learning and rank feedback.');
assert.doesNotMatch(chooseBossAnswer, /speakBossPhrase\(bossPhrase/, 'Boss answer feedback should not repeat the Hanzi after selection.');

assert.match(source, /<script src="src\/data\/hanzi-audio-manifest\.js"><\/script>/, 'Browser should load the Hanzi audio manifest before game orchestration.');
assert.match(source, /hanzi: window\.HanziTankAudio\?\.hanziVoiceLines \|\| \{ "一": "assets\/audio\/hanzi\/u4e00-p01\.mp3" \}/, 'Word speech should use the generated Hanzi audio manifest with a fallback for 一.');
assert.match(source, /phrases: window\.HanziTankAudio\?\.hanziPhraseVoiceLines/, 'Word speech should support phrase-specific generated Hanzi audio clips.');
assert.match(source, /hanziAudioDownloadQueueKey\s*=\s*"hanziTankAudioDownloadQueue"/, 'Missing Hanzi audio should use a stable browser queue key.');

const getHanziAudioFileName = bodyOf('getHanziAudioFileName');
assert.match(getHanziAudioFileName, /window\.HanziTankAudio\?\.getHanziPhraseAudioFile/, 'Audio file naming should prefer the shared phrase-specific manifest helper.');
assert.match(getHanziAudioFileName, /window\.HanziTankAudio\?\.getHanziAudioFile/, 'Audio file naming should keep the legacy manifest helper as a fallback.');
assert.match(getHanziAudioFileName, /codePointAt\(0\)\.toString\(16\)/, 'Audio file naming should fall back to Unicode codepoint filenames.');

const getHanziVoiceLine = bodyOf('getHanziVoiceLine');
assert.match(getHanziVoiceLine, /customVoiceLines\.phrases\[word\.hanzi\]/, 'Word speech should use phrase-specific manifest recordings first.');
assert.match(getHanziVoiceLine, /customVoiceLines\.hanzi\[word\.hanzi\]/, 'Word speech should use manifest-routed Hanzi recordings first.');
assert.match(getHanziVoiceLine, /assets\/audio\/hanzi\/\$\{getHanziAudioFileName\(word\.hanzi\)\}/, 'Word speech should derive a predictable MP3 path when the manifest has no entry yet.');

const queueMissingHanziAudio = bodyOf('queueMissingHanziAudio');
assert.match(queueMissingHanziAudio, /readHanziAudioDownloadQueue\(\)/, 'Missing Hanzi audio should merge with the existing download queue.');
assert.match(queueMissingHanziAudio, /textOverride \|\| getSpokenWordText\(word\)/, 'Queued Hanzi audio should include the spoken prompt text needed by the generator.');
assert.match(queueMissingHanziAudio, /assets\/audio\/hanzi\/\$\{file\}/, 'Queued Hanzi audio should include the target offline MP3 path.');
assert.match(queueMissingHanziAudio, /attempts:\s*1/, 'New download queue entries should track first failure count.');
assert.match(queueMissingHanziAudio, /existing\.attempts = \(existing\.attempts \|\| 0\) \+ 1/, 'Repeated missing audio should update, not duplicate, queue entries.');

const playCustomVoiceLine = bodyOf('playCustomVoiceLine');
assert.match(playCustomVoiceLine, /new Audio\(src\)/, 'Custom voice lines should use browser audio playback.');
assert.match(playCustomVoiceLine, /audio\.onerror = useFallback/, 'Custom voice lines should fallback if the recording fails to load.');
assert.match(playCustomVoiceLine, /playback\.catch/, 'Custom voice lines should fallback if browser playback is blocked.');
assert.match(playCustomVoiceLine, /onMissing\?\.\(\)/, 'Custom voice line failures should report missing audio to the download queue.');
assert.match(playCustomVoiceLine, /finishLearningAudio\(\);[\s\S]*onMissing\?\.\(\);[\s\S]*fallback\?\.\(\)/, 'Failed MP3 playback should restore ducking before the TTS fallback starts.');

const queueHanziAudioBackgroundDownload = bodyOf('queueHanziAudioBackgroundDownload');
assert.match(queueHanziAudioBackgroundDownload, /new Audio\(src\)/, 'Generated questions should probe offline audio availability in the background.');
assert.match(queueHanziAudioBackgroundDownload, /audio\.onerror = \(\) =>/, 'Background audio probes should detect missing MP3 files.');
assert.match(queueHanziAudioBackgroundDownload, /queueMissingHanziAudio\(word, reason, textOverride, fileOverride\)/, 'Background audio probes should enqueue missing clips for TTS generation.');

const renderQuestion = bodyOf('renderQuestion');
assert.match(renderQuestion, /queueHanziAudioBackgroundDownload\(word, getSpokenWordText\(word\)\)/, 'Random normal questions should enqueue missing offline audio when rendered.');

const speakBossPhrase = bodyOf('speakBossPhrase');
assert.match(speakBossPhrase, /playCustomVoiceLine\(/, 'Boss speech should try offline Hanzi MP3 before browser TTS.');
assert.match(speakBossPhrase, /getHanziVoiceLine\(word\)/, 'Boss speech should use the regular Hanzi MP3 path.');
assert.match(speakBossPhrase, /queueMissingHanziAudio\(word, "background-tts-download", speechText\)/, 'Boss speech should enqueue missing regular Hanzi clips for background TTS.');
assert.match(speakBossPhrase, /queueChineseSpeech\(speechText, speechOptions\)/, 'Boss speech should temporarily fallback to browser TTS after queueing missing audio.');

const speakWord = bodyOf('speakWord');
assert.match(speakWord, /const speechOptions = withLearningAudio\(\{ preserveMessage:\s*true, autoRetry:\s*true, delay:\s*80 \}\)/, 'Word speech should preserve prompts and retry TTS fallback.');
assert.match(speakWord, /getHanziVoiceLine\(word\)/, 'Word speech should try offline Hanzi MP3 first.');
assert.match(speakWord, /queueMissingHanziAudio\(word\)/, 'Missing custom Hanzi recordings should be added to the download queue.');
assert.match(speakWord, /queueChineseSpeech\(getSpokenWordText\(word\), speechOptions\)/, 'Custom Hanzi recording failures should fallback to the normal word TTS queue.');

const queueChineseSpeech = bodyOf('queueChineseSpeech');
assert.match(queueChineseSpeech, /getLearningSpeechOptions\(options\)/, 'Queued speech should default to learning-audio ducking.');
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
assert.match(retryPendingSpeech, /speakChinese\(text, withLearningAudio\(\{ preserveMessage:\s*true \}\)\)/, 'Pending speech retry should not overwrite gameplay prompts.');

const speakChinese = bodyOf('speakChinese');
assert.match(speakChinese, /utterance\.lang\s*=\s*"zh-CN"/, 'Chinese speech must request zh-CN pronunciation.');
assert.match(speakChinese, /utterance\.rate\s*=\s*0\.75/, 'Chinese speech should use the normal learning speech rate.');
assert.match(speakChinese, /pendingSpeechText\s*=\s*text/, 'Speech errors should preserve text for retry.');
assert.match(speakChinese, /options\.autoRetry/, 'Speech errors should support one automatic retry.');
assert.match(speakChinese, /return true/, 'Successful speech requests should report success.');

const getChineseVoice = bodyOf('getChineseVoice');
assert.match(getChineseVoice, /voice\.lang\.toLowerCase\(\) === "zh-cn"/, 'Chinese voice selection should prefer exact zh-CN voices.');
assert.match(getChineseVoice, /startsWith\("zh"\)/, 'Chinese voice selection should fall back to any Chinese voice.');

assert.match(source, /document\.addEventListener\("pointerdown", \(\) => setTimeout\(retryPendingSpeech, 0\)\)/, 'User interaction should retry pending speech.');

console.log('speech regression tests passed');
