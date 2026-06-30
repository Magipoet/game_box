const fs = require('fs');
const path = require('path');

const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    appendChild: () => {},
    setAttribute: () => {},
    addEventListener: () => {},
    style: {}
  })
};

const jsDir = path.join(__dirname, 'js');
const jsFiles = [
  'constants.js',
  'cell.js',
  'board.js',
  'snapshot.js',
  'game-core.js',
  'game-movement.js',
  'game-fun-mode.js',
  'storage.js'
];

console.log('🔧 加载 js/ 目录文件 ...');
let combinedCode = '';
for (const file of jsFiles) {
  const filePath = path.join(jsDir, file);
  const code = fs.readFileSync(filePath, 'utf-8');
  combinedCode += `\n// --- ${file} ---\n` + code;
}

const _exports = eval(`(function(){\n${combinedCode}\nreturn { Cell, GameBoard, GameSnapshot, Game2048, StorageService, CELL_TYPE, GAME_MODE, GAME_VARIANT };\n})()`);

const { Cell, GameBoard, Game2048, CELL_TYPE, GAME_MODE, GAME_VARIANT } = _exports;
const BOARD_SIZE = 4;

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
  console.log('\n  ===== ' + label + ' =====');
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
    console.log('  锁链状态: chain=(' + game.chainPair.chainPos + '), target=(' + game.chainPair.targetPos + ')');
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

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log('  ✅ ' + msg);
    passed++;
  } else {
    console.log('  ❌ ' + msg);
    failed++;
  }
}

console.log('\n════════════════════════════════════════════════════════════');
console.log('       用户场景: 垂直对齐锁链 + 木块阻挡 + 水平滑动');
console.log('════════════════════════════════════════════════════════════');

// 场景1: 用户描述的场景 - 垂直对齐锁链向右滑动，木块在列2
console.log('\n--- 场景1: 垂直对齐锁链向右滑动，木块在列2（索引2） ---');
const game1 = createEmptyGame();
setupBoundChain(game1, [2, 0], 4, [3, 0], 2);
game1.board.setCell(2, 2, Cell.woodBlock(1));
game1.board.setCell(3, 2, Cell.woodBlock(1));

printBoard(game1, '初始状态');
console.log('  期望: 向右滑动 → chain(2,0)→(2,1), target(3,0)→(3,1)');

const res1 = game1.move('right');
printBoard(game1, '向右滑动后');

const g1c21 = game1.board.getCell(2, 1);
const g1t31 = game1.board.getCell(3, 1);
assert(g1c21.isChain() && g1c21.value === 4, 'chain应该移动到(2,1)');
assert(g1t31.value === 2 && !g1t31.isChain(), 'target应该移动到(3,1)');
assert(game1.chainPair.chainPos[0] === 2 && game1.chainPair.chainPos[1] === 1, 'chainPos应该更新为(2,1)');
assert(game1.chainPair.targetPos[0] === 3 && game1.chainPair.targetPos[1] === 1, 'targetPos应该更新为(3,1)');

// 场景2: 垂直对齐锁链向左滑动，木块在列1
console.log('\n--- 场景2: 垂直对齐锁链向左滑动，木块在列1（索引1） ---');
const game2 = createEmptyGame();
setupBoundChain(game2, [2, 3], 4, [3, 3], 2);
game2.board.setCell(2, 1, Cell.woodBlock(1));
game2.board.setCell(3, 1, Cell.woodBlock(1));

printBoard(game2, '初始状态');
console.log('  期望: 向左滑动 → chain(2,3)→(2,2), target(3,3)→(3,2)');

game2.move('left');
printBoard(game2, '向左滑动后');

const g2c22 = game2.board.getCell(2, 2);
const g2t32 = game2.board.getCell(3, 2);
assert(g2c22.isChain() && g2c22.value === 4, 'chain应该移动到(2,2)');
assert(g2t32.value === 2 && !g2t32.isChain(), 'target应该移动到(3,2)');

// 场景3: 紧贴木块时无法移动
console.log('\n--- 场景3: 锁链紧贴木块，向右滑动时应该无法移动 ---');
const game3 = createEmptyGame();
setupBoundChain(game3, [2, 0], 4, [3, 0], 2);
game3.board.setCell(2, 1, Cell.woodBlock(1));
game3.board.setCell(3, 1, Cell.woodBlock(1));

printBoard(game3, '初始状态');
console.log('  期望: 向右滑动 → 无法移动');

const res3 = game3.move('right');
printBoard(game3, '向右滑动后');

const g3c20 = game3.board.getCell(2, 0);
const g3t30 = game3.board.getCell(3, 0);
assert(!res3.isValid, '滑动应该无效（isValid=false）');
assert(g3c20.isChain() && g3c20.value === 4, 'chain应该保持在(2,0)');
assert(g3t30.value === 2 && !g3t30.isChain(), 'target应该保持在(3,0)');

// 场景4: 水平对齐锁链向上滑动，木块在行1
console.log('\n--- 场景4: 水平对齐锁链向上滑动，木块在行1（索引1） ---');
const game4 = createEmptyGame();
setupBoundChain(game4, [3, 0], 4, [3, 1], 2);
game4.board.setCell(1, 0, Cell.woodBlock(1));
game4.board.setCell(1, 1, Cell.woodBlock(1));

printBoard(game4, '初始状态');
console.log('  期望: 向上滑动 → chain(3,0)→(2,0), target(3,1)→(2,1)');

game4.move('up');
printBoard(game4, '向上滑动后');

const g4c20 = game4.board.getCell(2, 0);
const g4t21 = game4.board.getCell(2, 1);
assert(g4c20.isChain() && g4c20.value === 4, 'chain应该移动到(2,0)');
assert(g4t21.value === 2 && !g4t21.isChain(), 'target应该移动到(2,1)');

// 场景5: 路径通畅，完全移动
console.log('\n--- 场景5: 垂直对齐锁链路径通畅，完全移动 ---');
const game5 = createEmptyGame();
setupBoundChain(game5, [2, 3], 4, [3, 3], 2);

printBoard(game5, '初始状态');
console.log('  期望: 向左滑动 → chain(2,3)→(2,0), target(3,3)→(3,0)');

game5.move('left');
printBoard(game5, '向左滑动后');

const g5c20 = game5.board.getCell(2, 0);
const g5t30 = game5.board.getCell(3, 0);
assert(g5c20.isChain() && g5c20.value === 4, 'chain应该移动到(2,0)');
assert(g5t30.value === 2 && !g5t30.isChain(), 'target应该移动到(3,0)');

// 场景6: 一个行有木块一个行没有，应该都不动
console.log('\n--- 场景6: 只有chain行有木块阻挡，两个都不动 ---');
const game6 = createEmptyGame();
setupBoundChain(game6, [2, 0], 4, [3, 0], 2);
game6.board.setCell(2, 1, Cell.woodBlock(1));

printBoard(game6, '初始状态');
console.log('  期望: 向右滑动 → chain被阻挡，两个都不动');

const res6 = game6.move('right');
printBoard(game6, '向右滑动后');

const g6c20 = game6.board.getCell(2, 0);
const g6t30 = game6.board.getCell(3, 0);
assert(!res6.isValid || (g6c20.isChain() && g6c20.value === 4 && g6t30.value === 2), '两个都应该保持不动');

console.log('\n════════════════════════════════════════════════════════════');
console.log('  测试结果: 通过 ' + passed + ' / 失败 ' + failed);
console.log('════════════════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
