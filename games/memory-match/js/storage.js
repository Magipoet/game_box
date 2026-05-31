function getStorageKey(baseKey) {
    return baseKey;
}

function loadGameData() {
    const savedScores = localStorage.getItem(getStorageKey(STORAGE_KEYS.bestScores));
    if (savedScores) {
        bestScores = JSON.parse(savedScores);
    }
    const savedStars = localStorage.getItem(getStorageKey(STORAGE_KEYS.stars));
    if (savedStars) {
        levelStars = JSON.parse(savedStars);
    }
    const savedTimedStars = localStorage.getItem(getStorageKey(STORAGE_KEYS.timedStars));
    if (savedTimedStars) {
        timedLevelStars = JSON.parse(savedTimedStars);
    }
    const savedTimedScores = localStorage.getItem(getStorageKey(STORAGE_KEYS.timedScores));
    if (savedTimedScores) {
        timedScores = JSON.parse(savedTimedScores);
    }
    const savedProgress = localStorage.getItem(getStorageKey(STORAGE_KEYS.progress));
    if (savedProgress) {
        unlockedLevels = JSON.parse(savedProgress);
    } else {
        unlockedLevels = { 0: true };
    }
    const savedTimedProgress = localStorage.getItem(getStorageKey(STORAGE_KEYS.timedProgress));
    if (savedTimedProgress) {
        unlockedTimedLevels = JSON.parse(savedTimedProgress);
    } else {
        unlockedTimedLevels = { 0: true };
    }
    const savedMode = localStorage.getItem(getStorageKey(STORAGE_KEYS.gameMode));
    if (savedMode && (savedMode === GAME_MODES.NORMAL || savedMode === GAME_MODES.TIMED)) {
        gameMode = savedMode;
    }
    const savedNormalLevel = localStorage.getItem(getStorageKey(STORAGE_KEYS.normalCurrentLevel));
    const normalLevel = savedNormalLevel !== null ? parseInt(savedNormalLevel) : 0;
    const savedTimedLevel = localStorage.getItem(getStorageKey(STORAGE_KEYS.timedCurrentLevel));
    const timedLevel = savedTimedLevel !== null ? parseInt(savedTimedLevel) : 0;
    
    const normalUnlocked = unlockedLevels[normalLevel] ? normalLevel : getFirstUnlockedLevel(unlockedLevels);
    const timedUnlocked = unlockedTimedLevels[timedLevel] ? timedLevel : getFirstUnlockedLevel(unlockedTimedLevels);
    
    if (gameMode === GAME_MODES.TIMED) {
        currentLevel = timedUnlocked;
    } else {
        currentLevel = normalUnlocked;
    }
    
    const savedTheme = localStorage.getItem(getStorageKey(STORAGE_KEYS.theme));
    if (savedTheme && themes[savedTheme]) {
        currentTheme = savedTheme;
    }
    const savedAchievements = localStorage.getItem(getStorageKey(STORAGE_KEYS.achievements));
    if (savedAchievements) {
        achievements = JSON.parse(savedAchievements);
    }
    const savedStats = localStorage.getItem(getStorageKey(STORAGE_KEYS.stats));
    if (savedStats) {
        gameStats = JSON.parse(savedStats);
    }
    const savedSound = localStorage.getItem(getStorageKey(STORAGE_KEYS.sound));
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
    }
    if (soundBtn) soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    const savedBombIntro = localStorage.getItem(getStorageKey(STORAGE_KEYS.bombIntroSeen));
    if (savedBombIntro !== null) {
        bombIntroHasBeenSeen = savedBombIntro === 'true';
    }
    const savedTutorial = localStorage.getItem(getStorageKey(STORAGE_KEYS.tutorialSeen));
    if (savedTutorial !== null) {
        tutorialHasBeenSeen = savedTutorial === 'true';
    }
    checkAndUnlockHiddenLevels();
    applyTheme(currentTheme);
}

function getFirstUnlockedLevel(unlockedObj) {
    for (let i = 0; i < gameLevels.length; i++) {
        if (unlockedObj[i]) return i;
    }
    return 0;
}

function saveProgress(silent) {
    localStorage.setItem(getStorageKey(STORAGE_KEYS.progress), JSON.stringify(unlockedLevels));
}

function saveTimedProgress() {
    localStorage.setItem(getStorageKey(STORAGE_KEYS.timedProgress), JSON.stringify(unlockedTimedLevels));
}

function unlockNextLevel(level) {
    if (level + 1 < gameLevels.length) {
        unlockedLevels[level + 1] = true;
        saveProgress();
    }
}

function unlockNextTimedLevel(level) {
    if (level + 1 < gameLevels.length) {
        unlockedTimedLevels[level + 1] = true;
        saveTimedProgress();
    }
}

function getUnlockedLevelsForMode() {
    return gameMode === GAME_MODES.TIMED ? unlockedTimedLevels : unlockedLevels;
}

