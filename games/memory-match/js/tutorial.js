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
        text: '游戏目标是将所有相同图案的卡片配对完成即可通关。让我带你一步步了解如何操作。',
        action: 'intro',
        showNext: true
    },
    {
        title: '👆 第一步：点击卡片',
        text: '点击下面高亮的卡片可以翻开它查看背面的图案。点击"下一步"按钮，我将为你演示翻牌效果。',
        action: 'wait-flip-match-1',
        showNext: true
    },
    {
        title: '👀 很好！看到图案了',
        text: '你已经看到了翻开的卡片图案。接下来需要找到另一张相同图案的卡片进行配对。点击"下一步"按钮，我将为你演示配对效果。',
        action: 'wait-flip-match-2',
        showNext: true
    },
    {
        title: '✅ 太棒了！配对成功！',
        text: '两张卡片图案相同，它们保持翻开状态！这就是配对成功的效果。现在请点击下面高亮的卡片，来体验配对失败的效果。',
        action: 'show-match-success',
        showNext: true
    },
    {
        title: '🔄 再点击另一张不同的卡片',
        text: '这张卡片和刚才的卡片图案不同。点击"下一步"按钮，看看配对失败会发生什么！',
        action: 'wait-flip-mismatch-2',
        showNext: true
    },
    {
        title: '💡 配对失败会怎样？',
        text: '两张卡片图案不同，它们会在1秒后自动翻回去。记住卡片的位置很重要哦！',
        action: 'show-mismatch-result',
        showNext: true
    },
    {
        title: '💣 炸弹卡片说明',
        text: '从第9关开始，游戏中会出现💣炸弹卡片。请点击下面高亮的炸弹卡片，我们来看看翻开两张炸弹会发生什么！',
        action: 'wait-flip-bomb-1',
        showNext: true
    },
    {
        title: '💣 再点击另一张炸弹卡片',
        text: '请点击箭头指向的另一张炸弹卡片，看看翻开两张炸弹会发生什么！',
        action: 'wait-flip-bomb-2',
        showNext: true
    },
    {
        title: '⏱️ 限时模式体验（一）',
        text: '除了常规模式外，游戏还提供限时模式！在限时模式中，每关都有时间限制，时间归零则游戏失败，剩余时间会按比例奖励步数减免。请点击顶部高亮的"限时"按钮，切换到限时模式体验一下。',
        action: 'wait-timed-mode-click',
        showNext: true
    },
    {
        title: '⏱️ 限时模式体验（二）',
        text: '很好！你已经切换到限时模式，顶部显示了倒计时栏。请点击下面高亮的卡片，观察翻牌后倒计时开始运行的效果。',
        action: 'wait-timed-card-click',
        showNext: true
    },
    {
        title: '🎯 开始游戏！',
        text: '你已经掌握了所有规则！现在请找出所有相同图案的卡片进行配对，避开炸弹卡片，完成第一关吧。完成所有配对后教程会自动结束。祝你好运！',
        action: 'free-play',
        showNext: true
    }
];

