// Each shape is a list of [row, col] offsets from the shape's own top-left origin.
const PIECE_SHAPES = [
  // single
  { cells: [[0, 0]], weight: 2 },

  // lines
  { cells: [[0, 0], [0, 1]], weight: 3 },
  { cells: [[0, 0], [1, 0]], weight: 3 },
  { cells: [[0, 0], [0, 1], [0, 2]], weight: 4 },
  { cells: [[0, 0], [1, 0], [2, 0]], weight: 4 },
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], weight: 3 },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], weight: 3 },
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], weight: 2 },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], weight: 2 },

  // squares
  { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], weight: 4 },
  { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], weight: 1 },

  // L / J shapes (all 4 rotations each)
  { cells: [[0, 0], [1, 0], [2, 0], [2, 1]], weight: 3 },
  { cells: [[0, 0], [0, 1], [1, 0], [2, 0]], weight: 3 },
  { cells: [[0, 0], [0, 1], [0, 2], [1, 0]], weight: 3 },
  { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], weight: 3 },
  { cells: [[0, 1], [1, 1], [2, 0], [2, 1]], weight: 3 },
  { cells: [[0, 0], [1, 0], [1, 1], [1, 2]], weight: 3 },

  // T shapes
  { cells: [[0, 0], [0, 1], [0, 2], [1, 1]], weight: 3 },
  { cells: [[0, 1], [1, 0], [1, 1], [2, 1]], weight: 3 },
  { cells: [[1, 0], [1, 1], [1, 2], [0, 1]], weight: 3 },
  { cells: [[0, 0], [1, 0], [1, 1], [2, 0]], weight: 3 },

  // S / Z shapes
  { cells: [[0, 1], [0, 2], [1, 0], [1, 1]], weight: 2 },
  { cells: [[0, 0], [0, 1], [1, 1], [1, 2]], weight: 2 },
  { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], weight: 2 },
  { cells: [[0, 1], [1, 0], [1, 1], [2, 0]], weight: 2 },

  // 2x3 / 3x2 blocks
  { cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1]], weight: 2 },
  { cells: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]], weight: 2 },

  // corner shapes
  { cells: [[0, 0], [0, 1], [1, 0]], weight: 3 },
  { cells: [[0, 0], [0, 1], [1, 1]], weight: 3 },
  { cells: [[0, 0], [1, 0], [1, 1]], weight: 3 },
  { cells: [[0, 1], [1, 0], [1, 1]], weight: 3 },
].filter(s => s.weight > 0);

const PIECE_COLORS = ['blue', 'green', 'orange', 'purple', 'red', 'teal', 'yellow', 'pink'];

const Pieces = (() => {
  function normalize(cells) {
    const minR = Math.min(...cells.map(c => c[0]));
    const minC = Math.min(...cells.map(c => c[1]));
    return cells.map(([r, c]) => [r - minR, c - minC]);
  }

  function weightedRandomShape(rng) {
    const total = PIECE_SHAPES.reduce((sum, s) => sum + s.weight, 0);
    let roll = rng() * total;
    for (const shape of PIECE_SHAPES) {
      roll -= shape.weight;
      if (roll <= 0) return shape;
    }
    return PIECE_SHAPES[PIECE_SHAPES.length - 1];
  }

  // rng: optional () => number in [0,1), defaults to Math.random. Pass a seeded rng
  // (see js/daily.js) to make a piece sequence reproducible, e.g. for the daily challenge.
  function randomPiece(rng = Math.random) {
    const shape = weightedRandomShape(rng);
    const color = PIECE_COLORS[Math.floor(rng() * PIECE_COLORS.length)];
    return {
      id: `p${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      cells: normalize(shape.cells),
      color,
    };
  }

  function randomTray(count = 3, rng = Math.random) {
    return Array.from({ length: count }, () => randomPiece(rng));
  }

  function dimensions(cells) {
    const rows = Math.max(...cells.map(c => c[0])) + 1;
    const cols = Math.max(...cells.map(c => c[1])) + 1;
    return { rows, cols };
  }

  return { randomPiece, randomTray, dimensions };
})();
