# 开发复盘

按时间倒序记录每个坑的**现象 → 根因 → 修法**，避免重复踩。

---

## 2026-08-24 · deploy 绕过依赖声明，掩盖了「profile 装着 5 个版本前的插件」

### 现象

收尾时顺手核对本地 DSH，发现页面上跑的切换器只有 **4 个变体**、没有 glass.css ——
而我们已经发到 0.8.1（8 变体）。`~/.dsh/profiles/web/node_modules/` 里的插件是
**0.3.4**，文件时间戳还是 8 月 19 日。

### 根因

web profile 的 `package.json` 长期声明：

```json
"@kubor/dsh-bloom-theme": "^0.3.4"
```

**caret 对 `0.x` 的语义是 `>=0.3.4 <0.4.0`** —— 它根本不匹配 0.8.1，只会装 0.3.x。
声明从 0.3.4 时代起就没更新过。

那为什么开发时一直看着是最新的？因为 `npm run deploy` 是

```
rsync -av --delete lib/ ~/.dsh/profiles/web/node_modules/.../lib/
```

**直接覆盖文件、绕过了包管理器**。于是「实装内容」和「依赖声明」长期脱节，
而只有前者是我们每次验证时看到的。直到某次 `pnpm install`（当天 17:12）
按声明把整个目录重装回 0.3.4，才暴露出来。

也就是说：这一整轮的实机验证本身是有效的（验证时确认过部署点是 0.8.x），
但那份「有效」随时可能被一次 install 抹掉，而且抹掉后毫无提示。

### 修法

1. 声明改成 `^0.8.1`，跑 `pnpm install` 从 npm 装正式包（不再依赖 rsync 的覆盖）
2. `npm run preflight` 加第 5 组：比对**声明**与**实装**，两者都要跟当前版本对得上。
   注意判据要按 `0.x` 的 caret 语义写 —— 声明 `^0.8.1` 在发 0.9.0 时同样会失配，
   这条检查就是为了那时候能立刻发现。

### 教训

**「我本地是好的」要问一句：好的那份东西是怎么进去的。** 用 rsync/软链把产物塞进
运行环境，验证的是产物，验证不到「运行环境会不会自己把它换掉」。凡是绕过包管理器
的部署方式，都得额外有一条检查盯着声明本身 —— 否则声明可以过时任意久，
而症状只在某次不相关的 install 之后突然出现。

---

## 2026-08-24 · 约束写了但没有闸门（本仓最大的坑）

### 现象

项目「走偏」，而且是三处同时偏：

1. **版本四头分裂** —— npm 上 `0.6.0`、git main `0.6.1`、工作区 `0.6.2`、
   release-please PR 想发 `0.7.0`；且那个 Release PR 的 changelog 把 `0.3.x`
   时代的 commit 又全列了一遍。
2. **设置面板中文竖排来回改三轮** —— v0.6.0 修好 → v0.6.1 回滚（理由：不覆盖
   DSH 原生 layout，「该去官方提 issue」）→ 工作区又改回来，而且这次硬编码了
   `.VOzbGW_overlay` 这种带构建 hash 的类名。**而这个 bug 根本不是 DSH 的**
   —— 见下面单独一节。
3. **范围不断外扩** —— 一个配色主题里长出了 `/bloom stats` 代码统计卡、PNG 下载、
   DSH 版本升级检查。0.4.0 加壁纸氛围层、0.5.0 全删，是同一个病的上一轮发作。

### 根因

**规则不是没写，是写了没有执行闸门 —— 于是违反规则是零成本的。**

- `CONTRIBUTING.md` 早就明写「hash 随 DSH 构建变化……**一律用 `[class*="_语义名"]`**」，
  但 `npm run check` 不检查它 → 照样写出了 `.VOzbGW_overlay`。
