(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankMastery = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const masteryGoal = 3000;
  const rankSize = 300;
  const rankTiers = [
    { name: "Recruit", zh: "新兵", min: 0 },
    { name: "Private", zh: "列兵", min: 300 },
    { name: "Corporal", zh: "下士", min: 600 },
    { name: "Sergeant", zh: "中士", min: 900 },
    { name: "Staff Sergeant", zh: "上士", min: 1200 },
    { name: "Second Lieutenant", zh: "少尉", min: 1500 },
    { name: "First Lieutenant", zh: "中尉", min: 1800 },
    { name: "Captain", zh: "上尉", min: 2100 },
    { name: "Major", zh: "少校", min: 2400 },
    { name: "Lieutenant Colonel", zh: "中校", min: 2700 },
    { name: "Colonel", zh: "上校", min: 3000 }
  ];

  function getRankForMastery(count) {
    const masteredCount = Number.isFinite(count) ? count : 0;
    return rankTiers.reduce((current, rank) => (masteredCount >= rank.min ? rank : current), rankTiers[0]);
  }

  function getNextRank(count) {
    const masteredCount = Number.isFinite(count) ? count : 0;
    return rankTiers.find((rank) => rank.min > masteredCount) || null;
  }

  function getMasteredEntries(correctBank) {
    const bank = correctBank && typeof correctBank === "object" ? correctBank : {};
    return Object.values(bank)
      .filter((entry) => entry && entry.hanzi)
      .sort((a, b) => (b.count || 0) - (a.count || 0) || a.hanzi.localeCompare(b.hanzi, "zh-Hans-CN"));
  }

  function countMasteredHanzi(correctBank) {
    return getMasteredEntries(correctBank).length;
  }

  return {
    masteryGoal,
    rankSize,
    rankTiers,
    getRankForMastery,
    getNextRank,
    getMasteredEntries,
    countMasteredHanzi
  };
});
