class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        this.playerMode = 'single';
        this.snake1 = [];
        this.snake2 = [];
        this.direction1 = { x: 1, y: 0 };
        this.direction2 = { x: -1, y: 0 };
        this.nextDirection1 = { x: 1, y: 0 };
        this.nextDirection2 = { x: -1, y: 0 };
        this.directionQueue1 = [];
        this.directionQueue2 = [];

        this.foods = [];
        this.score1 = 0;
        this.score2 = 0;
        this.gameMode = 'normal';
        this.gameState = 'idle';
        this.gameInterval = null;
        this.gameStartTime = 0;
        this.elapsedTime = 0;
        this.timeInterval = null;

        this.baseSpeed = 333;
        this.currentSpeed1 = this.baseSpeed;
        this.currentSpeed2 = this.baseSpeed;
        this.acceleratedSpeed = 100;

        this.isAccelerating1 = false;
        this.isAccelerating2 = false;
        this.accelerationStartTime1 = 0;
        this.accelerationStartTime2 = 0;
        this.shrinkStartDelay = 2000;
        this.shrinkInterval = 500;
        this.lastShrinkTime1 = 0;
        this.lastShrinkTime2 = 0;
        this.lastMoveTime1 = 0;
        this.lastMoveTime2 = 0;
        this.heldKeys1 = new Set();
        this.heldKeys2 = new Set();
        this.holdThreshold = 200;
        this.holdTimeout1 = null;
        this.holdTimeout2 = null;

        this.obstacles = [];
        this.lastObstacleScore = 0;
        this.lastObstacleTime = 0;
        this.movingObstacles = [];

        this.reverseControls1 = false;
        this.reverseControls2 = false;
        this.reverseTimeout1 = null;
        this.reverseTimeout2 = null;
        this.isReversed1 = false;
        this.isReversed2 = false;

        this.modeStates = {
            normal: null,
            fun: null,
            challenge: null
        };

        this.lastFoodType1 = null;
        this.lastFoodType2 = null;
        this.foodsEaten1 = 0;
        this.foodsEaten2 = 0;
        this.goldFoodsEaten1 = 0;
        this.goldFoodsEaten2 = 0;
        this.purpleFoodsEaten1 = 0;
        this.purpleFoodsEaten2 = 0;
        this.directionChangeCount1 = 0;
        this.directionChangeCount2 = 0;

        this.reverseFoodsEaten1 = 0;
        this.reverseFoodsEaten2 = 0;
        this.minusFoodsEaten1 = 0;
        this.minusFoodsEaten2 = 0;
        this.hitObstacle = false;
        this.minusComboTriggered = false;
        this.uniqueFoodsEaten = new Set();
        this.headOnCollisionHappened = false;

        this.snake1Dead = false;
        this.snake2Dead = false;
        this.drawGame = null;

        this.headOnCollision = false;
        this.headCollisionCount = 0;

        this.themeManager = null;
        this.achievementManager = null;

        this.helpScrollRafId = null;
        this.helpScrollDirection = 0;
        this.helpScrollTarget = null;
        this.lastScrollTime = 0;

        this.settingsScrollRafId = null;
        this.settingsScrollDirection = 0;
        this.settingsScrollTarget = null;
        this.lastSettingsScrollTime = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadHighScores();
        this.resetGame();
        this.render();
        this.checkFirstTimeHelp();
    }

    checkFirstTimeHelp() {
        const hasSeenHelp = localStorage.getItem('snakeGameHelpSeen');
        if (!hasSeenHelp) {
            document.getElementById('helpModal').classList.add('show');
            this.resetHelpPage();
            localStorage.setItem('snakeGameHelpSeen', 'true');
        }
    }

    setThemeManager(manager) {
        this.themeManager = manager;
    }

    setAchievementManager(manager) {
        this.achievementManager = manager;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        window.addEventListener('blur', () => this.handleWindowBlur());
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.gameState === 'idle') {
                this.startGame(false);
            } else if (this.gameState === 'paused') {
                this.resumeGame();
            } else if (this.gameState === 'playing') {
                this.pauseGame();
            }
        });

        document.getElementById('endBtn').addEventListener('click', () => {
            if (this.gameState !== 'idle') {
                this.endGame();
            }
        });

        document.getElementById('singlePlayerBtn').addEventListener('click', () => {
            this.setPlayerMode('single');
        });

        document.getElementById('doublePlayerBtn').addEventListener('click', () => {
            this.setPlayerMode('double');
        });

        document.getElementById('normalModeBtn').addEventListener('click', () => {
            this.setGameMode('normal');
        });

        document.getElementById('funModeBtn').addEventListener('click', () => {
            this.setGameMode('fun');
        });

        document.getElementById('challengeModeBtn').addEventListener('click', () => {
            this.setGameMode('challenge');
        });

        document.getElementById('settingsIconBtn').addEventListener('click', () => {
            this.openSettingsModal();
        });

        document.getElementById('helpIconBtn').addEventListener('click', () => {
            document.getElementById('helpModal').classList.add('show');
            this.resetHelpPage();
        });

        document.getElementById('modalClose').addEventListener('click', () => {
            document.getElementById('helpModal').classList.remove('show');
        });

        document.getElementById('helpModal').addEventListener('click', (e) => {
            if (e.target.id === 'helpModal') {
                document.getElementById('helpModal').classList.remove('show');
            }
        });

        document.getElementById('helpPrevBtn').addEventListener('click', () => {
            this.changeHelpPage(-1);
        });

        document.getElementById('helpNextBtn').addEventListener('click', () => {
            this.changeHelpPage(1);
        });

        document.querySelectorAll('.help-page-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const page = parseInt(dot.dataset.page);
                this.goToHelpPage(page);
            });
        });

        document.querySelectorAll('.help-card-content').forEach(el => {
            el.addEventListener('wheel', (e) => {
                const atTop = el.scrollTop <= 0;
                const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
                if ((e.deltaY > 0 && atBottom) || (e.deltaY < 0 && atTop)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, { passive: false });
        });

        document.getElementById('settingsClose').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettingsModal();
            }
        });

        document.getElementById('settingsMinimize').addEventListener('click', () => {
            this.minimizeSettingsModal();
        });

        document.getElementById('restoreSettings').addEventListener('click', () => {
            this.restoreSettingsModal();
        });

        document.getElementById('gameOverClose').addEventListener('click', () => {
            this.closeGameOverModal();
        });
        document.getElementById('gameOverCloseBtn').addEventListener('click', () => {
            this.closeGameOverModal();
        });
        document.getElementById('gameOverRestartBtn').addEventListener('click', () => {
            this.closeGameOverModal();
            this.modeStates[this.gameMode] = null;
            this.resetGame();
            this.render();
        });
    }

    setPlayerMode(mode) {
        if (this.playerMode === mode) return;

        if (this.gameState === 'playing' || this.gameState === 'paused') {
            return;
        }

        this.playerMode = mode;

        document.querySelectorAll('.player-btn').forEach(btn => btn.classList.remove('active'));
        const modeBtn = document.getElementById(`${mode}PlayerBtn`);
        if (modeBtn) modeBtn.classList.add('active');

        if (mode === 'double') {
            document.getElementById('player2ScoreItem').style.display = 'flex';
            document.getElementById('player1Label').textContent = '玩家1分数:';
            document.getElementById('controlsHint').innerHTML = 'WASD:<strong>玩家1</strong> | ↑↓←→:<strong>玩家2</strong>';
        } else {
            document.getElementById('player2ScoreItem').style.display = 'none';
            document.getElementById('player1Label').textContent = '当前分数:';
            document.getElementById('controlsHint').textContent = '↑↓←→ 或 WASD 控制方向';
        }

        this.resetGame();
        this.updateHighScoreDisplay();
        this.render();
    }

    handleKeyDown(e) {
        const gameOverModal = document.getElementById('gameOverModal');
        if (gameOverModal && gameOverModal.classList.contains('show')) {
            return;
        }

        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal && settingsModal.classList.contains('show')) {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft' || key === 'arrowright') {
                e.preventDefault();
                const tabBtns = settingsModal.querySelectorAll('.tab-btn');
                let activeIndex = -1;
                tabBtns.forEach((btn, i) => {
                    if (btn.classList.contains('active')) {
                        activeIndex = i;
                    }
                });
                if (activeIndex !== -1) {
                    const newIndex = key === 'arrowleft'
                        ? (activeIndex - 1 + tabBtns.length) % tabBtns.length
                        : (activeIndex + 1) % tabBtns.length;
                    tabBtns[newIndex].click();
                }
            } else if (key === 'arrowup' || key === 'arrowdown') {
                e.preventDefault();
                if (e.repeat) return;
                const activeTab = settingsModal.querySelector('.tab-content.active');
                if (activeTab) {
                    this.settingsScrollTarget = activeTab;
                    this.settingsScrollDirection = (key === 'arrowup') ? -1 : 1;
                    this.startSettingsScroll();
                }
            }
            return;
        }

        const helpModal = document.getElementById('helpModal');
        if (helpModal && helpModal.classList.contains('show')) {
            const key = e.key.toLowerCase();
            if (key === 'arrowleft' || key === 'arrowright' || key === 'a' || key === 'd') {
                e.preventDefault();
                if (key === 'arrowleft' || key === 'a') {
                    this.changeHelpPage(-1);
                } else {
                    this.changeHelpPage(1);
                }
            } else if (key === 'arrowup' || key === 'arrowdown' || key === 'w' || key === 's') {
                e.preventDefault();
                if (e.repeat) return;
                const activeCard = helpModal.querySelector('.help-card.active .help-card-content');
                if (activeCard) {
                    this.helpScrollTarget = activeCard;
                    this.helpScrollDirection = (key === 'arrowup' || key === 'w') ? -1 : 1;
                    this.startHelpScroll();
                }
            }
            return;
        }

        const key = e.key.toLowerCase();

        const isWASDKey = ['w', 'a', 's', 'd'].includes(key);
        const isArrowKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key);

        if (key === ' ') {
            e.preventDefault();
            if (this.gameState === 'idle') {
                this.startGame(false);
            } else if (this.gameState === 'playing') {
                this.pauseGame();
            } else if (this.gameState === 'paused') {
                this.resumeGame();
            }
            return;
        }

        if (this.playerMode === 'single') {
            const isDirectionKey = isWASDKey || isArrowKey;

            if (isDirectionKey && this.gameState === 'idle') {
                e.preventDefault();
                this.startGame(false);
                const newDir = this.getDirectionFromKey(key);
                if (newDir) {
                    this.direction1 = { ...newDir };
                    this.nextDirection1 = { ...newDir };
                }
                this.heldKeys1.add(key);
                this.scheduleAcceleration(1);
                return;
            }

            if (isDirectionKey && this.gameState === 'paused') {
                e.preventDefault();
                this.resumeGame();
                const newDir = this.getDirectionFromKey(key);
                if (newDir) {
                    if (this.reverseControls1) {
                        newDir.x = -newDir.x;
                        newDir.y = -newDir.y;
                    }
                    const lastQueuedDir = this.directionQueue1.length > 0
                        ? this.directionQueue1[this.directionQueue1.length - 1]
                        : this.direction1;
                    const isOpposite = newDir.x === -lastQueuedDir.x && newDir.y === -lastQueuedDir.y;
                    const isSame = newDir.x === lastQueuedDir.x && newDir.y === lastQueuedDir.y;
                    if (!isOpposite && !isSame && this.directionQueue1.length < 4) {
                        this.directionQueue1.push({ ...newDir });
                    }
                }
                this.heldKeys1.add(key);
                this.scheduleAcceleration(1);
                return;
            }

            if (this.gameState !== 'playing') return;

            if (isDirectionKey && !e.repeat) {
                this.heldKeys1.add(key);
                this.scheduleAcceleration(1);
            }

            const newDir = this.getDirectionFromKey(key);
            if (newDir) {
                e.preventDefault();
                if (this.reverseControls1) {
                    newDir.x = -newDir.x;
                    newDir.y = -newDir.y;
                }

                const lastQueuedDir = this.directionQueue1.length > 0
                    ? this.directionQueue1[this.directionQueue1.length - 1]
                    : this.direction1;

                const isOpposite = newDir.x === -lastQueuedDir.x && newDir.y === -lastQueuedDir.y;
                const isSame = newDir.x === lastQueuedDir.x && newDir.y === lastQueuedDir.y;
                const maxQueueSize = 4;

                if (!isOpposite && !isSame && this.directionQueue1.length < maxQueueSize) {
                    this.directionQueue1.push(newDir);
                }
            }
        } else {
            if (isWASDKey && this.gameState === 'idle') {
                e.preventDefault();
                this.startGame(false);
                const newDir = this.getDirectionFromKey(key);
                if (newDir) {
                    this.direction1 = { ...newDir };
                    this.nextDirection1 = { ...newDir };
                }
                this.heldKeys1.add(key);
                this.scheduleAcceleration(1);
                return;
            }

            if (isArrowKey && this.gameState === 'idle') {
                e.preventDefault();
                this.startGame(false);
                const newDir = this.getDirectionFromKey(key);
                if (newDir) {
                    this.direction2 = { ...newDir };
                    this.nextDirection2 = { ...newDir };
                }
                this.heldKeys2.add(key);
                this.scheduleAcceleration(2);
                return;
            }

            if (isWASDKey && this.gameState === 'paused') {
                e.preventDefault();
                this.resumeGame();
                const newDir = this.getDirectionFromKey(key);
                if (newDir) {
                    if (this.reverseControls1) {
                        newDir.x = -newDir.x;
                        newDir.y = -newDir.y;
                    }
                    const lastQueuedDir = this.directionQueue1.length > 0
                        ? this.directionQueue1[this.directionQueue1.length - 1]
                        : this.direction1;
                    const isOpposite = newDir.x === -lastQueuedDir.x && newDir.y === -lastQueuedDir.y;
                    const isSame = newDir.x === lastQueuedDir.x && newDir.y === lastQueuedDir.y;
                    if (!isOpposite && !isSame && this.directionQueue1.length < 4) {
                        this.directionQueue1.push({ ...newDir });
                    }
                }
                this.heldKeys1.add(key);
                this.scheduleAcceleration(1);
                return;
            }

            if (isArrowKey && this.gameState === 'paused') {
                e.preventDefault();
                this.resumeGame();
                const newDir = this.getDirectionFromKey(key);
                if (newDir) {
                    if (this.reverseControls2) {
                        newDir.x = -newDir.x;
                        newDir.y = -newDir.y;
                    }
                    const lastQueuedDir = this.directionQueue2.length > 0
                        ? this.directionQueue2[this.directionQueue2.length - 1]
                        : this.direction2;
                    const isOpposite = newDir.x === -lastQueuedDir.x && newDir.y === -lastQueuedDir.y;
                    const isSame = newDir.x === lastQueuedDir.x && newDir.y === lastQueuedDir.y;
                    if (!isOpposite && !isSame && this.directionQueue2.length < 4) {
                        this.directionQueue2.push({ ...newDir });
                    }
                }
                this.heldKeys2.add(key);
                this.scheduleAcceleration(2);
                return;
            }

            if (this.gameState !== 'playing') return;

            if (isWASDKey && !e.repeat) {
                this.heldKeys1.add(key);
                this.scheduleAcceleration(1);
            }

            if (isArrowKey && !e.repeat) {
                this.heldKeys2.add(key);
                this.scheduleAcceleration(2);
            }

            if (isWASDKey) {
                const newDir = this.getDirectionFromKey(key);
                if (newDir) {
                    e.preventDefault();
                    if (this.reverseControls1) {
                        newDir.x = -newDir.x;
                        newDir.y = -newDir.y;
                    }

                    const lastQueuedDir = this.directionQueue1.length > 0
                        ? this.directionQueue1[this.directionQueue1.length - 1]
                        : this.direction1;

                    const isOpposite = newDir.x === -lastQueuedDir.x && newDir.y === -lastQueuedDir.y;
                    const isSame = newDir.x === lastQueuedDir.x && newDir.y === lastQueuedDir.y;
                    const maxQueueSize = 4;

                    if (!isOpposite && !isSame && this.directionQueue1.length < maxQueueSize) {
                        this.directionQueue1.push(newDir);
                    }
                }
            }

            if (isArrowKey) {
                const newDir = this.getDirectionFromKey(key);
                if (newDir) {
                    e.preventDefault();
                    if (this.reverseControls2) {
                        newDir.x = -newDir.x;
                        newDir.y = -newDir.y;
                    }

                    const lastQueuedDir = this.directionQueue2.length > 0
                        ? this.directionQueue2[this.directionQueue2.length - 1]
                        : this.direction2;

                    const isOpposite = newDir.x === -lastQueuedDir.x && newDir.y === -lastQueuedDir.y;
                    const isSame = newDir.x === lastQueuedDir.x && newDir.y === lastQueuedDir.y;
                    const maxQueueSize = 4;

                    if (!isOpposite && !isSame && this.directionQueue2.length < maxQueueSize) {
                        this.directionQueue2.push(newDir);
                    }
                }
            }
        }
    }

    getDirectionFromKey(key) {
        switch (key) {
            case 'arrowup':
            case 'w':
                return { x: 0, y: -1 };
            case 'arrowdown':
            case 's':
                return { x: 0, y: 1 };
            case 'arrowleft':
            case 'a':
                return { x: -1, y: 0 };
            case 'arrowright':
            case 'd':
                return { x: 1, y: 0 };
        }
        return null;
    }

    scheduleAcceleration(player) {
        const timeout = player === 1 ? this.holdTimeout1 : this.holdTimeout2;
        if (timeout) return;

        const isAccelerating = player === 1 ? this.isAccelerating1 : this.isAccelerating2;
        if (isAccelerating) return;

        const newTimeout = setTimeout(() => {
            if (player === 1) {
                this.holdTimeout1 = null;
                this.startAccelerating(1);
            } else {
                this.holdTimeout2 = null;
                this.startAccelerating(2);
            }
        }, this.holdThreshold);

        if (player === 1) {
            this.holdTimeout1 = newTimeout;
        } else {
            this.holdTimeout2 = newTimeout;
        }
    }

    cancelHoldTimeout(player) {
        if (player === 1 && this.holdTimeout1) {
            clearTimeout(this.holdTimeout1);
            this.holdTimeout1 = null;
        }
        if (player === 2 && this.holdTimeout2) {
            clearTimeout(this.holdTimeout2);
            this.holdTimeout2 = null;
        }
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        const isWASDKey = ['w', 'a', 's', 'd'].includes(key);
        const isArrowKey = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key);

        if (key === 'arrowup' || key === 'arrowdown' || key === 'w' || key === 's') {
            this.stopHelpScroll();
            this.stopSettingsScroll();
        }

        if (this.playerMode === 'single') {
            this.heldKeys1.delete(key);
            if (this.heldKeys1.size === 0) {
                this.cancelHoldTimeout(1);
                if (this.isAccelerating1) {
                    this.stopAccelerating(1);
                }
            }
        } else {
            if (isWASDKey) {
                this.heldKeys1.delete(key);
                if (this.heldKeys1.size === 0) {
                    this.cancelHoldTimeout(1);
                    if (this.isAccelerating1) {
                        this.stopAccelerating(1);
                    }
                }
            }
            if (isArrowKey) {
                this.heldKeys2.delete(key);
                if (this.heldKeys2.size === 0) {
                    this.cancelHoldTimeout(2);
                    if (this.isAccelerating2) {
                        this.stopAccelerating(2);
                    }
                }
            }
        }
    }

    startAccelerating(player) {
        if (this.gameState !== 'playing') return;

        if (player === 1 && !this.isAccelerating1) {
            this.isAccelerating1 = true;
            this.accelerationStartTime1 = Date.now();
            this.lastShrinkTime1 = Date.now();
        }
        if (player === 2 && !this.isAccelerating2) {
            this.isAccelerating2 = true;
            this.accelerationStartTime2 = Date.now();
            this.lastShrinkTime2 = Date.now();
        }
    }

    stopAccelerating(player) {
        if (player === 1 && this.isAccelerating1) {
            this.isAccelerating1 = false;
        }
        if (player === 2 && this.isAccelerating2) {
            this.isAccelerating2 = false;
        }
    }

    handleWindowBlur() {
        this.heldKeys1.clear();
        this.heldKeys2.clear();
        this.cancelHoldTimeout(1);
        this.cancelHoldTimeout(2);
        if (this.isAccelerating1) this.stopAccelerating(1);
        if (this.isAccelerating2) this.stopAccelerating(2);
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.heldKeys1.clear();
            this.heldKeys2.clear();
            this.cancelHoldTimeout(1);
            this.cancelHoldTimeout(2);
            if (this.isAccelerating1) this.stopAccelerating(1);
            if (this.isAccelerating2) this.stopAccelerating(2);
        }
    }

    setGameMode(mode) {
        if (this.gameMode === mode) return;

        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.stopGameLoop();
            this.stopTimeCounter();
            this.isAccelerating1 = false;
            this.isAccelerating2 = false;
            this.heldKeys1.clear();
            this.heldKeys2.clear();
            this.cancelHoldTimeout(1);
            this.cancelHoldTimeout(2);
            this.modeStates[this.gameMode] = this.saveCurrentModeState();
        }

        this.gameMode = mode;

        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const modeBtn = document.getElementById(`${mode}ModeBtn`);
        if (modeBtn) modeBtn.classList.add('active');

        this.updateHighScoreDisplay();

        const savedState = this.modeStates[mode];
        if (savedState) {
            this.loadModeState(savedState);
            this.render();
        } else {
            this.resetGame();
            this.render();
        }
    }

    resetGame() {
        const mid = Math.floor(this.tileCount / 2);
        
        if (this.playerMode === 'single') {
            this.snake1 = [
                { x: mid, y: mid },
                { x: mid - 1, y: mid },
                { x: mid - 2, y: mid }
            ];
        } else {
            this.snake1 = [
                { x: 5, y: 5 },
                { x: 4, y: 5 },
                { x: 3, y: 5 }
            ];
        }
        this.direction1 = { x: 1, y: 0 };
        this.nextDirection1 = { x: 1, y: 0 };
        this.directionQueue1 = [];

        if (this.playerMode === 'double') {
            this.snake2 = [
                { x: this.tileCount - 6, y: this.tileCount - 6 },
                { x: this.tileCount - 5, y: this.tileCount - 6 },
                { x: this.tileCount - 4, y: this.tileCount - 6 }
            ];
            this.direction2 = { x: -1, y: 0 };
            this.nextDirection2 = { x: -1, y: 0 };
            this.directionQueue2 = [];
        } else {
            this.snake2 = [];
        }

        this.score1 = 0;
        this.score2 = 0;
        this.elapsedTime = 0;
        this.foods = [];
        this.obstacles = [];
        this.lastObstacleScore = 0;
        this.lastObstacleTime = 0;
        this.movingObstacles = [];
        this.reverseControls1 = false;
        this.reverseControls2 = false;
        this.isReversed1 = false;
        this.isReversed2 = false;
        this.lastFoodType1 = null;
        this.lastFoodType2 = null;
        this.foodsEaten1 = 0;
        this.foodsEaten2 = 0;
        this.goldFoodsEaten1 = 0;
        this.goldFoodsEaten2 = 0;
        this.purpleFoodsEaten1 = 0;
        this.purpleFoodsEaten2 = 0;
        this.directionChangeCount1 = 0;
        this.directionChangeCount2 = 0;
        this.currentSpeed1 = this.baseSpeed;
        this.currentSpeed2 = this.baseSpeed;
        this.gameState = 'idle';

        this.reverseFoodsEaten1 = 0;
        this.reverseFoodsEaten2 = 0;
        this.minusFoodsEaten1 = 0;
        this.minusFoodsEaten2 = 0;
        this.hitObstacle = false;
        this.minusComboTriggered = false;
        this.uniqueFoodsEaten = new Set();
        this.headOnCollisionHappened = false;

        this.snake1Dead = false;
        this.snake2Dead = false;
        this.drawGame = null;

        this.headOnCollision = false;
        this.headCollisionCount = 0;

        this.isAccelerating1 = false;
        this.isAccelerating2 = false;
        this.accelerationStartTime1 = 0;
        this.accelerationStartTime2 = 0;
        this.lastShrinkTime1 = 0;
        this.lastShrinkTime2 = 0;
        this.lastMoveTime1 = 0;
        this.lastMoveTime2 = 0;
        this.heldKeys1.clear();
        this.heldKeys2.clear();
        this.cancelHoldTimeout(1);
        this.cancelHoldTimeout(2);

        if (this.reverseTimeout1) {
            clearTimeout(this.reverseTimeout1);
            this.reverseTimeout1 = null;
        }
        if (this.reverseTimeout2) {
            clearTimeout(this.reverseTimeout2);
            this.reverseTimeout2 = null;
        }

        this.spawnFood();
        this.updateScoreDisplay();
        this.updateTimeDisplay();
        this.updateStartButton();
        this.updateGameMessage('');
    }

    startGame(shouldReset = true) {
        if (shouldReset) {
            this.resetGame();
            this.modeStates[this.gameMode] = null;
        }
        this.closeGameOverModal();
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.lastMoveTime1 = Date.now();
        this.lastMoveTime2 = Date.now();
        this.startGameLoop();
        this.startTimeCounter();
        this.updateStartButton();
        document.getElementById('endBtn').disabled = false;
        this.disablePlayerButtons(true);
    }

    pauseGame() {
        this.gameState = 'paused';
        this.stopGameLoop();
        this.stopTimeCounter();
        this.isAccelerating1 = false;
        this.isAccelerating2 = false;
        this.heldKeys1.clear();
        this.heldKeys2.clear();
        this.cancelHoldTimeout(1);
        this.cancelHoldTimeout(2);
        this.updateStartButton();
        this.updateGameMessage('游戏已暂停');
    }

    resumeGame() {
        this.gameState = 'playing';
        this.gameStartTime = Date.now() - (this.elapsedTime * 1000);
        this.lastMoveTime1 = Date.now();
        this.lastMoveTime2 = Date.now();
        this.startGameLoop();
        this.startTimeCounter();
        this.updateStartButton();
        this.updateGameMessage('');
    }

    endGame() {
        this.stopGameLoop();
        this.stopTimeCounter();

        if (this.reverseTimeout1) {
            clearTimeout(this.reverseTimeout1);
            this.reverseTimeout1 = null;
        }
        if (this.reverseTimeout2) {
            clearTimeout(this.reverseTimeout2);
            this.reverseTimeout2 = null;
        }
        this.isReversed1 = false;
        this.isReversed2 = false;

        this.isAccelerating1 = false;
        this.isAccelerating2 = false;
        this.heldKeys1.clear();
        this.heldKeys2.clear();
        this.cancelHoldTimeout(1);
        this.cancelHoldTimeout(2);

        this.modeStates[this.gameMode] = null;

        this.checkAchievements();
        this.saveScore();

        const isDraw = this.drawGame === true;
        const snake1Died = this.snake1Dead;
        const snake2Died = this.snake2Dead;
        const playerMode = this.playerMode;
        const finalScore1 = this.score1;
        const finalScore2 = this.score2;

        this.resetGame();

        this.updateStartButton();
        document.getElementById('endBtn').disabled = true;
        this.disablePlayerButtons(false);

        this.showGameOverModal(isDraw, snake1Died, snake2Died, playerMode, finalScore1, finalScore2);
    }

    showGameOverModal(isDraw, snake1Died, snake2Died, playerMode, score1, score2) {
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const content = document.getElementById('gameOverContent');

        let resultText = '';
        let titleText = '💀 游戏结束';

        if (playerMode === 'double') {
            if (isDraw) {
                resultText = '🤝 平局！';
                titleText = '💀 游戏结束 - 平局';
            } else if (snake1Died && !snake2Died) {
                resultText = '🎉 玩家2获胜！';
                titleText = '💀 游戏结束 - 玩家2胜';
            } else if (snake2Died && !snake1Died) {
                resultText = '🎉 玩家1获胜！';
                titleText = '💀 游戏结束 - 玩家1胜';
            } else {
                resultText = '🤝 平局！';
                titleText = '💀 游戏结束 - 平局';
            }
        } else {
            resultText = '💀 游戏结束！';
        }

        title.textContent = titleText;

        if (playerMode === 'double') {
            content.innerHTML = `
                <div class="result-line">${resultText}</div>
                <div class="score-line">玩家1得分: <strong>${score1}</strong></div>
                <div class="score-line">玩家2得分: <strong>${score2}</strong></div>
            `;
        } else {
            content.innerHTML = `
                <div class="result-line">${resultText}</div>
                <div class="score-line">最终得分: <strong>${score1}</strong></div>
            `;
        }

        modal.classList.add('show');
    }

    closeGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        modal.classList.remove('show');
        this.updateGameMessage('');
    }

    startGameLoop() {
        this.stopGameLoop();
        this.gameInterval = setInterval(() => this.gameLoop(), 30);
    }

    stopGameLoop() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }

    startTimeCounter() {
        this.stopTimeCounter();
        this.timeInterval = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
            this.updateTimeDisplay();
        }, 1000);
    }

    stopTimeCounter() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
            this.timeInterval = null;
        }
    }

    shouldMove(player) {
        const now = Date.now();
        const isAccelerating = player === 1 ? this.isAccelerating1 : this.isAccelerating2;
        const lastMoveTime = player === 1 ? this.lastMoveTime1 : this.lastMoveTime2;
        const currentSpeed = player === 1 ? this.currentSpeed1 : this.currentSpeed2;
        const interval = isAccelerating ? this.acceleratedSpeed : currentSpeed;

        if (now - lastMoveTime >= interval) {
            if (player === 1) {
                this.lastMoveTime1 = now;
            } else {
                this.lastMoveTime2 = now;
            }
            return true;
        }
        return false;
    }

    gameLoop() {
        const shouldMove1 = this.shouldMove(1);
        const shouldMove2 = this.playerMode === 'double' ? this.shouldMove(2) : false;

        if (shouldMove1 && this.directionQueue1.length > 0) {
            const nextDir = this.directionQueue1.shift();
            if (nextDir.x !== -this.direction1.x || nextDir.y !== -this.direction1.y) {
                if (nextDir.x !== this.direction1.x || nextDir.y !== this.direction1.y) {
                    this.directionChangeCount1++;
                }
                this.direction1 = { ...nextDir };
            }
        }

        if (shouldMove2 && this.directionQueue2.length > 0) {
            const nextDir = this.directionQueue2.shift();
            if (nextDir.x !== -this.direction2.x || nextDir.y !== -this.direction2.y) {
                if (nextDir.x !== this.direction2.x || nextDir.y !== this.direction2.y) {
                    this.directionChangeCount2++;
                }
                this.direction2 = { ...nextDir };
            }
        }

        if (this.playerMode === 'double') {
            if (this.headOnCollision) {
                this.handleHeadCollisionPhase();
            } else {
                if (shouldMove1) this.moveSnake1();
                if (shouldMove2) this.moveSnake2();
                if (shouldMove1 || shouldMove2) {
                    this.checkDoublePlayerCollision();
                }
            }
        } else {
            if (shouldMove1) {
                this.moveSnake1();
                if (this.checkCollision(1)) {
                    this.snake1Dead = true;
                }
            }
        }

        if (this.playerMode === 'double') {
            if (this.snake1Dead || this.snake2Dead) {
                this.endGame();
                return;
            }
        } else {
            if (this.snake1Dead) {
                this.endGame();
                return;
            }
        }

        if (!this.headOnCollision) {
            if (!this.snake1Dead) {
                this.checkFoodCollision(1);
            }
            if (this.playerMode === 'double' && !this.snake2Dead) {
                this.checkFoodCollision(2);
            }
        }

        if (this.isAccelerating1 && !this.snake1Dead) {
            const now = Date.now();
            const holdDuration = now - this.accelerationStartTime1;
            if (holdDuration >= this.shrinkStartDelay && this.snake1.length > 3) {
                if (now - this.lastShrinkTime1 >= this.shrinkInterval) {
                    this.snake1.pop();
                    this.lastShrinkTime1 = now;
                }
            }
        }

        if (this.playerMode === 'double' && this.isAccelerating2 && !this.snake2Dead) {
            const now = Date.now();
            const holdDuration = now - this.accelerationStartTime2;
            if (holdDuration >= this.shrinkStartDelay && this.snake2.length > 3) {
                if (now - this.lastShrinkTime2 >= this.shrinkInterval) {
                    this.snake2.pop();
                    this.lastShrinkTime2 = now;
                }
            }
        }

        this.updateSpeed();
        this.updateMovingObstacles();
        this.checkObstacleSpawn();
        this.render();
    }

    checkDoublePlayerCollision() {
        const head1 = this.snake1[0];
        const head2 = this.snake2[0];
        const prevHead1 = {
            x: head1.x - this.direction1.x,
            y: head1.y - this.direction1.y
        };
        const prevHead2 = {
            x: head2.x - this.direction2.x,
            y: head2.y - this.direction2.y
        };

        if (this.checkWallCollision(1)) {
            this.snake1Dead = true;
            this.drawGame = false;
            return;
        }
        if (this.checkWallCollision(2)) {
            this.snake2Dead = true;
            this.drawGame = false;
            return;
        }

        if (this.checkSelfCollision(1) || this.checkObstacleCollision(1)) {
            this.snake1Dead = true;
            this.drawGame = false;
            return;
        }
        if (this.checkSelfCollision(2) || this.checkObstacleCollision(2)) {
            this.snake2Dead = true;
            this.drawGame = false;
            return;
        }

        const headOnHead = head1.x === head2.x && head1.y === head2.y;

        if (headOnHead) {
            const facingEachOther = (this.direction1.x === -this.direction2.x && this.direction1.y === -this.direction2.y);
            
            if (facingEachOther) {
                this.headOnCollision = true;
                this.headCollisionCount = 0;
                this.handleHeadCollisionPhase();
                return;
            }
            
            const crossedPaths = (head1.x === prevHead2.x && head1.y === prevHead2.y && 
                                head2.x === prevHead1.x && head2.y === prevHead1.y);
            
            if (crossedPaths) {
                if (this.direction1.x === -this.direction2.x && this.direction1.y === -this.direction2.y) {
                    this.headOnCollision = true;
                    this.headCollisionCount = 0;
                    this.handleHeadCollisionPhase();
                    return;
                }
            }
            
            this.snake1Dead = true;
            this.snake2Dead = true;
            this.drawGame = true;
            return;
        }

        const swappedPositions = (head1.x === prevHead2.x && head1.y === prevHead2.y && 
                                head2.x === prevHead1.x && head2.y === prevHead1.y);
        
        if (swappedPositions) {
            if (this.direction1.x === -this.direction2.x && this.direction1.y === -this.direction2.y) {
                this.headOnCollision = true;
                this.headCollisionCount = 0;
                this.handleHeadCollisionPhase();
                return;
            }
        }

        for (let i = 1; i < this.snake2.length; i++) {
            if (this.snake2[i].x === head1.x && this.snake2[i].y === head1.y) {
                this.snake1Dead = true;
                this.drawGame = false;
                return;
            }
        }

        for (let i = 1; i < this.snake1.length; i++) {
            if (this.snake1[i].x === head2.x && this.snake1[i].y === head2.y) {
                this.snake2Dead = true;
                this.drawGame = false;
                return;
            }
        }
    }

    isHeadHittingBodyFromFront(headPlayer, bodyPlayer) {
        const headSnake = headPlayer === 1 ? this.snake1 : this.snake2;
        const bodySnake = bodyPlayer === 1 ? this.snake1 : this.snake2;
        const headDir = headPlayer === 1 ? this.direction1 : this.direction2;
        const bodyDir = bodyPlayer === 1 ? this.direction1 : this.direction2;

        const head = headSnake[0];
        
        const prevHead = {
            x: head.x - headDir.x,
            y: head.y - headDir.y
        };

        for (let i = 1; i < bodySnake.length; i++) {
            if (bodySnake[i].x === head.x && bodySnake[i].y === head.y) {
                return true;
            }
        }

        return false;
    }

    handleHeadCollisionPhase() {
        this.headOnCollisionHappened = true;

        if (this.checkWallCollision(1)) {
            this.snake1Dead = true;
            this.snake2Dead = false;
            this.drawGame = false;
            this.headOnCollision = false;
            return;
        }
        if (this.checkWallCollision(2)) {
            this.snake2Dead = true;
            this.snake1Dead = false;
            this.drawGame = false;
            this.headOnCollision = false;
            return;
        }

        this.headCollisionCount++;
        
        this.snake1.pop();
        this.snake2.pop();

        if (this.snake1.length < 3 && this.snake2.length < 3) {
            this.drawGame = true;
            this.snake1Dead = true;
            this.snake2Dead = true;
            this.headOnCollision = false;
            return;
        }
        
        if (this.snake1.length < 3) {
            this.snake1Dead = true;
            this.snake2Dead = false;
            this.drawGame = false;
            this.headOnCollision = false;
            return;
        }
        
        if (this.snake2.length < 3) {
            this.snake2Dead = true;
            this.snake1Dead = false;
            this.drawGame = false;
            this.headOnCollision = false;
            return;
        }

        const head1 = this.snake1[0];
        const head2 = this.snake2[0];
        
        const dir1Changed = (this.directionQueue1.length > 0);
        const dir2Changed = (this.directionQueue2.length > 0);

        if (dir1Changed || dir2Changed) {
            this.headOnCollision = false;
            
            if (dir1Changed && !dir2Changed) {
                for (let i = 1; i < this.snake1.length; i++) {
                    if (this.snake1[i].x === head2.x && this.snake1[i].y === head2.y) {
                        this.snake2Dead = true;
                        this.snake1Dead = false;
                        this.drawGame = false;
                        return;
                    }
                }
            }
            
            if (dir2Changed && !dir1Changed) {
                for (let i = 1; i < this.snake2.length; i++) {
                    if (this.snake2[i].x === head1.x && this.snake2[i].y === head1.y) {
                        this.snake1Dead = true;
                        this.snake2Dead = false;
                        this.drawGame = false;
                        return;
                    }
                }
            }
        }
    }

    checkWallCollision(player) {
        const snake = player === 1 ? this.snake1 : this.snake2;
        const head = snake[0];
        return head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount;
    }

    checkSelfCollision(player) {
        const snake = player === 1 ? this.snake1 : this.snake2;
        const head = snake[0];
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                return true;
            }
        }
        return false;
    }

    checkObstacleCollision(player) {
        const snake = player === 1 ? this.snake1 : this.snake2;
        const head = snake[0];

        for (const obs of this.obstacles) {
            if (obs.x === head.x && obs.y === head.y) {
                this.hitObstacle = true;
                return true;
            }
        }

        for (const obs of this.movingObstacles) {
            const obsX = Math.round(obs.x);
            const obsY = Math.round(obs.y);
            if (head.x >= obsX && head.x < obsX + 2 && head.y >= obsY && head.y < obsY + 2) {
                this.hitObstacle = true;
                return true;
            }
        }

        return false;
    }

    headHitsObstacle(player) {
        const snake = player === 1 ? this.snake1 : this.snake2;
        const head = snake[0];

        for (const obs of this.obstacles) {
            if (obs.x === head.x && obs.y === head.y) return true;
        }

        for (const obs of this.movingObstacles) {
            const obsX = Math.round(obs.x);
            const obsY = Math.round(obs.y);
            if (head.x >= obsX && head.x < obsX + 2 && head.y >= obsY && head.y < obsY + 2) return true;
        }

        return false;
    }


    moveSnake1() {
        const head = { ...this.snake1[0] };
        head.x += this.direction1.x;
        head.y += this.direction1.y;
        this.snake1.unshift(head);
        this.snake1.pop();
    }

    moveSnake2() {
        const head = { ...this.snake2[0] };
        head.x += this.direction2.x;
        head.y += this.direction2.y;
        this.snake2.unshift(head);
        this.snake2.pop();
    }

    checkCollision(player) {
        const snake = player === 1 ? this.snake1 : this.snake2;
        const head = snake[0];

        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }

        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) {
                return true;
            }
        }

        if (this.playerMode === 'double') {
            const otherSnake = player === 1 ? this.snake2 : this.snake1;
            for (let i = 0; i < otherSnake.length; i++) {
                if (otherSnake[i].x === head.x && otherSnake[i].y === head.y) {
                    return true;
                }
            }
        }

        for (const obs of this.obstacles) {
            if (obs.x === head.x && obs.y === head.y) {
                this.hitObstacle = true;
                return true;
            }
        }

        for (const obs of this.movingObstacles) {
            const obsX = Math.round(obs.x);
            const obsY = Math.round(obs.y);
            if (head.x >= obsX && head.x < obsX + 2 && head.y >= obsY && head.y < obsY + 2) {
                this.hitObstacle = true;
                return true;
            }
        }

        return false;
    }

    checkFoodCollision(player) {
        const snake = player === 1 ? this.snake1 : this.snake2;
        const head = snake[0];

        for (let i = this.foods.length - 1; i >= 0; i--) {
            const food = this.foods[i];
            if (head.x === food.x && head.y === food.y) {
                this.eatFood(food, i, player);
            }
        }
    }

    eatFood(food, index, player) {
        if (food.type === 'gold' && food.hits > 1) {
            food.hits--;
            return;
        }

        if (food.type === 'purple' && food.hits > 1) {
            food.hits--;
            return;
        }

        this.foods.splice(index, 1);

        let growth = 1;
        let points = 10;

        const snake = player === 1 ? this.snake1 : this.snake2;
        const lastFoodType = player === 1 ? this.lastFoodType1 : this.lastFoodType2;

        switch (food.type) {
            case 'normal':
                growth = 1;
                points = 10;
                if (player === 1) this.foodsEaten1++;
                else this.foodsEaten2++;
                break;
            case 'gold':
                growth = 3;
                points = 30;
                if (player === 1) { this.goldFoodsEaten1++; this.foodsEaten1++; }
                else { this.goldFoodsEaten2++; this.foodsEaten2++; }
                break;
            case 'purple':
                growth = 6;
                points = 60;
                if (player === 1) { this.purpleFoodsEaten1++; this.foodsEaten1++; }
                else { this.purpleFoodsEaten2++; this.foodsEaten2++; }
                break;
            case 'minus':
                if (lastFoodType === 'minus') {
                    growth = 3;
                    points = 30;
                    this.minusComboTriggered = true;
                } else {
                    growth = -3;
                    points = -30;
                    if (snake.length <= 3) {
                        if (player === 1) this.snake1Dead = true;
                        else this.snake2Dead = true;
                        return;
                    }
                }
                if (player === 1) { this.minusFoodsEaten1++; this.foodsEaten1++; }
                else { this.minusFoodsEaten2++; this.foodsEaten2++; }
                break;
            case 'reverse':
                growth = 1;
                points = 20;
                if (player === 1) {
                    this.activateReverseControls(1);
                    this.reverseFoodsEaten1++;
                    this.foodsEaten1++;
                } else {
                    this.activateReverseControls(2);
                    this.reverseFoodsEaten2++;
                    this.foodsEaten2++;
                }
                break;
            case 'obstacle':
                growth = 1;
                points = 10;
                if (player === 1) this.foodsEaten1++;
                else this.foodsEaten2++;
                break;
        }

        if (player === 1) {
            this.lastFoodType1 = food.type;
        } else {
            this.lastFoodType2 = food.type;
        }

        if (food.type !== 'obstacle') {
            this.uniqueFoodsEaten.add(food.type);
        }

        if (growth > 0) {
            for (let i = 0; i < growth; i++) {
                snake.push({ ...snake[snake.length - 1] });
            }
        } else if (growth < 0) {
            const removeCount = Math.abs(growth);
            for (let i = 0; i < removeCount && snake.length > 3; i++) {
                snake.pop();
            }
        }

        if (player === 1) {
            this.score1 += points;
            if (this.score1 < 0) this.score1 = 0;
        } else {
            this.score2 += points;
            if (this.score2 < 0) this.score2 = 0;
        }

        this.updateScoreDisplay();
        this.spawnFood();
    }

    activateReverseControls(player) {
        if (player === 1) {
            this.reverseControls1 = true;
            this.isReversed1 = true;
            if (this.reverseTimeout1) {
                clearTimeout(this.reverseTimeout1);
            }
            this.reverseTimeout1 = setTimeout(() => {
                this.reverseControls1 = false;
                this.isReversed1 = false;
            }, 10000);
        } else {
            this.reverseControls2 = true;
            this.isReversed2 = true;
            if (this.reverseTimeout2) {
                clearTimeout(this.reverseTimeout2);
            }
            this.reverseTimeout2 = setTimeout(() => {
                this.reverseControls2 = false;
                this.isReversed2 = false;
            }, 10000);
        }
    }

    spawnFood() {
        const maxFoods = this.gameMode === 'normal' ? 1 : (this.gameMode === 'fun' ? 3 : 4);

        while (this.foods.length < maxFoods) {
            let x, y;
            let attempts = 0;

            do {
                x = Math.floor(Math.random() * this.tileCount);
                y = Math.floor(Math.random() * this.tileCount);
                attempts++;
            } while (attempts < 100 && (this.isOccupied(x, y)));

            if (attempts >= 100) break;

            let type = 'normal';

            if (this.gameMode === 'fun' || this.gameMode === 'challenge') {
                const rand = Math.random();
                if (rand < 0.6) type = 'normal';
                else if (rand < 0.8) type = 'gold';
                else type = 'purple';
            }

            if (this.gameMode === 'challenge') {
                const rand = Math.random();
                if (rand < 0.5625) type = 'normal';
                else if (rand < 0.65625) type = 'gold';
                else if (rand < 0.75) type = 'purple';
                else if (rand < 0.875) type = 'minus';
                else type = 'reverse';
            }

            const food = { x, y, type };

            if (type === 'gold') food.hits = 2;
            if (type === 'purple') food.hits = 3;

            this.foods.push(food);
        }
    }

    isOccupied(x, y) {
        for (const segment of this.snake1) {
            if (segment.x === x && segment.y === y) return true;
        }
        for (const segment of this.snake2) {
            if (segment.x === x && segment.y === y) return true;
        }
        for (const food of this.foods) {
            if (food.x === x && food.y === y) return true;
        }
        for (const obs of this.obstacles) {
            if (obs.x === x && obs.y === y) return true;
        }
        return false;
    }

    checkObstacleSpawn() {
        if (this.gameMode !== 'challenge') return;

        const totalScore = this.score1 + this.score2;
        const scoreMilestone = Math.floor(totalScore / 150) * 150;
        const timeMilestone = Math.floor(this.elapsedTime / 30) * 30;

        let shouldSpawn = false;

        if (scoreMilestone > this.lastObstacleScore && scoreMilestone > 0) {
            this.lastObstacleScore = scoreMilestone;
            shouldSpawn = true;
        }

        if (timeMilestone > this.lastObstacleTime && timeMilestone > 0) {
            this.lastObstacleTime = timeMilestone;
            shouldSpawn = true;
        }

        if (shouldSpawn) {
            this.spawnObstacle();
        }

        if (this.movingObstacles.length < 3 && Math.random() < 0.002) {
            this.spawnMovingObstacle();
        }
    }

    spawnObstacle() {
        let x, y;
        let attempts = 0;

        do {
            x = Math.floor(Math.random() * this.tileCount);
            y = Math.floor(Math.random() * this.tileCount);
            attempts++;
        } while (attempts < 100 && (this.isOccupied(x, y) || this.isNearSnake(x, y)));

        if (attempts < 100) {
            this.obstacles.push({ x, y });
        }
    }

    spawnMovingObstacle() {
        let x, y;
        let attempts = 0;

        do {
            x = Math.floor(Math.random() * (this.tileCount - 1));
            y = Math.floor(Math.random() * (this.tileCount - 1));
            attempts++;
        } while (attempts < 100 && (this.isOccupied(x, y) || this.isOccupied(x + 1, y) ||
                 this.isOccupied(x, y + 1) || this.isOccupied(x + 1, y + 1) ||
                 this.isNearSnake(x, y)));

        if (attempts < 100) {
            this.movingObstacles.push({
                x, y,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                lifetime: 20000,
                spawnTime: Date.now()
            });
        }
    }

    isNearSnake(x, y) {
        for (const segment of this.snake1) {
            if (Math.abs(segment.x - x) <= 3 && Math.abs(segment.y - y) <= 3) {
                return true;
            }
        }
        for (const segment of this.snake2) {
            if (Math.abs(segment.x - x) <= 3 && Math.abs(segment.y - y) <= 3) {
                return true;
            }
        }
        return false;
    }

    saveCurrentModeState() {
        if (this.gameState === 'idle') {
            return null;
        }

        return {
            snake1: [...this.snake1],
            snake2: [...this.snake2],
            direction1: { ...this.direction1 },
            direction2: { ...this.direction2 },
            nextDirection1: { ...this.nextDirection1 },
            nextDirection2: { ...this.nextDirection2 },
            directionQueue1: this.directionQueue1.map(d => ({ ...d })),
            directionQueue2: this.directionQueue2.map(d => ({ ...d })),
            foods: [...this.foods],
            score1: this.score1,
            score2: this.score2,
            elapsedTime: this.elapsedTime,
            gameState: this.gameState,
            obstacles: [...this.obstacles],
            lastObstacleScore: this.lastObstacleScore,
            lastObstacleTime: this.lastObstacleTime,
            movingObstacles: this.movingObstacles.map(obs => ({ ...obs })),
            reverseControls1: this.reverseControls1,
            reverseControls2: this.reverseControls2,
            isReversed1: this.isReversed1,
            isReversed2: this.isReversed2,
            lastFoodType1: this.lastFoodType1,
            lastFoodType2: this.lastFoodType2,
            foodsEaten1: this.foodsEaten1,
            foodsEaten2: this.foodsEaten2,
            goldFoodsEaten1: this.goldFoodsEaten1,
            goldFoodsEaten2: this.goldFoodsEaten2,
            purpleFoodsEaten1: this.purpleFoodsEaten1,
            purpleFoodsEaten2: this.purpleFoodsEaten2,
            directionChangeCount1: this.directionChangeCount1,
            directionChangeCount2: this.directionChangeCount2,
            currentSpeed1: this.currentSpeed1,
            currentSpeed2: this.currentSpeed2,
            snake1Dead: this.snake1Dead,
            snake2Dead: this.snake2Dead,
            drawGame: this.drawGame,
            headOnCollision: this.headOnCollision,
            headCollisionCount: this.headCollisionCount,
            playerMode: this.playerMode,
            reverseFoodsEaten1: this.reverseFoodsEaten1,
            reverseFoodsEaten2: this.reverseFoodsEaten2,
            minusFoodsEaten1: this.minusFoodsEaten1,
            minusFoodsEaten2: this.minusFoodsEaten2,
            hitObstacle: this.hitObstacle,
            minusComboTriggered: this.minusComboTriggered,
            uniqueFoodsEaten: [...this.uniqueFoodsEaten],
            headOnCollisionHappened: this.headOnCollisionHappened
        };
    }

    loadModeState(state) {
        if (!state) {
            this.resetGame();
            return;
        }

        this.snake1 = state.snake1.map(s => ({ ...s }));
        this.snake2 = state.snake2 ? state.snake2.map(s => ({ ...s })) : [];
        this.direction1 = { ...state.direction1 };
        this.direction2 = { ...state.direction2 };
        this.nextDirection1 = { ...state.nextDirection1 };
        this.nextDirection2 = { ...state.nextDirection2 };
        this.directionQueue1 = state.directionQueue1 ? state.directionQueue1.map(d => ({ ...d })) : [];
        this.directionQueue2 = state.directionQueue2 ? state.directionQueue2.map(d => ({ ...d })) : [];
        this.foods = state.foods.map(f => ({ ...f }));
        this.score1 = state.score1;
        this.score2 = state.score2 || 0;
        this.elapsedTime = state.elapsedTime;
        this.gameState = state.gameState === 'playing' ? 'paused' : state.gameState;
        this.obstacles = state.obstacles.map(o => ({ ...o }));
        this.lastObstacleScore = state.lastObstacleScore;
        this.lastObstacleTime = state.lastObstacleTime;
        this.movingObstacles = state.movingObstacles.map(obs => ({ ...obs }));
        this.reverseControls1 = state.reverseControls1;
        this.reverseControls2 = state.reverseControls2 || false;
        this.isReversed1 = state.isReversed1;
        this.isReversed2 = state.isReversed2 || false;
        this.lastFoodType1 = state.lastFoodType1;
        this.lastFoodType2 = state.lastFoodType2 || null;
        this.foodsEaten1 = state.foodsEaten1;
        this.foodsEaten2 = state.foodsEaten2 || 0;
        this.goldFoodsEaten1 = state.goldFoodsEaten1;
        this.goldFoodsEaten2 = state.goldFoodsEaten2 || 0;
        this.purpleFoodsEaten1 = state.purpleFoodsEaten1;
        this.purpleFoodsEaten2 = state.purpleFoodsEaten2 || 0;
        this.directionChangeCount1 = state.directionChangeCount1;
        this.directionChangeCount2 = state.directionChangeCount2 || 0;
        this.currentSpeed1 = state.currentSpeed1 || this.baseSpeed;
        this.currentSpeed2 = state.currentSpeed2 || this.baseSpeed;
        this.snake1Dead = state.snake1Dead || false;
        this.snake2Dead = state.snake2Dead || false;
        this.drawGame = state.drawGame || null;
        this.headOnCollision = state.headOnCollision || false;
        this.headCollisionCount = state.headCollisionCount || 0;
        this.reverseFoodsEaten1 = state.reverseFoodsEaten1 || 0;
        this.reverseFoodsEaten2 = state.reverseFoodsEaten2 || 0;
        this.minusFoodsEaten1 = state.minusFoodsEaten1 || 0;
        this.minusFoodsEaten2 = state.minusFoodsEaten2 || 0;
        this.hitObstacle = state.hitObstacle || false;
        this.minusComboTriggered = state.minusComboTriggered || false;
        this.uniqueFoodsEaten = new Set(state.uniqueFoodsEaten || []);
        this.headOnCollisionHappened = state.headOnCollisionHappened || state.headOnCollisionWon || false;
        if (state.playerMode) {
            this.playerMode = state.playerMode;
        }

        this.updateScoreDisplay();
        this.updateTimeDisplay();
        this.updateStartButton();
        document.getElementById('endBtn').disabled = this.gameState === 'idle';
    }

    updateMovingObstacles() {
        const now = Date.now();
        this.movingObstacles = this.movingObstacles.filter(obs => {
            if (now - obs.spawnTime > obs.lifetime) return false;

            obs.x += obs.vx;
            obs.y += obs.vy;

            if (obs.x < 0 || obs.x >= this.tileCount - 1) obs.vx *= -1;
            if (obs.y < 0 || obs.y >= this.tileCount - 1) obs.vy *= -1;

            return true;
        });
    }

    calculateSpeedForScore(score) {
        if (score < 50) {
            return 333;
        } else if (score < 100) {
            return 250;
        } else {
            return 200;
        }
    }

    updateSpeed() {
        const newSpeed1 = this.calculateSpeedForScore(this.score1);
        if (newSpeed1 !== this.currentSpeed1) {
            this.currentSpeed1 = newSpeed1;
        }

        if (this.playerMode === 'double') {
            const newSpeed2 = this.calculateSpeedForScore(this.score2);
            if (newSpeed2 !== this.currentSpeed2) {
                this.currentSpeed2 = newSpeed2;
            }
        }
    }

    render() {
        this.ctx.fillStyle = this.getCanvasBackground();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();
        this.drawObstacles();
        this.drawMovingObstacles();
        this.drawFoods();
        this.drawSnake1();
        if (this.playerMode === 'double') {
            this.drawSnake2();
        }
    }

    getCanvasBackground() {
        const theme = this.themeManager ? this.themeManager.currentTheme : 'classic';
        const backgrounds = {
            classic: '#1a1a2e',
            dark: '#0f0f23',
            ocean: '#162d3d',
            forest: '#1a2f23',
            retro: '#1a1a1a',
            pink: '#2d1f2a'
        };
        return backgrounds[theme] || '#1a1a2e';
    }

    getSnakeColor(player) {
        const theme = this.themeManager ? this.themeManager.currentTheme : 'classic';
        if (player === 2) {
            const colors = {
                classic: '#60a5fa',
                dark: '#f472b6',
                ocean: '#fbbf24',
                forest: '#fbbf24',
                retro: '#ef4444',
                pink: '#22c55e'
            };
            return colors[theme] || '#60a5fa';
        }
        const colors = {
            classic: '#4ade80',
            dark: '#9333ea',
            ocean: '#0ea5e9',
            forest: '#22c55e',
            retro: '#fbbf24',
            pink: '#f472b6'
        };
        return colors[theme] || '#4ade80';
    }

    getSnakeHeadColor(player) {
        const theme = this.themeManager ? this.themeManager.currentTheme : 'classic';
        if (player === 2) {
            const colors = {
                classic: '#3b82f6',
                dark: '#ec4899',
                ocean: '#f59e0b',
                forest: '#f59e0b',
                retro: '#dc2626',
                pink: '#16a34a'
            };
            return colors[theme] || '#3b82f6';
        }
        const colors = {
            classic: '#22c55e',
            dark: '#7c3aed',
            ocean: '#0284c7',
            forest: '#16a34a',
            retro: '#f59e0b',
            pink: '#ec4899'
        };
        return colors[theme] || '#22c55e';
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnakeSegment(segment, index, player, direction, isAccelerating, isReversed, snake) {
        const x = segment.x * this.gridSize;
        const y = segment.y * this.gridSize;

        const snakeColor = this.getSnakeColor(player);
        const headColor = this.getSnakeHeadColor(player);

        const shouldFlicker = isReversed && Math.floor(Date.now() / 200) % 2 === 0;
        const isShrinking = isAccelerating && (Date.now() - (player === 1 ? this.accelerationStartTime1 : this.accelerationStartTime2) >= this.shrinkStartDelay) && snake.length > 3;

        let fillColor;
        if (shouldFlicker) {
            fillColor = index === 0 ? '#f59e0b' : '#fbbf24';
        } else {
            fillColor = index === 0 ? headColor : snakeColor;
        }

        if (index === 0 && isAccelerating) {
            this.ctx.shadowColor = snakeColor;
            this.ctx.shadowBlur = 8;
        }

        this.ctx.fillStyle = fillColor;
        this.ctx.beginPath();
        const rectX = x + 1;
        const rectY = y + 1;
        const rectW = this.gridSize - 2;
        const rectH = this.gridSize - 2;
        const radius = 4;
        this.ctx.moveTo(rectX + radius, rectY);
        this.ctx.lineTo(rectX + rectW - radius, rectY);
        this.ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + radius);
        this.ctx.lineTo(rectX + rectW, rectY + rectH - radius);
        this.ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH);
        this.ctx.lineTo(rectX + radius, rectY + rectH);
        this.ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - radius);
        this.ctx.lineTo(rectX, rectY + radius);
        this.ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.shadowBlur = 0;

        if (isShrinking && index === snake.length - 1) {
            this.ctx.strokeStyle = '#fbbf24';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(rectX + 1, rectY + 1, rectW - 2, rectH - 2);
            this.ctx.lineWidth = 1;
        }

        if (index === 0) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            
            const eyeOffset = 5;
            const eyeHalfLen = 2;

            if (isAccelerating) {
                if (direction.x === 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.gridSize - eyeOffset - eyeHalfLen, y + eyeOffset - eyeHalfLen);
                    this.ctx.lineTo(x + this.gridSize - eyeOffset + eyeHalfLen, y + eyeOffset + eyeHalfLen);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.gridSize - eyeOffset - eyeHalfLen, y + this.gridSize - eyeOffset + eyeHalfLen);
                    this.ctx.lineTo(x + this.gridSize - eyeOffset + eyeHalfLen, y + this.gridSize - eyeOffset - eyeHalfLen);
                    this.ctx.stroke();
                } else if (direction.x === -1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + eyeOffset + eyeHalfLen, y + eyeOffset - eyeHalfLen);
                    this.ctx.lineTo(x + eyeOffset - eyeHalfLen, y + eyeOffset + eyeHalfLen);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + eyeOffset + eyeHalfLen, y + this.gridSize - eyeOffset + eyeHalfLen);
                    this.ctx.lineTo(x + eyeOffset - eyeHalfLen, y + this.gridSize - eyeOffset - eyeHalfLen);
                    this.ctx.stroke();
                } else if (direction.y === 1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + eyeOffset - eyeHalfLen, y + this.gridSize - eyeOffset - eyeHalfLen);
                    this.ctx.lineTo(x + eyeOffset + eyeHalfLen, y + this.gridSize - eyeOffset + eyeHalfLen);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.gridSize - eyeOffset + eyeHalfLen, y + this.gridSize - eyeOffset - eyeHalfLen);
                    this.ctx.lineTo(x + this.gridSize - eyeOffset - eyeHalfLen, y + this.gridSize - eyeOffset + eyeHalfLen);
                    this.ctx.stroke();
                } else {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + eyeOffset - eyeHalfLen, y + eyeOffset + eyeHalfLen);
                    this.ctx.lineTo(x + eyeOffset + eyeHalfLen, y + eyeOffset - eyeHalfLen);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + this.gridSize - eyeOffset + eyeHalfLen, y + eyeOffset + eyeHalfLen);
                    this.ctx.lineTo(x + this.gridSize - eyeOffset - eyeHalfLen, y + eyeOffset - eyeHalfLen);
                    this.ctx.stroke();
                }
            } else {
                this.ctx.fillStyle = '#fff';
                const eyeSize = 3;

                if (direction.x === 1) {
                    this.ctx.beginPath();
                    this.ctx.arc(x + this.gridSize - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                    this.ctx.arc(x + this.gridSize - eyeOffset, y + this.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (direction.x === -1) {
                    this.ctx.beginPath();
                    this.ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                    this.ctx.arc(x + eyeOffset, y + this.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (direction.y === 1) {
                    this.ctx.beginPath();
                    this.ctx.arc(x + eyeOffset, y + this.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    this.ctx.arc(x + this.gridSize - eyeOffset, y + this.gridSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(x + eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                    this.ctx.arc(x + this.gridSize - eyeOffset, y + eyeOffset, eyeSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
            this.ctx.lineWidth = 1;
        }
    }

    drawSnake1() {
        this.snake1.forEach((segment, index) => {
            this.drawSnakeSegment(segment, index, 1, this.direction1, this.isAccelerating1, this.isReversed1, this.snake1);
        });
    }

    drawSnake2() {
        if (this.snake2Dead) {
            this.ctx.globalAlpha = 0.5;
        }
        this.snake2.forEach((segment, index) => {
            this.drawSnakeSegment(segment, index, 2, this.direction2, this.isAccelerating2, this.isReversed2, this.snake2);
        });
        this.ctx.globalAlpha = 1;
    }

    drawFoods() {
        this.foods.forEach(food => {
            const x = food.x * this.gridSize + this.gridSize / 2;
            const y = food.y * this.gridSize + this.gridSize / 2;
            const radius = this.gridSize / 2 - 2;

            let color = '#ef4444';
            switch (food.type) {
                case 'gold': color = '#f59e0b'; break;
                case 'purple': color = '#8b5cf6'; break;
                case 'minus': color = '#10b981'; break;
                case 'reverse': color = '#06b6d4'; break;
                case 'obstacle': color = '#6b7280'; break;
            }

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();

            if (food.hits && food.hits > 1) {
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(food.hits.toString(), x, y);
            }
        });
    }

    drawObstacles() {
        this.obstacles.forEach(obs => {
            const x = obs.x * this.gridSize;
            const y = obs.y * this.gridSize;

            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
        });
    }

    drawMovingObstacles() {
        this.movingObstacles.forEach(obs => {
            const x = obs.x * this.gridSize;
            const y = obs.y * this.gridSize;

            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(x, y, this.gridSize * 2, this.gridSize * 2);
        });
    }

    updateScoreDisplay() {
        document.getElementById('currentScore').textContent = this.score1;
        if (this.playerMode === 'double') {
            document.getElementById('player2Score').textContent = this.score2;
        }
    }

    updateTimeDisplay() {
        const minutes = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (this.elapsedTime % 60).toString().padStart(2, '0');
        document.getElementById('gameTime').textContent = `${minutes}:${seconds}`;
    }

    updateStartButton() {
        const btn = document.getElementById('startBtn');
        if (this.gameState === 'idle' || this.gameState === 'gameover') {
            btn.textContent = '开始游戏';
        } else if (this.gameState === 'playing') {
            btn.textContent = '暂停游戏';
        } else if (this.gameState === 'paused') {
            btn.textContent = '继续游戏';
        }
    }

    updateGameMessage(msg) {
        document.getElementById('gameMessage').textContent = msg;
    }

    getCurrentHelpPage() {
        const cards = document.querySelectorAll('.help-card');
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].classList.contains('active')) {
                return i;
            }
        }
        return 0;
    }

    goToHelpPage(page) {
        const cards = document.querySelectorAll('.help-card');
        const dots = document.querySelectorAll('.help-page-dot');
        const prevBtn = document.getElementById('helpPrevBtn');
        const nextBtn = document.getElementById('helpNextBtn');
        const title = document.getElementById('helpModalTitle');

        const titles = [
            '🐍 游戏帮助 - 基本玩法',
            '🐍 游戏帮助 - 趣味模式',
            '🐍 游戏帮助 - 双人模式',
            '🐍 游戏帮助 - 祝福'
        ];

        cards.forEach((card, index) => {
            card.classList.toggle('active', index === page);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === page);
        });

        prevBtn.disabled = page === 0;
        nextBtn.disabled = page === cards.length - 1;

        if (title) {
            title.textContent = titles[page] || '🐍 游戏帮助';
        }
    }

    changeHelpPage(delta) {
        const current = this.getCurrentHelpPage();
        const total = document.querySelectorAll('.help-card').length;
        const newPage = Math.max(0, Math.min(total - 1, current + delta));
        this.goToHelpPage(newPage);
    }

    resetHelpPage() {
        this.goToHelpPage(0);
    }

    startHelpScroll() {
        if (this.helpScrollRafId) return;
        this.lastScrollTime = performance.now();
        const scrollSpeed = 150;
        const animate = (currentTime) => {
            if (!this.helpScrollTarget) return;
            const deltaTime = currentTime - this.lastScrollTime;
            this.lastScrollTime = currentTime;
            const scrollAmount = (scrollSpeed * deltaTime) / 1000;
            this.helpScrollTarget.scrollTop += this.helpScrollDirection * scrollAmount;
            this.helpScrollRafId = requestAnimationFrame(animate);
        };
        this.helpScrollRafId = requestAnimationFrame(animate);
    }

    stopHelpScroll() {
        if (this.helpScrollRafId) {
            cancelAnimationFrame(this.helpScrollRafId);
            this.helpScrollRafId = null;
        }
        this.helpScrollTarget = null;
        this.helpScrollDirection = 0;
    }

    startSettingsScroll() {
        if (this.settingsScrollRafId) return;
        this.lastSettingsScrollTime = performance.now();
        const scrollSpeed = 150;
        const animate = (currentTime) => {
            if (!this.settingsScrollTarget) return;
            const deltaTime = currentTime - this.lastSettingsScrollTime;
            this.lastSettingsScrollTime = currentTime;
            const scrollAmount = (scrollSpeed * deltaTime) / 1000;
            this.settingsScrollTarget.scrollTop += this.settingsScrollDirection * scrollAmount;
            this.settingsScrollRafId = requestAnimationFrame(animate);
        };
        this.settingsScrollRafId = requestAnimationFrame(animate);
    }

    stopSettingsScroll() {
        if (this.settingsScrollRafId) {
            cancelAnimationFrame(this.settingsScrollRafId);
            this.settingsScrollRafId = null;
        }
        this.settingsScrollTarget = null;
        this.settingsScrollDirection = 0;
    }

    disablePlayerButtons(disabled) {
        document.getElementById('singlePlayerBtn').disabled = disabled;
        document.getElementById('doublePlayerBtn').disabled = disabled;
    }

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('minimized');
        modal.classList.add('show');

        if (this.themeManager) {
            this.themeManager.updateThemeButtons();
        }

        if (this.achievementManager) {
            this.achievementManager.renderAchievements();
        }
    }

    closeSettingsModal() {
        document.getElementById('settingsModal').classList.remove('show');
        document.getElementById('minimizeBar').classList.remove('show');
    }

    minimizeSettingsModal() {
        document.getElementById('settingsModal').classList.add('minimized');
        document.getElementById('minimizeBar').classList.add('show');
    }

    restoreSettingsModal() {
        document.getElementById('settingsModal').classList.remove('minimized');
        document.getElementById('minimizeBar').classList.remove('show');
    }

    loadHighScores() {
        const scores = localStorage.getItem('snakeHighScores');
        if (scores) {
            const parsed = JSON.parse(scores);
            if (parsed.single && parsed.double) {
                this.highScores = parsed;
            } else {
                this.highScores = {
                    single: { normal: parsed.normal || [], fun: parsed.fun || [], challenge: parsed.challenge || [] },
                    double: { normal: [], fun: [], challenge: [] }
                };
                const modes = ['normal', 'fun', 'challenge'];
                modes.forEach(mode => {
                    if (parsed[mode]) {
                        parsed[mode].forEach(entry => {
                            const pm = entry.playerMode || 'single';
                            if (!this.highScores[pm]) this.highScores[pm] = { normal: [], fun: [], challenge: [] };
                            if (!this.highScores[pm][mode]) this.highScores[pm][mode] = [];
                            if (pm === 'double') {
                                this.highScores.double[mode].push(entry);
                            } else {
                                this.highScores.single[mode].push(entry);
                            }
                        });
                    }
                });
                localStorage.setItem('snakeHighScores', JSON.stringify(this.highScores));
            }
        } else {
            this.highScores = {
                single: { normal: [], fun: [], challenge: [] },
                double: { normal: [], fun: [], challenge: [] }
            };
        }
        this.updateHighScoreDisplay();
    }

    saveScore() {
        const entry = {
            score: this.playerMode === 'double' ? Math.max(this.score1, this.score2) : this.score1,
            score1: this.score1,
            score2: this.score2,
            playerMode: this.playerMode,
            date: new Date().toLocaleDateString('zh-CN'),
            time: this.elapsedTime,
            id: Date.now()
        };

        const pm = this.playerMode;
        if (!this.highScores[pm]) {
            this.highScores[pm] = { normal: [], fun: [], challenge: [] };
        }
        if (!this.highScores[pm][this.gameMode]) {
            this.highScores[pm][this.gameMode] = [];
        }

        this.highScores[pm][this.gameMode].push(entry);
        this.highScores[pm][this.gameMode].sort((a, b) => b.score - a.score);
        this.highScores[pm][this.gameMode] = this.highScores[pm][this.gameMode].slice(0, 10);

        localStorage.setItem('snakeHighScores', JSON.stringify(this.highScores));
        this.updateHighScoreDisplay();
    }

    getTopScores(mode, count = 3, playerMode = null) {
        const pm = playerMode || this.playerMode;
        const scores = (this.highScores[pm] && this.highScores[pm][mode]) || [];
        return scores.slice(0, count);
    }

    deleteHistoryEntry(mode, id, playerMode = null) {
        const pm = playerMode || this.playerMode;
        if (this.highScores[pm] && this.highScores[pm][mode]) {
            this.highScores[pm][mode] = this.highScores[pm][mode].filter(e => e.id !== id);
            localStorage.setItem('snakeHighScores', JSON.stringify(this.highScores));
        }
    }

    updateHighScoreDisplay() {
        const pm = this.playerMode;
        const scores = (this.highScores[pm] && this.highScores[pm][this.gameMode]) || [];
        const highScore = scores.length > 0 ? scores[0].score : 0;
        document.getElementById('highScore').textContent = highScore;
    }

    checkAchievements() {
        if (!this.achievementManager) return;

        const am = this.achievementManager;
        const totalFood = this.foodsEaten1 + this.foodsEaten2;
        const totalScore = this.score1 + this.score2;
        const totalMoves = this.directionChangeCount1 + this.directionChangeCount2;
        const totalGold = this.goldFoodsEaten1 + this.goldFoodsEaten2;
        const totalPurple = this.purpleFoodsEaten1 + this.purpleFoodsEaten2;
        const totalReverse = this.reverseFoodsEaten1 + this.reverseFoodsEaten2;
        const totalMinus = this.minusFoodsEaten1 + this.minusFoodsEaten2;

        am.triggerAchievement('first_game');
        am.incrementProgress('ten_games', 1);
        am.updateProgress('fifty_food', totalFood);
        am.updateProgress('hundred_moves', totalMoves);
        am.updateProgress('two_thousand_score', totalScore);
        am.updateProgress('five_thousand_score', totalScore);
        am.updateProgress('fifty_gold', totalGold);
        am.updateProgress('twenty_purple', totalPurple);
        am.incrementProgress('ten_reverse', totalReverse);
        am.incrementProgress('ten_minus', totalMinus);

        if (this.minusComboTriggered) {
            am.triggerAchievement('minus_combo');
        }

        if (this.gameMode === 'challenge') {
            am.triggerAchievement('first_challenge');
            am.incrementProgress('challenge_veteran', 1);
            am.updateProgress('challenge_master', totalScore);
        }

        if (this.gameMode === 'challenge' && !this.hitObstacle && this.elapsedTime >= 90) {
            am.triggerAchievement('stake_dodger');
        }

        if (!this.hitObstacle && totalScore >= 800) {
            am.triggerAchievement('perfect_run');
        }

        if (this.playerMode === 'double') {
            am.triggerAchievement('first_double');
            if (this.headOnCollisionHappened) {
                am.triggerAchievement('head_on_survivor');
            }
        }

        am.updateProgress('all_foods', this.uniqueFoodsEaten.size);

        const normalTop = this.getTopScores('normal', 1, this.playerMode);
        const funTop = this.getTopScores('fun', 1, this.playerMode);
        const challengeTop = this.getTopScores('challenge', 1, this.playerMode);

        let modesOver1200 = 0;
        if (normalTop.length > 0 && normalTop[0].score >= 1200) modesOver1200++;
        if (funTop.length > 0 && funTop[0].score >= 1200) modesOver1200++;
        if (challengeTop.length > 0 && challengeTop[0].score >= 1200) modesOver1200++;

        am.updateProgress('two_hundred_both', modesOver1200);
    }
}