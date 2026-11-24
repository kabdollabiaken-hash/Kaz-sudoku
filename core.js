/* Sudoku core: seeded generator (unique solution), solver, helpers. Works in browser and Node. */
(function (root) {
  'use strict';

  /* Board sizes: 4x4 (2x2 boxes), 6x6 (2 rows x 3 cols boxes), 9x9 (3x3 boxes). */
  var SIZES = { 4: { br: 2, bc: 2 }, 6: { br: 2, bc: 3 }, 9: { br: 3, bc: 3 } };
  var DIFF = { easy: { n: 4, clues: [7, 9] }, medium: { n: 6, clues: [14, 17] }, hard: { n: 9, clues: [26, 30] } };
  var GEO = {};
  function geom(n) {
    if (GEO[n]) return GEO[n];
    var s = SIZES[n], ROW = [], COL = [], BOX = [];
    for (var i = 0; i < n * n; i++) {
      ROW[i] = (i / n) | 0; COL[i] = i % n;
      BOX[i] = ((ROW[i] / s.br) | 0) * (n / s.bc) + ((COL[i] / s.bc) | 0);
    }
    return (GEO[n] = { n: n, br: s.br, bc: s.bc, ROW: ROW, COL: COL, BOX: BOX });
  }
  var POP = new Uint8Array(512);
  for (var m = 1; m < 512; m++) POP[m] = POP[m >> 1] + (m & 1);

  function hashSeed(str) {
    var h = 2166136261;
    for (var k = 0; k < str.length; k++) {
      h ^= str.charCodeAt(k);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rand) {
    for (var j = arr.length - 1; j > 0; j--) {
      var r = Math.floor(rand() * (j + 1));
      var tmp = arr[j]; arr[j] = arr[r]; arr[r] = tmp;
    }
    return arr;
  }

  /* Backtracking solver with MRV. opts: {limit, rand}. Returns {count, solution}. */
  function solve(grid, opts) {
    opts = opts || {};
    var limit = opts.limit || 1;
    var rand = opts.rand || null;
    var n = opts.n || Math.round(Math.sqrt(grid.length));
    var N = n * n, FULL = (1 << n) - 1, Gm = geom(n), ROW = Gm.ROW, COL = Gm.COL, BOX = Gm.BOX;
    var g = new Int8Array(N);
    var rows = new Int16Array(n), cols = new Int16Array(n), boxes = new Int16Array(n);
    for (var i = 0; i < N; i++) {
      var v = grid[i] | 0;
      g[i] = v;
      if (v) {
        var bit = 1 << (v - 1);
        if ((rows[ROW[i]] & bit) || (cols[COL[i]] & bit) || (boxes[BOX[i]] & bit)) {
          return { count: 0, solution: null };
        }
        rows[ROW[i]] |= bit; cols[COL[i]] |= bit; boxes[BOX[i]] |= bit;
      }
    }
    var count = 0, first = null;

    function rec() {
      var best = -1, bm = 0, bn = 99;
      for (var i = 0; i < N; i++) {
        if (g[i]) continue;
        var mask = ~(rows[ROW[i]] | cols[COL[i]] | boxes[BOX[i]]) & FULL;
        var k = POP[mask];
        if (k < bn) { bn = k; best = i; bm = mask; if (k <= 1) break; }
      }
      if (best < 0) {
        count++;
        if (!first) first = Array.prototype.slice.call(g);
        return count >= limit;
      }
      if (bn === 0) return false;
      var digits = [];
      for (var d = 0; d < n; d++) if ((bm >> d) & 1) digits.push(d);
      if (rand) shuffle(digits, rand);
      for (var t = 0; t < digits.length; t++) {
        var dd = digits[t], b = 1 << dd;
        g[best] = dd + 1;
        rows[ROW[best]] |= b; cols[COL[best]] |= b; boxes[BOX[best]] |= b;
        if (rec()) return true;
        g[best] = 0;
        rows[ROW[best]] &= ~b; cols[COL[best]] &= ~b; boxes[BOX[best]] &= ~b;
      }
      return false;
    }
    rec();
    return { count: count, solution: first };
  }

  /* Deterministic: same seed + difficulty => same puzzle on every device. */
  function generate(seedStr, diff) {
    if (!DIFF[diff]) diff = 'medium';
    var cfg = DIFF[diff], n = cfg.n, N = n * n;
    var rand = mulberry32(hashSeed(String(seedStr) + '|' + diff));
    var empty = new Array(N).fill(0);
    var full = solve(empty, { limit: 1, rand: rand, n: n }).solution;
    var range = cfg.clues;
    var target = range[0] + Math.floor(rand() * (range[1] - range[0] + 1));
    var puzzle = full.slice();
    var order = [];
    for (var i = 0; i < N; i++) order.push(i);
    shuffle(order, rand);
    var clues = N;
    for (var k = 0; k < order.length && clues > target; k++) {
      var idx = order[k], v = puzzle[idx];
      puzzle[idx] = 0;
      if (solve(puzzle, { limit: 2, n: n }).count !== 1) puzzle[idx] = v; else clues--;
    }
    return { puzzle: puzzle.join(''), solution: full.join(''), clues: clues, diff: diff, n: n };
  }

  /* Daily seed uses UTC+5 (Kazakhstan) so the day rolls over at local midnight. */
  function dailySeed(now) {
    var t = (now === undefined ? Date.now() : now) + 5 * 3600 * 1000;
    return new Date(t).toISOString().slice(0, 10);
  }

  function randomSeed() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  var api = {
    generate: generate, solve: solve, dailySeed: dailySeed, randomSeed: randomSeed,
    geom: geom, sizeOf: function (d) { return (DIFF[d] || DIFF.medium).n; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SudokuCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
