# 2048 消消乐

一款功能丰富的 2048 滑动合并游戏，支持多种游戏模式和趣味特殊方块。

## 项目结构

```
2048/
├── index.html                 # 主页面
├── favicon.ico                # 网站图标
│
├── js/                        # JavaScript 模块
│   ├── constants.js           # 常量与枚举定义
│   ├── cell.js                # Cell 类（格子数据模型）
│   ├── board.js               # GameBoard 类（棋盘逻辑）
│   ├── snapshot.js            # GameSnapshot 类（游戏状态快照）
│   ├── game-core.js           # Game2048 类主体（核心游戏逻辑）
│   ├── game-movement.js       # Game2048 原型 — 移动与合并
│   ├── game-fun-mode.js       # Game2048 原型 — 趣味模式特殊逻辑
│   ├── storage.js             # StorageService 类（本地存储）
│   └── ui.js                  # UI 类（渲染与交互）+ 启动入口
│
├── css/                       # CSS 模块
│   ├── base.css               # CSS 重置、主题变量、基础排版
│   ├── layout.css             # 页面布局、按钮、计分面板
│   ├── board.css              # 棋盘网格、方块基础样式、动画
│   ├── tiles.css              # 方块数值颜色、特殊方块样式
│   ├── modals.css             # 模态框（帮助、成就、设置、胜利/失败）
│   ├── settings.css           # 设置面板、成就卡片、主题选择
│   └── responsive.css         # 响应式媒体查询
│
└── tests/                     # 测试模块
    ├── setup.js               # 测试环境模拟、框架、游戏代码加载
    ├── run.js                 # 测试运行入口
    ├── test-cell.js           # Cell 类测试
    ├── test-board.js          # GameBoard 类测试
    ├── test-game-core.js      # 核心功能测试（移动、游戏结束、胜利、撤销、暂停）
    ├── test-game-modes.js     # 游戏模式测试（时间模式、最大方块追踪）
    ├── test-fun-mode.js       # 趣味模式测试（木块、冰块）
    ├── test-achievements.js   # 成就系统测试
    ├── test-services.js       # 存储与序列化测试
    └── test-edge-cases.js     # 边界情况、回调、4096 合并限制测试
```

## 文件功能说明

### JavaScript 模块

| 文件                 | 功能               | 说明                                                                                  |
| ------------------ | ---------------- | ----------------------------------------------------------------------------------- |
| `constants.js`     | 常量与枚举            | 棋盘尺寸、游戏模式（经典/限时）、游戏变体（标准/趣味）、格子类型（空/数字/木块/冰块/锁链）、成就定义                               |
| `cell.js`          | Cell 类           | 格子数据模型，支持 6 种类型：空格、普通数字、木块、冰冻数字、锁链数字、传送；提供工厂方法和 `clone()`/`equals()`                |
| `board.js`         | GameBoard 类      | 4×4 棋盘管理，提供格子读写、空白格查找、木块/冰块/锁链定位、棋盘比较与序列化                                           |
| `snapshot.js`      | GameSnapshot 类   | 游戏状态快照，用于撤销功能，保存棋盘、分数、计时器、趣味模式状态                                                    |
| `game-core.js`     | Game2048 核心逻辑    | 游戏主类，包含构造函数、初始化、`move()` 主入口、`addRandomTile()`、游戏结束/胜利检测、计时器、撤销、序列化、成就追踪            |
| `game-movement.js` | 移动与合并            | `Game2048.prototype` 扩展：`moveLeft/Right/Up/Down`、`processRowLeft/Right`，处理方块滑动与合并逻辑 |
| `game-fun-mode.js` | 趣味模式             | `Game2048.prototype` 扩展：木块生成与合并消耗、冰块生成与移动倒计时、传送门生成与传送逻辑、锁链绑定/同步移动/倒计时解锁/合并规则        |
| `storage.js`       | StorageService 类 | 基于 `localStorage` 的持久化服务，支持保存/加载/删除游戏状态和统计数据                                        |
| `ui.js`            | UI 渲染与交互         | 渲染棋盘、分数显示、模态框管理、键盘/触摸事件绑定、设置面板交互、成就通知                                               |

### CSS 模块