- 更糟的是文档自己就有两套协议：`CONTRIBUTING.md` 的「发版流程」写手工
  `npm version` + `npm publish` + 手写 CHANGELOG，而 `.github/workflows/` 里装的是
  release-please 自动流程。**照文档做就撞坏 CI，照 CI 做就违反文档。**
  那些手工 `chore: release v0.6.x` commit 不是失误，是照着文档做的。
- 设置面板那条原则（「去官方提 issue」）指向一条**不存在的出路**：
  `deepseek-ai/deepseek-harness` 的 issues 是**关闭**的。规则的退路不可执行时，
  它的实际效果就是「bug 永不修 + 每次抱怨摇摆一轮」。

### 修法

把每条规则都变成 `npm run check` 里的一行断言（项目原有 3 条 → 现 5 组）：

| 规则 | 闸门 |
|---|---|
| 版本真源唯一 | `package.json` / manifest / `PLUGIN_VERSION` 三处必须一致，手工 bump 直接 fail |
| 选择器必须稳定 | 剥掉注释后扫 `src/client.ts`，任何 `<hash>_<名>` 硬编码 fail |
| 范围不得外扩 | `/bloom` 子命令 + 顶层 CSS 常量两份白名单，新增即 fail（棘轮） |

配套的三处真源收敛：

- **版本**：`release-please-config.json` 加 `extra-files` + `src/client.ts` 行尾
  `// x-release-please-version` 标记 → release-please 一次 bump 两个文件，
  `sync-version.mjs` 退化为本地 dev 兜底，不再是发布路径的一环。
- **发版协议**：`CONTRIBUTING.md`「发版流程」重写为「人只写 commit」，并列出
  四条明确的「不要做」（`npm version` / 本地 `npm publish` / 手写 release commit /
  手写 CHANGELOG 条目）。
- **layout 原则**：见下一节 —— 真正的规则不是「能不能覆盖」，而是「先证明不是
  自己造成的」。

### 教训

1. **写在文档里的规则等于没写，除非它能让 CI 变红。** 判据很简单：
   「违反这条规则，会有什么东西报错？」答不出来，这条规则就还没落地。
2. **一件事只能有一个真源。** 两套发布协议、两处版本号、两份 layout 原则，
   每一处双写都在等着发作。合并时优先删掉手工那一套 —— 自动化那套至少不会忘。
3. **规则的退路必须真实存在。** 「去上游提 issue」在 issues 关闭的仓库上不是原则，
   是把问题挂起。定原则前先验证那条出路通不通。

---

## 2026-08-24 · 「DSH 的 layout bug」是 Bloom 自己造的（改了三轮才发现）

### 现象

DSH 设置面板：遮罩只盖住左侧一条，面板被压成 279px，中文描述逐字竖排。
看起来像 DSH 的 drawer 布局缺陷。前后修了三轮，最后一轮写了 60 行
「drawer → 中央 modal」改造 CSS。

### 走过的弯路

三轮全都在**改造症状**，没人验证过前提：

1. v0.6.0：`flex-basis: 100%` 全链覆盖 → 竖排好了
2. v0.6.1：回滚，理由「不覆盖 DSH 原生 layout」，出路记为「去官方提 issue」
3. 工作区：又改回来，`position: fixed` + `translate(-50%,-50%)` 做居中 modal，
   还硬编码了 `.VOzbGW_overlay`

第 3 轮的注释里甚至写着「不这样做时 DSH 的 mask 会把 panel 推到屏幕外
（实测 x=-613）」—— **x=-613 就是根因留下的指纹**，但当时把它当成了 DSH 的怪癖。

### 根因

**Bloom 自己给 `_sidebarCol` 加的 `backdrop-filter` 污染了 fixed 的定位基准。**

`backdrop-filter` 会让元素成为其 `position: fixed` 后代的 **containing block**。
而 DSH 的设置面板挂在侧栏子树里：

```
_sidebarCol  ← Bloom 在这加了 backdrop-filter: blur(24px)
  └─ … ─ _footArea ─ _settingsArea
       └─ _overlay   ← position: fixed; inset: 0（本该相对视口铺满）
            ├─ _mask
            └─ _panel
```

