(function () {
  'use strict';

  var XOGame = window.XOGame;
  var { PLAYER_X, PLAYER_O, BOARD_SIZE, makeMove, cloneState, getWinningLines } = XOGame;

  var XOAI = {
    getAIMove: getAIMove,
    triggerAIMove: triggerAIMove,
    GAME_MODE_PVP: 'pvp',
    GAME_MODE_PVE: 'pve',
    DIFFICULTY_EASY: 'easy',
    DIFFICULTY_MEDIUM: 'medium',
    DIFFICULTY_HARD: 'hard'
  };

  function triggerAIMove(state, difficulty, aiPlayer, callback, delay) {
    if (state.gameOver) return;
    if (state.currentPlayer !== aiPlayer) return;

    var actualDelay = delay !== undefined ? delay : 500;

    setTimeout(function () {
      var move = getAIMove(state, difficulty, aiPlayer);
      if (move && callback) {
        callback(move.row, move.col);
      }
    }, actualDelay);
  }

  function getAIMove(state, difficulty, aiPlayer) {
    if (difficulty === XOAI.DIFFICULTY_EASY) {
      return getEasyAIMove(state, aiPlayer);
    } else if (difficulty === XOAI.DIFFICULTY_MEDIUM) {
      return getMediumAIMove(state, aiPlayer);
    } else {
      return getHardAIMove(state, aiPlayer);
    }
  }

  function getEmptyCells(state) {
    var empty = [];
    for (var r = 0; r < BOARD_SIZE; r++) {
      for (var c = 0; c < BOARD_SIZE; c++) {
        if (!state.board[r][c] && !isCellFrozen(state, r, c)) {
          empty.push({ row: r, col: c });
        }
      }
    }
    return empty;
  }

  function isCellFrozen(state, row, col) {
    return state.freeze.active && state.freeze.row === row && state.freeze.col === col;
  }

  function getEasyAIMove(state, aiPlayer) {
    var emptyCells = getEmptyCells(state);
    if (emptyCells.length === 0) return null;

    var winningMove = findWinningMove(state, aiPlayer);
    if (winningMove && Math.random() > 0.7) {
      return winningMove;
    }

    var blockingMove = findWinningMove(state, aiPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);
    if (blockingMove && Math.random() > 0.6) {
      return blockingMove;
    }

    var center = { row: 1, col: 1 };
    if (emptyCells.some(function (c) { return c.row === center.row && c.col === center.col; }) && Math.random() > 0.5) {
      return center;
    }

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  function getMediumAIMove(state, aiPlayer) {
    var emptyCells = getEmptyCells(state);
    if (emptyCells.length === 0) return null;

    var winningMove = findWinningMove(state, aiPlayer);
    if (winningMove) return winningMove;

    var oppPlayer = aiPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    var blockingMove = findWinningMove(state, oppPlayer);
    if (blockingMove) return blockingMove;

    var bestMove = null;
    var bestScore = -Infinity;

    for (var i = 0; i < emptyCells.length; i++) {
      var cell = emptyCells[i];
      var score = evaluatePosition(state, cell.row, cell.col, aiPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestMove = cell;
      }
    }

    return bestMove;
  }

  function getHardAIMove(state, aiPlayer) {
    var emptyCells = getEmptyCells(state);
    if (emptyCells.length === 0) return null;

    var winningMove = findWinningMove(state, aiPlayer);
    if (winningMove) return winningMove;

    var oppPlayer = aiPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    var blockingMove = findWinningMove(state, oppPlayer);
    if (blockingMove) return blockingMove;

    var bestMove = null;
    var bestScore = -Infinity;

    for (var i = 0; i < emptyCells.length; i++) {
      var cell = emptyCells[i];
      var nextState = makeMove(cloneState(state), cell.row, cell.col);
      var score = minimax(nextState, 5, -Infinity, Infinity, false, aiPlayer, oppPlayer);
      if (score > bestScore) {
        bestScore = score;
        bestMove = cell;
      }
    }

    return bestMove;
  }

  function minimax(state, depth, alpha, beta, isMaximizing, aiPlayer, oppPlayer) {
    if (state.gameOver) {
      if (state.winner === aiPlayer) return 100 + depth;
      if (state.winner === oppPlayer) return -100 - depth;
      return 0;
    }

    if (depth === 0) {
      return evaluateBoard(state, aiPlayer) - evaluateBoard(state, oppPlayer);
    }

    var emptyCells = getEmptyCells(state);
    if (emptyCells.length === 0) return 0;

    if (isMaximizing) {
      var maxEval = -Infinity;
      for (var i = 0; i < emptyCells.length; i++) {
        var cell = emptyCells[i];
        var nextState = makeMove(cloneState(state), cell.row, cell.col);
        var evalScore = minimax(nextState, depth - 1, alpha, beta, false, aiPlayer, oppPlayer);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      var minEval = Infinity;
      for (var j = 0; j < emptyCells.length; j++) {
        var cell2 = emptyCells[j];
        var nextState2 = makeMove(cloneState(state), cell2.row, cell2.col);
        var evalScore2 = minimax(nextState2, depth - 1, alpha, beta, true, aiPlayer, oppPlayer);
        minEval = Math.min(minEval, evalScore2);
        beta = Math.min(beta, evalScore2);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  function findWinningMove(state, player) {
    var emptyCells = getEmptyCells(state);
    for (var i = 0; i < emptyCells.length; i++) {
      var cell = emptyCells[i];
      var testState = makeMove(cloneState(state), cell.row, cell.col);
      if (testState.gameOver && testState.winner === player) {
        return cell;
      }
    }
    return null;
  }

  function evaluatePosition(state, row, col, player) {
    var score = 0;

    var centerBonus = (1 - Math.abs(row - 1)) * (1 - Math.abs(col - 1)) * 10;
    score += centerBonus;

    var testState = makeMove(cloneState(state), row, col);
    if (testState.gameOver && testState.winner === player) {
      score += 100;
    }

    var oppPlayer = player === PLAYER_X ? PLAYER_O : PLAYER_X;
    var lines = getLines();
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var playerCount = 0;
      var oppCount = 0;
      var emptyCount = 0;

      for (var j = 0; j < line.length; j++) {
        var r = line[j][0];
        var c = line[j][1];
        var piece = state.board[r][c];
        if (r === row && c === col) {
          playerCount++;
        } else if (piece) {
          if (piece.owner === player) playerCount++;
          else oppCount++;
        } else {
          emptyCount++;
        }
      }

      if (playerCount === 2 && emptyCount === 1) score += 30;
      if (playerCount === 1 && emptyCount === 2) score += 10;
      if (oppCount === 2 && emptyCount === 1) score += 25;
    }

    return score;
  }

  function evaluateBoard(state, player) {
    var score = 0;
    var lines = getLines();

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var playerCount = 0;
      var oppCount = 0;

      for (var j = 0; j < line.length; j++) {
        var r = line[j][0];
        var c = line[j][1];
        var piece = state.board[r][c];
        if (piece) {
          if (piece.owner === player) playerCount++;
          else oppCount++;
        }
      }

      if (playerCount > 0 && oppCount === 0) {
        score += playerCount * playerCount * 10;
      }
      if (oppCount > 0 && playerCount === 0) {
        score -= oppCount * oppCount * 8;
      }
    }

    return score;
  }

  function getLines() {
    var lines = [];
    for (var r = 0; r < BOARD_SIZE; r++) {
      var line = [];
      for (var c = 0; c < BOARD_SIZE; c++) line.push([r, c]);
      lines.push(line);
    }
    for (var c = 0; c < BOARD_SIZE; c++) {
      var line = [];
      for (var r = 0; r < BOARD_SIZE; r++) line.push([r, c]);
      lines.push(line);
    }
    var diag1 = [];
    var diag2 = [];
    for (var i = 0; i < BOARD_SIZE; i++) {
      diag1.push([i, i]);
      diag2.push([i, BOARD_SIZE - 1 - i]);
    }
    lines.push(diag1);
    lines.push(diag2);
    return lines;
  }

  window.XOAI = XOAI;
})();
