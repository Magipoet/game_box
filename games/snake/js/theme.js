class ThemeManager {
    constructor(game, achievementManager) {
        this.game = game;
        this.achievementManager = achievementManager;
        this.currentTheme = localStorage.getItem('snakeTheme') || 'classic';
        this.themes = ['classic', 'dark', 'ocean', 'forest', 'retro', 'pink'];
        this.themeNames = {
            classic: '经典绿',
            dark: '暗夜紫',
            ocean: '海洋蓝',
            forest: '森林绿',
            retro: '复古黄',
            pink: '少女粉'
        };
        
        this.lockedThemes = {
            dark: { achievementId: 'twenty_purple', name: '紫色传说' },
            retro: { achievementId: 'fifty_gold', name: '黄金收藏家' }
        };
        
        this.init();
    }

    init() {
        this.validateCurrentTheme();
        this.applyTheme(this.currentTheme, false);
        this.bindEvents();
    }

    isThemeUnlocked(themeName) {
        if (!this.lockedThemes[themeName]) return true;
        const achievementId = this.lockedThemes[themeName].achievementId;
        return this.achievementManager.isAchievementUnlocked(achievementId);
    }

    validateCurrentTheme() {
        if (!this.isThemeUnlocked(this.currentTheme)) {
            this.currentTheme = 'classic';
            localStorage.setItem('snakeTheme', 'classic');
        }
    }

    showThemeLockToast(themeName) {
        const lockInfo = this.lockedThemes[themeName];
        const container = document.getElementById('themeToastContainer');
        
        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.innerHTML = `
            <span class="theme-toast-icon">🔒</span>
            <span>需要解锁成就「${lockInfo.name}」才能使用此主题</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 2000);
    }

    applyTheme(themeName, showToast = true) {
        if (!this.isThemeUnlocked(themeName)) {
            if (showToast) {
                this.showThemeLockToast(themeName);
            }
            return;
        }
        
        this.currentTheme = themeName;
        document.body.className = '';
        if (themeName !== 'classic') {
            document.body.classList.add(`theme-${themeName}`);
        }
        localStorage.setItem('snakeTheme', themeName);
        this.game.render();
    }

    updateThemeButtons() {
        this.themes.forEach(theme => {
            const btn = document.getElementById(`theme-${theme}`);
            if (btn) {
                btn.classList.toggle('active', theme === this.currentTheme);
                const isLocked = !this.isThemeUnlocked(theme);
                btn.classList.toggle('locked', isLocked);
                
                const lockIcon = document.getElementById(`lock-${theme}`);
                if (lockIcon) {
                    lockIcon.style.display = isLocked ? 'block' : 'none';
                }
            }
        });
    }

    bindEvents() {
        this.themes.forEach(theme => {
            const btn = document.getElementById(`theme-${theme}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.applyTheme(theme);
                    this.updateThemeButtons();
                });
            }
        });
    }
}