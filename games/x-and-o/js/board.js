(function () {
  'use strict';

  var XOApp = window.XOApp;
  var state = XOApp.state;
  var els = XOApp.els;
  var helpState = XOApp.helpState;
  var settingsTabState = XOApp.settingsTabState;
  var collapseState = XOApp.collapseState;

  var {
    PLAYER_X,
    PLAYER_O,
    MODE_FUN,
    createInitialState,
    makeMove,
    useFunUndo,
    startFreezeSelection,
    cancelFreezeSelection,
    setFreezeTarget,
    usePersist,
    cancelPersist,
    isCellFrozen,
  } = window.XOGame;

  var {
    GAME_MODE_PVP,
    GAME_MODE_PVE,
    DIFFICULTY_EASY,
    DIFFICULTY_MEDIUM,
    DIFFICULTY_HARD,
    triggerAIMove,
  } = window.XOAI;

  function showModal(modal) {
    modal.hidden = false;
  }

  function hideModal(modal) {
    modal.hidden = true;
  }

  function initAISettings() {
    state.ai.player = state.settings.gameMode;
    state.ai.difficulty = state.settings.aiDifficulty;
    if (state.settings.gameMode === GAME_MODE_PVP) {
      state.ai.aiPlayer = null;
      state.ai.humanPlayer = null;
    } else if (state.settings.aiFirstMove === 'player') {
      state.ai.humanPlayer = PLAYER_X;
      state.ai.aiPlayer = PLAYER_O;
    } else {
      state.ai.humanPlayer = PLAYER_O;
      state.ai.aiPlayer = PLAYER_X;
    }
    state.ai.thinking = false;
  }

  function resetGame(mode) {
    state.history = [];
    state.freezeInitiator = null;
    state.game = createInitialState(mode || state.game.gameMode);
    hideModal(els.winModal);
    initAISettings();
    XOApp.render();

    if (state.ai.player === GAME_MODE_PVE && state.ai.aiPlayer === PLAYER_X) {
      setTimeout(function () {
        triggerAIMoveIfNeeded();
      }, 300);
    }
  }

  function triggerAIMoveIfNeeded() {
    if (state.ai.player !== GAME_MODE_PVE) return;
    if (state.game.gameOver) return;
    if (state.game.currentPlayer !== state.ai.aiPlayer) return;
    if (state.ai.thinking) return;

    state.ai.thinking = true;
    XOApp.render();

    triggerAIMove(state.game, state.ai.difficulty, state.ai.aiPlayer, function (row, col) {
      state.history.push(state.game);
      state.game = makeMove(state.game, row, col);
      state.ai.thinking = false;
      XOApp.render();
      checkWin();
      if (!state.game.gameOver && state.game.currentPlayer === state.ai.aiPlayer) {
        setTimeout(triggerAIMoveIfNeeded, 300);
      }
    }, 500);
  }

  function checkWin() {
    if (state.game.gameOver && state.game.winner) {
      setTimeout(function () {
        els.winTitle.textContent = state.game.winner + ' 方获胜！';
        showModal(els.winModal);
      }, 300);
    }
  }

  function handleCellClick(row, col) {
    if (state.tutorial.active && state.tutorial.freezeStage === 3) {
      if (state.tutorial.waitingForInteraction && state.tutorial.interactionCell) {
        if (row === state.tutorial.interactionCell[0] && col === state.tutorial.interactionCell[1]) {
          state.tutorial.freezeStage = 0;
          state.tutorial.waitingForInteraction = false;
          state.tutorial.interactionCell = null;
          state.tutorial.freezeTriedFrozenCell = true;
          XOApp.hideTutorialCellGuide();
          els.tutorialOverlay.classList.remove('interaction-mode');
          XOApp.render();
          setTimeout(function () {
            XOApp.tutorialNext();
          }, 800);
          return;
        }
      }
      return;
    }

    var game = state.game;
    if (game.gameOver) return;

    if (!state.tutorial.active) {
      if (state.ai.player === GAME_MODE_PVE && state.ai.thinking) return;
      if (state.ai.player === GAME_MODE_PVE && game.currentPlayer === state.ai.aiPlayer) return;
    }

    if (state.tutorial.active && state.tutorial.waitingForInteraction) {
      if (!state.tutorial.interactionCell) return;
      if (row !== state.tutorial.interactionCell[0] || col !== state.tutorial.interactionCell[1]) {
        return;
      }
    }

    if (state.game.waitingForFreezeTarget) {
      if (state.game.board[row][col]) return;

      var initiator = state.freezeInitiator;
      if (!initiator) return;

      state.game = setFreezeTarget(state.game, row, col, initiator);
      state.freezeInitiator = null;

      if (state.tutorial.active && state.tutorial.freezeStage === 2) {
        state.tutorial.freezeStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.interactionCell = null;
        state.tutorial.freezeCell = [row, col];
        state.game.currentPlayer = PLAYER_O;
        XOApp.hideTutorialCellGuide();
        els.tutorialOverlay.classList.remove('interaction-mode');
        XOApp.render();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 800);
        return;
      }

      XOApp.render();
      return;
    }

    if (state.game.board[row][col]) return;

    if (isCellFrozen(state.game, row, col)) return;

    var animateFreezeDisappear = false;
    var freezeDisappearRow = null;
    var freezeDisappearCol = null;
    var freezeCellHTML = '';
    if (state.tutorial.active && state.tutorial.animateFreezeDisappear && state.tutorial.freezeDisappearCell && state.tutorial.freezeStage === 4) {
      freezeDisappearRow = state.tutorial.freezeDisappearCell[0];
      freezeDisappearCol = state.tutorial.freezeDisappearCell[1];
      var freezeCellEl = els.board.querySelector('.cell[data-row="' + freezeDisappearRow + '"][data-col="' + freezeDisappearCol + '"]');
      if (freezeCellEl) {
        freezeCellHTML = freezeCellEl.innerHTML;
      }
      animateFreezeDisappear = true;
    }

    state.history.push(game);
    state.game = makeMove(game, row, col);

    if (state.tutorial.active && state.tutorial.animateDisappear && state.tutorial.disappearCell) {
      var disappearRow = state.tutorial.disappearCell[0];
      var disappearCol = state.tutorial.disappearCell[1];
      var disappearCellEl = els.board.querySelector('.cell[data-row="' + disappearRow + '"][data-col="' + disappearCol + '"]');
      var oldPieceHTML = disappearCellEl ? disappearCellEl.innerHTML : '';

      if (window.innerWidth <= 800 && XOApp.moveDynamicStepTooltipDown) {
        XOApp.moveDynamicStepTooltipDown();
      }

      XOApp.render();

      if (oldPieceHTML) {
        var newCellEl = els.board.querySelector('.cell[data-row="' + disappearRow + '"][data-col="' + disappearCol + '"]');
        if (newCellEl) {
          newCellEl.innerHTML = oldPieceHTML;
          var pieceEl = newCellEl.querySelector('.piece');
          if (pieceEl) {
            pieceEl.classList.add('piece-disappear');
          }
        }
      }

      state.tutorial.animateDisappear = false;
      state.tutorial.disappearCell = null;
      state.tutorial.waitingForInteraction = false;
      state.tutorial.interactionCell = null;
      XOApp.hideTutorialCellGuide();

      setTimeout(function () {
        XOApp.render();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 500);
      }, 1000);
      return;
    }

    if (animateFreezeDisappear && freezeCellHTML) {
      var newFreezeCellEl = els.board.querySelector('.cell[data-row="' + freezeDisappearRow + '"][data-col="' + freezeDisappearCol + '"]');
      if (newFreezeCellEl) {
        newFreezeCellEl.innerHTML = freezeCellHTML;
        newFreezeCellEl.classList.add('freeze-disappear');
      }

      state.tutorial.animateFreezeDisappear = false;
      state.tutorial.freezeDisappearCell = null;
      state.tutorial.freezeStage = 0;
      state.tutorial.waitingForInteraction = false;
      state.tutorial.interactionCell = null;
      state.tutorial.allowedButton = null;
      XOApp.hideTutorialCellGuide();

      setTimeout(function () {
        XOApp.render();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 500);
      }, 1000);
      return;
    }

    var animatePersistDisappear = false;
    var persistDisappearRow = null;
    var persistDisappearCol = null;
    var persistOldHTML = '';
    if (state.tutorial.active && state.tutorial.animatePersistDisappear && state.tutorial.persistDisappearCell) {
      persistDisappearRow = state.tutorial.persistDisappearCell[0];
      persistDisappearCol = state.tutorial.persistDisappearCell[1];
      var persistCellEl = els.board.querySelector('.cell[data-row="' + persistDisappearRow + '"][data-col="' + persistDisappearCol + '"]');
      if (persistCellEl) {
        persistOldHTML = persistCellEl.innerHTML;
      }
      animatePersistDisappear = true;
    }

    XOApp.render();

    if (animatePersistDisappear && persistOldHTML) {
      var newPersistCellEl = els.board.querySelector('.cell[data-row="' + persistDisappearRow + '"][data-col="' + persistDisappearCol + '"]');
      if (newPersistCellEl) {
        newPersistCellEl.innerHTML = persistOldHTML;
        var persistPieceEl = newPersistCellEl.querySelector('.piece');
        if (persistPieceEl) {
          persistPieceEl.classList.add('piece-disappear');
        }
      }

      state.tutorial.animatePersistDisappear = false;
      state.tutorial.persistDisappearCell = null;
      state.tutorial.persistStage = 0;
      state.tutorial.waitingForInteraction = false;
      state.tutorial.interactionCell = null;
      XOApp.hideTutorialCellGuide();

      setTimeout(function () {
        XOApp.render();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 500);
      }, 1000);
      return;
    }

    XOApp.render();

    if (!state.tutorial.active && state.ai.player === GAME_MODE_PVE && !state.game.gameOver) {
      setTimeout(triggerAIMoveIfNeeded, 300);
    }

    if (state.tutorial.active && state.tutorial.waitingForInteraction) {
      if (state.tutorial.isWinStep) {
        state.tutorial.waitingForInteraction = false;
        state.tutorial.interactionCell = null;
        state.tutorial.isWinStep = false;
        state.tutorial.pausedForWinModal = true;
        els.tutorialOverlay.classList.remove('interaction-mode');
        XOApp.hideTutorialCellGuide();
        els.tutorialOverlay.hidden = true;
        setTimeout(function () {
          els.winTitle.textContent = state.game.winner + ' 方获胜！';
          els.btnWinClose.textContent = '继续教程';
          showModal(els.winModal);
        }, 500);
      } else if (state.tutorial.currentStep === 3) {
        state.tutorial.waitingForInteraction = false;
        state.tutorial.interactionCell = null;
        els.tutorialOverlay.classList.remove('interaction-mode');
        XOApp.hideTutorialCellGuide();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 800);
      } else if (state.tutorial.currentStep === 7 && state.tutorial.undoStage === 0) {
        state.tutorial.undoStage = 1;
        state.tutorial.interactionCell = null;
        XOApp.hideTutorialCellGuide();
        XOApp.render();
        XOApp.showTutorialUndoGuide();
      } else if (state.tutorial.persistStage === 2) {
        state.tutorial.persistStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.interactionCell = null;
        els.tutorialOverlay.classList.remove('interaction-mode');
        XOApp.hideTutorialCellGuide();
        setTimeout(function () {
          XOApp.startPersistAutoDemo();
        }, 800);
      } else if (state.tutorial.persistStage === 5) {
        state.tutorial.persistStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.interactionCell = null;
        XOApp.hideTutorialCellGuide();
        els.tutorialOverlay.classList.remove('interaction-mode');
        XOApp.render();
        setTimeout(function () {
          state.tutorial.showPersistReminder();
        }, 500);
      } else if (state.tutorial.persistStage === 7) {
        state.tutorial.persistStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.interactionCell = null;
        XOApp.hideTutorialCellGuide();
        var persistCellEl2 = els.board.querySelector('.cell[data-row="2"][data-col="0"]');
        var persistIconEl = persistCellEl2 ? persistCellEl2.querySelector('.persist-icon') : null;
        var persistPieceHTML = persistCellEl2 ? persistCellEl2.innerHTML : '';
        XOApp.render();
        if (persistPieceHTML) {
          var newPersistCell = els.board.querySelector('.cell[data-row="2"][data-col="0"]');
          if (newPersistCell) {
            newPersistCell.innerHTML = persistPieceHTML;
            var newPersistIcon = newPersistCell.querySelector('.persist-icon');
            var newPiece = newPersistCell.querySelector('.piece');
            if (newPersistIcon) {
              newPersistIcon.classList.add('persist-icon-blink');
            }
            if (newPiece) {
              newPiece.classList.add('persist-icon-blink');
            }
            setTimeout(function () {
              XOApp.render();
              if (state.tutorial.persistAutoNextOMove) {
                state.tutorial.persistStepIndex = (state.tutorial.persistStepIndex || 0) + 1;
                setTimeout(function () {
                  state.tutorial.persistAutoNextOMove();
                }, 500);
              }
            }, 1600);
            return;
          }
        }
        if (state.tutorial.persistAutoNextOMove) {
          state.tutorial.persistStepIndex = (state.tutorial.persistStepIndex || 0) + 1;
          setTimeout(function () {
            state.tutorial.persistAutoNextOMove();
          }, 500);
        }
      } else if (state.tutorial.persistStage === 3 || state.tutorial.persistStage === 4 || state.tutorial.persistStage === 6) {
        state.tutorial.persistStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.interactionCell = null;
        XOApp.hideTutorialCellGuide();
        XOApp.render();
        if (state.tutorial.persistAutoNextOMove) {
          state.tutorial.persistStepIndex = (state.tutorial.persistStepIndex || 0) + 1;
          setTimeout(function () {
            state.tutorial.persistAutoNextOMove();
          }, 500);
        }
      }
    } else {
      checkWin();
    }
  }

  function showHelpModal() {
    helpState.current = 0;
    renderHelpPage();
    showModal(els.helpModal);
    els.helpPagesContainer.scrollTop = 0;
  }

  function renderHelpPage() {
    els.helpPages.forEach(function (page, idx) {
      page.classList.toggle('active', idx === helpState.current);
    });

    els.helpPrev.disabled = helpState.current === 0;

    els.helpDots.innerHTML = '';
    for (var i = 0; i < helpState.totalPages; i++) {
      var dot = document.createElement('span');
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
      if (state.tutorial.active && state.tutorial.helpStage === 2) {
        state.tutorial.helpStage = 0;
        els.tutorialOverlay.classList.remove('modal-mode');
        XOApp.tutorialNext();
      }
    }
  }

  function doFunUndo(player) {
    if (state.game.gameMode !== MODE_FUN) return;
    if (state.history.length === 0 || state.game.gameOver) return;
    if (state.game.lastPlayer !== player) return;
    if (state.game.funAbilities[player].undo <= 0) return;

    if (state.tutorial.active && state.tutorial.allowedButton) {
      var btnId = player === PLAYER_X ? '#btnUndoX' : '#btnUndoO';
      if (btnId !== state.tutorial.allowedButton) return;
    }

    var prevState = state.history[state.history.length - 1];

    var undoCellRow = null;
    var undoCellCol = null;
    if (state.tutorial.active && state.tutorial.currentStep === 7 && state.tutorial.undoStage === 1) {
      var order = state.game.pieceOrder[player];
      if (order.length > 0) {
        var target = order[order.length - 1];
        undoCellRow = target.row;
        undoCellCol = target.col;
      }
    }

    state.history.pop();
    state.game = useFunUndo(state.game, prevState);

    if (undoCellRow !== null) {
      var undoCellEl = els.board.querySelector('.cell[data-row="' + undoCellRow + '"][data-col="' + undoCellCol + '"]');
      var oldPieceHTML = undoCellEl ? undoCellEl.innerHTML : '';

      XOApp.render();

      if (oldPieceHTML) {
        var newUndoCellEl = els.board.querySelector('.cell[data-row="' + undoCellRow + '"][data-col="' + undoCellCol + '"]');
        if (newUndoCellEl) {
          newUndoCellEl.innerHTML = oldPieceHTML;
          var pieceEl = newUndoCellEl.querySelector('.piece');
          if (pieceEl) {
            pieceEl.classList.add('piece-disappear');
          }
        }
      }

      state.tutorial.undoStage = 0;
      state.tutorial.waitingForInteraction = false;
      state.tutorial.allowedButton = null;
      XOApp.hideTutorialCellGuide();
      els.tutorialOverlay.classList.remove('interaction-mode');
      els.tutorialOverlay.hidden = true;

      setTimeout(function () {
        XOApp.render();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 500);
      }, 1000);
    } else {
      XOApp.render();

      if (state.tutorial.active && state.tutorial.currentStep === 7 && state.tutorial.undoStage === 1) {
        state.tutorial.undoStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        XOApp.hideTutorialCellGuide();
        els.tutorialOverlay.classList.remove('interaction-mode');
        els.tutorialOverlay.hidden = true;
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 1000);
      }
    }
  }

  function toggleFreeze(player) {
    if (state.game.gameMode !== MODE_FUN) return;
    if (state.game.gameOver) return;

    if (state.tutorial.active && state.tutorial.allowedButton) {
      var btnId = player === PLAYER_X ? '#btnFreezeX' : '#btnFreezeO';
      if (btnId !== state.tutorial.allowedButton) return;
    }

    if (state.game.waitingForFreezeTarget) {
      if (state.freezeInitiator === player) {
        state.game = cancelFreezeSelection(state.game);
        state.freezeInitiator = null;
        if (player === PLAYER_X) {
          els.btnFreezeX.title = '固定：选择一个空格子，对方无法在此落子';
          els.btnFreezeX.setAttribute('title', els.btnFreezeX.title);
        } else {
          els.btnFreezeO.title = '固定：选择一个空格子，对方无法在此落子';
          els.btnFreezeO.setAttribute('title', els.btnFreezeO.title);
        }
        if (state.tutorial.active && state.tutorial.freezeStage === 5 && player === PLAYER_X) {
          state.tutorial.freezeStage = 0;
          state.tutorial.waitingForInteraction = false;
          state.tutorial.allowedButton = null;
          XOApp.hideTutorialCellGuide();
          XOApp.render();
          setTimeout(function () {
            XOApp.tutorialNext();
          }, 500);
          return;
        }
        XOApp.render();
      }
      return;
    }

    if (state.game.funAbilities[player].freeze <= 0) return;

    if (state.tutorial.active && state.tutorial.freezeStage === 1 && player === PLAYER_X) {
      state.game = startFreezeSelection(state.game, player);
      state.freezeInitiator = player;
      state.tutorial.freezeStage = 0;
      state.tutorial.waitingForInteraction = false;
      state.tutorial.allowedButton = null;
      XOApp.hideTutorialCellGuide();
      els.tutorialOverlay.classList.remove('interaction-mode');
      XOApp.render();
      setTimeout(function () {
        XOApp.tutorialNext();
      }, 500);
      return;
    }

    if (state.tutorial.active && state.tutorial.freezeStage === 5 && player === PLAYER_X) {
      state.game = startFreezeSelection(state.game, player);
      state.freezeInitiator = player;
      state.tutorial.freezeStage = 0;
      state.tutorial.waitingForInteraction = false;
      state.tutorial.allowedButton = null;
      XOApp.hideTutorialCellGuide();
      els.tutorialOverlay.classList.remove('interaction-mode');
      XOApp.render();
      setTimeout(function () {
        XOApp.tutorialNext();
      }, 500);
      return;
    }

    state.game = startFreezeSelection(state.game, player);
    state.freezeInitiator = player;
    if (player === PLAYER_X) {
      els.btnFreezeX.title = '再次点击可取消使用';
      els.btnFreezeX.setAttribute('title', els.btnFreezeX.title);
    } else {
      els.btnFreezeO.title = '再次点击可取消使用';
      els.btnFreezeO.setAttribute('title', els.btnFreezeO.title);
    }
    XOApp.render();
  }

  function togglePersist(player) {
    if (state.game.gameMode !== MODE_FUN) return;
    if (state.game.gameOver) return;

    if (state.tutorial.active && state.tutorial.allowedButton) {
      var btnId = player === PLAYER_X ? '#btnPersistX' : '#btnPersistO';
      if (btnId !== state.tutorial.allowedButton) return;
    }

    if (state.tutorial.active && state.tutorial.persistStage === 1 && player === PLAYER_X) {
      state.game = usePersist(state.game, player);
      state.tutorial.persistStage = 0;
      state.tutorial.waitingForInteraction = false;
      state.tutorial.allowedButton = null;
      XOApp.hideTutorialCellGuide();
      els.tutorialOverlay.classList.remove('interaction-mode');
      XOApp.render();
      setTimeout(function () {
        XOApp.tutorialNext();
      }, 500);
      return;
    }

    if (state.tutorial.active && state.tutorial.persistStage === 10 && player === PLAYER_X) {
      state.game = usePersist(state.game, player);
      state.tutorial.persistStage = 0;
      state.tutorial.waitingForInteraction = false;
      state.tutorial.allowedButton = null;
      XOApp.hideTutorialCellGuide();
      els.tutorialOverlay.classList.remove('interaction-mode');
      XOApp.render();
      setTimeout(function () {
        XOApp.tutorialNext();
      }, 500);
      return;
    }

    if (state.game.persistActive[player]) {
      state.game = cancelPersist(state.game, player);
      if (player === PLAYER_X) {
        els.btnPersistX.title = '保留：下一步落子将保留五个回合';
        els.btnPersistX.setAttribute('title', els.btnPersistX.title);
      } else {
        els.btnPersistO.title = '保留：下一步落子将保留五个回合';
        els.btnPersistO.setAttribute('title', els.btnPersistO.title);
      }
      if (state.tutorial.active && state.tutorial.persistStage === 11 && player === PLAYER_X) {
        state.tutorial.persistStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        XOApp.hideTutorialCellGuide();
        XOApp.render();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 500);
        return;
      }
      XOApp.render();
      return;
    }

    if (state.game.funAbilities[player].persist <= 0) return;
    if (state.game.currentPlayer !== player) return;

    state.game = usePersist(state.game, player);
    if (player === PLAYER_X) {
      els.btnPersistX.title = '再次点击可取消使用';
      els.btnPersistX.setAttribute('title', els.btnPersistX.title);
    } else {
      els.btnPersistO.title = '再次点击可取消使用';
      els.btnPersistO.setAttribute('title', els.btnPersistO.title);
    }
    XOApp.render();
  }

  function updateOptionButtons() {
    els.optionBtns.forEach(function (btn) {
      var setting = btn.dataset.setting;
      if (!setting) return;
      var value = btn.dataset.value;
      btn.classList.toggle('selected', state.settings[setting] === value);
    });
  }

  function switchSettingsTab(tabName) {
    settingsTabState.current = tabName;
    localStorage.setItem('xando-settings-tab', tabName);
    els.settingsTabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.settingsTab === tabName);
    });
    els.settingsPages.forEach(function (page) {
      page.classList.toggle('active', page.dataset.settingsPage === tabName);
    });
  }

  function toggleCollapse(target) {
    collapseState[target] = !collapseState[target];
    localStorage.setItem('xando-collapse-' + target, collapseState[target] ? 'false' : 'true');
    applyCollapseState();
  }

  function applyCollapseState() {
    document.querySelectorAll('.collapsible-group').forEach(function (group) {
      var header = group.querySelector('[data-collapse-target]');
      if (!header) return;
      var target = header.dataset.collapseTarget;
      group.classList.toggle('collapsed', !collapseState[target]);
    });
  }

  function updateModeTiles() {
    document.querySelectorAll('.mode-tile').forEach(function (tile) {
      var mode = tile.dataset.mode;
      tile.classList.toggle('selected', mode === state.game.gameMode);
      tile.classList.remove('normal', 'fun');
      tile.classList.add(mode);
    });
  }

  function applyBoardSize() {
    var scale = state.settings.boardSize === 'large' ? 1.25 : 1;
    document.documentElement.style.setProperty('--board-size-scale', scale);
  }

  function applyPieceSize() {
    var ratios = { small: 0.33, standard: 0.5, large: 0.66 };
    var ratio = ratios[state.settings.pieceSize] || 0.5;
    document.documentElement.style.setProperty('--piece-size-ratio', ratio);
  }

  function applyTheme() {
    var theme = state.settings.theme || 'classic';
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

  function updateAIOptionButtons() {
    document.querySelectorAll('[data-ai-setting]').forEach(function (btn) {
      var setting = btn.dataset.aiSetting;
      var value = btn.dataset.value;
      var isSelected = false;
      if (setting === 'gameMode') {
        isSelected = state.settings.gameMode === value;
      } else if (setting === 'difficulty') {
        isSelected = state.settings.aiDifficulty === value;
      } else if (setting === 'firstMove') {
        isSelected = state.settings.aiFirstMove === value;
      }

      if (isSelected) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  function showAIModal() {
    showModal(els.aiModal);
    els.aiSettingsGroup.hidden = state.settings.gameMode !== GAME_MODE_PVE;
    setTimeout(function() {
      updateAIOptionButtons();
    }, 10);
  }

  function bindEvents() {
    els.btnReset.addEventListener('click', function () { resetGame(); });

    els.btnAI.addEventListener('click', function () {
      if (state.tutorial.active && state.tutorial.allowedButton && state.tutorial.allowedButton !== '#btnAI') return;
      if (state.tutorial.active && state.tutorial.aiStage === 1) {
        state.tutorial.aiStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        XOApp.hideTutorialCellGuide();
        els.tutorialOverlay.classList.remove('interaction-mode');
      }
      showAIModal();
      if (state.tutorial.active) {
        XOApp.tutorialNext();
      }
    });

    document.querySelectorAll('[data-ai-setting]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var setting = btn.dataset.aiSetting;
        var value = btn.dataset.value;

        if (state.tutorial.active && state.tutorial.allowedButton) {
          var btnSelector = '.option-btn[data-ai-setting="' + setting + '"][data-value="' + value + '"]';
          if (btnSelector !== state.tutorial.allowedButton) return;
        }

        if (setting === 'gameMode') {
          state.settings.gameMode = value;
          localStorage.setItem('xando-gameMode', value);
          els.aiSettingsGroup.hidden = value !== GAME_MODE_PVE;
        } else if (setting === 'difficulty') {
          state.settings.aiDifficulty = value;
          localStorage.setItem('xando-aiDifficulty', value);
        } else if (setting === 'firstMove') {
          state.settings.aiFirstMove = value;
          localStorage.setItem('xando-aiFirstMove', value);
        }

        updateAIOptionButtons();

        if (state.tutorial.active && state.tutorial.aiStage === 2 && setting === 'gameMode' && value === 'pve') {
          state.tutorial.aiStage = 0;
          state.tutorial.waitingForInteraction = false;
          state.tutorial.allowedButton = null;
          XOApp.hideTutorialCellGuide();
          els.tutorialOverlay.classList.remove('button-interaction-mode');
          setTimeout(function () {
            XOApp.tutorialNext();
          }, 500);
        }
      });
    });

    function applyAIAndReset() {
      initAISettings();
      hideModal(els.aiModal);
      resetGame();
    }

    els.aiModal.querySelector('.modal-mask').addEventListener('click', function () {
      if (state.tutorial.active && (state.tutorial.aiStage === 2 || state.tutorial.aiStage === 3)) {
        state.tutorial.aiStage = 0;
        hideModal(els.aiModal);
        els.tutorialOverlay.classList.remove('modal-mode');
        els.tutorialOverlay.classList.remove('button-interaction-mode');
        XOApp.tutorialNext();
        return;
      }
      applyAIAndReset();
    });

    els.btnAIConfirm.addEventListener('click', function () {
      if (state.tutorial.active && (state.tutorial.aiStage === 2 || state.tutorial.aiStage === 3)) {
        state.tutorial.aiStage = 0;
        hideModal(els.aiModal);
        els.tutorialOverlay.classList.remove('modal-mode');
        els.tutorialOverlay.classList.remove('button-interaction-mode');
        XOApp.tutorialNext();
        return;
      }
      applyAIAndReset();
    });

    els.btnUndo.addEventListener('click', function () {
      if (state.history.length === 0 || state.game.gameOver) return;
      if (state.ai.player === GAME_MODE_PVE) {
        while (state.history.length > 0 && state.game.currentPlayer !== state.ai.humanPlayer) {
          state.game = state.history.pop();
        }
        if (state.history.length > 0) {
          state.game = state.history.pop();
        }
      } else {
        state.game = state.history.pop();
      }
      XOApp.render();
    });

    els.btnUndoX.addEventListener('click', function () { doFunUndo(PLAYER_X); });
    els.btnUndoO.addEventListener('click', function () { doFunUndo(PLAYER_O); });

    els.btnFreezeX.addEventListener('click', function () { toggleFreeze(PLAYER_X); });
    els.btnFreezeO.addEventListener('click', function () { toggleFreeze(PLAYER_O); });
    els.btnPersistX.addEventListener('click', function () { togglePersist(PLAYER_X); });
    els.btnPersistO.addEventListener('click', function () { togglePersist(PLAYER_O); });

    els.btnCancelFreeze.addEventListener('click', function () {
      if (state.tutorial.active && state.tutorial.freezeStage === 6) {
        state.game = cancelFreezeSelection(state.game);
        state.freezeInitiator = null;
        els.btnFreezeX.title = '固定：选择一个空格子，对方无法在此落子';
        els.btnFreezeX.setAttribute('title', els.btnFreezeX.title);
        els.btnFreezeO.title = '固定：选择一个空格子，对方无法在此落子';
        els.btnFreezeO.setAttribute('title', els.btnFreezeO.title);
        state.tutorial.freezeStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        XOApp.hideTutorialCellGuide();
        XOApp.render();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 500);
        return;
      }
      state.game = cancelFreezeSelection(state.game);
      state.freezeInitiator = null;
      els.btnFreezeX.title = '固定：选择一个空格子，对方无法在此落子';
      els.btnFreezeX.setAttribute('title', els.btnFreezeX.title);
      els.btnFreezeO.title = '固定：选择一个空格子，对方无法在此落子';
      els.btnFreezeO.setAttribute('title', els.btnFreezeO.title);
      XOApp.render();
    });

    els.btnCancelPersist.addEventListener('click', function () {
      var activePlayer = state.game.persistActive[PLAYER_X] ? PLAYER_X : PLAYER_O;
      if (state.tutorial.active && state.tutorial.persistStage === 11 && activePlayer === PLAYER_X) {
        state.game = cancelPersist(state.game, activePlayer);
        if (activePlayer === PLAYER_X) {
          els.btnPersistX.title = '保留：下一步落子将保留五个回合';
          els.btnPersistX.setAttribute('title', els.btnPersistX.title);
        } else {
          els.btnPersistO.title = '保留：下一步落子将保留五个回合';
          els.btnPersistO.setAttribute('title', els.btnPersistO.title);
        }
        state.tutorial.persistStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        XOApp.hideTutorialCellGuide();
        XOApp.render();
        setTimeout(function () {
          XOApp.tutorialNext();
        }, 500);
        return;
      }
      if (activePlayer) {
        state.game = cancelPersist(state.game, activePlayer);
        if (activePlayer === PLAYER_X) {
          els.btnPersistX.title = '保留：下一步落子将保留五个回合';
          els.btnPersistX.setAttribute('title', els.btnPersistX.title);
        } else {
          els.btnPersistO.title = '保留：下一步落子将保留五个回合';
          els.btnPersistO.setAttribute('title', els.btnPersistO.title);
        }
        XOApp.render();
      }
    });

    els.btnMode.addEventListener('click', function () {
      updateModeTiles();
      showModal(els.modeModal);
    });

    document.querySelectorAll('.mode-tile').forEach(function (tile) {
      tile.addEventListener('click', function () {
        var mode = tile.dataset.mode;

        if (state.tutorial.active && state.tutorial.allowedButton) {
          var tileSelector = '.mode-tile[data-mode="' + mode + '"]';
          if (tileSelector !== state.tutorial.allowedButton) return;
        }

        resetGame(mode);
        hideModal(els.modeModal);
        if (state.tutorial.active && state.tutorial.modeStage === 2) {
          state.tutorial.modeStage = 0;
          state.tutorial.waitingForInteraction = false;
          state.tutorial.allowedButton = null;
          els.tutorialOverlay.classList.remove('modal-mode');
          XOApp.tutorialNext();
        }
      });
    });

    els.modeModal.querySelector('.modal-mask').addEventListener('click', function () {
      hideModal(els.modeModal);
      if (state.tutorial.active && state.tutorial.modeStage === 2) {
        state.tutorial.modeStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        els.tutorialOverlay.classList.remove('modal-mode');
        XOApp.tutorialNext();
      }
    });

    els.btnHelp.addEventListener('click', function () {
      if (state.tutorial.active && state.tutorial.allowedButton && state.tutorial.allowedButton !== '#btnHelp') return;
      if (state.tutorial.active && state.tutorial.helpStage === 1) {
        state.tutorial.helpStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        XOApp.hideTutorialCellGuide();
        els.tutorialOverlay.classList.remove('interaction-mode');
      }
      showHelpModal();
      if (state.tutorial.active) {
        XOApp.tutorialNext();
      }
    });
    els.helpModal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        hideModal(els.helpModal);
        if (state.tutorial.active && state.tutorial.helpStage === 2) {
          state.tutorial.helpStage = 0;
          els.tutorialOverlay.classList.remove('modal-mode');
          XOApp.tutorialNext();
        }
      });
    });
    els.helpPrev.addEventListener('click', function () { helpPrevPage(); });
    els.helpNext.addEventListener('click', function () { helpNextPage(); });

    var HELP_SCROLL_STEP = 3;

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

    document.addEventListener('keydown', function (e) {
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
        if (state.tutorial.active && state.tutorial.helpStage === 2) {
          state.tutorial.helpStage = 0;
          els.tutorialOverlay.classList.remove('modal-mode');
          XOApp.tutorialNext();
        }
      }
    });

    document.addEventListener('keyup', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        stopHelpScroll();
      }
    });

    els.btnWinClose.addEventListener('click', function () {
      if (state.tutorial.active && state.tutorial.pausedForWinModal) {
        state.tutorial.pausedForWinModal = false;
        hideModal(els.winModal);
        state.game.gameOver = false;
        state.game.winner = null;
        state.game.winningLines = [];
        els.tutorialOverlay.hidden = false;
        els.btnWinClose.textContent = '再来一局';
        XOApp.render();
        XOApp.tutorialNext();
      } else {
        els.btnWinClose.textContent = '再来一局';
        resetGame();
      }
    });
    els.winModal.querySelector('.modal-mask').addEventListener('click', function () {
      if (state.tutorial.active && state.tutorial.pausedForWinModal) {
        state.tutorial.pausedForWinModal = false;
        hideModal(els.winModal);
        state.game.gameOver = false;
        state.game.winner = null;
        state.game.winningLines = [];
        els.tutorialOverlay.hidden = false;
        els.btnWinClose.textContent = '再来一局';
        XOApp.render();
        XOApp.tutorialNext();
      } else {
        els.btnWinClose.textContent = '再来一局';
        hideModal(els.winModal);
      }
    });

    els.btnSettings.addEventListener('click', function () {
      if (state.tutorial.active && state.tutorial.allowedButton && state.tutorial.allowedButton !== '#btnSettings') return;
      if (state.tutorial.active && state.tutorial.settingsStage === 1) {
        state.tutorial.settingsStage = 0;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.allowedButton = null;
        XOApp.hideTutorialCellGuide();
        els.tutorialOverlay.classList.remove('interaction-mode');
      }
      updateOptionButtons();
      switchSettingsTab(settingsTabState.current);

      var isPVE = state.settings.gameMode === GAME_MODE_PVE;
      if (els.aiSettingsInBasic) els.aiSettingsInBasic.hidden = !isPVE;
      if (els.aiFirstMoveSettings) els.aiFirstMoveSettings.hidden = !isPVE;

      applyCollapseState();
      showModal(els.settingsModal);
      if (state.tutorial.active) {
        XOApp.tutorialNext();
      }
    });
    els.settingsModal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        if (state.tutorial.active && state.tutorial.allowedButton && (state.tutorial.settingsStage === 3 || state.tutorial.settingsStage === 4 || state.tutorial.settingsStage === 5 || state.tutorial.settingsStage === 6)) {
          return;
        }
        hideModal(els.settingsModal);
        if (state.tutorial.active && state.tutorial.settingsStage === 2) {
          state.tutorial.settingsStage = 0;
          els.tutorialOverlay.classList.remove('modal-mode');
          XOApp.tutorialNext();
        }
      });
    });

    els.settingsTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var targetTab = tab.dataset.settingsTab;

        if (state.tutorial.active && state.tutorial.allowedButton) {
          var tabSelector = '.settings-tab[data-settings-tab="' + targetTab + '"]';
          if (tabSelector !== state.tutorial.allowedButton) return;
        }

        if (state.tutorial.active && state.tutorial.settingsStage === 5) {
          if (targetTab !== 'theme') return;
          state.tutorial.settingsStage = 0;
          state.tutorial.waitingForInteraction = false;
          state.tutorial.allowedButton = null;
          XOApp.hideTutorialCellGuide();
          switchSettingsTab(targetTab);
          XOApp.tutorialNext();
          return;
        }
        switchSettingsTab(tab.dataset.settingsTab);
      });
    });

    document.querySelectorAll('[data-collapse-target]').forEach(function (header) {
      header.addEventListener('click', function () {
        var target = header.dataset.collapseTarget;

        if (state.tutorial.active && state.tutorial.allowedButton) {
          var headerSelector = '[data-collapse-target="' + target + '"]';
          if (headerSelector !== state.tutorial.allowedButton) return;
        }

        toggleCollapse(target);
      });
    });

    els.optionBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var setting = btn.dataset.setting;
        if (!setting) return;
        var value = btn.dataset.value;

        if (state.tutorial.active && state.tutorial.allowedButton) {
          var btnSelector = '.option-btn[data-setting="' + setting + '"][data-value="' + value + '"]';
          if (btnSelector !== state.tutorial.allowedButton) return;
        }

        if (state.tutorial.active && state.tutorial.settingsStage === 3 && setting === 'boardSize' && value === 'large') {
          state.tutorial.settingsStage = 0;
          state.tutorial.waitingForInteraction = false;
          state.tutorial.allowedButton = null;
          XOApp.hideTutorialCellGuide();
          state.settings[setting] = value;
          updateOptionButtons();
          applySettings();
          XOApp.tutorialNext();
          return;
        }

        if (state.tutorial.active && state.tutorial.settingsStage === 4 && setting === 'pieceSize' && value === 'large') {
          state.tutorial.settingsStage = 0;
          state.tutorial.waitingForInteraction = false;
          state.tutorial.allowedButton = null;
          XOApp.hideTutorialCellGuide();
          state.settings[setting] = value;
          updateOptionButtons();
          applySettings();
          XOApp.tutorialNext();
          return;
        }

        if (state.tutorial.active && state.tutorial.settingsStage === 6 && setting === 'theme' && value === 'orange-sea') {
          state.tutorial.settingsStage = 0;
          state.tutorial.waitingForInteraction = false;
          state.tutorial.allowedButton = null;
          XOApp.hideTutorialCellGuide();
          state.settings[setting] = value;
          updateOptionButtons();
          applySettings();
          XOApp.tutorialNext();
          return;
        }

        state.settings[setting] = value;
        var needReset = false;

        if (setting === 'gameMode') {
          localStorage.setItem('xando-gameMode', value);
          var isPVE = value === GAME_MODE_PVE;
          if (els.aiSettingsInBasic) els.aiSettingsInBasic.hidden = !isPVE;
          if (els.aiFirstMoveSettings) els.aiFirstMoveSettings.hidden = !isPVE;
          needReset = true;
        } else if (setting === 'aiDifficulty') {
          localStorage.setItem('xando-aiDifficulty', value);
          needReset = true;
        } else if (setting === 'aiFirstMove') {
          localStorage.setItem('xando-aiFirstMove', value);
          needReset = true;
        }

        updateOptionButtons();
        applySettings();

        if (needReset && !state.tutorial.active) {
          setTimeout(function() {
            resetGame();
          }, 100);
        }
      });
    });

    window.addEventListener('resize', function () {
      applyBoardSize();
      if (state.tutorial.active) {
        XOApp.renderTutorial();
      }
      if (state.tutorial.waitingForInteraction && state.tutorial.interactionCell) {
        setTimeout(XOApp.showTutorialCellGuide, 50);
      }
    });

    els.tutorialNext.addEventListener('click', function () { XOApp.tutorialNext(); });
    els.tutorialPrev.addEventListener('click', function () { XOApp.tutorialPrev(); });
    els.tutorialSkip.addEventListener('click', function () {
      state.tutorial.interactionCell = null;
      state.tutorial.isWinStep = false;
      state.tutorial.pausedForWinModal = false;
      state.tutorial.undoStage = 0;
      state.tutorial.animateDisappear = false;
      state.tutorial.disappearCell = null;
      state.tutorial.freezeStage = 0;
      state.tutorial.freezeCell = null;
      state.tutorial.animateFreezeDisappear = false;
      state.tutorial.freezeDisappearCell = null;
      state.tutorial.persistStage = 0;
      state.tutorial.persistCell = null;
      state.tutorial.animatePersistDisappear = false;
      state.tutorial.persistDisappearCell = null;
      state.tutorial.persistSecondDisappearCell = null;
      state.tutorial.persistStepIndex = 0;
      state.tutorial.persistAutoNextOMove = null;
      state.tutorial.allowedButton = null;
      state.tutorial.freezeTriedFrozenCell = false;
      state.tutorial.helpStage = 0;
      state.tutorial.settingsStage = 0;
      state.tutorial.modeStage = 0;
      if (state.tutorial.pendingAutoAdvance) {
        clearTimeout(state.tutorial.pendingAutoAdvance);
        state.tutorial.pendingAutoAdvance = null;
      }
      XOApp.hideTutorialCellGuide();
      XOApp.endTutorial();
    });

    var tutorialMask = els.tutorialOverlay.querySelector('.tutorial-mask');
    tutorialMask.addEventListener('click', function (e) {
      if (!state.tutorial.active) return;
      if (e.target.closest('.tutorial-tooltip')) return;
      if (state.tutorial.allowedButton) {
        var btn = document.querySelector(state.tutorial.allowedButton);
        if (btn) {
          var btnRect = btn.getBoundingClientRect();
          if (e.clientX >= btnRect.left && e.clientX <= btnRect.right &&
              e.clientY >= btnRect.top && e.clientY <= btnRect.bottom) {
            btn.click();
          }
        }
        return;
      }
      if (state.tutorial.waitingForInteraction) {
        XOApp.tutorialNext();
        return;
      }
      XOApp.tutorialNext();
    });

    if (els.btnShowTutorial) {
      els.btnShowTutorial.addEventListener('click', function () {
        hideModal(els.settingsModal);
        state.tutorial.preTutorialSettings = {
          boardSize: state.settings.boardSize,
          pieceSize: state.settings.pieceSize,
          theme: state.settings.theme,
          gameMode: state.settings.gameMode,
          aiDifficulty: state.settings.aiDifficulty,
          aiFirstMove: state.settings.aiFirstMove,
        };
        state.settings.gameMode = GAME_MODE_PVP;
        localStorage.setItem('xando-gameMode', GAME_MODE_PVP);
        initAISettings();
        state.tutorial.active = true;
        state.tutorial.currentStep = 0;
        state.tutorial.totalSteps = XOApp.TUTORIAL_STEPS.length;
        state.tutorial.waitingForInteraction = false;
        state.tutorial.interactionCell = null;
        state.tutorial.isWinStep = false;
        state.tutorial.pausedForWinModal = false;
        state.tutorial.undoStage = 0;
        state.tutorial.animateDisappear = false;
        state.tutorial.disappearCell = null;
        state.tutorial.freezeStage = 0;
        state.tutorial.freezeCell = null;
        state.tutorial.animateFreezeDisappear = false;
        state.tutorial.freezeDisappearCell = null;
        state.tutorial.persistStage = 0;
        state.tutorial.persistCell = null;
        state.tutorial.animatePersistDisappear = false;
        state.tutorial.persistDisappearCell = null;
        state.tutorial.persistSecondDisappearCell = null;
        state.tutorial.persistStepIndex = 0;
        state.tutorial.persistAutoNextOMove = null;
        state.tutorial.allowedButton = null;
        state.tutorial.manualPositioning = false;
        state.tutorial.freezeTriedFrozenCell = false;
        state.tutorial.helpStage = 0;
        state.tutorial.settingsStage = 0;
        state.tutorial.modeStage = 0;
        if (state.tutorial.pendingAutoAdvance) {
          clearTimeout(state.tutorial.pendingAutoAdvance);
          state.tutorial.pendingAutoAdvance = null;
        }
        XOApp.hideTutorialCellGuide();
        els.tutorialOverlay.hidden = false;
        els.tutorialOverlay.classList.remove('modal-mode');
        els.tutorialOverlay.classList.remove('interaction-mode');
        els.tutorialOverlay.classList.remove('button-interaction-mode');
        hideModal(els.modeModal);
        XOApp.renderTutorial();
      });
    }
  }

  function init() {
    XOApp.initEls();
    bindEvents();
    applySettings();
    initAISettings();
    XOApp.render();
    XOApp.initTutorial();

    if (state.ai.player === GAME_MODE_PVE && state.ai.aiPlayer === PLAYER_X) {
      setTimeout(function () {
        triggerAIMoveIfNeeded();
      }, 500);
    }
  }

  XOApp.handleCellClick = handleCellClick;
  XOApp.showModal = showModal;
  XOApp.hideModal = hideModal;
  XOApp.resetGame = resetGame;
  XOApp.applyBoardSize = applyBoardSize;
  XOApp.applyPieceSize = applyPieceSize;
  XOApp.applyTheme = applyTheme;
  XOApp.toggleCollapse = toggleCollapse;
  XOApp.applyCollapseState = applyCollapseState;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
