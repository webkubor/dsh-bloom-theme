<p align="center">
  <img src="https://img.webkubor.online/projects/dsh-bloom-theme/bloom-banner.png" alt="Bloom for DSH" width="100%" />
</p>

<h1 align="center">🌊 Bloom for DSH</h1>

<p align="center">
  <strong>15 套莫兰迪中国风配色，12 套精选；明暗主色均实测达 WCAG AA</strong><br/>
  <sub>15 Morandi palettes, 12 featured — light and dark accent pairs meet WCAG AA.</sub>
</p>

<!-- bloom-series-nav -->

<table align="center">
<tr>
<td align="center" width="33%"><a href="https://github.com/webkubor/typora-Bloom-theme">🌸 Bloom for Typora</a><br/><sub>24 套主题</sub></td>
<td align="center" width="33%"><b>🌊 Bloom for DSH</b><br/><sub>15 套可用 · 12 套精选</sub></td>
<td align="center" width="33%"><a href="https://github.com/webkubor/contrast-guard">🛡️ contrast-guard</a><br/><sub>配色护栏</sub></td>
</tr>
</table>

<p align="center">
  <sub>同一套莫兰迪设计语言：两个宿主的主题，加一个守住它们配色的工具。<br/>
  <i>One Morandi design language — two themes, and the tool that keeps their colors honest.</i></sub>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-bloom-theme"><img src="https://img.shields.io/npm/v/dsh-bloom-theme?style=for-the-badge&color=A873C4&logo=npm" alt="npm" /></a>
  <a href="https://www.npmjs.com/package/dsh-bloom-theme"><img src="https://img.shields.io/npm/dm/dsh-bloom-theme?style=for-the-badge&color=92a8b3" alt="downloads" /></a>
  <img src="https://img.shields.io/github/license/webkubor/dsh-bloom-theme?style=for-the-badge&color=5fa8b2" alt="License" />
</p>

<p align="center">
  <!-- 徽章克制在 6 个以内：只留「能用（版本/下载）· 可信（AA 实测收录）· 干净（零依赖）」三类信号 -->
  <a href="https://awesome-dsh-plugin.com"><img src="https://awesome-dsh-plugin.com/badge.svg" alt="Awesome DSH Plugin" /></a>
  <img src="https://img.shields.io/badge/WCAG-AA-6a9955?style=for-the-badge" alt="WCAG AA" />
  <img src="https://img.shields.io/badge/dependencies-0-92a8b3?style=for-the-badge" alt="zero dependency" />
</p>

<p align="center">
  <b>中文</b> | <a href="README.en.md">English</a>
</p>

<p align="center">
  把 <a href="https://github.com/webkubor/typora-Bloom-theme">Bloom</a>（90★ Typora 主题）的莫兰迪质感搬进
  <a href="https://github.com/deepseek-ai/deepseek-harness">DeepSeek Harness</a>。
  <br />
  <b>玻璃 + 莫兰迪</b>：15 套明暗配色，主菜单精选 12 套，磨砂玻璃面板，顶栏一键切换，
  连 AI 思考的等待也跟主题一起呼吸。
</p>

## 📌 桌面端优先 —— 关于 DSH Web UI 的说明

**结论：Bloom 接下来的迭代优先兼容 DSH 桌面端；Web UI 不再主动适配，会逐步淡出。**

（0.16.0 及更早的版本是按 DSH Web UI 做的；**0.17.0 起适配桌面端**——这一版补上了 DSH 0.2.0 的选择器适配，并加了能自动发现这类失效的漂移门禁。）当前桌面应用使用 0.2.1-rc.5 时，切换器的版本提示读取桌面应用版本，而不是内嵌 DSH 包的旧版本；漂移门禁也优先检查本机已安装的桌面版本。

DSH 有了桌面端应用，我自己日常已经切过去了。主题这类东西的价值长在 UI 上——宿主怎么改界面，
配色和玻璃就得跟着长——所以迭代重心跟着挪到桌面端。

