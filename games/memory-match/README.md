# 记忆配对游戏 (Memory Match)

一款基于 Web 的记忆配对卡牌游戏，支持多关卡、炸弹机制、主题切换和成就系统。

## 项目结构

```
memory-match/
├── index.html                  # 主页面 HTML 结构
├── README.md                   # 项目文档
├── css/                        # 样式文件（按功能拆分）
│   ├── base.css                # 全局基础样式
│   ├── header.css              # 头部栏和关卡选择器
│   ├── board.css               # 游戏棋盘和卡片
│   ├── modal.css               # 模态框和弹窗
│   ├── settings.css            # 设置面板、记录和成就
│   ├── themes.css              # 主题系统和 CSS 变量
│   ├── tutorial.css            # 新手教程引导 UI
│   └── dark.css                # 暗黑模式覆盖样式
└── js/                         # 脚本文件（按功能拆分）
    ├── config.js               # 游戏配置数据
    ├── state.js                # 全局状态变量
    ├── audio.js                # 音效系统
    ├── storage.js              # 本地存储管理
    ├── theme.js                # 主题切换逻辑
    ├── achievements.js         # 成就系统
    ├── settings.js             # 设置面板逻辑
    ├── game.js                 # 游戏核心逻辑
    ├── tutorial.js             # 新手教程逻辑
    └── events.js               # 事件监听器
```

## 文件详细说明

### HTML

| 文件 | 说明 |
|------|------|
| `index.html` | 游戏主页面，包含所有 DOM 结构：游戏棋盘、统计栏、关卡选择器、模态框（胜利/失败/确认/设置/帮助/教程）、教程引导浮层、成就通知 |

### CSS 样式文件

| 文件 | 说明 | 关键内容 |
|------|------|---------|
| `base.css` | 全局基础样式 | CSS 重置、`body`/`.container` 布局、按钮通用样式（`.btn`/`.btn-danger`/`.btn-secondary`/`.btn-reset`）、图标按钮 |
| `header.css` | 头部栏和关卡选择器 | 统计信息栏（步数/时间/配对数）、关卡选择按钮、关卡下拉菜单、锁定关卡样式 |
| `board.css` | 游戏棋盘和卡片 | 棋盘网格布局、卡片 3D 翻转动画（`perspective`/`rotateY`）、配对成功脉冲动画、炸弹卡片样式、炸弹爆炸动画 |
| `modal.css` | 模态框和弹窗 | 通用模态框结构、胜利/失败弹窗、新记录动画、炸弹介绍弹窗、帮助内容、关闭按钮 |
| `settings.css` | 设置面板、记录和成就 | 设置标签页、游戏记录网格、成就列表、成就解锁通知（滑入动画） |
| `themes.css` | 主题系统和 CSS 变量 | 5 套主题预览样式、CSS 变量定义（`--bg-gradient`/`--card-bg`/`--card-border`/`--primary-color`）、变量覆盖规则 |
| `tutorial.css` | 新手教程引导 UI | 教程欢迎页、引导浮层（底部弹出动画）、步骤指示器（圆点）、卡片高亮遮罩、箭头指引动画、教程步骤卡片 |
| `dark.css` | 暗黑模式覆盖 | 所有组件的暗黑模式颜色覆盖（`body.theme-dark` 选择器） |

### JS 脚本文件

| 文件 | 说明 | 关键函数/变量 |
|------|------|-------------|
| `config.js` | 游戏配置数据 | `gameLevels`（16关配置）、`cardEmojis`（18种表情）、`themes`（5套主题）、`achievementList`（18个成就）、`STORAGE_KEYS` |
| `state.js` | 全局状态变量和 DOM 引用 | 游戏状态变量（`cards`/`firstCard`/`matchedPairs`等）、教程状态变量、所有 DOM 元素引用（`getElementById`） |
| `audio.js` | 音效系统 | `playSound()`、`ensureAudio()`、`playSequence()`；支持 flip/match/wrong/win/record/click/bomb 7种音效 |
| `storage.js` | 本地存储管理 | `loadGameData()`、`saveProgress()`、`saveBestScore()`、`saveAchievements()`、`saveStats()`、`resetAllProgress()` |
| `theme.js` | 主题切换逻辑 | `applyTheme()`、`setTheme()`、`updateThemeItems()` |
| `achievements.js` | 成就系统 | `unlockAchievement()`、`checkAchievements()`、`showAchievementNotification()`、`renderAchievements()` |
| `settings.js` | 设置面板逻辑 | `renderRecords()`、`switchSettingsTab()`、`updateGameStats()` |
| `game.js` | 游戏核心逻辑 | `initGame()`、`createBoard()`、`flipCard()`、`checkMatch()`、`disableCards()`、`unflipCards()`、`bombExplode()`、`startTimer()`/`stopTimer()`、`showWinModal()`、关卡切换 |
| `tutorial.js` | 新手教程逻辑 | `tutorialSteps`（9步教程定义）、`startTutorial()`、`handleTutorialCardClick()`、`autoFlipCard()`、`updateTutorialStep()`、`executeTutorialAction()`、教程状态重置函数 |
| `events.js` | 事件监听器 | 所有按钮点击事件、模态框交互、全局点击事件（教程推进/点击外部关闭）、`DOMContentLoaded` |

## 脚本加载顺序

脚本之间有依赖关系，必须按以下顺序加载（已在 `index.html` 中配置）：

```
config.js → state.js → audio.js → storage.js → theme.js → achievements.js → settings.js → game.js → tutorial.js → events.js
```

**依赖链说明**：
- `state.js` 依赖 `config.js` 中的常量
- `storage.js` 依赖 `state.js` 中的变量
- `theme.js` 依赖 `storage.js` 中的存取函数
- `achievements.js` 依赖 `storage.js` 和 `state.js`
- `game.js` 依赖前面所有模块的函数和变量
- `tutorial.js` 依赖 `game.js` 中的核心函数
- `events.js` 依赖所有模块，放在最后

## CSS 加载顺序

```
base.css → header.css → board.css → modal.css → settings.css → themes.css → tutorial.css → dark.css
```

**顺序说明**：
- `base.css` 最先加载，提供基础重置和通用组件样式
- `themes.css` 在组件样式之后加载，通过 CSS 变量覆盖主题色
- `dark.css` 最后加载，通过 `body.theme-dark` 选择器覆盖暗黑模式颜色

## 游戏功能

### 关卡系统
- 16个关卡，从 2×3 递增到 6×6
- 前8关无炸弹，后8关引入炸弹卡片
- 通关自动解锁下一关

### 炸弹机制
- 第9关起出现 💣 炸弹卡片
- 翻开两张炸弹卡片触发爆炸，游戏失败
- 首次进入炸弹关卡显示炸弹介绍弹窗

### 新手教程
- 9步引导式教程，涵盖翻牌、配对成功、配对失败、炸弹演示
- 支持点击卡片/下一步按钮/空白区域三种交互方式推进
- 支持上一步回退，自动重置卡片状态

### 主题系统
- 5套主题：经典蓝紫、清新森林、温暖日落、深海蓝、暗黑模式
- 基于 CSS 变量实现，切换时无需刷新

### 成就系统
- 18个成就，涵盖通关、最佳步数、零失误、炸弹相关等
- 解锁时弹出通知

### 数据持久化
- 使用 `localStorage` 存储进度、最佳成绩、成就、主题偏好、统计数据
