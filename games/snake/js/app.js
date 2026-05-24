document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new SnakeGame();
        const achievementManager = new AchievementManager(game);
        const themeManager = new ThemeManager(game, achievementManager);
        
        game.setThemeManager(themeManager);
        game.setAchievementManager(achievementManager);
        
        themeManager.updateThemeButtons();
        
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                const tabContent = document.getElementById(`tab-${tabId}`);
                
                if (tabContent) {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    btn.classList.add('active');
                    tabContent.classList.add('active');
                    
                    if (tabId === 'history') {
                        renderHistory();
                    }
                }
            });
        });
        
        function renderHistory() {
            const historyContent = document.getElementById('historyContent');
            if (!historyContent) return;

            const modes = [
                { key: 'normal', label: '常规模式', icon: '🎮' },
                { key: 'fun', label: '趣味模式', icon: '✨' },
                { key: 'challenge', label: '挑战模式', icon: '🔥' }
            ];

            const playerModes = [
                { key: 'single', label: '单人模式', icon: '👤' },
                { key: 'double', label: '双人模式', icon: '👥' }
            ];

            let html = '';

            playerModes.forEach(pm => {
                html += `<div class="history-player-section">`;
                html += `<div class="history-player-title"><span>${pm.icon}</span><span>${pm.label}</span></div>`;

                modes.forEach(mode => {
                    const history = game.getTopScores(mode.key, 3, pm.key);
                    html += `
                        <div class="history-mode-section">
                            <div class="history-mode-title">
                                <span>${mode.icon}</span>
                                <span>${mode.label} - 前三名</span>
                            </div>
                            <div class="history-list">
                                ${renderHistoryList(history, mode.key, pm.key)}
                            </div>
                        </div>
                    `;
                });

                html += `</div>`;
            });

            historyContent.innerHTML = html;

            document.querySelectorAll('.history-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mode = e.target.dataset.mode;
                    const id = parseInt(e.target.dataset.id);
                    const playerMode = e.target.dataset.playerMode;
                    if (mode && id && playerMode) {
                        game.deleteHistoryEntry(mode, id, playerMode);
                        renderHistory();
                    }
                });
            });
        }

        function renderHistoryList(scores, mode, playerMode) {
            if (scores.length === 0) {
                return `
                    <div class="no-history">
                        <div class="no-history-icon">📝</div>
                        <div>暂无记录</div>
                    </div>
                `;
            }

            return scores.map((score, index) => {
                const playerInfo = playerMode === 'double'
                    ? ` (P1:${score.score1 || 0} / P2:${score.score2 || 0})`
                    : '';
                return `
                <div class="history-item">
                    <div class="history-rank rank-${index + 1}">${index + 1}</div>
                    <div class="history-info">
                        <div class="history-score">${score.score} 分${playerInfo}</div>
                        <div class="history-date">${score.date}</div>
                    </div>
                    <button class="history-delete" data-mode="${mode}" data-player-mode="${playerMode}" data-id="${score.id}" title="删除记录">×</button>
                </div>
            `}).join('');
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});