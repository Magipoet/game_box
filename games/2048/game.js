const BOARD_SIZE = 4;
const TIMED_MODE_DURATION = 10 * 60;
const WOOD_BLOCK_REQUIRED_MERGES = 3;
const ICE_BLOCK_MAX_MOVES = 8;
const COOLDOWN_MOVES = 5;

const CELL_TYPE = {
  EMPTY: 'empty',
  NUMBER: 'number',
  WOOD_BLOCK: 'woodBlock',
  FROZEN_NUMBER: 'frozenNumber'
};

const GAME_MODE = {
  TIMED: 'timed',
  UNLIMITED: 'unlimited'
};

const GAME_VARIANT = {
  NORMAL: 'normal',
  FUN: 'fun'
};

const ACHIEVEMENTS = [
  { id: 'tile_4', name: '初出茅庐', desc: '首次合成 4', icon: '4️⃣', check: (s) => s.maxTile >= 4 },
  { id: 'tile_8', name: '小试牛刀', desc: '首次合成 8', icon: '8️⃣', check: (s) => s.maxTile >= 8 },
  { id: 'tile_16', name: '渐入佳境', desc: '首次合成 16', icon: '🔢', check: (s) => s.maxTile >= 16 },
  { id: 'tile_32', name: '崭露头角', desc: '首次合成 32', icon: '3️⃣', check: (s) => s.maxTile >= 32 },
  { id: 'tile_64', name: '牛刀小试', desc: '首次合成 64', icon: '6️⃣', check: (s) => s.maxTile >= 64 },
  { id: 'tile_128', name: '步步为营', desc: '首次合成 128', icon: '1️⃣', check: (s) => s.maxTile >= 128 },
  { id: 'tile_256', name: '乘风破浪', desc: '首次合成 256', icon: '2️⃣', check: (s) => s.maxTile >= 256 },
  { id: 'tile_512', name: '势如破竹', desc: '首次合成 512', icon: '5️⃣', check: (s) => s.maxTile >= 512 },
  { id: 'tile_1024', name: '百尺竿头', desc: '首次合成 1024', icon: '🔟', check: (s) => s.maxTile >= 1024 },
  { id: 'tile_2048', name: '奇迹诞生', desc: '合成 2048，通关游戏！', icon: '🏆', check: (s) => s.maxTile >= 2048 },
  { id: 'tile_4096', name: '超越极限', desc: '在奇迹之上，再创奇迹…', icon: '🌟', check: (s) => s.maxTile >= 4096 },
  { id: 'tile_8192', name: '登峰造极', desc: '极致之上，仍有远方…', icon: '👑', check: (s) => s.maxTile >= 4096 && s.tile4096Count >= 3 },
  { id: 'score_1000', name: '初露锋芒', desc: '单局得分超过 1000', icon: '💯', check: (s) => s.score >= 1000 },
  { id: 'score_5000', name: '小有成就', desc: '单局得分超过 5000', icon: '⭐', check: (s) => s.score >= 5000 },
  { id: 'score_10000', name: '积分达人', desc: '单局得分超过 10000', icon: '✨', check: (s) => s.score >= 10000 },
  { id: 'score_20000', name: '积分大师', desc: '单局得分超过 20000', icon: '💎', check: (s) => s.score >= 20000 },
  { id: 'fast_win', name: '神速通关', desc: '5 分钟内合成 2048', icon: '⚡', check: (s) => s.maxTile >= 2048 && s.elapsedSeconds <= 300 },
  { id: 'wood_breaker', name: '破木工匠', desc: '消除一个木块', icon: '🪵', check: (s) => s.woodBlocksCleared >= 1 },
  { id: 'wood_master', name: '伐木大师', desc: '累计消除 5 个木块', icon: '🪓', check: (s) => s.woodBlocksCleared >= 5 },
  { id: 'ice_breaker', name: '破冰者', desc: '消除一个冰块', icon: '❄️', check: (s) => s.iceBlocksCleared >= 1 },
  { id: 'ice_master', name: '冰霜行者', desc: '累计消除 5 个冰块', icon: '🧊', check: (s) => s.iceBlocksCleared >= 5 },
  { id: 'undo_user', name: '时间回溯', desc: '首次使用撤回功能', icon: '↶', check: (s) => s.undoCount >= 1 },
  { id: 'undo_master', name: '时光掌控者', desc: '累计使用撤回 10 次', icon: '⏪', check: (s) => s.undoCount >= 10 },
  { id: 'marathon', name: '马拉松', desc: '单局游戏超过 30 分钟', icon: '🏃', check: (s) => s.elapsedSeconds >= 1800 },
];

class Cell {
  constructor(type = CELL_TYPE.EMPTY, value = 0, remainingMerges = null, remainingMoves = null) {
    this.type = type;
    this.value = value;
    this.remainingMerges = remainingMerges;
    this.remainingMoves = remainingMoves;
  }

