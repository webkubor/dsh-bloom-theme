<p align="center">
  <img src="https://img.webkubor.online/projects/dsh-bloom-theme/bloom-banner.png" alt="Bloom for DSH" width="100%" />
</p>

<h1 align="center">🌊 Bloom for DSH</h1>

<p align="center">
  <strong>10 套莫兰迪中国风主题，配色全部实测达 WCAG AA</strong><br/>
  <sub>Ten Morandi palettes for DeepSeek Harness — every one measured against WCAG AA.</sub>
</p>

<!-- bloom-series-nav -->

<table align="center">
<tr>
<td align="center" width="33%"><a href="https://github.com/webkubor/typora-Bloom-theme">🌸 Bloom for Typora</a><br/><sub>24 套主题</sub></td>
<td align="center" width="33%"><b>🌊 Bloom for DSH</b><br/><sub>10 套配色 · 当前</sub></td>
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
  <img src="https://img.shields.io/github/stars/webkubor/dsh-bloom-theme?style=for-the-badge&color=cc584d" alt="Stars" />
  <img src="https://img.shields.io/github/license/webkubor/dsh-bloom-theme?style=for-the-badge&color=5fa8b2" alt="License" />
</p>

<p align="center">
  <a href="https://awesome-dsh-plugin.com"><img src="https://awesome-dsh-plugin.com/badge.svg" alt="Awesome DSH Plugin" /></a>
  <a href="https://github.com/deepseek-ai/deepseek-harness"><img src="https://img.shields.io/badge/DeepSeek_Harness-Plugin-4d6bfe?style=for-the-badge" alt="DSH Plugin" /></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/topic-dsh--plugin-4d6bfe?style=for-the-badge" alt="dsh-plugin" /></a>
  <img src="https://img.shields.io/badge/TypeScript-built-3178c6?style=for-the-badge" alt="TypeScript" />
  <img src="https://img.shields.io/badge/WCAG-AA-6a9955?style=for-the-badge" alt="WCAG AA" />
  <img src="https://img.shields.io/badge/OKLCH-color-A873C4?style=for-the-badge" alt="OKLCH" />
  <img src="https://img.shields.io/badge/dependencies-0-92a8b3?style=for-the-badge" alt="zero dependency" />
</p>

<p align="center">
  <b>中文</b> | <a href="README.en.md">English</a>
</p>

<p align="center">
  把 <a href="https://github.com/webkubor/typora-Bloom-theme">Bloom</a>（90★ Typora 主题）的莫兰迪质感搬进
  <a href="https://github.com/deepseek-ai/deepseek-harness">DeepSeek Harness</a>。
  <br />
  <b>玻璃 + 莫兰迪</b>：10 套明暗双主题，磨砂玻璃面板，顶栏一键切换，
  连 AI 思考的等待也跟主题一起呼吸。
</p>

## 📌 桌面端优先 —— 关于 DSH Web UI 的说明

**结论：Bloom 接下来的迭代优先兼容 DSH 桌面端；Web UI 不再主动适配，会逐步淡出。**

（0.16.0 及更早的版本是按 DSH Web UI 做的；**0.17.0 起适配桌面端**——这一版补上了 DSH 0.2.0 的选择器适配，并加了能自动发现这类失效的漂移门禁。）

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
10 套配色，明暗自适应，顶栏一键切换；面板是真正的磨砂玻璃（半透 + backdrop 模糊 + 玻璃边缘），
配色是低饱和莫兰迪（OKLCH 调色、WCAG AA），全站统一克制的微动效，零运行时依赖，前端 TypeScript 构建。

> 莫兰迪的气质不在 `--accent`，在 `--accent-rgb`。

## 🏆 为什么用它

| | DSH 原生 | 普通主题插件 | **Bloom for DSH** |
| :-- | :-- | :-- | :-- |
| 配色数量 | 1 套 | 3-5 套 | **10 套莫兰迪，明暗各一套** |
| 配色依据 | 手工挑色 | 手工挑色 | **OKLCH 感知均匀调色** |
| 对比度 | 未声明 | 未声明 | **明暗主色对全部实测 ≥ 4.5:1（WCAG AA）** |
| 面板质感 | 实色 | 实色 / 简单半透 | **真磨砂玻璃（半透 + backdrop 模糊 + 玻璃边缘）** |
| 切换方式 | — | 改配置文件 | **顶栏一键切换，即时生效** |
| 动效 | 固定 | 无 / 硬编码 | **跟随主题三色光谱，支持 prefers-reduced-motion** |
| 运行时开销 | — | 常驻进程 / 依赖 | **零依赖，只注入 CSS 变量** |

