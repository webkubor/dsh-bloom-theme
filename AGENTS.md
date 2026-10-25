# AGENTS.md — AI 助手工作守则

本文件给进入本仓库的 AI 编码助手提供工作上下文。

## 这是什么

Bloom for DSH —— DeepSeek Harness 的「玻璃 + 莫兰迪」主题插件。10 套明暗双配色
（OKLCH 调色、全部实测 WCAG AA），顶栏一键切换，零运行时依赖。npm 包名 `dsh-bloom-theme`。

## 关键文件

- `src/`：TypeScript 源码（入口 `src/index.ts`）——**只改这里**，`lib/` 是构建产物。
- `lib/`：tsc + bundle 的产物，npm 发布的就是它；不要手改。
- `contrast.config.json`：contrast-guard 护栏配置 —— 所有配色改动必须过这道门。
- `assets/`：壁纸与静态资源。
- `README.md` / `README.en.md`：双语 README，**两边必须同步改**。

## 常用命令

```bash
npm run build            # typecheck + tsc + bundle
npm run dev              # build + watch + 自动部署到本机 DSH profile
npm run package          # build + npm pack（发版前自检）
npm run sync-version     # 同步版本号（发版用）
```

## 约定

- **桌面端优先**：迭代重心是 DSH 桌面端；Web UI 只保持可用、不主动适配（见 README「桌面端优先」一节）。
- **配色改动必过对比度护栏**：调任何颜色后跑 contrast-guard，不达标不许合入 —— 这是本项目的核心卖点，破了就是砸招牌。
- **零运行时依赖**是承诺，新增 dependency 前先想清楚。
- 版本与 CHANGELOG 走既有发版流程（`sync-version` + npm publish），不要手改 CHANGELOG 的历史段落。
