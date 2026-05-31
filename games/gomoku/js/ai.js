(function() {
  'use strict';

  window.Gomoku = window.Gomoku || {};
  var G = window.Gomoku;
  var state = G.state;

  G.ai = {
    getAIMove: getAIMove,
    triggerAIMove: triggerAIMove,
    evaluatePoint: evaluatePoint,
    hasNeighbor: hasNeighbor
  };

  function triggerAIMove() {
    if (state.gameMode !== 'pve') return;

    state.aiThinking = true;
    document.getElementById('aiThinking').hidden = false;

    if (state.aiTimeoutId) {
      clearTimeout(state.aiTimeoutId);
    }

    state.aiTimeoutId = setTimeout(function() {
      state.aiTimeoutId = null;
      if (state.gameMode !== 'pve') {
        state.aiThinking = false;
        document.getElementById('aiThinking').hidden = true;
        return;
      }
      var move = getAIMove();
      state.aiThinking = false;
      document.getElementById('aiThinking').hidden = true;
      if (move && !state.gameOver) {
        G.game.placeStone(move.row, move.col);
      }
    }, 400);
  }

  function getAIMove() {
    var aiSide = state.playerSide === G.BLACK ? G.WHITE : G.BLACK;

    if (state.aiDifficulty === 'easy') {
      return getEasyAIMove(aiSide);
    } else if (state.aiDifficulty === 'medium') {
      return getMediumAIMove(aiSide);
    } else {
      return getHardAIMove(aiSide);
    }
  }

  function getEasyAIMove(aiSide) {
    var candidates = [];
    var oppSide = aiSide === G.BLACK ? G.WHITE : G.BLACK;

    for (var r = 0; r < G.BOARD_SIZE; r++) {
      for (var c = 0; c < G.BOARD_SIZE; c++) {
        if (state.board[r][c] === G.EMPTY && hasNeighbor(r, c, 2)) {
          var score = Math.random() * 10;
          score += 1.0 / (Math.abs(r - 7) + Math.abs(c - 7) + 1);
          candidates.push({ row: r, col: c, score: score });
        }
      }
    }

    if (candidates.length === 0) {
      return { row: 7, col: 7 };
    }

    candidates.sort(function(a, b) { return b.score - a.score; });
    var topN = Math.min(5, candidates.length);
    return candidates[Math.floor(Math.random() * topN)];
  }

  function getMediumAIMove(aiSide) {
    var oppSide = aiSide === G.BLACK ? G.WHITE : G.BLACK;
    var bestMove = null;
    var bestScore = -Infinity;

    for (var r = 0; r < G.BOARD_SIZE; r++) {
      for (var c = 0; c < G.BOARD_SIZE; c++) {
        if (state.board[r][c] !== G.EMPTY) continue;
        if (!hasNeighbor(r, c, 2)) continue;

        var attackScore = evaluatePoint(r, c, aiSide);
        var defenseScore = evaluatePoint(r, c, oppSide);
        var score = attackScore * 1.1 + defenseScore;

        score += 5.0 / (Math.abs(r - 7) + Math.abs(c - 7) + 1);

        if (score > bestScore) {
          bestScore = score;
          bestMove = { row: r, col: c };
        }
      }
    }

    if (!bestMove) {
      bestMove = { row: 7, col: 7 };
    }
    return bestMove;
  }

  function getHardAIMove(aiSide) {
    var oppSide = aiSide === G.BLACK ? G.WHITE : G.BLACK;

    var winMove = findWinningMove(aiSide);
    if (winMove) return winMove;

    var blockMove = findWinningMove(oppSide);
    if (blockMove) return blockMove;

    var depth = 4;
    var bestMove = null;
    var bestScore = -Infinity;
    var alpha = -Infinity;
    var beta = Infinity;

    var candidates = getSortedCandidates(aiSide);
    if (candidates.length === 0) return { row: 7, col: 7 };
    if (candidates.length > 12) candidates = candidates.slice(0, 12);

    for (var i = 0; i < candidates.length; i++) {
      var m = candidates[i];
      state.board[m.row][m.col] = aiSide;
      var score = minimax(depth - 1, alpha, beta, false, aiSide, oppSide, m.row, m.col);
      state.board[m.row][m.col] = G.EMPTY;

      if (score > bestScore) {
        bestScore = score;
        bestMove = { row: m.row, col: m.col };
      }
      alpha = Math.max(alpha, score);
    }

    if (!bestMove) bestMove = candidates[0];
    return bestMove;
  }

  function minimax(depth, alpha, beta, isMaximizing, aiSide, oppSide, lastR, lastC) {
    var lastWin = G.game.checkWin(lastR, lastC, isMaximizing ? oppSide : aiSide);
    if (lastWin) {
      return isMaximizing ? -G.FIVE * (depth + 1) : G.FIVE * (depth + 1);
    }

    if (depth === 0) {
      return evaluateBoard(aiSide) - evaluateBoard(oppSide);
    }

    var side = isMaximizing ? aiSide : oppSide;
    var cands = getSortedCandidates(side);
    if (cands.length === 0) return evaluateBoard(aiSide) - evaluateBoard(oppSide);
    if (cands.length > 8) cands = cands.slice(0, 8);

    if (isMaximizing) {
      var maxEval = -Infinity;
      for (var i = 0; i < cands.length; i++) {
        var m = cands[i];
        state.board[m.row][m.col] = aiSide;
        var evalScore = minimax(depth - 1, alpha, beta, false, aiSide, oppSide, m.row, m.col);
        state.board[m.row][m.col] = G.EMPTY;
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      var minEval = Infinity;
      for (var j = 0; j < cands.length; j++) {
        var om = cands[j];
        state.board[om.row][om.col] = oppSide;
        var evalScore2 = minimax(depth - 1, alpha, beta, true, aiSide, oppSide, om.row, om.col);
        state.board[om.row][om.col] = G.EMPTY;
        minEval = Math.min(minEval, evalScore2);
        beta = Math.min(beta, evalScore2);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  function getSortedCandidates(side) {
    var result = [];
    for (var r = 0; r < G.BOARD_SIZE; r++) {
      for (var c = 0; c < G.BOARD_SIZE; c++) {
        if (state.board[r][c] !== G.EMPTY) continue;
        if (!hasNeighbor(r, c, 2)) continue;
        var s = evaluatePoint(r, c, side) + evaluatePoint(r, c, side === G.BLACK ? G.WHITE : G.BLACK) * 0.8;
        result.push({ row: r, col: c, score: s });
      }
    }
    result.sort(function(a, b) { return b.score - a.score; });
    return result;
  }

  function findWinningMove(side) {
    for (var r = 0; r < G.BOARD_SIZE; r++) {
      for (var c = 0; c < G.BOARD_SIZE; c++) {
        if (state.board[r][c] !== G.EMPTY) continue;
        if (!hasNeighbor(r, c, 1)) continue;
        state.board[r][c] = side;
        var w = G.game.checkWin(r, c, side);
        state.board[r][c] = G.EMPTY;
        if (w) return { row: r, col: c };
      }
    }
    return null;
  }

  function evaluateBoard(side) {
    var total = 0;
    for (var r = 0; r < G.BOARD_SIZE; r++) {
      for (var c = 0; c < G.BOARD_SIZE; c++) {
        if (state.board[r][c] === side) {
          total += evaluatePoint(r, c, side) * 0.3;
        }
      }
    }
    return total;
  }

  function evaluatePoint(row, col, side) {
    var directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    var total = 0;

    for (var d = 0; d < directions.length; d++) {
      total += evaluateDirection(row, col, directions[d][0], directions[d][1], side);
    }
    return total;
  }

  function evaluateDirection(row, col, dr, dc, side) {
    var count = 1;
    var blockStart = false;
    var blockEnd = false;
    var emptyAfter = 0;
    var emptyBefore = 0;
    var oppSide = side === G.BLACK ? G.WHITE : G.BLACK;

    var r = row + dr, c = col + dc;
    while (r >= 0 && r < G.BOARD_SIZE && c >= 0 && c < G.BOARD_SIZE && state.board[r][c] === side) {
      count++;
      r += dr;
      c += dc;
    }
    if (r < 0 || r >= G.BOARD_SIZE || c < 0 || c >= G.BOARD_SIZE) {
      blockEnd = true;
    } else if (state.board[r][c] === oppSide) {
      blockEnd = true;
    } else {
      emptyAfter = countConsecutive(r, c, dr, dc, G.EMPTY);
    }

    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < G.BOARD_SIZE && c >= 0 && c < G.BOARD_SIZE && state.board[r][c] === side) {
      count++;
      r -= dr;
      c -= dc;
    }
    if (r < 0 || r >= G.BOARD_SIZE || c < 0 || c >= G.BOARD_SIZE) {
      blockStart = true;
    } else if (state.board[r][c] === oppSide) {
      blockStart = true;
    } else {
      emptyBefore = countConsecutive(r, c, -dr, -dc, G.EMPTY);
    }

    return calculatePatternScore(count, blockStart, blockEnd, emptyBefore, emptyAfter);
  }

  function countConsecutive(row, col, dr, dc, val) {
    var count = 0;
    var r = row, c = col;
    while (r >= 0 && r < G.BOARD_SIZE && c >= 0 && c < G.BOARD_SIZE && state.board[r][c] === val && count < 2) {
      count++;
      r += dr;
      c += dc;
    }
    return count;
  }

  function calculatePatternScore(count, blockS, blockE, emptyB, emptyA) {
    if (count >= 5) return G.FIVE;

    var openEnds = 0;
    if (!blockS && emptyB > 0) openEnds++;
    if (!blockE && emptyA > 0) openEnds++;

    if (count === 4) {
      if (openEnds === 2) return G.OPEN_FOUR;
      if (openEnds === 1) return G.FOUR;
      return 0;
    }
    if (count === 3) {
      if (openEnds === 2) return G.OPEN_THREE;
      if (openEnds === 1) return G.THREE;
      return 0;
    }
    if (count === 2) {
      if (openEnds === 2) return G.OPEN_TWO;
      if (openEnds === 1) return G.TWO;
      return 0;
    }
    if (count === 1) {
      if (openEnds >= 1) return G.ONE;
      return 0;
    }
    return 0;
  }

  function hasNeighbor(row, col, dist) {
    for (var dr = -dist; dr <= dist; dr++) {
      for (var dc = -dist; dc <= dist; dc++) {
        if (dr === 0 && dc === 0) continue;
        var nr = row + dr;
        var nc = col + dc;
        if (nr >= 0 && nr < G.BOARD_SIZE && nc >= 0 && nc < G.BOARD_SIZE && state.board[nr][nc] !== G.EMPTY) {
          return true;
        }
      }
    }
    return false;
  }
})();