## 截图

<p align="center">
  <img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-sage-light.png" alt="Bloom · Sage (light)" width="100%" />
  <sub>竹青·亮色 —— 磨砂玻璃面板 + 莫兰迪绿，选中会话行以当前主题高亮</sub>
</p>

**10 套配色（亮色）**：点击任意一套，全站主色 / 背景 / 玻璃 / 动效色相一起切换。

<table align="center">
<tr>
<td align="center" width="20%">☁️ 黛蓝 Mist<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-mist-light.png" width="100%"/></td>
<td align="center" width="20%">🧧 朱砂 Cinnabar<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-cinnabar-light.png" width="100%"/></td>
<td align="center" width="20%">🌸 桃夭 Petal<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-petal-light.png" width="100%"/></td>
<td align="center" width="20%">🌊 天青 Ripple<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-ripple-light.png" width="100%"/></td>
<td align="center" width="20%">🌿 竹青 Sage<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-sage-light.png" width="100%"/></td>
</tr>
<tr>
<td align="center" width="20%">🧱 赭石 Stone<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-stone-light.png" width="100%"/></td>
<td align="center" width="20%">🔷 青金 Lapis<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-lapis-light.png" width="100%"/></td>
<td align="center" width="20%">🍯 琥珀 Amber<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-amber-light.png" width="100%"/></td>
<td align="center" width="20%">🌅 落霞 Afterglow<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-aurora-light.png" width="100%"/></td>
<td align="center" width="20%">🪷 青莲 Lavender<br/><img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-lavender-light.png" width="100%"/></td>
</tr>
</table>

**每套都有对应暗色**（示例：琥珀·暗色）：

<p align="center">
  <img src="https://img.webkubor.online/projects/dsh-bloom-theme/ui-amber-dark.png" alt="Bloom · Amber (dark)" width="100%" />
</p>

## 安装

> **桌面端**：在应用内的插件管理里安装、升级。桌面 profile 由应用独占托管，
> 命令行的 `dsh plugin --profile desktop ...` 会直接报
> `profile "desktop" is managed exclusively by the Electron application` —— 不是权限问题，是设计如此。

<details>
<summary>自建 profile（CLI / 服务器 / web）的装法</summary>

```bash
# 1) 装进你的 profile（profile 名按自己的改）
dsh plugin --profile <你的 profile> add dsh-bloom-theme

# 2) 接进 boot graph：把 "dsh-bloom-theme" 加进
#    ~/.dsh/profiles/<你的 profile>/package.json 的 dsh.profile.bundles 数组

# 3) 重启 DSH
```

</details>

装完刷新页面，顶栏右上角会出现「黛蓝 ▾」主题按钮。点击展开即可在 **10 套配色**间切换，
下拉底部显示当前版本号；npm 上有更新的版本时会亮一个 `↑ vX` 徽标（点它跳 Release 页）。

## 特性

