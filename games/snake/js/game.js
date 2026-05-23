class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.cols = this.canvas.width / this.gridSize;
        this.rows = this.canvas.height / this.gridSize;
        
        this.foodTypes = {
            normal: { color: '#ef4444', points: 10, emoji: '🍎', weight: 50 },
            star: { color: '#fbbf24', points: 30, emoji: '⭐', weight: 15 },
            speed: { color: '#3b82f6', points: 15, emoji: '💨', weight: 15 },
            slow: { color: '#8b5cf6', points: 5, emoji: '🐢', weight: 10 },
            gift: { color: '#f472b6', points: 20, emoji: '🎁', weight: 10 }
        };
        
        this.gameModes = {
            classic: { label: '经典模式', hasWalls: true, speedMultiplier: 1 },
            endless: { label: '无尽模式', hasWalls: false, speedMultiplier: 1.2 }
        };
        
        this.food = null;
        this.score = 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.speedBoost = false;
        this.speedSlow = false;
        this.baseSpeed = 150;
        this.gameStarted = false;
        
        this.players = {
            p1: { snake: [], direction: null, nextDirection: null, alive: true, score: 0, name: '玩家1' },
            p2: { snake: [], direction: null, nextDirection: null, alive: true, score: 0, name: '玩家2' }
        };
        
        this.currentPlayer = 'p1';
        this.currentMode = 'classic';
        this.colors = {
            p1: { head: '#4ade80', body: '#22c55e', bodyAlt: '#16a34a', border: '#15803d' },
            p2: { head: '#60a5fa', body: '#3b82f6', bodyAlt: '#2563eb', border: '#1d4ed8' }
        };
        
        this.isTwoPlayer = false;
        
        this.scores = JSON.parse(localStorage.getItem('snakeScores') || '{}');
        if (!this.scores.p1) this.scores.p1 = { classic: [], endless: [] };
        if (!this.scores.p2) this.scores.p2 = { classic: [], endless: [] };
        
        this.newRecordShown = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updatePlayerButtons();
        this.updateModeButtons();
        this.drawInitialScreen();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('endBtn').addEventListener('click', () => this.endGame());
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('helpBtn').addEventListener('click', () => this.openHelp());
        
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.gameStarted || this.isGameOver) {
                    this.currentPlayer = btn.dataset.player;
                    this.updatePlayerButtons();
                    this.updateScoreDisplay();
                }
            });
        });
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.gameStarted || this.isGameOver) {
                    this.currentMode = btn.dataset.mode;
                    this.updateModeButtons();
                }
            });
        });
        
        document.getElementById('closeModal').addEventListener('click', () => this.closeSettings());
        document.getElementById('minimizeModal').addEventListener('click', () => this.minimizeModal());
        
        document.getElementById('closeHelpModal').addEventListener('click', () => this.closeHelp());
        document.getElementById('minimizeHelpModal').addEventListener('click', () => this.minimizeHelpModal());
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        this.initThemeSystem();
        this.initHelpPagination();
    }
    
    handleKeyDown(e) {
        if (!this.gameStarted || this.isGameOver) return;
        
        const key = e.key.toLowerCase();
        
        if (this.isTwoPlayer) {
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                e.preventDefault();
                this.setDirection(this.players.p1, key);
            }
            if (['w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
                const wasdMap = { w: 'arrowup', s: 'arrowdown', a: 'arrowleft', d: 'arrowright' };
                this.setDirection(this.players.p2, wasdMap[key]);
            }
        } else {
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
                e.preventDefault();
                const keyMap = { w: 'arrowup', s: 'arrowdown', a: 'arrowleft', d: 'arrowright' };
                const mappedKey = keyMap[key] || key;
                this.setDirection(this.players[this.currentPlayer], mappedKey);
            }
        }
        
        if (key === ' ') {
            e.preventDefault();
            this.togglePause();
        }
    }
    
    setDirection(player, direction) {
        const opposites = {
            'arrowup': 'arrowdown',
            'arrowdown': 'arrowup',
            'arrowleft': 'arrowright',
            'arrowright': 'arrowleft'
        };
        
        if (player.direction && opposites[direction] !== player.direction) {
            player.nextDirection = direction;
        } else if (!player.direction) {
            player.direction = direction;
            player.nextDirection = direction;
        }
    }
    
    initGame() {
        this.players.p1.snake = this.createSnake(5, 5);
        this.players.p1.direction = 'arrowright';
        this.players.p1.nextDirection = 'arrowright';
        this.players.p1.alive = true;
        this.players.p1.score = 0;
        
        if (this.isTwoPlayer) {
            this.players.p2.snake = this.createSnake(this.cols - 6, this.rows - 6);
            this.players.p2.direction = 'arrowleft';
            this.players.p2.nextDirection = 'arrowleft';
            this.players.p2.alive = true;
            this.players.p2.score = 0;
        }
        
        this.score = 0;
        this.speedBoost = false;
        this.speedSlow = false;
        this.isGameOver = false;
        this.isPaused = false;
        this.gameStarted = true;
        this.newRecordShown = false;
        
        this.food = this.generateFood();
        this.updateScoreDisplay();
        this.updateFoodLegend();
        
        document.getElementById('startBtn').textContent = '重新开始';
        document.getElementById('endBtn').disabled = false;
        document.getElementById('gameMessage').textContent = '';
        
        this.startGameLoop();
    }
    
    createSnake(startX, startY) {
        const snake = [];
        for (let i = 0; i < 5; i++) {
            snake.push({ x: startX + i, y: startY });
        }
        return snake;
    }
    
    generateFood() {
        let position;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            position = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
            attempts++;
        } while (this.isSnakePosition(position.x, position.y) && attempts < maxAttempts);
        
        const types = Object.keys(this.foodTypes);
        const weights = types.map(t => this.foodTypes[t].weight);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        let selectedType = types[0];
        for (let i = 0; i < types.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                selectedType = types[i];
                break;
            }
        }
        
        return {
            ...position,
            type: selectedType,
            ...this.foodTypes[selectedType]
        };
    }
    
    isSnakePosition(x, y) {
        for (const playerKey of ['p1', 'p2']) {
            if (playerKey === 'p2' && !this.isTwoPlayer) continue;
            for (const segment of this.players[playerKey].snake) {
                if (segment.x === x && segment.y === y) return true;
            }
        }
        return false;
    }
    
    moveSnakes() {
        if (this.isPaused || this.isGameOver) return;
        
        const playersToMove = this.isTwoPlayer ? ['p1', 'p2'] : [this.currentPlayer];
        
        for (const playerKey of playersToMove) {
            const player = this.players[playerKey];
            if (!player.alive) continue;
            
            if (player.nextDirection) {
                player.direction = player.nextDirection;
            }
            
            const head = { ...player.snake[player.snake.length - 1] };
            
            switch (player.direction) {
                case 'arrowup': head.y--; break;
                case 'arrowdown': head.y++; break;
                case 'arrowleft': head.x--; break;
                case 'arrowright': head.x++; break;
            }
            
            const mode = this.gameModes[this.currentMode];
            if (mode.hasWalls) {
                if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
                    player.alive = false;
                    continue;
                }
            } else {
                if (head.x < 0) head.x = this.cols - 1;
                if (head.x >= this.cols) head.x = 0;
                if (head.y < 0) head.y = this.rows - 1;
                if (head.y >= this.rows) head.y = 0;
            }
            
            for (const otherPlayerKey of playersToMove) {
                const otherPlayer = this.players[otherPlayerKey];
                if (!otherPlayer.alive) continue;
                
                for (let i = 0; i < otherPlayer.snake.length; i++) {
                    const segment = otherPlayer.snake[i];
                    if (segment.x === head.x && segment.y === head.y) {
                        if (i === otherPlayer.snake.length - 1 && otherPlayerKey !== playerKey) {
                        } else {
                            player.alive = false;
                            break;
                        }
                    }
                }
                if (!player.alive) break;
            }
            
            if (!player.alive) continue;
            
            player.snake.push(head);
            
            if (head.x === this.food.x && head.y === this.food.y) {
                this.applyFoodEffect(player, this.food);
                this.food = this.generateFood();
            } else {
                player.snake.shift();
            }
        }
        
        this.checkGameEnd();
    }
    
    applyFoodEffect(player, food) {
        player.score += food.points;
        
        switch (food.type) {
            case 'speed':
                this.speedBoost = true;
                this.speedSlow = false;
                setTimeout(() => this.speedBoost = false, 5000);
                break;
            case 'slow':
                this.speedSlow = true;
                this.speedBoost = false;
                setTimeout(() => this.speedSlow = false, 5000);
                break;
        }
        
        this.updateScoreDisplay();
    }
    
    checkGameEnd() {
        const playersToCheck = this.isTwoPlayer ? ['p1', 'p2'] : [this.currentPlayer];
        
        if (this.isTwoPlayer) {
            if (!this.players.p1.alive || !this.players.p2.alive) {
                this.endGame();
            }
        } else {
            if (!this.players[this.currentPlayer].alive) {
                this.endGame();
            }
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.food) {
            this.drawFood();
        }
        
        if (this.isTwoPlayer) {
            this.drawSnake(this.players.p1.snake, this.colors.p1);
            this.drawSnake(this.players.p2.snake, this.colors.p2);
        } else {
            this.drawSnake(this.players[this.currentPlayer].snake, this.colors[this.currentPlayer]);
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize + this.gridSize / 2;
        const y = this.food.y * this.gridSize + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.food.color;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(x - 3, y - 3, radius / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
    }
    
    drawSnake(snake, colors) {
        if (!snake || snake.length === 0) return;
        
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const padding = 1;
            
            this.ctx.beginPath();
            this.ctx.roundRect(
                x + padding,
                y + padding,
                this.gridSize - padding * 2,
                this.gridSize - padding * 2,
                4
            );
            
            if (i === snake.length - 1) {
                this.ctx.fillStyle = colors.head;
            } else if (i % 2 === 0) {
                this.ctx.fillStyle = colors.body;
            } else {
                this.ctx.fillStyle = colors.bodyAlt;
            }
            
            this.ctx.fill();
            this.ctx.strokeStyle = colors.border;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            if (i === snake.length - 1) {
                this.drawSnakeEyes(segment, colors);
            }
        }
    }
    
    drawSnakeEyes(head, colors) {
        const eyeSize = 3;
        const eyeOffset = 5;
        const centerX = head.x * this.gridSize + this.gridSize / 2;
        const centerY = head.y * this.gridSize + this.gridSize / 2;
        
        this.ctx.fillStyle = 'white';
        
        switch (this.players[this.currentPlayer].direction) {
            case 'arrowup':
                this.ctx.beginPath();
                this.ctx.arc(centerX - eyeOffset, centerY - 2, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(centerX + eyeOffset, centerY - 2, eyeSize, 0, Math.PI * 2);
                break;
            case 'arrowdown':
                this.ctx.beginPath();
                this.ctx.arc(centerX - eyeOffset, centerY + 2, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(centerX + eyeOffset, centerY + 2, eyeSize, 0, Math.PI * 2);
                break;
            case 'arrowleft':
                this.ctx.beginPath();
                this.ctx.arc(centerX - 2, centerY - eyeOffset, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(centerX - 2, centerY + eyeOffset, eyeSize, 0, Math.PI * 2);
                break;
            case 'arrowright':
                this.ctx.beginPath();
                this.ctx.arc(centerX + 2, centerY - eyeOffset, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(centerX + 2, centerY + eyeOffset, eyeSize, 0, Math.PI * 2);
                break;
        }
        this.ctx.fill();
        
        this.ctx.fillStyle = '#1a1a2e';
        switch (this.players[this.currentPlayer].direction) {
            case 'arrowup':
                this.ctx.beginPath();
                this.ctx.arc(centerX - eyeOffset, centerY - 3, 1.5, 0, Math.PI * 2);
                this.ctx.arc(centerX + eyeOffset, centerY - 3, 1.5, 0, Math.PI * 2);
                break;
            case 'arrowdown':
                this.ctx.beginPath();
                this.ctx.arc(centerX - eyeOffset, centerY + 3, 1.5, 0, Math.PI * 2);
                this.ctx.arc(centerX + eyeOffset, centerY + 3, 1.5, 0, Math.PI * 2);
                break;
            case 'arrowleft':
                this.ctx.beginPath();
                this.ctx.arc(centerX - 3, centerY - eyeOffset, 1.5, 0, Math.PI * 2);
                this.ctx.arc(centerX - 3, centerY + eyeOffset, 1.5, 0, Math.PI * 2);
                break;
            case 'arrowright':
                this.ctx.beginPath();
                this.ctx.arc(centerX + 3, centerY - eyeOffset, 1.5, 0, Math.PI * 2);
                this.ctx.arc(centerX + 3, centerY + eyeOffset, 1.5, 0, Math.PI * 2);
                break;
        }
        this.ctx.fill();
    }
    
    startGameLoop() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        
        this.gameLoop = setInterval(() => {
            this.moveSnakes();
            this.draw();
        }, this.getSpeed());
    }
    
    getSpeed() {
        let speed = this.baseSpeed;
        const mode = this.gameModes[this.currentMode];
        speed /= mode.speedMultiplier;
        
        if (this.speedBoost) speed /= 2;
        if (this.speedSlow) speed *= 1.5;
        
        return speed;
    }
    
    updateSpeed() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                this.moveSnakes();
                this.draw();
            }, this.getSpeed());
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('gameMessage').textContent = this.isPaused ? '游戏暂停 - 按空格键继续' : '';
    }
    
    endGame() {
        this.isGameOver = true;
        this.gameStarted = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.saveScore();
        
        let message = '';
        if (this.isTwoPlayer) {
            const p1 = this.players.p1;
            const p2 = this.players.p2;
            if (p1.alive && !p2.alive) {
                message = `🎉 玩家1获胜！ (${p1.score} vs ${p2.score})`;
            } else if (p2.alive && !p1.alive) {
                message = `🎉 玩家2获胜！ (${p2.score} vs ${p1.score})`;
            } else {
                message = `游戏结束！ ${p1.score} vs ${p2.score}`;
            }
        } else {
            const player = this.players[this.currentPlayer];
            const isNewRecord = this.isNewRecord(this.currentPlayer, this.currentMode, player.score);
            if (isNewRecord) {
                message = `🎉 恭喜！新纪录！最终得分: ${player.score}`;
            } else {
                const highScore = this.getHighScore(this.currentPlayer, this.currentMode);
                message = `游戏结束！最终得分: ${player.score} (最高: ${highScore})`;
            }
        }
        
        this.showGameOverModal(message);
        
        document.getElementById('startBtn').textContent = '开始游戏';
        document.getElementById('endBtn').disabled = true;
    }
    
    showGameOverModal(message) {
        const modal = document.getElementById('gameOverModal');
        const messageEl = document.getElementById('gameOverMessage');
        const scoreEl = document.getElementById('gameOverScore');
        
        let finalScore = 0;
        if (this.isTwoPlayer) {
            finalScore = Math.max(this.players.p1.score, this.players.p2.score);
        } else {
            finalScore = this.players[this.currentPlayer].score;
        }
        
        messageEl.textContent = message;
        scoreEl.textContent = finalScore;
        
        modal.classList.add('show');
    }
    
    hideGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        modal.classList.remove('show');
    }
    
    restartGame() {
        this.hideGameOverModal();
        this.startGame();
    }
    
    returnToMenu() {
        this.hideGameOverModal();
        this.resetToMenu();
    }
    
    resetToMenu() {
        this.isGameOver = false;
        this.gameStarted = false;
        this.isPaused = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.food = null;
        this.score = 0;
        this.speedBoost = false;
        this.speedSlow = false;
        
        document.getElementById('startBtn').textContent = '开始游戏';
        document.getElementById('endBtn').disabled = true;
        document.getElementById('gameMessage').textContent = '';
        
        this.drawInitialScreen();
    }
    
    saveScore() {
        const player = this.currentPlayer;
        const mode = this.currentMode;
        const score = this.players[player].score;
        const date = new Date().toLocaleString('zh-CN');
        
        if (score > 0) {
            if (!this.scores[player][mode]) {
                this.scores[player][mode] = [];
            }
            this.scores[player][mode].push({ score, date });
            this.scores[player][mode].sort((a, b) => b.score - a.score);
            this.scores[player][mode] = this.scores[player][mode].slice(0, 10);
            localStorage.setItem('snakeScores', JSON.stringify(this.scores));
        }
    }
    
    getHighScore(player, mode) {
        if (!this.scores[player] || !this.scores[player][mode] || this.scores[player][mode].length === 0) {
            return 0;
        }
        return this.scores[player][mode][0].score;
    }
    
    isNewRecord(player, mode, score) {
        if (!this.newRecordShown && score > 0) {
            const highScore = this.getHighScore(player, mode);
            return score >= highScore;
        }
        return false;
    }
    
    getScores(player, mode) {
        return this.scores[player]?.[mode] || [];
    }
    
    deleteScore(player, mode, index) {
        if (this.scores[player]?.[mode]?.[index]) {
            this.scores[player][mode].splice(index, 1);
            localStorage.setItem('snakeScores', JSON.stringify(this.scores));
            this.updateHistoryDisplay();
            this.updateScoreDisplay();
        }
    }
    
    clearScores(player) {
        if (confirm(`确定要清除${this.players[player].name}的所有历史记录吗？`)) {
            this.scores[player] = { classic: [], endless: [] };
            localStorage.setItem('snakeScores', JSON.stringify(this.scores));
            this.updateHistoryDisplay();
            this.updateScoreDisplay();
        }
    }
    
    updateScoreDisplay() {
        const player = this.players[this.currentPlayer];
        const highScore = this.getHighScore(this.currentPlayer, this.currentMode);
        document.getElementById('score').textContent = player.score;
        document.getElementById('highScore').textContent = highScore;
    }
    
    updatePlayerButtons() {
        document.querySelectorAll('.player-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.player === this.currentPlayer);
        });
        
        this.updateScoreDisplay();
    }
    
    updateModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.currentMode);
        });
    }
    
    updateFoodLegend() {
        const legend = document.getElementById('foodLegend');
        legend.innerHTML = '';
        
        Object.entries(this.foodTypes).forEach(([key, food]) => {
            const item = document.createElement('div');
            item.className = 'food-item';
            item.innerHTML = `
                <div class="food-dot" style="background: ${food.color}"></div>
                <span>${food.emoji} ${food.points}分</span>
            `;
            legend.appendChild(item);
        });
    }
    
    drawInitialScreen() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#4ade80';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🐍 贪吃蛇', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('按方向键控制蛇的移动', this.canvas.width / 2, this.canvas.height / 2 + 15);
        this.ctx.fillText('点击"开始游戏"按钮开始', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    startGame() {
        this.initGame();
        this.draw();
    }
    
    openSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('show');
        this.updateThemeButtons();
        this.updateAchievementsDisplay();
        this.updateHistoryDisplay();
    }
    
    closeSettings() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
    }
    
    minimizeModal() {
        const modal = document.getElementById('settingsModal');
        const minimizeBar = document.getElementById('minimizeBar');
        
        modal.classList.add('minimized');
        minimizeBar.classList.add('show');
    }
    
    restoreModal() {
        const modal = document.getElementById('settingsModal');
        const minimizeBar = document.getElementById('minimizeBar');
        
        modal.classList.remove('minimized');
        minimizeBar.classList.remove('show');
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabName}`);
        });
        
        if (tabName === 'history') {
            this.updateHistoryDisplay();
        }
    }
    
    updateHistoryDisplay() {
        const historyContent = document.getElementById('historyContent');
        historyContent.innerHTML = '';
        
        for (const playerKey of ['p1', 'p2']) {
            const player = this.players[playerKey];
            const playerScores = this.scores[playerKey];
            
            const playerSection = document.createElement('div');
            playerSection.className = 'history-player-section';
            
            const playerTitle = document.createElement('div');
            playerTitle.className = 'history-player-title';
            playerTitle.innerHTML = `<span>${player.name}</span>`;
            playerSection.appendChild(playerTitle);
            
            for (const modeKey of ['classic', 'endless']) {
                const mode = this.gameModes[modeKey];
                const scores = playerScores?.[modeKey] || [];
                
                const modeSection = document.createElement('div');
                modeSection.className = 'history-mode-section';
                
                const title = document.createElement('div');
                title.className = 'history-mode-title';
                title.innerHTML = `<span>🏆 ${mode.label}</span>`;
                modeSection.appendChild(title);
                
                if (scores.length > 0) {
                    const scoreList = document.createElement('div');
                    scoreList.className = 'history-list';
                    
                    scores.slice(0, 5).forEach((record, index) => {
                        const item = document.createElement('div');
                        item.className = 'history-item';
                        item.innerHTML = `
                            <div style="display: flex; align-items: center;">
                                <div class="history-rank rank-${index + 1}">${index + 1}</div>
                                <div class="history-info">
                                    <div class="history-score">${record.score}</div>
                                    <div class="history-date">${record.date}</div>
                                </div>
                            </div>
                            <button class="history-delete" title="删除记录" onclick="game.deleteScore('${playerKey}', '${modeKey}', ${index})">✕</button>
                        `;
                        scoreList.appendChild(item);
                    });
                    
                    modeSection.appendChild(scoreList);
                } else {
                    const noHistory = document.createElement('div');
                    noHistory.className = 'no-history';
                    noHistory.innerHTML = `<div class="no-history-icon">📊</div><div>暂无记录</div>`;
                    modeSection.appendChild(noHistory);
                }
                
                playerSection.appendChild(modeSection);
            }
            
            historyContent.appendChild(playerSection);
        }
    }
    
    initThemeSystem() {
        const currentTheme = localStorage.getItem('snakeTheme') || 'classic';
        this.applyTheme(currentTheme);
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.classList.contains('locked')) {
                    const theme = btn.dataset.theme;
                    this.applyTheme(theme);
                    localStorage.setItem('snakeTheme', theme);
                    this.updateThemeButtons();
                }
            });
        });
    }
    
    applyTheme(themeName) {
        document.body.className = '';
        if (themeName !== 'classic') {
            document.body.classList.add(`theme-${themeName}`);
        }
        this.currentTheme = themeName;
    }
    
    updateThemeButtons() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
        });
    }
    
    initAchievementsSystem() {
        this.achievements = [
            { id: 'first_game', name: '初试牛刀', desc: '完成第一局游戏', icon: '🎮', condition: (stats) => stats.gamesPlayed >= 1 },
            { id: 'score_100', name: '百分达成', desc: '单局得分达到100分', icon: '💯', condition: (stats) => stats.maxScore >= 100 },
            { id: 'score_200', name: '双百分', desc: '单局得分达到200分', icon: '🏆', condition: (stats) => stats.maxScore >= 200 },
            { id: 'score_500', name: '五百分大师', desc: '单局得分达到500分', icon: '🌟', condition: (stats) => stats.maxScore >= 500 },
            { id: 'length_20', name: '成长中', desc: '蛇身长度达到20', icon: '🐍', condition: (stats) => stats.maxLength >= 20 },
            { id: 'length_50', name: '长蛇', desc: '蛇身长度达到50', icon: '📏', condition: (stats) => stats.maxLength >= 50 },
            { id: 'games_10', name: '游戏达人', desc: '完成10局游戏', icon: '🎯', condition: (stats) => stats.gamesPlayed >= 10 },
            { id: 'games_50', name: '游戏狂热者', desc: '完成50局游戏', icon: '🔥', condition: (stats) => stats.gamesPlayed >= 50 },
            { id: 'new_record', name: '破纪录', desc: '刷新最高分', icon: '📈', condition: (stats) => stats.recordsBroken >= 1 },
            { id: 'star_collector', name: '星星收集者', desc: '收集10个星星', icon: '⭐', condition: (stats) => stats.starsCollected >= 10 },
            { id: 'endless_survivor', name: '无尽生存', desc: '在无尽模式存活60秒', icon: '♾️', condition: (stats) => stats.endlessSurvivalTime >= 60 },
            { id: 'wall_master', name: '穿墙大师', desc: '穿墙100次', icon: '🧱', condition: (stats) => stats.wallPasses >= 100 }
        ];
        
        this.stats = JSON.parse(localStorage.getItem('snakeStats') || '{}');
        this.unlockedAchievements = JSON.parse(localStorage.getItem('snakeUnlockedAchievements') || '[]');
        
        if (Object.keys(this.stats).length === 0) {
            this.stats = {
                gamesPlayed: 0,
                maxScore: 0,
                maxLength: 0,
                recordsBroken: 0,
                starsCollected: 0,
                endlessSurvivalTime: 0,
                wallPasses: 0
            };
        }
    }
    
    checkAchievements() {
        const newUnlocks = [];
        
        for (const achievement of this.achievements) {
            if (!this.unlockedAchievements.includes(achievement.id) && achievement.condition(this.stats)) {
                this.unlockedAchievements.push(achievement.id);
                newUnlocks.push(achievement);
            }
        }
        
        if (newUnlocks.length > 0) {
            localStorage.setItem('snakeUnlockedAchievements', JSON.stringify(this.unlockedAchievements));
            this.showAchievementNotification(newUnlocks);
            this.updateAchievementsDisplay();
        }
    }
    
    showAchievementNotification(achievements) {
        const container = document.getElementById('toastContainer');
        
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.innerHTML = `
                    <div class="toast-icon">${achievement.icon}</div>
                    <div class="toast-content">
                        <div class="toast-title">成就解锁！</div>
                        <div class="toast-message">${achievement.name} - ${achievement.desc}</div>
                    </div>
                `;
                container.appendChild(toast);
                
                setTimeout(() => {
                    toast.remove();
                }, 3000);
            }, index * 1000);
        });
    }
    
    updateAchievementsDisplay() {
        const achievementsList = document.getElementById('achievementsList');
        achievementsList.innerHTML = '';
        
        const unlockedCount = this.unlockedAchievements.length;
        const totalCount = this.achievements.length;
        const progress = (unlockedCount / totalCount) * 100;
        
        const summary = document.createElement('div');
        summary.className = 'achievements-summary';
        summary.innerHTML = `
            <span class="achievements-summary-icon">🏆</span>
            <span class="achievements-summary-text">已解锁</span>
            <span class="achievements-summary-count">${unlockedCount}</span>
            <span class="achievements-summary-total">/ ${totalCount}</span>
            <div class="achievements-progress-bar">
                <div class="achievements-progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
        achievementsList.appendChild(summary);
        
        this.achievements.forEach(achievement => {
            const isUnlocked = this.unlockedAchievements.includes(achievement.id);
            
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
            item.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
                <div class="achievement-progress">${isUnlocked ? '✓ 已解锁' : '🔒 未解锁'}</div>
            `;
            achievementsList.appendChild(item);
        });
    }
    
    openHelp() {
        const modal = document.getElementById('helpModal');
        modal.classList.add('show');
    }
    
    closeHelp() {
        const modal = document.getElementById('helpModal');
        modal.classList.remove('show');
    }
    
    minimizeHelpModal() {
        const modal = document.getElementById('helpModal');
        const minimizeBar = document.getElementById('helpMinimizeBar');
        
        modal.classList.add('minimized');
        minimizeBar.classList.add('show');
    }
    
    restoreHelpModal() {
        const modal = document.getElementById('helpModal');
        const minimizeBar = document.getElementById('helpMinimizeBar');
        
        modal.classList.remove('minimized');
        minimizeBar.classList.remove('show');
    }
    
    initHelpPagination() {
        this.currentHelpPage = 0;
        this.totalHelpPages = 4;
        
        document.getElementById('helpPrevBtn').addEventListener('click', () => {
            this.showHelpPage(this.currentHelpPage - 1);
        });
        
        document.getElementById('helpNextBtn').addEventListener('click', () => {
            this.showHelpPage(this.currentHelpPage + 1);
        });
        
        document.querySelectorAll('.help-page-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.showHelpPage(index);
            });
        });
        
        this.updateHelpNavigation();
    }
    
    showHelpPage(page) {
        if (page < 0 || page >= this.totalHelpPages) return;
        
        document.querySelectorAll('.help-card').forEach((card, index) => {
            card.classList.toggle('active', index === page);
        });
        
        this.currentHelpPage = page;
        this.updateHelpNavigation();
    }
    
    updateHelpNavigation() {
        document.querySelectorAll('.help-page-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentHelpPage);
        });
        
        document.getElementById('helpPrevBtn').disabled = this.currentHelpPage === 0;
        document.getElementById('helpNextBtn').disabled = this.currentHelpPage === this.totalHelpPages - 1;
    }
    
    updateStats(stats) {
        Object.assign(this.stats, stats);
        localStorage.setItem('snakeStats', JSON.stringify(this.stats));
        this.checkAchievements();
    }
}
