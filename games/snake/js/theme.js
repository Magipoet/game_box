class ThemeManager {
    constructor() {
        this.themes = {
            classic: { name: '经典绿', color: '#4ade80', unlocked: true },
            dark: { name: '暗夜紫', color: '#9333ea', unlocked: true },
            ocean: { name: '海洋蓝', color: '#0ea5e9', unlocked: true },
            forest: { name: '森林绿', color: '#22c55e', unlocked: true },
            retro: { name: '复古黄', color: '#fbbf24', unlocked: true },
            pink: { name: '粉色系', color: '#f472b6', unlocked: false, requirement: 'score_200' }
        };
        
        this.currentTheme = localStorage.getItem('snakeTheme') || 'classic';
    }
    
    init(game) {
        this.game = game;
        this.applyTheme(this.currentTheme);
        
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (this.isThemeUnlocked(theme)) {
                    this.applyTheme(theme);
                    localStorage.setItem('snakeTheme', theme);
                    this.updateThemeButtons();
                } else {
                    this.showThemeLockMessage(theme);
                }
            });
        });
        
        this.updateThemeButtons();
    }
    
    isThemeUnlocked(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return false;
        if (theme.unlocked) return true;
        
        if (theme.requirement && typeof achievementManager !== 'undefined') {
            return achievementManager.unlockedAchievements.includes(theme.requirement);
        }
        
        return false;
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
            const theme = btn.dataset.theme;
            const isUnlocked = this.isThemeUnlocked(theme);
            
            btn.classList.toggle('active', theme === this.currentTheme);
            btn.classList.toggle('locked', !isUnlocked);
            
            const lockIcon = btn.querySelector('.lock-icon');
            if (lockIcon) {
                lockIcon.style.display = isUnlocked ? 'none' : 'block';
            }
        });
    }
    
    showThemeLockMessage(themeName) {
        const theme = this.themes[themeName];
        if (!theme || !theme.requirement) return;
        
        const container = document.querySelector('.theme-toast-container');
        if (!container) return;
        
        const existingToast = container.querySelector('.theme-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const achievement = typeof achievementManager !== 'undefined' 
            ? achievementManager.achievements.find(a => a.id === theme.requirement)
            : null;
        
        const achievementName = achievement ? achievement.name : theme.requirement;
        
        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.innerHTML = `
            <span class="theme-toast-icon">🔒</span>
            <span>解锁「${achievementName}」后可用</span>
        `;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    }
}
