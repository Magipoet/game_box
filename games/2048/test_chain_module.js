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

let testsPassed = 0;
let testsFailed = 0;
let testFailures = [];

function runTest(testName, testFn) {
  console.log('\\n=== ' + testName + ' ===');
  try {
    testFn();
    console.log('  ✅ 通过');
    testsPassed++;
  } catch (e) {
    console.log('  ❌ 失败: ' + e.message);
    testsFailed++;
    testFailures.push({ test: testName, error: e.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || '断言失败');
  }
}

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

function printBoard(game) {
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
      } else {
        rowStr += '  ' + cell.value + '  ';
      }
    }
    console.log('  ' + rowStr);
  }
  if (game.chainPair) {
    console.log('  锁链状态: chain=(' + game.chainPair.chainPos + '), target=(' + game.chainPair.targetPos + '), 剩余步数=' + game.chainPair.remainingMoves);
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
console.log('           2048 锁链模块测试套件');
console.log('════════════════════════════════════════════════════════════');

runTest('场景1: 未绑定锁链 - 可以自由移动', function() {
  const game = createEmptyGame();
  game.board.setCell(1, 3, Cell.chain(4));
  game.chainPair = null;

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  const chainCell = game.board.getCell(1, 0);
  assert(chainCell.isChain() && chainCell.value === 4, '锁链应该移动到最左边');
});

runTest('场景2: 未绑定锁链 - 滑动后相邻自动绑定', function() {
  const game = createEmptyGame();
  game.board.setCell(1, 3, Cell.chain(4));
  game.board.setCell(1, 2, Cell.number(2));
  game.chainPair = null;

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '应该自动绑定');
  assert(game.chainPair.remainingMoves === 5, '初始倒计时应为5');
});

runTest('场景3: 水平对齐 - 同步移动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 2], 4, [1, 3], 2);

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  assert(game.chainPair.chainPos[1] === 0, 'chain应该移动到列0');
  assert(game.chainPair.targetPos[1] === 1, 'target应该移动到列1');
  assert(game.chainPair.remainingMoves === 4, '倒计时应该减1');
});

runTest('场景4: 水平对齐 - 前方被阻挡，都不动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 2], 4, [1, 3], 2);
  game.board.setCell(1, 1, Cell.woodBlock(1));

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  assert(game.chainPair.chainPos[1] === 2, 'chain应该保持在列2');
  assert(game.chainPair.targetPos[1] === 3, 'target应该保持在列3');
});

runTest('场景5: 水平对齐 - chain参与合并', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 2], 4, [1, 3], 2);
  game.board.setCell(1, 1, Cell.number(4));

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainCell = game.board.getCell(game.chainPair.chainPos[0], game.chainPair.chainPos[1]);
  assert(chainCell.value === 8, 'chain应该合并为8');
  assert(game.chainPair.remainingMoves === 3, '倒计时应该减2（滑动-1，合并-1）');
});

runTest('场景6: 水平对齐 - chain和target之间不能合并', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 2], 4, [1, 3], 4);

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainCell = game.board.getCell(game.chainPair.chainPos[0], game.chainPair.chainPos[1]);
  const targetCell = game.board.getCell(game.chainPair.targetPos[0], game.chainPair.targetPos[1]);
  assert(chainCell.value === 4, 'chain应该还是4');
  assert(targetCell.value === 4, 'target应该还是4');
});

runTest('场景7: 垂直不对齐 - 同步移动（路径通畅）', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 3], 4, [2, 3], 2);

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainMoved = game.chainPair.chainPos[1] < 3;
  const targetMoved = game.chainPair.targetPos[1] < 3;
  assert(chainMoved && targetMoved, '两个都应该移动');
  
  const stillAdjacent = Math.abs(game.chainPair.chainPos[0] - game.chainPair.targetPos[0]) +
                        Math.abs(game.chainPair.chainPos[1] - game.chainPair.targetPos[1]) === 1;
  assert(stillAdjacent, '应该保持相邻');
});

runTest('场景8: 垂直不对齐 - 一个被阻挡，都不动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 3], 4, [2, 3], 2);
  game.board.setCell(1, 2, Cell.woodBlock(1));

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  assert(game.chainPair.chainPos[1] === 3, 'chain应该不动');
  assert(game.chainPair.targetPos[1] === 3, 'target应该不动');
});

