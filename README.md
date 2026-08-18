# @webkubor/dsh-bloom-theme

DeepSeek Harness (DSH) 皮肤插件 —— 把 [typora-Bloom-theme](https://github.com/webkubor/typora-Bloom-theme) 的莫兰迪质感移植到 DSH。

4 个变体（雾蓝 / 朱砂 / 花瓣 / 涟漪）× 明暗双主题，顶栏色块一键切换。

## 安装

```bash
dsh plugin --profile web add github:webkubor/dsh-bloom-theme
```

然后在 `~/.dsh/profiles/web/cordis.patch.yml` 里 insert：

```yaml
- insert:
    - id: bloom-theme
      name: '@webkubor/dsh-bloom-theme'
```

重启 DSH，右上角出现 4 个色块即生效。选择记在 `localStorage`（key: `dsh-bloom-variant`）。

## 变体

| 变体 | 中文 | 气质轨 (morandi) | 可读轨 (accent 亮/暗) |
|---|---|---|---|
| `mist` | 雾蓝 | `#92a8b3` | `oklch(50%)` / `oklch(72%)` |
| `cinnabar` | 朱砂 | `#d74b4b` | `oklch(55%)` / `oklch(72%)` |
| `petal` | 花瓣 | `#e8859b` | `oklch(58%)` / `oklch(75%)` |
| `ripple` | 涟漪 | `#5fa8b2` | `oklch(51%)` / `oklch(75%)` |

全部 8 个「主色 + 底色」组合经实测达到 WCAG AA (≥4.5:1)。

---

## 设计原理：双轨色（最重要的一条）

**莫兰迪的气质不在 `--accent`，在 `--accent-rgb`。**

原版 typora 主题每个变体有两套色，`root-mist.css` 的注释写得很直白：

```css
/* --- Morandi Mist (Blue) - Deepened for better contrast --- */
--accent: oklch(50% 0.08 240);   /* 可读轨：被刻意加深过，为过对比度 */
--accent-rgb: 146, 168, 179;     /* 气质轨：真正的莫兰迪色，发灰、低饱和 */
```

两轨分工不能混：

- **可读轨 `accent`** → 文字、按钮填充、边框描边。它是加深版，直接拿来铺大面积会显得艳、脏。
- **气质轨 `morandi`** → 只用于 `rgba(morandi, 0.05~0.2)` 的大面积氛围渐变与冷光。原版 14 处 gradient 全部用它，**从不用 accent 铺面**。

移植时若只搬 `--accent`（一个常见的想当然），petal 会从藕粉变成荧光洋红 —— 色是对的，莫兰迪感没了。

本插件的 `PALETTE` 每个变体同时保留两轨，`bloomTokens()` 把它们注入为 `--bloom-*` 变量，供质感层统一引用。

## 架构

```
lib/index.js    node 半侧（cordis plugin），空实现 —— 本插件是纯客户端主题
lib/client.js   浏览器半侧，全部逻辑在这
  ├─ PALETTE          4 变体 × 双轨色板
  ├─ bloomTokens()    → --bloom-* 自有 token（SSOT，质感层的唯一色源）
  ├─ mistLight/Dark() → mist 完整接管 DSH 的 alias + specific 变量体系
  ├─ variantBlock()   → 其余 3 变体只覆盖主色/背景调，灰阶骨架继承 mist
  ├─ COMPONENT_CSS    → 质感层：氛围渐变 / 冷光线条 / 纸感 / markdown 排版
  └─ SWITCHER_CSS     → 顶栏切换器
```

**为什么质感层是重点**：原版 `root-*.css`（色板）只有 89 行，`base-light/dark.css`（质感）有 2968 行。
只搬色板得到的是「换了色的原界面」，不是 Bloom。质感层做的事：

| 手法 | 实现 |
|---|---|
| 氛围渐变 | body 四层莫兰迪光晕叠加，`background-attachment: fixed` |
| 冷光线条 | `--bloom-hairline` / `--bloom-glow`，用于侧栏竖线、卡片描边、tabs 下沿 |
| 纸感 | 长距柔影三档 + 顶部内高光 `inset 0 1px 0` |
| Markdown | 标题渐变短横、hr 两端消隐、引用块左侧主色条、代码块冷光描边 |

## 开发

```bash
npm run dev      # 监听 lib/ 自动部署到 web profile，按 r 刷新浏览器
npm run deploy   # 手动部署一次
```

改完必须刷新页面 —— 皮肤是浏览器端注入的。

---

## ⚠️ 踩坑清单

犯过的错都记在这，改代码前先读一遍。详细复盘见 [DEV_NOTES.md](./DEV_NOTES.md)。

### 1. client factory 必须返回带 `apply` 的对象

```js
// ❌ 整个 DSH 启动失败，白屏报 invalid plugin
factory: () => ({})

// ✅
factory: () => { const e = {}; e.apply = () => {...}; return e }
```

报错 `invalid plugin, expect function or object with an "apply" method, received object`
出现在**浏览器端**，跟 `lib/index.js` 的 ESM 导出格式无关 —— 别去改 index.js 的 export。

### 2. 前景色 token 不能当背景用

DSH 的 `--dsw-alias-markdown-inline-code` 是**背景色**，不是文字色。
按文字色给值 → 暗色下浅底白字（实测 1.2:1）、亮色下深底深字，两边都坏。

同理，**暗色阴影必须用纯黑** `rgba(0,0,0,.4~.6)`，不能用 `color-mix(前景色)` ——
暗色的前景色是近白，混出来的「阴影」是一团白雾。

### 3. 选择器脆弱性

DSH 用 CSS Modules，类名形如 `wSkVaW_root`（`<hash>_<语义名>`）。hash 随 DSH 构建变，语义名稳定，
所以一律用 `[class*="_语义名"]` 后缀匹配，并且：

- **限定 `div`** —— 裸 `[class*="_panel"]` 会命中 SVG 元素
- **注意命中量** —— 裸 `[class*="_card"]` 会命中 30+ 个消息卡；输入框要写
  `div[class*="_composer"] div[class*="_card"]`
- `_header` 会同时命中 `headerActions` / `headerUtilities` 等子容器

失配时效果只会退回纯色，属安全降级，不会错位或不可用。

### 4. 改一处要 grep 全文件

同一反模式往往犯不止一次。修 `markdown-inline-code` 时，`variantBlock()` 里还漏了一份
（导致 ripple/petal 继承 mist 的蓝灰 hue）。改任何 token 前先 grep 确认覆盖了
`mistLight` / `mistDark` / `variantBlock` 三处。

## 已知未验证项

- `--dsw-alias-toast-bg` / `tooltip-bg` 暂未逐变体覆盖，所有变体沿用 mist 的蓝灰 hue。
  暗色下取值 `oklch(40%)` 与 `bgD oklch(28%)` 差距偏小，若 DSH 的 toast 文字用
  `label-primary-inverted` 可能对比度不足 —— 尚未在真实 toast 上验证。

## License

MIT
