Game2048.prototype.processFunModeAfterMove = function(mergePositions, direction, originalBoard) {
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
        if (this.woodBlockSpawnMove !== null) {
          const movesUsed = this.moveCount - this.woodBlockSpawnMove;
          if (movesUsed <= 3 && movesUsed > 0) {
            this.fastWoodCleared = movesUsed;
          }
        }
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
  if (this.teleportPortalCooldown > 0) {
    this.teleportPortalCooldown--;
  }
  if (this.chainCooldown > 0) {
    this.chainCooldown--;
  }

  this.trySpawnWoodBlock();
  this.trySpawnIceBlock();
  this.trySpawnTeleportPortal();
  this.processTeleportPortal(direction, originalBoard);
};

Game2048.prototype.trySpawnWoodBlock = function() {
  if (this.board.hasWoodBlock()) return;
  if (this.woodBlockCooldown > 0) return;
  if (!this.canSpawnModule()) return;

  const emptyCells = this.board.getEmptyCells();
  if (emptyCells.length === 0) return;

  if (Math.random() < 0.15) {
    const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.board.setCell(pos[0], pos[1], Cell.woodBlock(WOOD_BLOCK_REQUIRED_MERGES));
    this.woodBlockSpawnMove = this.moveCount;
  }
};

Game2048.prototype.trySpawnIceBlock = function() {
  if (this.iceBlockPosition !== null) return;
  if (this.iceBlockCooldown > 0) return;
  if (!this.canSpawnModule()) return;
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
  this.iceBlockSpawnMove = this.moveCount;

  this.board.setCell(
    pos[0],
    pos[1],
    Cell.frozenNumber(cell.value, this.iceBlockRemainingMoves)
  );
};

Game2048.prototype.decrementIceBlock = function() {
  if (this.iceBlockPosition === null) return;

  this.iceBlockRemainingMoves--;
  this.syncFrozenCellRemainingMoves();
  if (this.iceBlockRemainingMoves <= 0) {
    this.unfreezeAllNumbers();
    this.iceBlockPosition = null;
    this.iceBlockRemainingMoves = 0;
    this.iceBlockCooldown = COOLDOWN_MOVES;
    this.iceBlocksClearedThisGame++;
    if (this.iceBlockSpawnMove !== null) {
      const movesUsed = this.moveCount - this.iceBlockSpawnMove;
      if (movesUsed <= 6 && movesUsed > 0) {
        this.fastIceCleared = movesUsed;
      }
    }
  }
};

Game2048.prototype.syncFrozenCellRemainingMoves = function() {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = this.board.getCell(i, j);
      if (cell.isFrozenNumber()) {
        cell.remainingMoves = this.iceBlockRemainingMoves;
      }
    }
  }
};

Game2048.prototype.unfreezeAllNumbers = function() {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = this.board.getCell(i, j);
      if (cell.isFrozenNumber()) {
        this.board.setCell(i, j, Cell.number(cell.value));
      }
    }
  }
};

Game2048.prototype.trySpawnTeleportPortal = function() {
  if (this.teleportPortalPosition !== null) return;
  if (this.teleportPortalCooldown > 0) return;
  if (!this.canSpawnModule()) return;
  if (Math.random() >= 0.08) return;

  const emptyCells = this.board.getEmptyCells();
  if (emptyCells.length < 2) return;

  const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  this.teleportPortalPosition = [pos[0], pos[1]];
};