runTest('场景9: 垂直不对齐 - target路径通畅但chain被挡，都不动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 3], 4, [2, 3], 2);
  game.board.setCell(1, 2, Cell.number(8));

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  assert(game.chainPair.chainPos[1] === 3, 'chain应该不动（被8挡住）');
  assert(game.chainPair.targetPos[1] === 3, 'target应该不动（同步）');
});

runTest('场景10: 水平不对齐（左右相邻，上下滑动）- 同步移动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [2, 1], 4, [2, 2], 2);

  console.log('  初始状态:');
  printBoard(game);

  game.move('up');

  console.log('  向上滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainMoved = game.chainPair.chainPos[0] < 2;
  const targetMoved = game.chainPair.targetPos[0] < 2;
  assert(chainMoved && targetMoved, '两个都应该移动');
});

runTest('场景11: 倒计时结束自动解除', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 1], 4, [1, 2], 2, 1);

  console.log('  初始状态 (倒计时=1):');
  printBoard(game);

  game.move('left');

  console.log('  滑动后:');
  printBoard(game);

  assert(game.chainPair === null, '倒计时结束应该解除锁链');
  const chainCell = game.board.getCell(1, 0);
  const targetCell = game.board.getCell(1, 1);
  assert(!chainCell.isChain(), 'chain应该变为普通数字');
  assert(!targetCell.isChain(), 'target应该保持普通数字');
});

runTest('场景12: 锁链与冰冻数字绑定', function() {
  const game = createEmptyGame();
  game.board.setCell(1, 1, Cell.chain(4));
  game.board.setCell(1, 2, Cell.frozenNumber(2, 5));
  game.iceBlockPosition = [1, 2];
  game.iceBlockRemainingMoves = 5;
  game.chainPair = {
    chainPos: [1, 1],
    targetPos: [1, 2],
    targetValue: 2,
    remainingMoves: 5
  };

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const targetCell = game.board.getCell(game.chainPair.targetPos[0], game.chainPair.targetPos[1]);
  assert(targetCell.isFrozenNumber(), 'target应该保持冰冻状态');
});

runTest('场景13: 多个相同值 - 搜索时区分chain和target', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [2, 3], 2, [3, 3], 2);

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainCell = game.board.getCell(game.chainPair.chainPos[0], game.chainPair.chainPos[1]);
  const targetCell = game.board.getCell(game.chainPair.targetPos[0], game.chainPair.targetPos[1]);
  assert(chainCell.isChain(), 'chain位置应该是chain类型');
  assert(!targetCell.isChain(), 'target位置应该是普通数字');
});

runTest('场景14: 不对齐滑动时其他数字可以与锁链合并', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [2, 2], 4, [3, 2], 2);
  game.board.setCell(2, 1, Cell.number(4));

  console.log('  初始状态:');
  printBoard(game);

  game.move('right');

  console.log('  向右滑动后:');
  printBoard(game);

  const chainMerged = game.board.getCell(2, 3).value === 8;
  assert(chainMerged, '4应该与4(chain)合并为8');
});

runTest('场景15: 新数字只出现在边界', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 1], 4, [1, 2], 2);

  console.log('  初始状态:');
  printBoard(game);

  const countBefore = {};
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = game.board.getCell(i, j);
      if (cell.hasValue()) {
        const key = cell.value + ',' + cell.type;
        countBefore[key] = (countBefore[key] || 0) + 1;
      }
    }
  }

  game.move('left');

  console.log('  滑动后（新数字出现）:');
  printBoard(game);

  const countAfter = {};
  const cellPositions = {};
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = game.board.getCell(i, j);
      if (cell.hasValue()) {
        const key = cell.value + ',' + cell.type;
        countAfter[key] = (countAfter[key] || 0) + 1;
        if (!cellPositions[key]) cellPositions[key] = [];
        cellPositions[key].push([i, j]);
      }
    }
  }

  const newCells = [];
  for (const key in countAfter) {
    const before = countBefore[key] || 0;
    const after = countAfter[key];
    if (after > before) {
      const positions = cellPositions[key];
      for (let i = 0; i < after - before; i++) {
        newCells.push(positions[positions.length - 1 - i]);
      }
    }
  }

  for (let k = 0; k < newCells.length; k++) {
    const r = newCells[k][0];
    const c = newCells[k][1];
    const isBorder = r === 0 || r === 3 || c === 0 || c === 3;
    assert(isBorder, '新数字应该出现在边界，但在 (' + r + ',' + c + ') 发现');
  }
});

