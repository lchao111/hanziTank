const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function bodyOf(functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notStrictEqual(start, -1, `${functionName} should exist.`);
  const parameterEnd = source.indexOf(')', start);
  const braceStart = source.indexOf('{', parameterEnd);
  let depth = 0;
  for (let index = braceStart; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(braceStart + 1, index);
    }
  }
  throw new Error(`Could not parse ${functionName}.`);
}

assert.match(source, /<script src="src\/core\/bgm-manager\.js"><\/script>/, 'BGM manager should load before game orchestration.');
assert.match(source, /<script src="src\/core\/sfx-helper\.js"><\/script>/, 'SFX helper should load before game orchestration.');
assert.match(source, /new window\.HanziTankBgm\.BgmManager/, 'Index should instantiate the BGM manager.');
assert.match(source, /new window\.HanziTankSfx\.SfxHelper/, 'Index should instantiate the SFX helper.');

assert.match(bodyOf('startAdventureMode'), /startBattleMusic\(\)/, 'Adventure start should start BGM.');
assert.match(bodyOf('restoreRunProgress'), /startBattleMusic\(\)/, 'Restored runs should restart BGM.');
assert.match(bodyOf('pauseGame'), /pauseBattleMusic\(\)/, 'Game pause should pause BGM.');
assert.match(bodyOf('resumeGame'), /resumeBattleMusic\(\)/, 'Game resume should restore BGM.');
assert.match(bodyOf('showGameOver'), /stopBattleMusic\(\)/, 'Game over should stop BGM.');

assert.match(bodyOf('openArsenal'), /suspendMusicForModal\(\)/, 'War prep modal should suspend BGM.');
assert.match(bodyOf('closeArsenal'), /resumeMusicFromModal\(\)/, 'War prep close should restore BGM.');
assert.match(bodyOf('openMasteryRecords'), /suspendMusicForModal\(\)/, 'Mastery modal should suspend BGM.');
assert.match(bodyOf('closeMasteryRecords'), /resumeMusicFromModal\(\)/, 'Mastery modal close should restore BGM.');

assert.match(bodyOf('withLearningAudio'), /beginLearningAudio\(\)/, 'Learning audio should duck BGM and mute SFX at start.');
assert.match(bodyOf('withLearningAudio'), /endLearningAudio\(\)/, 'Learning audio should restore BGM and SFX at end.');
assert.match(bodyOf('getLearningSpeechOptions'), /withLearningAudio\(options\)/, 'Direct TTS prompts should be wrapped with learning audio ducking by default.');
assert.match(bodyOf('queueChineseSpeech'), /const speechOptions = getLearningSpeechOptions\(options\)/, 'Queued TTS should apply learning ducking before playback.');
assert.match(bodyOf('speakWord'), /withLearningAudio/, 'Word speech should use the learning ducking wrapper.');
assert.match(bodyOf('speakBossPhrase'), /withLearningAudio/, 'Boss speech should use the learning ducking wrapper.');
assert.match(bodyOf('playCustomVoiceLine'), /finishLearningAudio\(\);[\s\S]*onMissing\?\.\(\);[\s\S]*fallback\?\.\(\)/, 'Failed MP3 playback should release its duck before starting the TTS fallback.');
assert.match(bodyOf('speakChinese'), /utterance\.onstart = \(\) => options\.onStart\?\.\(\)/, 'TTS should trigger learning audio ducking when speech starts.');
assert.match(bodyOf('speakChinese'), /utterance\.onend = \(\) => options\.onEnd\?\.\(\)/, 'TTS should restore learning audio ducking when speech ends.');

assert.match(bodyOf('applyBattlefieldEnvironment'), /setBattleMusicEnvironment\(environment\)/, 'Battlefield environment changes should update BGM mood.');
assert.match(bodyOf('startBattleMusic'), /setBattleMusicEnvironment\(getBattlefieldEnvironment\(levelNumber\)\)/, 'Battle music startup should sync the current environment mood.');
assert.match(bodyOf('startElevatorEscapeMode'), /setBattleMusicEnvironment\("rock-shaft"\)/, 'Rock shaft mode should switch BGM to the tense cave mood.');
assert.match(bodyOf('startElevatorEscapeMode'), /bgmManager\.start\(\)/, 'Rock shaft mode should start BGM after selecting its cave mood.');

assert.match(bodyOf('buyOrEquip'), /playBuySound\(\)/, 'Buying and equipping should use the buy/equip UI SFX.');
assert.match(bodyOf('buyOrEquip'), /playErrorSound\(\)/, 'Disabled or unaffordable shop actions should use error UI SFX.');
assert.match(bodyOf('closeArsenal'), /playCloseSound\(\)/, 'Close/cancel actions should use close UI SFX.');
assert.match(bodyOf('showPerkChoices'), /playSpecialPanelSound\(\)/, 'Special panels should use special panel SFX.');

console.log('audio lifecycle regression tests passed');
