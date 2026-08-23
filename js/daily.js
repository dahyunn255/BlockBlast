const Daily = (() => {
  function dateId(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function todayId() {
    return dateId(new Date());
  }

  function yesterdayId() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dateId(d);
  }

  function hashSeed(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h >>> 0;
  }

  // Deterministic PRNG (mulberry32) so the same date always produces the same piece
  // sequence — every retry of today's challenge sees the same puzzle.
  function mulberry32(seed) {
    let a = seed;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeRng() {
    return mulberry32(hashSeed(todayId()));
  }

  function getChallenge() {
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((d - startOfYear) / 86400000);
    return {
      target: 400 + (dayOfYear % 5) * 100,
      moveLimit: 20 - (dayOfYear % 3) * 2,
    };
  }

  function isCompletedToday() {
    return Storage.getDailyStatus().lastCompletedDate === todayId();
  }

  function getStreak() {
    return Storage.getDailyStatus().streak;
  }

  function markCompleted() {
    const status = Storage.getDailyStatus();
    const today = todayId();
    if (status.lastCompletedDate === today) return status.streak;

    const newStreak = status.lastCompletedDate === yesterdayId() ? status.streak + 1 : 1;
    Storage.setDailyStatus({ lastCompletedDate: today, streak: newStreak });
    return newStreak;
  }

  return { todayId, makeRng, getChallenge, isCompletedToday, getStreak, markCompleted };
})();
