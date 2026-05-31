function applyTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    updateThemeItems();
}

function setTheme(themeName) {
    if (!themes[themeName]) return;
    currentTheme = themeName;
    localStorage.setItem(getStorageKey(STORAGE_KEYS.theme), themeName);
    applyTheme(themeName);
    createBoard();
}

function updateThemeItems() {
    themeItems.forEach(item => {
        const themeName = item.dataset.theme;
        item.classList.toggle('active', themeName === currentTheme);
    });
}
