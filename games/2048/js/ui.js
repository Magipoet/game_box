class UI {
  constructor() {
    this.game = new Game2048();
    this.storage = new StorageService();
    this.currentHelpPage = 0;
    this.isProcessingInput = false;
    this.idleTimer = null;
    this.IDLE_TIMEOUT = 60 * 1000;
    this.scrollTimer = null;
    this.scrollDirection = 0;
    this.currentSettingsTab = 'records';
    this.settingsScrollTimer = null;
    this.settingsScrollDirection = 0;
    this.achievementToastTimer = null;
    this.savedStates = {};
    this.currentTheme = 'classic';
    this.tileElements = new Map();
    this.tileIdCounter = 0;
    this.staticTiles = [];
    this.boardBgInitialized = false;
    this.isAnimating = false;
    this.cellSize = 0;
    this.cellGap = 0;
    this.boardPadding = 0;
    this.SLIDE_DURATION = 80;
    this.POP_DURATION = 100;
    this.moveQueue = [];
    this.isProcessingQueue = false;

    this.initElements();
    this.initGame();
    this.bindEvents();
    this.loadTheme();
    this.render();
    this.resetIdleTimer();
  }

  initElements() {
    this.boardEl = document.getElementById('board');
    this.currentScoreEl = document.getElementById('currentScore');
    this.timeDisplayEl = document.getElementById('timeDisplay');
    this.newGameBtn = document.getElementById('newGameBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.pauseIconEl = this.pauseBtn ? this.pauseBtn.querySelector('.pause-icon') : null;
    this.pauseTextEl = this.pauseBtn ? this.pauseBtn.querySelector('.pause-text') : null;
    this.shuffleBtn = document.getElementById('shuffleBtn');
    this.undoBtn = document.getElementById('undoBtn');
    this.undoCountEl = document.getElementById('undoCount');
    this.helpBtn = document.getElementById('helpBtn');
    this.settingsBtn = document.getElementById('settingsBtn');

    this.helpModal = document.getElementById('helpModal');
    this.helpModalBody = document.getElementById('helpModalBody');
    this.helpCloseBtn = document.getElementById('helpCloseBtn');
    this.helpPages = document.getElementById('helpPages');
    this.prevPageBtn = document.getElementById('prevPageBtn');
    this.nextPageBtn = document.getElementById('nextPageBtn');
    this.pageDots = document.querySelectorAll('.page-dot');

    this.settingsModal = document.getElementById('settingsModal');
    this.settingsModalBody = document.getElementById('settingsModalBody');
    this.settingsCloseBtn = document.getElementById('settingsCloseBtn');
    this.settingsCloseFooterBtn = document.getElementById('settingsCloseFooterBtn');
    this.settingsTabs = document.querySelectorAll('.settings-tab');
    this.settingsPages = document.querySelectorAll('.settings-page');
    this.achievementsGrid = document.getElementById('achievementsGrid');
    this.achievementCategoryTabs = document.getElementById('achievementCategoryTabs');
    this.currentAchievementCategory = 'all';
    this.themesGrid = document.getElementById('themesGrid');

    this.winModal = document.getElementById('winModal');
    this.winScoreEl = document.getElementById('winScore');
    this.winTimeEl = document.getElementById('winTime');
    this.winTimeItem = document.getElementById('winTimeItem');
    this.continueBtn = document.getElementById('continueBtn');
    this.winNewGameBtn = document.getElementById('winNewGameBtn');

    this.gameOverModal = document.getElementById('gameOverModal');
    this.gameOverReason = document.getElementById('gameOverReason');
    this.gameOverScoreEl = document.getElementById('gameOverScore');
    this.gameOverMaxTileEl = document.getElementById('gameOverMaxTile');
    this.gameOverTimeEl = document.getElementById('gameOverTime');
    this.gameOverTimeItem = document.getElementById('gameOverTimeItem');
    this.closeGameOverBtn = document.getElementById('closeGameOverBtn');
    this.gameOverNewGameBtn = document.getElementById('gameOverNewGameBtn');

    this.achievementToast = document.getElementById('achievementToast');
    this.achievementToastTitle = document.getElementById('achievementToastTitle');
    this.achievementToastDesc = document.getElementById('achievementToastDesc');

    this.modeButtons = document.querySelectorAll('.mode-btn');
    this.variantButtons = document.querySelectorAll('.variant-btn');

    this.timedNormalHighestEl = document.getElementById('timedNormalHighest');
    this.timedFunHighestEl = document.getElementById('timedFunHighest');
    this.unlimitedNormalHighestEl = document.getElementById('unlimitedNormalHighest');
    this.unlimitedFunHighestEl = document.getElementById('unlimitedFunHighest');
    this.unlimitedNormalBestTimeEl = document.getElementById('unlimitedNormalBestTime');
    this.unlimitedFunBestTimeEl = document.getElementById('unlimitedFunBestTime');
  }

  initGame() {
    this.game.onStateChange = () => this.render();
    this.game.onGameOver = () => this.showGameOver();
    this.game.onGameWon = () => this.showWin();
    this.game.onAchievementCheck = () => this.checkAchievements();
    this.game.onUndo = () => this.storage.incrementUndoCount();
    this.clearAllTiles();
    this.game.initGame();
  }

  bindEvents() {
    this.newGameBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.resetGame();
    });
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.resetIdleTimer();
        this.togglePause();
      });
    }
    this.shuffleBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.clearAllTiles();
      this.game.shuffle();
    });
    this.undoBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.clearAllTiles();
      this.game.undo();
    });
    this.helpBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.showHelp();
    });
    this.helpCloseBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.hideHelp();
    });

    this.settingsBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.showSettings();
    });
    this.settingsCloseBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.hideSettings();
    });
    this.settingsCloseFooterBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.hideSettings();
    });
    this.settingsTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.resetIdleTimer();
        const tabName = tab.dataset.tab;
        this.switchSettingsTab(tabName);
      });
    });

    if (this.achievementCategoryTabs) {
      const categoryTabs = this.achievementCategoryTabs.querySelectorAll('.achievement-category-tab');
      categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          this.resetIdleTimer();
          const category = tab.dataset.category;
          this.switchAchievementCategory(category);
        });
      });
    }

    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.hideSettings();
      }
    });

    if (this.themesGrid) {
      const themeCards = this.themesGrid.querySelectorAll('.theme-card');
      themeCards.forEach(card => {
        card.addEventListener('click', () => {
          this.resetIdleTimer();
          const theme = card.dataset.theme;
          this.setTheme(theme);
        });
      });
    }

    this.prevPageBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.changeHelpPage(-1);
    });
    this.nextPageBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.changeHelpPage(1);
    });
    this.pageDots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.resetIdleTimer();
        const page = parseInt(dot.dataset.page);
        this.showHelpPage(page);
      });
    });

    this.continueBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.continueGame();
    });
    this.winNewGameBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.hideWin();
      this.resetGame();
    });

    this.closeGameOverBtn.addEventListener('click', () => this.hideGameOver());
    this.gameOverNewGameBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.hideGameOver();
      this.resetGame();
    });

    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.resetIdleTimer();
        this.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        this.switchMode(mode);
        this.updateHighestScoresDisplay();
      });
    });

    this.variantButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.resetIdleTimer();
        this.variantButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const variant = btn.dataset.variant;
        this.switchVariant(variant);
        this.updateHighestScoresDisplay();
      });
    });

    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    let touchStartX = 0;
    let touchStartY = 0;

    this.boardEl.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    this.boardEl.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      const minSwipeDistance = 20;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) >= minSwipeDistance) {
          this.handleMove(dx > 0 ? 'right' : 'left');
        }
      } else {
        if (Math.abs(dy) >= minSwipeDistance) {
          this.handleMove(dy > 0 ? 'down' : 'up');
        }
      }
    }, { passive: true });

    this.helpModal.addEventListener('click', (e) => {
      if (e.target === this.helpModal) {
        this.hideHelp();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this.stopSmoothScroll();
        this.stopSettingsScroll();
      }
    });

    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  handleKeydown(e) {
    if (this.helpModal.style.display === 'flex') {
      this.handleHelpModalKeydown(e);
      return;
    }

    if (this.settingsModal.style.display === 'flex') {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.stopSettingsScroll();
        this.hideSettings();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (this.currentSettingsTab === 'achievements') {
          this.switchSettingsTab('records');
        } else if (this.currentSettingsTab === 'theme') {
          this.switchSettingsTab('achievements');
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.currentSettingsTab === 'records') {
          this.switchSettingsTab('achievements');
        } else if (this.currentSettingsTab === 'achievements') {
          this.switchSettingsTab('theme');
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.startSettingsScroll(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.startSettingsScroll(1);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        this.stopSettingsScroll();
        if (this.settingsModalBody) {
          this.settingsModalBody.scrollBy({ top: -200, behavior: 'smooth' });
        }
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        this.stopSettingsScroll();
        if (this.settingsModalBody) {
          this.settingsModalBody.scrollBy({ top: 200, behavior: 'smooth' });
        }
      }
      return;
    }

    if (this.winModal.style.display === 'flex') return;
    if (this.gameOverModal.style.display === 'flex') return;

    let direction = null;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'right';
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = 'down';
        break;
    }

    if (direction) {
      e.preventDefault();
      this.handleMove(direction);
    }
  }

  handleHelpModalKeydown(e) {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (this.helpModalBody) {
          this.startSmoothScroll(-1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (this.helpModalBody) {
          this.startSmoothScroll(1);
        }
        break;
      case 'PageUp':
        e.preventDefault();
        this.stopSmoothScroll();
        if (this.helpModalBody) {
          this.helpModalBody.scrollBy({ top: -200, behavior: 'smooth' });
        }
        break;
      case 'PageDown':
        e.preventDefault();
        this.stopSmoothScroll();
        if (this.helpModalBody) {
          this.helpModalBody.scrollBy({ top: 200, behavior: 'smooth' });
        }
        break;
      case 'Home':
        e.preventDefault();
        this.stopSmoothScroll();
        if (this.helpModalBody) {
          this.helpModalBody.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      case 'End':
        e.preventDefault();
        this.stopSmoothScroll();
        if (this.helpModalBody) {
          this.helpModalBody.scrollTo({ top: this.helpModalBody.scrollHeight, behavior: 'smooth' });
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (this.currentHelpPage > 0) {
          this.changeHelpPage(-1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (this.currentHelpPage < 2) {
          this.changeHelpPage(1);
        } else {
          this.hideHelp();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.stopSmoothScroll();
        this.hideHelp();
        break;
    }
  }

  startSmoothScroll(direction) {
    if (this.scrollDirection !== direction) {
      this.stopSmoothScroll();
      this.scrollDirection = direction;
      const scrollSpeed = 8;
      this.scrollTimer = setInterval(() => {
        if (this.helpModalBody) {
          this.helpModalBody.scrollTop += direction * scrollSpeed;
        }
      }, 16);
    }
  }

  stopSmoothScroll() {
    if (this.scrollTimer) {
      clearInterval(this.scrollTimer);
      this.scrollTimer = null;
    }
    this.scrollDirection = 0;
  }

  startSettingsScroll(direction) {
    if (this.settingsScrollDirection !== direction) {
      this.stopSettingsScroll();
      this.settingsScrollDirection = direction;
      const scrollSpeed = 8;
      this.settingsScrollTimer = setInterval(() => {
        if (this.settingsModalBody) {
          this.settingsModalBody.scrollTop += direction * scrollSpeed;
        }
      }, 16);
    }
  }

  stopSettingsScroll() {
    if (this.settingsScrollTimer) {
      clearInterval(this.settingsScrollTimer);
      this.settingsScrollTimer = null;
    }
    this.settingsScrollDirection = 0;
  }

  calculateDimensions() {
    const style = window.getComputedStyle(this.boardEl);
    const boardWidth = this.boardEl.clientWidth;
    const boardPadding = parseFloat(style.paddingLeft) || 12;
    const availableWidth = boardWidth - boardPadding * 2;
    const gap = Math.round(availableWidth * 12 / 504);
    const cellSize = Math.floor((availableWidth - gap * (BOARD_SIZE - 1)) / BOARD_SIZE);
    this.cellSize = cellSize;
    this.cellGap = gap;
    this.boardPadding = boardPadding;
  }

  getPosition(row, col) {
    return {
      left: Math.round(this.boardPadding + col * (this.cellSize + this.cellGap)),
      top: Math.round(this.boardPadding + row * (this.cellSize + this.cellGap))
    };
  }

  handleMove(direction) {
    if (this.moveQueue.length < 2) {
      this.moveQueue.push(direction);
    }
    this.processMoveQueue();
  }

  processMoveQueue() {
    if (this.isProcessingQueue || this.moveQueue.length === 0) return;

    const direction = this.moveQueue.shift();
    this.isProcessingQueue = true;
    this.resetIdleTimer();

    const preBoard = this.game.board.clone();
    const result = this.game.move(direction);

    if (result.isValid) {
      this.playAnimationsSimple(preBoard, direction, result.animations?.merges || [], () => {
        this.isProcessingQueue = false;
        this.processMoveQueue();
      });
    } else {
      this.isProcessingQueue = false;
      this.processMoveQueue();
    }
  }

  playAnimationsSimple(preBoard, direction, merges, callback) {
    this.calculateDimensions();

    const mergeSet = new Set(merges.map(m => `${m.row},${m.col}`));
    const isHorizontal = direction === 'left' || direction === 'right';
    const isReverse = direction === 'right' || direction === 'down';

    const ghosts = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = preBoard.getCell(r, c);
        if (!cell.hasValue()) continue;

        const ghost = this.createGhostTile(cell, r, c);
        this.boardEl.appendChild(ghost);
        ghosts.push({ ghost, fromR: r, fromC: c, cell: cell.clone() });
      }
    }

    this.render();

    const postBoard = this.game.board;
    const matches = this.matchGhostsByDirection(ghosts, preBoard, postBoard, mergeSet, isHorizontal, isReverse);

    const tilesToHide = new Set();
    for (const match of matches) {
      const toKey = `${match.toR},${match.toC}`;
      tilesToHide.add(toKey);
    }

    for (const key of tilesToHide) {
      const tile = this.tileElements.get(key);
      if (tile) {
        tile.style.visibility = 'hidden';
      }
    }

    for (const match of matches) {
      const pos = this.getPosition(match.toR, match.toC);
      match.ghost.style.transition = `left ${this.SLIDE_DURATION}ms ease-in-out, top ${this.SLIDE_DURATION}ms ease-in-out, opacity ${this.SLIDE_DURATION}ms ease-in-out`;
      match.ghost.style.left = `${pos.left}px`;
      match.ghost.style.top = `${pos.top}px`;
      if (match.isFadeOut) {
        match.ghost.style.opacity = '0';
      }
    }

    setTimeout(() => {
      for (const g of ghosts) {
        g.ghost.remove();
      }

      for (const key of tilesToHide) {
        const tile = this.tileElements.get(key);
        if (tile) {
          tile.style.visibility = '';
        }
      }

      for (const [r, c] of mergeSet) {
        const key = `${r},${c}`;
        const tile = this.tileElements.get(key);
        if (tile) {
          tile.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.15)' },
            { transform: 'scale(1)' }
          ], {
            duration: this.POP_DURATION,
            easing: 'ease-out'
          });
        }
      }

      setTimeout(() => {
        callback();
      }, this.POP_DURATION);
    }, this.SLIDE_DURATION);
  }

  matchGhostsByDirection(ghosts, preBoard, postBoard, mergeSet, isHorizontal, isReverse) {
    const matches = [];

    for (let lineIdx = 0; lineIdx < BOARD_SIZE; lineIdx++) {
      const lineGhosts = ghosts.filter(g =>
        isHorizontal ? g.fromR === lineIdx : g.fromC === lineIdx
      );
      if (lineGhosts.length === 0) continue;

      const lineTargets = [];
      for (let pos = 0; pos < BOARD_SIZE; pos++) {
        const r = isHorizontal ? lineIdx : pos;
        const c = isHorizontal ? pos : lineIdx;
        const cell = postBoard.getCell(r, c);
        if (cell.hasValue()) {
          lineTargets.push({ r, c, value: cell.value, isMerge: mergeSet.has(`${r},${c}`) });
        }
      }

      if (isReverse) {
        lineGhosts.sort((a, b) => isHorizontal
          ? b.fromC - a.fromC
          : b.fromR - a.fromR
        );
        lineTargets.reverse();
      } else {
        lineGhosts.sort((a, b) => isHorizontal
          ? a.fromC - b.fromC
          : a.fromR - b.fromR
        );
      }

      let gIdx = 0;
      for (let tIdx = 0; tIdx < lineTargets.length && gIdx < lineGhosts.length; tIdx++) {
        const target = lineTargets[tIdx];

        matches.push({
          ghost: lineGhosts[gIdx].ghost,
          toR: target.r,
          toC: target.c,
          isFadeOut: false
        });
        gIdx++;

        if (target.isMerge && gIdx < lineGhosts.length) {
          matches.push({
            ghost: lineGhosts[gIdx].ghost,
            toR: target.r,
            toC: target.c,
            isFadeOut: true
          });
          gIdx++;
        }
      }
    }

    return matches;
  }

  createGhostTile(cell, r, c) {
    const tile = document.createElement('div');
    tile.className = 'tile ghost-tile';
    tile.dataset.value = cell.value;
    const valueSpan = document.createElement('span');
    valueSpan.className = 'tile-value';
    valueSpan.textContent = cell.value;
    tile.appendChild(valueSpan);
    tile.style.width = `${this.cellSize}px`;
    tile.style.height = `${this.cellSize}px`;
    const pos = this.getPosition(r, c);
    tile.style.left = `${pos.left}px`;
    tile.style.top = `${pos.top}px`;
    tile.style.zIndex = '100';
    tile.style.pointerEvents = 'none';

    if (cell.isFrozenNumber()) {
      tile.classList.add('frozen');
    }
    if (cell.isTeleport()) {
      tile.classList.add('teleport');
    }
    if (cell.isChain()) {
      tile.classList.add('chain');
    }

    return tile;
  }

  resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.boardEl.classList.remove('idle-hint');
    this.idleTimer = setTimeout(() => {
      if (this.game.gameOver) return;
      const mergeablePositions = this.game.getMergeablePositions();
      if (mergeablePositions.size === 0) return;
      this.boardEl.classList.add('idle-hint');
    }, this.IDLE_TIMEOUT);
  }

  render() {
    this.calculateDimensions();
    this.renderBoard();
    this.renderScore();
    this.renderTime();
    this.updateHighestScoresDisplay();
    this.updatePauseButton();
    this.shuffleBtn.disabled = !this.game.canShuffle;
    this.undoBtn.disabled = !this.game.canUndo;
    
    this.undoCountEl.style.display = 'none';
  }

  togglePause() {
    if (this.game.gameOver) return;
    this.game.togglePause();
    this.render();
  }

  updatePauseButton() {
    if (!this.pauseBtn) return;

    this.pauseBtn.disabled = this.game.gameOver;

    if (this.game.isPaused) {
      this.pauseBtn.classList.add('paused');
      if (this.pauseIconEl) this.pauseIconEl.textContent = '▶';
      if (this.pauseTextEl) this.pauseTextEl.textContent = '继续';
      this.boardEl.classList.add('paused-overlay');
    } else {
      this.pauseBtn.classList.remove('paused');
      if (this.pauseIconEl) this.pauseIconEl.textContent = '⏸';
      if (this.pauseTextEl) this.pauseTextEl.textContent = '暂停';
      this.boardEl.classList.remove('paused-overlay');
    }
  }

  renderBoard() {
    if (!this.boardBgInitialized) {
      this.renderBackgroundCells();
      this.boardBgInitialized = true;
    }

    const mergeablePositions = this.game.getMergeablePositions();
    const currentTiles = new Map();
    const staticElements = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = this.game.board.getCell(i, j);
        const key = `${i},${j}`;
        const pos = this.getPosition(i, j);

        const isPortal = this.game.teleportPortalPosition &&
            this.game.teleportPortalPosition[0] === i &&
            this.game.teleportPortalPosition[1] === j;

        if (cell.isEmpty() && !isPortal) {
          continue;
        }

        if (cell.isWoodBlock() || (isPortal && cell.isEmpty())) {
          const tile = this.createStaticTile(cell, i, j, isPortal);
          staticElements.push({ tile, pos, key });
          continue;
        }

        let tile = this.tileElements.get(key);
        const tileData = {
          value: cell.value,
          type: cell.type,
          isFrozen: cell.isFrozenNumber(),
          isTeleport: cell.isTeleport(),
          isChain: cell.isChain(),
          isChainTarget: this.game.chainPair !== null &&
              i === this.game.chainPair.targetPos[0] &&
              j === this.game.chainPair.targetPos[1],
          isMergeable: mergeablePositions.has(key),
          chainPair: this.game.chainPair,
          iceBlockRemainingMoves: this.game.iceBlockRemainingMoves
        };

        if (!tile) {
          tile = this.createTile(tileData);
          tile.style.left = `${pos.left}px`;
          tile.style.top = `${pos.top}px`;
          this.boardEl.appendChild(tile);
        } else {
          this.updateTileContent(tile, tileData);
        }

        tile.style.left = `${pos.left}px`;
        tile.style.top = `${pos.top}px`;
        tile.style.width = `${this.cellSize}px`;
        tile.style.height = `${this.cellSize}px`;

        currentTiles.set(key, tile);
      }
    }

    for (const [key, tile] of this.tileElements) {
      if (!currentTiles.has(key)) {
        tile.remove();
      }
    }

    for (const el of this.staticTiles || []) {
      el.tile.remove();
    }
    this.staticTiles = [];

    for (const se of staticElements) {
      se.tile.style.left = `${se.pos.left}px`;
      se.tile.style.top = `${se.pos.top}px`;
      this.boardEl.appendChild(se.tile);
      this.staticTiles.push(se);
    }

    this.tileElements = currentTiles;
  }

  renderBackgroundCells() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const bgCell = document.createElement('div');
        bgCell.className = 'board-bg-cell';
        const pos = this.getPosition(i, j);
        bgCell.style.left = `${pos.left}px`;
        bgCell.style.top = `${pos.top}px`;
        bgCell.style.width = `${this.cellSize}px`;
        bgCell.style.height = `${this.cellSize}px`;
        this.boardEl.appendChild(bgCell);
      }
    }
  }

  createTile(data) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.width = `${this.cellSize}px`;
    tile.style.height = `${this.cellSize}px`;
    this.updateTileContent(tile, data);
    return tile;
  }

  updateTileContent(tile, data) {
    tile.innerHTML = '';
    const currentLeft = tile.style.left;
    const currentTop = tile.style.top;
    tile.className = 'tile';
    tile.dataset.value = data.value;
    const valueSpan = document.createElement('span');
    valueSpan.className = 'tile-value';
    valueSpan.textContent = data.value;
    tile.appendChild(valueSpan);
    tile.style.width = `${this.cellSize}px`;
    tile.style.height = `${this.cellSize}px`;
    if (currentLeft) tile.style.left = currentLeft;
    if (currentTop) tile.style.top = currentTop;

    if (data.isFrozen) {
      tile.classList.add('frozen');
      const frozenCount = document.createElement('span');
      frozenCount.className = 'frozen-count';
      frozenCount.textContent = data.iceBlockRemainingMoves;
      tile.appendChild(frozenCount);
    }

    if (data.isTeleport) {
      tile.classList.add('teleport');
      const teleportIcon = document.createElement('span');
      teleportIcon.className = 'teleport-icon';
      teleportIcon.textContent = '🌀';
      tile.appendChild(teleportIcon);
    }

    if (data.isChain) {
      tile.classList.add('chain');
      const chainIcon = document.createElement('span');
      chainIcon.className = 'chain-icon';
      chainIcon.textContent = '⛓️';
      tile.appendChild(chainIcon);
      if (data.chainPair !== null) {
        tile.classList.add('chain-bound');
        const chainCount = document.createElement('span');
        chainCount.className = 'chain-count';
        chainCount.textContent = Math.max(1, data.chainPair.remainingMoves);
        tile.appendChild(chainCount);
      }
    }

    if (data.isChainTarget) {
      tile.classList.add('chain-target');
      const chainIcon = document.createElement('span');
      chainIcon.className = 'chain-icon';
      chainIcon.textContent = '⛓️';
      tile.appendChild(chainIcon);
      const chainCount = document.createElement('span');
      chainCount.className = 'chain-count';
      chainCount.textContent = Math.max(1, data.chainPair.remainingMoves);
      tile.appendChild(chainCount);
    }

    if (data.isMergeable) {
      tile.classList.add('mergeable');
    }
  }

  createStaticTile(cell, i, j, isPortal) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.width = `${this.cellSize}px`;
    tile.style.height = `${this.cellSize}px`;

    if (cell.isWoodBlock()) {
      tile.classList.add('wood-block');
      const woodLabel = document.createElement('span');
      woodLabel.className = 'wood-label';
      woodLabel.textContent = `剩余${cell.remainingMerges}`;
      tile.appendChild(woodLabel);
    } else if (isPortal && cell.isEmpty()) {
      tile.classList.add('teleport-portal');
      const portalIcon = document.createElement('span');
      portalIcon.className = 'teleport-portal-icon';
      portalIcon.textContent = '🌀';
      tile.appendChild(portalIcon);
    }

    return tile;
  }

  clearAllTiles() {
    const tiles = this.boardEl.querySelectorAll('.tile');
    tiles.forEach(tile => tile.remove());
    const bgCells = this.boardEl.querySelectorAll('.board-bg-cell');
    bgCells.forEach(cell => cell.remove());
    this.tileElements.clear();
    this.staticTiles = [];
    this.boardBgInitialized = false;
  }

  handleResize() {
    this.calculateDimensions();
    this.clearAllTiles();
    this.render();
  }

  renderScore() {
    this.currentScoreEl.textContent = this.game.score;
  }

  renderTime() {
    this.timeDisplayEl.textContent = this.game.getFormattedTime();
    
    if (this.game.currentMode === GAME_MODE.TIMED && this.game.remainingTime <= 10 && this.game.remainingTime > 0) {
      this.timeDisplayEl.classList.add('warning');
    } else {
      this.timeDisplayEl.classList.remove('warning');
    }
  }

  updateHighestScoresDisplay() {
    this.timedNormalHighestEl.textContent = this.storage.getHighestScore(GAME_MODE.TIMED, GAME_VARIANT.NORMAL);
    this.timedFunHighestEl.textContent = this.storage.getHighestScore(GAME_MODE.TIMED, GAME_VARIANT.FUN);
    this.unlimitedNormalHighestEl.textContent = this.storage.getHighestScore(GAME_MODE.UNLIMITED, GAME_VARIANT.NORMAL);
    this.unlimitedFunHighestEl.textContent = this.storage.getHighestScore(GAME_MODE.UNLIMITED, GAME_VARIANT.FUN);

    const unlimitedNormalBestTime = this.storage.getHighestScoreTime(GAME_MODE.UNLIMITED, GAME_VARIANT.NORMAL);
    const unlimitedFunBestTime = this.storage.getHighestScoreTime(GAME_MODE.UNLIMITED, GAME_VARIANT.FUN);

    this.unlimitedNormalBestTimeEl.textContent = unlimitedNormalBestTime !== null
        ? `用时 ${this.formatTime(unlimitedNormalBestTime)}`
        : '用时 --:--';
    this.unlimitedFunBestTimeEl.textContent = unlimitedFunBestTime !== null
        ? `用时 ${this.formatTime(unlimitedFunBestTime)}`
        : '用时 --:--';
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  resetGame() {
    this.game.pauseTimer();
    this.checkAchievements();
    if (this.game.gameOver || this.game.gameWon) {
      const timeToRecord = this.game.currentMode === GAME_MODE.UNLIMITED ? this.game.elapsedSeconds : null;
      this.storage.setHighestScore(
        this.game.currentMode,
        this.game.currentVariant,
        this.game.score,
        timeToRecord
      );
    }
    this.clearAllTiles();
    this.game.initGame();
    const key = `${this.game.currentMode}_${this.game.currentVariant}`;
    delete this.savedStates[key];
    this.updateHighestScoresDisplay();
    this.resetIdleTimer();
  }

  saveCurrentState() {
    const key = `${this.game.currentMode}_${this.game.currentVariant}`;
    this.savedStates[key] = this.game.serializeState();
  }

  restoreSavedState(mode, variant) {
    const key = `${mode}_${variant}`;
    const saved = this.savedStates[key];
    if (saved) {
      this.game.restoreState(saved);
      return true;
    }
    return false;
  }

  switchMode(mode) {
    if (this.game.currentMode === mode) return;

    this.saveCurrentState();

    const variant = this.game.currentVariant;
    const key = `${mode}_${variant}`;

    this.clearAllTiles();

    if (!this.savedStates[key]) {
      this.game.currentMode = mode;
      this.game.currentVariant = variant;
      this.game.stopTimer();
      this.game.initGame();
    } else {
      this.game.currentMode = mode;
      this.game.currentVariant = variant;
      this.game.restoreState(this.savedStates[key]);
    }

    this.hideWin();
    this.hideGameOver();
    this.render();
    this.resetIdleTimer();
  }

  switchVariant(variant) {
    if (this.game.currentVariant === variant) return;

    this.saveCurrentState();

    const mode = this.game.currentMode;
    const key = `${mode}_${variant}`;

    this.clearAllTiles();

    if (!this.savedStates[key]) {
      this.game.currentMode = mode;
      this.game.currentVariant = variant;
      this.game.stopTimer();
      this.game.initGame();
    } else {
      this.game.currentMode = mode;
      this.game.currentVariant = variant;
      this.game.restoreState(this.savedStates[key]);
    }

    this.hideWin();
    this.hideGameOver();
    this.render();
    this.resetIdleTimer();
  }

  showWin() {
    this.game.isPaused = false;
    this.game.pauseTimer();
    this.checkAchievements();
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.boardEl.classList.remove('idle-hint');
    this.boardEl.classList.remove('paused-overlay');
    this.winScoreEl.textContent = this.game.score;

    if (this.game.currentMode === GAME_MODE.UNLIMITED) {
      this.winTimeItem.style.display = 'block';
      this.winTimeEl.textContent = this.game.getFormattedTime();
      const timeToRecord = this.game.elapsedSeconds;
      this.storage.setHighestScore(
        this.game.currentMode,
        this.game.currentVariant,
        this.game.score,
        timeToRecord
      );
    } else {
      this.winTimeItem.style.display = 'none';
      this.storage.setHighestScore(
        this.game.currentMode,
        this.game.currentVariant,
        this.game.score
      );
    }

    this.winModal.style.display = 'flex';
    this.updateHighestScoresDisplay();
  }

  hideWin() {
    this.winModal.style.display = 'none';
  }

  continueGame() {
    this.hideWin();
    this.game.continueAfterWin();
    this.game.resumeTimer();
  }

  showGameOver() {
    this.game.isPaused = false;
    this.game.stopTimer();
    this.checkAchievements();

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.boardEl.classList.remove('idle-hint');
    this.boardEl.classList.remove('paused-overlay');

    if (this.game.currentMode === GAME_MODE.TIMED && this.game.remainingTime <= 0) {
      this.gameOverReason.textContent = '时间耗尽！';
    } else {
      this.gameOverReason.textContent = '无法继续移动了';
    }

    this.gameOverScoreEl.textContent = this.game.score;
    this.gameOverMaxTileEl.textContent = this.game.maxTile;

    if (this.game.currentMode === GAME_MODE.UNLIMITED) {
      this.gameOverTimeItem.style.display = 'flex';
      this.gameOverTimeEl.textContent = this.game.getFormattedTime();
    } else {
      this.gameOverTimeItem.style.display = 'none';
    }

    const timeToRecord = this.game.currentMode === GAME_MODE.UNLIMITED ? this.game.elapsedSeconds : null;
    this.storage.setHighestScore(
      this.game.currentMode,
      this.game.currentVariant,
      this.game.score,
      timeToRecord
    );

    this.gameOverModal.style.display = 'flex';
    this.updateHighestScoresDisplay();
  }

  hideGameOver() {
    this.gameOverModal.style.display = 'none';
  }

  showHelp() {
    this.currentHelpPage = 0;
    this.showHelpPage(0);
    this.helpModal.style.display = 'flex';
    if (!this.game.isPaused) {
      this.game.pauseTimer();
    }
  }

  hideHelp() {
    this.stopSmoothScroll();
    this.helpModal.style.display = 'none';
    if (!this.game.isPaused) {
      this.game.resumeTimer();
    }
  }

  changeHelpPage(delta) {
    const newPage = this.currentHelpPage + delta;
    if (newPage >= 0 && newPage <= 2) {
      this.showHelpPage(newPage);
    }
  }

  showHelpPage(page) {
    this.currentHelpPage = page;
    const pages = this.helpPages.querySelectorAll('.help-page');
    pages.forEach((p, index) => {
      p.classList.toggle('active', index === page);
    });

    this.pageDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === page);
    });

    this.prevPageBtn.disabled = page === 0;
    this.nextPageBtn.textContent = page === 2 ? '开始游戏' : '下一页';

    if (this.helpModalBody) {
      this.helpModalBody.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (page === 2) {
      this.nextPageBtn.onclick = () => this.hideHelp();
    } else {
      this.nextPageBtn.onclick = () => this.changeHelpPage(1);
    }
  }

  showSettings() {
    this.settingsModal.style.display = 'flex';
    if (!this.game.isPaused) {
      this.game.pauseTimer();
    }
    this.currentAchievementCategory = 'all';
    if (this.achievementCategoryTabs) {
      const categoryTabs = this.achievementCategoryTabs.querySelectorAll('.achievement-category-tab');
      categoryTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === 'all');
      });
    }
    this.renderAchievements();
    this.updateHighestScoresDisplay();
    this.updateThemeSelection();
  }

  updateThemeSelection() {
    if (this.themesGrid) {
      const themeCards = this.themesGrid.querySelectorAll('.theme-card');
      themeCards.forEach(card => {
        card.classList.toggle('active', card.dataset.theme === this.currentTheme);
      });
    }
  }

  loadTheme() {
    try {
      const savedTheme = localStorage.getItem('game2048_theme');
      if (savedTheme) {
        this.setTheme(savedTheme, false);
      }
    } catch (e) {
      console.error('Failed to load theme:', e);
    }
  }

  setTheme(theme, save = true) {
    document.body.classList.remove('theme-dark', 'theme-ocean', 'theme-forest');
    
    if (theme !== 'classic') {
      document.body.classList.add(`theme-${theme}`);
    }
    
    this.currentTheme = theme;
    
    if (save) {
      try {
        localStorage.setItem('game2048_theme', theme);
      } catch (e) {
        console.error('Failed to save theme:', e);
      }
    }
    
    this.updateThemeSelection();
  }

  hideSettings() {
    this.settingsModal.style.display = 'none';
    if (!this.game.isPaused) {
      this.game.resumeTimer();
    }
  }

  switchSettingsTab(tabName) {
    this.currentSettingsTab = tabName;
    this.settingsTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    this.settingsPages.forEach(page => {
      page.classList.toggle('active', page.id === `${tabName}Page`);
    });
    if (tabName === 'achievements') {
      this.renderAchievements();
    } else if (tabName === 'theme') {
      this.updateThemeSelection();
    } else {
      this.updateHighestScoresDisplay();
    }
  }

  checkAchievements() {
    const gameState = this.game.getAchievementState();

    if (gameState.woodBlocksCleared > 0) {
      this.storage.incrementWoodCleared(gameState.woodBlocksCleared);
      this.game.woodBlocksClearedThisGame = 0;
    }
    if (gameState.iceBlocksCleared > 0) {
      this.storage.incrementIceCleared(gameState.iceBlocksCleared);
      this.game.iceBlocksClearedThisGame = 0;
    }

    const fullState = {
      maxTile: gameState.maxTile,
      score: gameState.score,
      elapsedSeconds: gameState.elapsedSeconds,
      woodBlocksCleared: this.storage.totalWoodCleared,
      iceBlocksCleared: this.storage.totalIceCleared,
      undoCount: this.storage.totalUndoCount,
      tile4096Count: gameState.tile4096Count,
      tile2048Count: gameState.tile2048Count,
      fastIceCleared: gameState.fastIceCleared,
      fastWoodCleared: gameState.fastWoodCleared,
      currentMode: gameState.currentMode
    };

    for (const achievement of ACHIEVEMENTS) {
      if (!this.storage.isAchievementUnlocked(achievement.id)) {
        if (achievement.check(fullState)) {
          this.storage.unlockAchievement(achievement.id);
          this.showAchievementToast(achievement);
        }
      }
    }

    this.game.fastIceCleared = 0;
    this.game.fastWoodCleared = 0;
  }

  showAchievementToast(achievement) {
    this.achievementToastTitle.textContent = '成就解锁';
    this.achievementToastDesc.textContent = `${achievement.icon} ${achievement.name}`;
    this.achievementToast.style.display = 'flex';
    this.achievementToast.classList.remove('hiding');

    if (this.achievementToastTimer) {
      clearTimeout(this.achievementToastTimer);
    }

    this.achievementToastTimer = setTimeout(() => {
      this.achievementToast.classList.add('hiding');
      setTimeout(() => {
        this.achievementToast.style.display = 'none';
      }, 400);
    }, 3000);
  }

  switchAchievementCategory(category) {
    this.currentAchievementCategory = category;
    if (this.achievementCategoryTabs) {
      const categoryTabs = this.achievementCategoryTabs.querySelectorAll('.achievement-category-tab');
      categoryTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
      });
    }
    this.renderAchievements();
  }

  renderAchievements() {
    this.achievementsGrid.innerHTML = '';
    const filteredAchievements = this.currentAchievementCategory === 'all'
      ? ACHIEVEMENTS
      : ACHIEVEMENTS.filter(a => a.category === this.currentAchievementCategory);

    for (const achievement of filteredAchievements) {
      const unlocked = this.storage.isAchievementUnlocked(achievement.id);
      const card = document.createElement('div');
      card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
      const conditionHtml = unlocked && achievement.condition
        ? `<div class="achievement-condition">达成条件：${achievement.condition}</div>`
        : '';
      card.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.desc}</div>
          ${conditionHtml}
        </div>
      `;
      this.achievementsGrid.appendChild(card);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new UI();
});