具体到你会遇到什么：

| 你在用 | 会发生什么 |
|---|---|
| **桌面端** | 新配色、新动效、视觉修复都优先在这里出。我每天都在用它，界面变了我就会跟。 |
| **Web UI** | 保持现状可用，但不再主动适配 DSH Web 端的新变化；DSH 若改了结构导致某处显示不对，我不一定及时跟。 |

两点补充，省得你按标题猜：

- **已经装上的版本不会失效。** 停的是「跟着新界面继续长」，不是「把你现在能用的弄坏」。
- 如果你只能用 Web UI，欢迎开 issue 把场景说清楚——真实需求会改变我的判断，这句不是客套。

> **上一个版本（0.16.0）改了什么**：在跑的步骤接管主题色（扫光从灰换成 Bloom 三色）；
> 轮次状态的三色光谱重新接上（DSH 改名后它静默消失了）；修浅色模式下消息气泡没画出来的玻璃边；
> 修子串选择器自叠造成的「盒中盒」与「直角黑块 chip」；撤掉在跑步骤上的胶囊底色——状态不该靠盒子说话。

## 一句话

**给 DeepSeek Harness 的「玻璃 + 莫兰迪」主题。**
15 套配色（菜单精选 12 套），明暗自适应，顶栏一键切换；面板是真正的磨砂玻璃（半透 + backdrop 模糊 + 玻璃边缘），
配色是低饱和莫兰迪（OKLCH 调色、WCAG AA），全站统一克制的微动效，零运行时依赖，前端 TypeScript 构建。

> 莫兰迪的气质不在 `--accent`，在 `--accent-rgb`。

## 快速开始

> 主菜单精选 12 套，按色系相邻排列、赤橙黄绿青蓝紫每系至少一套：朱砂、粉霞、橙黄、落霞、轻黄、草色、天青、黛蓝、青金、青莲、银红、桃夭。
> 其余历史配色仍能读取旧偏好；若当前选中旧色，菜单会临时显示它，切走后收起。
> 自动换色默认关闭，可设 5 / 15 / 30 / 60 分钟，休眠或隐藏时暂停。

