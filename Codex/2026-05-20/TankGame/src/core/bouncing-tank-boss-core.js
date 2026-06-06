(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankBouncingTankBoss = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function createBouncingTankBossState(options = {}) {
    const maxHp = Math.max(1, Number(options.maxHp || 10));
    const laneCount = Math.max(1, Number(options.laneCount || 3));
    return {
      hp: maxHp,
      maxHp,
      mode: "bouncing",
      dodgeCount: 0,
      dodgesUntilMalfunction: Math.max(1, Number(options.dodgesUntilMalfunction || 3)),
      laneIndex: Math.max(0, Math.min(laneCount - 1, Number.isFinite(Number(options.laneIndex)) ? Number(options.laneIndex) : Math.floor(laneCount / 2))),
      laneCount
    };
  }

  function normalizeState(state = {}) {
    const maxHp = Math.max(1, Number(state.maxHp || 10));
    const laneCount = Math.max(1, Number(state.laneCount || 3));
    return {
      hp: Math.max(0, Math.min(maxHp, Number(state.hp ?? maxHp))),
      maxHp,
      mode: state.mode === "malfunction" ? "malfunction" : state.mode === "destroyed" ? "destroyed" : "bouncing",
      dodgeCount: Math.max(0, Number(state.dodgeCount || 0)),
      dodgesUntilMalfunction: Math.max(1, Number(state.dodgesUntilMalfunction || 3)),
      laneIndex: Math.max(0, Math.min(laneCount - 1, Number.isFinite(Number(state.laneIndex)) ? Number(state.laneIndex) : Math.floor(laneCount / 2))),
      laneCount
    };
  }

  function getNextBouncingTankLaneIndex(state = {}) {
    const current = normalizeState(state);
    if (current.laneCount <= 1) return current.laneIndex;
    return (current.laneIndex + 1) % current.laneCount;
  }

  function getBouncingTankVisualState(state = {}) {
    const normalized = normalizeState(state);
    if (normalized.hp <= 0 || normalized.mode === "destroyed") return "destroyed";
    if (normalized.mode === "malfunction") return "malfunction";
    if (normalized.hp <= Math.ceil(normalized.maxHp / 2)) return "weak";
    return "bouncing";
  }

  function resolveBouncingTankAttack(state, options = {}) {
    const current = normalizeState(state);
    if (current.hp <= 0) {
      return {
        state: { ...current, mode: "destroyed" },
        result: { dodged: false, laneMiss: false, malfunctionStarted: false, vulnerabilityLost: false, hpDamage: 0, totalDamage: 0, laneIndex: current.laneIndex }
      };
    }

    if (!options.correct) {
      const vulnerabilityLost = current.mode === "malfunction";
      return {
        state: vulnerabilityLost ? { ...current, mode: "bouncing", dodgeCount: 0 } : current,
        result: { dodged: false, laneMiss: false, malfunctionStarted: false, vulnerabilityLost, hpDamage: 0, totalDamage: 0, laneIndex: current.laneIndex }
      };
    }

    if (Number.isInteger(options.playerLaneIndex) && options.playerLaneIndex !== current.laneIndex) {
      return {
        state: current,
        result: { dodged: false, laneMiss: true, malfunctionStarted: false, vulnerabilityLost: false, hpDamage: 0, totalDamage: 0, laneIndex: current.laneIndex }
      };
    }

    if (current.mode === "malfunction") {
      const hpDamage = Math.min(current.hp, Math.max(1, Number(options.damage || 1)));
      const nextHp = Math.max(0, current.hp - hpDamage);
      return {
        state: {
          ...current,
          hp: nextHp,
          mode: nextHp <= 0 ? "destroyed" : "malfunction"
        },
        result: { dodged: false, laneMiss: false, malfunctionStarted: false, vulnerabilityLost: false, hpDamage, totalDamage: hpDamage, laneIndex: current.laneIndex }
      };
    }

    const dodgeCount = current.dodgeCount + 1;
    const malfunctionStarted = dodgeCount >= current.dodgesUntilMalfunction;
    const previousLaneIndex = current.laneIndex;
    const laneIndex = getNextBouncingTankLaneIndex(current);
    return {
      state: {
        ...current,
        laneIndex,
        dodgeCount,
        mode: malfunctionStarted ? "malfunction" : "bouncing"
      },
      result: { dodged: true, laneMiss: false, previousLaneIndex, laneIndex, malfunctionStarted, vulnerabilityLost: false, hpDamage: 0, totalDamage: 0 }
    };
  }

  return {
    createBouncingTankBossState,
    getNextBouncingTankLaneIndex,
    resolveBouncingTankAttack,
    getBouncingTankVisualState
  };
});