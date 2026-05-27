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
assert.match(source, /id="currentRankIcon"/, 'Mastery Records should show the current rank icon.');
assert.match(source, /id="appVersion"/, 'Visible build version should exist so browser and test versions can be compared.');
assert.match(source, /const appVersion = "\d{4}\.\d{2}\.\d{2}\.\d{2}"/, 'Build version should use a stable date-based format.');
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
assert.match(renderMasteryRecords, /currentRankIcon\.src = currentRank\.icon/, 'Mastery screen should render the current rank image.');
assert.match(renderMasteryRecords, /War losses do not erase learning/, 'Mastery screen should communicate that learning survives defeat.');

const renderRankLadder = bodyOf('renderRankLadder');
assert.match(renderRankLadder, /rank-card-icon/, 'Rank ladder cards should render rank icons.');
assert.match(renderRankLadder, /src="\$\{rank\.icon\}"/, 'Rank ladder icons should come from mastery rank data.');

const getRankProgressText = bodyOf('getRankProgressText');
assert.match(getRankProgressText, /getRankForMastery\(masteredCount\)/, 'Inline progress should show the current rank.');
assert.match(getRankProgressText, /getNextRank\(masteredCount\)/, 'Inline progress should calculate the next promotion target.');
assert.match(getRankProgressText, /Hanzi · \$\{nextRank\.min - masteredCount\} to \$\{nextRank\.zh\}/, 'Inline progress should show remaining Hanzi to the next rank.');

const getCorrectLearningFeedback = bodyOf('getCorrectLearningFeedback');
assert.match(getCorrectLearningFeedback, /New Hanzi archived/, 'Correct feedback should call out newly learned Hanzi.');
assert.match(getCorrectLearningFeedback, /Review cleared/, 'Correct feedback should call out review cleanup.');
assert.match(getCorrectLearningFeedback, /Practice x\$\{entry\?\.count \|\| 1\}/, 'Correct feedback should show repeated practice count.');
assert.match(getCorrectLearningFeedback, /Hanzi to \$\{nextRank\.zh\}/, 'Correct feedback should include promotion distance.');

const playLearningFeedbackSound = bodyOf('playLearningFeedbackSound');
assert.match(playLearningFeedbackSound, /if \(reviewCleared\)/, 'Review cleanup should have an immediate sound cue.');
assert.match(playLearningFeedbackSound, /if \(wasNew\)/, 'New Hanzi archival should have an immediate sound cue.');

const getStageOpeningWord = bodyOf('getStageOpeningWord');
assert.match(getStageOpeningWord, /stageOpeningHanzi\[stage\]/, 'First stages should use fixed opening Hanzi.');
assert.match(getStageOpeningWord, /playerState\.correctBank\?\.\[scriptedWord\.hanzi\]\?\.count/, 'Scripted opening Hanzi should be skipped after the player has already answered it correctly.');
assert.match(getStageOpeningWord, /correctCount > 0 \? null : scriptedWord/, 'Mastered scripted words should fall back to weighted selection.');
assert.match(source, /2:\s*"看"/, 'Stage 2 should open with a harder Hanzi.');
assert.match(source, /4:\s*"跑"/, 'Stage 4 should open with a fast-action Hanzi.');

const renderStageOpeningQuestion = bodyOf('renderStageOpeningQuestion');
assert.match(renderStageOpeningQuestion, /renderQuestion\(getStageOpeningWord\(stage\) \|\| pickWord\(\)\)/, 'Stage openings should fall back to weighted selection when scripted words are already practiced.');

const choosePerk = bodyOf('choosePerk');
assert.match(choosePerk, /renderStageOpeningQuestion\(\)/, 'Advancing stages should use the stage-opening helper.');

const syncReloadBar = bodyOf('syncReloadBar');
assert.match(syncReloadBar, /const attackInterval = getEnemyAttackInterval\(\)/, 'Reload HUD should use per-enemy attack intervals.');

const startCountdown = bodyOf('startCountdown');
assert.match(source, /function startCountdown\(seconds = getEnemyAttackInterval\(\)\)/, 'Countdown default should use per-enemy attack intervals.');
assert.match(startCountdown, /Math\.min\(attackInterval, seconds \|\| attackInterval\)/, 'Countdown should clamp to the active enemy interval.');

const syncHud = bodyOf('syncHud');
assert.match(syncHud, /wordCountEl\.textContent = `\$\{getRankProgressText\(\)\} · Review \$\{getReviewCount\(\)\}`/, 'Footer status should keep rank progress and review count visible.');
assert.match(syncHud, /appVersionEl\.textContent = `Build \$\{appVersion\}`/, 'Footer status should show the current build version.');

const getProfileBestRecord = bodyOf('getProfileBestRecord');
assert.match(getProfileBestRecord, /state\.correctBank/, 'Leaderboard records should count mastered Hanzi from correctBank.');
assert.match(getProfileBestRecord, /countMasteredHanzi\(state\.correctBank\)/, 'Leaderboard records should use the extracted mastery count helper.');
assert.match(getProfileBestRecord, /const rank = getRankForMastery\(masteredCount\)/, 'Leaderboard records should derive the player rank from mastery count.');
assert.match(getProfileBestRecord, /masteredCount,/, 'Leaderboard records should expose mastered Hanzi count.');
assert.match(getProfileBestRecord, /rankName: rank\.name/, 'Leaderboard records should expose English rank name.');
assert.match(getProfileBestRecord, /rankZh: rank\.zh/, 'Leaderboard records should expose Chinese rank name.');

const renderLeaderboard = bodyOf('renderLeaderboard');
assert.match(renderLeaderboard, /Mastered \$\{escapeInteger\(record\.masteredCount\)\} Hanzi/, 'Leaderboard should display mastered Hanzi count.');
assert.match(renderLeaderboard, /Rank \$\{escapeHtml\(record\.rankZh\)\} · \$\{escapeHtml\(record\.rankName\)\}/, 'Leaderboard should display current rank.');

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

