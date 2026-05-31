const setup = require('./setup');

require('./test-cell');
require('./test-board');
require('./test-game-core');
require('./test-game-modes');
require('./test-fun-mode');
require('./test-achievements');
require('./test-services');
require('./test-edge-cases');

section('测试结果汇总');

const rate = setup.testsTotal > 0 ? ((setup.testsPassed / setup.testsTotal) * 100).toFixed(1) : '0.0';

console.log(`\n  总计: ${setup.testsTotal} 项测试`);
console.log(`  ✅ 通过: ${setup.testsPassed}`);
console.log(`  ❌ 失败: ${setup.testsFailed}`);
console.log(`  📊 通过率: ${rate}%`);

if (setup.failures.length > 0) {
  console.log(`\n  失败详情:`);
  setup.failures.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.message}`);
  });
}

console.log('\n');

process.exit(setup.testsFailed > 0 ? 1 : 0);
