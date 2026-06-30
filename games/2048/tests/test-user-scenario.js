require('./tests/setup');

section('用户场景复现：锁链数字垂直对齐 + 木块阻挡 + 水平滑动');

subsection('场景1: 垂直对齐锁链向右滑动，木块在列2（索引2），锁链应该移动到列1');

(function() {
  const game = new Game2048();
  game.currentVariant = GAME_VARIANT.FUN;
  game.initGame();
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      game.board.setCell(i, j, Cell.empty());
    }
  }

  game.board.setCell(2, 0, Cell.chain(4));
  game.board.setCell(3, 0, Cell.number(2));
  game.chainPair = {
    chainPos: [2, 0],
    targetPos: [3, 0],
    targetValue: 2,
    remainingMoves: 5
  };
  game.board.setCell(2, 2, Cell.woodBlock(1));
  game.board.setCell(3, 2, Cell.woodBlock(1));

  console.log('  初始状态:');
  console.log('  row2: _ 4⛓️ _ 🪵');
  console.log('  row3: _  2  _ 🪵');
  console.log('  chain=(2,0), target=(3,0)');
  console.log('  期望: 向右滑动 → chain移动到(2,1), target移动到(3,1)');

  game.move('right');

  const chainCell = game.board.getCell(2, 1);
  const targetCell = game.board.getCell(3, 1);
  const origChainCell = game.board.getCell(2, 0);
  const origTargetCell = game.board.getCell(3, 0);

  console.log('  实际结果:');
  console.log('  (2,0):', origChainCell.hasValue() ? (origChainCell.value + (origChainCell.isChain() ? '⛓️' : '')) : '空');
  console.log('  (2,1):', chainCell.hasValue() ? (chainCell.value + (chainCell.isChain() ? '⛓️' : '')) : '空');
  console.log('  (3,0):', origTargetCell.hasValue() ? (origTargetCell.value + (origTargetCell.isChain() ? '⛓️' : '')) : '空');
  console.log('  (3,1):', targetCell.hasValue() ? (targetCell.value + (targetCell.isChain() ? '⛓️' : '')) : '空');
  console.log('  chainPair:', game.chainPair ? `chain=(${game.chainPair.chainPos}), target=(${game.chainPair.targetPos})` : 'null');

  assert(chainCell.isChain() && chainCell.value === 4,
    'chain应该移动到(2,1)，实际: ' + (chainCell.hasValue() ? chainCell.value + (chainCell.isChain() ? '⛓️' : '') : '空'));
  assert(targetCell.value === 2 && !targetCell.isChain(),
    'target应该移动到(3,1)，实际: ' + (targetCell.hasValue() ? targetCell.value : '空'));
})();

subsection('场景2: 垂直对齐锁链向左滑动，木块在列1（索引1），锁链应该移动到列0紧贴木块');

(function() {
  const game = new Game2048();
  game.currentVariant = GAME_VARIANT.FUN;
  game.initGame();
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      game.board.setCell(i, j, Cell.empty());
    }
  }

  game.board.setCell(2, 3, Cell.chain(4));
  game.board.setCell(3, 3, Cell.number(2));
  game.chainPair = {
    chainPos: [2, 3],
    targetPos: [3, 3],
    targetValue: 2,
    remainingMoves: 5
  };
  game.board.setCell(2, 1, Cell.woodBlock(1));
  game.board.setCell(3, 1, Cell.woodBlock(1));

  console.log('  初始状态:');
  console.log('  row2: 🪵 _ _ 4⛓️');
  console.log('  row3: 🪵 _ _  2 ');
  console.log('  chain=(2,3), target=(3,3)');
  console.log('  期望: 向左滑动 → chain移动到(2,2), target移动到(3,2)（木块前）');

  game.move('left');

  const chainCell = game.board.getCell(2, 2);
  const targetCell = game.board.getCell(3, 2);

  console.log('  实际结果:');
  console.log('  (2,2):', chainCell.hasValue() ? (chainCell.value + (chainCell.isChain() ? '⛓️' : '')) : '空');
  console.log('  (3,2):', targetCell.hasValue() ? (targetCell.value + (targetCell.isChain() ? '⛓️' : '')) : '空');

  assert(chainCell.isChain() && chainCell.value === 4,
    'chain应该移动到(2,2)，实际: ' + (chainCell.hasValue() ? chainCell.value + (chainCell.isChain() ? '⛓️' : '') : '空'));
  assert(targetCell.value === 2 && !targetCell.isChain(),
    'target应该移动到(3,2)，实际: ' + (targetCell.hasValue() ? targetCell.value : '空'));
})();

