require('./setup');

section('测试 16: 边界情况与健壮性');

subsection('16.1 游戏结束后移动');
{
  const game = new Game2048();
  game.gameOver = true;
  const result = game.move('left');
  assert(result.isValid === false, '游戏结束后移动应无效');
  assert(result.scoreAdded === 0, '游戏结束后移动不应加分');
}

subsection('16.2 无历史时撤销');
{
  const game = new Game2048();
  game.initGame();
  game.undo();
  assert(game.canUndo === false, '无历史时撤销不应报错');
}

subsection('16.3 棋盘外边界访问');
{
  const board = new GameBoard();
  const adj = board.getAdjacentCells(0, 0);
  for (const [r, c] of adj) {
    assert(r >= 0 && r < 4 && c >= 0 && c < 4, `相邻坐标 (${r},${c}) 应在边界内`);
  }
}

subsection('16.4 分数为负数的情况');
{
  const game = new Game2048();
  game.score = -100;
  assert(game.maxTile >= 0, 'maxTile 不应为负');
}

subsection('16.5 多个方向快速连续移动');
{
  const game = new Game2048();
  game.initGame();
  const startScore = game.score;
  for (let i = 0; i < 100; i++) {
    const dirs = ['left', 'right', 'up', 'down'];
    const dir = dirs[i % 4];
    const result = game.move(dir);
    if (game.gameOver) break;
  }
  assert(true, '100次快速移动不应崩溃');
}

subsection('16.6 getMergeablePositions 返回值');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(0, 1, 2);
  const mergeable = game.getMergeablePositions();
  assert(mergeable instanceof Set, 'getMergeablePositions 应返回 Set');
  assert(mergeable.has('0,0') === true, '可合并的位置应包含 (0,0)');
  assert(mergeable.has('0,1') === true, '可合并的位置应包含 (0,1)');
}

section('测试 17: 回调机制');

subsection('17.1 onStateChange 回调');
{
  const game = new Game2048();
  let called = false;
  game.onStateChange = () => { called = true; };
  game.notifyStateChange();
  assert(called === true, 'notifyStateChange 应触发 onStateChange');
}

subsection('17.2 onGameOver 回调');
{
  const game = new Game2048();
  let called = false;
  game.onGameOver = () => { called = true; };

  const values = [
    [2, 4, 8, 16],
    [16, 8, 4, 2],
    [2, 4, 8, 16],
    [16, 8, 4, 2]
  ];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      game.board.setValue(i, j, values[i][j]);
    }
  }
  game.move('left');
  assert(called === true, '游戏结束时 onGameOver 应触发');
}

subsection('17.3 onAchievementCheck 回调');
{
  const game = new Game2048();
  let called = false;
  game.onAchievementCheck = () => { called = true; };
  game.initGame();
  for (const dir of ['left', 'right', 'up', 'down']) {
    const result = game.move(dir);
    if (result.isValid) break;
  }
  assert(called === true, '有效移动后应触发 onAchievementCheck');
}

section('测试 18: 4096 合并限制');

subsection('18.1 4096 不应与 4096 合并');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 4096);
  game.board.setValue(0, 1, 4096);
  const result = game.move('left');
  assert(game.board.getValue(0, 0) === 4096, '第一个 4096 应保持不变');
  assert(game.board.getValue(0, 1) === 4096, '第二个 4096 应保持不变（不能合并）');
  assert(game.score === 0, '4096 不合并不应加分');
}
