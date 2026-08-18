# 开发复盘

按时间倒序记录每个坑的**现象 → 根因 → 修法**，避免重复踩。

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
