function showTutorialModal() {
    tutorialModal.classList.remove('hidden');
}

function hideTutorialModal() {
    tutorialModal.classList.add('hidden');
}

function markTutorialAsSeen() {
    tutorialHasBeenSeen = true;
    localStorage.setItem(getStorageKey(STORAGE_KEYS.tutorialSeen), 'true');
}

function checkAndShowTutorial() {
    if (!tutorialHasBeenSeen) {
        setTimeout(showTutorialModal, 300);
        return true;
    }
    return false;
}

const tutorialSteps = [
    {
        title: '🎮 欢迎来到记忆配对游戏！',
        text: '游戏目标是将所有相同图案的卡片配对完成即可通关。让我带你一步步了解如何操作。请点击下方高亮的"第1关"进入游戏开始教程。',
        action: 'select-level-1',
        showNext: false,
        position: 'center'
    },
    {
        title: '👆 第一步：点击卡片',
        text: '点击下面高亮的卡片可以翻开它查看背面的图案。点击"下一步"按钮，我将为你演示翻牌效果。',
        action: 'wait-flip-match-1',
        showNext: true,
        position: 'top'
    },
    {
        title: '👀 很好！看到图案了',
        text: '你已经看到了翻开的卡片图案。接下来需要找到另一张相同图案的卡片进行配对。点击"下一步"按钮，我将为你演示配对效果。',
        action: 'wait-flip-match-2',
        showNext: true,
        position: 'top'
    },
    {
        title: '✅ 太棒了！配对成功！',
        text: '两张卡片图案相同，它们保持翻开状态！这就是配对成功的效果。现在请点击下面高亮的卡片，来体验配对失败的效果。',
        action: 'show-match-success',
        showNext: true,
        position: 'top'
    },
    {
        title: '🔄 再点击另一张不同的卡片',
        text: '这张卡片和刚才的卡片图案不同。点击"下一步"按钮，看看配对失败会发生什么！',
        action: 'wait-flip-mismatch-2',
        showNext: true,
        position: 'top'
    },
    {
        title: '💡 配对失败会怎样？',
        text: '两张卡片图案不同，它们会在1秒后自动翻回去。记住卡片的位置很重要哦！',
        action: 'show-mismatch-result',
        showNext: true,
        position: 'top'
    },
    {
        title: '💣 炸弹卡片说明',
        text: '从第9关开始，游戏中会出现💣炸弹卡片。请点击下面高亮的炸弹卡片，我们来看看翻开两张炸弹会发生什么！',
        action: 'wait-flip-bomb-1',
        showNext: true,
        position: 'top'
    },
    {
        title: '💣 再点击另一张炸弹卡片',
        text: '请点击箭头指向的另一张炸弹卡片，看看翻开两张炸弹会发生什么！',
        action: 'wait-flip-bomb-2',
        showNext: true,
        position: 'top'
    },
    {
        title: '⏱️ 限时模式介绍',
        text: '游戏提供两种模式：常规模式和限时模式。让我带你去关卡选择界面体验模式切换的效果。请点击左上角高亮的"关卡选择"按钮。',
        action: 'goto-level-select',
        showNext: true,
        position: 'top'
    },
    {
        title: '⏱️ 体验限时模式',
        text: '你现在在关卡选择界面。请点击顶部高亮的"限时模式"按钮，我们将进入限时模式的第1关，让你直观感受限时模式的玩法！',
        action: 'click-timed-mode',
        showNext: true,
        position: 'top'
    },
    {
        title: '⏱️ 限时模式体验',
        text: '很棒！你已经进入了限时模式的第1关。注意顶部的倒计时，这就是限时模式的特点——你需要在规定时间内完成所有配对。剩余时间还会按比例奖励步数减免哦！现在请找出所有相同图案的卡片进行配对，完成这一关后我们再继续。或者点击"下一步"按钮直接进入下一环节。',
        action: 'timed-mode-demo',
        showNext: true,
        position: 'top'
    },
    {
        title: '⏱️ 返回常规模式',
        text: '限时模式是不是很有挑战性？现在让我们回到常规模式继续游戏。点击"下一步"返回常规模式的游戏界面。',
        action: 'back-to-normal-game',
        showNext: true,
        position: 'center'
    },
    {
        title: '🎯 开始游戏！',
        text: '你已经掌握了所有规则！现在请找出所有相同图案的卡片进行配对，避开炸弹卡片，完成第一关吧。完成所有配对后教程会自动结束。祝你好运！',
        action: 'free-play',
        showNext: true,
        position: 'center'
    }
];

