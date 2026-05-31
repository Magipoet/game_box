require('./setup');

section('测试 3: Game2048 基础功能');

subsection('3.1 游戏初始化');
{
  const game = new Game2048();
  game.initGame();
  const nonEmpty = countNonEmpty(game.board);
  assert(nonEmpty === 2, '初始化后应有 2 个初始方块');
  assert(game.score === 0, '初始分数应为 0');
  assert(game.gameOver === false, 'gameOver 应为 false');
  assert(game.gameWon === false, 'gameWon 应为 false');
}

subsection('3.2 移动有效性判定');
{
  const game = new Game2048();
  game.initGame();

  let anyValid = false;
  for (const dir of ['left', 'right', 'up', 'down']) {
    const result = game.move(dir);
    if (result.isValid) { anyValid = true; break; }
  }
  assert(anyValid === true, '至少一个方向的移动应有效（初始棋盘很空）');
}

subsection('3.3 移动后应增加新方块');
{
  const game = new Game2048();
  game.initGame();
  const before = countNonEmpty(game.board);

  for (const dir of ['left', 'right', 'up', 'down']) {
    const result = game.move(dir);
    if (result.isValid) {
      const after = countNonEmpty(game.board);
      assert(after >= before, '有效移动后非空格子数不应减少');
      break;
    }
  }
}

subsection('3.4 无效移动');
{
  const game = new Game2048();
  game.initGame();
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
  for (const dir of ['left', 'right', 'up', 'down']) {
    const result = game.move(dir);
    assert(result.isValid === false, `填充不可合并棋盘后 ${dir} 移动应为无效`);
  }
}

subsection('3.5 合并逻辑 - 向左合并');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(0, 1, 2);
  game.board.setValue(0, 2, 4);
  game.board.setValue(0, 3, 4);
  const result = game.move('left');
  assert(result.isValid === true, '向左合并应有效');
  assert(game.board.getValue(0, 0) === 4, '2+2 合并后应为 4');
  assert(game.board.getValue(0, 1) === 8, '4+4 合并后应为 8');
  assert(game.board.getValue(0, 2) === 0, '合并后原位置为空');
  assert(game.score > 0, '合并后分数应 > 0');
}

subsection('3.6 分数计算正确性');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(0, 1, 2);
  game.board.setValue(3, 0, 4);
  game.board.setValue(3, 1, 4);
  game.move('left');
  assert(game.score === 12, `合并分数应为 4+8=12，实际 ${game.score}`);
}

subsection('3.7 连续合并规则（三个相同数字）');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(0, 1, 2);
  game.board.setValue(0, 2, 2);
  const result = game.move('left');
  assert(result.isValid === true, '三个2向左应有效');
  assert(game.board.getValue(0, 0) === 4, '第一个合并后应为 4');
  assert(game.board.getValue(0, 1) === 2, '第二个2应保留');
  assert(game.board.getValue(0, 2) === 0, '第三个位置应为空');
}

section('测试 4: 四方向移动');

subsection('4.1 向右移动');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(0, 1, 2);
  game.move('right');
  assert(game.board.getValue(0, 3) === 4, '向右合并后 4 应在最右侧');
}

subsection('4.2 向上移动');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(1, 0, 2);
  game.move('up');
  assert(game.board.getValue(0, 0) === 4, '向上合并后 4 应在最上方');
}

subsection('4.3 向下移动');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(1, 0, 2);
  game.move('down');
  assert(game.board.getValue(3, 0) === 4, '向下合并后 4 应在最下方');
}

subsection('4.4 WASD 键盘映射（通过 move 方法验证）');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 8);
  game.board.setValue(1, 0, 8);
  game.board.setValue(2, 0, 8);
  game.board.setValue(3, 0, 8);
  game.move('up');
  assert(game.board.getValue(0, 0) === 16, '向上: 8+8=16');
  assert(game.board.getValue(1, 0) === 16, '向上: 另一组 8+8=16');
}

section('测试 5: 游戏结束检测');

