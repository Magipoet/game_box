class AchievementManager {
    constructor() {
        this.achievements = [
            { id: 'first_game', name: '初试牛刀', desc: '完成第一局游戏', icon: '🎮', condition: (stats) => stats.gamesPlayed >= 1 },
            { id: 'score_100', name: '百分达成', desc: '单局得分达到100分', icon: '💯', condition: (stats) => stats.maxScore >= 100 },
            { id: 'score_200', name: '双百分', desc: '单局得分达到200分', icon: '🏆', condition: (stats) => stats.maxScore >= 200 },
            { id: 'score_500', name: '五百分大师', desc: '单局得分达到500分', icon: '🌟', condition: (stats) => stats.maxScore >= 500 },
            { id: 'length_20', name: '成长中', desc: '蛇身长度达到20', icon: '🐍', condition: (stats) => stats.maxLength >= 20 },
            { id: 'length_50', name: '长蛇', desc: '蛇身长度达到50', icon: '📏', condition: (stats) => stats.maxLength >= 50 },
            { id: 'games_10', name: '游戏达人', desc: '完成10局游戏', icon: '🎯', condition: (stats) => stats.gamesPlayed >= 10 },
            { id: 'games_50', name: '游戏狂热者', desc: '完成50局游戏', icon: '🔥', condition: (stats) => stats.gamesPlayed >= 50 },
            { id: 'new_record', name: '破纪录', desc: '刷新最高分', icon: '📈', condition: (stats) => stats.recordsBroken >= 1 },
            { id: 'star_collector', name: '星星收集者', desc: '收集10个星星', icon: '⭐', condition: (stats) => stats.starsCollected >= 10 },
            { id: 'endless_survivor', name: '无尽生存', desc: '在无尽模式存活60秒', icon: '♾️', condition: (stats) => stats.endlessSurvivalTime >= 60 },
            { id: 'wall_master', name: '穿墙大师', desc: '穿墙100次', icon: '🧱', condition: (stats) => stats.wallPasses >= 100 }
        ];
        
        this.stats = JSON.parse(localStorage.getItem('snakeStats') || '{}');
        this.unlockedAchievements = JSON.parse(localStorage.getItem('snakeUnlockedAchievements') || '[]');
        
        if (Object.keys(this.stats).length === 0) {
            this.stats = {
                gamesPlayed: 0,
                maxScore: 0,
                maxLength: 0,
                recordsBroken: 0,
                starsCollected: 0,
                endlessSurvivalTime: 0,
                wallPasses: 0
            };
        }
    }
    
    checkAchievements() {
        const newUnlocks = [];
        
        for (const achievement of this.achievements) {
            if (!this.unlockedAchievements.includes(achievement.id) && achievement.condition(this.stats)) {
                this.unlockedAchievements.push(achievement.id);
                newUnlocks.push(achievement);
            }
        }
        
        if (newUnlocks.length > 0) {
            localStorage.setItem('snakeUnlockedAchievements', JSON.stringify(this.unlockedAchievements));
            this.showAchievementNotification(newUnlocks);
            if (typeof game !== 'undefined' && game.updateAchievementsDisplay) {
                game.updateAchievementsDisplay();
            }
        }
    }
    
    showAchievementNotification(achievements) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.innerHTML = `
                    <div class="toast-icon">${achievement.icon}</div>
                    <div class="toast-content">
                        <div class="toast-title">成就解锁！</div>
                        <div class="toast-message">${achievement.name} - ${achievement.desc}</div>
                    </div>
                `;
                container.appendChild(toast);
                
                setTimeout(() => {
                    toast.remove();
                }, 3000);
            }, index * 1000);
        });
    }
    
    updateStats(stats) {
        Object.assign(this.stats, stats);
        localStorage.setItem('snakeStats', JSON.stringify(this.stats));
        this.checkAchievements();
    }
    
    getAchievementProgress() {
        return {
            unlocked: this.unlockedAchievements.length,
            total: this.achievements.length,
            percentage: (this.unlockedAchievements.length / this.achievements.length) * 100
        };
    }
}
