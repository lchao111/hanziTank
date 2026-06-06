(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankLearning = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function normalizeBankWord(word, fallbackPhrase = "") {
    if (!word || !word.hanzi) return null;
    return {
      hanzi: word.hanzi,
      meaning: word.meaning || "boss word",
      phrase: word.phrase || fallbackPhrase || word.hanzi
    };
  }

  function ensureBank(state, bankName) {
    if (!state || typeof state !== "object") {
      throw new Error("Cannot record learning progress without a valid player state.");
    }
    if (!bankName || typeof bankName !== "string") {
      throw new Error("Cannot record learning progress without a valid bank name.");
    }
    state[bankName] = state[bankName] && typeof state[bankName] === "object" ? state[bankName] : {};
    return state[bankName];
  }

  function recordProfileWord(state, bankName, word, options = {}) {
    const normalized = normalizeBankWord(word, options.fallbackPhrase);
    if (!normalized) return null;
    const bank = ensureBank(state, bankName);
    const entry = bank[normalized.hanzi] || {
      ...normalized,
      count: 0,
      lastSeen: ""
    };
    entry.count += 1;
    entry.meaning = normalized.meaning;
    entry.phrase = normalized.phrase;
    entry.lastSeen = options.now || new Date().toISOString();
    bank[normalized.hanzi] = entry;
    return entry;
  }

  function getSharedLearningWordSource(words = [], state = {}) {
    const uniqueWords = [];
    const seen = new Set();
    (Array.isArray(words) ? words : []).forEach((word) => {
      if (!word?.hanzi || seen.has(word.hanzi)) return;
      seen.add(word.hanzi);
      uniqueWords.push(word);
    });

    const review = state?.review && typeof state.review === "object" ? state.review : {};
    const correctBank = state?.correctBank && typeof state.correctBank === "object" ? state.correctBank : {};
    const reviewWords = [];
    const newWords = [];
    const practiceWords = [];

    uniqueWords.forEach((word) => {
      if (Number(review[word.hanzi] || 0) > 0) {
        reviewWords.push(word);
      } else if (correctBank[word.hanzi]) {
        practiceWords.push(word);
      } else {
        newWords.push(word);
      }
    });

    return [...reviewWords, ...newWords, ...practiceWords];
  }

  return {
    normalizeBankWord,
    recordProfileWord,
    getSharedLearningWordSource
  };
});