于是那个 `fixed` 从「相对视口」变成「相对 280px 宽的侧栏」：遮罩缩成一条，
panel 被挤到 279px，detail 区 `flex: 0 1 auto` 收缩到 18px → 中文逐字竖排。

### 决定性实验

摘掉那一个属性，全部症状消失：

```js
side.style.setProperty('backdrop-filter', 'none', 'important')
// overlay.x: -1086 → 0    panel.x: -613 → 473（= (1728-800)/2，精确居中）
```

再把 Bloom 的相关规则一起禁掉，量到 **DSH 原生形态：800×800 居中 modal，
中文描述 383~398px 正常横排**。DSH 从来没有这个 bug。

### 修法

- 侧栏玻璃移到 `::before`（伪元素的 `backdrop-filter` 只作用于自己，
  不改变父元素的 containing block 资格），视觉零变化
- **删掉全部 60 行 modal 改造 CSS** —— 根因一修，原生就是居中 modal，一行都不需要

顺带踩到第二个坑：给侧栏加 `isolation: isolate` 想约束 `z-index: -1` 的伪元素，
结果它创建了 **stacking context**，overlay 的 `z-index: 1000` 被困在侧栏内部，
设置面板被主区的 composer 盖住。两个属性伤的是两件不同的事：

| 属性 | 创建什么 | 伤 fixed 的 |
|---|---|---|
| `backdrop-filter` / `filter` / `transform` / `perspective` / `contain` / `will-change` | containing block | **定位基准** |
| `isolation: isolate` | stacking context | **层叠顺序** |

最终只用 `position: relative` + `z-index: -1`。

### 教训

1. **修「宿主的 bug」之前，先摘掉自己的样式量一遍原生形态。** 一次
   `getBoundingClientRect()` 对比就能省下三轮返工和 60 行 CSS。
   这个项目注入 61 处 `!important` + 117 处 `[class*=]`，任何「DSH 的怪癖」
   都得先过一遍「是不是我们自己干的」。
2. **加玻璃/动效前先问：这个元素的子树里有 `position: fixed` 吗？** 有 → 玻璃
   走 `::before`，且别顺手加 `isolation`。判据已写进 CONTRIBUTING。
3. **注释里的异常数字要当线索追，不要当环境常识记下来。** 「实测 x=-613」被
   当作 DSH 的既定行为写进注释，实际上它是根因的指纹 —— 一句
   「-613 是哪来的」就能提前三轮结束这件事。

---

## 2026-08-18 · 移植了色板，没移植质感

### 现象

插件"换了色但还是不好看"，看不出 Bloom 的莫兰迪气质。

### 根因

原版 typora-Bloom-theme 的构成：

```
theme-src/
  base-light.css   1344 行  ← UI 质感（渐变/阴影/圆角/间距/装饰线）
  base-dark.css    1624 行
  root-mist.css      89 行  ← 只是色板
```

移植时只搬了 `root-*.css` 的色值，2968 行的质感层一行没进来。
插件原本的 `COMPONENT_CSS` 只有 10 行（两个 border-radius + 一个 ::selection）。

对比原版的密度：14 处 gradient / 20 处 box-shadow / 35 处 border-radius，插件是 0 / 2 / 0。

**更致命的是搬错了半边色。** 每个变体有双轨：

| | mist | cinnabar | petal | ripple |
|---|---|---|---|---|
| `--accent`（搬了这个） | `#34698c` | `#c53637` | `#e63f9f` 荧光洋红 | `#009c9c` |
| `--accent-rgb`（漏了这个） | `#92a8b3` | `#d74b4b` | `#e8859b` 藕粉 | `#5fa8b2` |

