const SIZE = 10;

const Board = (() => {
  function create() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  }

  function canPlace(grid, cells, originRow, originCol) {
    for (const [dr, dc] of cells) {
      const r = originRow + dr;
      const c = originCol + dc;
      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
      if (grid[r][c]) return false;
    }
    return true;
  }

  function place(grid, cells, originRow, originCol, color) {
    for (const [dr, dc] of cells) {
      grid[originRow + dr][originCol + dc] = color;
    }
  }

  function findFullLines(grid) {
    const rows = [];
    const cols = [];
    for (let r = 0; r < SIZE; r++) {
      if (grid[r].every(cell => cell)) rows.push(r);
    }
    for (let c = 0; c < SIZE; c++) {
      if (grid.every(row => row[c])) cols.push(c);
    }
    return { rows, cols };
  }

  function clearLines(grid, rows, cols) {
    for (const r of rows) {
      for (let c = 0; c < SIZE; c++) grid[r][c] = null;
    }
    for (const c of cols) {
      for (let r = 0; r < SIZE; r++) grid[r][c] = null;
    }
  }

  function canPlaceAnywhere(grid, cells) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (canPlace(grid, cells, r, c)) return true;
      }
    }
    return false;
  }

  function anyPieceFits(grid, pieces) {
    return pieces.some(p => canPlaceAnywhere(grid, p.cells));
  }

  return { SIZE, create, canPlace, place, findFullLines, clearLines, canPlaceAnywhere, anyPieceFits };
})();