runTest('场景16: 垂直不对齐同步移动后更新chainPair位置', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 3], 4, [2, 3], 2);

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  const chainPos = game.chainPair.chainPos;
  const targetPos = game.chainPair.targetPos;
  const chainCell = game.board.getCell(chainPos[0], chainPos[1]);
  const targetCell = game.board.getCell(targetPos[0], targetPos[1]);

  assert(chainCell.isChain(), 'chainPos指向的应该是chain');
  assert(!targetCell.isChain() && targetCell.value === 2, 'targetPos指向的应该是值为2的普通数字');
});

runTest('场景17: 传送门位置新数字边界生成', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 1], 4, [1, 2], 2);
  game.teleportPortalPosition = [3, 3];

  console.log('  初始状态 (传送门在 (3,3)):');
  printBoard(game);

  const countBefore = {};
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = game.board.getCell(i, j);
      if (cell.hasValue()) {
        const key = cell.value + ',' + cell.type;
        countBefore[key] = (countBefore[key] || 0) + 1;
      }
    }
  }

  game.move('left');

  console.log('  滑动后:');
  printBoard(game);

  const countAfter = {};
  const cellPositions = {};
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = game.board.getCell(i, j);
      if (cell.hasValue() && !cell.isChain() && !cell.isWoodBlock() && !cell.isFrozenNumber()) {
        if (cell.value === 2 || cell.value === 4) {
          const key = cell.value + ',' + cell.type;
          countAfter[key] = (countAfter[key] || 0) + 1;
          if (!cellPositions[key]) cellPositions[key] = [];
          cellPositions[key].push([i, j]);
        }
      }
    }
  }

  const newCells = [];
  for (const key in countAfter) {
    const before = countBefore[key] || 0;
    const after = countAfter[key];
    if (after > before) {
      const positions = cellPositions[key];
      for (let i = 0; i < after - before; i++) {
        newCells.push(positions[positions.length - 1 - i]);
      }
    }
  }

  for (let k = 0; k < newCells.length; k++) {
    const r = newCells[k][0];
    const c = newCells[k][1];
    const isBorder = r === 0 || r === 3 || c === 0 || c === 3;
    assert(isBorder, '新数字应该出现在边界，但在 (' + r + ',' + c + ') 发现');
  }
});

runTest('场景18: 未绑定锁链不能参与合并', function() {
  const game = createEmptyGame();
  game.board.setCell(1, 2, Cell.chain(4));
  game.board.setCell(1, 1, Cell.number(4));
  game.chainPair = null;

  console.log('  初始状态:');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  const cell0 = game.board.getCell(1, 0);
  const cell1 = game.board.getCell(1, 1);
  assert((cell0.value === 4 && cell1.value === 4),
         '未绑定的锁链不应该参与合并');
});

runTest('场景19: 垂直对齐 - chain被阻挡，都不动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 0], 2, [2, 0], 2);
  game.board.setCell(1, 1, Cell.woodBlock(1));

  console.log('  初始状态:');
  printBoard(game);

  game.move('right');

  console.log('  向右滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainCell = game.board.getCell(1, 0);
  const targetCell = game.board.getCell(2, 0);
  assert(chainCell.isChain() && chainCell.value === 2, 'chain应该保持在(1,0)');
  assert(!targetCell.isChain() && targetCell.value === 2, 'target应该保持在(2,0)');
});

runTest('场景20: 垂直对齐 - target被阻挡，都不动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 0], 2, [2, 0], 2);
  game.board.setCell(2, 1, Cell.woodBlock(1));

  console.log('  初始状态:');
  printBoard(game);

  game.move('right');

  console.log('  向右滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainCell = game.board.getCell(1, 0);
  const targetCell = game.board.getCell(2, 0);
  assert(chainCell.isChain() && chainCell.value === 2, 'chain应该保持在(1,0)');
  assert(!targetCell.isChain() && targetCell.value === 2, 'target应该保持在(2,0)');
});

