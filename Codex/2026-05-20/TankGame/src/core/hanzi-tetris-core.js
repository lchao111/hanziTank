(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTetris = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const boardSize = { width: 10, height: 20 };
  const tetrominoes = {
    I: { color: "#38bdf8", rotations: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]]] },
    O: { color: "#facc15", rotations: [[[1, 0], [2, 0], [1, 1], [2, 1]]] },
    T: { color: "#a78bfa", rotations: [[[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [2, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [1, 2]]] },
    L: { color: "#fb923c", rotations: [[[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]]] },
    S: { color: "#22c55e", rotations: [[[1, 0], [2, 0], [0, 1], [1, 1]], [[1, 0], [1, 1], [2, 1], [2, 2]]] }
  };
  const pieceTypes = Object.keys(tetrominoes);

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
    for (let offset = 5; wrong.length < 3 && offset < allWords.length + 5; offset += 17) {
      const candidate = allWords[(start + offset) % allWords.length];
      if (candidate.hanzi !== word.hanzi && !wrong.some((item) => item.meaning === candidate.meaning)) wrong.push(candidate);
    }
    const options = [word, ...wrong];
    return options
      .map((option, index) => ({ option, sortKey: (word.hanzi.charCodeAt(0) + index * 7) % 11 }))
      .sort((left, right) => left.sortKey - right.sortKey)
      .map((entry) => entry.option);
  }

  function createPiece(type, options = {}) {
    const config = tetrominoes[type] || tetrominoes.T;
    return {
      type: tetrominoes[type] ? type : "T",
      rotation: 0,
      x: options.x ?? 3,
      y: options.y ?? 0,
      color: config.color,
      lockedControls: true,
      fastDrop: false
    };
  }

  function createQuestion(state) {
    const hanzi = pickFromSequence(state.wordSequence, state.wordIndex, Object.keys(state.words));
    state.wordIndex += 1;
    const word = state.words[hanzi] || Object.values(state.words)[0] || { hanzi: "木", meaning: "wood", phrases: ["木头"] };
    return { word, speechText: word.hanzi, options: createQuestionOptions(state, word), answered: false, correct: false };
  }

  function createHanziTetrisState(words = [], options = {}) {
    const state = {
      boardSize: { ...boardSize },
      lockedCells: [],
      score: 0,
      lines: 0,
      gameOver: false,
      words: indexWords(words),
      pieceSequence: options.pieceSequence || [],
      wordSequence: options.wordSequence || [],
      pieceIndex: 0,
      wordIndex: 0,
      currentPiece: null,
      currentQuestion: null,
      message: "答对汉字才能操控方块。"
    };
    spawnPiece(state);
    return state;
  }

  function spawnPiece(state) {
    const type = pickFromSequence(state.pieceSequence, state.pieceIndex, pieceTypes);
    state.pieceIndex += 1;
    state.currentPiece = createPiece(type);
    state.currentQuestion = createQuestion(state);
    if (collides(state, state.currentPiece)) state.gameOver = true;
    return state.currentPiece;
  }

  function getPieceCells(piece) {
    if (!piece) return [];
    const config = tetrominoes[piece.type] || tetrominoes.T;
    const shape = config.rotations[piece.rotation % config.rotations.length];
    return shape.map(([x, y]) => ({ x: piece.x + x, y: piece.y + y, color: piece.color }));
  }

  function collides(state, piece) {
    const locked = new Set(state.lockedCells.map((cell) => `${cell.x},${cell.y}`));
    return getPieceCells(piece).some((cell) => (
      cell.x < 0 || cell.x >= state.boardSize.width || cell.y >= state.boardSize.height || locked.has(`${cell.x},${cell.y}`)
    ));
  }

  function normalizeAnswer(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getWordPhrase(word) {
    return word?.phrase || (Array.isArray(word?.phrases) ? word.phrases[0] : "") || word?.hanzi || "";
  }

  function answerQuestion(state, selectedMeaning) {
    if (!state.currentPiece || !state.currentQuestion) return { correct: false };
    const correct = normalizeAnswer(selectedMeaning) === normalizeAnswer(state.currentQuestion.word.meaning);
    state.currentQuestion.answered = true;
    state.currentQuestion.correct = correct;
    const phrase = getWordPhrase(state.currentQuestion.word);
    if (correct) {
      state.currentPiece.lockedControls = false;
      state.currentPiece.fastDrop = false;
      state.message = `答对了！${state.currentQuestion.word.hanzi}，组词：${phrase}。现在可以移动和旋转方块。`;
    } else {
      state.currentPiece.lockedControls = true;
      state.currentPiece.fastDrop = true;
      state.message = "答错了！方块开始急速下坠。";
    }
    return { correct, word: state.currentQuestion.word, phrase, speechText: `${state.currentQuestion.word.hanzi}。${phrase}。` };
  }

  function tryUpdatePiece(state, nextPiece) {
    if (!state.currentPiece || state.currentPiece.lockedControls || state.gameOver) return false;
    if (collides(state, nextPiece)) return false;
    state.currentPiece = nextPiece;
    return true;
  }

  function movePiece(state, direction) {
    const delta = direction === "left" ? -1 : direction === "right" ? 1 : 0;
    const nextPiece = { ...state.currentPiece, x: state.currentPiece.x + delta };
    return { moved: tryUpdatePiece(state, nextPiece) };
  }

  function rotatePiece(state) {
    if (!state.currentPiece) return { rotated: false };
    const config = tetrominoes[state.currentPiece.type] || tetrominoes.T;
    const nextPiece = { ...state.currentPiece, rotation: (state.currentPiece.rotation + 1) % config.rotations.length };
    return { rotated: tryUpdatePiece(state, nextPiece) };
  }

  function clearLines(state) {
    const fullRows = [];
    for (let y = 0; y < state.boardSize.height; y += 1) {
      const count = state.lockedCells.filter((cell) => cell.y === y).length;
      if (count >= state.boardSize.width) fullRows.push(y);
    }
    if (fullRows.length === 0) return 0;
    state.lockedCells = state.lockedCells
      .filter((cell) => !fullRows.includes(cell.y))
      .map((cell) => ({ ...cell, y: cell.y + fullRows.filter((row) => row > cell.y).length }));
    state.lines += fullRows.length;
    state.score += fullRows.length * 100;
    return fullRows.length;
  }

  function lockPiece(state) {
    if (!state.currentPiece) return { locked: false, linesCleared: 0 };
    state.lockedCells.push(...getPieceCells(state.currentPiece));
    state.score += 10;
    const linesCleared = clearLines(state);
    state.currentPiece = null;
    state.currentQuestion = null;
    spawnPiece(state);
    return { locked: true, linesCleared };
  }

  function tick(state) {
    if (!state.currentPiece || state.gameOver) return { locked: false };
    if (state.currentPiece.fastDrop) return hardDrop(state);
    const nextPiece = { ...state.currentPiece, y: state.currentPiece.y + 1 };
    if (collides(state, nextPiece)) return lockPiece(state);
    state.currentPiece = nextPiece;
    return { locked: false };
  }

  function hardDrop(state) {
    if (!state.currentPiece || state.gameOver) return { locked: false, linesCleared: 0 };
    let nextPiece = { ...state.currentPiece, y: state.currentPiece.y + 1 };
    while (!collides(state, nextPiece)) {
      state.currentPiece = nextPiece;
      nextPiece = { ...state.currentPiece, y: state.currentPiece.y + 1 };
    }
    return lockPiece(state);
  }

  function getVisibleCells(state) {
    return [...state.lockedCells, ...getPieceCells(state.currentPiece)];
  }

  return {
    createHanziTetrisState,
    answerQuestion,
    movePiece,
    rotatePiece,
    tick,
    hardDrop,
    getPieceCells,
    getVisibleCells,
    tetrominoes
  };
});
