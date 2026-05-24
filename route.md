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

## 集成原则

1. **原样复制**：Game Box 中的每个游戏文件均从原始路径直接复制，不做任何逻辑、样式或内容上的修改。
2. **独立运行**：每个游戏在 Game Box 中保持独立，可单独运行，不依赖 Game Box 的任何代码。
3. **统一入口**：Game Box 主页 (`index.html`) 提供三个游戏的卡片式入口，点击后跳转到对应游戏的 `index.html`。

## 更新说明

如需更新某个游戏，应先在其原始路径下进行修改，然后将修改后的文件重新复制到 Game Box 对应的目录中。**不建议直接在 Game Box 中修改游戏代码**，以免与原始版本不一致。
