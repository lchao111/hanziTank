(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziElevatorEscape = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const defaultTimeLimitMs = 4000;
  const defaultMaxHp = 10;
  const defaultPlatformCount = 4;

  function pickTimeoutHazard(state) {
    if (Array.isArray(state.hazardSequence) && state.hazardSequence.length > 0) {
      return state.hazardSequence[(state.round || 0) % state.hazardSequence.length];
    }
    if (state.floorDepth >= 6 && state.floorDepth % 5 === 0) return "centipede";
    if (state.floorDepth >= 5 && state.floorDepth % 4 === 0) return "vampire-bat";
    return state.floorDepth >= 4 && state.floorDepth % 3 === 0 ? "flying-rock" : "ceiling-spikes";
  }

  function indexWords(words = []) {
    return words.reduce((map, word) => {
      if (word && word.hanzi) map[word.hanzi] = word;
      return map;
    }, {});
  }

  function pickFromSequence(sequence, index, fallbackList) {
    if (Array.isArray(sequence) && sequence.length > 0) return sequence[index % sequence.length];
    return fallbackList[Math.floor(Math.random() * fallbackList.length)];
  }

  function createQuestionOptions(state, word) {
    const allWords = Object.values(state.words);
    const start = Math.max(0, allWords.findIndex((candidate) => candidate.hanzi === word.hanzi));
    const wrong = [];
    for (let offset = 4; wrong.length < state.platformCount - 1 && offset < allWords.length + 4; offset += 9) {
      const candidate = allWords[(start + offset) % allWords.length];
      if (candidate.hanzi !== word.hanzi && !wrong.some((item) => item.hanzi === candidate.hanzi)) wrong.push(candidate);
    }
    const options = [word, ...wrong];
    return options
      .map((option, index) => ({ option, sortKey: (word.hanzi.charCodeAt(0) + index * 5) % 13 }))
      .sort((left, right) => left.sortKey - right.sortKey)
      .map((entry) => entry.option);
  }

  function createQuestion(state) {
    const hanziList = Object.keys(state.words);
    const hanzi = pickFromSequence(state.wordSequence, state.wordIndex, hanziList);
    state.wordIndex += 1;
    const word = state.words[hanzi] || Object.values(state.words)[0] || { hanzi: "木", meaning: "wood", phrases: ["木头"] };
    return {
      word,
      speechText: word.hanzi,
      options: createQuestionOptions(state, word),
      answered: false,
      correct: false,
      timeoutHazard: pickTimeoutHazard(state),
      timeLimitMs: state.timeLimitMs
    };
  }

  function createElevatorEscapeState(words = [], options = {}) {
    const state = {
      maxHp: options.maxHp || defaultMaxHp,
      hp: options.maxHp || defaultMaxHp,
      score: 0,
      round: 0,
      floorDepth: 0,
      platformCount: options.platformCount || defaultPlatformCount,
      playerColumn: 0,
      awaitingNextLayer: false,
      collapsedColumn: -1,
      risingColumn: -1,
      risingLayer: null,
      wrongRisingColumn: -1,
      wrongRisingLayer: null,
      correctFloatColumn: -1,
      wrongCarrierColumns: [],
      wrongColumns: [],
      hazardSequence: options.hazardSequence || [],
      activeHazard: "",
      gameOver: false,
      playerStatus: "standing",
      revealedHanzi: "",
      message: "听发音，左右移动到正确汉字，空格踩下才会下到下一层。",
      words: indexWords(words),
      wordSequence: options.wordSequence || [],
      wordIndex: 0,
      timeLimitMs: options.timeLimitMs || defaultTimeLimitMs,
      currentQuestion: null
    };
    advanceRound(state);
    return state;
  }

  function normalizeAnswer(value) {
    return String(value || "").trim();
  }

  function loseHp(state, status, reason, options = {}) {
    if (!state || state.gameOver || !state.currentQuestion) return { correct: false, reason: state?.gameOver ? "game-over" : "missing-state" };
    const hazard = options.hazard || state.currentQuestion.timeoutHazard || "ceiling-spikes";
    state.currentQuestion.answered = true;
    state.currentQuestion.correct = false;
    state.hp = Math.max(0, state.hp - 1);
    state.playerStatus = state.hp <= 0 ? "defeated" : status;
    state.activeHazard = hazard;
    if (reason === "wrong") {
      state.playerStatus = state.hp <= 0 ? "defeated" : "wrong-rising";
      state.wrongRisingColumn = state.playerColumn;
      state.wrongRisingLayer = { options: state.currentQuestion.options.slice(), column: state.playerColumn };
      state.correctFloatColumn = state.currentQuestion.options.findIndex((word) => word.hanzi === state.currentQuestion.word.hanzi);
      state.wrongCarrierColumns = state.currentQuestion.options
        .map((word, column) => ({ word, column }))
        .filter((entry) => entry.column !== state.correctFloatColumn)
        .map((entry) => entry.column);
    }
    state.revealedHanzi = state.currentQuestion.word.hanzi;
    state.gameOver = state.hp <= 0;
    state.message = reason === "timeout"
      ? (hazard === "flying-rock" ? `时间到了！飞石机关击中小勇者，正确答案是 ${state.revealedHanzi}。` : `时间到了！头顶尖刺压下来，正确答案是 ${state.revealedHanzi}。`)
      : `踩错字了！脚下尖刺刺中小人，正确答案是 ${state.revealedHanzi}。`;
    return { correct: false, reason, hazard, word: state.currentQuestion.word, correctHanzi: state.revealedHanzi };
  }

  function answerQuestion(state, selectedHanzi) {
    if (!state || !state.currentQuestion) return { correct: false, reason: "missing-state" };
    if (state.gameOver) return { correct: false, reason: "game-over" };
    if (state.currentQuestion.answered) return { correct: false, reason: "already-answered" };
    const correct = normalizeAnswer(selectedHanzi) === state.currentQuestion.word.hanzi;
    if (!correct) {
      if (!state.wrongColumns.includes(state.playerColumn)) state.wrongColumns.push(state.playerColumn);
      state.currentQuestion.correct = false;
      state.playerStatus = "standing";
      state.revealedHanzi = "";
      state.message = "砸错了！岩石没有碎，继续找正确的字。";
      return { correct: false, reason: "wrong", word: state.currentQuestion.word, correctHanzi: state.currentQuestion.word.hanzi };
    }
    const word = state.currentQuestion.word;
    state.currentQuestion.answered = true;
    state.currentQuestion.correct = true;
    state.score += 10;
    state.floorDepth += 1;
    state.playerStatus = "free-falling";
    state.awaitingNextLayer = true;
    state.collapsedColumn = -1;
    state.risingColumn = state.playerColumn;
    state.risingLayer = { options: state.currentQuestion.options.slice(), column: state.playerColumn };
    state.wrongColumns = [];
    state.revealedHanzi = "";
    state.message = `答对了！${word.hanzi}。小人自由落体到新岩层，旧岩层继续上升撞碎。`;
    return { correct: true, reason: "correct", word, speechText: word.hanzi };
  }

  function movePlayer(state, direction) {
    if (!state || state.gameOver || state.currentQuestion?.answered) return { moved: false, reason: state?.gameOver ? "game-over" : "locked" };
    const delta = direction === "left" ? -1 : direction === "right" ? 1 : 0;
    if (!delta) return { moved: false, reason: "bad-direction" };
    const nextColumn = Math.max(0, Math.min(state.platformCount - 1, state.playerColumn + delta));
    if (nextColumn === state.playerColumn) return { moved: false, reason: "edge" };
    state.playerColumn = nextColumn;
    return { moved: true, playerColumn: state.playerColumn, word: getPlayerWord(state) };
  }

  function getPlayerWord(state) {
    return state?.currentQuestion?.options?.[state.playerColumn] || null;
  }

  function answerCurrentPlatform(state) {
    const word = getPlayerWord(state);
    return answerQuestion(state, word?.hanzi || "");
  }

  function expireQuestion(state) {
    const hazard = state?.currentQuestion?.timeoutHazard || "ceiling-spikes";
    const status = hazard === "flying-rock" ? "rock-hit" : hazard === "vampire-bat" ? "bat-bitten" : hazard === "centipede" ? "centipede-bitten" : "ceiling-spiked";
    return loseHp(state, status, "timeout", { hazard });
  }

  function advanceRound(state) {
    if (!state || state.gameOver) return state;
    state.round += 1;
    if (state.floorDepth <= 0) state.floorDepth = 1;
    state.playerColumn = Math.max(0, Math.min(state.platformCount - 1, state.playerColumn || 0));
    state.playerStatus = "standing";
    state.awaitingNextLayer = false;
    state.collapsedColumn = -1;
    if (!state.risingLayer) state.risingColumn = -1;
    state.wrongRisingColumn = -1;
    state.wrongRisingLayer = null;
    state.correctFloatColumn = -1;
    state.wrongCarrierColumns = [];
    state.wrongColumns = [];
    state.activeHazard = "";
    state.revealedHanzi = "";
    state.currentQuestion = createQuestion(state);
    return state;
  }

  return {
    createElevatorEscapeState,
    answerQuestion,
    movePlayer,
    getPlayerWord,
    answerCurrentPlatform,
    expireQuestion,
    advanceRound
  };
});
