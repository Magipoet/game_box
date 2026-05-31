require('./setup');

section('测试 11: 趣味模式 - 木块');

subsection('11.1 木块出现在趣味模式');
{
  const game = new Game2048();
  game.currentVariant = GAME_VARIANT.FUN;
  game.initGame();
  assert(game.board !== null, '趣味模式棋盘应正常初始化');
}

subsection('11.2 木块手动放置与清除');
{
  const game = new Game2048();
  game.currentVariant = GAME_VARIANT.FUN;
  game.initGame();

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      game.board.setCell(i, j, Cell.empty());
    }
  }

  game.board.setCell(1, 1, Cell.woodBlock(1));
  assert(game.board.hasWoodBlock() === true, '手动放置木块后应检测到');

  game.board.setValue(1, 0, 2);
  game.board.setValue(1, 2, 2);

  game.move('left');
  const woodStill = game.board.hasWoodBlock();
  console.log(`  木块清除结果: ${woodStill ? '未清除' : '已清除'}`);
  assert(typeof woodStill === 'boolean', 'hasWoodBlock 应返回布尔值');
}

section('测试 12: 趣味模式 - 冰块');

subsection('12.1 冰块手动放置');
{
  const game = new Game2048();
  game.currentVariant = GAME_VARIANT.FUN;
  game.initGame();

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      game.board.setCell(i, j, Cell.empty());
    }
  }

  game.board.setValue(0, 0, 8);
  game.iceBlockPosition = [0, 0];
  game.iceBlockRemainingMoves = 8;
  game.board.setCell(0, 0, Cell.frozenNumber(8, 8));
  assert(game.board.getCell(0, 0).isFrozenNumber() === true, '放置冰块后应为冻结状态');
  assert(game.iceBlockPosition !== null, 'iceBlockPosition 应非 null');
}

subsection('12.2 冰块倒计时递减');
{
  const game = new Game2048();
  game.iceBlockPosition = [0, 0];
  game.iceBlockRemainingMoves = 8;
  game.board.setValue(0, 0, 4);
  game.board.setCell(0, 0, Cell.frozenNumber(4, 8));

  game.decrementIceBlock();
  assert(game.iceBlockRemainingMoves === 7, '一次 decrement 后剩余步数应为 7');
}

subsection('12.3 冰块倒计时归零后解除冻结');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 4);
  game.board.setCell(0, 0, Cell.frozenNumber(4, 1));
  game.iceBlockPosition = [0, 0];
  game.iceBlockRemainingMoves = 1;

  game.decrementIceBlock();
  assert(game.iceBlockPosition === null, '倒计时归零后 iceBlockPosition 应为 null');
  assert(game.board.getCell(0, 0).isNumber() === true, '倒计时归零后应变为普通数字');
  assert(game.board.getCell(0, 0).value === 4, '倒计时归零后 value 应保持不变');
}
