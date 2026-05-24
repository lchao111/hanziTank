(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.HanziTankCombat = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function createEnemyForStage(stageNumber, levelTypes, bossTemplate) {
    const template = stageNumber % 5 === 0 ? bossTemplate : levelTypes[(stageNumber - 1) % levelTypes.length];
    const hpBonus = Math.floor((stageNumber - 1) / levelTypes.length);
    const isBoss = template.id === "boss";
    const hp = template.hp + (isBoss ? 0 : hpBonus);
    return {
      ...template,
      maxHp: hp,
      hp,
      damage: template.damage || 1,
      maxAbsoluteDefense: template.absoluteDefense || 0,
      absoluteDefense: template.absoluteDefense || 0,
      maxArmor: template.armor || 0,
      armor: template.armor || 0
    };
  }

  function applyDamageToDefender(defender, amount) {
    const next = { ...defender };
    if ((next.absoluteDefense || 0) > 0) {
      next.absoluteDefense -= 1;
      return {
        defender: next,
        result: { absoluteBlocked: true, armorDamage: 0, hpDamage: 0, totalDamage: 0 }
      };
    }

    const armorDamage = Math.min(next.armor || 0, amount);
    next.armor = Math.max(0, (next.armor || 0) - armorDamage);
    const remainingDamage = amount - armorDamage;
    const hpDamage = Math.min(next.hp ?? 0, remainingDamage);
    next.hp = Math.max(0, (next.hp ?? 0) - hpDamage);
    return {
      defender: next,
      result: { absoluteBlocked: false, armorDamage, hpDamage, totalDamage: armorDamage + hpDamage }
    };
  }

  function applyPlayerDamage(state, amount) {
    const currentAbsoluteDefense = Math.max(0, state.absoluteDefense || 0);
    const currentArmor = Math.max(0, state.armor || 0);
    const currentLives = Math.max(0, state.lives || 0);

    if (currentAbsoluteDefense > 0) {
      return {
        state: { ...state, absoluteDefense: currentAbsoluteDefense - 1, armor: currentArmor, lives: currentLives },
        result: { absoluteBlocked: true, armorDamage: 0, hpDamage: 0, totalDamage: 0 }
      };
    }

    const armorDamage = Math.min(currentArmor, amount);
    const nextArmor = Math.max(0, currentArmor - armorDamage);
    const hpDamage = Math.max(0, amount - armorDamage);
    const nextLives = Math.max(0, currentLives - hpDamage);
    return {
      state: { ...state, absoluteDefense: currentAbsoluteDefense, armor: nextArmor, lives: nextLives },
      result: { absoluteBlocked: false, armorDamage, hpDamage, totalDamage: armorDamage + hpDamage }
    };
  }

  function getShotDamage(baseDamage, ammo = null) {
    return baseDamage + (ammo?.damageBonus || 0);
  }

  return {
    createEnemyForStage,
    applyDamageToDefender,
    applyPlayerDamage,
    getShotDamage
  };
});