Game2048.prototype.processTeleportPortal = function(direction, originalBoard) {
  if (this.teleportPortalPosition === null) return;

  const [pr, pc] = this.teleportPortalPosition;

  let cellToTeleport = null;
  let teleportRow = -1;
  let teleportCol = -1;

  const isHorizontal = direction === 'left' || direction === 'right';

  const origPositions = new Map();
  for (let i = 0; i < BOARD_SIZE; i++) {
    const r = isHorizontal ? pr : i;
    const c = isHorizontal ? i : pc;
    const cell = originalBoard.getCell(r, c);
    if (cell.hasValue()) {
      const key = `${cell.type}_${cell.value}`;
      if (!origPositions.has(key)) {
        origPositions.set(key, []);
      }
      origPositions.get(key).push(i);
    }
  }

  let bestCrossed = null;
  let bestCrossedDist = Infinity;

  for (let i = 0; i < BOARD_SIZE; i++) {
    const r = isHorizontal ? pr : i;
    const c = isHorizontal ? i : pc;
    const cell = this.board.getCell(r, c);

    if (!cell.hasValue()) continue;

    const key = `${cell.type}_${cell.value}`;
    const origIdxs = origPositions.get(key);
    if (!origIdxs || origIdxs.length === 0) continue;

    const portalIdx = isHorizontal ? pc : pr;
    let origIdx = -1;
    let minDist = Infinity;

    for (const oi of origIdxs) {
      const dist = Math.abs(oi - i);
      if (dist < minDist) {
        minDist = dist;
        origIdx = oi;
      }
    }

    if (origIdx === -1) continue;

    let crossedPortal = false;
    if (direction === 'left') {
      crossedPortal = origIdx > portalIdx && i <= portalIdx;
    } else if (direction === 'right') {
      crossedPortal = origIdx < portalIdx && i >= portalIdx;
    } else if (direction === 'up') {
      crossedPortal = origIdx > portalIdx && i <= portalIdx;
    } else if (direction === 'down') {
      crossedPortal = origIdx < portalIdx && i >= portalIdx;
    }

    if (crossedPortal) {
      const dist = Math.abs(i - portalIdx);
      if (dist < bestCrossedDist) {
        bestCrossedDist = dist;
        bestCrossed = [r, c, cell];
      }
    }

    origPositions.set(key, origIdxs.filter(oi => oi !== origIdx));
  }

  if (bestCrossed) {
    teleportRow = bestCrossed[0];
    teleportCol = bestCrossed[1];
    cellToTeleport = bestCrossed[2].clone();
  }

  if (!cellToTeleport) return;

  const isChainCell = cellToTeleport.isChain();
  const isTargetOfChain = this.chainPair !== null && 
      this.chainPair.targetPos[0] === teleportRow && 
      this.chainPair.targetPos[1] === teleportCol;

  if ((isChainCell || isTargetOfChain) && this.chainPair !== null) {
    const chainPos = this.chainPair.chainPos;
    const targetPos = this.chainPair.targetPos;
    
    const chainCell = this.board.getCell(chainPos[0], chainPos[1]);
    const targetCell = this.board.getCell(targetPos[0], targetPos[1]);
    
    if (chainCell.hasValue() && targetCell.hasValue()) {
      const dr = chainPos[0] - targetPos[0];
      const dc = chainPos[1] - targetPos[1];
      
      const emptyCells = this.board.getEmptyCells();
      const filtered = emptyCells.filter(([r, c]) => 
        !(r === chainPos[0] && c === chainPos[1]) && 
        !(r === targetPos[0] && c === targetPos[1]) &&
        !(r === pr && c === pc)
      );
      
      if (filtered.length >= 1) {
        let foundPair = false;
        let newTargetPos = null;
        let newChainPos = null;
        
        for (const [er, ec] of filtered) {
          const cr = er + dr;
          const cc = ec + dc;
          if (cr >= 0 && cr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE) {
            const isEmpty = this.board.getCell(cr, cc).isEmpty();
            const isChainPos = cr === chainPos[0] && cc === chainPos[1];
            const isTargetPos = cr === targetPos[0] && cc === targetPos[1];
            const isPortalPos = cr === pr && cc === pc;
            if (isEmpty || isChainPos || isTargetPos || isPortalPos) {
              newTargetPos = [er, ec];
              newChainPos = [cr, cc];
              foundPair = true;
              break;
            }
          }
        }
        
        if (!foundPair) {
          for (const [er, ec] of filtered) {
            const cr = er - dr;
            const cc = ec - dc;
            if (cr >= 0 && cr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE) {
              const isEmpty = this.board.getCell(cr, cc).isEmpty();
              const isChainPos = cr === chainPos[0] && cc === chainPos[1];
              const isTargetPos = cr === targetPos[0] && cc === targetPos[1];
              const isPortalPos = cr === pr && cc === pc;
              if (isEmpty || isChainPos || isTargetPos || isPortalPos) {
                newChainPos = [er, ec];
                newTargetPos = [cr, cc];
                foundPair = true;
                break;
              }
            }
          }
        }
        
        if (foundPair && newTargetPos && newChainPos) {
          const chainCellClone = chainCell.clone();
          const targetCellClone = targetCell.clone();
          
          this.board.setCell(chainPos[0], chainPos[1], Cell.empty());
          this.board.setCell(targetPos[0], targetPos[1], Cell.empty());
          
          if (this.board.getCell(newChainPos[0], newChainPos[1]).isEmpty()) {
            this.board.setCell(newChainPos[0], newChainPos[1], chainCellClone);
          }
          if (this.board.getCell(newTargetPos[0], newTargetPos[1]).isEmpty()) {
            this.board.setCell(newTargetPos[0], newTargetPos[1], targetCellClone);
          }
          
          this.chainPair.chainPos = [newChainPos[0], newChainPos[1]];
          this.chainPair.targetPos = [newTargetPos[0], newTargetPos[1]];
          
          this.teleportPortalCooldown = COOLDOWN_MOVES;
          this.teleportPortalPosition = null;
          return;
        }
      }
    }
  }

  const emptyCells = this.board.getEmptyCells();
  if (emptyCells.length === 0) return;

  const filtered = emptyCells.filter(([r, c]) => !(r === teleportRow && c === teleportCol));
  const candidates = filtered.length > 0 ? filtered : emptyCells;

  const [newRow, newCol] = candidates[Math.floor(Math.random() * candidates.length)];
  this.board.setCell(newRow, newCol, cellToTeleport);
  this.board.setCell(teleportRow, teleportCol, Cell.empty());

  this.teleportPortalCooldown = COOLDOWN_MOVES;
  this.teleportPortalPosition = null;
};

