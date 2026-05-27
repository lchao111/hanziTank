(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankMastery = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const masteryGoal = 3000;
  const rankSize = 300;
  const rankTiers = [
    { name: "Recruit", zh: "新兵", min: 0, icon: "assets/sprites/ranks/recruit.png" },
    { name: "Private", zh: "列兵", min: 300, icon: "assets/sprites/ranks/private.png" },
    { name: "Corporal", zh: "下士", min: 600, icon: "assets/sprites/ranks/corporal.png" },
    { name: "Sergeant", zh: "中士", min: 900, icon: "assets/sprites/ranks/sergeant.png" },
    { name: "Staff Sergeant", zh: "上士", min: 1200, icon: "assets/sprites/ranks/staff-sergeant.png" },
    { name: "Second Lieutenant", zh: "少尉", min: 1500, icon: "assets/sprites/ranks/second-lieutenant.png" },
    { name: "First Lieutenant", zh: "中尉", min: 1800, icon: "assets/sprites/ranks/first-lieutenant.png" },
    { name: "Captain", zh: "上尉", min: 2100, icon: "assets/sprites/ranks/captain.png" },
    { name: "Major", zh: "少校", min: 2400, icon: "assets/sprites/ranks/major.png" },
    { name: "Lieutenant Colonel", zh: "中校", min: 2700, icon: "assets/sprites/ranks/lieutenant-colonel.png" },
    { name: "Colonel", zh: "上校", min: 3000, icon: "assets/sprites/ranks/colonel.png" }
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
