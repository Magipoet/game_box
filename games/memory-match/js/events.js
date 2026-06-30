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
    
    if (step.action === 'goto-level-select') {
        hideTutorialHighlight();
        hideTutorialArrow();
        stopTimer();
        stopCountdown();
        showLevelSelectScreen(true, true);
        setTimeout(() => {
            currentTutorialStep = 9;
            updateTutorialStep(9);
        }, 200);
        return;
    }
    
    if (step.action === 'click-timed-mode') {
        hideTutorialHighlight();
        hideTutorialArrow();
        tutorialLevelTimedClicked = true;
        
        saveCurrentLevelForMode(currentLevel, gameMode);
        gameMode = GAME_MODES.TIMED;
        saveGameMode();
        currentLevel = 0;
        
        if (levelSelectScreen) levelSelectScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');
        
        resetStats();
        createBoard();
        updateModeButtons();
        updateDifficultyButtons();
        updateBestScoreDisplay();
        updateTotalStarsDisplay();
        updateCurrentLevelStars();
        
        currentTutorialStep = 10;
        updateTutorialStep(10);
        return;
    }
    
    if (step.action === 'timed-mode-demo') {
        hideTutorialHighlight();
        hideTutorialArrow();
        currentTutorialStep = 11;
        updateTutorialStep(11);
        return;
    }
    
    if (step.action === 'back-to-normal-game') {
        hideTutorialHighlight();
        hideTutorialArrow();
        
        gameMode = GAME_MODES.NORMAL;
        saveGameMode();
        currentLevel = 0;
        saveCurrentLevelForMode(currentLevel, gameMode);
        
        stopTimer();
        stopCountdown();
        resetStats();
        createBoard();
        updateModeButtons();
        updateDifficultyButtons();
        updateBestScoreDisplay();
        updateTotalStarsDisplay();
        updateCurrentLevelStars();
        
        currentTutorialStep = 12;
        updateTutorialStep(12);
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
        if (currentTutorialStep === 12) {
            currentTutorialStep = 11;
            
            gameMode = GAME_MODES.TIMED;
            currentLevel = 0;
            resetStats();
            createBoard();
            updateModeButtons();
            updateDifficultyButtons();
            updateBestScoreDisplay();
            updateTotalStarsDisplay();
            updateCurrentLevelStars();
            
            updateTutorialStep(11);
        } else if (currentTutorialStep === 11) {
            currentTutorialStep = 10;
            
            gameMode = GAME_MODES.TIMED;
            currentLevel = 0;
            resetStats();
            createBoard();
            updateModeButtons();
            updateDifficultyButtons();
            updateBestScoreDisplay();
            updateTotalStarsDisplay();
            updateCurrentLevelStars();
            
            updateTutorialStep(10);
        } else if (currentTutorialStep === 10) {
            currentTutorialStep = 9;
            
            stopTimer();
            stopCountdown();
            
            if (gameScreen) gameScreen.classList.add('hidden');
            if (levelSelectScreen) levelSelectScreen.classList.remove('hidden');
            
            levelSelectActiveTab = GAME_MODES.NORMAL;
            updateLevelSelectModeButtons();
            updateLevelSelectTotalStars();
            renderLevelSelectMap();
            
            window.scrollTo({ top: 0, behavior: 'auto' });
            
            setTimeout(() => {
                updateTutorialStep(9);
            }, 150);
        } else if (currentTutorialStep === 9) {
            currentTutorialStep = 8;
            
            gameMode = GAME_MODES.NORMAL;
            currentLevel = 0;
            
            if (levelSelectScreen) levelSelectScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');
            
            resetTutorialBombCards();
            
            setTimeout(() => {
                updateTutorialStep(8);
            }, 100);
        } else if (currentTutorialStep === 8) {
            currentTutorialStep = 7;
            if (gameScreen) gameScreen.classList.remove('hidden');
            if (levelSelectScreen) levelSelectScreen.classList.add('hidden');
            resetTutorialBombCards();
            updateTutorialStep(7);
        } else if (currentTutorialStep === 7) {
            currentTutorialStep = 6;
            resetTutorialBombCards();
            updateTutorialStep(6);
        } else if (currentTutorialStep === 6) {
            currentTutorialStep = 5;
            updateTutorialStep(5);
        } else if (currentTutorialStep >= 4 && currentTutorialStep <= 5) {
            currentTutorialStep = 3;
            resetTutorialMismatchCards();
            updateTutorialStep(3);
        } else if (currentTutorialStep >= 2 && currentTutorialStep <= 3) {
            currentTutorialStep = 1;
            resetTutorialMatchCards();
            updateTutorialStep(1);
        } else if (currentTutorialStep === 1) {
            currentTutorialStep = 0;
            stopTimer();
            stopCountdown();
            if (gameScreen) gameScreen.classList.add('hidden');
            if (levelSelectScreen) levelSelectScreen.classList.remove('hidden');
            levelSelectActiveTab = GAME_MODES.NORMAL;
            updateLevelSelectModeButtons();
            updateLevelSelectTotalStars();
            renderLevelSelectMap();
            window.scrollTo({ top: 0, behavior: 'auto' });
            resetTutorialCards();
            setTimeout(() => { updateTutorialStep(0); }, 150);
        } else {
            currentTutorialStep--;
            updateTutorialStep(currentTutorialStep);
        }
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
            if (gameScreen) gameScreen.classList.remove('hidden');
            if (levelSelectScreen) levelSelectScreen.classList.add('hidden');
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
            
            if (step.action === 'goto-level-select' || step.action === 'click-timed-mode' || step.action === 'click-normal-mode' || step.action === 'timed-mode-demo') {
                return;
            }
            
            if (step.action === 'free-play') {
                endTutorial();
            } else {
                tutorialNextBtn.click();
            }
        }
    }
});

