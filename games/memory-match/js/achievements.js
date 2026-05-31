function unlockAchievement(achId) {
    if (achievements[achId]) return;
    achievements[achId] = { unlocked: true, date: new Date().toLocaleDateString('zh-CN') };
    newlyUnlockedAchievements.push(achId);
    saveAchievements();
}

function checkAchievements() {
    const level = gameLevels[currentLevel];

    const levelAchievements = {
        0: 'ACH001', 1: 'ACH002', 2: 'ACH003', 3: 'ACH004',
        4: 'ACH005', 5: 'ACH006', 6: 'ACH007', 7: 'ACH008',
        8: 'ACH015', 11: 'ACH016', 15: 'ACH017'
    };
    if (gameWon && levelAchievements[currentLevel]) {
        unlockAchievement(levelAchievements[currentLevel]);
    }
    if (currentLevel === 0 && gameWon && moves <= 6) {
        unlockAchievement('ACH009');
    }
    if (currentLevel === 0 && gameWon && seconds <= 10) {
        unlockAchievement('ACH010');
    }
    if (gameWon && misses === 0) {
        unlockAchievement('ACH011');
        if (level.bomb > 0) {
            unlockAchievement('ACH018');
        }
    }
    if (gameStats.totalGames >= 100) {
        unlockAchievement('ACH012');
    }
    if (gameWon && bestScores[currentLevel] && moves <= bestScores[currentLevel]) {
        unlockAchievement('ACH013');
    }
    if (maxCombo >= 10) {
        unlockAchievement('ACH019');
    }
    if (checkAllTimedCompleted()) {
        unlockAchievement('ACH020');
    }
    const earnedStars = calculateStars(currentLevel, moves);
    if (gameWon && earnedStars === 3) {
        unlockAchievement('ACH021');
    }
    const totalNormalStars = getTotalStars(GAME_MODES.NORMAL);
    const totalTimedStars = getTotalStars(GAME_MODES.TIMED);
    if (totalNormalStars >= 15 || totalTimedStars >= 15) {
        unlockAchievement('ACH022');
    }

    const allOtherAchievements = achievementList
        .filter(a => a.id !== 'ACH014')
        .every(a => achievements[a.id]);
    if (allOtherAchievements) {
        unlockAchievement('ACH014');
    }
}

function showAchievementNotification() {
    if (newlyUnlockedAchievements.length === 0) return;

    const names = newlyUnlockedAchievements
        .map(id => achievementList.find(a => a.id === id))
        .filter(Boolean)
        .map(a => `${a.icon} ${a.name}`);

    newlyUnlockedAchievements = [];

    const existingNotif = document.querySelector('.achievement-notification');
    if (existingNotif) existingNotif.remove();

    const notif = document.createElement('div');
    notif.className = 'achievement-notification';
    notif.innerHTML = `
        <div class="achievement-notif-content">
            <div class="achievement-notif-title">🏆 新成就解锁！</div>
            <div class="achievement-notif-items">${names.join('<br>')}</div>
        </div>
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3500);
}

function renderAchievements() {
    achievementsGridEl.innerHTML = '';
    achievementList.forEach(ach => {
        const unlocked = achievements[ach.id];
        const div = document.createElement('div');
        div.className = 'achievement-item' + (unlocked ? ' unlocked' : '');
        div.innerHTML = `
            <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
            <div class="achievement-info">
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
                ${unlocked ? `<div class="achievement-date">${unlocked.date}</div>` : ''}
            </div>
        `;
        achievementsGridEl.appendChild(div);
    });
}
