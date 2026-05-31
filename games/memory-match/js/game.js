function initGame() {
    loadGameData();
    createBoard();
    resetStats();
    updateDifficultyButtons();
    updateBestScoreDisplay();
    updateTotalStarsDisplay();
    updateCurrentLevelStars();
    updateModeButtons();
    checkAndShowTutorial();
}

function updateModeButtons() {
    if (modeNormalBtn) modeNormalBtn.classList.toggle('active', gameMode === GAME_MODES.NORMAL);
    if (modeTimedBtn) modeTimedBtn.classList.toggle('active', gameMode === GAME_MODES.TIMED);
    if (countdownContainer) countdownContainer.classList.toggle('hidden', gameMode !== GAME_MODES.TIMED);
}

function updateTotalStarsDisplay() {
    const el = document.getElementById('total-stars');
    if (el) el.textContent = getTotalStars(gameMode);
}

function updateCurrentLevelStars() {
    if (!currentLevelStars) return;
    const stars = getStarsForLevel(currentLevel, gameMode);
    currentLevelStars.innerHTML = `
        ${[1, 2, 3].map(i => `<span class="current-star ${i <= stars ? 'filled' : 'empty'}">⭐</span>`).join('')}
    `;
}

let levelDropdownActiveTab = null;

function updateDifficultyButtons() {
    if (!levelDropdownActiveTab) {
        levelDropdownActiveTab = gameMode;
    }
    
    const normalTotalStars = getTotalStars(GAME_MODES.NORMAL);
    const timedTotalStars = getTotalStars(GAME_MODES.TIMED);
    
    levelDropdown.innerHTML = `
        <div class="level-dropdown-tabs">
            <div class="level-dropdown-tab ${levelDropdownActiveTab === GAME_MODES.NORMAL ? 'active' : ''}" data-tab="normal">
                常规 <span class="tab-stars">⭐${normalTotalStars}</span>
            </div>
            <div class="level-dropdown-tab ${levelDropdownActiveTab === GAME_MODES.TIMED ? 'active' : ''}" data-tab="timed">
                限时 <span class="tab-stars">⭐${timedTotalStars}</span>
            </div>
        </div>
        <div class="level-dropdown-list"></div>
    `;
    
    const tabs = levelDropdown.querySelectorAll('.level-dropdown-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            levelDropdownActiveTab = tab.dataset.tab;
            updateDifficultyButtons();
        });
    });
    
    const listContainer = levelDropdown.querySelector('.level-dropdown-list');
    const displayMode = levelDropdownActiveTab;
    const currentUnlocked = displayMode === GAME_MODES.TIMED ? unlockedTimedLevels : unlockedLevels;
    
    gameLevels.forEach((level, index) => {
        const option = document.createElement('div');
        option.className = 'level-option';
        option.dataset.level = index;
        option.dataset.mode = displayMode;
        if (index === currentLevel && displayMode === gameMode) option.classList.add('active');
        if (!currentUnlocked[index]) option.classList.add('locked');
        if (level.hidden) option.classList.add('hidden-level');
        
        const bombLine = level.bomb > 0 ? `<span class="level-bomb">炸弹×${level.bomb}</span>` : '';
        const stars = getStarsForLevel(index, displayMode);
        const starsHtml = `
            <div class="level-stars">
                ${[1, 2, 3].map(i => `<span class="level-star ${i <= stars ? 'filled' : 'empty'}">⭐</span>`).join('')}
            </div>
        `;
        
        let lockedText = '';
        if (level.hidden && !currentUnlocked[index]) {
            lockedText = `<span class="level-locked-text">需要${level.starsRequired}⭐</span>`;
        }
        
        option.innerHTML = `
            <span class="level-name">${level.hidden ? '🔮 ' : ''}第${index + 1}关</span>
            <span class="level-dims">(${level.cols}×${level.rows})</span>
            ${bombLine}
            ${starsHtml}
            ${lockedText}
        `;
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const lvl = parseInt(option.dataset.level);
            if (!currentUnlocked[lvl]) return;
            closeLevelDropdown();
            if (displayMode !== gameMode) {
                if (!gameWon && (gameStarted || moves > 0)) {
                    showConfirmModal();
                    confirmYesBtn.onclick = () => {
                        saveCurrentLevelForMode(currentLevel, gameMode);
                        gameMode = displayMode;
                        saveGameMode();
                        currentLevel = lvl;
                        saveCurrentLevelForMode(currentLevel, gameMode);
                        updateDifficultyButtons();
                        updateBestScoreDisplay();
                        restartGame();
                        updateModeButtons();
                        hideConfirmModal();
                        checkAndShowBombIntro();
                    };
                    confirmNoBtn.onclick = hideConfirmModal;
                    confirmYesBtn.textContent = '确定';
                    confirmModal.querySelector('h3').textContent = '⚠️ 确认切换模式';
                    confirmModal.querySelector('p').textContent = '当前进度将丢失，确定切换吗？';
                } else {
                    saveCurrentLevelForMode(currentLevel, gameMode);
                    gameMode = displayMode;
                    saveGameMode();
                    currentLevel = lvl;
                    saveCurrentLevelForMode(currentLevel, gameMode);
                    updateDifficultyButtons();
                    updateBestScoreDisplay();
                    restartGame();
                    updateModeButtons();
                    checkAndShowBombIntro();
                }
            } else {
                changeLevel(lvl);
            }
        });
        listContainer.appendChild(option);
    });
    
    const curLevel = gameLevels[currentLevel];
    const curBombText = curLevel.bomb > 0 ? ` 炸弹×${curLevel.bomb}` : '';
    const hiddenText = curLevel.hidden ? ' 🔮隐藏关' : '';
    currentLevelLabel.textContent = `第${currentLevel + 1}关 (${curLevel.cols}×${curLevel.rows})${curBombText}${hiddenText}`;
    updateCurrentLevelStars();
}

