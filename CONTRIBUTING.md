# 贡献指南

欢迎提 issue 和 PR。

## 本地开发

```bash
git clone https://github.com/webkubor/dsh-bloom-theme
cd dsh-bloom-theme
npm run dev      # 监听 lib/，保存即部署到 web profile 并自动刷新浏览器
```

改完必须刷新页面——皮肤在浏览器端注入，且 CSS 由 `client.js` 运行时生成，
没有「只热更 CSS」这条路。`npm run dev` 已代劳（按 `a` 可关掉自动刷新）。

## 源码结构与构建

`src/` 是 10 个模块，按依赖分层（箭头 = import 方向）：

```
meta.ts        插件 ID / 版本号 / localStorage key —— 最底层，不 import 任何东西
palette.ts     8 套配色的色板与标签 + mix()  —— 纯数据，无依赖
   ↓
tokens.ts      色板 → CSS 变量（borderStack / labelStack / sharedDswTokens / 三个变体块）
css/           component.ts · glass.ts · switcher.ts —— 纯 CSS 字符串常量，零插值
dom.ts         样式注入 / 变体读写 / 宿主查找 / <think> 收拾
version.ts     Bloom 自己的 npm 最新版 + DSH 宿主 rev 检查
   ↓
switcher.ts    顶栏切换器（含 applyVariant —— 它更新切换器 DOM，属这里的职责）
   ↓
client.ts      入口：三个立即执行块 + window.__ModuleLoader__.load()
```

**构建是双轨的，两侧的模块格式要求正好相反：**

| 产物 | 谁编译 | 格式 | 为什么 |
|---|---|---|---|
| `lib/index.js`（node 侧） | `tsc` | **ESM** | cordis 的 plugin loader 按 ESM 读它 |
| `lib/client.js`（浏览器侧） | `esbuild`（`scripts/bundle.mjs`） | **IIFE 单文件** | DSH 的插件 client.js 是当 **classic script** 执行的，出现 `import`/`export` 直接语法错误 |

所以浏览器侧源码可以随意拆模块，**产物必须 bundle 回一个自包含文件**。
`scripts/bundle.mjs` 打完包会自检产物里没有顶层 `import`/`export`/`require`，
且确实含 `window.__ModuleLoader__` —— 少了后者 DSH 根本不会注册这个插件。

```bash
npm run typecheck   # tsc --noEmit，全量类型检查（含所有模块）
npm run build       # typecheck → tsc 出 index.js → esbuild 出 client.js
```

⚠️ **改动这个结构时记得连带检查三处配置**，它们都按路径找 `PLUGIN_VERSION`：
`scripts/sync-version.mjs`（已改为扫 `src/` 不硬编码文件名）、
`release-please-config.json` 的 `extra-files`、以及 `npm run check` 的版本真源组。
拆分那次这三处漂了两处 —— 而 `sync-version` 挂在 `npm run deploy` 的 `&&` 链首位，
它一 exit 1，**整个 deploy 静默中断**，部署点留着上一版产物、页面显示旧版本号，
看起来像是主题坏了。`npm run check` 现在有一条闸门专门盯 `extra-files` 的有效性。

## 提交前

```bash
npm run check
```

这会校验六组，全是踩过坑才加的 —— 前三组是「改坏了会报错」，后三组是「改**偏**了会报错」，
后者才是本项目真正反复失血的地方：

1. **打包契约** —— `dsh.bundle.patch`、包名与 `cordis.patch.yml` 一致、`files` 白名单、
   以及 `client.js` 里 `PLUGIN_ID` 与包名一致（不一致会让 DSH 报
   `loaded without registering`）
2. **scripts 命名** —— script 名不得与 npm 生命周期钩子同名。曾有个
   `"publish": "... && npm publish"`，而 `publish` 本身就是钩子，发包成功后
   npm 自动触发它、又发一次 → 撞 403，让每次 CI 发布都假失败
3. **前景色 token 反模式** —— `markdown-inline-code` 不得写成裸色值（它是背景色），
   暗色阴影必须纯黑
4. **版本真源** —— `package.json` / `.release-please-manifest.json` /
   `PLUGIN_VERSION` 三处必须一致，手工 bump 直接 fail