function resetAllProgress() {
    unlockedLevels = { 0: true };
    saveProgress();
    currentLevel = 0;
}

function resetCurrentLevelProgress() {
    delete bestScores[currentLevel];
    localStorage.setItem(getStorageKey(STORAGE_KEYS.bestScores), JSON.stringify(bestScores));
    if (gameStats.perLevel[currentLevel]) {
        delete gameStats.perLevel[currentLevel];
        saveStats();
    }
}

function saveBestScore(level, score) {
    if (!bestScores[level] || score < bestScores[level]) {
        bestScores[level] = score;
        localStorage.setItem(getStorageKey(STORAGE_KEYS.bestScores), JSON.stringify(bestScores));
        return true;
    }
    return false;
}

function updateBestScoreDisplay() {
    const best = bestScores[currentLevel];
    bestScoreDisplay.textContent = best ? best : '-';
}

function saveAchievements(silent) {
    localStorage.setItem(getStorageKey(STORAGE_KEYS.achievements), JSON.stringify(achievements));
}

function saveStats(silent) {
    localStorage.setItem(getStorageKey(STORAGE_KEYS.stats), JSON.stringify(gameStats));
}

function calculateStars(levelIndex, movesCount) {
    const level = gameLevels[levelIndex];
    const optimal = level.pairs;
    
    if (movesCount <= optimal * STAR_THRESHOLDS.threeStars) return 3;
    if (movesCount <= optimal * STAR_THRESHOLDS.twoStars) return 2;
    return 1;
}

function saveStars(levelIndex, starCount, mode) {
    if (mode === GAME_MODES.TIMED) {
        const currentStars = timedLevelStars[levelIndex] || 0;
        if (starCount > currentStars) {
            timedLevelStars[levelIndex] = starCount;
            localStorage.setItem(getStorageKey(STORAGE_KEYS.timedStars), JSON.stringify(timedLevelStars));
            return true;
        }
        return false;
    } else {
        const currentStars = levelStars[levelIndex] || 0;
        if (starCount > currentStars) {
            levelStars[levelIndex] = starCount;
            localStorage.setItem(getStorageKey(STORAGE_KEYS.stars), JSON.stringify(levelStars));
            return true;
        }
        return false;
    }
}

function getStarsForLevel(levelIndex, mode) {
    if (mode === GAME_MODES.TIMED) {
        return timedLevelStars[levelIndex] || 0;
    }
    return levelStars[levelIndex] || 0;
}

function getTotalStars(mode) {
    if (mode === GAME_MODES.TIMED) {
        return Object.values(timedLevelStars).reduce((sum, stars) => sum + stars, 0);
    } else if (mode === GAME_MODES.NORMAL) {
        return Object.values(levelStars).reduce((sum, stars) => sum + stars, 0);
    }
    return Object.values(levelStars).reduce((sum, stars) => sum + stars, 0);
}

function saveTimedScore(levelIndex, movesCount, timeRemainingSec) {
    const score = { moves: movesCount, timeBonus: Math.floor(timeRemainingSec / 10) };
    if (!timedScores[levelIndex] || movesCount < timedScores[levelIndex].moves) {
        timedScores[levelIndex] = score;
        localStorage.setItem(getStorageKey(STORAGE_KEYS.timedScores), JSON.stringify(timedScores));
        return true;
    }
    return false;
}

function checkAndUnlockHiddenLevels() {
    const totalNormalStars = getTotalStars(GAME_MODES.NORMAL);
    const totalTimedStars = getTotalStars(GAME_MODES.TIMED);
    gameLevels.forEach((level, index) => {
        if (level.hidden && totalNormalStars >= level.starsRequired) {
            if (!unlockedLevels[index]) {
                unlockedLevels[index] = true;
            }
        }
        if (level.hidden && totalTimedStars >= level.starsRequired) {
            if (!unlockedTimedLevels[index]) {
                unlockedTimedLevels[index] = true;
            }
        }
    });
    saveProgress();
    saveTimedProgress();
}

function saveGameMode() {
    localStorage.setItem(getStorageKey(STORAGE_KEYS.gameMode), gameMode);
}

function checkAllTimedCompleted() {
    const regularLevels = gameLevels.filter((l, i) => !l.hidden);
    return regularLevels.every((_, i) => timedScores[i]);
}

function getStarCriteriaText(levelIndex) {
    const level = gameLevels[levelIndex];
    const optimal = level.pairs;
    return `星级标准：3星≤${optimal * STAR_THRESHOLDS.threeStars}步，2星≤${optimal * STAR_THRESHOLDS.twoStars}步，1星=通关即可`;
}

function saveCurrentLevelForMode(level, mode) {
    const key = mode === GAME_MODES.TIMED ? STORAGE_KEYS.timedCurrentLevel : STORAGE_KEYS.normalCurrentLevel;
    localStorage.setItem(getStorageKey(key), level.toString());
}
