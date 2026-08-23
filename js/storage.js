const Storage = (() => {
  const KEYS = {
    BEST: 'blockblast.best',
    THEME: 'blockblast.theme',
    MUTED: 'blockblast.muted',
    UNLOCKED_LEVEL: 'blockblast.unlockedLevel',
    STATS: 'blockblast.stats',
    ACHIEVEMENTS: 'blockblast.achievements',
    DAILY: 'blockblast.daily',
    COINS: 'blockblast.coins',
    OWNED_ITEMS: 'blockblast.ownedItems',
    EQUIPPED: 'blockblast.equipped',
  };

  const THEMES = ['theme-classic', 'theme-neon', 'theme-sunset', 'theme-ocean', 'theme-forest'];

  function getBest() {
    return Number(localStorage.getItem(KEYS.BEST)) || 0;
  }

  function setBest(value) {
    localStorage.setItem(KEYS.BEST, String(value));
  }

  function getTheme() {
    const saved = localStorage.getItem(KEYS.THEME);
    return THEMES.includes(saved) ? saved : THEMES[0];
  }

  function setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
  }

  function nextTheme(current) {
    const i = THEMES.indexOf(current);
    return THEMES[(i + 1) % THEMES.length];
  }

  function getMuted() {
    return localStorage.getItem(KEYS.MUTED) === '1';
  }

  function setMuted(muted) {
    localStorage.setItem(KEYS.MUTED, muted ? '1' : '0');
  }

  function getUnlockedLevel() {
    return Number(localStorage.getItem(KEYS.UNLOCKED_LEVEL)) || 1;
  }

  function setUnlockedLevel(level) {
    if (level > getUnlockedLevel()) {
      localStorage.setItem(KEYS.UNLOCKED_LEVEL, String(level));
    }
  }

  function getStats() {
    try {
      return { piecesPlaced: 0, linesCleared: 0, bestCombo: 0, ...JSON.parse(localStorage.getItem(KEYS.STATS)) };
    } catch {
      return { piecesPlaced: 0, linesCleared: 0, bestCombo: 0 };
    }
  }

  function saveStats(stats) {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  }

  function bumpStat(key, amount) {
    const stats = getStats();
    stats[key] = (stats[key] || 0) + amount;
    saveStats(stats);
    return stats;
  }

  function setStatMax(key, value) {
    const stats = getStats();
    if (value > (stats[key] || 0)) {
      stats[key] = value;
      saveStats(stats);
    }
    return stats;
  }

  function getUnlockedAchievements() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.ACHIEVEMENTS)) || [];
    } catch {
      return [];
    }
  }

  function unlockAchievement(id) {
    const list = getUnlockedAchievements();
    if (list.includes(id)) return false;
    list.push(id);
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(list));
    return true;
  }

  function getDailyStatus() {
    try {
      return { lastCompletedDate: null, streak: 0, ...JSON.parse(localStorage.getItem(KEYS.DAILY)) };
    } catch {
      return { lastCompletedDate: null, streak: 0 };
    }
  }

  function setDailyStatus(status) {
    localStorage.setItem(KEYS.DAILY, JSON.stringify(status));
  }

  function getCoins() {
    return Number(localStorage.getItem(KEYS.COINS)) || 0;
  }

  function addCoins(amount) {
    const total = getCoins() + amount;
    localStorage.setItem(KEYS.COINS, String(total));
    return total;
  }

  function spendCoins(amount) {
    const current = getCoins();
    if (current < amount) return false;
    localStorage.setItem(KEYS.COINS, String(current - amount));
    return true;
  }

  function getOwnedItems() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.OWNED_ITEMS)) || [];
    } catch {
      return [];
    }
  }

  function ownItem(id) {
    const list = getOwnedItems();
    if (list.includes(id)) return false;
    list.push(id);
    localStorage.setItem(KEYS.OWNED_ITEMS, JSON.stringify(list));
    return true;
  }

  function getEquipped() {
    try {
      return { blockSkin: 'default', clearEffect: 'default', ...JSON.parse(localStorage.getItem(KEYS.EQUIPPED)) };
    } catch {
      return { blockSkin: 'default', clearEffect: 'default' };
    }
  }

  function setEquipped(category, id) {
    const equipped = getEquipped();
    equipped[category] = id;
    localStorage.setItem(KEYS.EQUIPPED, JSON.stringify(equipped));
  }

  return {
    getBest, setBest, getTheme, setTheme, nextTheme, getMuted, setMuted,
    getUnlockedLevel, setUnlockedLevel, THEMES,
    getStats, bumpStat, setStatMax, getUnlockedAchievements, unlockAchievement,
    getDailyStatus, setDailyStatus,
    getCoins, addCoins, spendCoins, getOwnedItems, ownItem, getEquipped, setEquipped,
  };
})();
