(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankTraining = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function getLaneCount(stage, options = {}) {
    if (options.isMultiLaneStage && !options.isMultiLaneStage(stage)) return 1;
    return 3;
  }

  function getTrainingLaneCount() {
    return 5;
  }

  function getActiveLaneCount(stage) {
    return Math.min(3, Math.max(1, stage));
  }

  function getActiveLaneIndexes(stage) {
    const activeCount = getActiveLaneCount(stage);
    if (activeCount === 1) return [1];
    if (activeCount === 2) return [0, 2];
    return [0, 1, 2];
  }

  function getTrainingLaneIndexes() {
    return [0, 1, 2, 3, 4];
  }

  function isLaneLive(lane) {
    return Boolean(lane?.active && !lane.defeated && lane.enemy && lane.enemy.hp > 0);
  }

  function isTrainingLaneLearned(lane, trainingHits, trainingHitsRequired) {
    return Boolean(lane?.training && lane.word && (trainingHits[lane.word.hanzi] || 0) >= trainingHitsRequired);
  }

  function isTrainingLaneSelectable(lane, trainingHits, trainingHitsRequired) {
    return Boolean(lane?.active && lane.training && lane.word && !isTrainingLaneLearned(lane, trainingHits, trainingHitsRequired));
  }

  function normalizeLaneEnemy(enemy, enemyAttackInterval = 5) {
    return {
      ...enemy,
      id: "infantry",
      name: "Regular Soldier",
      hp: 1,
      maxHp: 1,
      armor: 0,
      maxArmor: 0,
      absoluteDefense: 0,
      maxAbsoluteDefense: 0,
      damage: 1,
      attackInterval: Math.max(5, Number(enemy.attackInterval || enemyAttackInterval))
    };
  }

  function getLaneTop(index, count) {
    if (count <= 1) return 50;
    const topPadding = count >= 5 ? 12 : 16;
    const bottomPadding = count >= 5 ? 88 : 84;
    return topPadding + ((bottomPadding - topPadding) * index) / (count - 1);
  }

  function getLaneEnemyLeft(progress) {
    return 82 - Math.max(0, Math.min(100, progress)) * 0.5;
  }

  function createCombatLaneStates(options) {
    const {
      stage,
      activeLaneIndexes,
      createEnemy,
      isBossStage,
      pickLaneWord,
      enemyAttackInterval
    } = options;
    const count = getLaneCount(stage);
    const activeIndexes = new Set(activeLaneIndexes || getActiveLaneIndexes(stage));
    const used = new Set();
    let enemyStageCursor = stage;
    return Array.from({ length: count }, (_, index) => {
      const active = activeIndexes.has(index);
      while (isBossStage(enemyStageCursor)) enemyStageCursor += 1;
      const enemy = active ? normalizeLaneEnemy(createEnemy(enemyStageCursor), enemyAttackInterval) : null;
      if (active) enemyStageCursor += 1;
      const word = active ? pickLaneWord(used) : null;
      if (word) used.add(word.hanzi);
      return {
        id: `lane-${index}`,
        active,
        enemy,
        word,
        progress: Math.max(0, index * 7 - stage),
        defeated: false,
        element: null,
        healthFill: null,
        hpText: null,
        tag: null,
        track: null
      };
    });
  }

  function createTrainingLaneStates(options) {
    const {
      stage,
      trainingWords,
      previousLaneStates = [],
      activeLaneIndex = 0,
      trainingHits,
      trainingHitsRequired
    } = options;
    const count = getTrainingLaneCount();
    const activeIndexes = new Set(getTrainingLaneIndexes());
    const wordsByHanzi = new Map(trainingWords.map((word) => [word.hanzi, word]));
    const laneStates = Array.from({ length: count }, (_, index) => {
      const previousWord = previousLaneStates[index]?.word;
      const word = activeIndexes.has(index)
        ? previousWord && wordsByHanzi.has(previousWord.hanzi)
          ? wordsByHanzi.get(previousWord.hanzi)
          : trainingWords[index] || null
        : null;
      const active = Boolean(word);
      return {
        id: `training-lane-${index}`,
        active,
        training: true,
        enemy: active ? { id: "dummy", name: "Target Dummy", hp: 1, maxHp: 1, damage: 0, attackInterval: 999 } : null,
        word,
        progress: Math.max(0, index * 7 - stage),
        defeated: false,
        element: null,
        healthFill: null,
        hpText: null,
        tag: null,
        track: null
      };
    });
    const liveIndexes = laneStates
      .map((lane, index) => isTrainingLaneSelectable(lane, trainingHits, trainingHitsRequired) ? index : -1)
      .filter((index) => index >= 0);
    const nextActiveLaneIndex = liveIndexes.includes(activeLaneIndex)
      ? activeLaneIndex
      : liveIndexes[Math.floor(liveIndexes.length / 2)] || 0;
    return { laneStates, activeLaneIndex: nextActiveLaneIndex };
  }

  function selectTrainingWords(words, scriptedWord, shuffle, total = 5) {
    const picked = [];
    if (scriptedWord) picked.push(scriptedWord);
    const candidates = shuffle(words.filter((word) => !picked.some((item) => item.hanzi === word.hanzi)));
    while (picked.length < total && candidates.length > 0) picked.push(candidates.shift());
    return picked;
  }

  function getTrainingRemainingWords(trainingWords, trainingHits, trainingHitsRequired) {
    return trainingWords.filter((word) => (trainingHits[word.hanzi] || 0) < trainingHitsRequired);
  }

  function pickTrainingWord(trainingWords, trainingHits, trainingHitsRequired, currentTrainingWord) {
    const remaining = getTrainingRemainingWords(trainingWords, trainingHits, trainingHitsRequired);
    if (remaining.length === 0) return null;
    if (!currentTrainingWord || (trainingHits[currentTrainingWord.hanzi] || 0) >= trainingHitsRequired) return remaining[0];
    return currentTrainingWord;
  }

  function recordTrainingHit(trainingHits, hanzi, trainingHitsRequired) {
    return {
      ...trainingHits,
      [hanzi]: Math.min(trainingHitsRequired, (trainingHits[hanzi] || 0) + 1)
    };
  }

  return {
    getLaneCount,
    getTrainingLaneCount,
    getActiveLaneCount,
    getActiveLaneIndexes,
    getTrainingLaneIndexes,
    isLaneLive,
    isTrainingLaneLearned,
    isTrainingLaneSelectable,
    normalizeLaneEnemy,
    getLaneTop,
    getLaneEnemyLeft,
    createCombatLaneStates,
    createTrainingLaneStates,
    selectTrainingWords,
    getTrainingRemainingWords,
    pickTrainingWord,
    recordTrainingHit
  };
});