  static empty() {
    return new Cell(CELL_TYPE.EMPTY);
  }

  static number(value) {
    return new Cell(CELL_TYPE.NUMBER, value);
  }

  static woodBlock(remainingMerges) {
    return new Cell(CELL_TYPE.WOOD_BLOCK, 0, remainingMerges);
  }

  static frozenNumber(value, remainingMoves) {
    return new Cell(CELL_TYPE.FROZEN_NUMBER, value, null, remainingMoves);
  }

  isEmpty() { return this.type === CELL_TYPE.EMPTY; }
  isNumber() { return this.type === CELL_TYPE.NUMBER; }
  isWoodBlock() { return this.type === CELL_TYPE.WOOD_BLOCK; }
  isFrozenNumber() { return this.type === CELL_TYPE.FROZEN_NUMBER; }
  hasValue() { return this.isNumber() || this.isFrozenNumber(); }

  clone() {
    return new Cell(this.type, this.value, this.remainingMerges, this.remainingMoves);
  }
}

class GameBoard {
  constructor() {
    this.board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      this.board[i] = [];
      for (let j = 0; j < BOARD_SIZE; j++) {
        this.board[i][j] = Cell.empty();
      }
    }
  }

  getCell(row, col) {
    return this.board[row][col];
  }

  getValue(row, col) {
    return this.board[row][col].value;
  }

  setCell(row, col, cell) {
    this.board[row][col] = cell;
  }

  setValue(row, col, value) {
    this.board[row][col] = Cell.number(value);
  }

  getEmptyCells() {
    const emptyCells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (this.board[i][j].isEmpty()) {
          emptyCells.push([i, j]);
        }
      }
    }
    return emptyCells;
  }

  hasWoodBlock() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (this.board[i][j].isWoodBlock()) {
          return true;
        }
      }
    }
    return false;
  }

  findWoodBlock() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (this.board[i][j].isWoodBlock()) {
          return [i, j];
        }
      }
    }
    return null;
  }

  getAdjacentCells(row, col) {
    const adjacent = [];
    if (row > 0) adjacent.push([row - 1, col]);
    if (row < BOARD_SIZE - 1) adjacent.push([row + 1, col]);
    if (col > 0) adjacent.push([row, col - 1]);
    if (col < BOARD_SIZE - 1) adjacent.push([row, col + 1]);
    return adjacent;
  }

  clone() {
    const newBoard = new GameBoard();
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        newBoard.board[i][j] = this.board[i][j].clone();
      }
    }
    return newBoard;
  }

  equals(other) {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const c1 = this.board[i][j];
        const c2 = other.board[i][j];
        if (c1.type !== c2.type || c1.value !== c2.value ||
            c1.remainingMerges !== c2.remainingMerges ||
            c1.remainingMoves !== c2.remainingMoves) {
          return false;
        }
      }
    }
    return true;
  }
}

class GameSnapshot {
  constructor(board, score, iceBlockPosition, iceBlockRemainingMoves) {
    this.board = board;
    this.score = score;
    this.iceBlockPosition = iceBlockPosition;
    this.iceBlockRemainingMoves = iceBlockRemainingMoves;
  }
}

class Game2048 {
  constructor() {
    this.board = new GameBoard();
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this._continueAfterWin = false;
    this.timerStarted = false;
    this.currentMode = GAME_MODE.UNLIMITED;
    this.currentVariant = GAME_VARIANT.NORMAL;
    this.elapsedSeconds = 0;
    this.gameTimer = null;
    this.iceBlockPosition = null;
    this.iceBlockRemainingMoves = 0;
    this.iceBlockHadMerge = false;
    this.woodBlockCooldown = 0;
    this.iceBlockCooldown = 0;
    this.history = [];
    this.woodBlocksClearedThisGame = 0;
    this.iceBlocksClearedThisGame = 0;
    this.undoCountThisGame = 0;
    this.tile4096Count = 0;
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
    this.iceBlockPosition = null;
    this.iceBlockRemainingMoves = 0;
    this.iceBlockHadMerge = false;
    this.woodBlockCooldown = 0;
    this.iceBlockCooldown = 0;
    this.history = [];
    this.woodBlocksClearedThisGame = 0;
    this.iceBlocksClearedThisGame = 0;
    this.undoCountThisGame = 0;
    this.tile4096Count = 0;

    this.addRandomTile();
    this.addRandomTile();

    if (this.currentVariant === GAME_VARIANT.FUN) {
      this.trySpawnWoodBlock();
      this.trySpawnIceBlock();
    }

    this.notifyStateChange();
  }

  get canUndo() {
    return this.history.length > 0;
  }