5. **选择器稳定性** —— 剥掉注释后扫源码，任何 `<hash>_<名>` 硬编码 fail
6. **范围边界（棘轮）** —— `/bloom` 子命令 + 顶层 CSS 常量两份白名单，新增即 fail

配色对比度另由 `contrast-guard` 检查（`npm run check` 已串联），更深的视觉层
见下方「视觉审计」。

## 改配色时注意

**双轨制不能退回单轨。** 每个变体有两套色：

- `accentL` / `accentD` 是**可读轨**，用于文字、按钮填充、边框，必须过 WCAG AA
- `morandi` 是**气质轨**，只用于 `rgba(morandi, 0.05~0.2)` 的大面积氛围渐变与冷光

拿可读轨去铺大面积，或者拿气质轨去做文字色，都会失去莫兰迪质感。
改完跑 `npm run check`，对比度不达标会直接失败。

## 改 CSS 选择器时注意

DSH 用 CSS Modules，类名形如 `wSkVaW_root`（`<hash>_<语义名>`）。hash 随 DSH 构建变化，
语义名相对稳定，所以一律用 `[class*="_语义名"]` 匹配，并且：

- **限定 `div`** —— 裸 `[class*="_panel"]` 会命中 SVG 元素
- **先数命中量** —— 裸 `[class*="_card"]` 会命中 30+ 个消息卡：

  ```js
  [...document.querySelectorAll('[class*="_card"]')].length
  ```

- **描边只给有实色背景的那一层** —— 加在内层透明元素上会形成「框中框」

## 提交信息

用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：
`feat` / `fix` / `docs` / `ci` / `chore` / `refactor`。

正文说清**为什么**这么改，不只是改了什么——本项目多数 bug 的根因都不在报错指向的地方，
完整复盘见 [DEV_NOTES.md](./DEV_NOTES.md)。

## 发版流程

**版本号与 CHANGELOG 由 release-please 独占。人只写 commit。**

1. 改完 `npm run deploy`，在真实 DSH 里验证
2. `npm run check` 通过
3. 跑一遍**视觉审计**（下一节），`verdict: PASS`
4. 用 Conventional Commits 提交、推 main
5. 合并 release PR 之前跑 `npm run preflight` —— **到此结束**

### `npm run check` 与 `npm run preflight` 的分工

| | 范围 | 何时跑 |
|---|---|---|
| `check` | 纯静态、无副作用、**不联网** | pre-commit + CI，每次提交 |
| `preflight` | 读 git 状态、**要联网** | 发版前手动，合 release PR 之前 |

preflight 查 check 照不到的那一类 —— 它们都得对照**外部真源**才能发现，而这个仓库
每一条都真实出过事：

1. **版本真源** —— 本地三处 + npm registry + git tag 五方一致。曾出现四头分裂
   （npm `0.6.0` / git `0.6.1` / 工作区 `0.6.2` / release PR 想发 `0.7.0`），
   以及 `v0.6.0` tag 指向 `0.4.0` 的 commit、Publish workflow 因此挂掉。
2. **git 状态** —— 在 main、工作区干净、与 origin 同步、无已合并的僵尸分支、
   无残留 worktree。