Game2048.prototype.getActiveSpecialModules = function() {
  const modules = [];
  if (this.board.hasWoodBlock()) modules.push('wood');
  if (this.iceBlockPosition !== null) modules.push('ice');
  if (this.teleportPortalPosition !== null) modules.push('portal');
  if (this.hasChainCell()) modules.push('chain');
  return modules;
};

Game2048.prototype.canSpawnModule = function() {
  return this.getActiveSpecialModules().length < 2;
};

Game2048.prototype.hasChainCell = function() {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (this.board.getCell(i, j).isChain()) {
        return true;
      }
    }
  }
  return false;
};

Game2048.prototype.findChainCell = function() {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (this.board.getCell(i, j).isChain()) {
        return [i, j];
      }
    }
  }
  return null;
};

Game2048.prototype.releaseChain = function() {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = this.board.getCell(i, j);
      if (cell.isChain()) {
        this.board.setCell(i, j, Cell.number(cell.value));
      }
    }
  }
  this.chainPair = null;
  this.chainCooldown = COOLDOWN_MOVES;
};

Game2048.prototype.tryBindChain = function(direction) {
  const chainPos = this.findChainCell();
  if (!chainPos) {
    this.chainPair = null;
    return;
  }
  if (this.chainPair !== null) return;

  const [cr, cc] = chainPos;
  const dirMap = {
    'left': [0, -1],
    'right': [0, 1],
    'up': [-1, 0],
    'down': [1, 0]
  };

  const adjacentNumbers = [];
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (const [dr, dc] of directions) {
    const nr = cr + dr;
    const nc = cc + dc;
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      const neighbor = this.board.getCell(nr, nc);
      if ((neighbor.isNumber() || neighbor.isFrozenNumber()) && !neighbor.isChain()) {
        adjacentNumbers.push({ pos: [nr, nc], value: neighbor.value, dir: [dr, dc] });
      }
    }
  }

  if (adjacentNumbers.length === 0) return;

  let target = null;

  if (direction && dirMap[direction]) {
    const [slideDr, slideDc] = dirMap[direction];
    const slideMatch = adjacentNumbers.find(n => n.dir[0] === slideDr && n.dir[1] === slideDc);
    if (slideMatch) {
      target = slideMatch;
    }

    if (!target) {
      const perpDirs = slideDr === 0 ? [[1, 0], [-1, 0]] : [[0, 1], [0, -1]];
      const perpMatches = adjacentNumbers.filter(n =>
        perpDirs.some(([dr, dc]) => n.dir[0] === dr && n.dir[1] === dc)
      );
      if (perpMatches.length >= 2) {
        target = perpMatches[Math.floor(Math.random() * perpMatches.length)];
      } else if (perpMatches.length === 1) {
        target = perpMatches[0];
      }
    }
  }

  if (!target) {
    target = adjacentNumbers[Math.floor(Math.random() * adjacentNumbers.length)];
  }

  this.chainPair = {
    chainPos: [cr, cc],
    targetPos: target.pos,
    targetValue: target.value,
    remainingMoves: 5
  };
};

