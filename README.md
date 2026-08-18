<h1 align="center">Bloom for DSH</h1>

<p align="center">
  <img src="https://img.shields.io/npm/v/@webkubor/dsh-bloom-theme?style=flat-square&color=A873C4" alt="npm" />
  <img src="https://img.shields.io/github/license/webkubor/dsh-bloom-theme?style=flat-square&color=92a8b3" alt="License" />
  <img src="https://img.shields.io/github/stars/webkubor/dsh-bloom-theme?style=flat-square&color=cc584d" alt="Stars" />
  <img src="https://img.shields.io/badge/DSH-Plugin-5fa8b2?style=flat-square" alt="DSH" />
  <img src="https://img.shields.io/badge/WCAG-AA-6a9955?style=flat-square" alt="WCAG AA" />
</p>

<p align="center">
  把 <a href="https://github.com/webkubor/typora-Bloom-theme">Bloom</a> 的莫兰迪质感搬进 DeepSeek Harness。
  <br />
  4 套配色，明暗双主题，顶栏一键切换。
</p>

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/petal-dark.png" alt="Bloom for DSH · petal 花瓣" width="880" />
</p>

## Bloom 是什么

Bloom 原是一套 Typora 主题，核心不在「换个颜色」，而在一整套**莫兰迪质感语言**：
低饱和的氛围渐变、冷调的发光细线、长距柔和的投影、克制的圆角与间距。

这个插件把那套语言完整移植到 DSH——包括它最容易被忽略的一半：

> 莫兰迪的气质不在 `--accent`，在 `--accent-rgb`。