  undo() {
    if (this.history.length === 0) return;
    const snapshot = this.history.pop();
    this.board = snapshot.board;
    this.score = snapshot.score;
    this.iceBlockPosition = snapshot.iceBlockPosition;
    this.iceBlockRemainingMoves = snapshot.iceBlockRemainingMoves;
    this.gameOver = false;
    this.gameWon = false;
    this._continueAfterWin = false;
    this.undoCountThisGame++;
    if (this.onUndo) this.onUndo();
    if (this.timerStarted) {
      this.startTimer();
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
    if (this.gameOver && !this.continueAfterWin) {
      return { isValid: false, scoreAdded: 0 };
    }

    const originalBoard = this.board.clone();
    let scoreAdded = 0;
    const mergePositions = [];

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

    const isValid = !originalBoard.equals(this.board);

    if (isValid) {
      this.history.push(new GameSnapshot(
        originalBoard,
        this.score,
        this.iceBlockPosition ? [...this.iceBlockPosition] : null,
        this.iceBlockRemainingMoves
      ));

      this.startTimerIfNeeded();
      this.score += scoreAdded;

      if (this.currentVariant === GAME_VARIANT.FUN) {
        this.processFunModeAfterMove(mergePositions);
      }

      this.updateTile4096Count(originalBoard);

      this.addRandomTile(direction);
      this.checkGameState();
      this.notifyStateChange();
      if (this.onAchievementCheck) this.onAchievementCheck();
    }

    return { isValid, scoreAdded };
  }

  processFunModeAfterMove(mergePositions) {
    const woodBlockPos = this.board.findWoodBlock();
    if (woodBlockPos) {
      let mergeCount = 0;
      const adjacentCells = this.board.getAdjacentCells(woodBlockPos[0], woodBlockPos[1]);
      for (const mergePos of mergePositions) {
        if (adjacentCells.some(([r, c]) => r === mergePos[0] && c === mergePos[1])) {
          mergeCount++;
        }
      }

      if (mergeCount > 0) {
        const woodCell = this.board.getCell(woodBlockPos[0], woodBlockPos[1]);
        const newRemaining = (woodCell.remainingMerges || 0) - mergeCount;
        if (newRemaining <= 0) {
          this.board.setCell(woodBlockPos[0], woodBlockPos[1], Cell.empty());
          this.woodBlockCooldown = COOLDOWN_MOVES;
          this.woodBlocksClearedThisGame++;
        } else {
          this.board.setCell(
            woodBlockPos[0],
            woodBlockPos[1],
            new Cell(CELL_TYPE.WOOD_BLOCK, 0, newRemaining)
          );
        }
      }
    }

    this.decrementIceBlock();
    if (this.iceBlockHadMerge) {
      this.iceBlockHadMerge = false;
      this.decrementIceBlock();
    }

    if (this.woodBlockCooldown > 0) {
      this.woodBlockCooldown--;
    }
    if (this.iceBlockCooldown > 0) {
      this.iceBlockCooldown--;
    }

    this.trySpawnWoodBlock();
    this.trySpawnIceBlock();
  }

  decrementIceBlock() {
    if (this.iceBlockPosition === null) return;

    this.iceBlockRemainingMoves--;
    this.syncFrozenCellRemainingMoves();
    if (this.iceBlockRemainingMoves <= 0) {
      this.unfreezeAllNumbers();
      this.iceBlockPosition = null;
      this.iceBlockRemainingMoves = 0;
      this.iceBlockCooldown = COOLDOWN_MOVES;
      this.iceBlocksClearedThisGame++;
    }
  }

  syncFrozenCellRemainingMoves() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = this.board.getCell(i, j);
        if (cell.isFrozenNumber()) {
          cell.remainingMoves = this.iceBlockRemainingMoves;
        }
      }
    }
  }

  unfreezeAllNumbers() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = this.board.getCell(i, j);
        if (cell.isFrozenNumber()) {
          this.board.setCell(i, j, Cell.number(cell.value));
        }
      }
    }
  }

  trySpawnWoodBlock() {
    if (this.board.hasWoodBlock()) return;
    if (this.woodBlockCooldown > 0) return;

    const emptyCells = this.board.getEmptyCells();
    if (emptyCells.length === 0) return;

    if (Math.random() < 0.15) {
      const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.board.setCell(pos[0], pos[1], Cell.woodBlock(WOOD_BLOCK_REQUIRED_MERGES));
    }
  }

  trySpawnIceBlock() {
    if (this.iceBlockPosition !== null) return;
    if (this.iceBlockCooldown > 0) return;
    if (Math.random() >= 0.1) return;

    const candidates = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = this.board.getCell(i, j);
        if (!cell.isWoodBlock() && !cell.isFrozenNumber()) {
          candidates.push([i, j]);
        }
      }
    }

    if (candidates.length === 0) return;

    const pos = candidates[Math.floor(Math.random() * candidates.length)];
    const cell = this.board.getCell(pos[0], pos[1]);

    if (!cell.isNumber()) return;

    this.iceBlockPosition = pos;
    this.iceBlockRemainingMoves = ICE_BLOCK_MAX_MOVES;

    this.board.setCell(
      pos[0],
      pos[1],
      Cell.frozenNumber(cell.value, this.iceBlockRemainingMoves)
    );
  }

  moveLeft(mergePositions) {
    let scoreAdded = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      const rowData = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        rowData.push(this.board.getCell(row, col));
      }
      const iceIdx = this.iceBlockPosition !== null && row === this.iceBlockPosition[0]
        ? this.iceBlockPosition[1]
        : null;
      const result = this.processRowLeft(rowData, mergePositions, row, -1, iceIdx);
      scoreAdded += result.scoreAdded;
      for (let col = 0; col < BOARD_SIZE; col++) {
        this.board.setCell(row, col, result.cells[col]);
      }
    }
    return scoreAdded;
  }

  moveRight(mergePositions) {
    let scoreAdded = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      const rowData = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        rowData.push(this.board.getCell(row, col));
      }
      const iceIdx = this.iceBlockPosition !== null && row === this.iceBlockPosition[0]
        ? (BOARD_SIZE - 1 - this.iceBlockPosition[1])
        : null;
      const result = this.processRowRight(rowData, mergePositions, row, -1, iceIdx);
      scoreAdded += result.scoreAdded;
      for (let col = 0; col < BOARD_SIZE; col++) {
        this.board.setCell(row, col, result.cells[col]);
      }
    }
    return scoreAdded;
  }

  moveUp(mergePositions) {
    let scoreAdded = 0;
    for (let col = 0; col < BOARD_SIZE; col++) {
      const colData = [];
      for (let row = 0; row < BOARD_SIZE; row++) {
        colData.push(this.board.getCell(row, col));
      }
      const iceIdx = this.iceBlockPosition !== null && col === this.iceBlockPosition[1]
        ? this.iceBlockPosition[0]
        : null;
      const result = this.processRowLeft(colData, mergePositions, -1, col, iceIdx);
      scoreAdded += result.scoreAdded;
      for (let row = 0; row < BOARD_SIZE; row++) {
        this.board.setCell(row, col, result.cells[row]);
      }
    }
    return scoreAdded;
  }

  moveDown(mergePositions) {
    let scoreAdded = 0;
    for (let col = 0; col < BOARD_SIZE; col++) {
      const colData = [];
      for (let row = 0; row < BOARD_SIZE; row++) {
        colData.push(this.board.getCell(row, col));
      }
      const iceIdx = this.iceBlockPosition !== null && col === this.iceBlockPosition[1]
        ? (BOARD_SIZE - 1 - this.iceBlockPosition[0])
        : null;
      const result = this.processRowRight(colData, mergePositions, -1, col, iceIdx);
      scoreAdded += result.scoreAdded;
      for (let row = 0; row < BOARD_SIZE; row++) {
        this.board.setCell(row, col, result.cells[row]);
      }
    }
    return scoreAdded;
  }

  processRowLeft(row, mergePositions, rowIdx, colIdx, iceIdxInLine) {
    let scoreAdded = 0;
    const result = [];
    for (let i = 0; i < row.length; i++) {
      result.push(Cell.empty());
    }
    const workingRow = [...row];

    for (let i = 0; i < workingRow.length; i++) {
      if (workingRow[i].isFrozenNumber()) {
        for (let j = i + 1; j < workingRow.length; j++) {
          if (workingRow[j].isWoodBlock()) break;
          if (workingRow[j].isFrozenNumber()) break;
          if (workingRow[j].isNumber() &&
              !workingRow[j].isFrozenNumber() &&
              workingRow[i].value === workingRow[j].value) {
            let mergedValue = workingRow[i].value * 2;
            let remainingMoves = workingRow[i].remainingMoves || 0;
            remainingMoves = Math.max(0, remainingMoves - 1);
            if (remainingMoves > 0) {
              workingRow[i] = Cell.frozenNumber(mergedValue, remainingMoves);
            } else {
              workingRow[i] = Cell.number(mergedValue);
            }
            workingRow[j] = Cell.empty();
            scoreAdded += mergedValue;
            this.iceBlockHadMerge = true;

            if (rowIdx >= 0) {
              mergePositions.push([rowIdx, i]);
            } else {
              mergePositions.push([i, colIdx]);
            }
            break;
          }
        }
      }
    }

    const segments = [];
    const segmentStartIndices = [];
    let currentSegment = [];
    let currentStart = 0;

    for (let i = 0; i < workingRow.length; i++) {
      const cell = workingRow[i];
      if (cell.isWoodBlock() || cell.isFrozenNumber()) {
        if (currentSegment.length > 0) {
          segments.push(currentSegment);
          segmentStartIndices.push(currentStart);
          currentSegment = [];
        }
        segments.push([cell]);
        segmentStartIndices.push(i);
        currentStart = i + 1;
      } else {
        if (currentSegment.length === 0) {
          currentStart = i;
        }
        currentSegment.push(cell);
      }
    }
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
      segmentStartIndices.push(currentStart);
    }

    for (let segIdx = 0; segIdx < segments.length; segIdx++) {
      const segment = segments[segIdx];
      const startIdx = segmentStartIndices[segIdx];

      let isIcePos = false;
      let iceIdxInSeg = null;
      if (iceIdxInLine !== null) {
        for (let i = 0; i < segment.length; i++) {
          const originalIdx = startIdx + i;
          if (originalIdx === iceIdxInLine) {
            isIcePos = true;
            iceIdxInSeg = i;
            break;
          }
        }
      }

      if (segment.length === 1 &&
          (segment[0].isWoodBlock() || segment[0].isFrozenNumber())) {
        result[startIdx] = segment[0];
        continue;
      }

      const valuesWithIndices = [];
      for (let i = 0; i < segment.length; i++) {
        const cell = segment[i];
        if (cell.hasValue()) {
          valuesWithIndices.push([i, cell]);
        }
      }

      const processed = [];
      let i = 0;
      while (i < valuesWithIndices.length) {
        const current = valuesWithIndices[i];

        if (i + 1 < valuesWithIndices.length) {
          const next = valuesWithIndices[i + 1];

          let hasIceBetween = false;
          if (iceIdxInSeg !== null &&
              current[0] < iceIdxInSeg &&
              next[0] > iceIdxInSeg) {
            hasIceBetween = true;
          }

          if (current[1].value === next[1].value && !hasIceBetween) {
            const mergedValue = current[1].value * 2;
            const currentIsFrozen = current[1].isFrozenNumber();
            const nextIsFrozen = next[1].isFrozenNumber();
            const mergeAtIceBlock = currentIsFrozen || nextIsFrozen;

            let newCell;
            let mergePosInSegment;
            if (mergeAtIceBlock) {
              newCell = Cell.frozenNumber(mergedValue, this.iceBlockRemainingMoves);
              mergePosInSegment = currentIsFrozen ? current[0] : next[0];
              this.iceBlockHadMerge = true;
            } else {
              newCell = Cell.number(mergedValue);
              mergePosInSegment = processed.length;
            }

            processed.push([mergePosInSegment, newCell]);
            scoreAdded += mergedValue;

            const mergePos = startIdx + mergePosInSegment;
            if (rowIdx >= 0) {
              mergePositions.push([rowIdx, mergePos]);
            } else {
              mergePositions.push([mergePos, colIdx]);
            }
            i += 2;
            continue;
          }
        }

        processed.push(current);
        i++;
      }

      const frozenPositions = [];
      const frozenCells = [];
      const leftMovableCells = [];
      const rightMovableCells = [];

      for (const item of processed) {
        if (item[1].isFrozenNumber()) {
          frozenPositions.push(item[0]);
          frozenCells.push(item[1]);
        } else if (iceIdxInSeg !== null && item[0] < iceIdxInSeg) {
          leftMovableCells.push(item[1]);
        } else {
          rightMovableCells.push(item[1]);
        }
      }

      const segResult = [];
      for (let i = 0; i < segment.length; i++) {
        segResult.push(Cell.empty());
      }

      for (let j = 0; j < frozenPositions.length; j++) {
        segResult[frozenPositions[j]] = frozenCells[j];
      }

      let leftIdx = 0;
      const leftEnd = iceIdxInSeg !== null ? iceIdxInSeg : segment.length;
      for (let j = 0; j < leftEnd; j++) {
        if (segResult[j].isEmpty() && leftIdx < leftMovableCells.length) {
          segResult[j] = leftMovableCells[leftIdx];
          leftIdx++;
        }
      }

      let rightIdx = 0;
      const startFillIdx = iceIdxInSeg !== null ? iceIdxInSeg : 0;
      for (let j = startFillIdx; j < segment.length; j++) {
        if (segResult[j].isEmpty() && rightIdx < rightMovableCells.length) {
          const originalIdx = startIdx + j;
          const posIsIce = iceIdxInLine !== null && originalIdx === iceIdxInLine;

          if (posIsIce) {
            segResult[j] = Cell.frozenNumber(
              rightMovableCells[rightIdx].value,
              this.iceBlockRemainingMoves
            );
          } else {
            segResult[j] = rightMovableCells[rightIdx];
          }
          rightIdx++;
        }
      }

      for (let j = 0; j < segment.length; j++) {
        result[startIdx + j] = segResult[j];
      }
    }

    return { cells: result, scoreAdded };
  }

  processRowRight(row, mergePositions, rowIdx, colIdx, iceIdxInLine) {
    const workingRow = [...row];
    let additionalScore = 0;

    for (let i = workingRow.length - 1; i >= 0; i--) {
      if (workingRow[i].isFrozenNumber()) {
        for (let j = i - 1; j >= 0; j--) {
          if (workingRow[j].isWoodBlock()) break;
          if (workingRow[j].isFrozenNumber()) break;
          if (workingRow[j].isNumber() &&
              !workingRow[j].isFrozenNumber() &&
              workingRow[i].value === workingRow[j].value) {
            let mergedValue = workingRow[i].value * 2;
            let remainingMoves = workingRow[i].remainingMoves || 0;
            remainingMoves = Math.max(0, remainingMoves - 1);
            if (remainingMoves > 0) {
              workingRow[i] = Cell.frozenNumber(mergedValue, remainingMoves);
            } else {
              workingRow[i] = Cell.number(mergedValue);
            }
            workingRow[j] = Cell.empty();
            additionalScore += mergedValue;
            this.iceBlockHadMerge = true;

            if (rowIdx >= 0) {
              mergePositions.push([rowIdx, i]);
            } else {
              mergePositions.push([i, colIdx]);
            }
            break;
          }
        }
      }
    }

    const reversedRow = [...workingRow].reverse();
    const mergePosBefore = mergePositions.length;
    const result = this.processRowLeft(reversedRow, mergePositions, rowIdx, colIdx, iceIdxInLine);

    for (let i = mergePosBefore; i < mergePositions.length; i++) {
      const pos = mergePositions[i];
      if (rowIdx >= 0) {
        mergePositions[i] = [pos[0], BOARD_SIZE - 1 - pos[1]];
      } else {
        mergePositions[i] = [BOARD_SIZE - 1 - pos[0], pos[1]];
      }
    }

    const resultCells = [...result.cells].reverse();

    return {
      cells: resultCells,
      scoreAdded: result.scoreAdded + additionalScore
    };
  }

  addRandomTile(direction = null) {
    const emptyCells = this.board.getEmptyCells();
    if (emptyCells.length === 0) return;

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

    if (isIcePos) {
      this.board.setCell(
        position[0],
        position[1],
        Cell.frozenNumber(value, this.iceBlockRemainingMoves)
      );
    } else {
      this.board.setValue(position[0], position[1], value);
    }
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
    this.continueAfterWin = true;
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
    const newCount = this.countTile4096(this.board);
    const oldCount = this.countTile4096(originalBoard);
    if (newCount > oldCount) {
      this.tile4096Count += (newCount - oldCount);
    }
  }

  getAchievementState() {
    return {
      maxTile: this.maxTile,
      score: this.score,
      elapsedSeconds: this.elapsedSeconds,
      woodBlocksCleared: this.woodBlocksClearedThisGame,
      iceBlocksCleared: this.iceBlocksClearedThisGame,
      undoCount: this.undoCountThisGame,
      tile4096Count: this.tile4096Count
    };
  }

  notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}

