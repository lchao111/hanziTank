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

  return {
    normalizeBankWord,
    recordProfileWord
  };
});