subsection('场景3: 锁链紧贴木块时应该真的无法移动');

(function() {
  const game = new Game2048();
  game.currentVariant = GAME_VARIANT.FUN;
  game.initGame();
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      game.board.setCell(i, j, Cell.empty());
    }
  }

  game.board.setCell(2, 0, Cell.chain(4));
  game.board.setCell(3, 0, Cell.number(2));
  game.chainPair = {
    chainPos: [2, 0],
    targetPos: [3, 0],
    targetValue: 2,
    remainingMoves: 5
  };
  game.board.setCell(2, 1, Cell.woodBlock(1));
  game.board.setCell(3, 1, Cell.woodBlock(1));

  console.log('  初始状态:');
  console.log('  row2: 4⛓️ 🪵 _ _');
  console.log('  row3:  2  🪵 _ _');
  console.log('  chain=(2,0), target=(3,0)');
  console.log('  期望: 向右滑动 → 紧贴木块，无法移动');

  const result = game.move('right');

  const chainCell = game.board.getCell(2, 0);
  const targetCell = game.board.getCell(3, 0);

  console.log('  实际结果:');
  console.log('  isValid:', result.isValid);
  console.log('  (2,0):', chainCell.hasValue() ? (chainCell.value + (chainCell.isChain() ? '⛓️' : '')) : '空');
  console.log('  (3,0):', targetCell.hasValue() ? (targetCell.value + (targetCell.isChain() ? '⛓️' : '')) : '空');

  assert(!result.isValid, '紧贴木块时应该无法移动，isValid应该为false');
  assert(chainCell.isChain() && chainCell.value === 4,
    'chain应该保持在(2,0)');
  assert(targetCell.value === 2 && !targetCell.isChain(),
    'target应该保持在(3,0)');
})();

subsection('场景4: 水平对齐锁链向上滑动，木块在行1（索引1），应该移动到行0');

(function() {
  const game = new Game2048();
  game.currentVariant = GAME_VARIANT.FUN;
  game.initGame();
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      game.board.setCell(i, j, Cell.empty());
    }
  }

  game.board.setCell(3, 0, Cell.chain(4));
  game.board.setCell(3, 1, Cell.number(2));
  game.chainPair = {
    chainPos: [3, 0],
    targetPos: [3, 1],
    targetValue: 2,
    remainingMoves: 5
  };
  game.board.setCell(1, 0, Cell.woodBlock(1));
  game.board.setCell(1, 1, Cell.woodBlock(1));

  console.log('  初始状态:');
  console.log('  col0: _, 🪵, _, 4⛓️');
  console.log('  col1: _, 🪵, _,  2 ');
  console.log('  chain=(3,0), target=(3,1)');
  console.log('  期望: 向上滑动 → chain移动到(2,0), target移动到(2,1)（木块前）');

  game.move('up');

  const chainCell = game.board.getCell(2, 0);
  const targetCell = game.board.getCell(2, 1);

  console.log('  实际结果:');
  console.log('  (2,0):', chainCell.hasValue() ? (chainCell.value + (chainCell.isChain() ? '⛓️' : '')) : '空');
  console.log('  (2,1):', targetCell.hasValue() ? (targetCell.value + (targetCell.isChain() ? '⛓️' : '')) : '空');

  assert(chainCell.isChain() && chainCell.value === 4,
    'chain应该移动到(2,0)，实际: ' + (chainCell.hasValue() ? chainCell.value + (chainCell.isChain() ? '⛓️' : '') : '空'));
  assert(targetCell.value === 2 && !targetCell.isChain(),
    'target应该移动到(2,1)，实际: ' + (targetCell.hasValue() ? targetCell.value : '空'));
})();