3. **展示资源** —— 8 变体 × 明暗 = 16 张截图齐全，README 引用的本地图不断链。
4. **awesome-dsh-plugin 收录同步** —— 拉线上的条目和 `data/screenshots.json` 比对：
   描述里的变体数是否还准、市场截图是否注册过。这条抓到过真问题：条目长期写着
   「four variants」（实际早就 8 个），且一张截图都没注册，
   [dsh-market](https://github.com/dsh-market/dsh-market) 详情页只能从 README 瞎抽。

离线时联网项自动跳过并标注，不会因为没网就报假失败。

之后全自动：release-please 收集 commit → 开/更新 Release PR（里面 bump 版本号、
写 CHANGELOG）→ 你合并那个 PR → 打 tag → `publish.yml` 发 npm + 建 Release。

### ⛔ 不要做这些

| 别做 | 为什么 |
|---|---|
| `npm version` / 手改 `package.json` 版本号 | release-please 按 commit 自己算版本，手改会和它的账本（`.release-please-manifest.json`）打架 |
| `npm publish`（本地） | 发布只应由 tag 触发，本地发会让 npm 上出现 git 里不存在的版本 |
| 手写 `chore: release vX.Y.Z` commit | 它不打 tag、不触发 publish，只会让 git 版本领先 npm |
| 手写 `CHANGELOG.md` 条目 | release-please 按 commit 重新生成，手写条目会与它的输出重复 |

这四条不是洁癖 —— 2026-08-24 实际出现过**版本四头分裂**：npm 上 `0.6.0`、
git main `0.6.1`、工作区 `0.6.2`、release-please PR 想发 `0.7.0`，同时 Release PR
的 changelog 把 `0.3.x` 时代的 commit 又全列了一遍。根因就是这份文档以前写的是手工
流程、而 CI 装的是 release-please，**同一个仓库里存在两套发布协议**。

现在 `npm run check` 会校验版本三处副本（`package.json` / manifest /
`src/client.ts` 的 `PLUGIN_VERSION`）一致，手工 bump 会直接被拦下。

### 视觉审计（改动配色 / token / 玻璃层时必跑）

`npm run check` 是纯 node 的，算不了 `color-mix()` / `oklch()` 的最终 sRGB 值，
也看不到「半透明面板叠在氛围渐变之后」的实际对比度 —— 那些只有 CSS 引擎能回答。
所以有一个浏览器端脚本补这一层：

```bash
npm run deploy   # 先部署到 web profile
# 然后在 ego-browser 里打开 http://127.0.0.1:3080，注入并运行：
#   scripts/visual-audit.browser.js  →  window.__bloomAudit()
```

它查三件事，全都是本项目真实出过血的地方：

| 检查 | 覆盖 | 修过的坑 |
|---|---|---|
| 文字对比度 | 8 变体 × 明暗 = 16 组 × 9 个文字色 token = 144 项，外加当前 DOM 全量扫描 | 亮色 `label-tertiary` 3.46:1、暗色 `label-dimmed` 8/8 变体不及格、状态色亮色档 success 2.0:1 / warn 1.7:1 |
| 暗底高亮边框 | 真实渲染的 border / outline | 「前景色 token 当边框用」已复发三次（inline-code / bloom-shadow / border 阶梯） |
| 未接管的 DSH 静态色 | static 层绕过 alias 层的具体色值 | `#679efe` 曾让 8 套配色的 tab 选中色永远是蓝的；`#adb2b8` 曾是设置面板那圈刺眼灰白边 |

外加两条结构断言：`state-business-primary` 必须已接管为 accent（曾在 mist 下失效，
因为 mist 块留了旧定义），`label` 四档必须单调递减（曾塌成一档）。

**先看 `TRUSTWORTHY` 和 `sanity`。** 脚本有自检 —— 它得先算对几个已知答案
（白字/深底 ≈17:1、oklch 近白必须解析成近白）才输出结论。自检不过时它报的
「0 问题」没有任何意义：这套扫描器的前两版就因为用 rgb 正则解析 `oklch(...)`
而把所有对比度算成 ≈1.0，一次报出 54 条假阳性、一次把真问题全漏掉。

**运行时层不要用属性强切来切变体/明暗。** DSH 部分组件的背景不跟着重算，会量到
上一个变体的残留值（实测「新会话」按钮 1.02:1、切换器名字 1.86:1，真实切换下
都不存在）。要切就走设置面板 + 刷新。属性切换只可用于纯 token 层（`auditTokens`）。

### 需要跳版本或跳过发布

不要手改文件，用 release-please 的协议：close 那个 Release PR 并评论
`/autorelease:skip`，或 `/autorelease:major` / `/autorelease:minor`。

## 范围边界：什么该进这个仓库

定位（README「一句话」）：**给 DSH 的「玻璃 + 莫兰迪」主题** = 配色 + 质感 + 切换器。

这个仓库反复失血的地方不是 bug，是**范围往外长**，而且每次都以删除收场：

| 越界功能 | 结局 |
|---|---|
| 0.4.0 壁纸 / 氛围层 | 0.5.0 全删 |
| 0.5.0 代码统计卡（`/bloom stats` + 顶栏胶囊 + PNG 导出，约 500 行） | 0.8.0 全删 |

统计卡那次尤其值得记住：它撑了三个版本，而**浏览器端展示的一直是假数据** ——
顶栏卡片想读 `/bloom-stats.json`，但从来没有任何代码提供过这个端点（实测 404），
于是永远 fallback 到硬编码的 `STATS_SAMPLE`，任何用户看到的都是本仓库的示例
数字（3864 行 / 45 文件，项目名固定 `dsh-bloom-theme`）。

根本矛盾是**浏览器端拿不到本地 git 数据**，而主题不该为此引入 client↔node 实时桥。
也就是说：这个功能在「主题插件」这个载体里就是做不成的，当初硬塞进来时就已经
注定要靠假数据顶着。**越界的功能往往不只是不该在这儿，而是在这儿根本做不对。**

新功能进来前先问一句「它属于配色 / 质感 / 切换器吗」。不属于就该是独立插件。
`npm run check` 用两份白名单把这条做成了棘轮：

- `/bloom` 子命令白名单（**当前为空** —— 主题不提供任何命令）
- 顶层 CSS 常量白名单（`COMPONENT_CSS` / `GLASS_CSS` / `SWITCHER_CSS`）

新增会直接 fail。确实要扩，就改白名单**并**同步 README 的「一句话」—— 让范围扩张
成为一次显式的、写下来的决策，而不是悄悄多出 500 行。

## 怀疑 DSH 有 layout bug 时：先证明不是自己造成的

**这是本项目最贵的一课。** 设置面板「279px 窄 drawer + 中文逐字竖排」被当成 DSH 的
bug 修了三轮（v0.6.0 修 → v0.6.1 回滚并记为「去官方提 issue」→ 又改回来，
一共 60 行 modal 改造 CSS）。

真相：**DSH 原生设置面板本来就是 800×800 的居中 modal，中文正常横排。**
那个 bug 是 Bloom 自己造成的 —— 侧栏的 `backdrop-filter` 让 `_sidebarCol` 成为
其 `position: fixed` 后代的 containing block，而 DSH 的设置面板恰好挂在侧栏子树里，
于是 overlay 的 `fixed` 从「相对视口」变成「相对 280px 的侧栏」。

所以在动手覆盖 DSH 布局之前，**先摘掉 Bloom 自己的样式量一遍原生形态**：

```js
// 在 DSH 里跑：禁用 Bloom 注入的相关规则 + 摘掉可疑属性，再量几何
side.style.setProperty('backdrop-filter', 'none', 'important')
console.log(el.getBoundingClientRect())   // 和「有 Bloom」时对比
```

差异消失 → 是我们自己的问题，去修根因，别写覆盖。

### 会污染后代 fixed 的属性（加玻璃/动效前必查）

| 属性 | 破坏什么 | 症状 |
|---|---|---|
| `backdrop-filter` / `filter` / `transform` / `perspective` / `contain` / `will-change` | 成为 fixed 后代的 **containing block** | 定位基准变了，fixed 元素被钳在该祖先的盒子里 |
| `isolation: isolate`（以及任何 `z-index` ≠ auto 的定位元素） | 创建 **stacking context** | 层叠顺序变了，fixed 元素被同级内容盖住 |

判据：**「这个元素的子树里有 `position: fixed` 的东西吗？」**
有 → 玻璃必须走 `::before`（伪元素的 `backdrop-filter` 只作用于自己），
且不得顺手加 `isolation` —— 修第一个坑时当场踩了第二个：加了 `isolation: isolate`
让设置面板被 composer 盖住。

### 确实需要覆盖 DSH 布局时

只准用语义 / 结构选择器，绝不写 `.VOzbGW_overlay` 这种带构建 hash 的类名 ——
hash 随 DSH 每次构建变化，写死会在升级后**静默失效**（无报错无告警）。
需要收紧作用域时用 `:has()` 匹配 DOM 结构特征：

```ts
// 例：DSH 设置面板 = 唯一「直接子元素同时有 _mask 和 _panel」的 overlay
'div[class*="_overlay"]:has(> div[class*="_mask"]):has(> div[class*="_panel"])'
```

`npm run check` 会扫 `src/client.ts`（剥掉注释后）拦下任何 `<hash>_<名>` 硬编码。