function showTutorialGuide() {
    tutorialGuide.classList.remove('hidden');
    resetTutorialGuideInlineStyles();
    updateTutorialGuidePosition('center');
}

function hideTutorialGuide() {
    tutorialGuide.classList.add('hidden');
    hideTutorialHighlight();
    hideTutorialArrow();
}

function showTutorialHighlight(element) {
    const rect = element.getBoundingClientRect();
    tutorialHighlight.style.left = rect.left + 'px';
    tutorialHighlight.style.top = rect.top + 'px';
    tutorialHighlight.style.width = rect.width + 'px';
    tutorialHighlight.style.height = rect.height + 'px';
    tutorialHighlight.classList.remove('hidden');
}

function hideTutorialHighlight() {
    tutorialHighlight.classList.add('hidden');
}

function showTutorialArrow(element, position = 'top') {
    const rect = element.getBoundingClientRect();
    if (position === 'top') {
        tutorialArrow.style.left = (rect.left + rect.width / 2 - 20) + 'px';
        tutorialArrow.style.top = (rect.top - 50) + 'px';
        tutorialArrow.textContent = '👇';
    } else if (position === 'bottom') {
        tutorialArrow.style.left = (rect.left + rect.width / 2 - 20) + 'px';
        tutorialArrow.style.top = (rect.bottom + 10) + 'px';
        tutorialArrow.textContent = '👆';
    } else if (position === 'left') {
        tutorialArrow.style.left = (rect.left - 50) + 'px';
        tutorialArrow.style.top = (rect.top + rect.height / 2 - 20) + 'px';
        tutorialArrow.textContent = '👉';
    } else if (position === 'right') {
        tutorialArrow.style.left = (rect.right + 10) + 'px';
        tutorialArrow.style.top = (rect.top + rect.height / 2 - 20) + 'px';
        tutorialArrow.textContent = '👈';
    }
    tutorialArrow.classList.remove('hidden');
}

function hideTutorialArrow() {
    tutorialArrow.classList.add('hidden');
}

function updateTutorialGuidePosition(position) {
    const content = tutorialGuide.querySelector('.tutorial-guide-content');
    content.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right', 'position-center');
    content.classList.add(`position-${position}`);

    if (position === 'center') {
        content.style.left = '50%';
        content.style.top = '50%';
        content.style.transform = 'translate(-50%, -50%)';
        content.style.maxWidth = '400px';
        content.style.minWidth = '260px';
        content.style.right = 'auto';
        content.style.bottom = 'auto';
    }
}

function resetTutorialGuideInlineStyles() {
    const content = tutorialGuide.querySelector('.tutorial-guide-content');
    content.style.left = '';
    content.style.right = '';
    content.style.top = '';
    content.style.bottom = '';
    content.style.width = '';
    content.style.maxWidth = '';
    content.style.minWidth = '';
    content.style.transform = '';
}

