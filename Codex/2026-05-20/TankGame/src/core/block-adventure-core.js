(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziBlockAdventure = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const taskDefinitions = [
    {
      id: "chop_tree",
      title: "砍树",
      action: "Chop Tree",
      hanzi: "木",
      icon: "tree",
      reward: { wood: 1 },
      message: "砍下一棵树，获得 1 个木头。"
    },
    {
      id: "mine_stone",
      title: "挖石头",
      action: "Mine Stone",
      hanzi: "石",
      icon: "stone",
      reward: { stone: 1 },
      message: "挖到石头，获得 1 块石材。"
    },
    {
      id: "mine_gold",
      title: "挖金矿",
      action: "Mine Gold",
      hanzi: "金",
      icon: "ore",
      reward: { gold: 1 },
      message: "敲开金矿，获得 1 块金矿。"
    },
    {
      id: "fight_zombie",
      title: "打僵尸",
      action: "Fight Zombie",
      hanzi: "人",
      icon: "zombie",
      reward: { safety: 1 },
      message: "击退僵尸，村庄安全值 +1。"
    },
    {
      id: "explore_cave",
      title: "探索山洞",
      action: "Explore Cave",
      hanzi: "山",
      icon: "cave",
      discovery: "cave",
      message: "发现山洞入口，里面藏着更多矿道。"
    },
    {
      id: "craft_table",
      title: "做工作台",
      action: "Craft Table",
      hanzi: "木",
      icon: "table",
      cost: { wood: 1, stone: 1 },
      structure: "craftingTable",
      message: "工作台做好了，可以建更大的东西。"
    },
    {
      id: "build_house",
      title: "建房子",
      action: "Build House",
      hanzi: "家",
      icon: "house",
      cost: { wood: 1, stone: 1, gold: 1 },
      structure: "house",
      message: "小房子建好了，探险有了基地。"
    },
    {
      id: "build_minecart",
      title: "做矿车",
      action: "Build Minecart",
      hanzi: "车",
      icon: "cart",
      cost: { wood: 1, gold: 1 },
      structure: "minecart",
      message: "矿车开动，MVP 探险完成！"
    }
  ];

  const directionVectors = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  const defaultObjects = [
    { id: "tree-1", kind: "tree", x: 2, y: 2, taskId: "chop_tree", blocking: true },
    { id: "tree-2", kind: "tree", x: 5, y: 1, taskId: "chop_tree", blocking: true },
    { id: "tree-3", kind: "tree", x: 6, y: 4, taskId: "chop_tree", blocking: true },
    { id: "stone-1", kind: "stone", x: 3, y: 3, taskId: "mine_stone", blocking: true },
    { id: "ore-1", kind: "ore", x: 6, y: 2, taskId: "mine_gold", blocking: true },
    { id: "zombie-1", kind: "zombie", x: 4, y: 1, taskId: "fight_zombie", blocking: true },
    { id: "cave-1", kind: "cave", x: 1, y: 1, taskId: "explore_cave", blocking: true },
    { id: "table-1", kind: "table", x: 3, y: 4, taskId: "craft_table", blocking: true },
    { id: "house-1", kind: "house", x: 5, y: 4, taskId: "build_house", blocking: true },
    { id: "cart-1", kind: "cart", x: 6, y: 5, taskId: "build_minecart", blocking: true }
  ];

  function indexWords(words = []) {
    return words.reduce((map, word) => {
      if (word && word.hanzi) map[word.hanzi] = word;
      return map;
    }, {});
  }

  function createBlockAdventureState(words = []) {
    return {
      hearts: 3,
      score: 0,
      completed: false,
      map: { width: 8, height: 6 },
      player: { x: 1, y: 3, facing: "right" },
      objects: defaultObjects.map((object) => ({ ...object })),
      resources: { wood: 0, stone: 0, gold: 0 },
      structures: { craftingTable: false, house: false, minecart: false },
      discoveries: { cave: false },
      safety: 0,
      taskIndex: 0,
      words: indexWords(words),
      log: ["醒来啦！先砍树、挖矿，再建房子和矿车。"]
    };
  }

  function canAfford(resources, cost = {}) {
    return Object.entries(cost).every(([key, amount]) => (resources[key] || 0) >= amount);
  }

  function spendResources(resources, cost = {}) {
    Object.entries(cost).forEach(([key, amount]) => {
      resources[key] = Math.max(0, (resources[key] || 0) - amount);
    });
  }

  function addReward(state, reward = {}) {
    Object.entries(reward).forEach(([key, amount]) => {
      if (key === "safety") {
        state.safety += amount;
      } else {
        state.resources[key] = (state.resources[key] || 0) + amount;
      }
    });
  }

  function isInsideMap(state, x, y) {
    return Boolean(state && state.map && x >= 0 && y >= 0 && x < state.map.width && y < state.map.height);
  }

  function getObjectAt(state, x, y) {
    return state?.objects?.find((object) => object.x === x && object.y === y) || null;
  }

  function getCell(state, x, y) {
    if (!isInsideMap(state, x, y)) return null;
    return {
      x,
      y,
      terrain: y <= 1 ? "forest" : y >= state.map.height - 1 ? "path" : "grass",
      object: getObjectAt(state, x, y)
    };
  }

  function getFacingPosition(state) {
    const vector = directionVectors[state?.player?.facing] || directionVectors.right;
    return { x: state.player.x + vector.x, y: state.player.y + vector.y };
  }

  function movePlayer(state, direction) {
    if (!state || !state.player) return { moved: false, reason: "missing-state" };
    const vector = directionVectors[direction];
    if (!vector) return { moved: false, reason: "bad-direction" };
    state.player.facing = direction;
    const nextX = state.player.x + vector.x;
    const nextY = state.player.y + vector.y;
    if (!isInsideMap(state, nextX, nextY)) return { moved: false, blockedBy: "edge" };
    const object = getObjectAt(state, nextX, nextY);
    if (object?.blocking) return { moved: false, blockedBy: object.kind, target: object };
    state.player.x = nextX;
    state.player.y = nextY;
    return { moved: true, x: nextX, y: nextY };
  }

  function getTaskById(taskId) {
    return taskDefinitions.find((task) => task.id === taskId) || null;
  }

  function getInteractionPrompt(state) {
    if (!state || state.completed || state.hearts <= 0) return null;
    const facing = getFacingPosition(state);
    const target = getObjectAt(state, facing.x, facing.y);
    if (!target) return null;
    const task = getTaskById(target.taskId);
    if (!task) return null;
    const word = state.words[task.hanzi] || { hanzi: task.hanzi, meaning: task.hanzi, phrases: [task.hanzi] };
    return { task: { ...task, word }, target };
  }

  function removeObject(state, objectId) {
    const index = state.objects.findIndex((object) => object.id === objectId);
    if (index < 0) return null;
    const [removed] = state.objects.splice(index, 1);
    return removed;
  }

  function findNextTaskIndex(state) {
    if (!state.structures.craftingTable) {
      if (state.resources.wood < 1) return 0;
      if (state.resources.stone < 1) return 1;
      if (state.resources.gold < 1) return 2;
      if (state.safety < 1) return 3;
      if (!state.discoveries.cave) return 4;
      return 5;
    }
    if (!state.structures.house) {
      if (canAfford(state.resources, { wood: 1, stone: 1, gold: 1 })) return 6;
      if (state.resources.wood < 1) return 0;
      if (state.resources.stone < 1) return 1;
      if (state.resources.gold < 1) return 2;
    }
    if (!state.structures.minecart) {
      if (canAfford(state.resources, { wood: 1, gold: 1 })) return 7;
      if (state.resources.wood < 1) return 0;
      return 2;
    }
    return -1;
  }

  function getCurrentTask(state) {
    if (!state || state.completed || state.hearts <= 0) return null;
    const taskIndex = findNextTaskIndex(state);
    if (taskIndex < 0) return null;
    state.taskIndex = taskIndex;
    const task = taskDefinitions[taskIndex];
    const word = state.words[task.hanzi] || { hanzi: task.hanzi, meaning: task.hanzi, phrases: [task.hanzi] };
    return { ...task, word };
  }

  function normalizeAnswer(value) {
    return String(value || "").trim().toLowerCase();
  }

  function answerCurrentTask(state, selectedMeaning) {
    const task = getCurrentTask(state);
    if (!task) return { correct: false, completed: state?.completed === true, task: null };
    const correct = normalizeAnswer(selectedMeaning) === normalizeAnswer(task.word.meaning);
    if (!correct) {
      state.hearts = Math.max(0, state.hearts - 1);
      state.log.unshift(`答错了：${task.word.hanzi} 不是 ${selectedMeaning || "空答案"}。`);
      return { correct: false, completed: false, task };
    }

    if (task.cost) spendResources(state.resources, task.cost);
    addReward(state, task.reward);
    if (task.structure) state.structures[task.structure] = true;
    if (task.discovery) state.discoveries[task.discovery] = true;
    state.score += task.structure ? 25 : 10;
    state.log.unshift(task.message);
    state.completed = Boolean(state.structures.craftingTable && state.structures.house && state.structures.minecart);
    return { correct: true, completed: state.completed, task };
  }

  function answerInteraction(state, selectedMeaning) {
    const prompt = getInteractionPrompt(state);
    if (!prompt) return { correct: false, completed: state?.completed === true, task: null, target: null };
    const correct = normalizeAnswer(selectedMeaning) === normalizeAnswer(prompt.task.word.meaning);
    if (!correct) {
      state.hearts = Math.max(0, state.hearts - 1);
      state.log.unshift(`答错了：${prompt.task.word.hanzi} 不是 ${selectedMeaning || "空答案"}。`);
      return { correct: false, completed: false, task: prompt.task, target: prompt.target };
    }
    if (prompt.task.cost && !canAfford(state.resources, prompt.task.cost)) {
      state.log.unshift(`材料还不够，先继续采集。`);
      return { correct: false, completed: false, reason: "missing-resources", task: prompt.task, target: prompt.target };
    }
    if (prompt.task.cost) spendResources(state.resources, prompt.task.cost);
    addReward(state, prompt.task.reward);
    if (prompt.task.structure) state.structures[prompt.task.structure] = true;
    if (prompt.task.discovery) state.discoveries[prompt.task.discovery] = true;
    const removedObject = removeObject(state, prompt.target.id);
    state.score += prompt.task.structure ? 25 : 10;
    state.log.unshift(prompt.task.message);
    state.completed = Boolean(state.structures.craftingTable && state.structures.house && state.structures.minecart);
    return { correct: true, completed: state.completed, task: prompt.task, target: prompt.target, removedObject };
  }

  return {
    createBlockAdventureState,
    getCell,
    movePlayer,
    getInteractionPrompt,
    answerInteraction,
    getCurrentTask,
    answerCurrentTask,
    taskDefinitions
  };
});