在 DSH 应用内「插件管理」安装，按返回提示完成应用或重启。顶栏「黛蓝 ▾」按钮提供 12 套精选配色、明暗与自动换色设置。官方 `plugin_manager` 安装方式见下方[安装](#安装)。

## 🏆 为什么用它

| | DSH 原生 | 普通主题插件 | **Bloom for DSH** |
| :-- | :-- | :-- | :-- |
| 配色数量 | 1 套 | 3-5 套 | **15 套可用、12 套精选，均有明暗配色** |
| 配色依据 | 手工挑色 | 手工挑色 | **OKLCH 感知均匀调色** |
| 对比度 | 未声明 | 未声明 | **明暗主色对全部实测 ≥ 4.5:1（WCAG AA）** |
| 面板质感 | 实色 | 实色 / 简单半透 | **真磨砂玻璃（半透 + backdrop 模糊 + 玻璃边缘）** |
| 切换方式 | — | 改配置文件 | **顶栏一键切换，即时生效** |
| 动效 | 固定 | 无 / 硬编码 | **跟随主题三色光谱，支持 prefers-reduced-motion** |
| 运行时开销 | — | 常驻进程 / 依赖 | **零依赖，只注入 CSS 变量** |

## 配色预览

主菜单 12 套精选配色，按实际菜单顺序展示。上图依据 **v0.23.0 色板中的真实明暗色值** 绘制，是用于比较色系的配色示意，**不是 DSH 应用截图**；之前未通过验收的天青浅色实底试点不在本版中。

[![v0.23.0 的 12 套浅色配色示意](https://img.webkubor.online/projects/dsh-bloom-theme/v0.23.0/palettes-light.png)](https://img.webkubor.online/projects/dsh-bloom-theme/v0.23.0/palettes-light.png)

[![v0.23.0 的 12 套暗色配色示意](https://img.webkubor.online/projects/dsh-bloom-theme/v0.23.0/palettes-dark.png)](https://img.webkubor.online/projects/dsh-bloom-theme/v0.23.0/palettes-dark.png)

**真实界面截图（v0.23.0，黛蓝）**：

| 深色 | 浅色 |
| :-- | :-- |
| ![黛蓝深色的 DSH 界面](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-mist-dark.png) | ![黛蓝浅色的 DSH 界面](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-mist-light.png) |

**其它精选配色**：

| 天青 · 浅色 | 天青 · 深色 |
| :-- | :-- |
| ![天青浅色的 DSH 界面](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-ripple-light.png) | ![天青深色的 DSH 界面](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-ripple-dark.png) |

| 草色 · 深色 | 青莲 · 浅色 |
| :-- | :-- |
| ![草色深色的 DSH 界面](https://img.webkubor.online/projects/dsh-bloom-theme/ui-mint-dark.png) | ![青莲浅色的 DSH 界面](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-lavender-light.png) |

| 轻黄 · 深色 | 朱砂 · 浅色 |
| :-- | :-- |
| ![轻黄深色的 DSH 界面](https://img.webkubor.online/projects/dsh-bloom-theme/ui-osmanthus-dark.png) | ![朱砂浅色的 DSH 界面](https://img.webkubor.online/projects/dsh-bloom-theme/v0230-ui-cinnabar-light.png) |

## 更新

检测到新版后，支持 `remote.pluginManager.updateBundle` 的宿主会在更新横幅中显示「立即更新」，由宿主完成原位更新与失败恢复。若宿主返回需要重启，横幅提示重启应用；已应用成功时显示「已更新到 v{版本}」，不提供页面重载按钮。缺少此接口的旧宿主，不显示无效的一键更新按钮，仍指向侧栏「插件」管理。桌面端不提供会被拒绝的终端更新命令；自建 CLI profile 保留复制命令。

## 安装

在正在运行的 DSH 中打开「插件」管理，安装 `dsh-bloom-theme`。也可以让当前 DSH 会话使用官方 `plugin_manager`：先列出已有 bundle，再通过 `install_bundle` 安装明确版本；本地开发使用构建完成的仓库绝对路径。

按安装返回的 `application` / `nextStep` 完成后续操作；替换已有包时可能需要重启应用，页面刷新不能替代宿主重启。安装与升级由宿主管理，无需手改 profile 依赖或复制 `node_modules`。

应用安装结果后，主题按钮通过官方 Slot 提供的锚点定位在 DSH 对话顶栏。点击展开即可在 **12 套精选配色**间切换，
下拉底部显示当前版本号；npm 上有更新的版本时会亮一个 `↑ vX` 徽标（点它跳 Release 页）。

## 特性

| 特性 | 说明 |
| :-- | :-- |
| **磨砂玻璃面板（默认常开）** | 半透底 + `backdrop-filter` 模糊 + 玻璃边缘（顶部亮高光 / 半透描边 / 柔和外辉），明暗两档透明度自适应 |
| **15 套莫兰迪配色** | 黛蓝 / 朱砂 / 桃夭 / 天青 / 竹青 / 赭石 / 青金 / 琥珀 / 落霞 / 青莲 / 草色 / 橙黄 / 银红 / 粉霞 / 轻黄共 15 套，主菜单精选 12 套；旧版偏好继续有效，明暗双主题 |
| **界面语言** | 只跟随 DSH 的统一语言设置（中文 / English），不扩展语言目录；只换文案，配色与对比度结论一概不动 |
| **双轨配色** | 可读轨保对比度（文字/按钮），气质轨专供氛围渐变，两轨分工不混用 |
| **微交互动效** | 菜单入场、选中态色条滑入、hover / 按压反馈；统一时长与缓动 token，全站一致 |
| **主题色推理动效** | `Deep diving…` 以当前主题三色光谱流动，不再固定 DeepSeek 蓝；`prefers-reduced-motion` 下自动静止 |
| **版本 / 更新提示** | 下拉底部显示当前版本；npm 有新版亮「↑ vX」；离版较旧时右下角弹更新横幅，桌面端提示在侧栏「插件」管理中更新 |
| **面板更新日志** | 「版本与更新」里直接看本版更新点（取自 CHANGELOG），不用跳出去；「完整日志 ›」一键到 GitHub Releases |
| **输入呼吸光** | 打字时输入卡上有一道主题色扫光，停手约 1 秒淡出；`prefers-reduced-motion` 下自动静止 |
| **匿名使用统计（可关）** | 只上报按钮点击的事件名 + 版本 + 语言；面板里一键关闭，详见下方「隐私」 |
| **OKLCH 调色 + WCAG AA** | 感知均匀色彩空间，明暗切换不跳变；全部明暗主色对实测 ≥ 4.5:1 |
| **零依赖 · 纯 CSS 变量驱动** | 只注入 CSS 变量 + 少量切换逻辑，几乎零运行时开销 |
| **不抢占原生控件** | 切换器挂进 DSH 顶栏工具区，与原生按钮并排共存 |
| **TypeScript 构建** | `src/` 按职责拆分 → node 侧 `tsc`（ESM）+ 浏览器侧 `esbuild`（IIFE 单文件）；`build / dev / check / preflight` 一键脚本 |

## 设计原理：双轨色

Bloom 的核心不是「换个颜色」，而是一套**莫兰迪质感语言**：低饱和的氛围渐变、冷调的发光细线、
长距柔和的投影、克制的圆角与间距。

最容易被忽略（也最容易被做崩）的是**双轨色**：

- **可读轨 `--bloom-accent`** —— 被刻意加深过，为了过 WCAG，用在文字 / 按钮 / 选中态；
- **气质轨 `--accent-rgb`** —— 真正的莫兰迪色（低饱和、发灰），只用于大面积氛围渐变、冷光细线。

原版 14 处渐变全部用气质轨，从不用可读轨铺面。一旦把可读色拿去刷大面积，
桃夭就会从藕粉变成荧光洋红——莫兰迪感就没了。这个插件把两轨完整搬过来，
并在 `contrast-guard`（同系列工具）里用护栏守住「主色 + 底色」的对比度。

## 开发 / 构建（TypeScript）

```bash
npm ci
npm run typecheck    # tsc --noEmit，全量类型检查
npm run build        # typecheck → tsc 出 lib/index.js → esbuild 出 lib/client.js
npm run dev          # 完整构建后监听浏览器源码，仅更新本仓 lib/
npm run package      # 一键打包（npm pack → .tgz）
npm run check        # 6 组静态闸门 + contrast-guard（每次提交都跑）
npm run preflight    # 发版前检查：版本五方一致 / git 状态 / 收录同步
```

源码 `src/` 按职责拆分，DSH 加载的是 `lib/` 里的产物。`dev` 只编译浏览器侧源码；修改 Host 入口、版本或 CHANGELOG 后重新运行完整构建。构建完成后通过官方插件管理安装，按返回状态完成重启并核对实际版本。开发脚本不自动部署、不触发浏览器快捷键刷新。

根 `conversation.header.leading` Slot 提供本插件自己的定位锚点；完整切换器、菜单、星光与更新提示挂载在根 `shell.overlay` Slot，避免宿主顶栏裁剪。定位只测量自己的锚点，移除了宿主 DOM 找位、重挂与悬浮拖拽兜底。

**构建是双轨的**，两侧对模块格式的要求正好相反：

| 产物 | 谁编译 | 格式 | 为什么 |
|---|---|---|---|
| `lib/index.js`（node 侧） | `tsc` | **ESM** | cordis 的 plugin loader 按 ESM 读它 |
| `lib/client.js`（浏览器侧） | `esbuild` | **IIFE 单文件** | DSH 的插件 client.js 是当 classic script 执行的，出现 `import`/`export` 直接语法错误 |

所以浏览器侧源码可以随意拆模块，产物必须 bundle 回一个自包含文件。

版本号由 release-please 在 release PR 里连同 `package.json` 一起 bump（靠
`src/meta.ts` 行尾的 `x-release-please-version` 标记）；`scripts/sync-version.mjs`
只按现有包版本同步源码，供产物重建和发布前校验使用，不决定下一版本。

main push、定时巡检和默认手动触发只准备 Release PR，`auto_merge_release` 默认关闭。完成真实桌面安装验收、当前 head 的 CI、独立评审和 `preflight` 后，发布负责人才可在本仓执行以下命令，允许 Release PR 合并并触发正式发布：

```bash
gh workflow run release-please.yml -f auto_merge_release=true
```

准备候选版时不执行此命令。合并遵守 GitHub 分支保护，不自动解决评审线程，不使用直接合并兜底；完整步骤见 [CONTRIBUTING](./CONTRIBUTING.md)。

## 隐私

面板里的「投票 / 反馈 / 分享」等按钮会向作者的统计接口（`webkubor.online/api/event`）发送**一次匿名点击计数**，内容只有：事件名（如 `share`）、插件版本、界面语言。不含对话内容、不读页面文本、不带 Cookie，服务端也只按天聚合计数（[接口实现](https://github.com/webkubor/blog)）。

不想发任何东西：面板「版本与更新」里关掉「发送匿名使用统计」即可，或 `localStorage.setItem('bloom-telemetry','off')`。

## 常见问题

**主题没生效？** 先在插件管理中确认包已启用及安装结果；若返回需要重启，完成应用重启后再核对版本。若页面提示 `Failed to load plugins`，检查宿主兼容性及 client 注册错误，并通过官方插件管理恢复兼容版本。

**能自定义颜色吗？** 目前通过「变体」选择整套色系；单色自定义在规划中（见 Roadmap）。

## 贡献 / 开源

- 加一个新配色：在 `src/palette.ts` 的 `PALETTE` / `VARIANTS` / `VARIANT_LABELS` 里加一项即可，
  其余（玻璃、动效、选中态、对比度护栏）全部自动跟上。
- 请先跑 `npm run build && npm run check`，确认 `contrast-guard` 全部达标再提 PR。
- 欢迎提 issue / PR / 好的想法。

## 支持

如果 Bloom 让你的 DSH 用起来更舒服，欢迎留下一颗 ⭐，或请我喝杯咖啡（赞助入口在下面的
[Sponsor](https://github.com/sponsors/webkubor) / 面板菜单里也有一处）。

## 🧩 DSH 插件全家桶

<p align="center">
  <img src="https://img.webkubor.online/projects/dsh-plugins/dsh-plugins-family.png" alt="DSH 插件全家桶：主题美化 / 模型管理" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/webkubor/dsh-bloom-theme">🎨 主题美化</a> ·
  <a href="https://github.com/webkubor/dsh-llm-hub">⚡ 模型管理</a>
</p>

在 DSH 插件管理中分别安装 `dsh-bloom-theme` 和 `@dsh-plugins/dsh-llm-hub`，各自按安装结果完成后续操作。让宿主管理 bundle 注册与依赖，不需要 shell 改写 profile。

---

## Star History

<a href="https://www.star-history.com/#webkubor/dsh-bloom-theme&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=webkubor/dsh-bloom-theme&amp;type=Date&amp;theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=webkubor/dsh-bloom-theme&amp;type=Date" />
    <img alt="Star History Chart for webkubor/dsh-bloom-theme" src="https://api.star-history.com/svg?repos=webkubor/dsh-bloom-theme&amp;type=Date" width="100%" />
  </picture>
</a>

## License

[MIT](LICENSE) — 借用 / 修改请保留版权声明。配色参考自 [typora-Bloom-theme](https://github.com/webkubor/typora-Bloom-theme)。