function updateTutorialGuidePositionNearElement(targetElement, preferredSide = null) {
    if (!targetElement) {
        updateTutorialGuidePosition('center');
        return;
    }

    const content = tutorialGuide.querySelector('.tutorial-guide-content');
    const rect = targetElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const elementCenterY = rect.top + rect.height / 2;
    const elementCenterX = rect.left + rect.width / 2;

    let referenceRect = null;
    const levelSelectVisible = levelSelectScreen && !levelSelectScreen.classList.contains('hidden');
    const gameScreenVisible = gameScreen && !gameScreen.classList.contains('hidden');
    
    if (gameScreenVisible && gameBoard) {
        const boardRect = gameBoard.getBoundingClientRect();
        if (boardRect.width > 0 && boardRect.height > 0) {
            referenceRect = boardRect;
        }
    }
    if (!referenceRect && levelSelectVisible && levelSelectScreen) {
        const lsRect = levelSelectScreen.getBoundingClientRect();
        if (lsRect.width > 0 && lsRect.height > 0) {
            referenceRect = lsRect;
        }
    }
    if (!referenceRect) {
        referenceRect = {
            left: 0,
            right: viewportWidth,
            top: 0,
            bottom: viewportHeight,
            width: viewportWidth,
            height: viewportHeight
        };
    }

    const tmpDisplay = content.style.display;
    content.style.visibility = 'hidden';
    content.style.display = 'block';
    resetTutorialGuideInlineStyles();
    const contentHeight = content.offsetHeight || 220;
    const contentWidth = content.offsetWidth || 300;
    content.style.display = tmpDisplay;
    content.style.visibility = '';

    const minCardWidth = 240;
    const gap = 12;

    let position;
    const topSpace = rect.top;
    const bottomSpace = viewportHeight - rect.bottom;
    const leftSpace = referenceRect.left;
    const rightSpace = viewportWidth - referenceRect.right;
    const canLeft = leftSpace >= contentWidth + gap * 2;
    const canRight = rightSpace >= contentWidth + gap * 2;
    const canTop = topSpace >= contentHeight + gap + 20;
    const canBottom = bottomSpace >= contentHeight + gap + 20;

    if (preferredSide) {
        let sideOk = true;
        if (preferredSide === 'top' && !canTop) sideOk = false;
        if (preferredSide === 'bottom' && !canBottom) sideOk = false;
        if (preferredSide === 'left' && !canLeft) sideOk = false;
        if (preferredSide === 'right' && !canRight) sideOk = false;
        if (sideOk) {
            position = preferredSide;
        } else {
            if (preferredSide === 'top' && canBottom) {
                position = 'bottom';
            } else if (preferredSide === 'bottom' && canTop) {
                position = 'top';
            } else if (preferredSide === 'left' && canRight) {
                position = 'right';
            } else if (preferredSide === 'right' && canLeft) {
                position = 'left';
            } else if (canBottom) {
                position = 'bottom';
            } else if (canTop) {
                position = 'top';
            } else if (canLeft) {
                position = 'left';
            } else if (canRight) {
                position = 'right';
            } else {
                position = 'center';
            }
        }
    } else {

        if (elementCenterX < viewportWidth * 0.4 && canLeft) {
            position = 'left';
        } else if (elementCenterX > viewportWidth * 0.6 && canRight) {
            position = 'right';
        } else if (elementCenterY > viewportHeight * 0.55 && canTop) {
            position = 'top';
        } else if (elementCenterY < viewportHeight * 0.45 && canBottom) {
            position = 'bottom';
        } else if (canBottom) {
            position = 'bottom';
        } else if (canTop) {
            position = 'top';
        } else if (canLeft) {
            position = 'left';
        } else if (canRight) {
            position = 'right';
        } else {
            position = 'center';
        }
    }

    updateTutorialGuidePosition(position);

    if (position === 'left') {
        const availableWidth = rect.left - gap * 2;
        const actualWidth = Math.min(320, Math.max(minCardWidth, availableWidth));
        const minViewportMargin = 8;
        content.style.left = Math.max(minViewportMargin, rect.left - actualWidth - gap) + 'px';
        content.style.top = (rect.top + rect.height / 2) + 'px';
        content.style.transform = 'translateY(-50%)';
        content.style.maxWidth = actualWidth + 'px';
        content.style.minWidth = Math.min(minCardWidth, actualWidth) + 'px';
        content.style.right = 'auto';
        content.style.bottom = 'auto';
    } else if (position === 'right') {
        const availableWidth = viewportWidth - rect.right - gap * 2;
        const actualWidth = Math.min(320, Math.max(minCardWidth, availableWidth));
        const minViewportMargin = 8;
        const maxLeft = viewportWidth - actualWidth - minViewportMargin;
        content.style.left = Math.min(rect.right + gap, maxLeft) + 'px';
        content.style.top = (rect.top + rect.height / 2) + 'px';
        content.style.transform = 'translateY(-50%)';
        content.style.maxWidth = actualWidth + 'px';
        content.style.minWidth = Math.min(minCardWidth, actualWidth) + 'px';
        content.style.right = 'auto';
        content.style.bottom = 'auto';
    } else if (position === 'top') {
        let topReferenceRect = referenceRect;
        if (levelSelectVisible) {
            const lsRect = levelSelectScreen.getBoundingClientRect();
            if (lsRect.width > 0 && lsRect.height > 0) {
                topReferenceRect = lsRect;
            }
        }
        content.style.left = (rect.left + rect.width / 2) + 'px';
        const arrowHeight = 50;
        const cardExtraSpace = 30;
        const safeTop = Math.max(30, topReferenceRect.top - contentHeight - 20);
        const elementTop = rect.top - arrowHeight - cardExtraSpace - contentHeight;
        content.style.top = Math.min(safeTop, elementTop) + 'px';
        content.style.transform = 'translateX(-50%)';
        content.style.maxWidth = '380px';
        content.style.minWidth = '240px';
        content.style.right = 'auto';
        content.style.bottom = 'auto';
    } else if (position === 'bottom') {
        content.style.left = (rect.left + rect.width / 2) + 'px';
        let targetTop = rect.bottom + gap + 6;
        const bottomBound = viewportHeight - contentHeight - gap;
        if (targetTop > bottomBound) {
            targetTop = Math.max(gap, bottomBound);
        }
        content.style.top = targetTop + 'px';
        content.style.transform = 'translateX(-50%)';
        content.style.maxWidth = '380px';
        content.style.minWidth = '240px';
        content.style.right = 'auto';
        content.style.bottom = 'auto';
    } else if (position === 'center') {
        content.style.left = '50%';
        content.style.top = '50%';
        content.style.transform = 'translate(-50%, -50%)';
        content.style.maxWidth = '400px';
        content.style.minWidth = '260px';
        content.style.right = 'auto';
        content.style.bottom = 'auto';
    }
}

