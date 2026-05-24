class AchievementManager {
    constructor(game) {
        try {
            this.game = game;
            this.achievements = {
                first_game: {
                    id: 'first_game',
                    name: '初出茅庐',
                    description: '完成第一局游戏',
                    icon: '🐣',
                    unlocked: false,
                    progress: 0,
                    target: 1,
                    type: 'trigger'
                },
                ten_games: {
                    id: 'ten_games',
                    name: '游戏达人',
                    description: '累计完成10局游戏',
                    icon: '🎮',
                    unlocked: false,
                    progress: 0,
                    target: 10,
                    type: 'counter'
                },
                fifty_food: {
                    id: 'fifty_food',
                    name: '大胃王',
                    description: '单局吃50个食物',
                    icon: '🍎',
                    unlocked: false,
                    progress: 0,
                    target: 50,
                    type: 'max'
                },
                hundred_moves: {
                    id: 'hundred_moves',
                    name: '百步穿杨',
                    description: '单局连续改变方向100次不撞墙',
                    icon: '🎯',
                    unlocked: false,
                    progress: 0,
                    target: 100,
                    type: 'max'
                },
                two_thousand_score: {
                    id: 'two_thousand_score',
                    name: '千分达人',
                    description: '单局分数突破2000',
                    icon: '🏅',
                    unlocked: false,
                    progress: 0,
                    target: 2000,
                    type: 'max'
                },
                five_thousand_score: {
                    id: 'five_thousand_score',
                    name: '五千精英',
                    description: '单局分数突破5000',
                    icon: '💎',
                    unlocked: false,
                    progress: 0,
                    target: 5000,
                    type: 'max'
                },
                fifty_gold: {
                    id: 'fifty_gold',
                    name: '黄金收藏家',
                    description: '单局吃50个金色食物',
                    icon: '💰',
                    unlocked: false,
                    progress: 0,
                    target: 50,
                    type: 'max'
                },
                twenty_purple: {
                    id: 'twenty_purple',
                    name: '紫色传说',
                    description: '单局吃20个紫色食物',
                    icon: '💜',
                    unlocked: false,
                    progress: 0,
                    target: 20,
                    type: 'max'
                },
                two_hundred_both: {
                    id: 'two_hundred_both',
                    name: '模式切换者',
                    description: '三种模式都达到1200分',
                    icon: '🔄',
                    unlocked: false,
                    progress: 0,
                    target: 3,
                    type: 'max'
                },
                first_challenge: {
                    id: 'first_challenge',
                    name: '挑战启程',
                    description: '完成第一局挑战模式',
                    icon: '🔥',
                    unlocked: false,
                    progress: 0,
                    target: 1,
                    type: 'trigger'
                },
                ten_reverse: {
                    id: 'ten_reverse',
                    name: '逆向思维',
                    description: '累计吃10个反向食物',
                    icon: '🔃',
                    unlocked: false,
                    progress: 0,
                    target: 10,
                    type: 'counter'
                },
                minus_combo: {
                    id: 'minus_combo',
                    name: '化险为夷',
                    description: '单局连续吃到2个减分食物触发加分',
                    icon: '🌀',
                    unlocked: false,
                    progress: 0,
                    target: 1,
                    type: 'trigger'
                },
                ten_minus: {
                    id: 'ten_minus',
                    name: '越挫越勇',
                    description: '累计吃10个减分食物',
                    icon: '🧪',
                    unlocked: false,
                    progress: 0,
                    target: 10,
                    type: 'counter'
                },
                stake_dodger: {
                    id: 'stake_dodger',
                    name: '毫发无伤',
                    description: '单局存活时间超过90秒且未撞到木桩',
                    icon: '🛡️',
                    unlocked: false,
                    progress: 0,
                    target: 1,
                    type: 'trigger'
                },
                challenge_veteran: {
                    id: 'challenge_veteran',
                    name: '挑战老兵',
                    description: '累计完成10局挑战模式',
                    icon: '🎖️',
                    unlocked: false,
                    progress: 0,
                    target: 10,
                    type: 'counter'
                },
                challenge_master: {
                    id: 'challenge_master',
                    name: '挑战大师',
                    description: '挑战模式单局得分达到1500',
                    icon: '👑',
                    unlocked: false,
                    progress: 0,
                    target: 1500,
                    type: 'max'
                },
                first_double: {
                    id: 'first_double',
                    name: '双人初体验',
                    description: '完成第一局双人模式',
                    icon: '👥',
                    unlocked: false,
                    progress: 0,
                    target: 1,
                    type: 'trigger'
                },
                head_on_survivor: {
                    id: 'head_on_survivor',
                    name: '正面对决',
                    description: '双人模式中经历一次头对头碰撞',
                    icon: '⚔️',
                    unlocked: false,
                    progress: 0,
                    target: 1,
                    type: 'trigger'
                },
                all_foods: {
                    id: 'all_foods',
                    name: '美食鉴赏家',
                    description: '单局内吃到所有5种不同食物（常规/金/紫/减分/反向）',
                    icon: '🍱',
                    unlocked: false,
                    progress: 0,
                    target: 5,
                    type: 'max'
                },
                perfect_run: {
                    id: 'perfect_run',
                    name: '毫发无损',
                    description: '单局得分达到800且未撞到任何障碍',
                    icon: '✨',
                    unlocked: false,
                    progress: 0,
                    target: 1,
                    type: 'trigger'
                }
            };

            this.toastContainer = null;
            this.loadAchievements();
            this.initToastContainer();
        } catch (error) {
            console.error('Error initializing AchievementManager:', error);
        }
    }

    loadAchievements() {
        const saved = localStorage.getItem('snakeAchievements');
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                if (this.achievements[key]) {
                    this.achievements[key].unlocked = data[key].unlocked;
                    this.achievements[key].progress = data[key].progress || 0;
                }
            });
        }
    }

    saveAchievements() {
        const data = {};
        Object.keys(this.achievements).forEach(key => {
            data[key] = {
                unlocked: this.achievements[key].unlocked,
                progress: this.achievements[key].progress
            };
        });
        localStorage.setItem('snakeAchievements', JSON.stringify(data));
    }

    initToastContainer() {
        this.toastContainer = document.getElementById('toastContainer');
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toastContainer';
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
    }

    showToast(achievement) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast-icon">${achievement.icon}</span>
            <div class="toast-content">
                <div class="toast-title">成就解锁！</div>
                <div class="toast-message">${achievement.name}</div>
            </div>
        `;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    _tryUnlock(achievement) {
        if (achievement.progress >= achievement.target) {
            achievement.unlocked = true;
            this.showToast(achievement);
            if (this.game && this.game.themeManager) {
                this.game.themeManager.updateThemeButtons();
            }
        }
    }

    updateProgress(achievementId, value) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.progress = Math.max(achievement.progress, value);
        this._tryUnlock(achievement);
        this.saveAchievements();
    }

    incrementProgress(achievementId, amount = 1) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.progress = (achievement.progress || 0) + amount;
        this._tryUnlock(achievement);
        this.saveAchievements();
    }

    triggerAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) return;

        achievement.progress = achievement.target;
        this._tryUnlock(achievement);
        this.saveAchievements();
    }

    isAchievementUnlocked(achievementId) {
        return this.achievements[achievementId]?.unlocked || false;
    }

    renderAchievements() {
        const container = document.getElementById('achievementsList');
        if (!container) return;

        container.innerHTML = '';

        const allAchievements = Object.values(this.achievements);
        const totalCount = allAchievements.length;
        const unlockedCount = allAchievements.filter(a => a.unlocked).length;
        const progressPercent = Math.round((unlockedCount / totalCount) * 100);

        const summary = document.createElement('div');
        summary.className = 'achievements-summary';
        summary.innerHTML = `
            <span class="achievements-summary-icon">🏆</span>
            <span class="achievements-summary-text">已完成</span>
            <span class="achievements-summary-count">${unlockedCount}</span>
            <span class="achievements-summary-total">/ ${totalCount}</span>
            <div class="achievements-progress-bar">
                <div class="achievements-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
        `;
        container.appendChild(summary);

        const themeAchievements = {
            fifty_gold: '复古黄主题',
            twenty_purple: '暗夜紫主题'
        };

        Object.values(this.achievements).forEach(achievement => {
            const item = document.createElement('div');
            item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;

            let progressText;
            if (achievement.unlocked) {
                progressText = '已完成';
            } else if (achievement.type === 'trigger') {
                progressText = '未解锁';
            } else {
                progressText = `${Math.floor(achievement.progress)}/${achievement.target}`;
            }

            let extraDesc = '';
            if (themeAchievements[achievement.id]) {
                extraDesc = `<br><span style="color: #fbbf24; font-size: 0.8rem;">🔓 解锁后可使用「${themeAchievements[achievement.id]}」</span>`;
            }

            item.innerHTML = `
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}${extraDesc}</div>
                </div>
                <span class="achievement-progress">${progressText}</span>
            `;

            container.appendChild(item);
        });
    }
}