if (levelModeNormalBtn) levelModeNormalBtn.addEventListener('click', () => {
    if (typeof isTutorialActive !== 'undefined' && isTutorialActive && typeof currentTutorialStep !== 'undefined') {
        if (currentTutorialStep === 10) {
            tutorialLevelNormalClicked = true;
            switchLevelSelectMode(GAME_MODES.NORMAL);
            playSound('match');
            setTimeout(() => {
                currentTutorialStep = 11;
                updateTutorialStep(11);
            }, 300);
            return;
        }
    }
    switchLevelSelectMode(GAME_MODES.NORMAL);
});
if (levelModeTimedBtn) levelModeTimedBtn.addEventListener('click', () => {
    if (typeof isTutorialActive !== 'undefined' && isTutorialActive && typeof currentTutorialStep !== 'undefined') {
        if (currentTutorialStep === 9) {
            tutorialLevelTimedClicked = true;
            playSound('match');
            
            saveCurrentLevelForMode(currentLevel, gameMode);
            gameMode = GAME_MODES.TIMED;
            saveGameMode();
            currentLevel = 0;
            
            if (levelSelectScreen) levelSelectScreen.classList.add('hidden');
            if (gameScreen) gameScreen.classList.remove('hidden');
            
            resetStats();
            createBoard();
            updateModeButtons();
            updateDifficultyButtons();
            updateBestScoreDisplay();
            updateTotalStarsDisplay();
            updateCurrentLevelStars();
            
            currentTutorialStep = 10;
            updateTutorialStep(10);
            return;
        }
    }
    switchLevelSelectMode(GAME_MODES.TIMED);
});
if (backToLevelsBtn) backToLevelsBtn.addEventListener('click', () => {
    if (typeof isTutorialActive !== 'undefined' && isTutorialActive) {
        if (typeof currentTutorialStep !== 'undefined' && currentTutorialStep === 8) {
            stopTimer();
            stopCountdown();
            showLevelSelectScreen(true, true);
            setTimeout(() => {
                currentTutorialStep = 9;
                updateTutorialStep(9);
            }, 200);
            return;
        }
        return;
    }
    const doBack = () => {
        stopTimer();
        stopCountdown();
        showLevelSelectScreen();
    };
    if (!gameWon && (gameStarted || moves > 0)) {
        showConfirmModal();
        confirmYesBtn.onclick = () => {
            doBack();
            hideConfirmModal();
        };
        confirmNoBtn.onclick = hideConfirmModal;
        confirmYesBtn.textContent = '确定';
        confirmModal.querySelector('h3').textContent = '⚠️ 确认返回';
        confirmModal.querySelector('p').textContent = '当前进度将丢失，确定返回关卡选择吗？';
    } else {
        doBack();
    }
});
if (levelSelectSoundBtn) levelSelectSoundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem(getStorageKey(STORAGE_KEYS.sound), soundEnabled);
    updateLevelSelectSoundButton();
    if (soundBtn) soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
    if (soundEnabled) playSound('click');
});
if (levelSelectSettingsBtn) levelSelectSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    switchSettingsTab('basic');
});
if (levelSelectHelpBtn) levelSelectHelpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
});

const staminaCloseBtn = document.getElementById('stamina-close-btn');
if (staminaCloseBtn) {
    staminaCloseBtn.addEventListener('click', hideStaminaInsufficientModal);
}

if (staminaInsufficientModal) {
    staminaInsufficientModal.addEventListener('click', (e) => {
        if (e.target === staminaInsufficientModal) {
            hideStaminaInsufficientModal();
        }
    });
    
    setInterval(() => {
        if (!staminaInsufficientModal.classList.contains('hidden')) {
            if (staminaRecoverTimeText) {
                staminaRecoverTimeText.textContent = getStaminaRecoverTimeText();
            }
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', initGame);
