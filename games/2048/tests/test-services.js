require('./setup');

section('测试 14: StorageService');

subsection('14.1 最高分存储');
{
  const storage = new StorageService();
  const initial = storage.getHighestScore(GAME_MODE.TIMED, GAME_VARIANT.NORMAL);
  assert(initial === 0, '初始最高分应为 0');

  const updated = storage.setHighestScore(GAME_MODE.TIMED, GAME_VARIANT.NORMAL, 5000);
  assert(updated === true, '首次设置最高分应返回 true');
  assert(storage.getHighestScore(GAME_MODE.TIMED, GAME_VARIANT.NORMAL) === 5000, '最高分应为 5000');

  const notUpdated = storage.setHighestScore(GAME_MODE.TIMED, GAME_VARIANT.NORMAL, 3000);
  assert(notUpdated === false, '设置更低分应返回 false');
  assert(storage.getHighestScore(GAME_MODE.TIMED, GAME_VARIANT.NORMAL) === 5000,
    '最高分应保持 5000');
}

subsection('14.2 成就存储');
{
  const storage = new StorageService();
  assert(storage.isAchievementUnlocked('tile_4') === false, '初始成就不应解锁');
  const result = storage.unlockAchievement('tile_4');
  assert(result === true, '首次解锁应返回 true');
  assert(storage.isAchievementUnlocked('tile_4') === true, '解锁后应可查询');
  const result2 = storage.unlockAchievement('tile_4');
  assert(result2 === false, '重复解锁应返回 false');
}

subsection('14.3 统计计数');
{
  const storage = new StorageService();
  const before = storage.totalUndoCount;
  storage.incrementUndoCount();
  assert(storage.totalUndoCount === before + 1, '撤销计数应 +1');
}

section('测试 15: 序列化/反序列化');

subsection('15.1 serializeState 与 restoreState');
{
  const game = new Game2048();
  game.initGame();
  game.score = 100;
  game.elapsedSeconds = 30;
  const data = game.serializeState();
  assert(data.score === 100, '序列化 score 应为 100');
  assert(data.elapsedSeconds === 30, '序列化 elapsedSeconds 应为 30');
  assert(data.board.length === 4, '序列化 board 应有 4 行');
  assert(data.gameOver === false, '序列化 gameOver 应为 false');
}

subsection('15.2 restoreState 恢复完整状态');
{
  const game = new Game2048();
  game.initGame();
  game.score = 500;
  const data = game.serializeState();

  const game2 = new Game2048();
  game2.restoreState(data);
  assert(game2.score === 500, '恢复后 score 应为 500');
  assert(game2.board.equals(game.board) === true, '恢复后棋盘应相同');
}