`root-mist.css:16` 原作者注释：`Morandi Mist (Blue) - Deepened for better contrast`。
`--accent` 是为过对比度**加深过**的版本，本来就不是给人看气质的；真正的莫兰迪色在
`--accent-rgb`，专供 `rgba(morandi, 0.05~0.2)` 的大面积氛围渐变。

### 修法

1. `PALETTE` 改为双轨结构，每变体增加 `morandi` 字段
2. 新增 `bloomTokens()` 生成 `--bloom-*` 自有 token，作为质感层的唯一色源(SSOT)
3. 重写 `COMPONENT_CSS`：氛围渐变 + 冷光线条 + 纸感 + markdown 排版

---

## 2026-08-18 · DSH 启动白屏：invalid plugin

### 现象

```
Failed to load plugins
failed to apply loader entry 0f5aac91 (@webkubor/dsh-bloom-theme):
invalid plugin, expect function or object with an "apply" method, received object
```

整个 DSH 停在错误页，只有 CSS 注入生效（能看到切换器），界面不渲染。

### 走过的弯路

连续 4 次提交都在改 `lib/index.js` 的 ESM 导出格式：

```
cb561b3 fix(index): default export = apply function (not {apply} object)
948c9e6 fix(index): default export {apply} so dsh ESM import sees object.apply
ead2db3 refactor(index): revert to named export per dsh-client-ui-trajectory convention
1ee17e6 fix(package): add "type": "module"
```

全都没修好，因为**方向就是错的**。

实测证明 index.js 没问题 —— 它和能正常加载的 `@oil-oil/dsh-vision` 模块形态完全一致：

```
typeof module: object   keys: ['apply']   typeof .apply: function   proto: null
```

### 根因

报错发生在**浏览器端**，不是 node 端。`lib/client.js` 的 factory 返回了裸 `{}`：

```js
window.__ModuleLoader__.load({
  id: PLUGIN_ID,
  factory: (require) => { /* ... */ return {} },   // ← "received object"
})
```

DSH 会把 factory 的返回值当 cordis 插件 apply，要求是「函数」或「带 apply 方法的对象」。

### 修法

参照 `@oil-oil/dsh-vision/lib/client.js` 末尾的写法：

```js
factory: () => {
  const exports = {}
  Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
  exports.apply = function apply() { /* 注入逻辑 */ }
  return exports
}
```

### 教训

报错信息里的 "loader entry" 指的是 **client loader**。定位这类问题应该先问「这个错误在哪一端抛出」，
而不是凭 "apply" 这个词去猜 node 侧的导出格式。找一个**能正常工作的同类插件**对照，比反复试错快得多。

---

## 2026-08-18 · 前景色 token 当背景用（同一反模式犯了两次）

### 第一次：`--dsw-alias-markdown-inline-code`

**现象**：暗色主题下，正文里的内联代码是一块刺眼的浅灰底。

**实测**：

```
background: oklch(0.88 0.02 240)   ← 按「文字色」给的值
color:      oklch(0.96 0.01 195)   ← 实际文字色
对比度 ≈ 1.2:1
```

**根因**：DSH 把这个变量 set 到 `code` 元素的 `background`，它是**背景色**。
代码里按文字色给值（亮色 L30% 深色 / 暗色 L88% 浅色）→ 亮色深底深字、暗色浅底白字，两边都坏。

**修法**：改为 `var(--bloom-code-bg)`（莫兰迪淡底），并且 `mistLight` / `mistDark` / `variantBlock`
**三处都要改** —— 第一次只改了前两处，导致 ripple/petal 继承 mist 的蓝灰 hue。

### 第二次：`--bloom-shadow-*`（自己新写的代码里又犯一遍）

**现象**：切换器下方凭空多出一团白雾。

**根因**：新增 `bloomTokens()` 时，阴影写成 `color-mix(前景色, transparent)`：

```js
--bloom-shadow: 0 10px 30px ${mix(tx, dark ? 82 : 94)}   // ❌
```