class StorageService {
  constructor() {
    this.highestScores = {};
    this.bestTimes = {};
    this.achievements = {};
    this.totalUndoCount = 0;
    this.totalWoodCleared = 0;
    this.totalIceCleared = 0;
    this.load();
  }

  load() {
    try {
      const scores = localStorage.getItem('game2048_highestScores');
      const times = localStorage.getItem('game2048_bestTimes');
      const achievements = localStorage.getItem('game2048_achievements');
      const stats = localStorage.getItem('game2048_totalStats');
      if (scores) this.highestScores = JSON.parse(scores);
      if (times) this.bestTimes = JSON.parse(times);
      if (achievements) this.achievements = JSON.parse(achievements);
      if (stats) {
        const parsed = JSON.parse(stats);
        this.totalUndoCount = parsed.totalUndoCount || 0;
        this.totalWoodCleared = parsed.totalWoodCleared || 0;
        this.totalIceCleared = parsed.totalIceCleared || 0;
      }
    } catch (e) {
      console.error('Failed to load storage:', e);
    }
  }

  save() {
    try {
      localStorage.setItem('game2048_highestScores', JSON.stringify(this.highestScores));
      localStorage.setItem('game2048_bestTimes', JSON.stringify(this.bestTimes));
      localStorage.setItem('game2048_achievements', JSON.stringify(this.achievements));
      localStorage.setItem('game2048_totalStats', JSON.stringify({
        totalUndoCount: this.totalUndoCount,
        totalWoodCleared: this.totalWoodCleared,
        totalIceCleared: this.totalIceCleared
      }));
    } catch (e) {
      console.error('Failed to save storage:', e);
    }
  }

