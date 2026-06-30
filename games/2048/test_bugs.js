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
  console.log('\\n=== ' + label + ' ===');
  for (let i = 0; i < BOARD_SIZE; i++) {
    let rowStr = '';
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
      } else if (cell.isTeleportPortal()) {
        rowStr += ' 🌀  ';
      } else {
        rowStr += '  ' + cell.value + '  ';
      }
    }
    console.log('  ' + rowStr);
  }
  if (game.chainPair) {
    console.log('  锁链状态: chain=(' + game.chainPair.chainPos + '), target=(' + game.chainPair.targetPos + '), 剩余步数=' + game.chainPair.remainingMoves);
  }
  if (game.teleportPortalPosition) {
    console.log('  传送阵位置: (' + game.teleportPortalPosition + ')');
  }
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
console.log('           Bug 复现测试');
console.log('════════════════════════════════════════════════════════════');

// Bug 1: 不对齐滑动时锁链直接解除
console.log('\\n【Bug 1: 不对齐滑动 - 垂直相邻 + 向左滑动】');
const game1 = createEmptyGame();
setupBoundChain(game1, [0, 3], 2, [1, 3], 4, 2);
printBoard(game1, '初始状态 (chain=2在(0,3), target=4在(1,3), 剩余2步)');

console.log('\\n  调用 move(left)...');
const result1 = game1.move('left');
console.log('  isValid:', result1.isValid);
printBoard(game1, '向左滑动后');

if (game1.chainPair === null) {
  console.log('  ❌ Bug 复现: 锁链被解除了！');
} else {
  console.log('  ✅ 锁链仍然存在');
  console.log('  chain位置: (' + game1.chainPair.chainPos + ')');
  console.log('  target位置: (' + game1.chainPair.targetPos + ')');
  console.log('  剩余步数: ' + game1.chainPair.remainingMoves);
  
  const chainMoved = game1.chainPair.chainPos[0] !== 0 || game1.chainPair.chainPos[1] !== 3;
  const targetMoved = game1.chainPair.targetPos[0] !== 1 || game1.chainPair.targetPos[1] !== 3;
  
  if (chainMoved || targetMoved) {
    console.log('  ⚠️  数字移动了 (chain移动:' + chainMoved + ', target移动:' + targetMoved + ')');
  } else {
    console.log('  ✅ 数字都没动');
  }
}

// Bug 1 变种: 有障碍物的情况
console.log('\\n\\n【Bug 1 变种: 垂直相邻 + chain被挡 + 向左滑动】');
const game1b = createEmptyGame();
setupBoundChain(game1b, [0, 3], 2, [1, 3], 4, 2);
game1b.board.setCell(0, 2, Cell.number(8));
printBoard(game1b, '初始状态 (chain=2在(0,3)被8挡住, target=4在(1,3))');

console.log('\\n  调用 move(left)...');
const result1b = game1b.move('left');
console.log('  isValid:', result1b.isValid);
printBoard(game1b, '向左滑动后');

if (game1b.chainPair === null) {
  console.log('  ❌ Bug 复现: 锁链被解除了！');
} else {
  console.log('  ✅ 锁链仍然存在');
  const chainMoved = game1b.chainPair.chainPos[0] !== 0 || game1b.chainPair.chainPos[1] !== 3;
  const targetMoved = game1b.chainPair.targetPos[0] !== 1 || game1b.chainPair.targetPos[1] !== 3;
  console.log('  chain移动: ' + chainMoved + ', target移动: ' + targetMoved);
}

// Bug 2: 数字停在传送阵位置
console.log('\\n\\n【Bug 2: 数字停在传送阵位置】');
const game2 = createEmptyGame();
game2.board.setCell(0, 1, Cell.number(2));
game2.teleportPortalPosition = [0, 0];
printBoard(game2, '初始状态 (传送阵在(0,0), 数字2在(0,1))');

console.log('\\n  调用 move(left)...');
const result2 = game2.move('left');
console.log('  isValid:', result2.isValid);
printBoard(game2, '向左滑动后');

const portalCell = game2.board.getCell(0, 0);
if (portalCell.hasValue()) {
  console.log('  ❌ Bug 复现: 数字停在了传送阵位置！');
  console.log('  传送阵位置的值: ' + portalCell.value);
  console.log('  传送阵状态: ' + (game2.teleportPortalPosition === null ? '已清除' : '存在'));
} else {
  console.log('  ✅ 传送阵位置是空的');
  if (game2.teleportPortalPosition === null) {
    console.log('  传送阵已被使用');
  }
}

// Bug 2 变种: 传送阵在角落
console.log('\\n\\n【Bug 2 变种: 传送阵在右下角】');
const game2b = createEmptyGame();
game2b.board.setCell(3, 2, Cell.number(4));
game2b.teleportPortalPosition = [3, 3];
printBoard(game2b, '初始状态 (传送阵在(3,3), 数字4在(3,2))');

console.log('\\n  调用 move(right)...');
const result2b = game2b.move('right');
console.log('  isValid:', result2b.isValid);
printBoard(game2b, '向右滑动后');

const portalCell2 = game2b.board.getCell(3, 3);
if (portalCell2.hasValue()) {
  console.log('  ❌ Bug 复现: 数字停在了传送阵位置！');
} else {
  console.log('  ✅ 传送阵位置是空的');
}

`;

eval(gameCode + testCode);
