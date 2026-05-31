require('./setup');

section('测试 2: GameBoard 类');

subsection('2.1 初始化');
{
  const board = new GameBoard();
  let allEmpty = true;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!board.getCell(i, j).isEmpty()) { allEmpty = false; }
    }
  }
  assert(allEmpty === true, '新 GameBoard 所有格子应为空');
  assert(board.getEmptyCells().length === 16, 'getEmptyCells() 应返回 16 个空位');
}

subsection('2.2 设置/读取 Cell');
{
  const board = new GameBoard();
  board.setValue(0, 0, 2);
  board.setValue(3, 3, 4);
  assert(board.getValue(0, 0) === 2, '设置 (0,0)=2 后读取应为 2');
  assert(board.getValue(3, 3) === 4, '设置 (3,3)=4 后读取应为 4');
  assert(board.getValue(1, 1) === 0, '未设置的位置 value 应为 0');
  assert(board.getEmptyCells().length === 14, '设置2个格子后空位应为 14');
}

subsection('2.3 木块检测');
{
  const board = new GameBoard();
  assert(board.hasWoodBlock() === false, '空棋盘不应包含木块');
  board.setCell(1, 1, Cell.woodBlock(3));
  assert(board.hasWoodBlock() === true, '添加木块后 hasWoodBlock() 应返回 true');
  const pos = board.findWoodBlock();
  assert(pos !== null, 'findWoodBlock() 应找到木块');
  assert(pos[0] === 1 && pos[1] === 1, '木块位置应为 (1,1)');
}

subsection('2.4 相邻格子获取');
{
  const board = new GameBoard();
  const corners = board.getAdjacentCells(0, 0);
  assert(corners.length === 2, '(0,0) 角落应有 2 个相邻格');
  const center = board.getAdjacentCells(1, 1);
  assert(center.length === 4, '(1,1) 中心应有 4 个相邻格');
  const edge = board.getAdjacentCells(0, 1);
  assert(edge.length === 3, '(0,1) 边缘应有 3 个相邻格');
}

subsection('2.5 clone() 与 equals()');
{
  const board1 = new GameBoard();
  board1.setValue(0, 0, 2);
  board1.setValue(1, 1, 4);
  const board2 = board1.clone();
  assert(board1.equals(board2) === true, 'clone 后 equals 应返回 true');
  board2.setValue(2, 2, 8);
  assert(board1.equals(board2) === false, '修改 clone 后 equals 应返回 false');
}
