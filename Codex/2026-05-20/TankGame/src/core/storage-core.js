(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankStorage = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function createDefaultState(todayKey) {
    return {
      coins: 0,
      dailyDate: todayKey,
      dailyScore: 0,
      review: {},
      correctBank: {},
      wrongBank: {},
      warArchive: [],
      runProgress: null,
      ammo: {},
      owned: ["tank_sherman"],
      equipped: {
        tank: "tank_sherman",
        shell: "",
        weapon: ""
      }
    };
  }

  function cloneDefaultState(defaultState) {
    return {
      ...defaultState,
      review: {},
      correctBank: {},
      wrongBank: {},
      warArchive: [],
      runProgress: null,
      ammo: {},
      owned: [...defaultState.owned],
      equipped: { ...defaultState.equipped }
    };
  }

  function normalizeProfileName(name = "") {
    return String(name).trim().replace(/\s+/g, " ").slice(0, 24);
  }

  function getProfileId(name) {
    return normalizeProfileName(name).toLowerCase();
  }

  function createSalt(now = Date.now, random = Math.random) {
    return `${now().toString(36)}${random().toString(36).slice(2, 10)}`;
  }

  function hashPassword(password, salt) {
    let hash = 2166136261;
    const text = `${salt}:${password}`;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function getStateKey(profileId = "") {
    return profileId ? `hanziTankState:${profileId}` : "hanziTankState";
  }

  function parseJsonObject(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function getProfiles(storage) {
    return parseJsonObject(storage.getItem("hanziTankProfiles"), {});
  }

  function saveProfiles(storage, profiles) {
    storage.setItem("hanziTankProfiles", JSON.stringify(profiles));
  }

  function mergeSavedState(saved, defaultState, todayKey) {
    const merged = {
      ...defaultState,
      ...(saved && typeof saved === "object" ? saved : {}),
      equipped: { ...defaultState.equipped, ...(saved?.equipped || {}) },
      review: saved?.review && typeof saved.review === "object" ? saved.review : {},
      correctBank: saved?.correctBank && typeof saved.correctBank === "object" ? saved.correctBank : {},
      wrongBank: saved?.wrongBank && typeof saved.wrongBank === "object" ? saved.wrongBank : {},
      warArchive: Array.isArray(saved?.warArchive) ? saved.warArchive : [],
      runProgress: saved?.runProgress && typeof saved.runProgress === "object" ? saved.runProgress : null,
      ammo: saved?.ammo && typeof saved.ammo === "object" ? saved.ammo : {},
      owned: Array.isArray(saved?.owned) ? saved.owned : [...defaultState.owned]
    };
    if (merged.dailyDate !== todayKey) {
      merged.dailyDate = todayKey;
      merged.dailyScore = 0;
    }
    if (!merged.owned.includes("tank_sherman")) {
      merged.owned.push("tank_sherman");
    }
    return merged;
  }

  function loadState(storage, profileId, defaultState, todayKey) {
    const saved = parseJsonObject(storage.getItem(getStateKey(profileId)), null);
    return mergeSavedState(saved, defaultState, todayKey);
  }

  function saveState(storage, profileId, state) {
    if (!profileId) return;
    storage.setItem(getStateKey(profileId), JSON.stringify(state));
  }

  return {
    createDefaultState,
    cloneDefaultState,
    normalizeProfileName,
    getProfileId,
    createSalt,
    hashPassword,
    getStateKey,
    getProfiles,
    saveProfiles,
    mergeSavedState,
    loadState,
    saveState
  };
});
