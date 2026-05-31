(function () {
  'use strict';

  var XOApp = window.XOApp;
  var state = XOApp.state;
  var els = XOApp.els;

  var {
    BOARD_SIZE,
    PLAYER_X,
    PLAYER_O,
    MODE_FUN,
    isCellFrozen,
    isPiecePersist,
    getPieceDisplayCount,
    getPieceAge,
  } = window.XOGame;

  var {
    GAME_MODE_PVP,
    GAME_MODE_PVE,
  } = window.XOAI;

  function createPieceSVG(owner) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';

    var strokeColor = owner === PLAYER_X ? 'var(--color-player-x)' : 'var(--color-player-o)';
    var strokeWidth = 10;

    if (owner === PLAYER_X) {
      var line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', '20');
      line1.setAttribute('y1', '20');
      line1.setAttribute('x2', '80');
      line1.setAttribute('y2', '80');
      line1.setAttribute('stroke', strokeColor);
      line1.setAttribute('stroke-width', strokeWidth);
      line1.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line1);

      var line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', '80');
      line2.setAttribute('y1', '20');
      line2.setAttribute('x2', '20');
      line2.setAttribute('y2', '80');
      line2.setAttribute('stroke', strokeColor);
      line2.setAttribute('stroke-width', strokeWidth);
      line2.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line2);
    } else {
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
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
    var board = els.board;
    board.innerHTML = '';
    var winningPositions = new Set();
    for (var li = 0; li < state.game.winningLines.length; li++) {
      var line = state.game.winningLines[li];
      for (var ci = 0; ci < line.length; ci++) {
        winningPositions.add(line[ci][0] + ',' + line[ci][1]);
      }
    }

    for (var r = 0; r < BOARD_SIZE; r++) {
      for (var c = 0; c < BOARD_SIZE; c++) {
        var cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        var piece = state.game.board[r][c];
        var frozen = isCellFrozen(state.game, r, c);
        var winning = winningPositions.has(r + ',' + c);

        if (frozen) {
          var owner = state.game.freeze.owner;
          cell.classList.add('frozen');
          cell.classList.add(owner === PLAYER_X ? 'frozen-x' : 'frozen-o');
          var lock = document.createElement('span');
          lock.className = 'freeze-icon ' + (owner === PLAYER_X ? 'player-x' : 'player-o');
          lock.textContent = '🔒';
          cell.appendChild(lock);
        }

        if (winning) {
          cell.classList.add('winning');
        }

        if (piece) {
          var pieceWrap = document.createElement('span');
          pieceWrap.className = 'piece player-' + (piece.owner === PLAYER_X ? 'x' : 'o') + ' ' + getPieceAge(state.game, piece);
          var svg = createPieceSVG(piece.owner);
          pieceWrap.appendChild(svg);
          cell.appendChild(pieceWrap);

          var persist = isPiecePersist(state.game, r, c);
          if (persist) {
            var persistIcon = document.createElement('span');
            persistIcon.className = 'persist-icon';
            persistIcon.textContent = '⏳';
            cell.appendChild(persistIcon);
          }

          var order = getPieceDisplayCount(state.game, piece);
          if (order > 0) {
            var orderEl = document.createElement('span');
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
    var cells = els.board.querySelectorAll('.cell');
    cells.forEach(function (cell) {
      var row = parseInt(cell.dataset.row, 10);
      var col = parseInt(cell.dataset.col, 10);

      cell.addEventListener('mouseenter', function () { handleCellHover(row, col, cell, true); });
      cell.addEventListener('mouseleave', function () { handleCellHover(row, col, cell, false); });
      cell.addEventListener('click', function () { XOApp.handleCellClick(row, col); });
    });
  }

  function handleCellHover(row, col, cell, isEnter) {
    var game = state.game;
    var piece = game.board[row][col];
    var frozen = isCellFrozen(game, row, col);

    cell.classList.remove('hover', 'freeze-hover', 'disabled');
    var existingPreview = cell.querySelector('.piece.preview');
    if (existingPreview) existingPreview.remove();

    if (game.gameOver) return;

    if (!state.tutorial.active) {
      if (state.ai && state.ai.player === GAME_MODE_PVE && state.ai.thinking) return;
      if (state.ai && state.ai.player === GAME_MODE_PVE && game.currentPlayer === state.ai.aiPlayer) return;
    }

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
      var preview = document.createElement('span');
      preview.className = 'piece preview player-' + (game.currentPlayer === PLAYER_X ? 'x' : 'o');
      var svg = createPieceSVG(game.currentPlayer);
      preview.appendChild(svg);
      cell.appendChild(preview);
    }
  }

  function renderStatus() {
    var game = state.game;
    var text = '轮到 ' + game.currentPlayer + ' 方';

    if (state.ai && state.ai.player === GAME_MODE_PVE) {
      if (state.ai.thinking) {
        text = 'AI思考中...';
      } else if (game.currentPlayer === state.ai.aiPlayer) {
        text = 'AI回合 (' + game.currentPlayer + ')';
      } else {
        text = '你的回合 (' + game.currentPlayer + ')';
      }
    }

    els.statusText.textContent = text;
    els.statusText.classList.remove('player-x', 'player-o');
    els.statusText.classList.add(game.currentPlayer === PLAYER_X ? 'player-x' : 'player-o');
  }

  function renderMode() {
    var game = state.game;
    var modeText = game.gameMode === MODE_FUN ? '趣味模式' : '常规模式';

    if (state.ai && state.ai.player === GAME_MODE_PVP) {
      modeText = game.gameMode === MODE_FUN ? '趣味模式' : '常规模式';
    } else if (state.ai && state.ai.player === GAME_MODE_PVE) {
      var difficultyText = '';
      if (state.ai.difficulty === 'easy') difficultyText = '初级';
      else if (state.ai.difficulty === 'medium') difficultyText = '中级';
      else if (state.ai.difficulty === 'hard') difficultyText = '高级';
      modeText = '人机对战 · ' + difficultyText;
    }

    els.titleMode.textContent = modeText;
    els.titleMode.classList.toggle('fun-mode', game.gameMode === MODE_FUN);
    els.btnMode.classList.toggle('active-mode', game.gameMode === MODE_FUN);
    els.btnAI.classList.toggle('active-mode', state.ai && state.ai.player === GAME_MODE_PVE);
  }

  function renderPanels() {
    var game = state.game;
    var isFun = game.gameMode === MODE_FUN;
    els.panelX.hidden = !isFun;
    els.panelO.hidden = !isFun;

    if (!isFun) {
      els.btnUndo.hidden = false;
      els.btnUndo.disabled = state.history.length === 0 || game.gameOver;
      return;
    }

    els.btnUndo.hidden = true;
    var lastPlayer = game.lastPlayer;
    var waiting = game.waitingForFreezeTarget;

    var abilitiesX = game.funAbilities.X;
    var abilitiesO = game.funAbilities.O;

    els.countUndoX.textContent = abilitiesX.undo;
    els.countUndoO.textContent = abilitiesO.undo;
    els.countFreezeX.textContent = abilitiesX.freeze;
    els.countFreezeO.textContent = abilitiesO.freeze;
    els.countPersistX.textContent = abilitiesX.persist;
    els.countPersistO.textContent = abilitiesO.persist;

    var canUndoX = lastPlayer === PLAYER_X && abilitiesX.undo > 0 && !waiting && state.history.length > 0 && !game.gameOver;
    var canUndoO = lastPlayer === PLAYER_O && abilitiesO.undo > 0 && !waiting && state.history.length > 0 && !game.gameOver;
    var canFreezeX = (abilitiesX.freeze > 0 && !waiting && !game.gameOver) || (waiting && state.freezeInitiator === PLAYER_X);
    var canFreezeO = (abilitiesO.freeze > 0 && !waiting && !game.gameOver) || (waiting && state.freezeInitiator === PLAYER_O);
    var canPersistX = (abilitiesX.persist > 0 && !game.persistActive[PLAYER_X] && !game.gameOver && game.currentPlayer === PLAYER_X) || game.persistActive[PLAYER_X];
    var canPersistO = (abilitiesO.persist > 0 && !game.persistActive[PLAYER_O] && !game.gameOver && game.currentPlayer === PLAYER_O) || game.persistActive[PLAYER_O];

    els.btnUndoX.disabled = !canUndoX;
    els.btnUndoO.disabled = !canUndoO;
    els.btnFreezeX.disabled = !canFreezeX;
    els.btnFreezeO.disabled = !canFreezeO;
    els.btnPersistX.disabled = !canPersistX;
    els.btnPersistO.disabled = !canPersistO;

    els.btnFreezeX.classList.toggle('active', waiting && state.freezeInitiator === PLAYER_X);
    els.btnFreezeO.classList.toggle('active', waiting && state.freezeInitiator === PLAYER_O);
    els.btnPersistX.classList.toggle('active', game.persistActive[PLAYER_X]);
    els.btnPersistO.classList.toggle('active', game.persistActive[PLAYER_O]);

    var freezeActiveX = waiting && state.freezeInitiator === PLAYER_X;
    var freezeActiveO = waiting && state.freezeInitiator === PLAYER_O;
    var persistActiveX = game.persistActive[PLAYER_X];
    var persistActiveO = game.persistActive[PLAYER_O];

    els.btnFreezeX.title = freezeActiveX ? '再次点击可取消使用' : '固定：选择一个空格子，对方无法在此落子';
    els.btnFreezeO.title = freezeActiveO ? '再次点击可取消使用' : '固定：选择一个空格子，对方无法在此落子';
    els.btnPersistX.title = persistActiveX ? '再次点击可取消使用' : '保留：下一步落子将保留五个回合';
    els.btnPersistO.title = persistActiveO ? '再次点击可取消使用' : '保留：下一步落子将保留五个回合';
    els.btnFreezeX.setAttribute('title', els.btnFreezeX.title);
    els.btnFreezeO.setAttribute('title', els.btnFreezeO.title);
    els.btnPersistX.setAttribute('title', els.btnPersistX.title);
    els.btnPersistO.setAttribute('title', els.btnPersistO.title);

    els.panelX.classList.toggle('active-x', game.currentPlayer === PLAYER_X);
    els.panelX.classList.toggle('active-o', false);
    els.panelO.classList.toggle('active-o', game.currentPlayer === PLAYER_O);
    els.panelO.classList.toggle('active-x', false);
  }

  function renderFreezeHint() {
    els.freezeHint.hidden = !state.game.waitingForFreezeTarget;
  }

  function renderPersistHint() {
    var persistActiveX = state.game.persistActive[PLAYER_X];
    var persistActiveO = state.game.persistActive[PLAYER_O];
    els.persistHint.hidden = !persistActiveX && !persistActiveO;
  }

  function render() {
    renderBoard();
    renderStatus();
    renderMode();
    renderPanels();
    renderFreezeHint();
    renderPersistHint();
  }

  XOApp.createPieceSVG = createPieceSVG;
  XOApp.render = render;
  XOApp.renderBoard = renderBoard;
  XOApp.renderStatus = renderStatus;
  XOApp.renderMode = renderMode;
  XOApp.renderPanels = renderPanels;
})();