subsection('5.1 棋盘未满时不应结束');
{
  const game = new Game2048();
  game.initGame();
  assert(game.isGameOver() === false, '初始状态（有空位+可合并）不应结束');
}

subsection('5.2 填满且有可合并时不结束');
{
  const game = new Game2048();
  const values = [
    [2, 2, 4, 8],
    [8, 4, 2, 16],
    [16, 32, 64, 128],
    [128, 256, 512, 1024]
  ];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      game.board.setValue(i, j, values[i][j]);
    }
  }
  assert(game.isGameOver() === false, '满棋盘但有可合并相邻格不应结束');
}

subsection('5.3 填满且无可合并时应结束');
{
  const game = new Game2048();
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
  assert(game.isGameOver() === true, '满棋盘且无可合并相邻格应结束');
}

subsection('5.4 竖直方向合并判定');
{
  const game = new Game2048();
  game.board.setValue(0, 0, 2);
  game.board.setValue(1, 0, 2);
  const vals = [4,8,16,32,64,128,256,512,1024,4,8,16,32,64];
  let idx = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i === 0 && j === 0) continue;
      if (i === 1 && j === 0) continue;
      game.board.setValue(i, j, vals[idx++]);
    }
  }
  assert(game.isGameOver() === false, '竖直方向可合并时不应结束');
}

section('测试 6: 游戏胜利');

subsection('6.1 合成 2048 时触发性');
{
  const game = new Game2048();
  let won = false;
  game.onGameWon = () => { won = true; };
  game.board.setValue(0, 0, 1024);
  game.board.setValue(0, 1, 1024);
  game.move('left');
  assert(game.gameWon === true, '合成 2048 后 gameWon 应为 true');
  assert(won === true, '合成 2048 应触发 onGameWon 回调');
}

subsection('6.2 continueAfterWin');
{
  const game = new Game2048();
  game.gameWon = true;
  game._continueAfterWin = false;
  game.continueAfterWin();
  assert(game._continueAfterWin === true, 'continueAfterWin() 后 _continueAfterWin 应为 true');
}

section('测试 7: 撤销功能');

subsection('7.1 基础撤销');
{
  const game = new Game2048();
  game.initGame();
  assert(game.canUndo === false, '初始状态不应可撤销');

  const beforeScore = game.score;
  const beforeBoard = game.board.clone();

  let moved = false;
  for (const dir of ['left', 'right', 'up', 'down']) {
    const result = game.move(dir);
    if (result.isValid) { moved = true; break; }
  }
  assert(moved === true, '应能执行一次有效移动');
  assert(game.canUndo === true, '移动后应可撤销');

  game.undo();
  assert(game.canUndo === false, '撤销后不应再可撤销');
  assert(game.score === beforeScore, '撤销后分数应恢复');
  assert(game.board.equals(beforeBoard) === true, '撤销后棋盘应恢复');
  assert(game.gameOver === false, '撤销后 gameOver 应为 false');
}

subsection('7.2 多次撤销');
{
  const game = new Game2048();
  game.initGame();
  const moves = [];
  for (let step = 0; step < 3; step++) {
    for (const dir of ['left', 'right', 'up', 'down']) {
      const result = game.move(dir);
      if (result.isValid) { moves.push(dir); break; }
    }
  }
  assert(game.history.length >= 2, '至少应有 2 次历史记录');
  game.undo();
  game.undo();
  game.undo();
  assert(game.canUndo === false, '撤销所有操作后不应可撤销');
}

section('测试 8: 暂停/继续');

subsection('8.1 togglePause');
{
  const game = new Game2048();
  game.initGame();
  assert(game.isPaused === false, '初始状态不应暂停');
  game.togglePause();
  assert(game.isPaused === true, 'togglePause 后应为暂停状态');
  game.togglePause();
  assert(game.isPaused === false, '再次 togglePause 后应恢复');
}

subsection('8.2 暂停时游戏结束不应切换');
{
  const game = new Game2048();
  game.gameOver = true;
  game.isPaused = false;
  game.togglePause();
  assert(game.isPaused === false, 'gameOver 时 togglePause 不应生效');
}