Game2048.prototype.updateChainTimer = function(mergePositions, originalBoard, originalChainPair) {
  if (!this.chainPair) return;

  let remainingMoves = originalChainPair.remainingMoves - 1;

  const oldChainPos = originalChainPair.chainPos;
  const oldTargetPos = originalChainPair.targetPos;
  const oldChainValue = originalBoard.getCell(oldChainPos[0], oldChainPos[1]).value;
  const oldTargetValue = originalChainPair.targetValue;

  const chainMerged = this.didCellMerge(oldChainPos[0], oldChainPos[1], oldChainValue, mergePositions, originalBoard, true);

  const targetMerged = this.didCellMerge(oldTargetPos[0], oldTargetPos[1], oldTargetValue, mergePositions, originalBoard, true);

  if (chainMerged) {
    remainingMoves -= 1;
  }
  if (targetMerged) {
    remainingMoves -= 1;
  }

  this.chainPair.remainingMoves = remainingMoves;

  if (this.chainPair.remainingMoves <= 0) {
    this.releaseChain();
  }
};

Game2048.prototype.didCellMerge = function(row, col, value, mergePositions, originalBoard, skipBlockerCheck = false) {
  for (const [mr, mc] of mergePositions) {
    if (mr === row && mc === col) {
      return true;
    }
  }

  const currentCell = this.board.getCell(row, col);
  const originalCell = originalBoard.getCell(row, col);
  const cellChanged = originalCell.hasValue() && 
      (!currentCell.hasValue() || currentCell.value !== originalCell.value || currentCell.type !== originalCell.type);

  if (!cellChanged) {
    return false;
  }

  for (const [mr, mc] of mergePositions) {
    const mergedCell = this.board.getCell(mr, mc);
    if (mergedCell.value !== value * 2) continue;

    const sameRow = mr === row;
    const sameCol = mc === col;

    if (!sameRow && !sameCol) continue;

    if (skipBlockerCheck) {
      return true;
    }

    if (sameRow) {
      const minC = Math.min(col, mc);
      const maxC = Math.max(col, mc);
      let hasBlocker = false;
      for (let c = minC + 1; c < maxC; c++) {
        const cell = originalBoard.getCell(row, c);
        if (cell.isWoodBlock() || cell.isFrozenNumber() || cell.isChain()) {
          hasBlocker = true;
          break;
        }
      }
      if (!hasBlocker) {
        return true;
      }
    }

    if (sameCol) {
      const minR = Math.min(row, mr);
      const maxR = Math.max(row, mr);
      let hasBlocker = false;
      for (let r = minR + 1; r < maxR; r++) {
        const cell = originalBoard.getCell(r, col);
        if (cell.isWoodBlock() || cell.isFrozenNumber() || cell.isChain()) {
          hasBlocker = true;
          break;
        }
      }
      if (!hasBlocker) {
        return true;
      }
    }
  }

  return false;
};

Game2048.prototype.findOriginalChainPos = function(originalBoard) {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (originalBoard.getCell(i, j).isChain()) {
        return [i, j];
      }
    }
  }
  return null;
};

Game2048.prototype.findOriginalTargetPos = function(originalBoard) {
  if (!this.chainPair) return null;
  const targetValue = this.chainPair.targetValue;
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = originalBoard.getCell(i, j);
      if (!cell.isChain() && cell.hasValue() && cell.value === targetValue) {
        return [i, j];
      }
    }
  }
  return null;
};

