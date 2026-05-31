require('./setup');

section('测试 13: 成就系统');

subsection('13.1 成就配置完整性');
{
  assert(ACHIEVEMENTS.length > 0, '应有成就定义');
  assert(ACHIEVEMENTS.every(a => a.id && a.name && a.desc && a.check),
    '每个成就应有 id、name、desc、check');
  assert(ACHIEVEMENT_CATEGORIES.all !== undefined, '应有全部成就分类');
}

subsection('13.2 tile 类成就检查');
{
  const tile4 = ACHIEVEMENTS.find(a => a.id === 'tile_4');
  assert(tile4 !== undefined, '应存在 tile_4 成就');
  assert(tile4.check({ maxTile: 4 }) === true, 'maxTile>=4 时应解锁 tile_4');
  assert(tile4.check({ maxTile: 2 }) === false, 'maxTile<4 时不应解锁 tile_4');
}

subsection('13.3 score 类成就检查');
{
  const score1000 = ACHIEVEMENTS.find(a => a.id === 'score_1000');
  assert(score1000 !== undefined, '应存在 score_1000 成就');
  assert(score1000.check({ score: 1500 }) === true, 'score>=1000 时应解锁');
  assert(score1000.check({ score: 500 }) === false, 'score<1000 时不应解锁');
}

subsection('13.4 成就条件边界值');
{
  const tile2048 = ACHIEVEMENTS.find(a => a.id === 'tile_2048');
  assert(tile2048.check({ maxTile: 2048 }) === true, 'maxTile=2048 时应解锁');
  assert(tile2048.check({ maxTile: 1024 }) === false, 'maxTile=1024 时不应解锁');
}
