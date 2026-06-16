(function () {
  'use strict';

  var XOApp = window.XOApp || (window.XOApp = {});

  var MODE_NORMAL = window.XOGame.MODE_NORMAL;
  var XOAI = window.XOAI;

  var state = {
    game: window.XOGame.createInitialState(MODE_NORMAL),
    history: [],
    freezeInitiator: null,
    settings: {
      boardSize: 'standard',
      pieceSize: 'standard',
      theme: localStorage.getItem('xando-theme') || 'classic',
      gameMode: localStorage.getItem('xando-gameMode') || XOAI.GAME_MODE_PVP,
      aiDifficulty: localStorage.getItem('xando-aiDifficulty') || XOAI.DIFFICULTY_MEDIUM,
      aiFirstMove: localStorage.getItem('xando-aiFirstMove') || 'player',
    },
    ai: {
      player: XOAI.GAME_MODE_PVP,
      difficulty: XOAI.DIFFICULTY_MEDIUM,
      aiPlayer: null,
      humanPlayer: null,
      thinking: false,
    },
    tutorial: {
      active: false,
      currentStep: 0,
      totalSteps: 0,
      waitingForInteraction: false,
      interactionCell: null,
      guideElement: null,
      isWinStep: false,
      pausedForWinModal: false,
      undoStage: 0,
      animateDisappear: false,
      disappearCell: null,
      freezeStage: 0,
      freezeCell: null,
      animateFreezeDisappear: false,
      freezeDisappearCell: null,
      persistStage: 0,
      persistCell: null,
      animatePersistDisappear: false,
      persistDisappearCell: null,
      persistSecondDisappearCell: null,
      persistStepIndex: 0,
      persistAutoNextOMove: null,
      showPersistReminder: null,
      allowedButton: null,
      freezeTriedFrozenCell: false,
      helpStage: 0,
      settingsStage: 0,
      modeStage: 0,
      pendingAutoAdvance: null,
      preTutorialSettings: null,
      manualPositioning: false,
      guideTimeouts: [],
      lastOnEnterStep: -1,
    },
  };

  var els = {};

  var helpState = {
    current: 0,
    totalPages: 3,
    scrollDir: 0,
    scrollTimer: null,
  };

  var settingsTabState = {
    current: localStorage.getItem('xando-settings-tab') || 'basic',
  };

  var collapseState = {
    'ai-settings': localStorage.getItem('xando-collapse-ai-settings') !== 'true',
    'board-settings': localStorage.getItem('xando-collapse-board-settings') !== 'true',
  };

  function $(id) {
    return document.getElementById(id);
  }

  function initEls() {
    els.layout = $('layout');
    els.titleMode = $('titleMode');
    els.btnMode = $('btnMode');
    els.btnHelp = $('btnHelp');
    els.btnSettings = $('btnSettings');
    els.btnAI = $('btnAI');
    els.statusText = $('statusText');
    els.freezeHint = $('freezeHint');
    els.btnCancelFreeze = $('btnCancelFreeze');
    els.persistHint = $('persistHint');
    els.btnCancelPersist = $('btnCancelPersist');
    els.board = $('board');
    els.panelX = $('panelX');
    els.panelO = $('panelO');
    els.btnUndoX = $('btnUndoX');
    els.btnUndoO = $('btnUndoO');
    els.btnFreezeX = $('btnFreezeX');
    els.btnFreezeO = $('btnFreezeO');
    els.btnPersistX = $('btnPersistX');
    els.btnPersistO = $('btnPersistO');
    els.countUndoX = $('countUndoX');
    els.countUndoO = $('countUndoO');
    els.countFreezeX = $('countFreezeX');
    els.countFreezeO = $('countFreezeO');
    els.countPersistX = $('countPersistX');
    els.countPersistO = $('countPersistO');
    els.btnUndo = $('btnUndo');
    els.btnReset = $('btnReset');
    els.aiModal = $('aiModal');
    els.aiSettingsGroup = $('aiSettingsGroup');
    els.btnAIConfirm = $('btnAIConfirm');
    els.aiSettingsInBasic = $('aiSettingsInBasic');
    els.aiFirstMoveSettings = $('aiFirstMoveSettings');
    els.modeModal = $('modeModal');
    els.helpModal = $('helpModal');
    els.winModal = $('winModal');
    els.winTitle = $('winTitle');
    els.btnWinClose = $('btnWinClose');
    els.settingsModal = $('settingsModal');
    els.optionBtns = document.querySelectorAll('.option-btn');
    els.settingsTabs = document.querySelectorAll('.settings-tab');
    els.settingsPages = document.querySelectorAll('.settings-page');
    els.helpPages = document.querySelectorAll('.help-page');
    els.helpPagesContainer = $('helpPages');
    els.helpPrev = $('helpPrev');
    els.helpNext = $('helpNext');
    els.helpDots = $('helpDots');
    helpState.totalPages = els.helpPages.length;

    els.tutorialOverlay = $('tutorialOverlay');
    els.tutorialHighlight = $('tutorialHighlight');
    els.tutorialTooltip = $('tutorialTooltip');
    els.tutorialContent = $('tutorialContent');
    els.tutorialPrev = $('tutorialPrev');
    els.tutorialNext = $('tutorialNext');
    els.tutorialSkip = $('tutorialSkip');
    els.btnShowTutorial = $('btnShowTutorial');
  }

  XOApp.state = state;
  XOApp.els = els;
  XOApp.helpState = helpState;
  XOApp.settingsTabState = settingsTabState;
  XOApp.collapseState = collapseState;
  XOApp.initEls = initEls;
})();