亮色下 `tx` 是深色，阴影正常；暗色下 `tx` 是近白 → 「阴影」变成白雾贴在深色背景上。

**修法**：查原版 `root-mist-dark.css:52-54`，它是写死纯黑的：

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
--shadow:    0 10px 30px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.6);
```

只有亮色才用 `color-mix(text)`。

### 教训

这条反模式在项目全局规则里已经记过一次，仍然复发 —— 而且是在**修完第一处之后、写新代码时立刻又犯**。
判据很简单：**任何随明暗翻转的 token，问一句「它在暗色下是什么亮度」**。
前景色在暗色下是近白，凡是拿它当背景 / 阴影 / 遮罩的，暗色下必然翻车。

---

## 2026-08-18 · CSS Modules 选择器过度命中

### 现象

1. 切换器下方多出一个浅色圆角矩形
2. 消息流里 30+ 个卡片都被套上了长距阴影

### 根因

DSH 类名是 `<hash>_<语义名>`（如 `wSkVaW_root`），只能用 `[class*="_语义名"]` 匹配，但写得太宽：

| 选择器 | 实际命中 |
|---|---|
| `[class*="_card"]` | 33 个（32 个 `CY-8Ka_card` 消息卡 + 1 个 `uV2eYG_card` 输入框） |
| `[class*="_header"]` | `wSkVaW_header` + `headerActions` + `headerUtilities` + … |
| `[class*="_panel"]` | 命中了 SVG 元素（`className` 不是 string） |

### 修法

- 限定 `div` 前缀，避开 SVG
- 输入框用 `div[class*="_composer"] div[class*="_card"]` 加上下文
- 顶栏分隔线只给 `div[class*="_tabs"]`，不用 `_header`

### 教训

写 `[class*=]` 之后立刻在浏览器里数一遍命中量：

```js
[...document.querySelectorAll('[class*="_card"]')].map(e => e.className)
```

不数就等于没写。

---

## 2026-08-18 · 亮色主色对比度不足

### 现象

petal / ripple 的亮色主按钮白字读不清。

### 实测（oklch → sRGB → WCAG）

```
petal   #e63f9f on #fef6f9 = 3.55:1  ❌
ripple  #009c9c on #ebf4f4 = 3.02:1  ❌
```

`--dsw-alias-button-primary-fill: accent` + `label-primary-foreground: bg(近白)`。

### 修法

反推达到 4.5:1 所需的 L 值，压暗亮色 accent：

- petal `oklch(64%)` → `oklch(58%)` = 4.55:1
- ripple `oklch(62%)` → `oklch(51%)` = 4.61:1

压暗后反而更贴莫兰迪（原作者对 mist 做的正是同一件事）。8 个组合现已全部达 AA。

### 教训

配色不能靠眼睛判断达不达标，`oklch` 的 L 值也不等于 WCAG 相对亮度。写个 20 行脚本实算，
顺便反推出「要达标 L 得压到多少」，比反复试色高效得多。

---

## 其他修掉的小问题

| 问题 | 位置 | 修法 |
|---|---|---|
| 毛玻璃失效：背景只透 6%，`blur(10px)` 无糊可糊 | `SWITCHER_CSS` | 透明度提到 28% |
| 键盘焦点不可见：写了 `outline:none` 且无替代 | `SWITCHER_CSS` | 加 `:focus-visible` 描边 |
| 读屏读不出选中项：仅用 `data-active` 表状态 | `buildSwitcherHTML` | 加 `role="radiogroup"` + `aria-checked` |
| 暗色文字层级塌陷：secondary/caption/dimmed = 35/30/35，caption 比 secondary 还亮 | `mistDark` / `variantBlock` | 改为 35/48/58，单调递减 |
| 色块渐变褪成白色，辨识度只剩左上一半 | `buildSwitcherHTML` | 渐变改为 `morandi → accent`，两端都有色 |
| 无 `prefers-reduced-motion` | `COMPONENT_CSS` | 补 media query |
