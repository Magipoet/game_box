const BOARD_SIZE = 4;
const TIMED_MODE_DURATION = 30;
const UNDO_LIMIT = 5;
const WOOD_BLOCK_REQUIRED_MERGES = 3;
const ICE_BLOCK_MAX_MOVES = 8;
const COOLDOWN_MOVES = 5;

const CELL_TYPE = {
  EMPTY: 'empty',
  NUMBER: 'number',
  WOOD_BLOCK: 'woodBlock',
  FROZEN_NUMBER: 'frozenNumber',
  TELEPORT: 'teleport',
  CHAIN: 'chain',
  TELEPORT_PORTAL: 'teleportPortal'
};

const GAME_MODE = {
  TIMED: 'timed',
  UNLIMITED: 'unlimited'
};

const GAME_VARIANT = {
  NORMAL: 'normal',
  FUN: 'fun'
};

const ACHIEVEMENT_CATEGORIES = {
  all: { id: 'all', name: '全部成就' },
  tile: { id: 'tile', name: '数字合成' },
  score: { id: 'score', name: '得分成就' },
  fun: { id: 'fun', name: '趣味模式' },
  special: { id: 'special', name: '特殊成就' }
};

const ACHIEVEMENTS = [
  { id: 'tile_4', name: '初出茅庐', desc: '首次合成 4', icon: '4️⃣', category: 'tile', check: (s) => s.maxTile >= 4 },
  { id: 'tile_8', name: '小试牛刀', desc: '首次合成 8', icon: '8️⃣', category: 'tile', check: (s) => s.maxTile >= 8 },
  { id: 'tile_16', name: '渐入佳境', desc: '首次合成 16', icon: '🔢', category: 'tile', check: (s) => s.maxTile >= 16 },
  { id: 'tile_32', name: '崭露头角', desc: '首次合成 32', icon: '3️⃣', category: 'tile', check: (s) => s.maxTile >= 32 },
  { id: 'tile_64', name: '牛刀小试', desc: '首次合成 64', icon: '6️⃣', category: 'tile', check: (s) => s.maxTile >= 64 },
  { id: 'tile_128', name: '步步为营', desc: '首次合成 128', icon: '1️⃣', category: 'tile', check: (s) => s.maxTile >= 128 },
  { id: 'tile_256', name: '乘风破浪', desc: '首次合成 256', icon: '2️⃣', category: 'tile', check: (s) => s.maxTile >= 256 },
  { id: 'tile_512', name: '势如破竹', desc: '首次合成 512', icon: '5️⃣', category: 'tile', check: (s) => s.maxTile >= 512 },
  { id: 'tile_1024', name: '百尺竿头', desc: '首次合成 1024', icon: '🔟', category: 'tile', check: (s) => s.maxTile >= 1024 },
  { id: 'tile_2048', name: '奇迹诞生', desc: '合成 2048，通关游戏！', icon: '🏆', category: 'tile', check: (s) => s.maxTile >= 2048 },
  { id: 'tile_2048_5', name: '熟能生巧', desc: '累计合成 5 次 2048', icon: '🎯', category: 'tile', check: (s) => s.tile2048Count >= 5 },
  { id: 'tile_2048_10', name: '游刃有余', desc: '累计合成 10 次 2048', icon: '🎮', category: 'tile', check: (s) => s.tile2048Count >= 10 },
  { id: 'tile_2048_20', name: '炉火纯青', desc: '累计合成 20 次 2048', icon: '🔥', category: 'tile', check: (s) => s.tile2048Count >= 20 },
  { id: 'tile_2048_50', name: '出类拔萃', desc: '累计合成 50 次 2048', icon: '💫', category: 'tile', check: (s) => s.tile2048Count >= 50 },
  { id: 'tile_2048_100', name: '百战百胜', desc: '累计合成 100 次 2048', icon: '🏅', category: 'tile', check: (s) => s.tile2048Count >= 100 },
  { id: 'tile_4096', name: '超越极限', desc: '在奇迹之上，再创奇迹…', icon: '🌟', category: 'tile', check: (s) => s.maxTile >= 4096, condition: '合成 4096' },
  { id: 'tile_8192', name: '登峰造极', desc: '极致之上，仍有远方…', icon: '👑', category: 'tile', check: (s) => s.tile4096Count >= 2, condition: '累计合成两个 4096' },
  { id: 'score_1000', name: '初露锋芒', desc: '单局得分超过 1000', icon: '💯', category: 'score', check: (s) => s.score >= 1000 },
  { id: 'score_5000', name: '小有成就', desc: '单局得分超过 5000', icon: '⭐', category: 'score', check: (s) => s.score >= 5000 },
  { id: 'score_10000', name: '积分达人', desc: '单局得分超过 10000', icon: '✨', category: 'score', check: (s) => s.score >= 10000 },
  { id: 'score_20000', name: '积分大师', desc: '单局得分超过 20000', icon: '💎', category: 'score', check: (s) => s.score >= 20000 },
  { id: 'score_50000', name: '积分传奇', desc: '单局得分超过 50000', icon: '🌟', category: 'score', check: (s) => s.score >= 50000 },
  { id: 'score_100000', name: '积分神话', desc: '单局得分超过 100000', icon: '👑', category: 'score', check: (s) => s.score >= 100000 },
  { id: 'fast_win', name: '神速通关', desc: '5 分钟内合成 2048', icon: '⚡', category: 'special', check: (s) => s.maxTile >= 2048 && s.elapsedSeconds <= 300 },
  { id: 'wood_breaker', name: '破木工匠', desc: '消除一个木块', icon: '🪵', category: 'fun', check: (s) => s.woodBlocksCleared >= 1 },
  { id: 'wood_master', name: '伐木大师', desc: '累计消除 5 个木块', icon: '🪓', category: 'fun', check: (s) => s.woodBlocksCleared >= 5 },
  { id: 'wood_10', name: '木材收集者', desc: '累计消除 10 个木块', icon: '🌲', category: 'fun', check: (s) => s.woodBlocksCleared >= 10 },
  { id: 'wood_20', name: '森林守护者', desc: '累计消除 20 个木块', icon: '🌳', category: 'fun', check: (s) => s.woodBlocksCleared >= 20 },
  { id: 'wood_50', name: '木材大亨', desc: '累计消除 50 个木块', icon: '🪚', category: 'fun', check: (s) => s.woodBlocksCleared >= 50 },
  { id: 'wood_100', name: '伐木传奇', desc: '累计消除 100 个木块', icon: '🏆', category: 'fun', check: (s) => s.woodBlocksCleared >= 100 },
  { id: 'ice_breaker', name: '破冰者', desc: '消除一个冰块', icon: '❄️', category: 'fun', check: (s) => s.iceBlocksCleared >= 1 },
  { id: 'ice_master', name: '冰霜行者', desc: '累计消除 5 个冰块', icon: '🧊', category: 'fun', check: (s) => s.iceBlocksCleared >= 5 },
  { id: 'ice_10', name: '寒冰射手', desc: '累计消除 10 个冰块', icon: '🏹', category: 'fun', check: (s) => s.iceBlocksCleared >= 10 },
  { id: 'ice_20', name: '冰霜法师', desc: '累计消除 20 个冰块', icon: '🔮', category: 'fun', check: (s) => s.iceBlocksCleared >= 20 },
  { id: 'ice_50', name: '冰川之王', desc: '累计消除 50 个冰块', icon: '❄️', category: 'fun', check: (s) => s.iceBlocksCleared >= 50 },
  { id: 'ice_100', name: '破冰传奇', desc: '累计消除 100 个冰块', icon: '🏆', category: 'fun', check: (s) => s.iceBlocksCleared >= 100 },
  { id: 'fast_wood_1', name: '一击破木', desc: '1 次滑动内消除一个木块', icon: '⚡', category: 'fun', check: (s) => s.fastWoodCleared >= 1 && s.fastWoodCleared <= 1 },
  { id: 'fast_wood_2', name: '二击破木', desc: '2 次滑动内消除一个木块', icon: '⚡', category: 'fun', check: (s) => s.fastWoodCleared >= 1 && s.fastWoodCleared <= 2 },
  { id: 'fast_wood_3', name: '三击破木', desc: '3 次滑动内消除一个木块', icon: '⚡', category: 'fun', check: (s) => s.fastWoodCleared >= 1 && s.fastWoodCleared <= 3 },
  { id: 'fast_ice_4', name: '四步破冰', desc: '4 次滑动内消除一个冰块', icon: '⚡', category: 'fun', check: (s) => s.fastIceCleared >= 1 && s.fastIceCleared <= 4 },
  { id: 'fast_ice_5', name: '五步破冰', desc: '5 次滑动内消除一个冰块', icon: '⚡', category: 'fun', check: (s) => s.fastIceCleared >= 1 && s.fastIceCleared <= 5 },
  { id: 'fast_ice_6', name: '六步破冰', desc: '6 次滑动内消除一个冰块', icon: '⚡', category: 'fun', check: (s) => s.fastIceCleared >= 1 && s.fastIceCleared <= 6 },
  { id: 'undo_user', name: '时间回溯', desc: '首次使用撤回功能', icon: '↶', category: 'special', check: (s) => s.undoCount >= 1 },
  { id: 'undo_master', name: '时光掌控者', desc: '累计使用撤回 10 次', icon: '⏪', category: 'special', check: (s) => s.undoCount >= 10 },
  { id: 'marathon', name: '马拉松', desc: '单局游戏超过 30 分钟', icon: '🏃', category: 'special', check: (s) => s.elapsedSeconds >= 1800 },
  { id: 'timed_win_10', name: '限时挑战者', desc: '限时 10 分钟模式下合成 2048', icon: '⏱️', category: 'special', check: (s) => s.maxTile >= 2048 && s.currentMode === 'timed' && s.elapsedSeconds <= 600 },
  { id: 'win_20min', name: '稳健通关', desc: '20 分钟内合成 2048', icon: '🎯', category: 'special', check: (s) => s.maxTile >= 2048 && s.elapsedSeconds <= 1200 },
];
