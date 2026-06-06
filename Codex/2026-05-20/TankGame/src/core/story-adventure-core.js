(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziStoryAdventure = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const encounters = [
    {
      id: "wood_branch",
      hanzi: "木",
      title: "断桥前的树枝",
      scene: { id: "fallen_bridge", name: "断桥林地", className: "grove" },
      character: { id: "branch_child", name: "树枝少年", role: "递来第一根树枝的孩子", className: "branch-child" },
      ability: { id: "wooden_staff", name: "木棍" },
      scenery: "grove",
      successBeat: "树枝少年听见他认出了“木”，递来一根木棍，轻轻挑开挡路的藤蔓。",
      failBeat: "树枝少年摇摇头，他把“木”认错了，树枝没有回应，藤蔓抽回一道影子。"
    },
    {
      id: "forest_gate",
      hanzi: "林",
      title: "会长出来的林门",
      scene: { id: "living_forest", name: "会生长的森林", className: "forest" },
      character: { id: "forest_guardian", name: "林门守卫", role: "召出整片森林的守卫", className: "forest-guardian" },
      ability: { id: "forest_call", name: "唤林" },
      scenery: "forest",
      successBeat: "林门守卫点亮两棵树，他读出“林”，小树变成一片森林，替他挡住身后的追兵。",
      failBeat: "林门守卫沉默了，他没能叫醒“林”，树林只沙沙作响，迷雾靠近了一步。"
    },
    {
      id: "ember_cave",
      hanzi: "火",
      title: "山洞里的火种",
      scene: { id: "ember_cavern", name: "火种山洞", className: "embers" },
      character: { id: "ember_sprite", name: "火种精灵", role: "照亮黑洞的小精灵", className: "ember-sprite" },
      ability: { id: "ember", name: "火种" },
      scenery: "embers",
      successBeat: "火种精灵落在他的掌心。他认出“火”，小小火种照亮了黑洞里的路。",
      failBeat: "火种精灵缩回石缝，他错过了“火”的读法，山洞暗下来，脚边滚过烫烫的石子。"
    },
    {
      id: "river_word",
      hanzi: "水",
      title: "会说话的小河",
      scene: { id: "talking_river", name: "会说话的小河", className: "river" },
      character: { id: "river_spirit", name: "河灵", role: "把水面变成台阶的朋友", className: "river-spirit" },
      ability: { id: "water_step", name: "踏水" },
      scenery: "river",
      successBeat: "河灵从水面探出头。他读对“水”，河面浮起一串亮石，像台阶一样托着他过河。",
      failBeat: "河灵叹了口气，他把“水”听错了，河水卷起浪花，把他的背包打湿。"
    },
    {
      id: "mountain_path",
      hanzi: "山",
      title: "抬头看见的山路",
      scene: { id: "cloud_mountain", name: "云边山路", className: "mountain" },
      character: { id: "mountain_elder", name: "山路老人", role: "知道云上路的人", className: "mountain-elder" },
      ability: { id: "climb", name: "攀山" },
      scenery: "mountain",
      successBeat: "山路老人把拐杖点在石壁上。他念出“山”，一个个落脚点通向云边。",
      failBeat: "山路老人扶住他。他没认出“山”，山风把他推回原地，膝盖磕出一小块青。"
    },
    {
      id: "minecart_home",
      hanzi: "车",
      title: "回家的矿车",
      scene: { id: "lantern_rail", name: "灯下铁轨", className: "rail" },
      character: { id: "cart_maker", name: "矿车匠", role: "把能力装进矿车的人", className: "cart-maker" },
      ability: { id: "minecart", name: "矿车" },
      scenery: "rail",
      successBeat: "矿车匠敲了敲铁轨。他认出“车”，木棍和火种拼成小矿车，载着整段冒险回到灯光里。",
      failBeat: "矿车匠停下锤子。他没看懂“车”，铁轨响了一声，矿车从眼前滑走。"
    }
  ];

  function indexWords(words = []) {
    return words.reduce((map, word) => {
      if (word && word.hanzi) map[word.hanzi] = word;
      return map;
    }, {});
  }

  function createStoryAdventureState(words = []) {
    return {
      hp: 3,
      position: 0,
      completed: false,
      defeated: false,
      abilities: [],
      scenery: [],
      generatedScenes: [],
      generatedCharacters: [],
      storyBeats: ["小勇者从一页空白故事里醒来，前方每一个汉字都像一扇门。"],
      adventureStory: "",
      words: indexWords(words)
    };
  }

  function normalizeAnswer(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getEncounterWord(state, encounter) {
    return state.words[encounter.hanzi] || { hanzi: encounter.hanzi, meaning: encounter.hanzi, phrases: [encounter.hanzi] };
  }

  function getCurrentEncounter(state) {
    if (!state || state.completed || state.defeated) return null;
    const encounter = encounters[state.position];
    if (!encounter) return null;
    return { ...encounter, word: getEncounterWord(state, encounter) };
  }

  function buildAdventureStory(state) {
    const ending = state.completed
      ? "最后，他把一路得到的能力串成一条光路，发现自己读过的每个字都在保护他。"
      : "最后，他停在还没读懂的字前。虽然这次被打败了，但故事把线索留下，等他下次回来继续冒险。";
    return [`冒险故事：`, ...state.storyBeats, ending].join("\n");
  }

  function answerEncounter(state, selectedMeaning) {
    const encounter = getCurrentEncounter(state);
    if (!encounter) return { correct: false, completed: state?.completed === true, defeated: state?.defeated === true, encounter: null };
    const correct = normalizeAnswer(selectedMeaning) === normalizeAnswer(encounter.word.meaning);
    if (!correct) {
      state.hp = Math.max(0, state.hp - 1);
      state.storyBeats.push(encounter.failBeat);
      if (state.hp <= 0) {
        state.defeated = true;
        state.adventureStory = buildAdventureStory(state);
      }
      return { correct: false, defeated: state.defeated, encounter };
    }

    if (!state.abilities.includes(encounter.ability.id)) state.abilities.push(encounter.ability.id);
    if (encounter.scenery && !state.scenery.includes(encounter.scenery)) state.scenery.push(encounter.scenery);
    if (encounter.scene?.id && !state.generatedScenes.includes(encounter.scene.id)) state.generatedScenes.push(encounter.scene.id);
    if (encounter.character?.id && !state.generatedCharacters.includes(encounter.character.id)) state.generatedCharacters.push(encounter.character.id);
    state.storyBeats.push(encounter.successBeat);
    state.position += 1;
    if (state.position >= encounters.length) {
      state.completed = true;
      state.adventureStory = buildAdventureStory(state);
    }
    return { correct: true, completed: state.completed, encounter, ability: encounter.ability, scene: encounter.scene, character: encounter.character };
  }

  return {
    createStoryAdventureState,
    getCurrentEncounter,
    answerEncounter,
    buildAdventureStory,
    encounters
  };
});
