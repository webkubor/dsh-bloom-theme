# Changelog

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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
