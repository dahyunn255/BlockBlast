const ACHIEVEMENTS_LIST = [
  { id: 'place10', title: 'นักวางบล็อกมือใหม่', desc: 'วางบล็อกครบ 10 ชิ้น', check: s => s.piecesPlaced >= 10 },
  { id: 'place200', title: 'นักวางบล็อกมือฉมัง', desc: 'วางบล็อกครบ 200 ชิ้น', check: s => s.piecesPlaced >= 200 },
  { id: 'clear1', title: 'ล้างแถวแรก', desc: 'ล้างแถวหรือคอลัมน์ครั้งแรก', check: s => s.linesCleared >= 1 },
  { id: 'clear50', title: 'นักล้างแถว', desc: 'ล้างแถว/คอลัมน์รวม 50 ครั้ง', check: s => s.linesCleared >= 50 },
  { id: 'combo3', title: 'คอมโบทรงพลัง', desc: 'ทำคอมโบต่อเนื่อง x3 — ปลดล็อกธีมใหม่!', check: s => s.bestCombo >= 3 },
  { id: 'score500', title: 'คะแนนทะลุ 500', desc: 'ทำคะแนน 500 ในโหมด Endless', check: s => s.bestScore >= 500 },
  { id: 'score1000', title: 'คะแนนทะลุ 1000', desc: 'ทำคะแนน 1000 ในโหมด Endless', check: s => s.bestScore >= 1000 },
  { id: 'level5', title: 'นักพิชิตด่าน', desc: 'ผ่านด่านที่ 5', check: s => s.unlockedLevel > 5 },
  { id: 'level10', title: 'จอมยุทธ์ 10 ด่าน', desc: 'ผ่านด่านที่ 10', check: s => s.unlockedLevel > 10 },
  { id: 'dailyStreak3', title: 'นักสู้รายวัน', desc: 'ทำภารกิจประจำวันติดต่อกัน 3 วัน', check: s => s.dailyStreak >= 3 },
  { id: 'dailyStreak7', title: 'จอมขยันรายสัปดาห์', desc: 'ทำภารกิจประจำวันติดต่อกัน 7 วัน', check: s => s.dailyStreak >= 7 },
];

const THEME_UNLOCK_ACHIEVEMENT_ID = 'combo3';

const Achievements = (() => {
  function buildStatsSnapshot() {
    return {
      ...Storage.getStats(),
      bestScore: Storage.getBest(),
      unlockedLevel: Storage.getUnlockedLevel(),
      dailyStreak: Storage.getDailyStatus().streak,
    };
  }

  function checkNewUnlocks(overrides = {}) {
    const snapshot = { ...buildStatsSnapshot(), ...overrides };
    const newlyUnlocked = [];
    for (const a of ACHIEVEMENTS_LIST) {
      if (a.check(snapshot) && Storage.unlockAchievement(a.id)) {
        newlyUnlocked.push(a);
      }
    }
    return newlyUnlocked;
  }

  function list() {
    const unlocked = new Set(Storage.getUnlockedAchievements());
    return ACHIEVEMENTS_LIST.map(a => ({ ...a, unlocked: unlocked.has(a.id) }));
  }

  function hasThemeUnlock() {
    return Storage.getUnlockedAchievements().includes(THEME_UNLOCK_ACHIEVEMENT_ID);
  }

  return { checkNewUnlocks, list, hasThemeUnlock };
})();
