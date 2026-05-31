restartBtn.addEventListener('click', () => {
    if (gameStarted || moves > 0) {
        showConfirmModal();
        confirmYesBtn.onclick = () => {
            restartGame();
            hideConfirmModal();
        };
        confirmNoBtn.onclick = hideConfirmModal;
        confirmYesBtn.textContent = '确定';
        confirmModal.querySelector('h3').textContent = '⚠️ 确认重置';
        confirmModal.querySelector('p').textContent = '当前进度将丢失，确定重置吗？';
    } else {
        restartGame();
    }
});

resetProgressBtn.addEventListener('click', () => {
    resetProgressModal.classList.remove('hidden');
});

resetCurrentBtn.addEventListener('click', () => {
    resetCurrentLevelProgress();
    updateDifficultyButtons();
    updateBestScoreDisplay();
    restartGame();
    resetProgressModal.classList.add('hidden');
});

resetAllBtn.addEventListener('click', () => {
    resetAllProgress();
    updateDifficultyButtons();
    updateBestScoreDisplay();
    restartGame();
    resetProgressModal.classList.add('hidden');
});

resetCancelBtn.addEventListener('click', () => {
    resetProgressModal.classList.add('hidden');
});

playAgainBtn.addEventListener('click', restartGame);
nextLevelBtn.addEventListener('click', nextLevel);
selectLevelBtn.addEventListener('click', selectLevel);
closeWinModalBtn.addEventListener('click', hideWinModal);

const closeBombModalBtn = document.getElementById('close-bomb-modal');
const bombRetryBtn = document.getElementById('bomb-retry-btn');
const bombCloseBtn = document.getElementById('bomb-close-btn');
if (closeBombModalBtn) closeBombModalBtn.addEventListener('click', hideBombModal);
if (bombRetryBtn) bombRetryBtn.addEventListener('click', () => { hideBombModal(); restartGame(); });
if (bombCloseBtn) bombCloseBtn.addEventListener('click', hideBombModal);

const closeTimeUpModalBtn = document.getElementById('close-time-up-modal');
const timeupRetryBtn = document.getElementById('timeup-retry-btn');
const timeupCloseBtn = document.getElementById('timeup-close-btn');
if (closeTimeUpModalBtn) closeTimeUpModalBtn.addEventListener('click', hideTimeUpModal);
if (timeupRetryBtn) timeupRetryBtn.addEventListener('click', () => { hideTimeUpModal(); restartGame(); });
if (timeupCloseBtn) timeupCloseBtn.addEventListener('click', hideTimeUpModal);

if (modeNormalBtn) modeNormalBtn.addEventListener('click', (e) => {
    if (isTutorialActive) {
        e.stopPropagation();
        return;
    }
    setGameMode(GAME_MODES.NORMAL);
});
if (modeTimedBtn) modeTimedBtn.addEventListener('click', (e) => {
    if (isTutorialActive) {
        handleTutorialTimedModeClick();
        e.stopPropagation();
        return;
    }
    setGameMode(GAME_MODES.TIMED);
});

if (pauseBtn) pauseBtn.addEventListener('click', pauseGame);
if (resumeBtn) resumeBtn.addEventListener('click', resumeGame);
if (pauseRestartBtn) pauseRestartBtn.addEventListener('click', () => { hidePauseModal(); restartGame(); });

if (closeBombIntroModalBtn) closeBombIntroModalBtn.addEventListener('click', () => {
    hideBombIntroModal();
    markBombIntroAsSeen();
});
if (bombIntroCloseBtn) bombIntroCloseBtn.addEventListener('click', () => {
    hideBombIntroModal();
    markBombIntroAsSeen();
});

const tutorialBombModal = document.getElementById('tutorial-bomb-modal');
const tutorialBombCloseBtn = document.getElementById('tutorial-bomb-close-btn');
if (tutorialBombCloseBtn) {
    tutorialBombCloseBtn.addEventListener('click', () => {
        if (tutorialBombModal) {
            tutorialBombModal.classList.add('hidden');
        }
        const guideContent = document.querySelector('.tutorial-guide-content');
        if (guideContent) {
            guideContent.classList.remove('hidden');
        }
        if (isTutorialActive && currentTutorialStep === 7) {
            resetAllCardsForBombDemo();
            currentTutorialStep = 8;
            updateTutorialStep(8);
        }
    });
}

levelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLevelDropdown();
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.level-selector')) {
        closeLevelDropdown();
    }
});

helpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
});

helpCloseBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

closeHelpModalBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    switchSettingsTab('basic');
});

closeSettingsModalBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

themeItems.forEach(item => {
    item.addEventListener('click', () => {
        const themeName = item.dataset.theme;
        setTheme(themeName);
    });
});

if (soundBtn) {
    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem(getStorageKey(STORAGE_KEYS.sound), soundEnabled);
        soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
        if (soundEnabled) playSound('click');
    });
}

settingsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        switchSettingsTab(tab.dataset.tab);
    });
});

tutorialStartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startTutorial();
});

tutorialSkipBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    hideTutorialModal();
    markTutorialAsSeen();
});

showTutorialBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsModal.classList.add('hidden');
    startTutorial();
});

tutorialNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const step = tutorialSteps[currentTutorialStep];
    
    if (step.action === 'free-play') {
        endTutorial();
        return;
    }
    
    if (step.action === 'wait-flip-match-1') {
        hideTutorialHighlight();
        hideTutorialArrow();
        autoFlipCard(tutorialMatchCard1, 0);
        currentTutorialStep++;
        updateTutorialStep(currentTutorialStep);
        return;
    }
    
    if (step.action === 'wait-flip-match-2') {
        hideTutorialHighlight();
        hideTutorialArrow();
        autoFlipCard(tutorialMatchCard2, 4);
        tutorialMatchedSuccess = true;
        setTimeout(() => {
            currentTutorialStep++;
            updateTutorialStep(currentTutorialStep);
        }, 1000);
        return;
    }
    
    if (step.action === 'show-match-success') {
        hideTutorialHighlight();
        hideTutorialArrow();
        if (!firstCard || firstCard.id !== 1) {
            autoFlipCard(tutorialMismatchCard1, 1);
        }
        currentTutorialStep = 4;
        updateTutorialStep(4);
        return;
    }
    
    if (step.action === 'wait-flip-mismatch-2') {
        hideTutorialHighlight();
        hideTutorialArrow();
        autoFlipCard(tutorialMismatchCard2, 3);
        tutorialMismatchedSuccess = true;
        setTimeout(() => {
            currentTutorialStep = 5;
            updateTutorialStep(5);
        }, 1000);
        return;
    }
    
    if (step.action === 'wait-flip-bomb-1') {
        hideTutorialHighlight();
        hideTutorialArrow();
        autoFlipCard(tutorialBombCard1, 2);
        tutorialBombShown = true;
        currentTutorialStep = 7;
        updateTutorialStep(7);
        return;
    }
    
    if (step.action === 'wait-flip-bomb-2') {
        hideTutorialHighlight();
        hideTutorialArrow();
        autoFlipCard(tutorialBombCard2, 5);
        
        return;
    }
    
    if (step.action === 'wait-timed-mode-click') {
        hideTutorialHighlight();
        hideTutorialArrow();
        handleTutorialTimedModeClick();
        
        return;
    }
    
    if (step.action === 'wait-timed-card-click') {
        handleTutorialTimedNextClick();
        
        return;
    }
    
    if (currentTutorialStep < tutorialSteps.length - 1) {
        currentTutorialStep++;
        updateTutorialStep(currentTutorialStep);
    }
});

tutorialPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentTutorialStep > 0) {
        if (currentTutorialStep === 10) {
            currentTutorialStep = 9;
        } else if (currentTutorialStep === 9) {
            currentTutorialStep = 8;
            clearTutorialTimedDemoTimer();
            tutorialTimedModeActive = false;
            tutorialTimedCardClicked = false;
            gameMode = GAME_MODES.NORMAL;
            saveGameMode();
            stopCountdown();
            updateModeButtons();
            timeRemaining = 0;
            if (countdownDisplay) countdownDisplay.textContent = '00:00';
            resetTutorialMatchCards();
        } else if (currentTutorialStep === 8) {
            currentTutorialStep = 7;
            resetTutorialBombCards();
        } else if (currentTutorialStep === 7) {
            currentTutorialStep = 6;
            resetTutorialBombCards();
        } else if (currentTutorialStep === 6) {
            currentTutorialStep = 5;
        } else if (currentTutorialStep >= 4 && currentTutorialStep <= 5) {
            currentTutorialStep = 3;
            resetTutorialMismatchCards();
        } else if (currentTutorialStep >= 2 && currentTutorialStep <= 3) {
            currentTutorialStep = 1;
            resetTutorialMatchCards();
        } else if (currentTutorialStep === 1) {
            currentTutorialStep = 0;
            resetTutorialCards();
        } else {
            currentTutorialStep--;
        }
        
        updateTutorialStep(currentTutorialStep);
    }
});

document.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.classList.add('hidden');
    }
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
    const bombModal = document.getElementById('bomb-modal');
    if (e.target === bombModal) {
        bombModal.classList.add('hidden');
    }
    if (e.target === timeUpModal) {
        hideTimeUpModal();
    }
    if (e.target === pauseModal) {
        resumeGame();
    }
    if (e.target === resetProgressModal) {
        resetProgressModal.classList.add('hidden');
    }
    if (e.target === bombIntroModal) {
        hideBombIntroModal();
        markBombIntroAsSeen();
    }
    if (e.target === tutorialModal) {
        hideTutorialModal();
        markTutorialAsSeen();
    }
    const tutorialBombModalEl = document.getElementById('tutorial-bomb-modal');
    if (e.target === tutorialBombModalEl) {
        tutorialBombModalEl.classList.add('hidden');
        const guideContent = document.querySelector('.tutorial-guide-content');
        if (guideContent) {
            guideContent.classList.remove('hidden');
        }
        if (isTutorialActive && currentTutorialStep === 7) {
            resetAllCardsForBombDemo();
            currentTutorialStep = 8;
            updateTutorialStep(8);
        }
    }
    
    if (isTutorialActive) {
        const step = tutorialSteps[currentTutorialStep];
        if (step.showNext) {
            if (e.target === tutorialPrevBtn) return;
            if (e.target === tutorialNextBtn) return;
            if (e.target.closest('.tutorial-guide-buttons')) return;
            if (e.target.closest('.card')) return;
            if (e.target.closest('.modal')) return;
            if (e.target.closest('.mode-btn')) return;
            
            if (step.action === 'free-play') {
                endTutorial();
            } else {
                tutorialNextBtn.click();
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', initGame);