详见 [双轨色](#设计原理双轨色)。

## 为什么用 Bloom

| 特性 | 说明 |
| :-- | :-- |
| 双轨配色 | 可读轨保对比度，气质轨专供氛围渐变，两轨分工不混用 |
| 质感层完整 | 氛围渐变、冷光线条、纸感投影、Markdown 排版装饰，而非仅替换色值 |
| OKLCH 调色 | 感知均匀的色彩空间，明暗切换不跳变 |
| WCAG AA | 8 个「主色 + 底色」组合全部实测 ≥ 4.5:1 |
| 零依赖 | 纯客户端注入，不引入任何运行时依赖 |
| 不抢占原生控件 | 切换器挂进 DSH 顶栏工具区，与原生按钮并排共存 |

## 主题一览

4 套配色，每套都有浅色与深色两个版本。

<table>
  <tr>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/mist-dark.png" alt="mist 雾蓝" />
      <sub><code>mist</code> 雾蓝 · 沉静的蓝灰</sub>
    </td>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/cinnabar-dark.png" alt="cinnabar 朱砂" />
      <sub><code>cinnabar</code> 朱砂 · 温暖的陶土红</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/petal-dark.png" alt="petal 花瓣" />
      <sub><code>petal</code> 花瓣 · 柔和的藕粉</sub>
    </td>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/ripple-dark.png" alt="ripple 涟漪" />
      <sub><code>ripple</code> 涟漪 · 清冽的雾青</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/mist-light.png" alt="mist 雾蓝 浅色" />
      <sub><code>mist</code> 浅色</sub>
    </td>
    <td align="center" width="50%">
      <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/petal-light.png" alt="petal 花瓣 浅色" />
      <sub><code>petal</code> 浅色</sub>
    </td>
  </tr>
</table>

顶栏下拉一键切换，选择记在 `localStorage`：

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/webkubor/picx-images-hosting@master/projects/dsh-bloom-theme/switcher-menu.png" alt="主题切换器" width="760" />
</p>

## 快速安装

```bash
dsh plugin --profile web add @webkubor/dsh-bloom-theme
```

然后在 `~/.dsh/profiles/web/cordis.patch.yml` 里 insert：

```yaml
- insert:
    - id: bloom-theme
      name: '@webkubor/dsh-bloom-theme'
```

重启 DSH，顶栏出现主题下拉即生效。

> **DSH 没有插件市场。** `dsh plugin` 只是把参数转发给 profile 目录里的 pnpm
> （官方帮助原文：*manage a profile's plugins by forwarding the remaining arguments to pnpm*），
> 设置里的 Plugin Inventory 也只列已安装插件。所以插件的分发渠道就是 npm registry。
> 也可以直接从源码装：`dsh plugin --profile web add github:webkubor/dsh-bloom-theme`

## 设计原理：双轨色

原版 Bloom 每个变体都有两套色，`root-mist.css` 的注释写得很直白：

```css
/* --- Morandi Mist (Blue) - Deepened for better contrast --- */
--accent: oklch(50% 0.08 240);   /* 可读轨：被刻意加深过，为过对比度 */
--accent-rgb: 146, 168, 179;     /* 气质轨：真正的莫兰迪色，发灰、低饱和 */
```

两轨分工不能混：

- **可读轨** → 文字、按钮填充、边框描边。它是加深版，直接拿来铺大面积会显得艳、脏。
- **气质轨** → 只用于 `rgba(morandi, 0.05~0.2)` 的大面积氛围渐变与冷光。原版 14 处
  gradient 全部用它，**从不用可读轨铺面**。

移植时若只搬 `--accent`（一个很自然的想当然），`petal` 会从藕粉 `#e8859b` 变成
荧光洋红 `#e63f9f`——色是对的，莫兰迪感没了。

| 变体 | 气质轨 | 可读轨（浅 / 深） | 浅色对比度 |
| :-- | :-- | :-- | :-- |
| `mist` | `#92a8b3` | `oklch(50%)` / `oklch(72%)` | 5.28:1 |
| `cinnabar` | `#d74b4b` | `oklch(55%)` / `oklch(72%)` | 4.87:1 |
| `petal` | `#e8859b` | `oklch(58%)` / `oklch(75%)` | 4.55:1 |
| `ripple` | `#5fa8b2` | `oklch(51%)` / `oklch(75%)` | 4.61:1 |

浅色可读轨的 L 值按 WCAG AA 反推校准过——压暗之后反而更贴莫兰迪，
这正是原作者对 `mist` 做过的事。

## 质感层

只搬色板得到的是「换了色的原界面」。原版 `root-*.css`（色板）89 行，
`base-light/dark.css`（质感）2968 行——差距全在这里。

| 手法 | 实现 |
| :-- | :-- |
| 氛围渐变 | body 四层莫兰迪光晕叠加，`background-attachment: fixed` |
| 冷光线条 | 侧栏竖线、卡片描边、tabs 下沿、顶部内高光 |
| 纸感 | 长距柔影三档 + `inset 0 1px 0` 内高光 |
| Markdown | 标题渐变短横、hr 两端消隐、引用块主色条、代码块冷光描边 |
| 侧栏 | 顶部氛围淡染、会话项冷光态、选中态主色标记 |

## 架构

```
lib/index.js    node 半侧（cordis plugin），空实现 —— 本插件是纯客户端主题
lib/client.js   浏览器半侧，全部逻辑在这
  ├─ PALETTE          4 变体 × 双轨色板
  ├─ bloomTokens()    → --bloom-* 自有 token（质感层的唯一色源 / SSOT）
  ├─ mistLight/Dark() → mist 完整接管 DSH 的 alias + specific 变量体系
  ├─ variantBlock()   → 其余 3 变体只覆盖主色与背景调，灰阶骨架继承 mist
  ├─ COMPONENT_CSS    → 质感层（一份 CSS，4 变体 × 明暗自动适配）
  └─ SWITCHER_CSS     → 顶栏下拉切换器
```

## 开发

```bash
npm run dev      # 监听 lib/ 自动部署到 web profile，保存即刷新浏览器
npm run deploy   # 手动部署一次
```

皮肤在浏览器端注入，且 CSS 由 `client.js` 运行时生成——没有「只热更 CSS」这条路，
必须重新执行脚本，也就必须刷新页面。`npm run dev` 已代劳（按 `a` 可切换，
或设 `DSH_BLOOM_NO_AUTORELOAD=1` 关闭）。

## 踩过的坑

完整复盘见 **[DEV_NOTES.md](./DEV_NOTES.md)**，含每个坑的现象 → 根因 → 修法 → 教训。
几条最值得先读的：

- **client factory 必须返回带 `apply` 的对象**，返回裸 `{}` 会让整个 DSH 启动白屏。
  该报错出现在浏览器端，与 `lib/index.js` 的 ESM 导出格式无关。
- **前景色 token 不能当背景/阴影用**。暗色的前景是近白，拿它 `color-mix` 出的
  「阴影」会是一团白雾；`markdown-inline-code` 按文字色给值会得到 1.2:1 的浅底白字。
- **DSH 用 CSS Modules**，类名形如 `wSkVaW_root`。只能用 `[class*="_语义名"]` 匹配，
  且必须限定 `div`（否则命中 SVG）、必须数命中量（裸 `_card` 会命中 30+ 个消息卡）。
- **描边只能给有实色背景的那一层**，加在内层透明元素上会形成「框中框」。

## License

[MIT](./LICENSE)

## Author

[@webkubor](https://github.com/webkubor) · 同系列：[Bloom for Typora](https://github.com/webkubor/typora-Bloom-theme)
