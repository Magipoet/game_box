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

  findFirstEmptyCell() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (this.board[i][j].isEmpty()) {
          return [i, j];
        }
      }
    }
    return null;
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