Game2048.prototype.updateChainPairAfterMerge = function(mergePositions, originalBoard) {
  if (!this.chainPair) return;

  const oldChainPos = this.chainPair.chainPos;
  const oldTargetPos = this.chainPair.targetPos;
  const oldTargetValue = this.chainPair.targetValue;
  const oldChainValue = originalBoard.getCell(oldChainPos[0], oldChainPos[1]).value;

  const originalChainCell = originalBoard.getCell(oldChainPos[0], oldChainPos[1]);
  const currentCellAtOldChainPos = this.board.getCell(oldChainPos[0], oldChainPos[1]);
  const chainMovedOrMerged = !currentCellAtOldChainPos.isChain() || 
      currentCellAtOldChainPos.value !== oldChainValue;

  let chainMergePos = null;
  if (chainMovedOrMerged) {
    for (const [mr, mc] of mergePositions) {
      const mergedCell = this.board.getCell(mr, mc);
      if (mergedCell.isNumber() && mergedCell.value === oldChainValue * 2) {
        const isHorizontal = oldChainPos[0] === mr;
        const isVertical = oldChainPos[1] === mc;
        if (isHorizontal || isVertical) {
          chainMergePos = [mr, mc];
          break;
        }
      }
    }

    if (!chainMergePos) {
      const mergeSet = new Set(mergePositions.map(([r, c]) => `${r},${c}`));
      for (const [mr, mc] of mergePositions) {
        const mergedCell = this.board.getCell(mr, mc);
        if (mergedCell.value === oldChainValue * 2) {
          chainMergePos = [mr, mc];
          break;
        }
      }
    }
  }

  let currentChainPos = this.findChainCell();
  if (!currentChainPos && chainMovedOrMerged && chainMergePos) {
    const mergedCell = this.board.getCell(chainMergePos[0], chainMergePos[1]);
    if (mergedCell.isNumber()) {
      this.board.setCell(chainMergePos[0], chainMergePos[1], Cell.chain(mergedCell.value));
      currentChainPos = [chainMergePos[0], chainMergePos[1]];
    }
  }

  if (!currentChainPos) {
    this.releaseChain();
    return;
  }

  this.chainPair.chainPos = currentChainPos;

  let targetMerged = false;
  let targetMergePos = null;
  const originalTargetCell = originalBoard.getCell(oldTargetPos[0], oldTargetPos[1]);
  const currentCellAtOldTargetPos = this.board.getCell(oldTargetPos[0], oldTargetPos[1]);
  const targetMovedOrMerged = !currentCellAtOldTargetPos.hasValue() || 
      currentCellAtOldTargetPos.value !== oldTargetValue ||
      currentCellAtOldTargetPos.isChain();

  if (targetMovedOrMerged) {
    for (const [mr, mc] of mergePositions) {
      const mergedCell = this.board.getCell(mr, mc);
      if (mergedCell.isNumber() && !mergedCell.isChain()) {
        const isHorizontal = oldTargetPos[0] === mr;
        const isVertical = oldTargetPos[1] === mc;
        if (isHorizontal || isVertical) {
          if (mergedCell.value === oldTargetValue * 2) {
            targetMerged = true;
            targetMergePos = [mr, mc];
            break;
          }
        }
      }
    }
  }

  if (targetMerged && targetMergePos) {
    this.chainPair.targetPos = [targetMergePos[0], targetMergePos[1]];
    const newTargetCell = this.board.getCell(targetMergePos[0], targetMergePos[1]);
    this.chainPair.targetValue = newTargetCell.value;
  } else {
    let targetFound = false;
    const [tr, tc] = this.chainPair.targetPos;
    const targetCell = this.board.getCell(tr, tc);
    if ((targetCell.isNumber() || targetCell.isFrozenNumber()) && !targetCell.isChain() && targetCell.value === oldTargetValue) {
      targetFound = true;
    }

    if (!targetFound) {
      const [cr, cc] = currentChainPos;
      const [oldCr, oldCc] = oldChainPos;
      const dRow = oldTargetPos[0] - oldCr;
      const dCol = oldTargetPos[1] - oldCc;
      const expectedTr = cr + dRow;
      const expectedTc = cc + dCol;

      if (expectedTr >= 0 && expectedTr < BOARD_SIZE && expectedTc >= 0 && expectedTc < BOARD_SIZE) {
        const expectedCell = this.board.getCell(expectedTr, expectedTc);
        if ((expectedCell.isNumber() || expectedCell.isFrozenNumber()) && !expectedCell.isChain() && expectedCell.value === oldTargetValue) {
          this.chainPair.targetPos = [expectedTr, expectedTc];
          targetFound = true;
        }
      }

      if (!targetFound) {
        let minDist = Infinity;
        let bestPos = null;
        for (let i = 0; i < BOARD_SIZE; i++) {
          for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = this.board.getCell(i, j);
            if ((cell.isNumber() || cell.isFrozenNumber()) && !cell.isChain() && cell.value === oldTargetValue) {
              const dist = Math.abs(i - cr) + Math.abs(j - cc);
              if (dist < minDist) {
                minDist = dist;
                bestPos = [i, j];
              }
            }
          }
        }
        if (bestPos && minDist <= 2) {
          this.chainPair.targetPos = bestPos;
          targetFound = true;
        }
      }
    }

    if (!targetFound) {
      this.releaseChain();
      return;
    }
  }

  const chainStillExists = this.findChainCell() !== null;
  if (!chainStillExists) {
    this.releaseChain();
  }
};

