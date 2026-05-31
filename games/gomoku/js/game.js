(function() {
  'use strict';

  window.Gomoku = window.Gomoku || {};
  var G = window.Gomoku;
  var state = G.state;

  G.game = {
    init: init,
    resetGame: resetGame,
    endGame: endGame,
    placeStone: placeStone,
    undoMove: undoMove,
    checkWin: checkWin,
    handleCanvasClick: handleCanvasClick,
    handleCanvasHover: handleCanvasHover,
    startTimer: startTimer,
    stopTimer: stopTimer,
    resetTimer: resetTimer,
    toggleTimer: toggleTimer,
    toggleSound: toggleSound
  };

  function init() {
    state.canvas = document.getElementById('board');
    state.ctx = state.canvas.getContext('2d');

    var aiThinkingEl = document.getElementById('aiThinking');
    if (aiThinkingEl) {
      aiThinkingEl.hidden = true;
    }

    G.audio.init();
    G.achievements.init();
    initTheme();
    initGameSettings();
    G.renderer.resizeCanvas();
    window.addEventListener('resize', G.renderer.resizeCanvas);
    resetGame();
    G.ui.bindEvents();
    G.ui.updateActionButtons();
  }

  function initTheme() {
    var savedTheme = localStorage.getItem('gomoku-theme');
    if (!savedTheme) { savedTheme = 'classic'; }
    state.currentTheme = savedTheme;
    applyTheme(savedTheme);
  }

  function initGameSettings() {
    var savedMode = localStorage.getItem('gomoku-mode');
    if (savedMode) { state.gameMode = savedMode; }
    var savedSide = localStorage.getItem('gomoku-side');
    if (savedSide) { state.playerSide = parseInt(savedSide); }
    var savedDiff = localStorage.getItem('gomoku-difficulty');
    if (savedDiff) { state.aiDifficulty = savedDiff; }
    var savedTimer = localStorage.getItem('gomoku-timer');
    if (savedTimer) { state.timerEnabled = savedTimer === 'true'; }
    var savedTab = localStorage.getItem('gomoku-settings-tab');
    if (savedTab) { state.currentSettingsTab = savedTab; }
    var savedSound = localStorage.getItem('gomoku-sound');
    if (savedSound !== null) { state.soundEnabled = savedSound === 'true'; }
    var savedAchievementCategory = localStorage.getItem('gomoku-achievement-category');
    if (savedAchievementCategory) { state.currentAchievementCategory = savedAchievementCategory; }
    G.ui.updateSettingsUI();
    G.ui.updateModeBadge();
    G.ui.updateTimerDisplay();
    G.ui.updateSoundButton();
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    state.currentTheme = theme;
    localStorage.setItem('gomoku-theme', theme);
    G.achievements.trackTheme(theme);
    G.ui.updateThemeActiveState();
    if (state.bgCanvas) {
      G.renderer.renderBackgroundToCache();
    }
    if (state.board) { G.renderer.draw(); }
  }

  function resetGame() {
    if (state.aiTimeoutId) {
      clearTimeout(state.aiTimeoutId);
      state.aiTimeoutId = null;
    }

    stopTimer();

    state.board = [];
    for (var r = 0; r < G.BOARD_SIZE; r++) {
      state.board[r] = [];
      for (var c = 0; c < G.BOARD_SIZE; c++) { state.board[r][c] = G.EMPTY; }
    }
    state.currentPlayer = G.BLACK;
    state.moveCount = 0;
    state.lastMove = null;
    state.firstMove = null;
    state.gameOver = false;
    state.winLine = null;
    state.moveHistory = [];
    state.aiThinking = false;

    var aiThinkingEl = document.getElementById('aiThinking');
    if (aiThinkingEl) {
      aiThinkingEl.hidden = true;
    }

    G.ui.updateStatus();
    G.ui.updateUndoButton();
    G.renderer.draw();

    if (state.timerEnabled) {
      resetTimer();
      if (state.gameMode === 'pve' && state.currentPlayer !== state.playerSide) {
        G.ai.triggerAIMove();
      } else {
        startTimer();
      }
    } else if (state.gameMode === 'pve' && state.currentPlayer !== state.playerSide) {
      G.ai.triggerAIMove();
    }
  }

  function endGame() {
    if (state.gameEnded) return;

    stopTimer();
    saveGameState();
    state.gameOver = true;
    G.ui.updateActionButtons();
    G.ui.updateStatus();

    if (!state.winLine) {
      G.ui.showEndModal();
    }
  }

  function saveGameState() {
    if (state.savedGameState) return;
    state.savedGameState = {
      board: JSON.parse(JSON.stringify(state.board)),
      currentPlayer: state.currentPlayer,
      moveCount: state.moveCount,
      lastMove: state.lastMove,
      gameOver: state.gameOver,
      winLine: state.winLine,
      moveHistory: JSON.parse(JSON.stringify(state.moveHistory))
    };
    state.gameEnded = true;
  }

  function handleCanvasClick(e) {
    if (state.gameOver || state.aiThinking) return;
    if (state.gameMode === 'pve' && state.currentPlayer !== state.playerSide) return;

    var rect = state.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var col = Math.round((x - state.padding) / state.cellSize);
    var row = Math.round((y - state.padding) / state.cellSize);
    col = Math.max(0, Math.min(G.BOARD_SIZE - 1, col));
    row = Math.max(0, Math.min(G.BOARD_SIZE - 1, row));
    if (state.board[row][col] !== G.EMPTY) return;

    placeStone(row, col);
  }

  function placeStone(row, col) {
    state.moveHistory.push({
      row: row, col: col,
      player: state.currentPlayer,
      moveCount: state.moveCount,
      lastMove: state.lastMove ? { row: state.lastMove.row, col: state.lastMove.col } : null,
      gameOver: state.gameOver,
      winLine: state.winLine ? {
        startR: state.winLine.startR, startC: state.winLine.startC,
        endR: state.winLine.endR, endC: state.winLine.endC, player: state.winLine.player
      } : null
    });

    state.board[row][col] = state.currentPlayer;
    state.moveCount++;
    state.lastMove = { row: row, col: col };
    if (state.moveCount === 1) {
      state.firstMove = { row: row, col: col };
    }

    G.audio.playPlaceStone();

    var winInfo = checkWin(row, col, state.currentPlayer);
    if (winInfo) {
      state.gameOver = true;
      state.winLine = winInfo;
      G.ui.updateUndoButton();
      G.ui.updateActionButtons();
      G.renderer.draw();
      G.audio.playWin();
      G.achievements.checkWinAchievements(state.currentPlayer);

      setTimeout(function() {
        if (state.gameOver && state.winLine) {
          G.ui.showWinModal(state.currentPlayer);
        }
      }, 800);
      return;
    }

    if (state.moveCount >= G.BOARD_SIZE * G.BOARD_SIZE) {
      state.gameOver = true;
      G.achievements.checkDrawAchievements();
      G.ui.updateUndoButton();
      G.ui.updateActionButtons();
      G.renderer.draw();

      setTimeout(function() {
        if (state.gameOver) {
          G.ui.showDrawModal();
        }
      }, 800);
      return;
    }

    state.currentPlayer = (state.currentPlayer === G.BLACK) ? G.WHITE : G.BLACK;
    G.ui.updateStatus();
    G.ui.updateUndoButton();
    G.ui.updateActionButtons();
    G.renderer.draw();

    if (state.timerEnabled && !state.gameOver) {
      resetTimer();
      if (state.gameMode === 'pve' && state.currentPlayer !== state.playerSide) {
        stopTimer();
        G.ai.triggerAIMove();
      } else {
        startTimer();
      }
    } else if (state.gameMode === 'pve' && !state.gameOver && state.currentPlayer !== state.playerSide) {
      G.ai.triggerAIMove();
    }
  }

  function handleCanvasHover(e) {
    if (state.gameOver || state.aiThinking) return;
    if (state.gameMode === 'pve' && state.currentPlayer !== state.playerSide) return;

    var rect = state.canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var col = Math.round((x - state.padding) / state.cellSize);
    var row = Math.round((y - state.padding) / state.cellSize);
    col = Math.max(0, Math.min(G.BOARD_SIZE - 1, col));
    row = Math.max(0, Math.min(G.BOARD_SIZE - 1, row));

    G.renderer.draw();
    if (state.board[row][col] === G.EMPTY) {
      G.renderer.drawGhostStone(row, col, state.currentPlayer);
    }
  }

  function checkWin(row, col, player) {
    var directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (var d = 0; d < directions.length; d++) {
      var dr = directions[d][0];
      var dc = directions[d][1];
      var count = 1;
      var startR = row, startC = col;

      for (var i = 1; i < 5; i++) {
        var nr = row + dr * i, nc = col + dc * i;
        if (nr < 0 || nr >= G.BOARD_SIZE || nc < 0 || nc >= G.BOARD_SIZE) break;
        if (state.board[nr][nc] !== player) break;
        count++;
      }
      for (var j = 1; j < 5; j++) {
        var nr2 = row - dr * j, nc2 = col - dc * j;
        if (nr2 < 0 || nr2 >= G.BOARD_SIZE || nc2 < 0 || nc2 >= G.BOARD_SIZE) break;
        if (state.board[nr2][nc2] !== player) break;
        count++;
        startR = nr2;
        startC = nc2;
      }

      if (count >= 5) {
        return { startR: startR, startC: startC, endR: startR + dr * 4, endC: startC + dc * 4, player: player };
      }
    }
    return null;
  }

  function undoMove() {
    if (state.moveHistory.length === 0 || state.aiThinking) return;

    var stepsToUndo = 1;
    if (state.gameMode === 'pve' && state.moveHistory.length >= 2) {
      var lastHistoryPlayer = state.moveHistory[state.moveHistory.length - 1].player;
      if (lastHistoryPlayer !== state.playerSide) {
        stepsToUndo = 2;
      }
    }

    G.achievements.trackUndo();

    for (var s = 0; s < stepsToUndo && state.moveHistory.length > 0; s++) {
      var prev = state.moveHistory.pop();
      state.board[prev.row][prev.col] = G.EMPTY;
      state.currentPlayer = prev.player;
      state.moveCount = prev.moveCount;
      state.lastMove = prev.lastMove;
      state.gameOver = prev.gameOver;
      state.winLine = prev.winLine;
    }

    G.ui.hideAllModals();
    G.ui.updateStatus();
    G.ui.updateUndoButton();
    G.ui.updateActionButtons();
    G.renderer.draw();

    if (!state.gameOver && state.timerEnabled) {
      resetTimer();
      if (state.gameMode === 'pve' && state.currentPlayer !== state.playerSide) {
        stopTimer();
        G.ai.triggerAIMove();
      } else {
        startTimer();
      }
    } else if (!state.gameOver && state.gameMode === 'pve' && state.currentPlayer !== state.playerSide) {
      G.ai.triggerAIMove();
    }
  }

  function toggleTimer(enabled) {
    state.timerEnabled = enabled;
    localStorage.setItem('gomoku-timer', enabled ? 'true' : 'false');
    G.ui.updateTimerDisplay();
    if (enabled) {
      if (!state.gameOver && !state.aiThinking) {
        resetTimer();
        startTimer();
      }
    } else {
      stopTimer();
    }
  }

  function toggleSound(enabled) {
    G.audio.toggleSound(enabled);
    G.ui.updateSettingsUI();
    if (enabled) {
      G.audio.playClick();
    }
  }

  function startTimer() {
    if (!state.timerEnabled || state.gameOver || state.aiThinking) return;
    if (state.gameMode === 'pve' && state.currentPlayer !== state.playerSide) return;

    stopTimer();
    state.timerIntervalId = setInterval(function() {
      state.timerRemaining--;
      G.ui.updateTimerDisplay();

      if (state.timerRemaining <= 0) {
        stopTimer();
        handleTimeout();
      }
    }, 1000);
  }

  function stopTimer() {
    if (state.timerIntervalId) {
      clearInterval(state.timerIntervalId);
      state.timerIntervalId = null;
    }
  }

  function resetTimer() {
    state.timerRemaining = state.timerSeconds;
    G.ui.updateTimerDisplay();
  }

  function handleTimeout() {
    if (state.gameOver) return;

    var winner = state.currentPlayer === G.BLACK ? G.WHITE : G.BLACK;
    state.gameOver = true;
    G.achievements.checkWinAchievements(winner);
    G.ui.updateUndoButton();
    G.ui.updateActionButtons();
    G.renderer.draw();

    setTimeout(function() {
      if (state.gameOver) {
        G.ui.showTimeoutModal(winner);
      }
    }, 500);
  }

  G.game.applyTheme = applyTheme;
  G.game.saveGameState = saveGameState;
})();
