const fs = require('fs');
const path = require('path');

const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    appendChild: () => {},
    setAttribute: () => {},
    addEventListener: () => {},
    style: {}
  })
};

let testsPassed = 0;
let testsFailed = 0;
let testsTotal = 0;
const failures = [];

global.assert = function(condition, message) {
  testsTotal++;
  if (condition) {
    testsPassed++;
  } else {
    testsFailed++;
    failures.push({ message, stack: new Error().stack });
  }
};

global.section = function(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}`);
};

global.subsection = function(title) {
  console.log(`\n${'-'.repeat(40)}`);
  console.log(`  ${title}`);
  console.log(`${'-'.repeat(40)}`);
};

const jsDir = path.join(__dirname, '..', 'js');
const jsFiles = [
  'constants.js',
  'cell.js',
  'board.js',
  'snapshot.js',
  'game-core.js',
  'game-movement.js',
  'game-fun-mode.js',
  'storage.js'
];

console.log('🔧 加载 js/ 目录文件 ...');
let combinedCode = '';
for (const file of jsFiles) {
  const filePath = path.join(jsDir, file);
  const code = fs.readFileSync(filePath, 'utf-8');
  combinedCode += `\n// --- ${file} ---\n` + code;
}

const _exports = eval(`(function(){\n${combinedCode}\nreturn { Cell, GameBoard, GameSnapshot, Game2048, StorageService, CELL_TYPE, GAME_MODE, GAME_VARIANT, ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES };\n})()`);

global.Cell = _exports.Cell;
global.GameBoard = _exports.GameBoard;
global.GameSnapshot = _exports.GameSnapshot;
global.Game2048 = _exports.Game2048;
global.StorageService = _exports.StorageService;
global.CELL_TYPE = _exports.CELL_TYPE;
global.GAME_MODE = _exports.GAME_MODE;
global.GAME_VARIANT = _exports.GAME_VARIANT;
global.ACHIEVEMENTS = _exports.ACHIEVEMENTS;
global.ACHIEVEMENT_CATEGORIES = _exports.ACHIEVEMENT_CATEGORIES;

global.countNonEmpty = function(board) {
  let count = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!board.getCell(i, j).isEmpty()) count++;
    }
  }
  return count;
};

global.getBoardSnapshot = function(game) {
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      const cell = game.board.getCell(i, j);
      if (cell.isEmpty()) row.push(0);
      else if (cell.isWoodBlock()) row.push('W');
      else if (cell.isFrozenNumber()) row.push(`F${cell.value}`);
      else row.push(cell.value);
    }
    rows.push(row);
  }
  return rows;
};

module.exports = {
  get testsPassed() { return testsPassed; },
  get testsFailed() { return testsFailed; },
  get testsTotal() { return testsTotal; },
  get failures() { return failures; }
};
