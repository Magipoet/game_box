# 游戏盒子 (Game Box) - 项目结构说明

## 项目概述

本项目是一个游戏合集平台（Game Box），将多个独立开发的游戏整合到一个统一的入口页面。每个游戏的原始代码都是独立开发的，在 Game Box 中通过直接复制原始文件的方式进行集成，不做任何修改。

## 目录结构

```
game_box/
├── index.html              # 游戏合集主页（入口页面）
├── css/
│   └── style.css           # 主页样式
├── js/
│   └── main.js             # 主页脚本
└── games/
    ├── 2048/               # 2048 游戏
    ├── gomoku/             # 五子棋游戏
    ├── memory-match/       # 翻牌配对游戏
    ├── snake/              # 贪吃蛇游戏
    └── x-and-o/            # 井字棋游戏
```

## 游戏来源对照表

| 游戏名称 | Game Box 路径 | 原始代码路径 |
|---------|--------------|-------------|
| 翻牌配对 | `game_box/games/memory-match/` | `/remote-home/share/lijl/task_all/8翻牌配队/` |
| 贪吃蛇 | `game_box/games/snake/` | `/remote-home/share/lijl/task_all/6贪吃蛇/` |
| 井字棋 | `game_box/games/x-and-o/` | `/remote-home/share/lijl/task_all/2XandO/前端XandO/` |
| 2048 | `game_box/games/2048/` | `/remote-home/share/lijl/task_all/5_2048/` |
| 五子棋 | `game_box/games/gomoku/` | 本项目内置实现 |

## 集成原则

1. **原样复制**：Game Box 中的每个游戏文件均从原始路径直接复制，不做任何逻辑、样式或内容上的修改。
2. **独立运行**：每个游戏在 Game Box 中保持独立，可单独运行，不依赖 Game Box 的任何代码。
3. **统一入口**：Game Box 主页 (`index.html`) 提供五个游戏的卡片式入口，点击后跳转到对应游戏的 `index.html`。

## 更新说明

如需更新某个游戏，应先在其原始路径下进行修改，然后将修改后的文件重新复制到 Game Box 对应的目录中。**不建议直接在 Game Box 中修改游戏代码**，以免与原始版本不一致。

## 五子棋游戏说明

五子棋（Gomoku）是本项目内置实现的游戏，使用 HTML5 Canvas 绘制。

### 文件结构

```
games/gomoku/
├── index.html      # 游戏页面
├── style.css       # 游戏样式
└── game.js         # 游戏逻辑
```

### 功能特性

- 15×15 标准五子棋棋盘
- 双人对战模式（PvP），黑子先手
- 五连子胜利检测（横、竖、斜四个方向）
- 幽灵棋子预览（鼠标悬停时显示落子位置）
- 最后落子位置高亮标记
- 胜利连线可视化
- 平局判定
- 步数统计
- 帮助说明弹窗
- 重新开始功能
- 响应式布局，支持移动端

### 实现技术

- HTML5 Canvas 绘制棋盘和棋子
- JavaScript 实现游戏逻辑和交互
- 纯前端实现，无需任何依赖

