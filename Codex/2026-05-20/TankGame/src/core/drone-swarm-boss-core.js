(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankDroneSwarmBoss = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const droneSwarmBossLaneCount = 5;

  function selectUniqueDroneWords(words, count = droneSwarmBossLaneCount) {
    const picked = [];
    const seen = new Set();
    (Array.isArray(words) ? words : []).forEach((word) => {
      if (!word?.hanzi || seen.has(word.hanzi) || picked.length >= count) return;
      seen.add(word.hanzi);
      picked.push(word);
    });
    return picked;
  }

  function getDroneVariants(splitPhase = {}) {
    const variants = Array.isArray(splitPhase.droneVariants) ? splitPhase.droneVariants : [];
    return Array.from({ length: splitPhase.count || droneSwarmBossLaneCount }, (_, index) => variants[index] || {
      id: `droneSwarmBossDrone${index + 1}`,
      name: `Split Drone ${index + 1}`
    });
  }

  function createDroneEnemy(splitPhase, variant, index, enemyAttackInterval = 5) {
    const hp = Math.max(1, Number(splitPhase.droneHp || 1));
    return {
      id: variant.id || `droneSwarmBossDrone${index + 1}`,
      name: variant.name || `Split Drone ${index + 1}`,
      hp,
      maxHp: hp,
      damage: Math.max(1, Number(splitPhase.droneDamage || 1)),
      attackInterval: Math.max(3, Number(splitPhase.droneAttackInterval || splitPhase.attackInterval || enemyAttackInterval)),
      attackStyle: "droneSwarmLane",
      role: "boss-minion",
      variantIndex: index,
      asset: variant.asset || null
    };
  }

  function createDroneSwarmBossSplitLanes(options = {}) {
    const {
      words,
      splitPhase = {},
      enemyAttackInterval = 5
    } = options;
    const count = Math.max(1, Number(splitPhase.count || droneSwarmBossLaneCount));
    const laneWords = selectUniqueDroneWords(words, count);
    if (laneWords.length < count) {
      throw new Error(`Drone Swarm Boss needs ${count} unique Hanzi targets.`);
    }
    const variants = getDroneVariants({ ...splitPhase, count });
    const laneStates = Array.from({ length: count }, (_, index) => {
      const variant = variants[index];
      return {
        id: `drone-swarm-boss-lane-${index}`,
        active: true,
        droneBoss: true,
        droneVariant: variant.id || `droneSwarmBossDrone${index + 1}`,
        enemy: createDroneEnemy(splitPhase, variant, index, enemyAttackInterval),
        word: laneWords[index],
        progress: Math.max(0, index * 5),
        defeated: false,
        element: null,
        healthFill: null,
        hpText: null,
        attackLabel: null,
        tag: null,
        track: null
      };
    });
    return { laneStates, activeLaneIndex: 0 };
  }

  function isDroneLaneLive(lane) {
    return Boolean(lane?.active && lane.droneBoss && !lane.defeated && lane.enemy && lane.enemy.hp > 0);
  }

  function getLiveDroneLaneIndexes(laneStates) {
    return (Array.isArray(laneStates) ? laneStates : [])
      .map((lane, index) => isDroneLaneLive(lane) ? index : -1)
      .filter((index) => index >= 0);
  }

  function getNextLiveDroneLaneIndex(laneStates, currentIndex, delta) {
    const liveIndexes = getLiveDroneLaneIndexes(laneStates);
    if (liveIndexes.length === 0) return currentIndex;
    const currentPosition = liveIndexes.indexOf(currentIndex);
    const fallbackPosition = Math.max(0, liveIndexes.findIndex((index) => index > currentIndex));
    const basePosition = currentPosition >= 0 ? currentPosition : fallbackPosition;
    const nextPosition = Math.max(0, Math.min(liveIndexes.length - 1, basePosition + delta));
    return liveIndexes[nextPosition];
  }

  function areAllDroneSwarmBossLanesDefeated(laneStates) {
    const lanes = (Array.isArray(laneStates) ? laneStates : []).filter((lane) => lane?.active && lane.droneBoss);
    return lanes.length > 0 && lanes.every((lane) => lane.defeated || !lane.enemy || lane.enemy.hp <= 0);
  }

  function damageDroneSwarmBossLane(laneStates, activeLaneIndex, amount, applyDamageToDefender) {
    if (typeof applyDamageToDefender !== "function") {
      throw new Error("damageDroneSwarmBossLane requires applyDamageToDefender.");
    }
    const lanes = Array.isArray(laneStates) ? laneStates : [];
    const lane = lanes[activeLaneIndex];
    if (!isDroneLaneLive(lane)) {
      return {
        laneStates: lanes,
        lane,
        result: { absoluteBlocked: false, armorDamage: 0, hpDamage: 0, totalDamage: 0 },
        defeated: false,
        allDefeated: areAllDroneSwarmBossLanesDefeated(lanes)
      };
    }
    const { defender, result } = applyDamageToDefender(lane.enemy, amount);
    const updatedLane = {
      ...lane,
      enemy: defender,
      defeated: defender.hp <= 0,
      progress: defender.hp <= 0 ? 100 : Math.max(0, (lane.progress || 0) - 18)
    };
    const nextLaneStates = lanes.map((candidate, index) => index === activeLaneIndex ? updatedLane : candidate);
    return {
      laneStates: nextLaneStates,
      lane: updatedLane,
      result,
      defeated: updatedLane.defeated,
      allDefeated: areAllDroneSwarmBossLanesDefeated(nextLaneStates)
    };
  }

  function getDroneLaneAttackCountdown(lane) {
    if (!isDroneLaneLive(lane)) return 0;
    const interval = Math.max(3, Number(lane.enemy.attackInterval || 5) + 2);
    return Math.max(1, Math.ceil((100 - Math.max(0, Math.min(100, lane.progress || 0))) * interval / 100));
  }

  return {
    droneSwarmBossLaneCount,
    selectUniqueDroneWords,
    createDroneSwarmBossSplitLanes,
    isDroneLaneLive,
    getLiveDroneLaneIndexes,
    getNextLiveDroneLaneIndex,
    damageDroneSwarmBossLane,
    areAllDroneSwarmBossLanesDefeated,
    getDroneLaneAttackCountdown
  };
});
