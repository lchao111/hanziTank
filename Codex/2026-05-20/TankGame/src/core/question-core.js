(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankQuestions = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function shuffleList(list, random = Math.random) {
    if (!Array.isArray(list)) return [];
    const shuffled = [...list];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function getBossPhraseOptions(seenWords, wordByHanzi) {
    const safeSeenWords = Array.isArray(seenWords) ? seenWords : [];
    const wordMap = wordByHanzi && typeof wordByHanzi === "object" ? wordByHanzi : {};
    const seenMap = new Set(safeSeenWords.map((word) => word?.hanzi).filter(Boolean));
    const options = safeSeenWords
      .filter((word) => word?.hanzi)
      .map((word) => {
        const bankWord = wordMap[word.hanzi] || word;
        return { text: bankWord.hanzi, speechText: bankWord.hanzi, chars: [bankWord.hanzi], word: bankWord };
      });
    if (options.length > 0) return options;
    return [];
  }

  function pickBossPhrase(seenWords, wordByHanzi, random = Math.random) {
    const options = getBossPhraseOptions(seenWords, wordByHanzi);
    if (options.length === 0) return { text: "", chars: [] };
    return options[Math.floor(random() * options.length)];
  }

  function getBossChoiceWords(phrase, seenWords, allWords, wordByHanzi, random = Math.random) {
    const safePhraseChars = Array.isArray(phrase?.chars) ? phrase.chars : [];
    const safeSeenWords = Array.isArray(seenWords) ? seenWords : [];
    const safeAllWords = Array.isArray(allWords) ? allWords : [];
    const wordMap = wordByHanzi && typeof wordByHanzi === "object" ? wordByHanzi : {};
    const phraseSet = new Set(safePhraseChars);
    const phraseWords = safePhraseChars.map((char) => wordMap[char]).filter(Boolean);
    const distractors = shuffleList(safeSeenWords.filter((word) => !phraseSet.has(word.hanzi)), random).slice(0, 6 - phraseWords.length);
    const filled = [...phraseWords, ...distractors];
    if (filled.length < 6) {
      filled.push(...shuffleList(safeAllWords.filter((word) => !filled.some((item) => item.hanzi === word.hanzi)), random).slice(0, 6 - filled.length));
    }
    return shuffleList(filled, random).slice(0, 6);
  }

  function getCorrectBankCount(correctBank, hanzi) {
    if (!correctBank || typeof correctBank !== "object" || !hanzi) return 0;
    return Math.max(0, Number(correctBank[hanzi]?.count || 0));
  }

  function getPracticeCount(word, correctBank, runCorrectCounts) {
    if (!word || !word.hanzi) return 0;
    const runCounts = runCorrectCounts && typeof runCorrectCounts === "object" ? runCorrectCounts : {};
    const runCount = Math.max(0, Number(runCounts[word.hanzi] || 0));
    const lifetimeCount = getCorrectBankCount(correctBank, word.hanzi);
    return Math.max(lifetimeCount, runCount);
  }

  function getPracticeBucket(correctCount) {
    if (correctCount >= 10) return "mastered";
    if (correctCount >= 5) return "strong";
    if (correctCount >= 1) return "learning";
    return "new";
  }

  function getSpacedRepetitionWeight(correctCount) {
    const bucket = getPracticeBucket(correctCount);
    if (bucket === "mastered") return 0.05;
    if (bucket === "strong") return 0.75;
    if (bucket === "learning") return 3;
    return 8;
  }

  function getWordWeight(word, correctBank, runCorrectCounts) {
    if (!word || !word.hanzi) return 0;
    return getSpacedRepetitionWeight(getPracticeCount(word, correctBank, runCorrectCounts));
  }

  function pickWeightedWord(options, correctBank, runCorrectCounts, random = Math.random) {
    const safeOptions = Array.isArray(options) ? options.filter(Boolean) : [];
    if (safeOptions.length === 0) return null;
    const totalWeight = safeOptions.reduce((total, word) => total + getWordWeight(word, correctBank, runCorrectCounts), 0);
    if (totalWeight <= 0) return safeOptions[Math.floor(random() * safeOptions.length)];
    let roll = random() * totalWeight;
    for (const word of safeOptions) {
      roll -= getWordWeight(word, correctBank, runCorrectCounts);
      if (roll <= 0) return word;
    }
    return safeOptions[safeOptions.length - 1];
  }

  function getAntiAirFlightDuration(score = 0, options = {}) {
    const startMs = Math.max(1000, Number(options.startMs) || 7000);
    return startMs;
  }

  function getAntiAirPlaneCount(waveNumber = 1, options = {}) {
    const baseCount = Math.max(1, Number(options.baseCount) || 4);
    const addEvery = Math.max(1, Number(options.addEvery) || 5);
    const safeWave = Math.max(1, Math.floor(Number(waveNumber) || 1));
    return baseCount + Math.floor((safeWave - 1) / addEvery);
  }

  function getAntiAirHeadingDeg(path) {
    const deltaX = Number(path.endXPercent) - Number(path.startXPercent);
    const deltaY = Number(path.endYPercent) - Number(path.startYPercent);
    if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return 0;
    return Math.round(Math.atan2(deltaY, deltaX) * 180 / Math.PI);
  }

  function createAntiAirWave(config = {}) {
    const safeWords = Array.isArray(config.words) ? config.words.filter((word) => word?.hanzi) : [];
    const random = typeof config.random === "function" ? config.random : Math.random;
    const currentHanzi = config.currentHanzi || "";
    const candidates = safeWords.filter((word) => word.hanzi !== currentHanzi);
    const target = pickWeightedWord(candidates, config.correctBank, config.runCorrectCounts, random) || candidates[0] || safeWords[0] || null;
    if (!target) return { target: null, planes: [], flightDurationMs: getAntiAirFlightDuration(config.score) };
    const planeCount = Math.min(safeWords.length, getAntiAirPlaneCount(config.waveNumber));

    const uniqueByHanzi = new Map();
    uniqueByHanzi.set(target.hanzi, target);
    shuffleList(candidates.filter((word) => word.hanzi !== target.hanzi), random).forEach((word) => {
      if (uniqueByHanzi.size < planeCount) uniqueByHanzi.set(word.hanzi, word);
    });
    shuffleList(safeWords.filter((word) => !uniqueByHanzi.has(word.hanzi)), random).forEach((word) => {
      if (uniqueByHanzi.size < planeCount) uniqueByHanzi.set(word.hanzi, word);
    });

    const layout = [
      { startXPercent: 112, startYPercent: 18, endXPercent: -18, endYPercent: 54, xOffsetPercent: 0, launchDelayMs: 0 },
      { startXPercent: -20, startYPercent: 34, endXPercent: 112, endYPercent: 14, xOffsetPercent: 4, launchDelayMs: 170 },
      { startXPercent: 94, startYPercent: -18, endXPercent: 18, endYPercent: 82, xOffsetPercent: -5, launchDelayMs: 330 },
      { startXPercent: -16, startYPercent: 82, endXPercent: 102, endYPercent: 44, xOffsetPercent: 8, launchDelayMs: 520 },
      { startXPercent: 42, startYPercent: -22, endXPercent: 76, endYPercent: 112, xOffsetPercent: -8, launchDelayMs: 690 },
      { startXPercent: 118, startYPercent: 70, endXPercent: -22, endYPercent: 22, xOffsetPercent: 12, launchDelayMs: 860 },
      { startXPercent: -24, startYPercent: 12, endXPercent: 86, endYPercent: 92, xOffsetPercent: -12, launchDelayMs: 1030 },
      { startXPercent: 66, startYPercent: 116, endXPercent: 22, endYPercent: -20, xOffsetPercent: 6, launchDelayMs: 1200 }
    ];

    const planeWords = shuffleList([...uniqueByHanzi.values()], random).slice(0, planeCount);
    return {
      target,
      flightDurationMs: getAntiAirFlightDuration(config.score),
      planes: planeWords.map((word, index) => ({
        id: `aa-${index + 1}-${word.hanzi}`,
        word,
        isTarget: word.hanzi === target.hanzi,
        ...layout[index % layout.length],
        xOffsetPercent: layout[index % layout.length].xOffsetPercent + Math.floor(index / layout.length) * 6,
        launchDelayMs: layout[index % layout.length].launchDelayMs + Math.floor(index / layout.length) * 150,
        headingDeg: getAntiAirHeadingDeg(layout[index % layout.length])
      }))
    };
  }

  function applyAntiAirMiss(lives) {
    return Math.max(0, Math.floor(Number(lives) || 0) - 1);
  }

  return {
    shuffleList,
    getBossPhraseOptions,
    pickBossPhrase,
    getBossChoiceWords,
    getCorrectBankCount,
    getPracticeCount,
    getPracticeBucket,
    getSpacedRepetitionWeight,
    getWordWeight,
    pickWeightedWord,
    getAntiAirFlightDuration,
    getAntiAirPlaneCount,
    createAntiAirWave,
    applyAntiAirMiss
  };
});