function updateTutorialStep(stepIndex) {
    clearTutorialAutoAdvanceTimer();
    
    const step = tutorialSteps[stepIndex];
    tutorialGuideTitle.textContent = step.title;
    tutorialGuideText.textContent = step.text;
    
    resetTutorialGuideInlineStyles();
    
    stepDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === stepIndex);
    });
    
    tutorialPrevBtn.classList.toggle('hidden', stepIndex === 0);
    
    if (step.showNext) {
        tutorialNextBtn.classList.remove('hidden');
    } else {
        tutorialNextBtn.classList.add('hidden');
    }
    
    if (stepIndex === tutorialSteps.length - 1) {
        tutorialNextBtn.textContent = '完成教程';
    } else {
        tutorialNextBtn.textContent = '下一步';
    }
    
    executeTutorialAction(stepIndex);
}

function executeTutorialAction(stepIndex) {
    const step = tutorialSteps[stepIndex];
    
    hideTutorialHighlight();
    hideTutorialArrow();
    
    if (step.action === 'wait-flip-match-1') {
        if (tutorialMatchCard1) {
            showTutorialHighlight(tutorialMatchCard1);
            showTutorialArrow(tutorialMatchCard1, 'top');
            updateTutorialGuidePositionNearElement(tutorialMatchCard1);
        }
    }
    
    if (step.action === 'wait-flip-match-2') {
        if (tutorialMatchCard2) {
            showTutorialHighlight(tutorialMatchCard2);
            showTutorialArrow(tutorialMatchCard2, 'top');
            updateTutorialGuidePositionNearElement(tutorialMatchCard2);
        }
    }
    
    if (step.action === 'show-match-success') {
        if (tutorialMismatchCard1) {
            showTutorialHighlight(tutorialMismatchCard1);
            showTutorialArrow(tutorialMismatchCard1, 'top');
            updateTutorialGuidePositionNearElement(tutorialMismatchCard1);
        }
    }
    
    if (step.action === 'wait-flip-mismatch-2') {
        if (tutorialMismatchCard2) {
            showTutorialHighlight(tutorialMismatchCard2);
            showTutorialArrow(tutorialMismatchCard2, 'top');
            updateTutorialGuidePositionNearElement(tutorialMismatchCard2);
        }
    }
    
    if (step.action === 'wait-flip-bomb-1') {
        resetAllCardsForBombDemo();
        if (tutorialBombCard1) {
            showTutorialHighlight(tutorialBombCard1);
            showTutorialArrow(tutorialBombCard1, 'top');
            updateTutorialGuidePositionNearElement(tutorialBombCard1);
        }
    }
    
    if (step.action === 'wait-flip-bomb-2') {
        if (tutorialBombCard1 && tutorialBombCard2) {
            if (!cards[2].flipped || !firstCard || firstCard.id !== 2) {
                resetAllCardsForBombDemo();
                tutorialBombCard1.classList.add('flipped');
                cards[2].flipped = true;
                firstCard = { element: tutorialBombCard1, ...cards[2] };
            }
            
            showTutorialHighlight(tutorialBombCard2);
            showTutorialArrow(tutorialBombCard2, 'top');
            updateTutorialGuidePositionNearElement(tutorialBombCard2);
        }
    }
    
    if (step.action === 'goto-level-select') {
        if (backToLevelsBtn) {
            showTutorialHighlight(backToLevelsBtn);
            showTutorialArrow(backToLevelsBtn, 'bottom');
            updateTutorialGuidePositionNearElement(backToLevelsBtn, 'bottom');
        }
    }
    
    if (step.action === 'click-timed-mode') {
        if (levelModeTimedBtn) {
            showTutorialHighlight(levelModeTimedBtn);
            showTutorialArrow(levelModeTimedBtn, 'bottom');
            updateTutorialGuidePositionNearElement(levelModeTimedBtn, 'bottom');
        }
    }
    
    if (step.action === 'timed-mode-demo') {
        if (gameBoard) {
            updateTutorialGuidePositionNearElement(gameBoard, 'left');
        } else {
            updateTutorialGuidePosition('center');
        }
    }
    
    if (step.action === 'back-to-normal-game') {
        updateTutorialGuidePosition('center');
    }
    
    if (step.action === 'free-play' || step.action === 'show-mismatch-result') {
        updateTutorialGuidePosition('center');
    }
    
    if (step.action === 'select-level-1') {
        const levelNode = levelSelectMap.querySelector('.level-node[data-level="0"]');
        if (levelNode) {
            showTutorialHighlight(levelNode);
            showTutorialArrow(levelNode, 'bottom');
            updateTutorialGuidePositionNearElement(levelNode, 'top');
        } else {
            updateTutorialGuidePosition('center');
        }
    }
    
    if (step.action === 'show-mismatch-result') {
        clearTutorialAutoAdvanceTimer();
        tutorialAutoAdvanceTimer = setTimeout(() => {
            if (isTutorialActive && currentTutorialStep === stepIndex) {
                currentTutorialStep = 6;
                updateTutorialStep(6);
            }
        }, 2500);
    }
}

