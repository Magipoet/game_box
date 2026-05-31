(function() {
  'use strict';

  window.Gomoku = window.Gomoku || {};
  var G = window.Gomoku;
  var state = G.state;

  G.ui = {
    bindEvents: bindEvents,
    updateThemeActiveState: updateThemeActiveState,
    updateSettingsUI: updateSettingsUI,
    updateModeBadge: updateModeBadge,
    updateStatus: updateStatus,
    updateUndoButton: updateUndoButton,
    updateActionButtons: updateActionButtons,
    showWinModal: showWinModal,
    showDrawModal: showDrawModal,
    showEndModal: showEndModal,
    showModeSelectModal: showModeSelectModal,
    showTimeoutModal: showTimeoutModal,
    showModal: showModal,
    hideAllModals: hideAllModals,
    updateTimerDisplay: updateTimerDisplay,
    switchSettingsTab: switchSettingsTab,
    renderAchievements: renderAchievements,
    switchAchievementCategory: switchAchievementCategory,
    updateSoundButton: updateSoundButton
  };

  function updateThemeActiveState() {
    var options = document.querySelectorAll('.theme-option');
    options.forEach(function(opt) {
      opt.classList.toggle('active', opt.getAttribute('data-theme') === state.currentTheme);
    });
  }

  function updateSettingsUI() {
    var tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(function(t) {
      t.classList.toggle('active', t.getAttribute('data-mode') === state.gameMode);
    });
    var aiSettings = document.getElementById('aiSettings');
    if (aiSettings) {
      aiSettings.hidden = (state.gameMode !== 'pve');
    }

    var sideTabs = document.querySelectorAll('.side-tab');
    sideTabs.forEach(function(t) {
      var side = t.getAttribute('data-side') === 'black' ? G.BLACK : G.WHITE;
      t.classList.toggle('active', side === state.playerSide);
    });

    var diffTabs = document.querySelectorAll('.difficulty-tab');
    diffTabs.forEach(function(t) {
      t.classList.toggle('active', t.getAttribute('data-difficulty') === state.aiDifficulty);
    });

    var timerSwitch = document.getElementById('timerSwitch');
    if (timerSwitch) {
      timerSwitch.classList.toggle('active', state.timerEnabled);
    }

    var soundSwitch = document.getElementById('soundSwitch');
    if (soundSwitch) {
      soundSwitch.classList.toggle('active', state.soundEnabled);
    }
  }

  function updateModeBadge() {
    var badge = document.getElementById('modeBadge');
    if (!badge) return;

    if (state.gameMode === 'pvp') {
      badge.textContent = '人人对战';
    } else {
      var side = state.playerSide === G.BLACK ? '黑方' : '白方';
      var diffText = state.aiDifficulty === 'easy' ? '初级' : (state.aiDifficulty === 'medium' ? '中级' : '高级');
      badge.textContent = '人机·' + side + '·' + diffText;
    }
  }

  function bindEvents() {
    state.canvas.addEventListener('click', G.game.handleCanvasClick);
    state.canvas.addEventListener('mousemove', G.game.handleCanvasHover);
    state.canvas.addEventListener('mouseleave', G.renderer.draw);

    document.getElementById('btnSettings').addEventListener('click', function() {
      showModal('settingsModal');
    });

    document.getElementById('btnHelp').addEventListener('click', function() {
      showModal('helpModal');
    });

    document.getElementById('btnSound').addEventListener('click', function() {
      G.game.toggleSound(!state.soundEnabled);
      updateSoundButton();
    });

    document.querySelectorAll('#achievementCategoryTabs .achievement-category-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var category = tab.getAttribute('data-category');
        switchAchievementCategory(category);
      });
    });

    document.querySelectorAll('[data-close]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        if (e.target.closest('[data-close]')) {
          hideAllModals();
        }
      });
    });

    document.querySelectorAll('.theme-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        var theme = opt.getAttribute('data-theme');
        G.game.applyTheme(theme);
      });
    });

    document.querySelectorAll('.mode-tab').forEach(function(t) {
      t.addEventListener('click', function() {
        document.querySelectorAll('.mode-tab').forEach(function(el) { el.classList.remove('active'); });
        t.classList.add('active');
        var mode = t.getAttribute('data-mode');
        state.gameMode = mode;
        localStorage.setItem('gomoku-mode', mode);
        document.getElementById('aiSettings').hidden = (mode !== 'pve');
        updateModeBadge();
        G.game.resetGame();
      });
    });

    document.querySelectorAll('.side-tab').forEach(function(t) {
      t.addEventListener('click', function() {
        document.querySelectorAll('.side-tab').forEach(function(el) { el.classList.remove('active'); });
        t.classList.add('active');
        var side = t.getAttribute('data-side') === 'black' ? G.BLACK : G.WHITE;
        state.playerSide = side;
        localStorage.setItem('gomoku-side', side);
        updateModeBadge();
        G.game.resetGame();
      });
    });

    document.querySelectorAll('.difficulty-tab').forEach(function(t) {
      t.addEventListener('click', function() {
        document.querySelectorAll('.difficulty-tab').forEach(function(el) { el.classList.remove('active'); });
        t.classList.add('active');
        var diff = t.getAttribute('data-difficulty');
        state.aiDifficulty = diff;
        localStorage.setItem('gomoku-difficulty', diff);
        updateModeBadge();
      });
    });

    document.getElementById('btnUndo').addEventListener('click', G.game.undoMove);
    document.getElementById('btnRestart').addEventListener('click', function() {
      state.savedGameState = null;
      state.gameEnded = false;
      hideAllModals();
      G.game.resetGame();
      updateActionButtons();
    });

    document.getElementById('btnEnd').addEventListener('click', function() {
      G.game.endGame();
    });

    document.getElementById('btnWinClose').addEventListener('click', function() {
      state.savedGameState = null;
      state.gameEnded = false;
      hideAllModals();
      G.game.resetGame();
      updateActionButtons();
    });

    document.getElementById('btnWinEnd').addEventListener('click', function() {
      if (!state.savedGameState) {
        G.game.saveGameState();
      }
      state.gameEnded = true;
      state.gameOver = true;
      hideAllModals();
      updateActionButtons();
    });

    document.querySelectorAll('#quickModeTabs .mode-tab').forEach(function(t) {
      t.addEventListener('click', function() {
        document.querySelectorAll('#quickModeTabs .mode-tab').forEach(function(el) {
          el.classList.remove('active');
        });
        t.classList.add('active');
        var m = t.getAttribute('data-mode');
        document.getElementById('quickAiSettings').hidden = (m !== 'pve');
      });
    });

    document.querySelectorAll('#quickSideTabs .side-tab').forEach(function(t) {
      t.addEventListener('click', function() {
        document.querySelectorAll('#quickSideTabs .side-tab').forEach(function(el) {
          el.classList.remove('active');
        });
        t.classList.add('active');
      });
    });

    document.querySelectorAll('#quickDifficultyTabs .difficulty-tab').forEach(function(t) {
      t.addEventListener('click', function() {
        document.querySelectorAll('#quickDifficultyTabs .difficulty-tab').forEach(function(el) {
          el.classList.remove('active');
        });
        t.classList.add('active');
      });
    });

    document.getElementById('btnModeSelectConfirm').addEventListener('click', function() {
      var selectedMode = document.querySelector('#quickModeTabs .mode-tab.active').getAttribute('data-mode');
      state.gameMode = selectedMode;
      localStorage.setItem('gomoku-mode', state.gameMode);

      if (state.gameMode === 'pve') {
        var selectedSide = document.querySelector('#quickSideTabs .side-tab.active').getAttribute('data-side');
        state.playerSide = selectedSide === 'black' ? G.BLACK : G.WHITE;
        localStorage.setItem('gomoku-side', state.playerSide);

        var selectedDifficulty = document.querySelector('#quickDifficultyTabs .difficulty-tab.active').getAttribute('data-difficulty');
        state.aiDifficulty = selectedDifficulty;
        localStorage.setItem('gomoku-difficulty', state.aiDifficulty);
      }

      updateSettingsUI();
      updateModeBadge();
      hideAllModals();
      G.game.resetGame();
    });

    document.getElementById('modeBadge').addEventListener('click', showModeSelectModal);

    var timerToggle = document.querySelector('.timer-toggle');
    if (timerToggle) {
      timerToggle.style.cursor = 'pointer';
      timerToggle.addEventListener('click', function() {
        G.game.toggleTimer(!state.timerEnabled);
      });
    }

    var soundToggle = document.querySelector('.sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', function() {
        G.game.toggleSound(!state.soundEnabled);
      });
    }

    document.querySelectorAll('#settingsTabs .settings-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        var tabName = tab.getAttribute('data-tab');
        switchSettingsTab(tabName);
      });
    });
  }

  function showModeSelectModal() {
    document.querySelectorAll('#quickModeTabs .mode-tab').forEach(function(t) {
      t.classList.toggle('active', t.getAttribute('data-mode') === state.gameMode);
    });
    document.getElementById('quickAiSettings').hidden = (state.gameMode !== 'pve');
    document.querySelectorAll('#quickSideTabs .side-tab').forEach(function(t) {
      var side = t.getAttribute('data-side') === 'black' ? G.BLACK : G.WHITE;
      t.classList.toggle('active', side === state.playerSide);
    });
    document.querySelectorAll('#quickDifficultyTabs .difficulty-tab').forEach(function(t) {
      t.classList.toggle('active', t.getAttribute('data-difficulty') === state.aiDifficulty);
    });
    showModal('modeSelectModal');
  }

  function showWinModal(player) {
    var name = player === G.BLACK ? '黑方' : '白方';
    document.getElementById('winTitle').textContent = name + '获胜！';
    document.getElementById('winSub').textContent = '恭喜获胜';
    if (state.gameMode === 'pve') {
      var won = (player === state.playerSide);
      document.getElementById('winTitle').textContent = won ? '恭喜获胜！' : 'AI 获胜';
      document.getElementById('winSub').textContent = won ? '再接再厉' : '下次加油！';
    }
    showModal('winModal');
  }

  function showDrawModal() {
    document.getElementById('winTitle').textContent = '平局';
    document.getElementById('winSub').textContent = '势均力敌';
    showModal('winModal');
  }

  function showEndModal() {
    document.getElementById('winTitle').textContent = '游戏结束';
    document.getElementById('winSub').textContent = '当前棋局已保存';
    showModal('winModal');
  }

  function showModal(id) {
    hideAllModals();
    var modal = document.getElementById(id);
    if (modal) {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      if (id === 'settingsModal') {
        switchSettingsTab(state.currentSettingsTab);
      }
    }
  }

  function hideAllModals() {
    document.querySelectorAll('.modal').forEach(function(m) {
      m.hidden = true;
    });
    document.body.style.overflow = '';
  }

  function updateStatus() {
    var statusEl = document.getElementById('statusText');
    if (statusEl) {
      var playerName = state.currentPlayer === G.BLACK ? '黑方' : '白方';
      statusEl.textContent = playerName + '回合';
    }
    var stoneEl = document.querySelector('#playerIndicator .player-stone');
    if (stoneEl) {
      stoneEl.className = 'player-stone ' + (state.currentPlayer === G.BLACK ? 'stone-black' : 'stone-white');
    }
    var moveEl = document.getElementById('moveValue');
    if (moveEl) {
      moveEl.textContent = state.moveCount;
    }
  }

  function updateUndoButton() {
    var btn = document.getElementById('btnUndo');
    if (btn) {
      btn.disabled = state.moveHistory.length === 0 || state.aiThinking;
    }
  }

  function updateActionButtons() {
    var btnEnd = document.getElementById('btnEnd');
    var btnRestart = document.getElementById('btnRestart');

    if (btnEnd) {
      btnEnd.disabled = state.gameEnded || state.moveCount === 0;
      btnEnd.style.display = state.gameEnded ? 'none' : 'inline-flex';
    }
    if (btnRestart) {
      btnRestart.textContent = state.gameEnded ? '再来一局' : '重新开始';
    }
  }

  function updateTimerDisplay() {
    var timerDisplay = document.getElementById('timerDisplay');
    var timerValue = document.getElementById('timerValue');
    var timerSwitch = document.getElementById('timerSwitch');

    if (timerDisplay) {
      timerDisplay.hidden = !state.timerEnabled;
    }
    if (timerValue) {
      timerValue.textContent = state.timerRemaining;
      timerValue.classList.toggle('warning', state.timerRemaining <= 3);
    }
    if (timerSwitch) {
      timerSwitch.classList.toggle('active', state.timerEnabled);
    }
  }

  function showTimeoutModal(winner) {
    var name = winner === G.BLACK ? '黑方' : '白方';
    document.getElementById('winTitle').textContent = name + '获胜！';
    document.getElementById('winSub').textContent = '对方超时';
    if (state.gameMode === 'pve') {
      var won = (winner === state.playerSide);
      document.getElementById('winTitle').textContent = won ? '恭喜获胜！' : 'AI 获胜';
      document.getElementById('winSub').textContent = won ? '对方超时' : '思考超时';
    }
    showModal('winModal');
  }

  function updateSoundButton() {
    var btn = document.getElementById('btnSound');
    if (!btn) return;
    btn.classList.toggle('muted', !state.soundEnabled);
    if (state.soundEnabled) {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
    }
    var soundSwitch = document.getElementById('soundSwitch');
    if (soundSwitch) {
      soundSwitch.classList.toggle('active', state.soundEnabled);
    }
  }

  function switchSettingsTab(tabName) {
    state.currentSettingsTab = tabName;
    localStorage.setItem('gomoku-settings-tab', tabName);

    var tabs = document.querySelectorAll('#settingsTabs .settings-tab');
    tabs.forEach(function(t) {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });

    var panes = document.querySelectorAll('.settings-tab-pane');
    panes.forEach(function(p) {
      p.classList.toggle('active', p.getAttribute('data-tab-pane') === tabName);
    });

    if (tabName === 'achievement') {
      var savedCategory = localStorage.getItem('gomoku-achievement-category');
      if (savedCategory) {
        state.currentAchievementCategory = savedCategory;
        var tabs = document.querySelectorAll('#achievementCategoryTabs .achievement-category-tab');
        tabs.forEach(function(t) {
          t.classList.toggle('active', t.getAttribute('data-category') === savedCategory);
        });
      }
      renderAchievements(state.currentAchievementCategory);
    }
  }

  function switchAchievementCategory(category) {
    state.currentAchievementCategory = category;
    localStorage.setItem('gomoku-achievement-category', category);
    var tabs = document.querySelectorAll('#achievementCategoryTabs .achievement-category-tab');
    tabs.forEach(function(t) {
      t.classList.toggle('active', t.getAttribute('data-category') === category);
    });
    renderAchievements(category);
  }

  function renderAchievements(category) {
    if (!category) category = 'all';
    var achievements = G.achievements.getAchievementsByCategory(category);
    var allAchievements = G.achievements.getAchievements();
    var stats = G.achievements.getStats();

    var totalWinsEl = document.getElementById('statTotalWins');
    if (totalWinsEl) totalWinsEl.textContent = stats.totalWins;

    var totalGamesEl = document.getElementById('statTotalGames');
    if (totalGamesEl) totalGamesEl.textContent = stats.totalGames;

    var mostMovesEl = document.getElementById('statMostMoves');
    if (mostMovesEl) mostMovesEl.textContent = stats.mostMovesInGame;

    var unlockedCount = 0;
    Object.keys(allAchievements).forEach(function(key) {
      if (allAchievements[key].unlocked) unlockedCount++;
    });

    var unlockedEl = document.getElementById('statUnlocked');
    if (unlockedEl) unlockedEl.textContent = unlockedCount + '/' + Object.keys(allAchievements).length;

    var listEl = document.getElementById('achievementsList');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (achievements.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:30px;">暂无该分类的成就</div>';
      return;
    }

    achievements.forEach(function(ach) {
      var item = document.createElement('div');
      item.className = 'achievement-item' + (ach.unlocked ? ' unlocked' : '');
      item.innerHTML =
        '<div class="achievement-item-icon">' + ach.icon + '</div>' +
        '<div class="achievement-item-info">' +
          '<div class="achievement-item-name">' + ach.name + '</div>' +
          '<div class="achievement-item-desc">' + ach.description + '</div>' +
        '</div>' +
        '<div class="achievement-item-status">' + (ach.unlocked ? '已解锁' : '未解锁') + '</div>';
      listEl.appendChild(item);
    });
  }
})();
