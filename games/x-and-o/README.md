# X&O 动态井字棋 — 项目框架说明

## 项目概述

X&O 动态井字棋是一款打破传统井字棋僵局的创新策略游戏。每名玩家最多同时存在 3 个棋子，最早放置的棋子会被自动移除，让游戏始终充满变数。支持常规模式和趣味模式（撤回、固定、保留三种特殊能力）。

## 文件结构

```
x-and-o/
├── index.html            # 页面结构与 HTML 模板
├── README.md             # 项目框架说明文档
├── css/
│   └── style.css         # 全局样式与动画定义
└── js/
    ├── game.js           # 纯游戏逻辑层（无 UI 依赖）
    ├── state.js          # 共享状态与 DOM 引用初始化
    ├── render.js         # 棋盘渲染与交互提示
    ├── tutorial.js       # 新手教程步骤与教程逻辑
    └── board.js          # 用户交互、UI 管理、应用入口
```

## 各文件详细说明

### `game.js` — 纯游戏逻辑层

**职责**：定义所有游戏核心规则与状态管理，完全不依赖 DOM。

**暴露接口**：`window.XOGame`

**主要功能**：
- 常量定义：`BOARD_SIZE`、`MAX_PIECES_PER_PLAYER`、`PERSIST_PIECES_PER_PLAYER`、`PLAYER_X`、`PLAYER_O`、`MODE_NORMAL`、`MODE_FUN`
- `createInitialState(mode)` — 创建游戏初始状态
- `cloneState(state)` — 深拷贝游戏状态
- `makeMove(state, row, col)` — 执行落子，处理棋子老化移除、固定解除、胜负判定
- `useFunUndo(state, prevState)` — 趣味模式撤回
- `startFreezeSelection(state, player)` / `cancelFreezeSelection(state)` / `setFreezeTarget(state, row, col, initiator)` — 固定能力
- `usePersist(state, player)` / `cancelPersist(state, player)` — 保留能力
- `isCellFrozen(state, row, col)` / `isPiecePersist(state, row, col)` — 状态查询
- `getRelativeOrder(state, piece)` / `getPieceDisplayCount(state, piece)` / `getPieceAge(state, piece)` — 棋子顺序与年龄
- `getWinningLines(board)` — 计算获胜连线

---

### `state.js` — 共享状态与 DOM 引用

**职责**：初始化并暴露全局共享的应用状态和 DOM 元素引用。

**暴露接口**：`window.XOApp.state`、`window.XOApp.els` 等

**主要内容**：
- `state` — 应用全局状态对象，包含：
  - `game`：当前游戏状态（来自 `game.js`）
  - `history`：历史状态栈（用于撤回）
  - `freezeInitiator`：当前固定能力的发起者
  - `settings`：用户设置（棋盘大小、棋子大小、主题）
  - `tutorial`：教程状态（当前步骤、交互状态、各能力阶段）
- `els` — 所有 DOM 元素引用的缓存对象
- `helpState` — 帮助弹窗状态
- `settingsTabState` — 设置弹窗标签页状态
- `initEls()` — 初始化所有 DOM 元素引用

---

### `render.js` — 棋盘渲染与交互提示

**职责**：负责将游戏状态渲染到 DOM，以及棋盘上的鼠标悬停预览效果。

**暴露接口**：`window.XOApp.render`、`window.XOApp.renderBoard` 等

**主要功能**：
- `createPieceSVG(owner)` — 创建 X/O 棋子的 SVG 元素
- `renderBoard()` — 渲染整个棋盘（包括棋子、固定图标、保留图标、顺序数字、获胜高亮）
- `attachCellEvents()` — 为棋盘格子绑定 mouseenter/mouseleave/click 事件
- `handleCellHover(row, col, cell, isEnter)` — 处理鼠标悬停预览效果
- `renderStatus()` — 渲染当前玩家状态栏
- `renderMode()` — 渲染游戏模式标识
- `renderPanels()` — 渲染趣味模式能力面板（按钮状态、次数、激活高亮）
- `renderFreezeHint()` / `renderPersistHint()` — 渲染固定/保留提示
- `render()` — 主渲染入口，调用以上所有渲染函数

---

### `tutorial.js` — 新手教程系统

**职责**：定义教程步骤、管理教程流程、提供教程中的各种引导功能。

