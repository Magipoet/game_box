(function() {
  'use strict';

  window.Gomoku = window.Gomoku || {};
  var G = window.Gomoku;
  var state = G.state;

  var ACHIEVEMENT_CATEGORIES = {
    battle: {
      id: 'battle',
      name: '对战类',
      icon: '⚔️'
    },
    difficulty: {
      id: 'difficulty',
      name: '难度类',
      icon: '🎯'
    },
    move: {
      id: 'move',
      name: '步数类',
      icon: '📊'
    },
    skill: {
      id: 'skill',
      name: '棋艺类',
      icon: '♟️'
    },
    strategy: {
      id: 'strategy',
      name: '策略类',
      icon: '🧠'
    },
    collect: {
      id: 'collect',
      name: '收集类',
      icon: '🎨'
    },
    special: {
      id: 'special',
      name: '特殊类',
      icon: '✨'
    }
  };

  var ACHIEVEMENTS = {
    first_win: {
      id: 'first_win',
      category: 'battle',
      name: '初出茅庐',
      description: '赢得第一局游戏',
      icon: '🏆',
      unlocked: false
    },
    five_wins: {
      id: 'five_wins',
      category: 'battle',
      name: '连战连胜',
      description: '累计赢得5局游戏',
      icon: '🔥',
      unlocked: false
    },
    ten_wins: {
      id: 'ten_wins',
      category: 'battle',
      name: '百战百胜',
      description: '累计赢得10局游戏',
      icon: '👑',
      unlocked: false
    },
    twenty_wins: {
      id: 'twenty_wins',
      category: 'battle',
      name: '常胜将军',
      description: '累计赢得20局游戏',
      icon: '⚔️',
      unlocked: false
    },
    fifty_wins: {
      id: 'fifty_wins',
      category: 'battle',
      name: '棋王',
      description: '累计赢得50局游戏',
      icon: '🎤',
      unlocked: false
    },
    hundred_wins: {
      id: 'hundred_wins',
      category: 'battle',
      name: '一代宗师',
      description: '累计赢得100局游戏',
      icon: '🧙',
      unlocked: false
    },
    three_streak: {
      id: 'three_streak',
      category: 'battle',
      name: '三连胜',
      description: '连续赢得3局游戏',
      icon: '🎖️',
      unlocked: false
    },
    five_streak: {
      id: 'five_streak',
      category: 'battle',
      name: '五连胜',
      description: '连续赢得5局游戏',
      icon: '🏅',
      unlocked: false
    },
    ten_streak: {
      id: 'ten_streak',
      category: 'battle',
      name: '十连胜',
      description: '连续赢得10局游戏',
      icon: '🥇',
      unlocked: false
    },
    win_streak_20: {
      id: 'win_streak_20',
      category: 'battle',
      name: '二十连胜',
      description: '连续赢得20局游戏',
      icon: '🏆',
      unlocked: false
    },
    win_streak_50: {
      id: 'win_streak_50',
      category: 'battle',
      name: '五十连胜',
      description: '连续赢得50局游戏',
      icon: '👑',
      unlocked: false
    },
    hundred_games: {
      id: 'hundred_games',
      category: 'battle',
      name: '百局棋手',
      description: '累计完成100局游戏',
      icon: '🎮',
      unlocked: false
    },
    first_pve_win: {
      id: 'first_pve_win',
      category: 'difficulty',
      name: '人机初试',
      description: '首次在人机对战中获胜',
      icon: '🤖',
      unlocked: false
    },
    beat_easy_ai: {
      id: 'beat_easy_ai',
      category: 'difficulty',
      name: '小试牛刀',
      description: '击败初级难度AI',
      icon: '🌱',
      unlocked: false
    },
    beat_medium_ai: {
      id: 'beat_medium_ai',
      category: 'difficulty',
      name: '渐入佳境',
      description: '击败中级难度AI',
      icon: '🔥',
      unlocked: false
    },
    beat_hard_ai: {
      id: 'beat_hard_ai',
      category: 'difficulty',
      name: '棋高一着',
      description: '击败高级难度AI',
      icon: '💪',
      unlocked: false
    },
    beat_easy_ten_times: {
      id: 'beat_easy_ten_times',
      category: 'difficulty',
      name: '初级克星',
      description: '累计击败初级AI 10次',
      icon: '🌿',
      unlocked: false
    },
    beat_medium_ten_times: {
      id: 'beat_medium_ten_times',
      category: 'difficulty',
      name: '中级杀手',
      description: '累计击败中级AI 10次',
      icon: '🌋',
      unlocked: false
    },
    beat_hard_ten_times: {
      id: 'beat_hard_ten_times',
      category: 'difficulty',
      name: '高级征服者',
      description: '累计击败高级AI 10次',
      icon: '👑',
      unlocked: false
    },
    play_both_sides: {
      id: 'play_both_sides',
      category: 'difficulty',
      name: '黑白通吃',
      description: '分别执黑和执白各赢一局',
      icon: '☯️',
      unlocked: false
    },
    perfect_win: {
      id: 'perfect_win',
      category: 'move',
      name: '完美获胜',
      description: '在少于15步内获胜',
      icon: '⚡',
      unlocked: false
    },
    super_perfect_win: {
      id: 'super_perfect_win',
      category: 'move',
      name: '闪电战',
      description: '在少于10步内获胜',
      icon: '💫',
      unlocked: false
    },
    hundred_moves: {
      id: 'hundred_moves',
      category: 'move',
      name: '深思熟虑',
      description: '单局游戏落子超过100步',
      icon: '🧠',
      unlocked: false
    },
    long_game: {
      id: 'long_game',
      category: 'move',
      name: '持久战',
      description: '单局游戏落子超过150步',
      icon: '⏳',
      unlocked: false
    },
    marathon_player: {
      id: 'marathon_player',
      category: 'move',
      name: '马拉松对局',
      description: '单局游戏落子超过200步',
      icon: '🏃',
      unlocked: false
    },
    ultra_marathon: {
      id: 'ultra_marathon',
      category: 'move',
      name: '超级马拉松',
      description: '单局游戏落子超过220步',
      icon: '🚀',
      unlocked: false
    },
    max_moves_draw: {
      id: 'max_moves_draw',
      category: 'move',
      name: '势均力敌',
      description: '棋盘下满仍未分出胜负',
      icon: '🤝',
      unlocked: false
    },
    most_moves_record: {
      id: 'most_moves_record',
      category: 'move',
      name: '最长对局',
      description: '创造个人最多步数记录（至少50步）',
      icon: '📜',
      unlocked: false
    },
    first_four: {
      id: 'first_four',
      category: 'skill',
      name: '活四入门',
      description: '首次形成活四棋型',
      icon: '4️⃣',
      unlocked: false
    },
    first_three: {
      id: 'first_three',
      category: 'skill',
      name: '活三初体验',
      description: '首次形成活三棋型',
      icon: '3️⃣',
      unlocked: false
    },
    double_three: {
      id: 'double_three',
      category: 'skill',
      name: '双三战术',
      description: '一局中同时形成两个活三',
      icon: '🎭',
      unlocked: false
    },
    three_threats: {
      id: 'three_threats',
      category: 'skill',
      name: '三重威胁',
      description: '一局中形成3次活三',
      icon: '⚠️',
      unlocked: false
    },
    five_threats: {
      id: 'five_threats',
      category: 'skill',
      name: '威胁大师',
      description: '一局中形成5次活三或活四',
      icon: '💥',
      unlocked: false
    },
    ten_threats_game: {
      id: 'ten_threats_game',
      category: 'skill',
      name: '火力全开',
      description: '一局中形成10次威胁',
      icon: '🔥',
      unlocked: false
    },
    total_threats_100: {
      id: 'total_threats_100',
      category: 'skill',
      name: '百次威胁',
      description: '累计形成100次活三或活四',
      icon: '💯',
      unlocked: false
    },
    total_threats_500: {
      id: 'total_threats_500',
      category: 'skill',
      name: '威胁专家',
      description: '累计形成500次活三或活四',
      icon: '🎯',
      unlocked: false
    },
    black_belt: {
      id: 'black_belt',
      category: 'skill',
      name: '黑带高手',
      description: '执黑累计获胜50局',
      icon: '⚫',
      unlocked: false
    },
    white_knight: {
      id: 'white_knight',
      category: 'skill',
      name: '白棋骑士',
      description: '执白累计获胜50局',
      icon: '⚪',
      unlocked: false
    },
    block_four: {
      id: 'block_four',
      category: 'strategy',
      name: '紧急防守',
      description: '成功阻挡对手的冲四',
      icon: '🛡️',
      unlocked: false
    },
    block_three: {
      id: 'block_three',
      category: 'strategy',
      name: '提前设防',
      description: '成功阻挡对手的活三',
      icon: '🚧',
      unlocked: false
    },
    five_blocks_game: {
      id: 'five_blocks_game',
      category: 'strategy',
      name: '铁壁防守',
      description: '一局中成功防守5次',
      icon: '🏰',
      unlocked: false
    },
    counter_attack: {
      id: 'counter_attack',
      category: 'strategy',
      name: '防守反击',
      description: '阻挡对手后立即形成自己的活三',
      icon: '⚡',
      unlocked: false
    },
    ten_counter_attacks: {
      id: 'ten_counter_attacks',
      category: 'strategy',
      name: '反击大师',
      description: '累计完成10次防守反击',
      icon: '🗡️',
      unlocked: false
    },
    edge_victory: {
      id: 'edge_victory',
      category: 'strategy',
      name: '边缘突破',
      description: '在棋盘边缘区域连成五子获胜',
      icon: '📏',
      unlocked: false
    },
    diagonal_win: {
      id: 'diagonal_win',
      category: 'strategy',
      name: '斜线攻击',
      description: '以斜线方向连成五子获胜',
      icon: '↗️',
      unlocked: false
    },
    horizontal_win: {
      id: 'horizontal_win',
      category: 'strategy',
      name: '横向碾压',
      description: '以横向方向连成五子获胜',
      icon: '➡️',
      unlocked: false
    },
    vertical_win: {
      id: 'vertical_win',
      category: 'strategy',
      name: '纵向突破',
      description: '以纵向方向连成五子获胜',
      icon: '⬇️',
      unlocked: false
    },
    all_directions_win: {
      id: 'all_directions_win',
      category: 'strategy',
      name: '全方位攻击',
      description: '分别以横、竖、斜三种方向获胜',
      icon: '✳️',
      unlocked: false
    },
    all_themes: {
      id: 'all_themes',
      category: 'collect',
      name: '主题收藏家',
      description: '使用过所有主题',
      icon: '🎨',
      unlocked: false
    },
    theme_explorer: {
      id: 'theme_explorer',
      category: 'collect',
      name: '主题探索者',
      description: '使用过5种不同主题',
      icon: '🌈',
      unlocked: false
    },
    classic_lover: {
      id: 'classic_lover',
      category: 'collect',
      name: '经典情怀',
      description: '使用经典主题完成10局游戏',
      icon: '🪵',
      unlocked: false
    },
    night_owl: {
      id: 'night_owl',
      category: 'collect',
      name: '夜猫子',
      description: '使用午夜黑主题完成5局游戏',
      icon: '🌙',
      unlocked: false
    },
    jade_lover: {
      id: 'jade_lover',
      category: 'collect',
      name: '翡翠爱好者',
      description: '使用翡翠玉石主题完成10局游戏',
      icon: '💚',
      unlocked: false
    },
    ocean_explorer: {
      id: 'ocean_explorer',
      category: 'collect',
      name: '海洋探索者',
      description: '使用深蓝海洋主题完成10局游戏',
      icon: '🌊',
      unlocked: false
    },
    sunset_watcher: {
      id: 'sunset_watcher',
      category: 'collect',
      name: '日落观赏者',
      description: '使用日落黄昏主题完成10局游戏',
      icon: '🌅',
      unlocked: false
    },
    timer_master: {
      id: 'timer_master',
      category: 'special',
      name: '时间管理大师',
      description: '在限时模式下获胜10局',
      icon: '⏱️',
      unlocked: false
    },
    last_second_win: {
      id: 'last_second_win',
      category: 'special',
      name: '绝杀时刻',
      description: '在限时模式最后3秒内落子获胜',
      icon: '⏰',
      unlocked: false
    },
    first_move_win: {
      id: 'first_move_win',
      category: 'special',
      name: '先手制胜',
      description: '执黑先手获胜',
      icon: '⬛',
      unlocked: false
    },
    second_move_win: {
      id: 'second_move_win',
      category: 'special',
      name: '后来居上',
      description: '执白后手获胜',
      icon: '⬜',
      unlocked: false
    },
    center_dominance: {
      id: 'center_dominance',
      category: 'special',
      name: '中心开花',
      description: '第一步下在天元（棋盘中心）并获胜',
      icon: '🎯',
      unlocked: false
    },
    corner_victory: {
      id: 'corner_victory',
      category: 'special',
      name: '角落奇迹',
      description: '第一步下在棋盘四角之一并获胜',
      icon: '📐',
      unlocked: false
    },
    undo_master: {
      id: 'undo_master',
      category: 'special',
      name: '悔棋大师',
      description: '单局游戏悔棋超过5次并最终获胜',
      icon: '↩️',
      unlocked: false
    },
    first_undo_win: {
      id: 'first_undo_win',
      category: 'special',
      name: '知错能改',
      description: '使用悔棋后最终获胜',
      icon: '💡',
      unlocked: false
    },
    no_undo_perfect: {
      id: 'no_undo_perfect',
      category: 'special',
      name: '落子无悔',
      description: '不使用悔棋赢得一局',
      icon: '✅',
      unlocked: false
    },
    ten_no_undo: {
      id: 'ten_no_undo',
      category: 'special',
      name: '真棋士',
      description: '连续10局不使用悔棋',
      icon: '🎖️',
      unlocked: false
    },
    comeback_king: {
      id: 'comeback_king',
      category: 'special',
      name: '逆境翻盘',
      description: '连胜被终结后立刻再取3连胜',
      icon: '🔄',
      unlocked: false
    },
    weekend_player: {
      id: 'weekend_player',
      category: 'special',
      name: '周末棋手',
      description: '在周六或周日完成一局游戏',
      icon: '📅',
      unlocked: false
    },
    early_bird: {
      id: 'early_bird',
      category: 'special',
      name: '早起的鸟儿',
      description: '在早上6点到9点之间完成一局',
      icon: '🐦',
      unlocked: false
    },
    night_owl_player: {
      id: 'night_owl_player',
      category: 'special',
      name: '深夜棋手',
      description: '在晚上11点到凌晨3点之间完成一局',
      icon: '🦉',
      unlocked: false
    },
    holiday_player: {
      id: 'holiday_player',
      category: 'special',
      name: '假期棋手',
      description: '在节假日完成一局游戏',
      icon: '🎉',
      unlocked: false
    },
    new_year_first: {
      id: 'new_year_first',
      category: 'special',
      name: '新年第一局',
      description: '在1月1日完成一局游戏',
      icon: '🎊',
      unlocked: false
    }
  };

  var defaultStats = {
    totalWins: 0,
    totalGames: 0,
    mostMovesInGame: 0,
    themesUsed: [],
    themesUsedCount: {},
    currentStreak: 0,
    bestStreak: 0,
    easyAiBeatenCount: 0,
    mediumAiBeatenCount: 0,
    hardAiBeatenCount: 0,
    blackWins: 0,
    whiteWins: 0,
    timerWins: 0,
    totalUndoInGame: 0,
    lastGameDate: null,
    streakBroken: false,
    postBreakStreak: 0,
    totalThreats: 0,
    threatsInGame: 0,
    blocksInGame: 0,
    totalBlocks: 0,
    totalCounterAttacks: 0,
    lastMoveWasBlock: false,
    horizontalWin: false,
    verticalWin: false,
    diagonalWin: false,
    consecutiveNoUndo: 0
  };

  var stats = Object.assign({}, defaultStats);

  var notificationQueue = [];
  var activeNotifications = [];
  var MAX_ACTIVE_NOTIFICATIONS = 3;
  var notificationContainer = null;

  function getNotificationContainer() {
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'achievement-notification-container';
      document.body.appendChild(notificationContainer);
    }
    return notificationContainer;
  }

  G.achievements = {
    init: init,
    checkWinAchievements: checkWinAchievements,
    checkMoveAchievements: checkMoveAchievements,
    trackUndo: trackUndo,
    trackTheme: trackTheme,
    getAchievements: getAchievements,
    getStats: getStats,
    getCategories: getCategories,
    showAchievementNotification: showAchievementNotification,
    getAchievementsByCategory: getAchievementsByCategory,
    checkDrawAchievements: checkDrawAchievements
  };

  function init() {
    loadAchievements();
    loadStats();
  }

  function loadAchievements() {
    var saved = localStorage.getItem('gomoku-achievements');
    if (saved) {
      try {
        var data = JSON.parse(saved);
        Object.keys(data).forEach(function(key) {
          if (ACHIEVEMENTS[key]) {
            ACHIEVEMENTS[key].unlocked = data[key].unlocked;
          }
        });
      } catch (e) {
        console.warn('Failed to load achievements:', e);
      }
    }
  }

  function saveAchievements() {
    var data = {};
    Object.keys(ACHIEVEMENTS).forEach(function(key) {
      data[key] = { unlocked: ACHIEVEMENTS[key].unlocked };
    });
    localStorage.setItem('gomoku-achievements', JSON.stringify(data));
  }

  function loadStats() {
    var saved = localStorage.getItem('gomoku-stats');
    if (saved) {
      try {
        var savedStats = JSON.parse(saved);
        Object.keys(savedStats).forEach(function(key) {
          if (stats.hasOwnProperty(key)) {
            stats[key] = savedStats[key];
          }
        });
      } catch (e) {
        console.warn('Failed to load stats:', e);
      }
    }
  }

  function saveStats() {
    localStorage.setItem('gomoku-stats', JSON.stringify(stats));
  }

  function unlockAchievement(id) {
    if (ACHIEVEMENTS[id] && !ACHIEVEMENTS[id].unlocked) {
      ACHIEVEMENTS[id].unlocked = true;
      saveAchievements();
      showAchievementNotification(ACHIEVEMENTS[id]);
      return true;
    }
    return false;
  }

  function checkWinAchievements(winner) {
    var isPlayerWin = state.gameMode === 'pve' && winner === state.playerSide;
    var isPvp = state.gameMode === 'pvp';
    var isPlayerLose = state.gameMode === 'pve' && winner !== state.playerSide;

    if (isPlayerLose) {
      stats.totalGames++;
      if (stats.currentStreak >= 3) {
        stats.streakBroken = true;
        stats.postBreakStreak = 0;
      }
      stats.currentStreak = 0;
      stats.totalUndoInGame = 0;
      stats.threatsInGame = 0;
      stats.blocksInGame = 0;
      stats.lastMoveWasBlock = false;
      stats.lastGameDate = new Date().toISOString();
      saveStats();

      checkTimeBasedAchievements();
      return;
    }

    if (isPlayerWin || isPvp) {
      stats.totalWins++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }

      if (stats.streakBroken) {
        stats.postBreakStreak++;
        if (stats.postBreakStreak >= 3) {
          unlockAchievement('comeback_king');
        }
      }

      if (winner === G.BLACK) {
        stats.blackWins++;
      } else {
        stats.whiteWins++;
      }

      if (state.gameMode === 'pve' && winner === state.playerSide) {
        unlockAchievement('first_pve_win');

        if (state.aiDifficulty === 'easy') {
          stats.easyAiBeatenCount++;
          unlockAchievement('beat_easy_ai');
          if (stats.easyAiBeatenCount >= 10) unlockAchievement('beat_easy_ten_times');
        } else if (state.aiDifficulty === 'medium') {
          stats.mediumAiBeatenCount++;
          unlockAchievement('beat_medium_ai');
          if (stats.mediumAiBeatenCount >= 10) unlockAchievement('beat_medium_ten_times');
        } else if (state.aiDifficulty === 'hard') {
          stats.hardAiBeatenCount++;
          unlockAchievement('beat_hard_ai');
          if (stats.hardAiBeatenCount >= 10) unlockAchievement('beat_hard_ten_times');
        }
      }

      if (stats.totalWins >= 1) unlockAchievement('first_win');
      if (stats.totalWins >= 5) unlockAchievement('five_wins');
      if (stats.totalWins >= 10) unlockAchievement('ten_wins');
      if (stats.totalWins >= 20) unlockAchievement('twenty_wins');
      if (stats.totalWins >= 50) unlockAchievement('fifty_wins');
      if (stats.totalWins >= 100) unlockAchievement('hundred_wins');

      if (stats.currentStreak >= 3) unlockAchievement('three_streak');
      if (stats.currentStreak >= 5) unlockAchievement('five_streak');
      if (stats.currentStreak >= 10) unlockAchievement('ten_streak');
      if (stats.currentStreak >= 20) unlockAchievement('win_streak_20');
      if (stats.currentStreak >= 50) unlockAchievement('win_streak_50');

      if (stats.blackWins >= 1 && stats.whiteWins >= 1) unlockAchievement('play_both_sides');

      if (stats.blackWins >= 50) unlockAchievement('black_belt');
      if (stats.whiteWins >= 50) unlockAchievement('white_knight');

      if (state.moveCount < 15) unlockAchievement('perfect_win');
      if (state.moveCount < 10) unlockAchievement('super_perfect_win');

      if (state.moveCount > stats.mostMovesInGame && state.moveCount >= 50) {
        stats.mostMovesInGame = state.moveCount;
        unlockAchievement('most_moves_record');
      }

      if (state.moveCount >= 100) unlockAchievement('hundred_moves');
      if (state.moveCount >= 150) unlockAchievement('long_game');
      if (state.moveCount >= 200) unlockAchievement('marathon_player');
      if (state.moveCount >= 220) unlockAchievement('ultra_marathon');

      if (stats.themesUsedCount[state.currentTheme]) {
        stats.themesUsedCount[state.currentTheme]++;
      } else {
        stats.themesUsedCount[state.currentTheme] = 1;
      }
      if (state.currentTheme === 'classic' && stats.themesUsedCount.classic >= 10) {
        unlockAchievement('classic_lover');
      }
      if (state.currentTheme === 'midnight' && stats.themesUsedCount.midnight >= 5) {
        unlockAchievement('night_owl');
      }
      if (state.currentTheme === 'jade' && stats.themesUsedCount.jade >= 10) {
        unlockAchievement('jade_lover');
      }
      if (state.currentTheme === 'ocean' && stats.themesUsedCount.ocean >= 10) {
        unlockAchievement('ocean_explorer');
      }
      if (state.currentTheme === 'sunset' && stats.themesUsedCount.sunset >= 10) {
        unlockAchievement('sunset_watcher');
      }

      if (state.timerEnabled) {
        stats.timerWins++;
        if (stats.timerWins >= 10) unlockAchievement('timer_master');
        if (state.timerRemaining <= 3) unlockAchievement('last_second_win');
      }

      if (winner === G.BLACK) unlockAchievement('first_move_win');
      if (winner === G.WHITE) unlockAchievement('second_move_win');

      if (state.firstMove && state.firstMove.row === 7 && state.firstMove.col === 7) {
        unlockAchievement('center_dominance');
      }

      if (state.firstMove) {
        var r = state.firstMove.row;
        var c = state.firstMove.col;
        if ((r === 0 || r === 14) && (c === 0 || c === 14)) {
          unlockAchievement('corner_victory');
        }
      }

      if (state.winLine) {
        checkWinDirection(state.winLine);
      }

      if (stats.totalUndoInGame > 0) {
        unlockAchievement('first_undo_win');
        stats.consecutiveNoUndo = 0;
      } else {
        unlockAchievement('no_undo_perfect');
        stats.consecutiveNoUndo++;
        if (stats.consecutiveNoUndo >= 10) {
          unlockAchievement('ten_no_undo');
        }
      }

      if (stats.totalUndoInGame >= 5) unlockAchievement('undo_master');
    }

    stats.totalGames++;
    if (stats.totalGames >= 100) unlockAchievement('hundred_games');

    stats.totalUndoInGame = 0;
    stats.threatsInGame = 0;
    stats.blocksInGame = 0;
    stats.lastMoveWasBlock = false;
    stats.lastGameDate = new Date().toISOString();

    saveStats();

    checkTimeBasedAchievements();
  }

  function checkWinDirection(winLine) {
    var dr = winLine.endR - winLine.startR;
    var dc = winLine.endC - winLine.startC;

    if (dr === 0) {
      stats.horizontalWin = true;
      unlockAchievement('horizontal_win');
    } else if (dc === 0) {
      stats.verticalWin = true;
      unlockAchievement('vertical_win');
    } else {
      stats.diagonalWin = true;
      unlockAchievement('diagonal_win');
    }

    if (stats.horizontalWin && stats.verticalWin && stats.diagonalWin) {
      unlockAchievement('all_directions_win');
    }

    var minRow = Math.min(winLine.startR, winLine.endR);
    var maxRow = Math.max(winLine.startR, winLine.endR);
    if (minRow <= 2 || maxRow >= 12) {
      unlockAchievement('edge_victory');
    }
  }

  function checkTimeBasedAchievements() {
    var now = new Date();
    var day = now.getDay();
    if (day === 0 || day === 6) unlockAchievement('weekend_player');

    var hour = now.getHours();
    if (hour >= 6 && hour < 9) unlockAchievement('early_bird');
    if (hour >= 23 || hour < 3) unlockAchievement('night_owl_player');

    var month = now.getMonth() + 1;
    var date = now.getDate();

    if (month === 1 && date === 1) unlockAchievement('new_year_first');

    var holidays = [[1, 1], [2, 14], [3, 8], [5, 1], [6, 1], [10, 1], [12, 25]];
    for (var i = 0; i < holidays.length; i++) {
      if (month === holidays[i][0] && date === holidays[i][1]) {
        unlockAchievement('holiday_player');
        break;
      }
    }
  }

  function checkDrawAchievements() {
    if (state.moveCount >= G.BOARD_SIZE * G.BOARD_SIZE) {
      unlockAchievement('max_moves_draw');
    }
    stats.totalGames++;
    stats.currentStreak = 0;
    stats.streakBroken = true;
    stats.postBreakStreak = 0;
    stats.totalUndoInGame = 0;
    saveStats();

    checkTimeBasedAchievements();
  }

  function checkMoveAchievements() {
  }

  function trackUndo() {
    stats.totalUndoInGame++;
  }

  function trackTheme(theme) {
    if (stats.themesUsed.indexOf(theme) === -1) {
      stats.themesUsed.push(theme);
    }
    if (!stats.themesUsedCount[theme]) {
      stats.themesUsedCount[theme] = 0;
    }

    var totalThemes = document.querySelectorAll('.theme-option').length;
    if (stats.themesUsed.length >= 5) {
      unlockAchievement('theme_explorer');
    }
    if (stats.themesUsed.length >= totalThemes) {
      unlockAchievement('all_themes');
    }
    saveStats();
  }

  function getAchievements() {
    return ACHIEVEMENTS;
  }

  function getStats() {
    return stats;
  }

  function getCategories() {
    return ACHIEVEMENT_CATEGORIES;
  }

  function getAchievementsByCategory(category) {
    var result = [];
    Object.keys(ACHIEVEMENTS).forEach(function(key) {
      if (category === 'all' || ACHIEVEMENTS[key].category === category) {
        result.push(ACHIEVEMENTS[key]);
      }
    });
    return result;
  }

  function showAchievementNotification(achievement) {
    notificationQueue.push(achievement);
    processNotificationQueue();
  }

  function processNotificationQueue() {
    if (activeNotifications.length >= MAX_ACTIVE_NOTIFICATIONS || notificationQueue.length === 0) return;

    var achievement = notificationQueue.shift();

    var notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML =
      '<div class="achievement-icon">' + achievement.icon + '</div>' +
      '<div class="achievement-content">' +
        '<div class="achievement-title">成就解锁！</div>' +
        '<div class="achievement-name">' + achievement.name + '</div>' +
        '<div class="achievement-desc">' + achievement.description + '</div>' +
      '</div>';
    getNotificationContainer().appendChild(notification);

    activeNotifications.push(notification);

    setTimeout(function() {
      notification.classList.add('show');
    }, 50);

    setTimeout(function() {
      notification.classList.remove('show');
      setTimeout(function() {
        var index = activeNotifications.indexOf(notification);
        if (index > -1) {
          activeNotifications.splice(index, 1);
        }
        notification.remove();
        processNotificationQueue();
      }, 400);
    }, 3500);
  }
})();