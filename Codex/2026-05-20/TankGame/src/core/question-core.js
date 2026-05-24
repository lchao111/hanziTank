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
    const seenMap = new Set(safeSeenWords.map((word) => word.hanzi));
    const options = [];
    safeSeenWords.forEach((word) => {
      (word.phrases || []).forEach((phrase) => {
        const chars = [...phrase];
        if (chars.length !== 2) return;
        if (chars.every((char) => seenMap.has(char) && wordMap[char])) {
          options.push({ text: phrase, chars });
        }
      });
    });
    if (options.length > 0) return options;
    const fallbackChars = safeSeenWords.slice(0, 2).map((word) => word.hanzi).filter(Boolean);
    return fallbackChars.length > 0 ? [{ text: fallbackChars.join(""), chars: fallbackChars }] : [];
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
    pickWeightedWord
  };
});
