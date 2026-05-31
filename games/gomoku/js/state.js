(function() {
  'use strict';

  window.Gomoku = window.Gomoku || {};

  var state = {
    canvas: null,
    ctx: null,
    bgCanvas: null,
    bgCtx: null,
    cellSize: 0,
    padding: 0,
    board: null,
    currentPlayer: 1,
    moveCount: 0,
    lastMove: null,
    gameOver: false,
    winLine: null,
    currentTheme: 'classic',
    moveHistory: [],
    aiThinking: false,
    gameMode: 'pvp',
    playerSide: 1,
    aiDifficulty: 'easy',
    gameEnded: false,
    savedGameState: null,
    aiTimeoutId: null,
    timerEnabled: false,
    timerSeconds: 10,
    timerRemaining: 10,
    timerIntervalId: null,
    currentSettingsTab: 'game',
    soundEnabled: true,
    currentAchievementCategory: 'all',
    firstMove: null
  };

  window.Gomoku.state = state;
})();