| 文件               | 功能                                                          |
| ---------------- | ----------------------------------------------------------- |
| `base.css`       | CSS 重置、4 套主题变量（默认/深色/海洋/森林）、body 基础样式                       |
| `layout.css`     | 游戏容器 `.game-container`、头部、计分面板、控制按钮、模式选择器                   |
| `board.css`      | `.game-board` 网格、`.board-cell` 基础格子、`.tile` 方块定位、出现/合并/脉冲动画 |
| `tiles.css`      | `.tile[data-value]` 各数值配色（2-65536）、特殊方块（木块/冰块/锁链/传送门）样式与动画  |
| `modals.css`     | 所有弹窗：帮助、成就、设置、游戏结束、胜利、暂停                                    |
| `settings.css`   | 设置标签页、成就分类与卡片、主题选择与预览                                       |
| `responsive.css` | `@media` 响应式断点（1000px 和 700px），移动端适配                        |

### 测试模块

| 文件                     | 测试内容                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| `setup.js`             | 测试基础设施：Node.js 浏览器 API 模拟、`assert/section/subsection` 框架、从 `js/` 加载游戏代码、辅助函数 |
| `test-cell.js`         | Cell 类：构造、类型检测、`clone()`                                                     |
| `test-board.js`        | GameBoard 类：初始化、格子操作、空白格查找、序列化                                               |
| `test-game-core.js`    | 核心功能：初始化、四方向移动、游戏结束检测、胜利、撤销、暂停/继续                                            |
| `test-game-modes.js`   | 游戏模式：限时模式倒计时、最大方块追踪                                                          |
| `test-fun-mode.js`     | 趣味模式：木块生成与合并消耗、冰块生成与冻结倒计时                                                    |
| `test-achievements.js` | 成就系统：首次合并、达到特定数值等成就触发                                                        |
| `test-services.js`     | 存储服务：`localStorage` 读写、游戏状态序列化/反序列化                                          |
| `test-edge-cases.js`   | 边界情况：满棋盘移动、回调机制、4096 合并限制                                                    |
| `run.js`               | 测试运行器：加载所有测试、汇总结果、输出通过率                                                      |

## 游戏功能

### 游戏模式

- **经典模式**：标准 2048，无时间限制
- **限时模式**：5 分钟内冲击最高分

### 游戏变体

- **标准变体**：纯数字合并
- **趣味变体**：包含特殊方块

### 特殊方块（趣味模式）

- **🪵 木块**：阻挡方块，需要被相邻数字合并 3 次才能消除
- **🧊 冰块**：冻结数字，移动 8 次后解冻为普通数字
- **⛓️ 锁链方块**：特殊数字方块，有两种状态：
  - **绑定前**：可以自由移动，但无法参与合并；滑动后若碰到相邻数字（包括冰块里的数字），则产生连接
  - **绑定后**：锁链数字与目标数字作为整体同步移动，同时被遮挡；绑定后开始 5 次滑动倒计时，每次滑动倒计时减 1，若锁链数字或绑定的目标数字参与合并则各额外减 1（同一次滑动可叠加，如两者都参与合并则额外减 2）；倒计时归零后锁链解除，变为普通数字
- **🌀 传送门**：随机出现的传送阵（无数字），数字滑入经过传送阵后被传送到随机空白格，传送阵随即消失

> **模块限制**：趣味模式下同时最多出现 2 种特殊模块，每种模块最多同时存在 1 个

### 成就系统

涵盖数字合成、速度挑战、策略达人三大分类，共 20+ 项成就

### 其他功能

- 无限撤销
- 洗牌（最多使用 1 次）
- 暂停/继续
- 4 套主题（默认/深色/海洋/森林）
- 本地存储自动保存
- 触摸/键盘双支持

## 运行方式

### 启动游戏

用浏览器直接打开 `index.html`，或使用本地服务器：

```bash
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### 运行测试

```bash
node tests/run.js
```

### JS 加载顺序

`index.html` 中的 `<script>` 标签顺序严格遵循依赖关系：

1. `constants.js` → 2. `cell.js` → 3. `board.js` → 4. `snapshot.js`
2. `game-core.js`（Game2048 类定义）
3. `game-movement.js`（prototype 扩展）
4. `game-fun-mode.js`（prototype 扩展）
5. `storage.js` → 9. `ui.js`（DOMContentLoaded 启动入口）

### CSS 加载顺序

1. `base.css`（必须最先，提供 CSS 变量）→ 2. `layout.css` → 3. `board.css`
2. `tiles.css` → 5. `modals.css` → 6. `settings.css`
3. `responsive.css`（必须最后，确保媒体查询覆盖）

