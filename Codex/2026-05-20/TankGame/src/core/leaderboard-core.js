(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankLeaderboard = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  // Leaderboard types
  const LEADERBOARD_TYPES = [
    {
      key: "mostHanzi",
      zh: "认最多字",
      en: "Most Hanzi Mastered",
      tooltip: "认最多字 / Most Hanzi Mastered"
    },
    {
      key: "highestStage",
      zh: "最高关卡",
      en: "Highest Stage",
      tooltip: "最高关卡 / Highest Stage"
    },
    {
      key: "mostDeaths",
      zh: "死最多次",
      en: "Most Deaths",
      tooltip: "死最多次 / Most Deaths"
    },
    {
      key: "highestDamage",
      zh: "最高伤害",
      en: "Highest Damage",
      tooltip: "最高伤害 / Max Damage"
    }
  ];

  function extractLeaderboardStats(state) {
    // Defensive: tolerate missing fields
    const archive = Array.isArray(state?.warArchive) ? state.warArchive : [];
    return {
      mostHanzi: (state && state.correctBank) ? Object.keys(state.correctBank).length : 0,
      highestStage: archive.reduce((max, run) => Math.max(max, run.stage || 0), 0),
      mostDeaths: archive.reduce((sum, run) => sum + (Number.isFinite(Number(run.deaths)) ? Number(run.deaths) : 1), 0),
      highestDamage: archive.reduce((max, run) => {
        const topWordDamage = (run.topDamagingWords || []).reduce((sum, word) => sum + (Number(word.damage) || 0), 0);
        return Math.max(max, Number(run.damage ?? run.maxDamage ?? topWordDamage) || 0);
      }, 0)
    };
  }

  function getProfileLeaderboardRecords(profileId, profileName, state) {
    const stats = extractLeaderboardStats(state);
    return LEADERBOARD_TYPES.map(type => ({
      type: type.key,
      zh: type.zh,
      en: type.en,
      tooltip: type.tooltip,
      profileId,
      name: profileName,
      value: stats[type.key] || 0
    }));
  }

  return {
    LEADERBOARD_TYPES,
    extractLeaderboardStats,
    getProfileLeaderboardRecords
  };
});
