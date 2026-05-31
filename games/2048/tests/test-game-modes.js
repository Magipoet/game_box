require('./setup');

section('测试 9: 时间模式');

subsection('9.1 模式切换');
{
  const game = new Game2048();
  game.currentMode = GAME_MODE.UNLIMITED;
  game.setMode(GAME_MODE.TIMED);
  assert(game.currentMode === GAME_MODE.TIMED, 'setMode 应切换到限时模式');
}

subsection('9.2 限时模式剩余时间计算');
{
  const game = new Game2048();
  game.currentMode = GAME_MODE.TIMED;
  game.elapsedSeconds = 60;
  assert(game.remainingTime === 540, '10分钟模式经过60秒后剩余 540 秒');
}

subsection('9.3 不限时模式时间格式');
{
  const game = new Game2048();
  game.currentMode = GAME_MODE.UNLIMITED;
  game.elapsedSeconds = 125;
  assert(game.getFormattedTime() === '02:05', '125秒应格式化为 02:05');
}

subsection('9.4 限时模式时间格式（倒计时）');
{
  const game = new Game2048();
  game.currentMode = GAME_MODE.TIMED;
  game.elapsedSeconds = 30;
  assert(game.getFormattedTime() === '09:30', '限时模式30秒后应显示 09:30');
}

section('测试 10: 最大方块追踪');

subsection('10.1 maxTile 计算');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(1, 1, 128);
  game.board.setValue(2, 2, 64);
  assert(game.maxTile === 128, '最大方块应为 128');
}

subsection('10.2 4096 计数');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 4096);
  game.board.setValue(0, 1, 4096);
  game.board.setValue(0, 2, 2048);
  assert(game.countTile4096(game.board) === 2, '应有两个 4096');
}
