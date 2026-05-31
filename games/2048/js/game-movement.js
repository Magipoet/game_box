Game2048.prototype.moveLeft = function(mergePositions) {
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
};

Game2048.prototype.moveRight = function(mergePositions) {
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
};

Game2048.prototype.moveUp = function(mergePositions) {
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
};

Game2048.prototype.moveDown = function(mergePositions) {
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
};

Game2048.prototype.processRowLeft = function(row, mergePositions, rowIdx, colIdx, iceIdxInLine) {
  let scoreAdded = 0;
  const result = [];
  for (let i = 0; i < row.length; i++) {
    result.push(Cell.empty());
  }
  const workingRow = [...row];

  this.constrainChainMovement(workingRow, rowIdx, colIdx, true);

  for (let i = 0; i < workingRow.length; i++) {
    if (workingRow[i].isFrozenNumber()) {
      let isFrozenTarget = false;
      if (this.chainPair !== null) {
        const tpr = this.chainPair.targetPos[0];
        const tpc = this.chainPair.targetPos[1];
        if (rowIdx >= 0) {
          isFrozenTarget = (rowIdx === tpr && i === tpc);
        } else {
          isFrozenTarget = (i === tpr && colIdx === tpc);
        }
      }
      if (isFrozenTarget) {
        continue;
      }

      for (let j = i + 1; j < workingRow.length; j++) {
        if (workingRow[j].isWoodBlock()) break;
        if (workingRow[j].isFrozenNumber()) break;
        if (workingRow[j].isChain() && this.chainPair !== null && workingRow[j].value !== workingRow[i].value) break;
        if ((workingRow[j].isNumber() || workingRow[j].isChain()) &&
            !workingRow[j].isFrozenNumber() &&
            workingRow[i].value === workingRow[j].value &&
            workingRow[i].value < 4096) {
          let r1, c1, r2, c2;
          if (rowIdx >= 0) {
            r1 = rowIdx; c1 = i; r2 = rowIdx; c2 = j;
          } else {
            r1 = i; c1 = colIdx; r2 = j; c2 = colIdx;
          }
          if (!this.canMergeWithChainRules(workingRow[i], workingRow[j], r1, c1, r2, c2)) {
            continue;
          }
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
        (segment[0].isWoodBlock() || segment[0].isFrozenNumber() || segment[0].isTeleportPortal())) {
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

        if (current[1].value === next[1].value && !hasIceBetween && current[1].value < 4096) {
          let r1, c1, r2, c2;
          if (rowIdx >= 0) {
            r1 = rowIdx;
            c1 = startIdx + current[0];
            r2 = rowIdx;
            c2 = startIdx + next[0];
          } else {
            r1 = startIdx + current[0];
            c1 = colIdx;
            r2 = startIdx + next[0];
            c2 = colIdx;
          }
          if (!this.canMergeWithChainRules(current[1], next[1], r1, c1, r2, c2)) {
            processed.push(current);
            i++;
            continue;
          }

          const currentIsChain = current[1].isChain();
          const nextIsChain = next[1].isChain();

          if (this._chainBlocked && !currentIsChain && nextIsChain) {
            processed.push(current);
            i++;
            continue;
          }

          const mergedValue = current[1].value * 2;
          const currentIsFrozen = current[1].isFrozenNumber();
          const nextIsFrozen = next[1].isFrozenNumber();
          const mergeAtIceBlock = currentIsFrozen || nextIsFrozen;
          const mergeToChain = currentIsChain || nextIsChain;

          let newCell;
          let mergePosInSegment;
          if (mergeAtIceBlock) {
            newCell = Cell.frozenNumber(mergedValue, this.iceBlockRemainingMoves);
            mergePosInSegment = currentIsFrozen ? current[0] : next[0];
            this.iceBlockHadMerge = true;
          } else if (mergeToChain) {
            newCell = Cell.chain(mergedValue);
            mergePosInSegment = currentIsChain ? current[0] : next[0];
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
};

Game2048.prototype.processRowRight = function(row, mergePositions, rowIdx, colIdx, iceIdxInLine) {
  const workingRow = [...row];
  let additionalScore = 0;

  this.constrainChainMovement(workingRow, rowIdx, colIdx, false);

  for (let i = workingRow.length - 1; i >= 0; i--) {
    if (workingRow[i].isFrozenNumber()) {
      let isFrozenTarget = false;
      if (this.chainPair !== null) {
        const tpr = this.chainPair.targetPos[0];
        const tpc = this.chainPair.targetPos[1];
        if (rowIdx >= 0) {
          isFrozenTarget = (rowIdx === tpr && i === tpc);
        } else {
          isFrozenTarget = (i === tpr && colIdx === tpc);
        }
      }
      if (isFrozenTarget) {
        continue;
      }

      for (let j = i - 1; j >= 0; j--) {
        if (workingRow[j].isWoodBlock()) break;
        if (workingRow[j].isFrozenNumber()) break;
        if (workingRow[j].isChain() && this.chainPair !== null && workingRow[j].value !== workingRow[i].value) break;
        if ((workingRow[j].isNumber() || workingRow[j].isChain()) &&
            !workingRow[j].isFrozenNumber() &&
            workingRow[i].value === workingRow[j].value &&
            workingRow[i].value < 4096) {
          let r1, c1, r2, c2;
          if (rowIdx >= 0) {
            r1 = rowIdx; c1 = i; r2 = rowIdx; c2 = j;
          } else {
            r1 = i; c1 = colIdx; r2 = j; c2 = colIdx;
          }
          if (!this.canMergeWithChainRules(workingRow[i], workingRow[j], r1, c1, r2, c2)) {
            continue;
          }
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

  let originalChainPos = null;
  let originalTargetPos = null;
  if (this.chainPair) {
    const isHorizontal = rowIdx >= 0;
    originalChainPos = [...this.chainPair.chainPos];
    originalTargetPos = [...this.chainPair.targetPos];

    if (isHorizontal) {
      if (rowIdx === this.chainPair.chainPos[0]) {
        this.chainPair.chainPos = [this.chainPair.chainPos[0], BOARD_SIZE - 1 - this.chainPair.chainPos[1]];
      }
      if (rowIdx === this.chainPair.targetPos[0]) {
        this.chainPair.targetPos = [this.chainPair.targetPos[0], BOARD_SIZE - 1 - this.chainPair.targetPos[1]];
      }
    } else {
      if (colIdx === this.chainPair.chainPos[1]) {
        this.chainPair.chainPos = [BOARD_SIZE - 1 - this.chainPair.chainPos[0], this.chainPair.chainPos[1]];
      }
      if (colIdx === this.chainPair.targetPos[1]) {
        this.chainPair.targetPos = [BOARD_SIZE - 1 - this.chainPair.targetPos[0], this.chainPair.targetPos[1]];
      }
    }
  }

  const mergePosBefore = mergePositions.length;
  const result = this.processRowLeft(reversedRow, mergePositions, rowIdx, colIdx, iceIdxInLine);

  if (originalChainPos) {
    this.chainPair.chainPos = originalChainPos;
    this.chainPair.targetPos = originalTargetPos;
  }

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
};
