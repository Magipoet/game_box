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

  static teleport(value) {
    return new Cell(CELL_TYPE.TELEPORT, value);
  }

  static chain(value) {
    return new Cell(CELL_TYPE.CHAIN, value);
  }

  static teleportPortal() {
    return new Cell(CELL_TYPE.TELEPORT_PORTAL, 0);
  }

  isEmpty() { return this.type === CELL_TYPE.EMPTY; }
  isNumber() { return this.type === CELL_TYPE.NUMBER; }
  isWoodBlock() { return this.type === CELL_TYPE.WOOD_BLOCK; }
  isFrozenNumber() { return this.type === CELL_TYPE.FROZEN_NUMBER; }
  isTeleport() { return this.type === CELL_TYPE.TELEPORT; }
  isChain() { return this.type === CELL_TYPE.CHAIN; }
  isTeleportPortal() { return this.type === CELL_TYPE.TELEPORT_PORTAL; }
  hasValue() { return this.isNumber() || this.isFrozenNumber() || this.isTeleport() || this.isChain(); }

  clone() {
    return new Cell(this.type, this.value, this.remainingMerges, this.remainingMoves);
  }

  equals(other) {
    if (!other || !(other instanceof Cell)) return false;
    return this.type === other.type &&
           this.value === other.value &&
           this.remainingMerges === other.remainingMerges &&
           this.remainingMoves === other.remainingMoves;
  }
}
