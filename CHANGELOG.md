# Changelog

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.6.1](https://github.com/webkubor/dsh-bloom-theme/compare/v0.6.0...v0.6.1) (2026-08-24)

### 🐛 Bug Fixes
- **模型选择器背景更深不透明**（`[class*="_menu"]` 暗色版 `transparent 22% → 12%`，78% → 88% 不透明；亮色版 `30% → 20%`）。修前青金/冷色调 + 亮色聊天内容能整段透出（「字竖排的 layout bug」「transparent 52% → 22%」等调试信息都看得见）；修后跟 Bloom 自己的下拉（88%）一致。
- **Bloom 下拉菜单 z-index 提到 99999**（之前 10000），避免被 DSH 原生顶栏「对话 / 轨迹」tabs（更高 z-index））截断 8 变体下拉的下半部分。在 800px 以下窄屏下能复现这个 bug。

### ✨ 新功能
- **DSH 升级检查区块**（Bloom 下拉底部，「Bloom v0.6.0」行下方）：
  - 「DSH 当前 rev」从 `window.__DSH_BOOT__.rev` 读 git commit hash 截短 7 位
  - 「最新」从 npm registry `https://registry.npmjs.org/@deepseek-ai/dsh/latest` 拉，`sessionStorage` 缓存 6h
  - 「✓ 已是最新」/ 「↑ 有新版可用」chip 状态
  - 「↻ 检查」按钮强制 fetch
  - 「复制升级命令」按钮一键复制 `npm i -g @deepseek-ai/dsh@latest`（含 `navigator.clipboard.writeText` + textarea 降级）
- **「↓ 下载 PNG」按钮玻璃化**（`#dsh-bloom-stats-pop .dl`）：从 `background: transparent` 改成半透 + `backdrop-filter: blur(14px)` + 玻璃边缘 `inset 0 1px 0` + 主题色 hover 光晕；`padding: 7px 0 → 9px 12px` 让「↓ 下载 PNG」居中。

### 🎨 视觉打磨
- 之前 v0.6.0 早期曾尝试修复 DSH 设置面板 detail 区逐字竖排（`flex-basis: 100%` 全链覆盖），后回滚——遵守「不覆盖 DSH 原生 layout」原则；该 bug 应去 https://github.com/deepseek-ai/deepseek-harness 提 issue 让官方修。

## [0.6.0](https://github.com/webkubor/dsh-bloom-theme/compare/v0.5.0...v0.6.0) (2026-08-23)

### ✨ 新功能
- **8 套莫兰迪配色**（原有 4 + 新增 4：鼠尾草 Sage / 暖石 Stone / 青金 Lapis / 琥珀 Amber），全部用 OKLCH 调色，亮暗自适应一键切换
- **磨砂玻璃面板默认常开**：侧栏/气泡/输入卡/菜单/选择器全部半透 + backdrop 模糊 + 玻璃边缘高光，明暗两档透明度自适应
- **微交互动效系统**：菜单入场、选中色条滑入、hover / 按压反馈；全站统一时长/缓动 token（`--bloom-dur-*` / `--bloom-ease`），尊重 `prefers-reduced-motion`
- **版本/更新指示**：下拉底部显示当前版本（`Bloom v0.5.0` → `v0.6.0`），npm 有新版亮「↑ vX」徽标跳转 Release 页
- **一键代码统计卡（可秀）**：`/bloom stats` 读取本地 git 仓库，输出可分享的开发统计（行数/文件/提交/连击/语言分布）；`--card` 生成自包含 HTML 卡；顶栏配色按钮左侧的「💎 统计」胶囊悬停预览 + 一键下载 PNG（**卡片跟随当前主题**，accent / 背景 / 文字全从主题 token 取）

### 🛠 工程化
- **前端转 TypeScript**：`src/*.ts`（client/index/stats/globals） → `tsc` → `lib/*.js`；`tsconfig.json`；`@types/node`
- **一键脚本**：`npm run build` / `deploy` / `preview` / `dev` / `package` / `publish` / `check`
- **Auto-reload 修复**：客户端 `GET` 自己插件 URL 算 FNV-1a 指纹对比，部署后页面 3 秒内自动刷新（DSH 的 web 服务 HEAD 不返回 etag，所以用 body 指纹）
- **`scripts/sync-version.mjs`** 同步进 `src/client.ts`（不再改编译产物）

### 🎨 文档
- README 重写成产品页：banner / 徽章 / 8 变体矩阵 / 安装 / 特性表 / 一键脚本 / 编码统计卡
- 重新生成 8 变体 × 明暗 = 16 张截图（`assets/screenshots/`）

### 🧹 清理
- 移除壁纸 / 氛围层相关遗留截图（`ambience-*`, `switcher-panel.png`）

## [0.5.0](https://github.com/webkubor/dsh-bloom-theme/compare/v0.4.0...v0.5.0) (2026-08-23)

### 🧭 方向调整
- **移除壁纸 / 氛围层**：删除「氛围」设置区（壁纸、压暗、模糊、主题包导入导出），
  改为主打 **玻璃 + 莫兰迪配色** 的单一视觉语言，不再有照片壁纸，面板玻璃改为**默认常开**。

### ✨ 新功能
- **新增 4 组莫兰迪配色**（源自 typora-Bloom-theme 的成功变体，按原版 accent/bg/surface 直接转 OKLCH）：
  鼠尾草 Sage（绿，hue 115）、暖石 Stone（暖灰，hue 29）、青金 Lapis（蓝，hue 258）、琥珀 Amber（暖金，hue 70）。
  变体总数由 4 → **8**，切换器下拉同步扩展。
- **一键代码统计卡（可秀）**：`/bloom stats` 读取本地 git 仓库，输出可分享的开发统计
  （行数/文件/提交/连击/语言分布）；`--card` 生成一张自包含 HTML 卡，可截图/打印分享。纯本地、离线、零依赖。

### 🎨 视觉升级（玻璃）
- 面板玻璃化由新增 `GLASS_CSS` 统一驱动：半透底色（`color-mix(theme token, transparent 52–84%)`）+
  `backdrop-filter: blur(24px) saturate(...)` + **玻璃边缘**（顶部亮高光 inset + 半透描边 + 柔和深色外辉）。
  明暗两档透明度：暗色面板更实（保亮字可读），亮色更透（玻璃感更足）。
- 主体氛围渐变提亮（`--bloom-veil-1/2` 提高透明度档），让玻璃面板有背景可透、有光可折射。
- 输入卡（composer）单独给最清晰的玻璃档位，focus 时玻璃边缘点亮。

### 🧹 清理
- 删除 `WALLPAPERS` / `AMB_DEFAULTS` / `AMB_KEY` 及全部 ambience 读写/壁纸/主题包函数；
  `AMBIENCE_CSS` 重写为 `GLASS_CSS`。主色/背景/环境层 token 布局不变，兼容原有 `body[data-bloom-variant]` 切换。
- 对比度护栏：16 组明暗主色对全部 ≥ 4.5:1（`contrast-guard` 通过）。

## [0.4.0](https://github.com/webkubor/dsh-bloom-theme/compare/v0.3.6...v0.4.0) (2026-08-22)

### ✨ 新功能

- **氛围层（默认关闭）**：顶栏下拉新增「氛围」区，一键开启与当前变体同色系的莫兰迪壁纸
  （4 套 AI 生成的配套壁纸，随变体自动切换，也可固定某套或填自定义 URL / data: URL），
  附带压暗滑杆（保证正文可读）与磨砂玻璃面板（侧栏/气泡/输入卡/菜单半透明 +
  `backdrop-filter`，模糊强度 4–32px 可调）。关闭后完全回到 v0.3 的纯 Bloom，零残留。
- **主题包导入/导出**：变体 + 氛围层全部配置一键导出为 JSON（`bloom-<variant>-theme.json`），
  导入走白名单合并校验，未知字段丢弃，坏文件安全报错。

### 📝 Documentation

- README（中/英）新增「氛围层」章节与设置面板说明，架构图补 `AMBIENCE_CSS` / `renderAmbience()`。

## [0.3.6](https://github.com/webkubor/dsh-bloom-theme/compare/v0.3.5...v0.3.6) (2026-08-20)


### 🐛 Bug Fixes

* **ci:** Release 已存在时跳过，别让重复创建把成功的发布标红 ([ac5ab4e](https://github.com/webkubor/dsh-bloom-theme/commit/ac5ab4ec13add7c7d33b7b4967995a33338dc14b))
* **ci:** Release 补建步骤去掉 npm 门控 —— 它让补建在最需要时失效 ([0cedef3](https://github.com/webkubor/dsh-bloom-theme/commit/0cedef3893f0e9a2cd0a0abb3dbd2a1240750e33))

## [0.3.5](https://github.com/webkubor/dsh-bloom-theme/compare/v0.3.4...v0.3.5) (2026-08-19)


### 🐛 Bug Fixes

* **ci:** 补 npm ci —— 接入 contrast-guard 后 CI 装不到 devDependency ([ced8fe2](https://github.com/webkubor/dsh-bloom-theme/commit/ced8fe2a62db4cc425363d880a3d3879a2c47fc0))
* **ui:** 表格观感修复 —— 表头/列分隔/空cell降权/作用域收紧，v0.3.5 ([5449ffd](https://github.com/webkubor/dsh-bloom-theme/commit/5449ffdb1b483ae943d90ab16a4affb493bd43be))
* 目标栏空壳边框与窄表格右侧留白 ([468ce39](https://github.com/webkubor/dsh-bloom-theme/commit/468ce39b8cf410393a687fac23fdb902d7da721d))


### 📝 Documentation

* README 加 Bloom 系列导航 ([5e9b750](https://github.com/webkubor/dsh-bloom-theme/commit/5e9b750cfe6935ef5ed27441cb039f5de8213ffd))


### 🛠️ CI / Build

* **release:** 接 release-please——自动版本/PR/tag/changelog ([c2cde02](https://github.com/webkubor/dsh-bloom-theme/commit/c2cde02238966b2525133c575ff1f76a2da9519b))
* **release:** 用 cs PAT 替换默认 GITHUB_TOKEN（release-please 需要开 PR） ([fd3d569](https://github.com/webkubor/dsh-bloom-theme/commit/fd3d569a81bb0113ed59920215698d6dbd528cb2))
* 推 v* tag 自动发 npm 并建 GitHub Release ([5480826](https://github.com/webkubor/dsh-bloom-theme/commit/5480826b1e4ce41af34a95e047290bfabc62f3a1))

## [0.3.5] - 2026-08-19

### 修复

- **聊天 markdown 表格观感**：旧规则 `th, td { border-color }` 只染色不补形，
  在莫兰迪主题下表格看着像"被横线分开的文字块"，不像表。重写为 `_tableScroll`
  容器范围内生效：
  - 表头加 8% morandi 冷光底 + 字重 600 + hairline-strong 底边
  - 列分隔：每个 cell 加 hairline 右 border，最后一列去掉
  - 还原首列 padding-left: 16px（DSH 原生 0 让首行贴边）
  - 空 cell 透明度 0.35，缺值列（如 P1 状态空）不会让整行看着"半残废"
  - 容器外框：1px hairline + 10px 圆角 + 2% morandi 微底
  - hover 行 6% morandi 淡染
- 规则作用域收紧到 `[class*="_tableScroll"]`，**不再用全局 `th, td`** —
  之前的全局规则可能误染会话列表（`Y0dWHa_table`）等其它表格

## [0.3.4] - 2026-08-19

### 变更

侧边栏 UI 优化（全部先在浏览器实时注入验证过计算样式再入库）：

- 选中会话行：底色 18%→24% + 标题字重 500，一眼定位当前会话
- 「工作区」分区头降权：label 12px + 0.06em 字距；右侧搜索/动作图标
  默认 60% 亮度、hover 才全亮
- 会话行元信息（时间戳等）0.55 透明 → `--dsw-alias-label-secondary`，
  暗色氛围渐变上不再发糊
- 会话列表细滚动条：4px 冷光 thumb（accent 30%），hover 加强到 55%
- 新建会话按钮图标着 accent 主色，强化唯一主 CTA 地位

## [0.3.3] - 2026-08-18

### 修复

- 变体切换器不再跑到左边侧边栏：`findSwitcherHost()` 的 fallback `[class*="_headerActions"]`
  会命中侧边栏「工作区」那行的同名容器（`qDHVXG_headerActions`，与顶栏的 `wSkVaW_headerActions`
  是两套 CSS Module 前缀），且它在 DOM 里排在顶栏之前 —— `querySelector` 先命中它，切换器就被
  prepend 到侧边栏。新会话页 DSH 会把顶栏整个隐藏（`_headerHidden`，宽度 0），fallback 必然生效，
  所以「点新会话后切换器跑左边」是稳定复现的。现在限定在 `<header>` 内查找，顶栏隐藏时走浮动兜底
- 新建会话按钮补 `background`：此前只接管了描边与圆角，底色仍是 DSH 原生的 `oklch(0.28 0.02 240)`
  （色相 240 的蓝灰）配青色描边，跟任何一个莫兰迪变体都不同色系，浅色模式下那块冷蓝尤其跳，
  看着像没上主题。现在按 accent 微染，并补 hover 态
- 侧边栏补层次：`--dsw-specific-sidebar-fill` 的色差从 2%/4%（亮/暗）提到 5%/7% —— 2% 在浅色模式下
  肉眼分不出侧边栏与主区；另加右侧 hairline 分界、顶部 120px 内的极淡 accent 渐变、底部设置区上方
  分隔线，让侧边栏成为独立的「面」而不是一列浮在背景上的文字

## [0.3.2] - 2026-08-18

### 新增

- 全新界面截图（7 张），构图改为侧栏收起 + 内容区加宽
- banner 改用 AI 生成的莫兰迪抽象底图，文字经 HTML 精确排版后合成
- 英文 README（`README.en.md`），两份互链
- FAQ 与「已知限制」章节，中英文同步
- 发布前自检 `npm run check` 与 GitHub Actions CI

### 修复

- 工具行改为 hover 才描边 —— 折叠态 748×26 的扁长圆角框过于突兀，且同为工具行的
  Bash 有框、Read/Edit 无框，视觉不一致
- 思考内容降权改回左侧冷光竖线，并以 `margin-left: 0 !important` 压平各标签默认外边距，
  消除 p 在 x=626、ul 在 x=628 的 2px 错位
- 排队消息条补毛玻璃容器 —— DSH 原样式是透明容器 + 70% 文字，在本主题的氛围渐变上会糊掉

## [0.3.1] - 2026-08-18

### 修复

- 工具卡展开态「框中框」：描边移至有实色背景的 `md-code-block` 层，不再叠加在内层透明 `pre` 上
- 表格边距：DSH 单元格左内边距刻意为 0（与正文对齐），移除表头底色；
  同时去掉 `table` 上的 `overflow: hidden`，避免与外层 `_tableScroll_` 的横向滚动打架
- 裸露的 `<think>` 标签隐藏，标签之间的思考内容降权显示

### 变更

- 包名由 `@webkubor/dsh-bloom-theme` 改为 `@kubor/dsh-bloom-theme`
  （npm 个人 scope 必须等于账号名）

## [0.3.0] - 2026-08-18

### 新增

- **双轨配色**：每个变体同时保留「可读轨」（保对比度）与「气质轨」（供氛围渐变），
  这是莫兰迪质感的关键，只移植前者会让 `petal` 从藕粉变成荧光洋红
- **质感层**：氛围渐变、冷光线条、长距柔影三档、Markdown 排版装饰
- 顶栏下拉切换器，挂进 DSH 的 `_headerUtilities`，与原生控件并排
- `dsh.bundle` 声明与随包分发的 `cordis.patch.yml`，安装后自动进 boot graph

### 修复

- **client factory 返回裸 `{}` 导致 DSH 启动白屏** —— 须返回带 `apply` 方法的对象。
  该报错发生在浏览器端，与 `lib/index.js` 的 ESM 导出格式无关
- 亮色主色对比度不足：`petal` 3.55:1 → 4.55:1、`ripple` 3.02:1 → 4.61:1，
  8 组「主色 + 底色」现全部达 WCAG AA
- `markdown-inline-code` 按文字色给值导致暗色下 1.2:1 的浅底白字 —— 它是背景色变量
- 暗色阴影用前景色 `color-mix` 渲染成白雾 —— 暗色阴影须用纯黑
- 暗色文字层级塌陷（secondary/caption/dimmed 为 35/30/35）→ 改为 35/48/58 单调递减
- 无障碍：补 `:focus-visible` 焦点环、`role="radiogroup"` + `aria-checked`、
  `prefers-reduced-motion`；毛玻璃背景透明度由 6% 提至 28% 使 blur 真正生效

[0.3.2]: https://github.com/webkubor/dsh-bloom-theme/releases/tag/v0.3.2
[0.3.1]: https://github.com/webkubor/dsh-bloom-theme/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/webkubor/dsh-bloom-theme/releases/tag/v0.3.0