runTest('场景21: 水平对齐 - 垂直滑动时chain被阻挡，都不动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [2, 1], 2, [2, 2], 2);
  game.board.setCell(1, 1, Cell.woodBlock(1));

  console.log('  初始状态:');
  printBoard(game);

  game.move('up');

  console.log('  向上滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainCell = game.board.getCell(2, 1);
  const targetCell = game.board.getCell(2, 2);
  assert(chainCell.isChain() && chainCell.value === 2, 'chain应该保持在(2,1)');
  assert(!targetCell.isChain() && targetCell.value === 2, 'target应该保持在(2,2)');
});

runTest('场景22: 水平对齐 - 垂直滑动时target被阻挡，都不动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [2, 1], 2, [2, 2], 2);
  game.board.setCell(1, 2, Cell.woodBlock(1));

  console.log('  初始状态:');
  printBoard(game);

  game.move('up');

  console.log('  向上滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainCell = game.board.getCell(2, 1);
  const targetCell = game.board.getCell(2, 2);
  assert(chainCell.isChain() && chainCell.value === 2, 'chain应该保持在(2,1)');
  assert(!targetCell.isChain() && targetCell.value === 2, 'target应该保持在(2,2)');
});

runTest('场景23: 倒计时=1 - target被阻挡但滑动有效，倒计时归零，锁链解除', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [2, 0], 8, [2, 1], 2);
  game.chainPair.remainingMoves = 1;
  game.board.setCell(1, 1, Cell.number(16));

  console.log('  初始状态 (倒计时=1):');
  printBoard(game);

  game.move('up');

  console.log('  向上滑动后:');
  printBoard(game);

  assert(game.chainPair === null, '倒计时归零后锁链应该解除');
  const chainCell = game.board.getCell(2, 0);
  const targetCell = game.board.getCell(2, 1);
  assert(!chainCell.isChain() && chainCell.value === 8, 'chain应该变为普通数字在(2,0)');
  assert(!targetCell.isChain() && targetCell.value === 2, 'target应该保持普通数字在(2,1)');
});

runTest('场景24: 倒计时=1 - chain被阻挡但滑动有效，倒计时归零，锁链解除', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [2, 0], 8, [2, 1], 2);
  game.chainPair.remainingMoves = 1;
  game.board.setCell(1, 0, Cell.number(16));

  console.log('  初始状态 (倒计时=1):');
  printBoard(game);

  game.move('up');

  console.log('  向上滑动后:');
  printBoard(game);

  assert(game.chainPair === null, '倒计时归零后锁链应该解除');
  const chainCell = game.board.getCell(2, 0);
  const targetCell = game.board.getCell(2, 1);
  assert(!chainCell.isChain() && chainCell.value === 8, 'chain应该变为普通数字在(2,0)');
  assert(!targetCell.isChain() && targetCell.value === 2, 'target应该保持普通数字在(2,1)');
});

runTest('场景25: 正常同步移动 - 倒计时减少1', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 0], 2, [1, 1], 2);
  game.chainPair.remainingMoves = 5;

  console.log('  初始状态 (倒计时=5):');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  assert(game.chainPair.remainingMoves === 4, '每次滑动倒计时应该减少1，5-1=4');
});

runTest('场景26: chain参与合并 - 倒计时减少2', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 1], 2, [2, 1], 4);
  game.board.setCell(1, 0, Cell.number(2));
  game.chainPair.remainingMoves = 5;

  console.log('  初始状态 (倒计时=5):');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后 (chain合并):');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  assert(game.chainPair.remainingMoves === 3, '滑动减1 + chain合并减1，5-2=3');
});

runTest('场景27: target参与合并 - 倒计时减少2', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 1], 4, [2, 1], 2);
  game.board.setCell(2, 0, Cell.number(2));
  game.chainPair.remainingMoves = 5;

  console.log('  初始状态 (倒计时=5):');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后 (target合并):');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  assert(game.chainPair.remainingMoves === 3, '滑动减1 + target合并减1，5-2=3');
});

