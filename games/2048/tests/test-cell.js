require('./setup');

section('测试 1: Cell 类');

subsection('1.1 基础构造与类型检测');
{
  const empty = Cell.empty();
  assert(empty.type === CELL_TYPE.EMPTY, 'empty() 创建的 Cell type 应为 EMPTY');
  assert(empty.isEmpty() === true, 'isEmpty() 应返回 true');
  assert(empty.isNumber() === false, 'isNumber() 应返回 false');
  assert(empty.isWoodBlock() === false, 'isWoodBlock() 应返回 false');
  assert(empty.isFrozenNumber() === false, 'isFrozenNumber() 应返回 false');
  assert(empty.value === 0, 'empty cell value 应为 0');
}

{
  const num = Cell.number(8);
  assert(num.type === CELL_TYPE.NUMBER, 'number(8) 的 type 应为 NUMBER');
  assert(num.isEmpty() === false, 'isEmpty() 应返回 false');
  assert(num.isNumber() === true, 'isNumber() 应返回 true');
  assert(num.hasValue() === true, 'hasValue() 应返回 true');
  assert(num.value === 8, 'value 应为 8');
}

{
  const wood = Cell.woodBlock(3);
  assert(wood.type === CELL_TYPE.WOOD_BLOCK, 'woodBlock(3) 的 type 应为 WOOD_BLOCK');
  assert(wood.isWoodBlock() === true, 'isWoodBlock() 应返回 true');
  assert(wood.hasValue() === false, 'hasValue() 应返回 false (木块无数字值)');
  assert(wood.remainingMerges === 3, 'remainingMerges 应为 3');
}

{
  const frozen = Cell.frozenNumber(16, 5);
  assert(frozen.type === CELL_TYPE.FROZEN_NUMBER, 'frozenNumber(16,5) 的 type 应为 FROZEN_NUMBER');
  assert(frozen.isFrozenNumber() === true, 'isFrozenNumber() 应返回 true');
  assert(frozen.hasValue() === true, 'hasValue() 应返回 true');
  assert(frozen.value === 16, 'value 应为 16');
  assert(frozen.remainingMoves === 5, 'remainingMoves 应为 5');
}

subsection('1.2 Cell.clone()');
{
  const original = Cell.number(128);
  const cloned = original.clone();
  assert(cloned.type === original.type, 'clone 后 type 应相同');
  assert(cloned.value === original.value, 'clone 后 value 应相同');
  assert(cloned !== original, 'clone 应返回新对象');
}
