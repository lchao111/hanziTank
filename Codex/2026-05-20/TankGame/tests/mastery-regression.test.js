const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

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

assert.match(source, /id="masteryButton"/, 'Mastery Records button should exist.');
assert.match(source, /id="masteryModal"/, 'Mastery Records modal should exist.');
assert.match(source, /<script src="src\/core\/mastery-core\.js"><\/script>/, 'Mastery core should be loaded before game logic.');
assert.match(source, /window\.HanziTankMastery/, 'Game logic should read mastery helpers from the core module.');
assert.match(source, /<script src="src\/data\/enemies\.js"><\/script>/, 'Enemy data should be loaded before game logic.');
assert.match(source, /window\.HanziTankEnemies/, 'Game logic should read enemy data from the enemy data module.');
assert.match(source, /<script src="src\/data\/shop-items\.js"><\/script>/, 'Shop data should be loaded before game logic.');
assert.match(source, /window\.HanziTankShop/, 'Game logic should read shop data from the shop data module.');
assert.match(source, /<script src="src\/core\/storage-core\.js"><\/script>/, 'Storage core should be loaded before game logic.');
assert.match(source, /window\.HanziTankStorage/, 'Game logic should read storage helpers from the storage core module.');
assert.match(source, /<script src="src\/core\/combat-core\.js"><\/script>/, 'Combat core should be loaded before game logic.');
assert.match(source, /window\.HanziTankCombat/, 'Game logic should read combat helpers from the combat core module.');
assert.match(source, /<script src="src\/core\/learning-core\.js"><\/script>/, 'Learning core should be loaded before game logic.');
assert.match(source, /window\.HanziTankLearning/, 'Game logic should read learning helpers from the learning core module.');
assert.match(source, /<script src="src\/core\/question-core\.js"><\/script>/, 'Question core should be loaded before game logic.');
assert.match(source, /window\.HanziTankQuestions/, 'Game logic should read question helpers from the question core module.');

const getMasteredWords = bodyOf('getMasteredWords');
assert.match(getMasteredWords, /playerState\.correctBank/, 'Mastered words should come from the persistent correctBank.');
assert.match(getMasteredWords, /getMasteredEntries\(bank\)/, 'Mastered words should use the extracted core helper.');
assert.doesNotMatch(getMasteredWords, /wrongBank|review|warArchive/, 'Mastery should not be derived from temporary battle or mistake data.');

const renderMasteryRecords = bodyOf('renderMasteryRecords');
assert.match(renderMasteryRecords, /getMasteredWords\(\)/, 'Mastery screen should render learned Hanzi from correctBank.');
assert.match(renderMasteryRecords, /masteredCount/, 'Mastery screen should calculate unique mastered count.');
assert.match(renderMasteryRecords, /War losses do not erase learning/, 'Mastery screen should communicate that learning survives defeat.');

const getProfileBestRecord = bodyOf('getProfileBestRecord');
assert.match(getProfileBestRecord, /state\.correctBank/, 'Leaderboard records should count mastered Hanzi from correctBank.');
assert.match(getProfileBestRecord, /countMasteredHanzi\(state\.correctBank\)/, 'Leaderboard records should use the extracted mastery count helper.');
assert.match(getProfileBestRecord, /const rank = getRankForMastery\(masteredCount\)/, 'Leaderboard records should derive the player rank from mastery count.');
assert.match(getProfileBestRecord, /masteredCount,/, 'Leaderboard records should expose mastered Hanzi count.');
assert.match(getProfileBestRecord, /rankName: rank\.name/, 'Leaderboard records should expose English rank name.');
assert.match(getProfileBestRecord, /rankZh: rank\.zh/, 'Leaderboard records should expose Chinese rank name.');

const renderLeaderboard = bodyOf('renderLeaderboard');
assert.match(renderLeaderboard, /Mastered \$\{record\.masteredCount\} Hanzi/, 'Leaderboard should display mastered Hanzi count.');
assert.match(renderLeaderboard, /Rank \$\{record\.rankZh\} · \$\{record\.rankName\}/, 'Leaderboard should display current rank.');

const buildWarSummary = bodyOf('buildWarSummary');
assert.match(buildWarSummary, /const coinsBeforeDefeat = playerState\.coins/, 'War summary should preserve pre-defeat coins in the record.');
assert.match(buildWarSummary, /score\s*=\s*0/, 'Defeat should reset score.');
assert.match(buildWarSummary, /playerState\.coins\s*=\s*0/, 'Defeat should reset coins.');
assert.match(buildWarSummary, /playerState\.dailyScore\s*=\s*0/, 'Defeat should reset daily score.');
assert.doesNotMatch(buildWarSummary, /correctBank\s*=|delete playerState\.correctBank/, 'Defeat must not clear mastered Hanzi.');
assert.match(buildWarSummary, /saveState\(\)/, 'Defeat reset should be persisted.');

assert.match(source, /masteryButton\.addEventListener\("click", openMasteryRecords\)/, 'Mastery Records button should open the modal.');
assert.match(source, /closeMasteryButton\.addEventListener\("click", closeMasteryRecords\)/, 'Mastery modal close button should be wired.');

console.log('mastery regression tests passed');