runTest('场景28: 两者都参与合并 - 倒计时减少3', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [1, 1], 2, [2, 1], 2);
  game.board.setCell(1, 0, Cell.number(2));
  game.board.setCell(2, 0, Cell.number(2));
  game.chainPair.remainingMoves = 5;

  console.log('  初始状态 (倒计时=5):');
  printBoard(game);

  game.move('left');

  console.log('  向左滑动后 (两者都合并):');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  assert(game.chainPair.remainingMoves === 2, '滑动减1 + chain减1 + target减1，5-3=2');
});

runTest('场景29: target是冰冻数字，chain与普通数字合并', function() {
  const game = createEmptyGame();
  game.board.setCell(1, 3, Cell.frozenNumber(2, 5));
  game.iceBlockPosition = [1, 3];
  game.iceBlockRemainingMoves = 5;
  game.board.setCell(2, 3, Cell.chain(2));
  game.board.setCell(3, 3, Cell.number(2));
  game.chainPair = {
    chainPos: [2, 3],
    targetPos: [1, 3],
    targetValue: 2,
    remainingMoves: 5
  };

  console.log('  初始状态:');
  printBoard(game);
  console.log('  说明: (1,3)=冰冻2(target), (2,3)=锁链2(chain), (3,3)=普通2');

  game.move('up');

  console.log('  向上滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const chainCell = game.board.getCell(game.chainPair.chainPos[0], game.chainPair.chainPos[1]);
  assert(chainCell.isChain() && chainCell.value === 4, 'chain应该与普通2合并为锁链4');
  assert(game.chainPair.remainingMoves === 3, '滑动减1 + chain合并减1，5-2=3');
  const targetCell = game.board.getCell(game.chainPair.targetPos[0], game.chainPair.targetPos[1]);
  assert(targetCell.isFrozenNumber() && targetCell.value === 2, 'target应该保持冰冻2不变');
});

runTest('场景30: 前方数字合并，chain和target同步移动', function() {
  const game = createEmptyGame();
  setupBoundChain(game, [2, 3], 4, [3, 3], 2);
  game.board.setCell(0, 3, Cell.number(16));
  game.board.setCell(1, 3, Cell.number(16));
  game.chainPair.remainingMoves = 5;

  console.log('  初始状态:');
  printBoard(game);
  console.log('  说明: (0,3)=16, (1,3)=16, (2,3)=锁链4(chain), (3,3)=普通2(target)');

  game.move('up');

  console.log('  向上滑动后:');
  printBoard(game);

  assert(game.chainPair !== null, '锁链应该保持连接');
  const mergedCell = game.board.getCell(0, 3);
  assert(mergedCell.value === 32, '两个16应该合并为32');
  const chainNewChainCell = game.board.getCell(1, 3);
  assert(chainNewChainCell.isChain() && chainNewChainCell.value === 4, 'chain应该移动到(1,3)');
  const newTargetCell = game.board.getCell(2, 3);
  assert(!newTargetCell.isChain() && newTargetCell.value === 2, 'target应该移动到(2,3)');
  assert(game.chainPair.remainingMoves === 4, '倒计时应该减少1，5-1=4');
});

console.log('\\n════════════════════════════════════════════════════════════');
console.log('                    测试结果汇总');
console.log('════════════════════════════════════════════════════════════');
console.log('  总计: ' + (testsPassed + testsFailed) + ' 项测试');
console.log('  ✅ 通过: ' + testsPassed);
console.log('  ❌ 失败: ' + testsFailed);
var rate = testsPassed + testsFailed > 0 ? ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1) : '0.0';
console.log('  📊 通过率: ' + rate + '%');

if (testFailures.length > 0) {
  console.log('\\n  失败详情:');
  for (var i = 0; i < testFailures.length; i++) {
    var f = testFailures[i];
    console.log('  ' + (i + 1) + '. ' + f.test + ': ' + f.error);
  }
}

console.log('\\n════════════════════════════════════════════════════════════\\n');

process.exit(testsFailed > 0 ? 1 : 0);
`;

eval(gameCode + testCode);