| 特性 | 说明 |
| :-- | :-- |
| **磨砂玻璃面板（默认常开）** | 半透底 + `backdrop-filter` 模糊 + 玻璃边缘（顶部亮高光 / 半透描边 / 柔和外辉），明暗两档透明度自适应 |
| **10 套莫兰迪配色** | 黛蓝 / 朱砂 / 桃夭 / 天青 / 竹青 / 赭石 / 青金 / 琥珀 / 落霞 / 青莲，每套明暗双主题，一键切换 |
| **双轨配色** | 可读轨保对比度（文字/按钮），气质轨专供氛围渐变，两轨分工不混用 |
| **微交互动效** | 菜单入场、选中态色条滑入、hover / 按压反馈；统一时长与缓动 token，全站一致 |
| **主题色推理动效** | `Deep diving…` 以当前主题三色光谱流动，不再固定 DeepSeek 蓝；`prefers-reduced-motion` 下自动静止 |
| **版本 / 更新提示** | 下拉底部显示当前版本；npm 有新版亮「↑ vX」；离版较旧时右下角弹更新横幅 |
| **OKLCH 调色 + WCAG AA** | 感知均匀色彩空间，明暗切换不跳变；全部明暗主色对实测 ≥ 4.5:1 |
| **零依赖 · 纯 CSS 变量驱动** | 只注入 CSS 变量 + 少量切换逻辑，几乎零运行时开销 |
| **不抢占原生控件** | 切换器挂进 DSH 顶栏工具区，与原生按钮并排共存 |
| **TypeScript 构建** | `src/` 10 个模块 → node 侧 `tsc`（ESM）+ 浏览器侧 `esbuild`（IIFE 单文件）；`build / deploy / check / preflight` 一键脚本 |

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
npm install
npm run typecheck    # tsc --noEmit，全量类型检查
npm run build        # typecheck → tsc 出 lib/index.js → esbuild 出 lib/client.js
npm run deploy       # 一键部署到本机 DSH（sync-version → build → rsync）
npm run preview      # 部署到 desktop-local（桌面端是 app 不是浏览器，没有可 open 的 URL）
npm run dev          # build + watch（改 src 自动编译+部署）
npm run package      # 一键打包（npm pack → .tgz）
npm run check        # 6 组静态闸门 + contrast-guard（每次提交都跑）
npm run preflight    # 发版前检查：版本五方一致 / git 状态 / 收录同步
```

源码 `src/` 是 10 个模块（`meta` · `appearance` · `palette` · `tokens` · `css/` · `dom` · `drag` · `version` · `switcher` · `client`），DSH 加载的是 `lib/` 里的产物。

**构建是双轨的**，两侧对模块格式的要求正好相反：

| 产物 | 谁编译 | 格式 | 为什么 |
|---|---|---|---|
| `lib/index.js`（node 侧） | `tsc` | **ESM** | cordis 的 plugin loader 按 ESM 读它 |
| `lib/client.js`（浏览器侧） | `esbuild` | **IIFE 单文件** | DSH 的插件 client.js 是当 classic script 执行的，出现 `import`/`export` 直接语法错误 |

所以浏览器侧源码可以随意拆模块，产物必须 bundle 回一个自包含文件。

版本号由 release-please 在 release PR 里连同 `package.json` 一起 bump（靠
`src/meta.ts` 行尾的 `x-release-please-version` 标记）；`scripts/sync-version.mjs`
只是本地 dev 的兜底同步，不在发布路径上。改动详见 [CONTRIBUTING](./CONTRIBUTING.md)。

## 常见问题

**主题没生效？** 先硬刷新一次（`Cmd/Ctrl + Shift + R`）。若页面提示 `Failed to load plugins`，
说明该版本的 client 没能注册，请确认 `dsh plugin --profile <name> add` 那步无误，或换用最新版。

**能自定义颜色吗？** 目前通过「变体」选择整套色系；单色自定义在规划中（见 Roadmap）。

## 贡献 / 开源

- 加一个新配色：在 `src/client.ts` 的 `PALETTE` / `VARIANTS` / `VARIANT_LABELS` 里加一项即可，
  其余（玻璃、动效、选中态、对比度护栏）全部自动跟上。
- 请先跑 `npm run build && npm run check`，确认 `contrast-guard` 全部达标再提 PR。
- 欢迎提 issue / PR / 好的想法。

## 支持

如果 Bloom 让你的 DSH 用起来更舒服，欢迎留下一颗 ⭐，或请我喝杯咖啡（赞助入口在下面的
[Sponsor](https://github.com/sponsors/webkubor) / 面板菜单里也有一处）。

## 🧩 DSH 插件全家桶

<p align="center">
  <img src="https://img.webkubor.online/projects/dsh-plugins/dsh-plugins-family.png" alt="DSH 插件全家桶：主题美化 / 模型管理 / 用户记忆 / 电脑环境" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/webkubor/dsh-bloom-theme">🎨 主题美化</a> ·
  <a href="https://github.com/webkubor/dsh-llm-hub">⚡ 模型管理</a> ·
  <a href="https://github.com/webkubor/dsh-mirror">🪞 用户记忆</a> ·
  <a href="https://github.com/webkubor/dsh-env-inspector">🖥️ 电脑环境</a>
</p>

一行装齐（只需 Node.js），装完重启 DSH 即可：

```bash
PROFILE=<你的 profile>
npx -y @deepseek-ai/dsh plugin --profile "$PROFILE" add dsh-bloom-theme @dsh-plugins/dsh-llm-hub @dsh-plugins/dsh-user-mirror @dsh-plugins/dsh-env-inspector && PROFILE="$PROFILE" node -e 'const f=(process.env.DSH_HOME||require("os").homedir()+"/.dsh")+"/profiles/"+process.env.PROFILE+"/package.json",p=require(f),b=p.dsh.profile.bundles;for(const n of Object.keys(p.dependencies))if(/^(dsh-bloom-theme|@dsh-plugins\/)/.test(n)&&!b.includes(n))b.push(n);require("fs").writeFileSync(f,JSON.stringify(p,null,2)+"\n")'
```

---

## License

[MIT](LICENSE) — 借用 / 修改请保留版权声明。配色参考自 [typora-Bloom-theme](https://github.com/webkubor/typora-Bloom-theme)。