function createBoard() {
    const level = gameLevels[currentLevel];
    const totalCards = level.rows * level.cols;

    let bombPairs;
    if (level.bomb > 0) {
        bombPairs = level.bomb;
        regularPairs = level.pairs;
    } else {
        bombPairs = 0;
        regularPairs = level.pairs;
    }

    gameBoard.innerHTML = '';
    gameBoard.className = 'game-board';
    gameBoard.style.gridTemplateColumns = `repeat(${level.cols}, minmax(auto, 150px))`;
    
    cards = [];
    const emojis = cardEmojis.slice(0, regularPairs);
    const regularCardPairs = [...emojis, ...emojis];
    const bombCardPairs = bombPairs > 0 ? Array(bombPairs * 2).fill('💣') : [];
    const cardPairs = [...regularCardPairs, ...bombCardPairs];
    
    shuffleArray(cardPairs);
    
    cardPairs.forEach((emoji, index) => {
        const isBomb = emoji === '💣';
        cards.push({
            id: index,
            type: emoji,
            flipped: false,
            matched: false,
            isBomb: isBomb
        });
        
        const card = document.createElement('div');
        card.className = 'card' + (isBomb ? ' bomb' : '');
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-back">${themes[currentTheme].cardBack}</div>
                <div class="card-front">${emoji}</div>
            </div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
    
    pairsDisplay.textContent = `0/${regularPairs}`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function flipCard(e) {
    const cardElement = e.currentTarget;
    const index = parseInt(cardElement.dataset.index);
    const card = cards[index];
    
    if (lockBoard || card.matched || card.flipped || 
        (firstCard && firstCard.id === index)) {
        return;
    }
    
    if (isTutorialActive) {
        const shouldBlock = handleTutorialCardClick(cardElement);
        if (shouldBlock) return;
    }
    
    if (!gameStarted) {
        startTimer();
        if (gameMode === GAME_MODES.TIMED) {
            startCountdown();
        }
        gameStarted = true;
        
        if (isTutorialActive && tutorialTimedCardClicked) {
            completeTimedModeDemo();
        }
    }
    
    card.flipped = true;
    cardElement.classList.add('flipped');
    playSound('flip');
    
    if (!firstCard) {
        firstCard = { element: cardElement, ...card };
    } else {
        secondCard = { element: cardElement, ...card };
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const isMatch = firstCard.type === secondCard.type;
    
    if (isMatch) {
        if (firstCard.isBomb && secondCard.isBomb) {
            bombExplode();
        } else {
            incrementCombo();
            disableCards();
        }
    } else {
        resetCombo();
        unflipCards();
    }
}

function incrementCombo() {
    combo++;
    if (combo > maxCombo) {
        maxCombo = combo;
    }
    updateComboDisplay();
    
    if (combo === 3) {
        triggerComboEffect(3);
        applyStepReduction(1);
    } else if (combo === 5) {
        triggerComboEffect(5);
        applyStepReduction(2);
    } else if (combo === 10) {
        triggerComboEffect(10);
    }
    
    if (combo >= 10) {
        unlockAchievement('ACH019');
    }
}

function resetCombo() {
    combo = 0;
    updateComboDisplay();
}

function updateComboDisplay() {
    if (!comboDisplay) return;
    
    if (combo >= 2) {
        comboDisplay.classList.remove('hidden');
        comboCount.textContent = combo + '次!';
        
        if (combo >= 10) {
            comboText.textContent = '超级连击!';
            comboDisplay.classList.add('combo-legendary');
            comboDisplay.classList.remove('combo-good', 'combo-epic');
        } else if (combo >= 5) {
            comboText.textContent = '精彩连击!';
            comboDisplay.classList.add('combo-epic');
            comboDisplay.classList.remove('combo-good', 'combo-legendary');
        } else {
            comboText.textContent = '连击!';
            comboDisplay.classList.remove('combo-good', 'combo-epic', 'combo-legendary');
        }
    } else {
        comboDisplay.classList.add('hidden');
        comboDisplay.classList.remove('combo-good', 'combo-epic', 'combo-legendary');
    }
}

function triggerComboEffect(comboLevel) {
    if (!comboEffect) return;
    
    if (comboLevel >= 10) {
        showFullscreenEffect();
        playSound('combo-legendary');
    } else if (comboLevel >= 5) {
        createParticles();
        comboEffect.textContent = `🔥 ${comboLevel}连击! +2步数减免`;
        comboEffect.className = 'combo-effect combo-effect-epic';
        playSound('combo-epic');
    } else if (comboLevel >= 3) {
        comboEffect.textContent = `✨ ${comboLevel}连击! +1步数减免`;
        comboEffect.className = 'combo-effect combo-effect-good';
        playSound('combo-good');
    }
    
    comboEffect.classList.remove('hidden');
    setTimeout(() => {
        if (comboEffect) comboEffect.classList.add('hidden');
    }, 1500);
}

function showFullscreenEffect() {
    if (!fullscreenEffect) return;
    fullscreenEffect.classList.remove('hidden');
    fullscreenEffect.style.animation = 'none';
    fullscreenEffect.offsetHeight;
    fullscreenEffect.style.animation = 'fullscreenFlash 1s ease-out';
    setTimeout(() => {
        if (fullscreenEffect) fullscreenEffect.classList.add('hidden');
    }, 1000);
}

function createParticles() {
    if (!particleContainer) return;
    
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bd6', '#c56bff'];
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = (Math.random() * 10 + 5) + 'px';
        particle.style.height = particle.style.width;
        particle.style.borderRadius = '50%';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        particleContainer.appendChild(particle);
        
        let posX = 0, posY = 0, opacity = 1;
        const animate = () => {
            posX += vx * 0.016;
            posY += vy * 0.016 + 2;
            opacity -= 0.02;
            
            particle.style.transform = `translate(${posX}px, ${posY}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        requestAnimationFrame(animate);
    }
}

function applyStepReduction(amount) {
    moves = Math.max(0, moves - amount);
    movesDisplay.textContent = moves;
    
    const bonusEl = document.createElement('div');
    bonusEl.className = 'step-reduction-bonus';
    bonusEl.textContent = `-${amount} 步`;
    bonusEl.style.left = (movesDisplay.offsetLeft + movesDisplay.offsetWidth / 2) + 'px';
    bonusEl.style.top = (movesDisplay.offsetTop) + 'px';
    document.body.appendChild(bonusEl);
    
    setTimeout(() => bonusEl.remove(), 1000);
}

function disableCards() {
    firstCard.element.classList.add('matched');
    secondCard.element.classList.add('matched');
    cards[firstCard.id].matched = true;
    cards[secondCard.id].matched = true;
    
    matchedPairs++;
    pairsDisplay.textContent = `${matchedPairs}/${regularPairs}`;
    
    playSound('match');
    resetBoard();
    
    if (matchedPairs === regularPairs) {
        if (isTutorialActive) {
            setTimeout(endTutorial, 500);
        } else {
            setTimeout(showWinModal, 500);
        }
    }
}

function bombExplode() {
    lockBoard = true;
    firstCard.element.classList.add('matched', 'bomb-explode');
    secondCard.element.classList.add('matched', 'bomb-explode');
    cards[firstCard.id].matched = true;
    cards[secondCard.id].matched = true;
    playSound('bomb');
    if (isTutorialActive) {
        setTimeout(() => {
            const tutorialBombModal = document.getElementById('tutorial-bomb-modal');
            if (tutorialBombModal) {
                tutorialBombModal.classList.remove('hidden');
            }
            const guideContent = document.querySelector('.tutorial-guide-content');
            if (guideContent) {
                guideContent.classList.add('hidden');
            }
            lockBoard = false;
            resetBoard();
        }, 1500);
    } else {
        setTimeout(showBombModal, 700);
    }
}

function unflipCards() {
    lockBoard = true;
    misses++;
    playSound('wrong');
    
    setTimeout(() => {
        firstCard.element.classList.remove('flipped');
        secondCard.element.classList.remove('flipped');
        cards[firstCard.id].flipped = false;
        cards[secondCard.id].flipped = false;
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function startTimer() {
    stopTimer();
    seconds = 0;
    timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function startCountdown() {
    stopCountdown();
    const level = gameLevels[currentLevel];
    timeRemaining = level.timeLimit;
    updateCountdownDisplay();
    
    countdownTimer = setInterval(() => {
        timeRemaining--;
        updateCountdownDisplay();
        
        if (timeRemaining <= 10 && timeRemaining > 0) {
            countdownContainer.classList.add('countdown-warning');
        }
        
        if (timeRemaining <= 0) {
            stopCountdown();
            stopTimer();
            showTimeUpModal();
        }
    }, 1000);
}

function stopCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    if (countdownContainer) countdownContainer.classList.remove('countdown-warning');
}

function updateCountdownDisplay() {
    if (!countdownDisplay) return;
    const mins = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const secs = (timeRemaining % 60).toString().padStart(2, '0');
    countdownDisplay.textContent = `${mins}:${secs}`;
}

function calculateTimeBonus() {
    const level = gameLevels[currentLevel];
    const ratio = timeRemaining / level.timeLimit;
    totalTimeBonus = Math.floor(ratio * 10);
    return totalTimeBonus;
}

function updateTimerDisplay() {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
}

function resetStats() {
    stopTimer();
    stopCountdown();
    moves = 0;
    seconds = 0;
    matchedPairs = 0;
    gameStarted = false;
    gameWon = false;
    isPaused = false;
    misses = 0;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    combo = 0;
    maxCombo = 0;
    totalTimeBonus = 0;
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '00:00';
    newRecord.classList.add('hidden');
    updateComboDisplay();
    
    if (gameMode === GAME_MODES.TIMED) {
        const level = gameLevels[currentLevel];
        timeRemaining = level.timeLimit;
        updateCountdownDisplay();
    } else {
        timeRemaining = 0;
        if (countdownDisplay) countdownDisplay.textContent = '00:00';
    }
}

function showWinModal() {
    stopTimer();
    stopCountdown();
    gameWon = true;
    
    let effectiveMoves = moves;
    if (gameMode === GAME_MODES.TIMED && timeRemaining > 0) {
        totalTimeBonus = calculateTimeBonus();
        effectiveMoves = Math.max(0, moves - totalTimeBonus);
    }
    
    const earnedStars = calculateStars(currentLevel, gameMode === GAME_MODES.TIMED ? effectiveMoves : moves);
    const isNewStarRecord = saveStars(currentLevel, earnedStars, gameMode);
    
    updateGameStats();
    checkAchievements();
    showAchievementNotification();
    
    const prevTotalStars = getTotalStars(gameMode) - (isNewStarRecord ? earnedStars - (getStarsForLevel(currentLevel, gameMode) || 0) : 0);
    
    if (gameMode === GAME_MODES.TIMED) {
        unlockNextTimedLevel(currentLevel);
    } else {
        unlockNextLevel(currentLevel);
    }
    checkAndUnlockHiddenLevels();
    
    const newTotalStars = getTotalStars(gameMode);
    const newHiddenUnlocked = gameLevels.some((l, i) => l.hidden && getUnlockedLevelsForMode()[i] && prevTotalStars < l.starsRequired && newTotalStars >= l.starsRequired);
    
    updateTotalStarsDisplay();
    updateDifficultyButtons();
    
    if (gameMode === GAME_MODES.TIMED) {
        saveTimedScore(currentLevel, effectiveMoves, timeRemaining);
    }
    
    finalMoves.textContent = gameMode === GAME_MODES.TIMED ? `${moves} (奖励后: ${effectiveMoves})` : moves;
    finalTime.textContent = timerDisplay.textContent;
    
    if (maxCombo > 0) {
        document.getElementById('final-combo').classList.remove('hidden');
        document.getElementById('final-max-combo').textContent = maxCombo;
    } else {
        document.getElementById('final-combo').classList.add('hidden');
    }
    
    if (gameMode === GAME_MODES.TIMED && totalTimeBonus > 0) {
        document.getElementById('time-bonus-info').classList.remove('hidden');
        document.getElementById('final-time-bonus').textContent = totalTimeBonus;
    } else {
        document.getElementById('time-bonus-info').classList.add('hidden');
    }
    
    updateFinalStarsDisplay(earnedStars);
    starCriteria.textContent = getStarCriteriaText(currentLevel);
    
    const isNewRecord = saveBestScore(currentLevel, gameMode === GAME_MODES.TIMED ? effectiveMoves : moves);
    if (isNewRecord) {
        newRecord.classList.remove('hidden');
        updateBestScoreDisplay();
        playSound('record');
    } else {
        playSound('win');
    }
    
    if (newHiddenUnlocked) {
        hiddenLevelNotice.classList.remove('hidden');
        starsRequiredText.textContent = TOTAL_STARS_TO_UNLOCK_HIDDEN;
    } else {
        hiddenLevelNotice.classList.add('hidden');
    }
    
    if (currentLevel < gameLevels.length - 1) {
        const nextUnlocked = getUnlockedLevelsForMode();
        if (nextUnlocked[currentLevel + 1]) {
            nextLevelInfo.classList.remove('hidden');
            nextLevelBtn.classList.remove('hidden');
            unlockedLevelNum.textContent = currentLevel + 2;
        } else {
            nextLevelInfo.classList.add('hidden');
            nextLevelBtn.classList.add('hidden');
        }
    } else {
        nextLevelInfo.classList.add('hidden');
        nextLevelBtn.classList.add('hidden');
    }
    
    updateDifficultyButtons();
    winModal.classList.remove('hidden');
}

function updateFinalStarsDisplay(stars) {
    if (!finalStars) return;
    const starElements = finalStars.querySelectorAll('.star');
    starElements.forEach((el, i) => {
        if (i < stars) {
            el.classList.remove('empty');
            el.classList.add('filled');
            setTimeout(() => {
                el.style.animation = 'starPopIn 0.5s ease';
            }, i * 200);
        } else {
            el.classList.remove('filled');
            el.classList.add('empty');
        }
    });
}

function hideWinModal() {
    winModal.classList.add('hidden');
}

function showTimeUpModal() {
    lockBoard = true;
    const timeupMovesEl = document.getElementById('timeup-moves');
    const timeupPairsEl = document.getElementById('timeup-pairs');
    if (timeupMovesEl) timeupMovesEl.textContent = moves;
    if (timeupPairsEl) timeupPairsEl.textContent = `${matchedPairs}/${regularPairs}`;
    playSound('wrong');
    if (timeUpModal) timeUpModal.classList.remove('hidden');
}

function hideTimeUpModal() {
    if (timeUpModal) timeUpModal.classList.add('hidden');
}

function showBombModal() {
    stopTimer();
    stopCountdown();
    const bombMovesEl = document.getElementById('bomb-moves');
    const bombTimeEl = document.getElementById('bomb-time');
    if (bombMovesEl) bombMovesEl.textContent = moves;
    if (bombTimeEl) bombTimeEl.textContent = timerDisplay.textContent;
    const bombModal = document.getElementById('bomb-modal');
    if (bombModal) bombModal.classList.remove('hidden');
}

function hideBombModal() {
    const bombModal = document.getElementById('bomb-modal');
    if (bombModal) bombModal.classList.add('hidden');
}

function showBombIntroModal() {
    bombIntroModal.classList.remove('hidden');
}

function hideBombIntroModal() {
    bombIntroModal.classList.add('hidden');
}

function markBombIntroAsSeen() {
    bombIntroHasBeenSeen = true;
    localStorage.setItem(getStorageKey(STORAGE_KEYS.bombIntroSeen), 'true');
}

function checkAndShowBombIntro() {
    const level = gameLevels[currentLevel];
    if (level.bomb > 0 && !bombIntroHasBeenSeen) {
        setTimeout(showBombIntroModal, 300);
        return true;
    }
    return false;
}

function showConfirmModal() {
    confirmModal.classList.remove('hidden');
}

function hideConfirmModal() {
    confirmModal.classList.add('hidden');
}

function restartGame() {
    resetStats();
    createBoard();
    hideWinModal();
    hideBombModal();
    hideTimeUpModal();
    hidePauseModal();
    updateModeButtons();
}

function nextLevel() {
    const currentUnlocked = getUnlockedLevelsForMode();
    if (currentLevel < gameLevels.length - 1 && currentUnlocked[currentLevel + 1]) {
        currentLevel++;
        saveCurrentLevelForMode(currentLevel, gameMode);
        updateDifficultyButtons();
        updateBestScoreDisplay();
        restartGame();
        checkAndShowBombIntro();
    }
}

function selectLevel() {
    hideWinModal();
    levelDropdown.classList.toggle('hidden');
}

function toggleLevelDropdown() {
    const isHidden = levelDropdown.classList.contains('hidden');
    if (isHidden) {
        levelDropdownActiveTab = gameMode;
        updateDifficultyButtons();
    }
    levelDropdown.classList.toggle('hidden');
}

function closeLevelDropdown() {
    levelDropdown.classList.add('hidden');
}

function changeLevel(levelIndex) {
    if (levelIndex === currentLevel) return;
    
    const currentUnlocked = getUnlockedLevelsForMode();
    if (!currentUnlocked[levelIndex]) {
        return;
    }
    
    const doChange = () => {
        currentLevel = levelIndex;
        saveCurrentLevelForMode(currentLevel, gameMode);
        updateDifficultyButtons();
        updateBestScoreDisplay();
        restartGame();
        checkAndShowBombIntro();
    };
    
    if (!gameWon && (gameStarted || moves > 0)) {
        showConfirmModal();
        confirmYesBtn.onclick = () => {
            doChange();
            hideConfirmModal();
        };
        confirmNoBtn.onclick = hideConfirmModal;
        confirmYesBtn.textContent = '确定';
        confirmModal.querySelector('h3').textContent = '⚠️ 确认重置';
        confirmModal.querySelector('p').textContent = '当前进度将丢失，确定重置吗？';
    } else {
        doChange();
    }
}

function setGameMode(mode) {
    if (gameMode === mode) return;
    
    const oldMode = gameMode;
    const switchModeLogic = () => {
        saveCurrentLevelForMode(currentLevel, oldMode);
        gameMode = mode;
        saveGameMode();
        const targetUnlocked = getUnlockedLevelsForMode();
        const savedLevelKey = mode === GAME_MODES.TIMED ? STORAGE_KEYS.timedCurrentLevel : STORAGE_KEYS.normalCurrentLevel;
        const savedLevelStr = localStorage.getItem(getStorageKey(savedLevelKey));
        let targetLevel = savedLevelStr !== null ? parseInt(savedLevelStr) : 0;
        if (!targetUnlocked[targetLevel]) {
            targetLevel = getFirstUnlockedLevel(targetUnlocked);
        }
        currentLevel = targetLevel;
        updateModeButtons();
        updateDifficultyButtons();
        updateBestScoreDisplay();
        restartGame();
    };
    
    if (!gameWon && (gameStarted || moves > 0)) {
        showConfirmModal();
        confirmYesBtn.onclick = () => {
            switchModeLogic();
            hideConfirmModal();
        };
        confirmNoBtn.onclick = hideConfirmModal;
        confirmYesBtn.textContent = '确定';
        confirmModal.querySelector('h3').textContent = '⚠️ 确认切换模式';
        confirmModal.querySelector('p').textContent = '当前进度将丢失，确定切换模式吗？';
    } else {
        switchModeLogic();
    }
}

function pauseGame() {
    if (!gameStarted || isPaused || gameWon) return;
    
    isPaused = true;
    stopTimer();
    stopCountdown();
    
    if (pauseMovesEl) pauseMovesEl.textContent = moves;
    if (pausePairsEl) pausePairsEl.textContent = `${matchedPairs}/${regularPairs}`;
    
    if (pauseModal) pauseModal.classList.remove('hidden');
}

function resumeGame() {
    if (!isPaused) return;
    
    isPaused = false;
    if (pauseModal) pauseModal.classList.add('hidden');
    
    if (gameStarted) {
        timer = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
        
        if (gameMode === GAME_MODES.TIMED) {
            countdownTimer = setInterval(() => {
                timeRemaining--;
                updateCountdownDisplay();
                
                if (timeRemaining <= 10 && timeRemaining > 0) {
                    countdownContainer.classList.add('countdown-warning');
                }
                
                if (timeRemaining <= 0) {
                    stopCountdown();
                    stopTimer();
                    showTimeUpModal();
                }
            }, 1000);
        }
    }
}

function hidePauseModal() {
    if (pauseModal) pauseModal.classList.add('hidden');
}
