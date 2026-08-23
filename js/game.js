const Game = (() => {
  const dom = {};
  let grid, tray, score, best, combo;
  let cellEls = [];
  let previewCells = [];

  function cacheDom() {
    dom.board = document.getElementById('board');
    dom.tray = document.getElementById('tray');
    dom.score = document.getElementById('score');
    dom.best = document.getElementById('best');
    dom.comboPopup = document.getElementById('comboPopup');
    dom.overlay = document.getElementById('gameOverOverlay');
    dom.finalScore = document.getElementById('finalScore');
    dom.newBestBadge = document.getElementById('newBestBadge');
    dom.restartBtn = document.getElementById('restartBtn');
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
    dom.best.textContent = best;
  }

  function showComboPopup(text) {
    dom.comboPopup.textContent = text;
    dom.comboPopup.classList.remove('show');
    // Force reflow so the animation restarts even for back-to-back combos.
    void dom.comboPopup.offsetWidth;
    dom.comboPopup.classList.add('show');
  }

  function flashLineClear(rows, cols) {
    for (const r of rows) for (let c = 0; c < SIZE; c++) cellEls[r][c].classList.add('clearing');
    for (const c of cols) for (let r = 0; r < SIZE; r++) cellEls[r][c].classList.add('clearing');
  }

  function tryPlacePiece(piece, row, col) {
    if (!Board.canPlace(grid, piece.cells, row, col)) {
      AudioFx.invalid();
      return;
    }

    Board.place(grid, piece.cells, row, col, piece.color);
    score += piece.cells.length;
    tray = tray.filter(p => p.id !== piece.id);
    renderBoard();
    AudioFx.place();

    const { rows, cols } = Board.findFullLines(grid);
    const linesCleared = rows.length + cols.length;

    if (linesCleared > 0) {
      combo += 1;
      flashLineClear(rows, cols);
      let bonus = linesCleared * 10 * combo;
      if (linesCleared > 1) bonus += (linesCleared - 1) * 15;
      score += bonus;
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
      }, 260);
    } else {
      combo = 0;
      afterMoveResolved();
    }
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

    if (!Board.anyPieceFits(grid, tray)) {
      endGame();
    }
  }

  function endGame() {
    const isNewBest = score >= Storage.getBest();
    if (isNewBest) Storage.setBest(score);
    best = Storage.getBest();
    dom.finalScore.textContent = score;
    dom.newBestBadge.classList.toggle('hidden', !isNewBest);
    dom.overlay.classList.remove('hidden');
    updateScoreDom();
    AudioFx.gameOver();
  }

  function start() {
    grid = Board.create();
    tray = Pieces.randomTray(3);
    score = 0;
    combo = 0;
    best = Storage.getBest();
    dom.overlay.classList.add('hidden');
    buildBoardDom();
    renderBoard();
    renderTray();
    updateScoreDom();
  }

  function init() {
    cacheDom();
    dom.restartBtn.addEventListener('click', start);
    start();
  }

  return { init, restart: start };
})();
