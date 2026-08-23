const Levels = (() => {
  const TOTAL = 20;

  function get(n) {
    const target = 300 + (n - 1) * 150;
    const moveLimit = Math.max(15, 30 - Math.floor((n - 1) / 2));
    return { number: n, target, moveLimit };
  }

  return { get, TOTAL };
})();
