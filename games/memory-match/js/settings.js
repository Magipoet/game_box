function renderRecords() {
    recordGamesEl.textContent = gameStats.totalGames;
    const totalMins = Math.floor(gameStats.totalTime / 60).toString().padStart(2, '0');
    const totalSecs = (gameStats.totalTime % 60).toString().padStart(2, '0');
    recordTimeEl.textContent = `${totalMins}:${totalSecs}`;
    recordPairsEl.textContent = gameStats.totalPairs;

    recordsPerLevelEl.innerHTML = '';
    gameLevels.forEach((level, index) => {
        const rec = gameStats.perLevel[index];
        const normalStars = levelStars[index] || 0;
        const timedStars = timedLevelStars[index] || 0;
        const normalStarsHtml = `
            <div class="record-stars">
                <span class="record-mode-label">常规</span>
                ${[1, 2, 3].map(i => `<span class="record-star ${i <= normalStars ? 'filled' : 'empty'}">⭐</span>`).join('')}
            </div>
        `;
        const timedStarsHtml = `
            <div class="record-stars">
                <span class="record-mode-label">限时</span>
                ${[1, 2, 3].map(i => `<span class="record-star ${i <= timedStars ? 'filled' : 'empty'}">⭐</span>`).join('')}
            </div>
        `;
        const div = document.createElement('div');
        div.className = 'level-record';
        const bombText = level.bomb > 0 ? ` 炸弹×${level.bomb}` : '';
        const hiddenText = level.hidden ? ' 🔮隐藏' : '';
        const timedBest = timedScores[index];
        const timedText = timedBest ? `<div class="level-stats">限时最佳: <span>${timedBest.moves}步</span></div>` : '';
        
        if (rec) {
            div.innerHTML = `
                <div class="level-name">第${index + 1}关 (${level.cols}×${level.rows})${bombText}${hiddenText}</div>
                ${normalStarsHtml}
                ${timedStarsHtml}
                <div class="level-stats">最佳步数: <span>${rec.bestMoves || '-'}</span></div>
                <div class="level-stats">完成次数: <span>${rec.completions || 0}</span></div>
                ${timedText}
            `;
        } else {
            div.innerHTML = `
                <div class="level-name">第${index + 1}关 (${level.cols}×${level.rows})${bombText}${hiddenText}</div>
                ${normalStarsHtml}
                ${timedStarsHtml}
                <div class="level-stats">最佳步数: <span>-</span></div>
                <div class="level-stats">完成次数: <span>0</span></div>
                ${timedText}
            `;
        }
        recordsPerLevelEl.appendChild(div);
    });
}

function switchSettingsTab(tabName) {
    settingsTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    settingsPanels.forEach(panel => {
        panel.classList.toggle('active', panel.dataset.panel === tabName);
    });
    if (tabName === 'records') {
        renderRecords();
    }
    if (tabName === 'achievements') {
        renderAchievements();
    }
}

function updateGameStats() {
    gameStats.totalGames++;
    gameStats.totalTime += seconds;
    gameStats.totalPairs += regularPairs;

    if (!gameStats.perLevel[currentLevel]) {
        gameStats.perLevel[currentLevel] = { completions: 0, bestMoves: null };
    }
    const levelStat = gameStats.perLevel[currentLevel];
    levelStat.completions++;
    if (!levelStat.bestMoves || moves < levelStat.bestMoves) {
        levelStat.bestMoves = moves;
    }
    saveStats();
}
