const Game = (() => {
  const REROLL_LIMIT = 3;
  const dom = {};
  let mode = 'endless'; // 'endless' | 'level'
  let grid, tray, score, best, combo;
  let levelNumber, levelTarget, movesLeft;
  let rerollsLeft;
  let cellEls = [];
  let previewCells = [];
  let onMenu = () => {};
  let resultPrimaryAction = null;

  function cacheDom() {
    dom.board = document.getElementById('board');
    dom.tray = document.getElementById('tray');
    dom.score = document.getElementById('score');
    dom.secondaryLabel = document.getElementById('secondaryLabel');
    dom.secondaryValue = document.getElementById('secondaryValue');
    dom.movesBox = document.getElementById('movesBox');
    dom.movesValue = document.getElementById('movesValue');
    dom.menuBtn = document.getElementById('menuBtn');
    dom.comboPopup = document.getElementById('comboPopup');
    dom.resultOverlay = document.getElementById('resultOverlay');
    dom.resultTitle = document.getElementById('resultTitle');
    dom.resultMessage = document.getElementById('resultMessage');
    dom.resultStat = document.getElementById('resultStat');
    dom.resultBadge = document.getElementById('resultBadge');
    dom.resultPrimaryBtn = document.getElementById('resultPrimaryBtn');
    dom.resultMenuBtn = document.getElementById('resultMenuBtn');
    dom.rerollBtn = document.getElementById('rerollBtn');
    dom.rerollCount = document.getElementById('rerollCount');
    dom.achievementToast = document.getElementById('achievementToast');
    dom.achievementToastTitle = document.getElementById('achievementToastTitle');
  }

  function buildBoardDom() {
    dom.board.innerHTML = '';
    cellEls = [];
    for (let r = 0; r < SIZE; r++) {
      const rowEls = [];
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        dom.board.appendChild(cell);
        rowEls.push(cell);
      }
      cellEls.push(rowEls);
    }
  }

  function renderBoard() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const color = grid[r][c];
        const el = cellEls[r][c];
        el.className = color ? `cell filled block-${color}` : 'cell';
      }
    }
  }

  function clearPreview() {
    for (const el of previewCells) {
      el.classList.remove('preview-valid', 'preview-invalid');
    }
    previewCells = [];
  }

  function showPreview(cells, row, col, valid) {
    clearPreview();
    for (const [dr, dc] of cells) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) continue;
      const el = cellEls[r][c];
      el.classList.add(valid ? 'preview-valid' : 'preview-invalid');
      previewCells.push(el);
    }
  }

  function buildPieceEl(piece) {
    const dims = Pieces.dimensions(piece.cells);
    const el = document.createElement('div');
    el.className = 'piece';
    el.style.setProperty('--piece-cols', dims.cols);
    el.style.setProperty('--piece-rows', dims.rows);
    for (const [dr, dc] of piece.cells) {
      const block = document.createElement('div');
      block.className = `block block-${piece.color}`;
      block.style.gridRowStart = dr + 1;
      block.style.gridColumnStart = dc + 1;
      el.appendChild(block);
    }
    return el;
  }

  function renderTray() {
    dom.tray.innerHTML = '';
    for (const piece of tray) {
      const el = buildPieceEl(piece);
      dom.tray.appendChild(el);
      if (!Board.canPlaceAnywhere(grid, piece.cells)) {
        el.classList.add('unplaceable');
      }
      DragController.attach(el, piece, {
        getBoardRect: () => dom.board.getBoundingClientRect(),
        onDragStart: () => el.classList.add('active-drag'),
        onDragMove: (p, row, col) => {
          const valid = Board.canPlace(grid, p.cells, row, col);
          showPreview(p.cells, row, col, valid);
        },
        onDrop: (p, row, col) => {
          el.classList.remove('active-drag');
          clearPreview();
          tryPlacePiece(p, row, col);
        },
        onDragCancel: () => {
          el.classList.remove('active-drag');
          clearPreview();
        },
      });
    }
  }

  function updateScoreDom() {
    dom.score.textContent = score;
    if (mode === 'level') {
      dom.secondaryLabel.textContent = 'GOAL';
      dom.secondaryValue.textContent = levelTarget;
      dom.movesValue.textContent = movesLeft;
    } else {
      dom.secondaryLabel.textContent = 'BEST';
      dom.secondaryValue.textContent = best;
    }
  }

  function showComboPopup(text) {
    dom.comboPopup.textContent = text;
    dom.comboPopup.classList.remove('show');
    // Force reflow so the animation restarts even for back-to-back combos.
    void dom.comboPopup.offsetWidth;
    dom.comboPopup.classList.add('show');
  }

  function spawnClearParticles(cellEl, color) {
    const rect = cellEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = `clear-particle block-${color}`;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.8;
      const dist = 20 + Math.random() * 20;
      p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
      p.style.left = `${cx - 4}px`;
      p.style.top = `${cy - 4}px`;
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  function flashLineClear(rows, cols) {
    const cellsToClear = new Set();
    for (const r of rows) for (let c = 0; c < SIZE; c++) cellsToClear.add(r * SIZE + c);
    for (const c of cols) for (let r = 0; r < SIZE; r++) cellsToClear.add(r * SIZE + c);
    for (const key of cellsToClear) {
      const r = Math.floor(key / SIZE);
      const c = key % SIZE;
      const el = cellEls[r][c];
      spawnClearParticles(el, grid[r][c]);
      el.classList.add('clearing');
    }
  }

  function tryPlacePiece(piece, row, col) {
    if (!Board.canPlace(grid, piece.cells, row, col)) {
      AudioFx.invalid();
      return;
    }

    Board.place(grid, piece.cells, row, col, piece.color);
    score += piece.cells.length;
    tray = tray.filter(p => p.id !== piece.id);
    if (mode === 'level') movesLeft = Math.max(0, movesLeft - 1);
    renderBoard();
    AudioFx.place();
    Storage.bumpStat('piecesPlaced', 1);

    const { rows, cols } = Board.findFullLines(grid);
    const linesCleared = rows.length + cols.length;

    if (linesCleared > 0) {
      combo += 1;
      flashLineClear(rows, cols);
      let bonus = linesCleared * 10 * combo;
      if (linesCleared > 1) bonus += (linesCleared - 1) * 15;
      score += bonus;
      Storage.bumpStat('linesCleared', linesCleared);
      Storage.setStatMax('bestCombo', combo);
      AudioFx.clearLines(linesCleared);
      if (combo > 1) {
        showComboPopup(`COMBO x${combo}  +${bonus}`);
        AudioFx.combo(combo);
      } else {
        showComboPopup(`+${bonus}`);
      }
      setTimeout(() => {
        Board.clearLines(grid, rows, cols);
        renderBoard();
        afterMoveResolved();
      }, 180);
    } else {
      combo = 0;
      afterMoveResolved();
    }
  }

  function updateRerollDom() {
    dom.rerollCount.textContent = rerollsLeft;
    dom.rerollBtn.disabled = rerollsLeft <= 0;
  }

  function checkBoardPlayable() {
    if (Board.anyPieceFits(grid, tray)) return true;
    if (mode === 'level') levelFailed(); else endGame();
    return false;
  }

  function reroll() {
    if (rerollsLeft <= 0) return;
    rerollsLeft -= 1;
    updateRerollDom();
    tray = Pieces.randomTray(3);
    renderTray();
    AudioFx.reroll();
    dom.tray.classList.remove('rerolling');
    void dom.tray.offsetWidth;
    dom.tray.classList.add('rerolling');
    checkBoardPlayable();
  }

  function showAchievementToast(achievement) {
    dom.achievementToastTitle.textContent = achievement.title;
    dom.achievementToast.classList.remove('show');
    void dom.achievementToast.offsetWidth;
    dom.achievementToast.classList.add('show');
    AudioFx.achievement();
  }

  function checkAchievements() {
    const newlyUnlocked = Achievements.checkNewUnlocks({ bestScore: Math.max(Storage.getBest(), best) });
    newlyUnlocked.forEach((a, i) => setTimeout(() => showAchievementToast(a), i * 1800));
  }

  function afterMoveResolved() {
    if (tray.length === 0) {
      tray = Pieces.randomTray(3);
    }

    if (score > best) {
      best = score;
    }
    updateScoreDom();
    renderTray();
    checkAchievements();

    if (mode === 'level') {
      if (score >= levelTarget) {
        levelComplete();
        return;
      }
      if (movesLeft <= 0) {
        levelFailed();
        return;
      }
    }
    checkBoardPlayable();
  }

  function showResult({ title, message, stat, showBadge, badgeText, primaryLabel, primaryAction }) {
    dom.resultTitle.textContent = title;
    dom.resultMessage.textContent = message;
    dom.resultStat.textContent = stat;
    dom.resultBadge.textContent = badgeText || '';
    dom.resultBadge.classList.toggle('hidden', !showBadge);
    dom.resultPrimaryBtn.textContent = primaryLabel;
    resultPrimaryAction = primaryAction;
    dom.resultOverlay.classList.remove('hidden');
  }

  function endGame() {
    const isNewBest = score >= Storage.getBest();
    if (isNewBest) Storage.setBest(score);
    best = Storage.getBest();
    updateScoreDom();
    AudioFx.gameOver();
    showResult({
      title: 'Game Over',
      message: 'คะแนนของคุณ',
      stat: score,
      showBadge: isNewBest,
      badgeText: '🏆 สถิติใหม่!',
      primaryLabel: 'เล่นอีกครั้ง',
      primaryAction: () => start('endless'),
    });
  }

  function levelComplete() {
    Storage.setUnlockedLevel(levelNumber + 1);
    AudioFx.levelComplete();
    const hasNext = levelNumber < Levels.TOTAL;
    showResult({
      title: 'ผ่านด่าน! ⭐',
      message: `ด่านที่ ${levelNumber}`,
      stat: score,
      showBadge: false,
      primaryLabel: hasNext ? 'ด่านต่อไป' : 'เล่นอีกครั้ง',
      primaryAction: () => start('level', { level: hasNext ? levelNumber + 1 : levelNumber }),
    });
  }

  function levelFailed() {
    AudioFx.gameOver();
    showResult({
      title: 'ไม่ผ่านด่าน',
      message: `เป้าหมาย ${levelTarget} คะแนน`,
      stat: score,
      showBadge: false,
      primaryLabel: 'ลองใหม่',
      primaryAction: () => start('level', { level: levelNumber }),
    });
  }

  function start(newMode, opts = {}) {
    mode = newMode;
    grid = Board.create();
    tray = Pieces.randomTray(3);
    score = 0;
    combo = 0;
    best = Storage.getBest();

    if (mode === 'level') {
      levelNumber = opts.level;
      const lvl = Levels.get(levelNumber);
      levelTarget = lvl.target;
      movesLeft = lvl.moveLimit;
      dom.movesBox.classList.remove('hidden');
    } else {
      dom.movesBox.classList.add('hidden');
    }

    rerollsLeft = REROLL_LIMIT;
    updateRerollDom();

    dom.resultOverlay.classList.add('hidden');
    buildBoardDom();
    renderBoard();
    renderTray();
    updateScoreDom();
  }

  function init(handlers = {}) {
    cacheDom();
    onMenu = handlers.onMenu || (() => {});
    dom.resultPrimaryBtn.addEventListener('click', () => {
      dom.resultOverlay.classList.add('hidden');
      if (resultPrimaryAction) resultPrimaryAction();
    });
    dom.resultMenuBtn.addEventListener('click', () => {
      dom.resultOverlay.classList.add('hidden');
      onMenu();
    });
    dom.menuBtn.addEventListener('click', onMenu);
    dom.rerollBtn.addEventListener('click', reroll);
  }

  return {
    init,
    startEndless: () => start('endless'),
    startLevel: (n) => start('level', { level: n }),
  };
})();
