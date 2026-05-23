document.addEventListener('DOMContentLoaded', function() {
    const game = new SnakeGame();
    const achievementManager = new AchievementManager();
    const themeManager = new ThemeManager();
    
    window.game = game;
    window.achievementManager = achievementManager;
    window.themeManager = themeManager;
    
    themeManager.init(game);
});