Game2048.prototype.maintainChainAdjacency = function(direction) {
  if (!this.chainPair) return;

  const chainPos = this.findChainCell();
  if (!chainPos) {
    this.releaseChain();
    return;
  }

  const [cr, cc] = chainPos;
  let [tr, tc] = this.chainPair.targetPos;
  let targetCell = this.board.getCell(tr, tc);
  const targetValue = this.chainPair.targetValue;

  if (!targetCell.hasValue() || targetCell.isChain() || targetCell.value !== targetValue) {
    let found = false;
    for (let i = 0; i < BOARD_SIZE && !found; i++) {
      for (let j = 0; j < BOARD_SIZE && !found; j++) {
        const cell = this.board.getCell(i, j);
        if (cell.hasValue() && !cell.isChain() && cell.value === targetValue) {
          const dist = Math.abs(i - cr) + Math.abs(j - cc);
          if (dist === 1) {
            tr = i;
            tc = j;
            targetCell = cell;
            found = true;
          }
        }
      }
    }
    if (!found) {
      this.releaseChain();
      return;
    }
  }

  this.chainPair.targetPos = [tr, tc];
  this.chainPair.chainPos = [cr, cc];

  const areAdjacent = Math.abs(cr - tr) + Math.abs(cc - tc) === 1;
  if (!areAdjacent) {
    this.releaseChain();
  }
};

Game2048.prototype.prepareChainForMovement = function(direction) {
  if (!this.chainPair) return;

  this._chainBlocked = false;
  this._chainWasBlocked = false;
  this._chainMovementPrepared = false;
  this._chainOriginalPos = null;

  const chainPos = this.chainPair.chainPos;
  const targetPos = this.chainPair.targetPos;
  const [cr, cc] = chainPos;
  const [tr, tc] = targetPos;

  const isHorizontal = direction === 'left' || direction === 'right';
  const horizontallyAligned = (cr === tr);
  const verticallyAligned = (cc === tc);
  const chainAndTargetAligned = horizontallyAligned || verticallyAligned;

  const chainCell = this.board.getCell(cr, cc);
  const targetCell = this.board.getCell(tr, tc);

  if (!chainCell.hasValue() || !targetCell.hasValue()) return;

  if (!chainAndTargetAligned) {
    this._chainBlocked = true;
    this._chainMovementPrepared = true;
    this._chainOriginalPos = { chainPos: [...chainPos], targetPos: [...targetPos] };
    return;
  }

  if (horizontallyAligned && isHorizontal) {
    const minCol = Math.min(cc, tc);
    const maxCol = Math.max(cc, tc);
    for (let c = minCol + 1; c < maxCol; c++) {
      const cell = this.board.getCell(cr, c);
      if (!cell.isEmpty() && !cell.isWoodBlock()) {
        return;
      }
    }
  }

  if (verticallyAligned && !isHorizontal) {
    const minRow = Math.min(cr, tr);
    const maxRow = Math.max(cr, tr);
    for (let r = minRow + 1; r < maxRow; r++) {
      const cell = this.board.getCell(r, cc);
      if (!cell.isEmpty() && !cell.isWoodBlock()) {
        return;
      }
    }
  }

  this._chainMovementPrepared = true;
  this._chainOriginalPos = { chainPos: [...chainPos], targetPos: [...targetPos] };
};