**暴露接口**：`window.XOApp.tutorialNext`、`window.XOApp.startPersistAutoDemo` 等

**主要功能**：
- `TUTORIAL_STEPS` — 17 个教程步骤定义（含目标元素、标题、内容、位置、onEnter 回调）
- `renderTutorial()` — 渲染当前教程步骤（高亮、提示框、导航按钮）
- `tutorialNext()` / `tutorialPrev()` — 教程前进/后退
- `endTutorial()` — 结束教程，恢复正常游戏
- `initTutorial()` — 首次访问时自动启动教程
- `showTutorialCellGuide()` / `hideTutorialCellGuide()` — 显示/隐藏闪烁引导框
- `showTutorialUndoGuide()` / `showTutorialFreezeBtnGuide()` / `showTutorialFreezeCellGuide()` / `showTutorialPersistBtnGuide()` — 各能力专用引导
- `positionTutorialTooltip(rect, position)` — 定位教程提示框
- `startPersistAutoDemo()` — 保留能力的自动演示流程（含第4子提醒、第6子闪烁消失动画）

---

### `board.js` — 交互处理与 UI 管理（应用入口）

**职责**：处理用户点击交互、管理弹窗和设置、绑定事件、初始化应用。

**暴露接口**：`window.XOApp.handleCellClick`、`window.XOApp.resetGame` 等

**主要功能**：
- `handleCellClick(row, col)` — 核心点击处理，包含：
  - 教程交互限制（只允许点击指定格子）
  - 固定目标选择
  - 落子与动画（棋子消失、固定消失、保留消失）
  - 教程各阶段状态转换
  - 获胜判定
- `checkWin()` — 获胜弹窗
- `resetGame(mode)` — 重置游戏
- `showModal(modal)` / `hideModal(modal)` — 弹窗管理
- `doFunUndo(player)` / `toggleFreeze(player)` / `togglePersist(player)` — 趣味能力处理
- `showHelpModal()` / `renderHelpPage()` — 帮助弹窗
- `updateOptionButtons()` / `switchSettingsTab()` / `applySettings()` — 设置管理
- `bindEvents()` — 绑定所有 DOM 事件
- `init()` — 应用入口：初始化 DOM 引用 → 绑定事件 → 应用设置 → 渲染 → 启动教程

---

### `style.css` — 全局样式

**职责**：定义所有视觉样式、布局、动画。

**主要模块**：
- CSS 变量与主题定义（经典、橘子海、日落、深海、森林、午夜、糖果）
- 布局样式（顶部栏、状态栏、棋盘、能力面板、操作栏）
- 棋盘与棋子样式（格子、X/O SVG、悬停预览、获胜高亮）
- 固定与保留标记样式
- 弹窗样式（模式选择、帮助、胜利、设置）
- 教程覆盖层与提示框样式
- 动画定义：`piece-disappear`（棋子消失）、`freeze-disappear`（固定消失）、`persist-icon-blink`（保留闪烁）

---

### `index.html` — 页面结构

**职责**：定义 HTML 模板，按正确顺序加载 CSS 和 JS 文件。

**资源加载顺序**：
1. `css/style.css` — 全局样式
2. `js/game.js` — 游戏逻辑（无依赖）
3. `js/state.js` — 共享状态（依赖 `XOGame`）
4. `js/render.js` — 渲染函数（依赖 `XOApp.state`、`XOApp.els`）
5. `js/tutorial.js` — 教程逻辑（依赖 `XOApp.state`、`XOApp.els`、`XOApp.render`）
6. `js/board.js` — 交互与入口（依赖所有其他模块，调用 `init()`）

## 模块间通信

各模块通过 `window.XOApp` 全局命名空间进行通信：

```
game.js    → window.XOGame      (纯逻辑，无依赖)
state.js   → window.XOApp       (初始化共享状态)
render.js  → 读写 XOApp.state / XOApp.els，导出 XOApp.render
tutorial.js → 读写 XOApp.state / XOApp.els，调用 XOApp.render / XOApp.resetGame，导出教程函数
board.js   → 读写 XOApp.state / XOApp.els，调用所有模块函数，导出 handleCellClick / resetGame，执行 init()
```

## 游戏模式

| 模式 | 说明 |
|------|------|
| 常规模式 | 标准动态井字棋，支持无限撤回和重新开始 |
| 趣味模式 | 每位玩家拥有一次撤回、一次固定、一次保留能力 |
