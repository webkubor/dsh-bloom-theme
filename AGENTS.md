# AGENTS.md — AI 助手工作守则

本文件给进入本仓库的 AI 编码助手提供工作上下文。

## 这是什么

Bloom for DSH —— DeepSeek Harness 的「玻璃 + 莫兰迪」主题插件。12 套明暗双配色
（OKLCH 调色、全部实测 WCAG AA），顶栏一键切换，零运行时依赖。npm 包名 `dsh-bloom-theme`。

## 关键文件

- `src/`：TypeScript 源码（Host 入口 `src/index.ts`，Client 入口 `src/client.ts`）；源码改动从这里开始，脚本与文档按任务范围维护。`lib/` 是构建产物。
- `lib/`：tsc + bundle 的产物，npm 发布的就是它；不要手改。
- `contrast.config.json`：contrast-guard 护栏配置 —— 所有配色改动必须过这道门。
- `assets/`：壁纸与静态资源。
- `README.md` / `README.en.md`：双语 README，**两边必须同步改**。

## 常用命令

```bash
npm run build            # typecheck + tsc + bundle
npm run dev              # 完整构建后监听浏览器源码，仅更新本仓 lib/
npm run package          # build + npm pack（发版前自检）
npm run check            # 静态契约、版本和对比度门禁
npm run test:browser     # 隔离夹具的浏览器回归
```

## 约定

- **视觉基线（owner 2026-11-06）**：干净、通透、耐看，带克制的小惊喜；浅色要有主题色层次与可见星点，正文优先。
- **UI 确认门（owner 2026-11-06）**：UI 改完先交真实效果并停下，用户明确同意后才开始版本准备和发布流程。
- **桌面端优先**：迭代重心是 DSH 桌面端；Web UI 只保持可用、不主动适配（见 README「桌面端优先」一节）。
- **配色改动必过对比度护栏**：调任何颜色后跑 contrast-guard，不达标不许合入 —— 这是本项目的核心卖点，破了就是砸招牌。
- **零运行时依赖**是承诺，新增 dependency 前先想清楚。
- 版本与 CHANGELOG 由 release-please 的 Release PR 决定，Publish 工作流负责 npm 发布；不要手工 bump 版本或改历史 CHANGELOG。release-sync 只检查已登记的当前版本副本。
- 安装、升级和恢复正式版使用宿主插件管理界面或官方 `plugin_manager`；先列已有 bundle，再安装本仓绝对路径或精确发布版本。禁止复制或改写 profile 的 `node_modules` / 依赖清单。
- 按安装结果的 `application` / `nextStep` 完成重启并核对实际加载版本；本地 build、刷新页面或相同 Slot ID 都不能证明更新已应用。
- UI 只用官方 Slot：根 `conversation.header.leading` 提供本插件自己的定位锚点，完整切换器、菜单与装饰挂在根 `shell.overlay`，避免宿主顶栏裁剪。定位只测量自己的锚点。先 Inspect 确认契约；Slot 由 apply 注册，副作用由上下文 effect/React effect 清理；禁止宿主 DOM 找位、手动重挂与悬浮拖拽兜底。
- main push、定时巡检与默认手动工作流只准备 Release PR，不自动合并。完成真实桌面验收、当前 head 的 CI 与评审后，才允许显式启用发布合并；命令见贡献指南，不把准备候选版当作发布授权。
- 完整开发、运行时验收与发布门禁见 [CONTRIBUTING.md](./CONTRIBUTING.md)。
