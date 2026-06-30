const gameLevels = [
    { rows: 2, cols: 3, pairs: 3, bomb: 0, timeLimit: 60, hidden: false, starsRequired: 0 },
    { rows: 2, cols: 4, pairs: 4, bomb: 0, timeLimit: 75, hidden: false, starsRequired: 0 },
    { rows: 2, cols: 5, pairs: 5, bomb: 0, timeLimit: 90, hidden: false, starsRequired: 0 },
    { rows: 3, cols: 4, pairs: 6, bomb: 0, timeLimit: 90, hidden: false, starsRequired: 0 },
    { rows: 4, cols: 4, pairs: 8, bomb: 0, timeLimit: 100, hidden: false, starsRequired: 0 },
    { rows: 3, cols: 6, pairs: 9, bomb: 0, timeLimit: 120, hidden: false, starsRequired: 0 },
    { rows: 5, cols: 6, pairs: 15, bomb: 0, timeLimit: 150, hidden: false, starsRequired: 0 },
    { rows: 6, cols: 6, pairs: 18, bomb: 0, timeLimit: 180, hidden: false, starsRequired: 0 },
    { rows: 2, cols: 3, pairs: 2, bomb: 1, timeLimit: 60, hidden: false, starsRequired: 0 },
    { rows: 2, cols: 4, pairs: 3, bomb: 1, timeLimit: 75, hidden: false, starsRequired: 0 },
    { rows: 2, cols: 5, pairs: 4, bomb: 1, timeLimit: 90, hidden: false, starsRequired: 0 },
    { rows: 3, cols: 4, pairs: 5, bomb: 1, timeLimit: 90, hidden: false, starsRequired: 0 },
    { rows: 4, cols: 4, pairs: 6, bomb: 2, timeLimit: 100, hidden: false, starsRequired: 0 },
    { rows: 3, cols: 6, pairs: 7, bomb: 2, timeLimit: 120, hidden: false, starsRequired: 0 },
    { rows: 5, cols: 6, pairs: 12, bomb: 3, timeLimit: 150, hidden: false, starsRequired: 0 },
    { rows: 6, cols: 6, pairs: 15, bomb: 3, timeLimit: 180, hidden: false, starsRequired: 0 },
    { rows: 4, cols: 5, pairs: 10, bomb: 2, timeLimit: 120, hidden: true, starsRequired: 15 },
    { rows: 5, cols: 6, pairs: 14, bomb: 4, timeLimit: 150, hidden: true, starsRequired: 30 },
    { rows: 6, cols: 6, pairs: 16, bomb: 5, timeLimit: 180, hidden: true, starsRequired: 45 }
];

const STAR_THRESHOLDS = {
    threeStars: 3,
    twoStars: 4,
    oneStar: Infinity
};

const TOTAL_STARS_TO_UNLOCK_HIDDEN = 15;

const GAME_MODES = {
    NORMAL: 'normal',
    TIMED: 'timed'
};

const cardEmojis = [
    '🐱', '🐶', '🐼', '🦊', '🦁', '🐯', '🐨', '🐸',
    '🐵', '🐔', '🐧', '🐦', '🦋', '🐝', '🐙', '🦀',
    '🐠', '🐬'
];

const themes = {
    classic: { name: '经典蓝紫', cardBack: '?' },
    forest:  { name: '清新森林', cardBack: '🍃' },
    sunset:  { name: '温暖日落', cardBack: '☀️' },
    ocean:   { name: '深海蓝',   cardBack: '💧' },
    dark:    { name: '暗黑模式', cardBack: '⭐' }
};

const achievementList = [
    { id: 'ACH001', name: '初出茅庐', icon: '🎯', desc: '完成第1关' },
    { id: 'ACH002', name: '记忆高手', icon: '🧠', desc: '完成第2关' },
    { id: 'ACH003', name: '最强大脑', icon: '💪', desc: '完成第3关' },
    { id: 'ACH004', name: '挑战者', icon: '🔥', desc: '完成第4关' },
    { id: 'ACH005', name: '征服者', icon: '⚔️', desc: '完成第5关' },
    { id: 'ACH006', name: '大师级', icon: '🏅', desc: '完成第6关' },
    { id: 'ACH007', name: '传奇记忆', icon: '🌟', desc: '完成第7关' },
    { id: 'ACH008', name: '终极挑战者', icon: '👑', desc: '完成第8关' },
    { id: 'ACH009', name: '完美通关', icon: '✨', desc: '第1关最佳步数（6步）完成' },
    { id: 'ACH010', name: '闪电反应', icon: '⚡', desc: '第1关10秒内完成' },
    { id: 'ACH011', name: '零失误', icon: '🎪', desc: '任意关卡零失误完成' },
    { id: 'ACH012', name: '坚持不懈', icon: '🔄', desc: '累计游戏100次' },
    { id: 'ACH013', name: '速度大师', icon: '🚀', desc: '任意关卡以最佳步数完成' },
    { id: 'ACH015', name: '炸弹初体验', icon: '💣', desc: '完成第9关（首个炸弹关）' },
    { id: 'ACH016', name: '炸弹专家', icon: '💥', desc: '完成第12关' },
    { id: 'ACH017', name: '拆弹大师', icon: '🛠️', desc: '完成第16关（终极炸弹关）' },
    { id: 'ACH018', name: '炸弹零失误', icon: '🎯', desc: '炸弹关卡零失误完成' },
    { id: 'ACH019', name: '连击大师', icon: '🔥', desc: '达成10连击' },
    { id: 'ACH020', name: '时间领主', icon: '⏱️', desc: '完成所有限时挑战' },
    { id: 'ACH021', name: '三星收藏家', icon: '⭐', desc: '任意关卡获得3星评价' },
    { id: 'ACH022', name: '星星收集者', icon: '🌟', desc: '累计收集15颗星星' },
    { id: 'ACH014', name: '收藏家', icon: '🏆', desc: '解锁全部成就' }
];

const STAMINA_CONFIG = {
    MAX_STAMINA: 30,
    RECOVER_INTERVAL_MS: 60 * 1000,
    COST_PER_LEVEL: 5,
    STAR_REWARDS: {
        3: 5,
        2: 3,
        1: 1,
        0: 0
    }
};

const STORAGE_KEYS = {
    progress: 'memoryGameProgress',
    bestScores: 'memoryGameBestScores',
    stars: 'memoryGameStars',
    timedStars: 'memoryGameTimedStars',
    timedScores: 'memoryGameTimedScores',
    timedProgress: 'memoryGameTimedProgress',
    normalCurrentLevel: 'memoryGameNormalCurrentLevel',
    timedCurrentLevel: 'memoryGameTimedCurrentLevel',
    theme: 'memoryGameTheme',
    achievements: 'memoryGameAchievements',
    stats: 'memoryGameStats',
    sound: 'memoryGameSound',
    gameMode: 'memoryGameMode',
    bombIntroSeen: 'memoryGameBombIntroSeen',
    tutorialSeen: 'memoryGameTutorialSeen',
    stamina: 'memoryGameStamina',
    lastStaminaRecoverTime: 'memoryGameLastStaminaRecoverTime'
};