  getHighestScore(mode, variant) {
    return this.highestScores[`${mode}_${variant}`] || 0;
  }

  setHighestScore(mode, variant, score) {
    const key = `${mode}_${variant}`;
    if (!this.highestScores[key] || score > this.highestScores[key]) {
      this.highestScores[key] = score;
      this.save();
    }
  }

  getBestTime(mode, variant) {
    return this.bestTimes[`${mode}_${variant}`] || null;
  }

  setBestTime(mode, variant, time) {
    const key = `${mode}_${variant}`;
    if (!this.bestTimes[key] || time < this.bestTimes[key]) {
      this.bestTimes[key] = time;
      this.save();
    }
  }

  isAchievementUnlocked(id) {
    return this.achievements[id] || false;
  }

  unlockAchievement(id) {
    if (!this.achievements[id]) {
      this.achievements[id] = true;
      this.save();
      return true;
    }
    return false;
  }

  incrementUndoCount() {
    this.totalUndoCount++;
    this.save();
  }

  incrementWoodCleared(count = 1) {
    this.totalWoodCleared += count;
    this.save();
  }

  incrementIceCleared(count = 1) {
    this.totalIceCleared += count;
    this.save();
  }
}

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

    this.initElements();
    this.initGame();
    this.bindEvents();
    this.render();
    this.resetIdleTimer();
  }

  initElements() {
    this.boardEl = document.getElementById('board');
    this.currentScoreEl = document.getElementById('currentScore');
    this.timeDisplayEl = document.getElementById('timeDisplay');
    this.newGameBtn = document.getElementById('newGameBtn');
    this.undoBtn = document.getElementById('undoBtn');
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
    this.normalBestTimeEl = document.getElementById('unlimitedNormalBestTime');
    this.funBestTimeEl = document.getElementById('unlimitedFunBestTime');
    this.timedNormalBestTimeEl = document.getElementById('timedNormalBestTime');
    this.timedFunBestTimeEl = document.getElementById('timedFunBestTime');
  }

  initGame() {
    this.game.onStateChange = () => this.render();
    this.game.onGameOver = () => this.showGameOver();
    this.game.onGameWon = () => this.showWin();
    this.game.onAchievementCheck = () => this.checkAchievements();
    this.game.onUndo = () => this.storage.incrementUndoCount();
    this.game.initGame();
  }

  bindEvents() {
    this.newGameBtn.addEventListener('click', () => {
      this.resetIdleTimer();
      this.resetGame();
    });
    this.undoBtn.addEventListener('click', () => {
      this.resetIdleTimer();
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

    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.hideSettings();
      }
    });

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
        this.game.setMode(mode);
        this.updateHighestScoresDisplay();
      });
    });

    this.variantButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.resetIdleTimer();
        this.variantButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const variant = btn.dataset.variant;
        this.game.setVariant(variant);
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
      if (this.isProcessingInput) return;

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
  }

  handleKeydown(e) {
    if (this.isProcessingInput) return;

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
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.currentSettingsTab === 'records') {
          this.switchSettingsTab('achievements');
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

  handleMove(direction) {
    if (this.isProcessingInput) return;

    this.isProcessingInput = true;
    this.resetIdleTimer();
    const result = this.game.move(direction);

    setTimeout(() => {
      this.render();
      this.isProcessingInput = false;
    }, 100);
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
    this.renderBoard();
    this.renderScore();
    this.renderTime();
    this.updateHighestScoresDisplay();
    this.undoBtn.disabled = !this.game.canUndo;
  }

  renderBoard() {
    this.boardEl.innerHTML = '';

    const mergeablePositions = this.game.getMergeablePositions();

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = this.game.board.getCell(i, j);
        const tile = document.createElement('div');
        tile.className = 'tile';

        if (cell.isEmpty()) {
          tile.classList.add('empty');
        } else if (cell.isWoodBlock()) {
          tile.classList.add('wood-block');
          const woodLabel = document.createElement('span');
          woodLabel.className = 'wood-label';
          woodLabel.textContent = `剩余${cell.remainingMerges}`;
          tile.appendChild(woodLabel);
        } else {
          tile.dataset.value = cell.value;
          tile.textContent = cell.value;

          if (cell.isFrozenNumber()) {
            tile.classList.add('frozen');
            const frozenCount = document.createElement('span');
            frozenCount.className = 'frozen-count';
            frozenCount.textContent = this.game.iceBlockRemainingMoves;
            tile.appendChild(frozenCount);
          }

          if (mergeablePositions.has(`${i},${j}`)) {
            tile.classList.add('mergeable');
          }
        }

        this.boardEl.appendChild(tile);
      }
    }
  }

  renderScore() {
    this.currentScoreEl.textContent = this.game.score;
  }

  renderTime() {
    this.timeDisplayEl.textContent = this.game.getFormattedTime();
  }

  updateHighestScoresDisplay() {
    this.timedNormalHighestEl.textContent = this.storage.getHighestScore(GAME_MODE.TIMED, GAME_VARIANT.NORMAL);
    this.timedFunHighestEl.textContent = this.storage.getHighestScore(GAME_MODE.TIMED, GAME_VARIANT.FUN);
    this.unlimitedNormalHighestEl.textContent = this.storage.getHighestScore(GAME_MODE.UNLIMITED, GAME_VARIANT.NORMAL);
    this.unlimitedFunHighestEl.textContent = this.storage.getHighestScore(GAME_MODE.UNLIMITED, GAME_VARIANT.FUN);

    const unlimitedNormalBestTime = this.storage.getBestTime(GAME_MODE.UNLIMITED, GAME_VARIANT.NORMAL);
    const unlimitedFunBestTime = this.storage.getBestTime(GAME_MODE.UNLIMITED, GAME_VARIANT.FUN);
    const timedNormalBestTime = this.storage.getBestTime(GAME_MODE.TIMED, GAME_VARIANT.NORMAL);
    const timedFunBestTime = this.storage.getBestTime(GAME_MODE.TIMED, GAME_VARIANT.FUN);

    this.normalBestTimeEl.textContent = unlimitedNormalBestTime !== null
        ? this.formatTime(unlimitedNormalBestTime)
        : '--:--';
    this.funBestTimeEl.textContent = unlimitedFunBestTime !== null
        ? this.formatTime(unlimitedFunBestTime)
        : '--:--';
    this.timedNormalBestTimeEl.textContent = timedNormalBestTime !== null
        ? this.formatTime(timedNormalBestTime)
        : '--:--';
    this.timedFunBestTimeEl.textContent = timedFunBestTime !== null
        ? this.formatTime(timedFunBestTime)
        : '--:--';
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  resetGame() {
    this.game.pauseTimer();
    this.checkAchievements();
    if (this.game.isGameOver || this.game.isGameWon) {
      this.storage.setHighestScore(
        this.game.currentMode,
        this.game.currentVariant,
        this.game.score
      );
      if (this.game.currentMode === GAME_MODE.UNLIMITED && this.game.isGameWon) {
        this.storage.setBestTime(this.game.currentMode, this.game.currentVariant, this.game.elapsedSeconds);
      }
    }
    this.game.initGame();
    this.updateHighestScoresDisplay();
    this.resetIdleTimer();
  }

  showWin() {
    this.game.pauseTimer();
    this.checkAchievements();
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.boardEl.classList.remove('idle-hint');
    this.winScoreEl.textContent = this.game.score;

    if (this.game.currentMode === GAME_MODE.UNLIMITED) {
      this.winTimeItem.style.display = 'block';
      this.winTimeEl.textContent = this.game.getFormattedTime();
      this.storage.setBestTime(this.game.currentMode, this.game.currentVariant, this.game.elapsedSeconds);
    } else {
      this.winTimeItem.style.display = 'none';
    }

    this.winModal.style.display = 'flex';
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
    this.game.stopTimer();
    this.checkAchievements();

    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    this.boardEl.classList.remove('idle-hint');

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
      this.storage.setBestTime(this.game.currentMode, this.game.currentVariant, this.game.elapsedSeconds);
    } else {
      this.gameOverTimeItem.style.display = 'none';
    }

    this.storage.setHighestScore(
      this.game.currentMode,
      this.game.currentVariant,
      this.game.score
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
    this.game.pauseTimer();
  }

  hideHelp() {
    this.stopSmoothScroll();
    this.helpModal.style.display = 'none';
    this.game.resumeTimer();
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
    this.game.pauseTimer();
    this.renderAchievements();
    this.updateHighestScoresDisplay();
  }

  hideSettings() {
    this.settingsModal.style.display = 'none';
    this.game.resumeTimer();
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
      undoCount: this.storage.totalUndoCount
    };

    for (const achievement of ACHIEVEMENTS) {
      if (!this.storage.isAchievementUnlocked(achievement.id)) {
        if (achievement.check(fullState)) {
          this.storage.unlockAchievement(achievement.id);
          this.showAchievementToast(achievement);
        }
      }
    }
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

  renderAchievements() {
    this.achievementsGrid.innerHTML = '';
    for (const achievement of ACHIEVEMENTS) {
      const unlocked = this.storage.isAchievementUnlocked(achievement.id);
      const card = document.createElement('div');
      card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.desc}</div>
        </div>
      `;
      this.achievementsGrid.appendChild(card);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new UI();
});