function showTutorialGuide() {
    tutorialGuide.classList.remove('hidden');
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

function updateTutorialStep(stepIndex) {
    clearTutorialAutoAdvanceTimer();
    
    const step = tutorialSteps[stepIndex];
    tutorialGuideTitle.textContent = step.title;
    tutorialGuideText.textContent = step.text;
    
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
        }
    }
    
    if (step.action === 'wait-flip-match-2') {
        if (tutorialMatchCard2) {
            showTutorialHighlight(tutorialMatchCard2);
            showTutorialArrow(tutorialMatchCard2, 'top');
        }
    }
    
    if (step.action === 'show-match-success') {
        if (tutorialMismatchCard1) {
            showTutorialHighlight(tutorialMismatchCard1);
            showTutorialArrow(tutorialMismatchCard1, 'top');
        }
    }
    
    if (step.action === 'wait-flip-mismatch-2') {
        if (tutorialMismatchCard2) {
            showTutorialHighlight(tutorialMismatchCard2);
            showTutorialArrow(tutorialMismatchCard2, 'top');
        }
    }
    
    if (step.action === 'wait-flip-bomb-1') {
        resetAllCardsForBombDemo();
        if (tutorialBombCard1) {
            showTutorialHighlight(tutorialBombCard1);
            showTutorialArrow(tutorialBombCard1, 'top');
        }
    }
    
    if (step.action === 'wait-flip-bomb-2') {
        if (tutorialBombCard2) {
            showTutorialHighlight(tutorialBombCard2);
            showTutorialArrow(tutorialBombCard2, 'top');
        }
    }
    
    if (step.action === 'wait-timed-mode-click') {
        if (modeTimedBtn) {
            showTutorialHighlight(modeTimedBtn);
            showTutorialArrow(modeTimedBtn, 'bottom');
        }
    }
    
    if (step.action === 'wait-timed-card-click') {
        if (tutorialMatchCard1) {
            showTutorialHighlight(tutorialMatchCard1);
            showTutorialArrow(tutorialMatchCard1, 'top');
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

function clearTutorialTimedDemoTimer() {
    if (tutorialTimedDemoTimer) {
        clearTimeout(tutorialTimedDemoTimer);
        tutorialTimedDemoTimer = null;
    }
}

function handleTutorialTimedModeClick() {
    if (!isTutorialActive) return false;
    
    const step = tutorialSteps[currentTutorialStep];
    if (step.action !== 'wait-timed-mode-click') return false;
    
    hideTutorialHighlight();
    hideTutorialArrow();
    
    clearTutorialTimedDemoTimer();
    tutorialTimedModeActive = true;
    tutorialTimedCardClicked = false;
    
    if (tutorialMatchCard1) {
        tutorialMatchCard1.classList.remove('flipped', 'matched');
    }
    if (cards[0]) {
        cards[0].flipped = false;
        cards[0].matched = false;
    }
    if (tutorialMatchCard2) {
        tutorialMatchCard2.classList.remove('flipped', 'matched');
    }
    if (cards[4]) {
        cards[4].flipped = false;
        cards[4].matched = false;
    }
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
    
    gameMode = GAME_MODES.TIMED;
    saveGameMode();
    updateModeButtons();
    
    const level = gameLevels[currentLevel];
    timeRemaining = level.timeLimit;
    updateCountdownDisplay();
    
    playSound('match');
    
    currentTutorialStep = 9;
    updateTutorialStep(9);
    
    return true;
}

function handleTutorialTimedCardClick(card) {
    if (!isTutorialActive) return false;
    
    const step = tutorialSteps[currentTutorialStep];
    if (step.action !== 'wait-timed-card-click') return false;
    
    if (card !== tutorialMatchCard1) return true;
    
    hideTutorialHighlight();
    hideTutorialArrow();
    
    tutorialTimedCardClicked = true;
    
    const cardData = cards[0];
    const isCardAlreadyFlipped = cardData && cardData.flipped;
    
    if (isCardAlreadyFlipped) {
        if (!gameStarted) {
            startTimer();
            if (gameMode === GAME_MODES.TIMED) {
                startCountdown();
            }
            gameStarted = true;
        }
        completeTimedModeDemo();
        return true;
    }
    
    return false;
}

function handleTutorialTimedNextClick() {
    if (!isTutorialActive) return;
    
    const step = tutorialSteps[currentTutorialStep];
    if (step.action !== 'wait-timed-card-click') return;
    
    hideTutorialHighlight();
    hideTutorialArrow();
    tutorialTimedCardClicked = true;
    
    if (!tutorialMatchCard1) {
        return;
    }
    
    const card = cards[0];
    const isCardAlreadyFlipped = card && card.flipped;
    
    if (!isCardAlreadyFlipped) {
        autoFlipCard(tutorialMatchCard1, 0);
    } else {
        if (!gameStarted) {
            startTimer();
            if (gameMode === GAME_MODES.TIMED) {
                startCountdown();
            }
            gameStarted = true;
        }
        completeTimedModeDemo();
    }
}

function completeTimedModeDemo() {
    if (!isTutorialActive || !tutorialTimedCardClicked) return;
    
    clearTutorialTimedDemoTimer();
    tutorialTimedDemoTimer = setTimeout(() => {
        if (isTutorialActive && tutorialTimedModeActive) {
            gameMode = GAME_MODES.NORMAL;
            saveGameMode();
            stopCountdown();
            updateModeButtons();
            timeRemaining = 0;
            if (countdownDisplay) countdownDisplay.textContent = '00:00';
            tutorialTimedModeActive = false;
            tutorialTimedCardClicked = false;
            
            currentTutorialStep = 10;
            updateTutorialStep(10);
        }
    }, 3500);
}

function startTutorial() {
    hideTutorialModal();
    
    gameMode = GAME_MODES.NORMAL;
    saveGameMode();
    stopCountdown();
    updateModeButtons();
    
    clearTutorialAutoAdvanceTimer();
    clearTutorialTimedDemoTimer();
    tutorialTimedModeActive = false;
    tutorialTimedCardClicked = false;
    
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
    
    currentLevel = 0;
    unlockedLevels = { 0: true };
    saveProgress();
    
    resetStats();
    createTutorialBoard();
    setupTutorialCards();
    showTutorialGuide();
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
    clearTutorialTimedDemoTimer();
    tutorialTimedModeActive = false;
    tutorialTimedCardClicked = false;
    
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
}

function endTutorial() {
    isTutorialActive = false;
    hideTutorialGuide();
    markTutorialAsSeen();
    clearTutorialAutoAdvanceTimer();
    clearTutorialTimedDemoTimer();
    tutorialTimedModeActive = false;
    tutorialTimedCardClicked = false;
    
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
    
    if (step.action === 'wait-flip-bomb-1') {
        if (card !== tutorialBombCard1) return true;
        hideTutorialHighlight();
        hideTutorialArrow();
        tutorialBombShown = true;
        currentTutorialStep = 7;
        updateTutorialStep(7);
        return false;
    }
    
    if (step.action === 'wait-flip-bomb-2') {
        if (card !== tutorialBombCard2) return true;
        hideTutorialHighlight();
        hideTutorialArrow();
        
        return false;
    }
    
    if (step.action === 'wait-timed-card-click') {
        return handleTutorialTimedCardClick(card);
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

function resetTutorialMatchCards() {
    clearTutorialAutoAdvanceTimer();
    clearTutorialTimedDemoTimer();
    tutorialTimedModeActive = false;
    tutorialTimedCardClicked = false;
    
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

function resetTutorialMismatchCards() {
    clearTutorialAutoAdvanceTimer();
    clearTutorialTimedDemoTimer();
    tutorialTimedModeActive = false;
    tutorialTimedCardClicked = false;
    
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
    clearTutorialTimedDemoTimer();
    tutorialTimedModeActive = false;
    tutorialTimedCardClicked = false;
    
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
    clearTutorialTimedDemoTimer();
    tutorialTimedModeActive = false;
    tutorialTimedCardClicked = false;
    
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