Game2048.prototype.constrainChainMovement = function(line, rowIdx, colIdx, isLeftOrUp) {
  if (!this.chainPair || !this._chainMovementPrepared) return;

  const chainPos = this.chainPair.chainPos;
  const targetPos = this.chainPair.targetPos;
  const isHorizontal = rowIdx >= 0;

  const currentLine = isHorizontal ? rowIdx : colIdx;
  const chainLine = isHorizontal ? chainPos[0] : chainPos[1];
  const targetLine = isHorizontal ? targetPos[0] : targetPos[1];

  if (this._chainBlocked) return;

  const isChainLine = chainLine === currentLine;
  const isTargetLine = targetLine === currentLine;

  if (!isChainLine && !isTargetLine) return;

  if (isChainLine) {
    const chainIdx = isHorizontal ? chainPos[1] : chainPos[0];
    const chainCell = line[chainIdx];

    if (!chainCell.hasValue()) return;

    if (this.checkLineBlocked(line, chainIdx, isLeftOrUp)) {
      this._chainBlocked = true;
      return;
    }
  }

  if (isTargetLine) {
    const targetIdx = isHorizontal ? targetPos[1] : targetPos[0];
    const targetCell = line[targetIdx];

    if (!targetCell.hasValue()) return;

    if (targetCell.isFrozenNumber()) {
      this._chainBlocked = true;
      return;
    }

    if (this.checkLineBlocked(line, targetIdx, isLeftOrUp)) {
      this._chainBlocked = true;
      return;
    }
  }
};

Game2048.prototype.checkLineBlocked = function(line, cellIdx, isLeftOrUp) {
  const cell = line[cellIdx];
  const cellValue = cell.value;

  if (isLeftOrUp) {
    let blockerIdx = -1;
    for (let i = cellIdx - 1; i >= 0; i--) {
      const c = line[i];
      if (c.isWoodBlock()) {
        blockerIdx = i;
        break;
      }
      if (c.hasValue()) {
        if (c.value !== cellValue) {
          blockerIdx = i;
        }
        break;
      }
    }
    if (blockerIdx !== -1 && blockerIdx === cellIdx - 1) {
      return true;
    }
  } else {
    let blockerIdx = -1;
    for (let i = cellIdx + 1; i < line.length; i++) {
      const c = line[i];
      if (c.isWoodBlock()) {
        blockerIdx = i;
        break;
      }
      if (c.hasValue()) {
        if (c.value !== cellValue) {
          blockerIdx = i;
        }
        break;
      }
    }
    if (blockerIdx !== -1 && blockerIdx === cellIdx + 1) {
      return true;
    }
  }

  return false;
};

