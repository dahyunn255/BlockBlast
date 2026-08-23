const Storage = (() => {
  const KEYS = {
    BEST: 'blockblast.best',
    THEME: 'blockblast.theme',
    MUTED: 'blockblast.muted',
    UNLOCKED_LEVEL: 'blockblast.unlockedLevel',
  };

  const THEMES = ['theme-classic', 'theme-neon'];

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

  return {
    getBest, setBest, getTheme, setTheme, nextTheme, getMuted, setMuted,
    getUnlockedLevel, setUnlockedLevel, THEMES,
  };
})();