function clearTutorialAutoAdvanceTimer() {
    if (tutorialAutoAdvanceTimer) {
        clearTimeout(tutorialAutoAdvanceTimer);
        tutorialAutoAdvanceTimer = null;
    }
}

function startTutorial() {
    hideTutorialModal();
    
    if (levelSelectScreen) levelSelectScreen.classList.remove('hidden');
    if (gameScreen) gameScreen.classList.add('hidden');
    
    gameMode = GAME_MODES.NORMAL;
    saveGameMode();
    stopCountdown();
    levelSelectActiveTab = GAME_MODES.NORMAL;
    updateModeButtons();
    updateLevelSelectModeButtons();
    updateLevelSelectTotalStars();
    updateStaminaDisplay();
    renderLevelSelectMap();
    
    currentLevel = 0;
    unlockedLevels = { 0: true };
    saveProgress();
    
    clearTutorialAutoAdvanceTimer();
    
    isTutorialActive = true;
    currentTutorialStep = 0;
    tutorialCards = [];
    tutorialFirstCard = null;
    tutorialSecondCard = null;
    tutorialMatchCard1 = null;
    tutorialMatchCard2 = null;
    tutorialMismatchCard1 = null;
    tutorialMismatchCard2 = null;
    tutorialBombCard1 = null;
    tutorialBombCard2 = null;
    tutorialMatchedSuccess = false;
    tutorialMismatchedSuccess = false;
    tutorialBombShown = false;
    tutorialLevelTimedClicked = false;
    tutorialLevelNormalClicked = false;
    
    tutorialGuide.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
    updateTutorialStep(0);
}

