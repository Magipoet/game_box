class GameSnapshot {
  constructor(board, score, iceBlockPosition, iceBlockRemainingMoves, teleportPortalPosition, chainPair, elapsedSeconds, timerStarted, shuffleUsed, chainCooldown) {
    this.board = board;
    this.score = score;
    this.iceBlockPosition = iceBlockPosition;
    this.iceBlockRemainingMoves = iceBlockRemainingMoves;
    this.teleportPortalPosition = teleportPortalPosition;
    this.chainPair = chainPair;
    this.elapsedSeconds = elapsedSeconds;
    this.timerStarted = timerStarted;
    this.shuffleUsed = shuffleUsed;
    this.chainCooldown = chainCooldown || 0;
  }
}
