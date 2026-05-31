(function (global) {
  'use strict';

  const BOARD_SIZE = 3;
  const MAX_PIECES_PER_PLAYER = 3;
  const PERSIST_PIECES_PER_PLAYER = 5;
  const PLAYER_X = 'X';
  const PLAYER_O = 'O';
  const MODE_NORMAL = 'normal';
  const MODE_FUN = 'fun';

  function createEmptyBoard() {
    const board = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row = [];
      for (let c = 0; c < BOARD_SIZE; c++) row.push(null);
      board.push(row);
    }
    return board;
  }

  function createInitialState(mode) {
    return {
      board: createEmptyBoard(),
      currentPlayer: PLAYER_X,
      gameOver: false,
      winner: null,
      winningLines: [],
      gameMode: mode || MODE_NORMAL,
      pieceIdCounter: 1,
      pieceOrder: { X: [], O: [] },
      freeze: {
        row: null,
        col: null,
        owner: null,
        active: false,
        willExpire: false,
      },
      waitingForFreezeTarget: false,
      funAbilities: {
        X: { undo: 1, freeze: 1, persist: 1 },
        O: { undo: 1, freeze: 1, persist: 1 },
      },
      persistActive: { X: false, O: false },
      turnCount: { X: 0, O: 0 },
      lastPlayer: null,
    };
  }

  function cloneState(state) {
    return {
      board: state.board.map((row) => row.map((c) => (c ? { ...c } : null))),
      currentPlayer: state.currentPlayer,
      gameOver: state.gameOver,
      winner: state.winner,
      winningLines: state.winningLines.map((l) => l.slice()),
      gameMode: state.gameMode,
      pieceIdCounter: state.pieceIdCounter,
      pieceOrder: {
        X: state.pieceOrder.X.slice(),
        O: state.pieceOrder.O.slice(),
      },
      freeze: { ...state.freeze },
      waitingForFreezeTarget: state.waitingForFreezeTarget,
      funAbilities: {
        X: { ...state.funAbilities.X },
        O: { ...state.funAbilities.O },
      },
      persistActive: { ...state.persistActive },
      turnCount: { ...state.turnCount },
      lastPlayer: state.lastPlayer,
    };
  }

  function getWinningLines(board) {
    const lines = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const line = [];
      for (let c = 0; c < BOARD_SIZE; c++) line.push([r, c]);
      lines.push(line);
    }
    for (let c = 0; c < BOARD_SIZE; c++) {
      const line = [];
      for (let r = 0; r < BOARD_SIZE; r++) line.push([r, c]);
      lines.push(line);
    }
    const diag1 = [];
    const diag2 = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      diag1.push([i, i]);
      diag2.push([i, BOARD_SIZE - 1 - i]);
    }
    lines.push(diag1);
    lines.push(diag2);

    const winning = [];
    for (const line of lines) {
      const first = board[line[0][0]][line[0][1]];
      if (!first) continue;
      let same = true;
      for (const [r, c] of line) {
        const cell = board[r][c];
        if (!cell || cell.owner !== first.owner) {
          same = false;
          break;
        }
      }
      if (same) winning.push(line);
    }
    return winning;
  }

  function makeMove(state, row, col) {
    if (state.gameOver) return state;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return state;
    if (state.board[row][col]) return state;

    if (state.freeze.active && state.freeze.row === row && state.freeze.col === col) {
      return state;
    }

    const next = cloneState(state);
    const player = next.currentPlayer;

    const piece = {
      id: next.pieceIdCounter++,
      owner: player,
      row,
      col,
    };
    next.board[row][col] = piece;

    next.turnCount[player] += 1;
    var isPersist = next.persistActive[player];
    next.pieceOrder[player].push({ row: row, col: col, id: piece.id, persist: isPersist, placedTurn: next.turnCount[player] });
    if (isPersist) {
      next.persistActive[player] = false;
    }

    var removed = true;
    while (removed) {
      removed = false;
      for (var i = 0; i < next.pieceOrder[player].length; i++) {
        var p = next.pieceOrder[player][i];
        var age = next.turnCount[player] - p.placedTurn + 1;
        var maxAge = p.persist ? 5 : 3;
        if (age > maxAge) {
          next.pieceOrder[player].splice(i, 1);
          if (next.board[p.row][p.col] && next.board[p.row][p.col].id === p.id) {
            next.board[p.row][p.col] = null;
          }
          removed = true;
          break;
        }
      }
    }

    if (next.freeze.active && next.freeze.willExpire && next.freeze.owner !== player) {
      next.freeze = { row: null, col: null, owner: null, active: false, willExpire: false };
    }

    const winningLines = getWinningLines(next.board);
    if (winningLines.length > 0) {
      next.gameOver = true;
      next.winner = player;
      next.winningLines = winningLines;
    } else {
      next.lastPlayer = player;
      next.currentPlayer = player === PLAYER_X ? PLAYER_O : PLAYER_X;
    }

    return next;
  }

  function undoNormal(state, history) {
    if (!history || history.length === 0) return state;
    return history[history.length - 1];
  }

  function useFunUndo(state, prevState) {
    if (!state || state.gameMode !== MODE_FUN) return state;
    if (state.gameOver) return state;

    const lastPlayer = state.lastPlayer;
    if (!lastPlayer) return state;
    if (state.funAbilities[lastPlayer].undo <= 0) return state;

    const order = state.pieceOrder[lastPlayer];
    if (order.length === 0) return state;

    const target = order[order.length - 1];
    const cell = state.board[target.row][target.col];
    if (!cell || cell.id !== target.id) return state;

    const next = cloneState(state);
    next.board[target.row][target.col] = null;
    next.pieceOrder[lastPlayer].pop();
    next.currentPlayer = lastPlayer;
    next.lastPlayer = lastPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    next.funAbilities[lastPlayer].undo -= 1;
    next.winningLines = [];
    next.gameOver = false;
    next.winner = null;

    if (prevState && prevState.freeze && prevState.freeze.active && prevState.freeze.owner !== lastPlayer) {
      if (!next.freeze.active) {
        next.freeze = { ...prevState.freeze };
      }
    }

    return next;
  }

  function startFreezeSelection(state, player) {
    if (state.gameMode !== MODE_FUN) return state;
    if (state.gameOver) return state;
    if (state.funAbilities[player].freeze <= 0) return state;

    const next = cloneState(state);
    next.waitingForFreezeTarget = true;
    return next;
  }

  function cancelFreezeSelection(state) {
    if (!state.waitingForFreezeTarget) return state;
    const next = cloneState(state);
    next.waitingForFreezeTarget = false;
    return next;
  }

  function setFreezeTarget(state, row, col, initiator) {
    if (!state.waitingForFreezeTarget) return state;
    if (state.board[row][col]) return state;

    const next = cloneState(state);
    next.freeze = {
      row,
      col,
      owner: initiator,
      active: true,
      willExpire: false,
    };
    next.funAbilities[initiator].freeze -= 1;
    next.waitingForFreezeTarget = false;
    next.freeze.willExpire = true;
    return next;
  }

  function usePersist(state, player) {
    if (state.gameMode !== MODE_FUN) return state;
    if (state.gameOver) return state;
    if (state.funAbilities[player].persist <= 0) return state;
    if (state.persistActive[player]) return state;

    var next = cloneState(state);
    next.persistActive[player] = true;
    next.funAbilities[player].persist -= 1;
    return next;
  }

  function cancelPersist(state, player) {
    if (state.gameMode !== MODE_FUN) return state;
    if (state.gameOver) return state;
    if (!state.persistActive[player]) return state;

    var next = cloneState(state);
    next.persistActive[player] = false;
    next.funAbilities[player].persist += 1;
    return next;
  }

  function isCellFrozen(state, row, col) {
    return state.freeze.active && state.freeze.row === row && state.freeze.col === col;
  }

  function isPiecePersist(state, row, col) {
    var piece = state.board[row][col];
    if (!piece) return false;
    var order = state.pieceOrder[piece.owner];
    for (var i = 0; i < order.length; i++) {
      if (order[i].id === piece.id) {
        return order[i].persist;
      }
    }
    return false;
  }

  function getRelativeOrder(state, piece) {
    if (!piece) return 0;
    const order = state.pieceOrder[piece.owner];
    for (let i = 0; i < order.length; i++) {
      if (order[i].id === piece.id) {
        return order.length - i;
      }
    }
    return 0;
  }

  function getPieceDisplayCount(state, piece) {
    if (!piece) return 0;
    var order = state.pieceOrder[piece.owner];
    for (var i = 0; i < order.length; i++) {
      if (order[i].id === piece.id) {
        return state.turnCount[piece.owner] - order[i].placedTurn + 1;
      }
    }
    return 0;
  }

  function getPieceAge(state, piece) {
    const rel = getRelativeOrder(state, piece);
    if (rel <= 1) return 'newest';
    if (rel === 2) return 'middle';
    return 'oldest';
  }

  const XOGame = {
    BOARD_SIZE,
    MAX_PIECES_PER_PLAYER,
    PERSIST_PIECES_PER_PLAYER,
    PLAYER_X,
    PLAYER_O,
    MODE_NORMAL,
    MODE_FUN,
    createInitialState,
    cloneState,
    makeMove,
    undoNormal,
    useFunUndo,
    startFreezeSelection,
    cancelFreezeSelection,
    setFreezeTarget,
    usePersist,
    cancelPersist,
    isCellFrozen,
    isPiecePersist,
    getRelativeOrder,
    getPieceDisplayCount,
    getPieceAge,
    getWinningLines,
  };

  global.XOGame = XOGame;
})(window);