Game2048.prototype.restoreChainBlockedMovement = function(originalBoard, mergePositions, direction) {
  if (!this._chainBlocked || !this.chainPair || !this._chainOriginalPos) return;

  const chainOrig = this._chainOriginalPos.chainPos;
  const targetOrig = this._chainOriginalPos.targetPos;

  const chainOrigCell = originalBoard.getCell(chainOrig[0], chainOrig[1]);
  const targetOrigCell = originalBoard.getCell(targetOrig[0], targetOrig[1]);

  const chainMerged = this.didCellMerge(chainOrig[0], chainOrig[1], chainOrigCell.value, mergePositions, originalBoard, true);
  const targetMerged = this.didCellMerge(targetOrig[0], targetOrig[1], targetOrigCell.value, mergePositions, originalBoard, true);

  const anyMerged = chainMerged || targetMerged;

  if (anyMerged) return;

  const currentChainPos = this.findChainCell();
  if (currentChainPos) {
    const [cr, cc] = currentChainPos;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dr, dc] of directions) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
        const neighbor = this.board.getCell(nr, nc);
        if (neighbor.hasValue() && !neighbor.isChain() && neighbor.value === targetOrigCell.value) {
          return;
        }
      }
    }
  }

  const positions = [
    { orig: chainOrig, origCell: chainOrigCell, otherPos: targetOrig, isChain: true },
    { orig: targetOrig, origCell: targetOrigCell, otherPos: chainOrig, isChain: false }
  ];

  const isHorizontalSlide = direction === 'left' || direction === 'right';

  for (const pos of positions) {
    const [origR, origC] = pos.orig;
    const origCell = pos.origCell;
    const [otherR, otherC] = pos.otherPos;

    const currentCell = this.board.getCell(origR, origC);
    if (currentCell.value === origCell.value && currentCell.type === origCell.type) continue;

    let newR = -1, newC = -1;
    let minDist = Infinity;

    if (isHorizontalSlide) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (j === origC) continue;
        if (origR === otherR && j === otherC) continue;
        const c = this.board.getCell(origR, j);
        const typeMatches = pos.isChain ? c.isChain() : !c.isChain();
        if (c.value === origCell.value && typeMatches) {
          const dist = Math.abs(j - origC);
          if (dist < minDist) {
            minDist = dist;
            newR = origR;
            newC = j;
          }
        }
      }
    } else {
      for (let i = 0; i < BOARD_SIZE; i++) {
        if (i === origR) continue;
        if (i === otherR && origC === otherC) continue;
        const c = this.board.getCell(i, origC);
        const typeMatches = pos.isChain ? c.isChain() : !c.isChain();
        if (c.value === origCell.value && typeMatches) {
          const dist = Math.abs(i - origR);
          if (dist < minDist) {
            minDist = dist;
            newR = i;
            newC = origC;
          }
        }
      }
    }

    if (newR >= 0 && (newR !== origR || newC !== origC)) {
      this.board.setCell(origR, origC, origCell.clone());
      this.board.setCell(newR, newC, Cell.empty());
    }
  }

  this.chainPair.chainPos = [chainOrig[0], chainOrig[1]];
  this.chainPair.targetPos = [targetOrig[0], targetOrig[1]];
};

Game2048.prototype.finalizeChainMovement = function() {
  this._chainWasBlocked = this._chainBlocked;
  this._chainMovementPrepared = false;
  this._chainOriginalPos = null;
  this._chainBlocked = false;
};

Game2048.prototype.chainHasWoodBlockBetween = function(idx1, idx2, line) {
  const minIdx = Math.min(idx1, idx2);
  const maxIdx = Math.max(idx1, idx2);
  for (let i = minIdx + 1; i < maxIdx; i++) {
    if (line[i].isWoodBlock()) {
      return true;
    }
  }
  return false;
};

Game2048.prototype.canMergeWithChainRules = function(cell1, cell2, r1, c1, r2, c2) {
  const chain1IsChain = cell1.isChain();
  const chain2IsChain = cell2.isChain();

  if (chain1IsChain && chain2IsChain) {
    return false;
  }

  if (this.chainPair !== null) {
    const cpr = this.chainPair.chainPos[0];
    const cpc = this.chainPair.chainPos[1];
    const tpr = this.chainPair.targetPos[0];
    const tpc = this.chainPair.targetPos[1];

    const cell1IsChainPos = (r1 === cpr && c1 === cpc);
    const cell1IsTargetPos = (r1 === tpr && c1 === tpc);
    const cell2IsChainPos = (r2 === cpr && c2 === cpc);
    const cell2IsTargetPos = (r2 === tpr && c2 === tpc);

    if ((cell1IsChainPos && cell2IsTargetPos) || (cell1IsTargetPos && cell2IsChainPos)) {
      return false;
    }

    if ((chain1IsChain && !cell1IsChainPos && !cell1IsTargetPos) ||
        (chain2IsChain && !cell2IsChainPos && !cell2IsTargetPos)) {
      return false;
    }
  } else {
    if (chain1IsChain || chain2IsChain) {
      return false;
    }
  }

  return true;
};