function createTutorialBoard() {
    const level = gameLevels[0];
    const totalCards = level.rows * level.cols;
    regularPairs = level.pairs - 1;
    
    gameBoard.innerHTML = '';
    gameBoard.className = 'game-board';
    gameBoard.style.gridTemplateColumns = `repeat(${level.cols}, minmax(auto, 150px))`;
    
    cards = [];
    const emojis = cardEmojis.slice(0, regularPairs + 1);
    const regularCardPairs = [...emojis.slice(0, regularPairs), ...emojis.slice(0, regularPairs)];
    const bombCardPairs = ['💣', '💣'];
    const cardPairs = [...regularCardPairs, ...bombCardPairs];
    
    const tutorialEmoji1 = emojis[0];
    const tutorialEmoji2 = emojis[1];
    const tutorialEmoji3 = emojis[2];
    const fixedTutorialCards = [
        tutorialEmoji1, tutorialEmoji2, '💣', tutorialEmoji3, tutorialEmoji1, '💣'
    ];
    for (let i = 0; i < fixedTutorialCards.length; i++) {
        cardPairs[i] = fixedTutorialCards[i];
    }
    
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

function setupTutorialCards() {
    const cardElements = document.querySelectorAll('.card');
    if (cardElements.length >= 6) {
        tutorialMatchCard1 = cardElements[0];
        tutorialMatchCard2 = cardElements[4];
        tutorialMismatchCard1 = cardElements[1];
        tutorialMismatchCard2 = cardElements[3];
        tutorialBombCard1 = cardElements[2];
        tutorialBombCard2 = cardElements[5];
    }
}

function resetTutorialCards() {
    clearTutorialAutoAdvanceTimer();
    
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(card => {
        card.classList.remove('flipped', 'matched', 'bomb-explode');
    });
    cards.forEach(card => {
        card.flipped = false;
        card.matched = false;
    });
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    moves = 0;
    misses = 0;
    stopTimer();
    seconds = 0;
    gameStarted = false;
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '00:00';
    pairsDisplay.textContent = `0/${regularPairs}`;
    tutorialMatchedSuccess = false;
    tutorialMismatchedSuccess = false;
    tutorialBombShown = false;
    tutorialLevelTimedClicked = false;
    tutorialLevelNormalClicked = false;
}

function endTutorial() {
    isTutorialActive = false;
    hideTutorialGuide();
    markTutorialAsSeen();
    clearTutorialAutoAdvanceTimer();
    
    gameMode = GAME_MODES.NORMAL;
    saveGameMode();
    stopCountdown();
    updateModeButtons();
    
    restartGame();
}

function handleTutorialCardClick(card) {
    if (!isTutorialActive) return false;
    
    const step = tutorialSteps[currentTutorialStep];
    
    if (step.action === 'wait-flip-match-1') {
        if (card !== tutorialMatchCard1) return true;
        hideTutorialHighlight();
        hideTutorialArrow();
        currentTutorialStep = 2;
        updateTutorialStep(2);
        return false;
    }
    
    if (step.action === 'wait-flip-match-2') {
        if (card !== tutorialMatchCard2) return true;
        hideTutorialHighlight();
        hideTutorialArrow();
        tutorialMatchedSuccess = true;
        
        setTimeout(() => {
            currentTutorialStep = 3;
            updateTutorialStep(3);
        }, 1000);
        return false;
    }
    
    if (step.action === 'show-match-success') {
        if (card !== tutorialMismatchCard1) return true;
        hideTutorialHighlight();
        hideTutorialArrow();
        currentTutorialStep = 4;
        updateTutorialStep(4);
        return false;
    }
    
    if (step.action === 'wait-flip-mismatch-2') {
        if (card !== tutorialMismatchCard2) return true;
        hideTutorialHighlight();
        hideTutorialArrow();
        tutorialMismatchedSuccess = true;
        
        setTimeout(() => {
            currentTutorialStep = 5;
            updateTutorialStep(5);
        }, 1000);
        return false;
    }
    
    if (step.action === 'show-mismatch-result') {
        return true;
    }
    
    if (step.action === 'goto-level-select' || step.action === 'click-timed-mode' || step.action === 'back-to-level-select-from-timed' || step.action === 'timed-mode-demo') {
        return false;
    }
    
    if (step.action === 'wait-flip-bomb-1') {
        if (card !== tutorialBombCard1) return true;
        hideTutorialHighlight();
        hideTutorialArrow();
        tutorialBombShown = true;
        setTimeout(() => {
            currentTutorialStep = 7;
            updateTutorialStep(7);
        }, 0);
        return false;
    }
    
    if (step.action === 'wait-flip-bomb-2') {
        if (card !== tutorialBombCard2) return true;
        hideTutorialHighlight();
        hideTutorialArrow();
        
        return false;
    }
    
    if (step.action === 'free-play') {
        return false;
    }
    
    return false;
}

function autoFlipCard(cardElement, cardIndex) {
    if (!cardElement) return;
    
    const card = cards[cardIndex];
    if (!card || card.flipped || card.matched) return;
    
    if (!gameStarted) {
        startTimer();
        if (gameMode === GAME_MODES.TIMED) {
            startCountdown();
        }
        gameStarted = true;
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

function resetTutorialMatchCards() {
    clearTutorialAutoAdvanceTimer();
    
    if (tutorialMatchCard1) tutorialMatchCard1.classList.remove('flipped', 'matched');
    if (tutorialMatchCard2) tutorialMatchCard2.classList.remove('flipped', 'matched');
    if (cards[0]) cards[0].flipped = false;
    if (cards[0]) cards[0].matched = false;
    if (cards[4]) cards[4].flipped = false;
    if (cards[4]) cards[4].matched = false;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    moves = 0;
    misses = 0;
    stopTimer();
    seconds = 0;
    gameStarted = false;
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '00:00';
    pairsDisplay.textContent = `0/${regularPairs}`;
    tutorialMatchedSuccess = false;
}

function resetTutorialCardOnly() {
    if (tutorialMatchCard1) tutorialMatchCard1.classList.remove('flipped', 'matched');
    if (tutorialMatchCard2) tutorialMatchCard2.classList.remove('flipped', 'matched');
    if (cards[0]) cards[0].flipped = false;
    if (cards[0]) cards[0].matched = false;
    if (cards[4]) cards[4].flipped = false;
    if (cards[4]) cards[4].matched = false;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    matchedPairs = 0;
    moves = 0;
    misses = 0;
    stopTimer();
    seconds = 0;
    gameStarted = false;
    if (movesDisplay) movesDisplay.textContent = '0';
    if (timerDisplay) timerDisplay.textContent = '00:00';
    if (pairsDisplay) pairsDisplay.textContent = `0/${regularPairs}`;
    stopCountdown();
}

function resetTutorialMismatchCards() {
    clearTutorialAutoAdvanceTimer();
    
    if (tutorialMismatchCard1) tutorialMismatchCard1.classList.remove('flipped', 'matched');
    if (tutorialMismatchCard2) tutorialMismatchCard2.classList.remove('flipped', 'matched');
    if (cards[1]) cards[1].flipped = false;
    if (cards[1]) cards[1].matched = false;
    if (cards[3]) cards[3].flipped = false;
    if (cards[3]) cards[3].matched = false;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    tutorialMismatchedSuccess = false;
}

function resetTutorialBombCards() {
    clearTutorialAutoAdvanceTimer();
    
    if (tutorialBombCard1) tutorialBombCard1.classList.remove('flipped', 'matched', 'bomb-explode');
    if (tutorialBombCard2) tutorialBombCard2.classList.remove('flipped', 'matched', 'bomb-explode');
    if (cards[2]) cards[2].flipped = false;
    if (cards[2]) cards[2].matched = false;
    if (cards[5]) cards[5].flipped = false;
    if (cards[5]) cards[5].matched = false;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    tutorialBombShown = false;
}

function resetAllCardsForBombDemo() {
    clearTutorialAutoAdvanceTimer();
    
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach((card, index) => {
        card.classList.remove('flipped', 'matched', 'bomb-explode');
        if (cards[index]) {
            cards[index].flipped = false;
            cards[index].matched = false;
        }
    });
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    tutorialBombShown = false;
}
