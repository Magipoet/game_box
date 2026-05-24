(function (global) {
  'use strict';

  const {
    BOARD_SIZE,
    PLAYER_X,
    PLAYER_O,
    MODE_NORMAL,
    MODE_FUN,
    createInitialState,
    makeMove,
    useFunUndo,
    startFreezeSelection,
    cancelFreezeSelection,
    setFreezeTarget,
    isCellFrozen,
    getRelativeOrder,
    getPieceAge,
    getWinningLines,
  } = global.XOGame;

  const state = {
    game: createInitialState(MODE_NORMAL),
    history: [],
    freezeInitiator: null,
    settings: {
      boardSize: 'standard',
      pieceSize: 'standard',
      theme: localStorage.getItem('xando-theme') || 'classic',
    },
  };

  const els = {};

  const helpState = {
    current: 0,
    totalPages: 3,
    scrollDir: 0,
    scrollTimer: null,
  };

  const settingsTabState = {
    current: 'basic',
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
    els.statusText = $('statusText');
    els.freezeHint = $('freezeHint');
    els.btnCancelFreeze = $('btnCancelFreeze');
    els.board = $('board');
    els.panelX = $('panelX');
    els.panelO = $('panelO');
    els.btnUndoX = $('btnUndoX');
    els.btnUndoO = $('btnUndoO');
    els.btnFreezeX = $('btnFreezeX');
    els.btnFreezeO = $('btnFreezeO');
    els.countUndoX = $('countUndoX');
    els.countUndoO = $('countUndoO');
    els.countFreezeX = $('countFreezeX');
    els.countFreezeO = $('countFreezeO');
    els.btnUndo = $('btnUndo');
    els.btnReset = $('btnReset');
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
  }

  function createPieceSVG(owner) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';

    const strokeColor = owner === PLAYER_X ? 'var(--color-player-x)' : 'var(--color-player-o)';
    const strokeWidth = 10;

    if (owner === PLAYER_X) {
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', '20');
      line1.setAttribute('y1', '20');
      line1.setAttribute('x2', '80');
      line1.setAttribute('y2', '80');
      line1.setAttribute('stroke', strokeColor);
      line1.setAttribute('stroke-width', strokeWidth);
      line1.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line1);

      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', '80');
      line2.setAttribute('y1', '20');
      line2.setAttribute('x2', '20');
      line2.setAttribute('y2', '80');
      line2.setAttribute('stroke', strokeColor);
      line2.setAttribute('stroke-width', strokeWidth);
      line2.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line2);
    } else {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '50');
      circle.setAttribute('cy', '50');
      circle.setAttribute('r', '32');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', strokeWidth);
      svg.appendChild(circle);
    }

    return svg;
  }

  function renderBoard() {
    const board = els.board;
    board.innerHTML = '';
    const winningPositions = new Set();
    for (const line of state.game.winningLines) {
      for (const [r, c] of line) {
        winningPositions.add(r + ',' + c);
      }
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        const piece = state.game.board[r][c];
        const frozen = isCellFrozen(state.game, r, c);
        const winning = winningPositions.has(r + ',' + c);

        if (frozen) {
          const owner = state.game.freeze.owner;
          cell.classList.add('frozen');
          cell.classList.add(owner === PLAYER_X ? 'frozen-x' : 'frozen-o');
          const lock = document.createElement('span');
          lock.className = 'freeze-icon ' + (owner === PLAYER_X ? 'player-x' : 'player-o');
          lock.textContent = '🔒';
          cell.appendChild(lock);
        }

        if (winning) {
          cell.classList.add('winning');
        }

        if (piece) {
          const pieceWrap = document.createElement('span');
          pieceWrap.className = 'piece player-' + (piece.owner === PLAYER_X ? 'x' : 'o') + ' ' + getPieceAge(state.game, piece);
          const svg = createPieceSVG(piece.owner);
          pieceWrap.appendChild(svg);
          cell.appendChild(pieceWrap);

          const order = getRelativeOrder(state.game, piece);
          if (order > 0) {
            const orderEl = document.createElement('span');
            orderEl.className = 'order-num';
            orderEl.style.color = piece.owner === PLAYER_X ? 'var(--color-player-x)' : 'var(--color-player-o)';
            orderEl.textContent = order;
            cell.appendChild(orderEl);
          }
        }

        board.appendChild(cell);
      }
    }

    attachCellEvents();
  }

  function attachCellEvents() {
    const cells = els.board.querySelectorAll('.cell');
    cells.forEach((cell) => {
      const row = parseInt(cell.dataset.row, 10);
      const col = parseInt(cell.dataset.col, 10);

      cell.addEventListener('mouseenter', () => handleCellHover(row, col, cell, true));
      cell.addEventListener('mouseleave', () => handleCellHover(row, col, cell, false));
      cell.addEventListener('click', () => handleCellClick(row, col));
    });
  }

  function handleCellHover(row, col, cell, isEnter) {
    const game = state.game;
    const piece = game.board[row][col];
    const frozen = isCellFrozen(game, row, col);

    cell.classList.remove('hover', 'freeze-hover');
    const existingPreview = cell.querySelector('.piece.preview');
    if (existingPreview) existingPreview.remove();

    if (game.gameOver) return;

    if (game.waitingForFreezeTarget) {
      if (!piece && isEnter) {
        cell.classList.add('freeze-hover');
      }
      return;
    }

    if (piece || frozen) {
      if (isEnter && !frozen) {
        cell.classList.add('disabled');
      }
      return;
    }

    if (isEnter) {
      cell.classList.add('hover');
      const preview = document.createElement('span');
      preview.className = 'piece preview player-' + (game.currentPlayer === PLAYER_X ? 'x' : 'o');
      const svg = createPieceSVG(game.currentPlayer);
      preview.appendChild(svg);
      cell.appendChild(preview);
    }
  }

  function handleCellClick(row, col) {
    const game = state.game;
    if (game.gameOver) return;

    if (game.waitingForFreezeTarget) {
      if (game.board[row][col]) return;
      const initiator = state.freezeInitiator;
      if (!initiator) return;
      state.game = setFreezeTarget(game, row, col, initiator);
      state.freezeInitiator = null;
      render();
      return;
    }

    if (game.board[row][col]) return;
    if (isCellFrozen(game, row, col)) return;

    state.history.push(game);
    state.game = makeMove(game, row, col);
    render();
    checkWin();
  }

  function checkWin() {
    if (state.game.gameOver && state.game.winner) {
      setTimeout(() => {
        els.winTitle.textContent = state.game.winner + ' 方获胜！';
        showModal(els.winModal);
      }, 300);
    }
  }

  function renderStatus() {
    const game = state.game;
    els.statusText.textContent = '轮到 ' + game.currentPlayer + ' 方';
    els.statusText.classList.remove('player-x', 'player-o');
    els.statusText.classList.add(game.currentPlayer === PLAYER_X ? 'player-x' : 'player-o');
  }

  function renderMode() {
    const game = state.game;
    els.titleMode.textContent = game.gameMode === MODE_FUN ? '趣味模式' : '常规模式';
    els.titleMode.classList.toggle('fun-mode', game.gameMode === MODE_FUN);
    els.btnMode.classList.toggle('active-mode', game.gameMode === MODE_FUN);
  }

  function renderPanels() {
    const game = state.game;
    const isFun = game.gameMode === MODE_FUN;
    els.panelX.hidden = !isFun;
    els.panelO.hidden = !isFun;

    if (!isFun) {
      els.btnUndo.hidden = false;
      els.btnUndo.disabled = state.history.length === 0 || game.gameOver;
      return;
    }

    els.btnUndo.hidden = true;
    const lastPlayer = game.lastPlayer;
    const waiting = game.waitingForFreezeTarget;

    const abilitiesX = game.funAbilities.X;
    const abilitiesO = game.funAbilities.O;

    els.countUndoX.textContent = abilitiesX.undo;
    els.countUndoO.textContent = abilitiesO.undo;
    els.countFreezeX.textContent = abilitiesX.freeze;
    els.countFreezeO.textContent = abilitiesO.freeze;

    const canUndoX = lastPlayer === PLAYER_X && abilitiesX.undo > 0 && !waiting && state.history.length > 0 && !game.gameOver;
    const canUndoO = lastPlayer === PLAYER_O && abilitiesO.undo > 0 && !waiting && state.history.length > 0 && !game.gameOver;
    const canFreezeX = abilitiesX.freeze > 0 && !waiting && !game.gameOver;
    const canFreezeO = abilitiesO.freeze > 0 && !waiting && !game.gameOver;

    els.btnUndoX.disabled = !canUndoX;
    els.btnUndoO.disabled = !canUndoO;
    els.btnFreezeX.disabled = !canFreezeX;
    els.btnFreezeO.disabled = !canFreezeO;

    els.btnFreezeX.classList.toggle('active', waiting && state.freezeInitiator === PLAYER_X);
    els.btnFreezeO.classList.toggle('active', waiting && state.freezeInitiator === PLAYER_O);

    els.panelX.classList.toggle('active-x', game.currentPlayer === PLAYER_X);
    els.panelX.classList.toggle('active-o', false);
    els.panelO.classList.toggle('active-o', game.currentPlayer === PLAYER_O);
    els.panelO.classList.toggle('active-x', false);
  }

  function renderFreezeHint() {
    els.freezeHint.hidden = !state.game.waitingForFreezeTarget;
  }

  function render() {
    renderBoard();
    renderStatus();
    renderMode();
    renderPanels();
    renderFreezeHint();
  }

  function resetGame(mode) {
    state.history = [];
    state.freezeInitiator = null;
    state.game = createInitialState(mode || state.game.gameMode);
    hideModal(els.winModal);
    render();
  }

  function showModal(modal) {
    modal.hidden = false;
  }

  function hideModal(modal) {
    modal.hidden = true;
  }

  function showHelpModal() {
    helpState.current = 0;
    renderHelpPage();
    showModal(els.helpModal);
    els.helpPagesContainer.scrollTop = 0;
  }

  function renderHelpPage() {
    els.helpPages.forEach((page, idx) => {
      page.classList.toggle('active', idx === helpState.current);
    });

    els.helpPrev.disabled = helpState.current === 0;

    els.helpDots.innerHTML = '';
    for (let i = 0; i < helpState.totalPages; i++) {
      const dot = document.createElement('span');
      dot.className = 'help-dot' + (i === helpState.current ? ' active' : '');
      els.helpDots.appendChild(dot);
    }

    els.helpPagesContainer.scrollTop = 0;
  }

  function helpPrevPage() {
    if (helpState.current > 0) {
      helpState.current--;
      renderHelpPage();
    }
  }

  function helpNextPage() {
    if (helpState.current < helpState.totalPages - 1) {
      helpState.current++;
      renderHelpPage();
    } else {
      hideModal(els.helpModal);
    }
  }

  function bindEvents() {
    els.btnReset.addEventListener('click', () => resetGame());

    els.btnUndo.addEventListener('click', () => {
      if (state.history.length === 0 || state.game.gameOver) return;
      state.game = state.history.pop();
      render();
    });

    els.btnUndoX.addEventListener('click', () => doFunUndo(PLAYER_X));
    els.btnUndoO.addEventListener('click', () => doFunUndo(PLAYER_O));

    els.btnFreezeX.addEventListener('click', () => toggleFreeze(PLAYER_X));
    els.btnFreezeO.addEventListener('click', () => toggleFreeze(PLAYER_O));

    els.btnCancelFreeze.addEventListener('click', () => {
      state.game = cancelFreezeSelection(state.game);
      state.freezeInitiator = null;
      render();
    });

    els.btnMode.addEventListener('click', () => {
      updateModeTiles();
      showModal(els.modeModal);
    });

    document.querySelectorAll('.mode-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        const mode = tile.dataset.mode;
        resetGame(mode);
        hideModal(els.modeModal);
      });
    });

    els.modeModal.querySelector('.modal-mask').addEventListener('click', () => hideModal(els.modeModal));

    els.btnHelp.addEventListener('click', () => {
      showHelpModal();
    });
    els.helpModal.querySelectorAll('[data-close]').forEach((el) =>
      el.addEventListener('click', () => hideModal(els.helpModal))
    );
    els.helpPrev.addEventListener('click', () => helpPrevPage());
    els.helpNext.addEventListener('click', () => helpNextPage());

    const HELP_SCROLL_STEP = 3;

    function stopHelpScroll() {
      if (helpState.scrollTimer) {
        cancelAnimationFrame(helpState.scrollTimer);
        helpState.scrollTimer = null;
      }
      helpState.scrollDir = 0;
    }

    function tickHelpScroll() {
      els.helpPagesContainer.scrollTop += helpState.scrollDir * HELP_SCROLL_STEP;
      helpState.scrollTimer = requestAnimationFrame(tickHelpScroll);
    }

    function startHelpScroll(dir) {
      if (helpState.scrollDir === dir && helpState.scrollTimer) return;
      stopHelpScroll();
      helpState.scrollDir = dir;
      helpState.scrollTimer = requestAnimationFrame(tickHelpScroll);
    }

    document.addEventListener('keydown', (e) => {
      if (els.helpModal.hidden) return;
      if (e.key === 'ArrowLeft') {
        helpPrevPage();
      } else if (e.key === 'ArrowRight') {
        helpNextPage();
      } else if (e.key === 'ArrowUp') {
        if (e.repeat) return;
        e.preventDefault();
        startHelpScroll(-1);
      } else if (e.key === 'ArrowDown') {
        if (e.repeat) return;
        e.preventDefault();
        startHelpScroll(1);
      } else if (e.key === 'Escape') {
        hideModal(els.helpModal);
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        stopHelpScroll();
      }
    });

    els.btnWinClose.addEventListener('click', () => {
      resetGame();
    });
    els.winModal.querySelector('.modal-mask').addEventListener('click', () => hideModal(els.winModal));

    els.btnSettings.addEventListener('click', () => {
      updateOptionButtons();
      switchSettingsTab('basic');
      showModal(els.settingsModal);
    });
    els.settingsModal.querySelectorAll('[data-close]').forEach((el) =>
      el.addEventListener('click', () => hideModal(els.settingsModal))
    );

    els.settingsTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        switchSettingsTab(tab.dataset.settingsTab);
      });
    });

    els.optionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const setting = btn.dataset.setting;
        const value = btn.dataset.value;
        state.settings[setting] = value;
        updateOptionButtons();
        applySettings();
      });
    });

    window.addEventListener('resize', () => {
      applyBoardSize();
    });
  }

  function updateOptionButtons() {
    els.optionBtns.forEach((btn) => {
      const setting = btn.dataset.setting;
      const value = btn.dataset.value;
      btn.classList.toggle('selected', state.settings[setting] === value);
    });
  }

  function switchSettingsTab(tabName) {
    settingsTabState.current = tabName;
    els.settingsTabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.settingsTab === tabName);
    });
    els.settingsPages.forEach((page) => {
      page.classList.toggle('active', page.dataset.settingsPage === tabName);
    });
  }

  function updateModeTiles() {
    document.querySelectorAll('.mode-tile').forEach((tile) => {
      const mode = tile.dataset.mode;
      tile.classList.toggle('selected', mode === state.game.gameMode);
      tile.classList.remove('normal', 'fun');
      tile.classList.add(mode);
    });
  }

  function doFunUndo(player) {
    if (state.game.gameMode !== MODE_FUN) return;
    if (state.history.length === 0 || state.game.gameOver) return;
    if (state.game.lastPlayer !== player) return;
    if (state.game.funAbilities[player].undo <= 0) return;

    const prevState = state.history[state.history.length - 1];
    state.history.pop();
    state.game = useFunUndo(state.game, prevState);
    render();
  }

  function toggleFreeze(player) {
    if (state.game.gameMode !== MODE_FUN) return;
    if (state.game.gameOver) return;

    if (state.game.waitingForFreezeTarget) {
      if (state.freezeInitiator === player) {
        state.game = cancelFreezeSelection(state.game);
        state.freezeInitiator = null;
        render();
      }
      return;
    }

    if (state.game.funAbilities[player].freeze <= 0) return;
    state.game = startFreezeSelection(state.game, player);
    state.freezeInitiator = player;
    render();
  }

  function applyBoardSize() {
    const scale = state.settings.boardSize === 'large' ? 1.25 : 1;
    document.documentElement.style.setProperty('--board-size-scale', scale);
  }

  function applyPieceSize() {
    const ratios = { small: 0.33, standard: 0.5, large: 0.66 };
    const ratio = ratios[state.settings.pieceSize] || 0.5;
    document.documentElement.style.setProperty('--piece-size-ratio', ratio);
  }

  function applyTheme() {
    const theme = state.settings.theme || 'classic';
    if (theme === 'classic') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('xando-theme', theme);
  }

  function applySettings() {
    applyBoardSize();
    applyPieceSize();
    applyTheme();
  }

  function init() {
    initEls();
    bindEvents();
    applySettings();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
