const fs = require('fs');
const path = require('path');

const gameFiles = [
  'js/constants.js',
  'js/cell.js',
  'js/board.js',
  'js/snapshot.js',
  'js/game-core.js',
  'js/game-fun-mode.js',
  'js/game-movement.js'
];

const gameCode = gameFiles.map(f => fs.readFileSync(path.join(__dirname, f), 'utf8')).join('\n');

const testCode = `

function createEmptyGame() {
  const game = new Game2048();
  game.currentVariant = GAME_VARIANT.FUN;
  game.initGame();
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      game.board.setCell(i, j, Cell.empty());
    }
  }
  return game;
}

function printBoard(game, label) {
  console.log('\\n  ===== ' + label + ' =====');
  for (let i = 0; i < BOARD_SIZE; i++) {
    let rowStr = '  ' + i + ': ';
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = game.board.getCell(i, j);
      if (cell.isEmpty()) {
        rowStr += '  _  ';
      } else if (cell.isWoodBlock()) {
        rowStr += ' 🪵  ';
      } else if (cell.isChain()) {
        rowStr += ' ' + cell.value + '⛓️ ';
      } else if (cell.isFrozenNumber()) {
        rowStr += ' ' + cell.value + '❄️ ';
      } else {
        rowStr += '  ' + cell.value + '  ';
      }
    }
    console.log(rowStr);
  }
  if (game.chainPair) {
    console.log('  锁链状态: chain=(' + game.chainPair.chainPos + '), target=(' + game.chainPair.targetPos + '), 剩余步数=' + game.chainPair.remainingMoves);
  }
  console.log('  _chainBlocked:', game._chainBlocked, ', _chainMovementPrepared:', game._chainMovementPrepared);
}

function setupBoundChain(game, chainPos, chainValue, targetPos, targetValue, remainingMoves) {
  if (remainingMoves === undefined) remainingMoves = 5;
  game.board.setCell(chainPos[0], chainPos[1], Cell.chain(chainValue));
  game.board.setCell(targetPos[0], targetPos[1], Cell.number(targetValue));
  game.chainPair = {
    chainPos: [chainPos[0], chainPos[1]],
    targetPos: [targetPos[0], targetPos[1]],
    targetValue: targetValue,
    remainingMoves: remainingMoves
  };
}

console.log('\\n════════════════════════════════════════════════════════════');
console.log('       用户场景: 垂直对齐锁链 + 木块阻挡 + 水平滑动');
console.log('════════════════════════════════════════════════════════════');

// 用户场景:
// 第3行第一列(2,0)和第4行第一列(3,0)上下连着两个锁链数字
// 向左滑动时，应该滑动到第三列(索引2)，因为第三列有木块挡住
// (用户说"第三列"，我们假设是索引2，即从左数第3个位置)

console.log('\\n--- 场景A: 垂直对齐锁链，第3列(索引2)有木块阻挡 ---');
const gameA = createEmptyGame();
setupBoundChain(gameA, [2, 0], 4, [3, 0], 2); // 垂直对齐: (2,0)和(3,0)
gameA.board.setCell(2, 2, Cell.woodBlock(1)); // 木块在(2,2)
gameA.board.setCell(3, 2, Cell.woodBlock(1)); // 木块在(3,2)

printBoard(gameA, '初始状态');
console.log('  说明: chain(4⛓️)在(2,0), target(2)在(3,0)');
console.log('  木块🪵在(2,2)和(3,2)');
console.log('  期望: 向左滑动时，两者应该移动到列1（木块前的位置）');

gameA.move('left');
printBoard(gameA, '向左滑动后');

// 检查结果
const chainA = gameA.board.getCell(2, 0);
const chainAMoved = gameA.board.getCell(2, 1);
const targetA = gameA.board.getCell(3, 0);
const targetAMoved = gameA.board.getCell(3, 1);

console.log('\\n  检查结果:');
console.log('  chain在(2,0):', chainA.hasValue() ? chainA.value + (chainA.isChain() ? '⛓️' : '') : '空');
console.log('  chain在(2,1):', chainAMoved.hasValue() ? chainAMoved.value + (chainAMoved.isChain() ? '⛓️' : '') : '空');
console.log('  target在(3,0):', targetA.hasValue() ? targetA.value + (targetA.isChain() ? '⛓️' : '') : '空');
console.log('  target在(3,1):', targetAMoved.hasValue() ? targetAMoved.value + (targetAMoved.isChain() ? '⛓️' : '') : '空');

console.log('\\n--- 场景B: 垂直对齐锁链，路径通畅，无阻挡 ---');
const gameB = createEmptyGame();
setupBoundChain(gameB, [2, 3], 4, [3, 3], 2); // 垂直对齐: (2,3)和(3,3)

printBoard(gameB, '初始状态');
console.log('  说明: chain(4⛓️)在(2,3), target(2)在(3,3)');
console.log('  期望: 向左滑动时，两者都应该移动到最左边');

gameB.move('left');
printBoard(gameB, '向左滑动后');

console.log('\\n--- 场景C: 垂直对齐锁链，只有chain行有木块 ---');
const gameC = createEmptyGame();
setupBoundChain(gameC, [2, 0], 4, [3, 0], 2); // 垂直对齐: (2,0)和(3,0)
gameC.board.setCell(2, 1, Cell.woodBlock(1)); // 只有第2行有木块

printBoard(gameC, '初始状态');
console.log('  说明: chain(4⛓️)在(2,0), target(2)在(3,0)');
console.log('  木块🪵只在(2,1)');
console.log('  期望: chain被阻挡，target也不能动（同步）');

gameC.move('left');
printBoard(gameC, '向左滑动后');

console.log('\\n--- 场景D: 向右滑动，垂直对齐锁链 ---');
const gameD = createEmptyGame();
setupBoundChain(gameD, [2, 0], 4, [3, 0], 2); // 垂直对齐: (2,0)和(3,0)
gameD.board.setCell(2, 2, Cell.woodBlock(1)); // 木块在(2,2)
gameD.board.setCell(3, 2, Cell.woodBlock(1)); // 木块在(3,2)

printBoard(gameD, '初始状态');
console.log('  说明: chain(4⛓️)在(2,0), target(2)在(3,0)');
console.log('  木块🪵在(2,2)和(3,2)');
console.log('  期望: 向右滑动时，两者应该移动到列1（木块前）');

gameD.move('right');
printBoard(gameD, '向右滑动后');

console.log('\\n--- 场景E: 垂直对齐锁链（用户原始场景: chain在上，target在下） ---');
const gameE = createEmptyGame();
// 第3行第一列(2,0)和第4行第一列(3,0)
setupBoundChain(gameE, [2, 0], 2, [3, 0], 2);
// 木块在第3列（索引2）
gameE.board.setCell(2, 2, Cell.woodBlock(1));
gameE.board.setCell(3, 2, Cell.woodBlock(1));

printBoard(gameE, '初始状态');
console.log('  期望: 向左滑动时...等等，它们已经在第0列了！');
console.log('  可能用户是说向右滑动？让我们试试向右滑动...');

gameE.move('right');
printBoard(gameE, '向右滑动后');

`;

eval(gameCode + testCode);
