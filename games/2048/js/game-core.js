class Game2048 {
  constructor() {
    this.board = new GameBoard();
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this._continueAfterWin = false;
    this.timerStarted = false;
    this.isPaused = false;
    this.currentMode = GAME_MODE.UNLIMITED;
    this.currentVariant = GAME_VARIANT.NORMAL;
    this.elapsedSeconds = 0;
    this.gameTimer = null;
    this.iceBlockPosition = null;
    this.iceBlockRemainingMoves = 0;
    this.iceBlockHadMerge = false;
    this.woodBlockCooldown = 0;
    this.iceBlockCooldown = 0;
    this.teleportPortalPosition = null;
    this.teleportPortalCooldown = 0;
    this.chainPair = null;
    this.history = [];
    this.woodBlocksClearedThisGame = 0;
    this.iceBlocksClearedThisGame = 0;
    this.undoCountThisGame = 0;
    this.tile4096Count = 0;
    this.tile2048Count = 0;
    this.woodBlockSpawnMove = null;
    this.iceBlockSpawnMove = null;
    this.moveCount = 0;
    this.fastIceCleared = 0;
    this.fastWoodCleared = 0;
    this.undoRemaining = UNDO_LIMIT;
    this.shuffleUsed = false;
    this.chainCooldown = 0;
    this.onStateChange = null;
    this.onGameOver = null;
    this.onGameWon = null;
    this.onAchievementCheck = null;
    this.onUndo = null;
  }

  initGame() {
    this.board = new GameBoard();
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this._continueAfterWin = false;
    this.elapsedSeconds = 0;
    this.timerStarted = false;
    this.isPaused = false;
    this.iceBlockPosition = null;
    this.iceBlockRemainingMoves = 0;
    this.iceBlockHadMerge = false;
    this.woodBlockCooldown = 0;
    this.iceBlockCooldown = 0;
    this.teleportPortalPosition = null;
    this.teleportPortalCooldown = 0;
    this.chainPair = null;
    this.history = [];
    this.woodBlocksClearedThisGame = 0;
    this.iceBlocksClearedThisGame = 0;
    this.undoCountThisGame = 0;
    this.tile4096Count = 0;
    this.tile2048Count = 0;
    this.woodBlockSpawnMove = null;
    this.iceBlockSpawnMove = null;
    this.moveCount = 0;
    this.fastIceCleared = 0;
    this.fastWoodCleared = 0;
    this.undoRemaining = UNDO_LIMIT;
    this.shuffleUsed = false;
    this.chainCooldown = 0;

    this.addRandomTile();
    this.addRandomTile();

    if (this.currentVariant === GAME_VARIANT.FUN) {
      this.trySpawnWoodBlock();
      this.trySpawnIceBlock();
      this.trySpawnTeleportPortal();
    }

    this.notifyStateChange();
  }

  serializeState() {
    return {
      board: this.board.board.map(row => row.map(cell => ({
        type: cell.type,
        value: cell.value,
        remainingMerges: cell.remainingMerges,
        remainingMoves: cell.remainingMoves
      }))),
      score: this.score,
      gameOver: this.gameOver,
      gameWon: this.gameWon,
      _continueAfterWin: this._continueAfterWin,
      timerStarted: this.timerStarted,
      isPaused: this.isPaused,
      currentMode: this.currentMode,
      currentVariant: this.currentVariant,
      elapsedSeconds: this.elapsedSeconds,
      iceBlockPosition: this.iceBlockPosition ? [...this.iceBlockPosition] : null,
      iceBlockRemainingMoves: this.iceBlockRemainingMoves,
      iceBlockHadMerge: this.iceBlockHadMerge,
      woodBlockCooldown: this.woodBlockCooldown,
      iceBlockCooldown: this.iceBlockCooldown,
      teleportPortalPosition: this.teleportPortalPosition ? [...this.teleportPortalPosition] : null,
      teleportPortalCooldown: this.teleportPortalCooldown,
      chainPair: this.chainPair ? {
        chainPos: [...this.chainPair.chainPos],
        targetPos: [...this.chainPair.targetPos],
        targetValue: this.chainPair.targetValue,
        remainingMoves: this.chainPair.remainingMoves
      } : null,
      chainCooldown: this.chainCooldown,
      shuffleUsed: this.shuffleUsed,
      history: this.history.map(snap => ({
        board: snap.board.board.map(row => row.map(cell => ({
          type: cell.type,
          value: cell.value,
          remainingMerges: cell.remainingMerges,
          remainingMoves: cell.remainingMoves
        }))),
        score: snap.score,
        iceBlockPosition: snap.iceBlockPosition ? [...snap.iceBlockPosition] : null,
        iceBlockRemainingMoves: snap.iceBlockRemainingMoves,
        teleportPortalPosition: snap.teleportPortalPosition ? [...snap.teleportPortalPosition] : null,
        chainPair: snap.chainPair ? {
          chainPos: [...snap.chainPair.chainPos],
          targetPos: [...snap.chainPair.targetPos],
          targetValue: snap.chainPair.targetValue,
          remainingMoves: snap.chainPair.remainingMoves
        } : null,
        elapsedSeconds: snap.elapsedSeconds,
        timerStarted: snap.timerStarted,
        shuffleUsed: snap.shuffleUsed || false,
        chainCooldown: snap.chainCooldown || 0
      })),
      woodBlocksClearedThisGame: this.woodBlocksClearedThisGame,
      iceBlocksClearedThisGame: this.iceBlocksClearedThisGame,
      undoCountThisGame: this.undoCountThisGame,
      tile4096Count: this.tile4096Count,
      tile2048Count: this.tile2048Count,
      woodBlockSpawnMove: this.woodBlockSpawnMove,
      iceBlockSpawnMove: this.iceBlockSpawnMove,
      moveCount: this.moveCount,
      fastIceCleared: this.fastIceCleared,
      fastWoodCleared: this.fastWoodCleared,
      undoRemaining: this.undoRemaining
    };
  }

  restoreState(data) {
    this.stopTimer();

    const newBoard = new GameBoard();
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cellData = data.board[i][j];
        newBoard.board[i][j] = new Cell(
          cellData.type,
          cellData.value,
          cellData.remainingMerges,
          cellData.remainingMoves
        );
      }
    }
    this.board = newBoard;

    this.score = data.score;
    this.gameOver = data.gameOver;
    this.gameWon = data.gameWon;
    this._continueAfterWin = data._continueAfterWin;
    this.timerStarted = data.timerStarted;
    this.isPaused = data.isPaused;
    this.currentMode = data.currentMode;
    this.currentVariant = data.currentVariant;
    this.elapsedSeconds = data.elapsedSeconds;
    this.iceBlockPosition = data.iceBlockPosition ? [...data.iceBlockPosition] : null;
    this.iceBlockRemainingMoves = data.iceBlockRemainingMoves;
    this.iceBlockHadMerge = data.iceBlockHadMerge;
    this.woodBlockCooldown = data.woodBlockCooldown;
    this.iceBlockCooldown = data.iceBlockCooldown;
    this.teleportPortalPosition = data.teleportPortalPosition ? [...data.teleportPortalPosition] : null;
    this.teleportPortalCooldown = data.teleportPortalCooldown || 0;
    this.chainPair = data.chainPair ? {
      chainPos: [...data.chainPair.chainPos],
      targetPos: [...data.chainPair.targetPos],
      targetValue: data.chainPair.targetValue,
      remainingMoves: data.chainPair.remainingMoves
    } : null;
    this.chainCooldown = data.chainCooldown || 0;

    this.history = data.history.map(snapData => {
      const snapBoard = new GameBoard();
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          const cellData = snapData.board[i][j];
          snapBoard.board[i][j] = new Cell(
            cellData.type,
            cellData.value,
            cellData.remainingMerges,
            cellData.remainingMoves
          );
        }
      }
      return new GameSnapshot(
        snapBoard,
        snapData.score,
        snapData.iceBlockPosition ? [...snapData.iceBlockPosition] : null,
        snapData.iceBlockRemainingMoves,
        snapData.teleportPortalPosition ? [...snapData.teleportPortalPosition] : null,
        snapData.chainPair ? {
          chainPos: [...snapData.chainPair.chainPos],
          targetPos: [...snapData.chainPair.targetPos],
          targetValue: snapData.chainPair.targetValue,
          remainingMoves: snapData.chainPair.remainingMoves
        } : null,
        snapData.elapsedSeconds,
        snapData.timerStarted,
        snapData.shuffleUsed || false,
        snapData.chainCooldown || 0
      );
    });

    this.woodBlocksClearedThisGame = data.woodBlocksClearedThisGame;
    this.iceBlocksClearedThisGame = data.iceBlocksClearedThisGame;
    this.undoCountThisGame = data.undoCountThisGame;
    this.tile4096Count = data.tile4096Count;
    this.tile2048Count = data.tile2048Count || 0;
    this.woodBlockSpawnMove = data.woodBlockSpawnMove !== undefined ? data.woodBlockSpawnMove : null;
    this.iceBlockSpawnMove = data.iceBlockSpawnMove !== undefined ? data.iceBlockSpawnMove : null;
    this.moveCount = data.moveCount || 0;
    this.fastIceCleared = data.fastIceCleared || 0;
    this.fastWoodCleared = data.fastWoodCleared || 0;
    this.undoRemaining = data.undoRemaining !== undefined ? data.undoRemaining : UNDO_LIMIT;
    this.shuffleUsed = data.shuffleUsed || false;

    if (this.timerStarted && !this.gameOver) {
      this.resumeTimer();
    }
  }

  togglePause() {
    if (this.gameOver) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pauseTimer();
    } else {
      this.resumeTimer();
    }

    this.notifyStateChange();
    return this.isPaused;
  }

  get canUndo() {
    return this.history.length > 0;
  }

  get canShuffle() {
    return !this.shuffleUsed && !this.gameOver;
  }

  shuffle() {
    if (this.shuffleUsed || this.gameOver) return false;

    const originalBoard = this.board.clone();
    const originalChainCooldown = this.chainCooldown;
    const originalChainPair = this.chainPair ? {
      chainPos: [...this.chainPair.chainPos],
      targetPos: [...this.chainPair.targetPos],
      targetValue: this.chainPair.targetValue,
      remainingMoves: this.chainPair.remainingMoves
    } : null;

    const cellsWithValues = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = this.board.getCell(i, j);
        if (cell.hasValue()) {
          cellsWithValues.push({ row: i, col: j, cell: cell.clone() });
        }
      }
    }

    for (let i = cellsWithValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellsWithValues[i], cellsWithValues[j]] = [cellsWithValues[j], cellsWithValues[i]];
    }

    const emptyPositions = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        emptyPositions.push([i, j]);
      }
    }

    for (let i = emptyPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [emptyPositions[i], emptyPositions[j]] = [emptyPositions[j], emptyPositions[i]];
    }

    const newBoard = new GameBoard();
    const positionMap = new Map();
    for (let k = 0; k < cellsWithValues.length; k++) {
      const [r, c] = emptyPositions[k];
      newBoard.setCell(r, c, cellsWithValues[k].cell);
      positionMap.set(`${cellsWithValues[k].row},${cellsWithValues[k].col}`, [r, c]);
    }

    this.board = newBoard;
    this.shuffleUsed = true;

    if (this.chainPair) {
      const chainKey = `${this.chainPair.chainPos[0]},${this.chainPair.chainPos[1]}`;
      const targetKey = `${this.chainPair.targetPos[0]},${this.chainPair.targetPos[1]}`;
      const newChainPos = positionMap.get(chainKey);
      const newTargetPos = positionMap.get(targetKey);
      
      if (newChainPos && newTargetPos) {
        this.chainPair.chainPos = newChainPos;
        this.chainPair.targetPos = newTargetPos;
      } else {
        this.chainPair = null;
      }
    }

    this.history.push(new GameSnapshot(
      originalBoard,
      this.score,
      this.iceBlockPosition ? [...this.iceBlockPosition] : null,
      this.iceBlockRemainingMoves,
      this.teleportPortalPosition ? [...this.teleportPortalPosition] : null,
      originalChainPair,
      this.elapsedSeconds,
      this.timerStarted,
      false,
      originalChainCooldown
    ));

    this.notifyStateChange();
    return true;
  }

  undo() {
    if (this.history.length === 0) return;
    const snapshot = this.history.pop();
    const wasGameOver = this.gameOver;
    this.board = snapshot.board;
    this.score = snapshot.score;
    this.iceBlockPosition = snapshot.iceBlockPosition;
    this.iceBlockRemainingMoves = snapshot.iceBlockRemainingMoves;
    this.teleportPortalPosition = snapshot.teleportPortalPosition ? [...snapshot.teleportPortalPosition] : null;
    this.chainPair = snapshot.chainPair ? {
      chainPos: [...snapshot.chainPair.chainPos],
      targetPos: [...snapshot.chainPair.targetPos],
      targetValue: snapshot.chainPair.targetValue,
      remainingMoves: snapshot.chainPair.remainingMoves
    } : null;
    this.chainCooldown = snapshot.chainCooldown || 0;
    this.shuffleUsed = snapshot.shuffleUsed || false;
    if (!wasGameOver) {
      this.elapsedSeconds = snapshot.elapsedSeconds;
    }
    this.timerStarted = snapshot.timerStarted;
    this.gameOver = false;
    this.gameWon = false;
    this._continueAfterWin = false;
    this.isPaused = false;
    this.undoCountThisGame++;
    if (this.onUndo) this.onUndo();
    if (this.timerStarted) {
      this.resumeTimer();
    }
    this.notifyStateChange();
    if (this.onAchievementCheck) this.onAchievementCheck();
  }

  setMode(mode) {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      this.stopTimer();
      this.initGame();
    }
  }

  setVariant(variant) {
    if (this.currentVariant !== variant) {
      this.currentVariant = variant;
      this.stopTimer();
      this.initGame();
    }
  }

  startTimer() {
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.timerStarted = true;
    this.gameTimer = setInterval(() => {
      this.elapsedSeconds++;
      this.notifyStateChange();

      if (this.currentMode === GAME_MODE.TIMED &&
          this.elapsedSeconds >= TIMED_MODE_DURATION) {
        this.gameOver = true;
        this.stopTimer();
        this.notifyStateChange();
        if (this.onGameOver) this.onGameOver();
      }

      if (this.elapsedSeconds % 60 === 0 && this.onAchievementCheck) {
        this.onAchievementCheck();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    this.timerStarted = false;
  }

  startTimerIfNeeded() {
    if (!this.timerStarted) {
      this.startTimer();
    }
  }

  pauseTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  resumeTimer() {
    if (this.gameOver && !this._continueAfterWin) return;
    if (!this.timerStarted) return;

    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    this.gameTimer = setInterval(() => {
      this.elapsedSeconds++;
      this.notifyStateChange();

      if (this.currentMode === GAME_MODE.TIMED &&
          this.elapsedSeconds >= TIMED_MODE_DURATION) {
        this.gameOver = true;
        this.stopTimer();
        this.notifyStateChange();
        if (this.onGameOver) this.onGameOver();
      }
      if (this.elapsedSeconds % 60 === 0 && this.onAchievementCheck) {
        this.onAchievementCheck();
      }
    }, 1000);
  }

  move(direction) {
    if (this.gameOver && !this._continueAfterWin) {
      return { isValid: false, scoreAdded: 0, animations: null };
    }

    if (this.isPaused) {
      this.isPaused = false;
      this.resumeTimer();
    }

    const originalBoard = this.board.clone();
    const originalChainCooldown = this.chainCooldown;
    let scoreAdded = 0;
    const mergePositions = [];

    const hadChainBefore = this.hasChainCell();
    const wasBoundBefore = this.chainPair !== null;
    const originalChainPair = wasBoundBefore ? {
      chainPos: [...this.chainPair.chainPos],
      targetPos: [...this.chainPair.targetPos],
      targetValue: this.chainPair.targetValue,
      remainingMoves: this.chainPair.remainingMoves
    } : null;

    this.prepareChainForMovement(direction);

    switch (direction) {
      case 'left':
        scoreAdded = this.moveLeft(mergePositions);
        break;
      case 'right':
        scoreAdded = this.moveRight(mergePositions);
        break;
      case 'up':
        scoreAdded = this.moveUp(mergePositions);
        break;
      case 'down':
        scoreAdded = this.moveDown(mergePositions);
        break;
    }

    if (hadChainBefore && !wasBoundBefore) {
      this.tryBindChain(direction);
    }

    this.restoreChainBlockedMovement(originalBoard, mergePositions, direction);

    this.finalizeChainMovement();

    if (this.chainPair !== null && wasBoundBefore) {
      this.updateChainPairAfterMerge(mergePositions, originalBoard);
    }

    if (this.chainPair !== null && wasBoundBefore) {
      this.maintainChainAdjacency(direction);
    }

    const isValid = !originalBoard.equals(this.board);
    const merges = [];

    if (isValid) {
      if (this.chainPair !== null && wasBoundBefore) {
        this.updateChainTimer(mergePositions, originalBoard, originalChainPair);
      }
      for (const [r, c] of mergePositions) {
        const cell = this.board.getCell(r, c);
        if (cell.hasValue()) {
          merges.push({ row: r, col: c, value: cell.value });
        }
      }

      this.history.push(new GameSnapshot(
        originalBoard,
        this.score,
        this.iceBlockPosition ? [...this.iceBlockPosition] : null,
        this.iceBlockRemainingMoves,
        this.teleportPortalPosition ? [...this.teleportPortalPosition] : null,
        wasBoundBefore ? originalChainPair : (this.chainPair ? {
          chainPos: [...this.chainPair.chainPos],
          targetPos: [...this.chainPair.targetPos],
          targetValue: this.chainPair.targetValue,
          remainingMoves: this.chainPair.remainingMoves
        } : null),
        this.elapsedSeconds,
        this.timerStarted,
        this.shuffleUsed,
        originalChainCooldown
      ));

      this.startTimerIfNeeded();
      this.score += scoreAdded;
      this.moveCount++;

      if (this.currentVariant === GAME_VARIANT.FUN) {
        this.processFunModeAfterMove(mergePositions, direction, originalBoard);
      }

      this.updateTile4096Count(originalBoard);

      this.addRandomTile(direction);

      this.checkGameState();
      this.notifyStateChange();
      if (this.onAchievementCheck) this.onAchievementCheck();
    }

    return { isValid, scoreAdded, animations: { merges } };
  }

  addRandomTile(direction = null) {
    const emptyCells = this.board.getEmptyCells();
    if (emptyCells.length === 0) return null;

    let candidateCells = [];

    if (direction !== null) {
      switch (direction) {
        case 'left':
          candidateCells = emptyCells.filter(([, c]) => c === 3);
          break;
        case 'right':
          candidateCells = emptyCells.filter(([, c]) => c === 0);
          break;
        case 'up':
          candidateCells = emptyCells.filter(([r]) => r === 3);
          break;
        case 'down':
          candidateCells = emptyCells.filter(([r]) => r === 0);
          break;
      }
    }

    if (candidateCells.length === 0) {
      candidateCells = emptyCells.filter(([r, c]) => {
        return r === 0 || r === 3 || c === 0 || c === 3;
      });
    }

    if (candidateCells.length === 0) {
      candidateCells = emptyCells;
    }

    const position = candidateCells[Math.floor(Math.random() * candidateCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;

    const isIcePos = this.iceBlockPosition !== null &&
        position[0] === this.iceBlockPosition[0] &&
        position[1] === this.iceBlockPosition[1];

    const isPortalPos = this.teleportPortalPosition !== null &&
        position[0] === this.teleportPortalPosition[0] &&
        position[1] === this.teleportPortalPosition[1];

    let finalPosition = null;

    if (isIcePos) {
      this.board.setCell(
        position[0],
        position[1],
        Cell.frozenNumber(value, this.iceBlockRemainingMoves)
      );
      finalPosition = [position[0], position[1], value];
    } else if (isPortalPos) {
      const otherEmpty = candidateCells.filter(([r, c]) => !(r === position[0] && c === position[1]));
      if (otherEmpty.length > 0) {
        const newPos = otherEmpty[Math.floor(Math.random() * otherEmpty.length)];
        this.board.setValue(newPos[0], newPos[1], value);
        finalPosition = [newPos[0], newPos[1], value];
      } else {
        const fallbackEmpty = emptyCells.filter(([r, c]) => !(r === position[0] && c === position[1]));
        if (fallbackEmpty.length > 0) {
          const newPos = fallbackEmpty[Math.floor(Math.random() * fallbackEmpty.length)];
          this.board.setValue(newPos[0], newPos[1], value);
          finalPosition = [newPos[0], newPos[1], value];
        }
      }
    } else if (this.currentVariant === GAME_VARIANT.FUN && Math.random() < 0.05 && 
               !this.hasChainCell() && this.chainCooldown === 0 && this.canSpawnModule()) {
      this.board.setCell(position[0], position[1], Cell.chain(value));
      finalPosition = [position[0], position[1], value];
    } else {
      this.board.setValue(position[0], position[1], value);
      finalPosition = [position[0], position[1], value];
    }

    return finalPosition;
  }

  checkGameState() {
    if (!this.gameWon) {
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (this.board.getValue(i, j) >= 2048) {
            this.gameWon = true;
            if (this.onGameWon) this.onGameWon();
            return;
          }
        }
      }
    }

    this.gameOver = this.isGameOver();
    if (this.gameOver && this.onGameOver) {
      this.onGameOver();
    }
  }

  isGameOver() {
    if (this.currentMode === GAME_MODE.TIMED &&
        this.elapsedSeconds >= TIMED_MODE_DURATION) {
      return true;
    }

    if (this.board.getEmptyCells().length > 0) {
      return false;
    }

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE - 1; j++) {
        const cell1 = this.board.getCell(i, j);
        const cell2 = this.board.getCell(i, j + 1);
        if (cell1.hasValue() && cell2.hasValue() && cell1.value === cell2.value) {
          return false;
        }
      }
    }

    for (let i = 0; i < BOARD_SIZE - 1; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell1 = this.board.getCell(i, j);
        const cell2 = this.board.getCell(i + 1, j);
        if (cell1.hasValue() && cell2.hasValue() && cell1.value === cell2.value) {
          return false;
        }
      }
    }

    return true;
  }

  continueAfterWin() {
    this._continueAfterWin = true;
  }

  getFormattedTime() {
    const timeToShow = this.currentMode === GAME_MODE.TIMED
        ? Math.max(0, TIMED_MODE_DURATION - this.elapsedSeconds)
        : this.elapsedSeconds;

    const minutes = Math.floor(timeToShow / 60);
    const seconds = timeToShow % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  get remainingTime() {
    if (this.currentMode === GAME_MODE.TIMED) {
      return Math.max(0, TIMED_MODE_DURATION - this.elapsedSeconds);
    }
    return this.elapsedSeconds;
  }

  get maxTile() {
    let maxValue = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const value = this.board.getValue(i, j);
        if (value > maxValue) {
          maxValue = value;
        }
      }
    }
    return maxValue;
  }

  getMergeablePositions() {
    const mergeable = new Set();
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = this.board.getCell(i, j);
        if (!cell.hasValue()) continue;
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dr, dc] of directions) {
          const nr = i + dr;
          const nc = j + dc;
          if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
          const neighbor = this.board.getCell(nr, nc);
          if (neighbor.hasValue() && neighbor.value === cell.value) {
            mergeable.add(`${i},${j}`);
            mergeable.add(`${nr},${nc}`);
            break;
          }
        }
      }
    }
    return mergeable;
  }

  countTile4096(board) {
    let count = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board.getValue(i, j) === 4096) {
          count++;
        }
      }
    }
    return count;
  }

  updateTile4096Count(originalBoard) {
    const newCount4096 = this.countTile4096(this.board);
    const oldCount4096 = this.countTile4096(originalBoard);
    if (newCount4096 > oldCount4096) {
      this.tile4096Count += (newCount4096 - oldCount4096);
    }

    const newCount2048 = this.countTile2048(this.board);
    const oldCount2048 = this.countTile2048(originalBoard);
    if (newCount2048 > oldCount2048) {
      this.tile2048Count += (newCount2048 - oldCount2048);
    }
  }

  countTile2048(board) {
    let count = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board.getValue(i, j) === 2048) {
          count++;
        }
      }
    }
    return count;
  }

  getAchievementState() {
    return {
      maxTile: this.maxTile,
      score: this.score,
      elapsedSeconds: this.elapsedSeconds,
      woodBlocksCleared: this.woodBlocksClearedThisGame,
      iceBlocksCleared: this.iceBlocksClearedThisGame,
      undoCount: this.undoCountThisGame,
      tile4096Count: this.tile4096Count,
      tile2048Count: this.tile2048Count,
      fastIceCleared: this.fastIceCleared,
      fastWoodCleared: this.fastWoodCleared,
      currentMode: this.currentMode
    };
  }

  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}
