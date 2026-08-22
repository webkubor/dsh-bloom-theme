/**
 * dsh-bloom-theme —— 浏览器半侧。
 *
 * 功能：
 *   1. 注入 Bloom 4 主题色 CSS（mist / cinnabar / petal / ripple），通过
 *      body[data-bloom-variant="..."] 切换；默认 mist。
 *   2. 注入顶栏切换器（4 个圆形色块按钮），点击切换 variant 并写 localStorage
 *      （DSH 第三方主题选择是进程内扩展，README 明确：远程浏览器无持久化，
 *       loopback 用 localStorage 是官方姿态）。
 *
 * 配色映射（来自 typora-Bloom-theme root-*.css，oklch）：
 *   mist    (240 蓝灰)   accent 50%0.08 → 暗 72%0.12
 *   cinnabar( 25 朱砂)   accent 55%0.18 → 暗 72%0.12
 *   petal   (350 花瓣)   accent 64%0.22 → 暗 75%0.18
 *   ripple  (195 涟漪)   accent 62%0.12 → 暗 75%0.12
 *
 * 设计：mist 完整覆盖（alias 主色 + 灰阶 + 状态 + markdown + specific 组件）;
 *       其它 3 变体覆盖 accent + bg/text/surface + specific 组件（继承 mist 的
 *       灰阶骨架，主色和背景调性变，布局/字号/间距不动）——保持视觉一致性 +
 *       一目了然的主色差异。
 *
 * 变量体系（来自 dsh-client-ui-theme/lib/styles/design-platform.css）：
 *   --dsw-alias-*    语义别名（文字/背景/边框/按钮/状态/markdown/滚动条）
 *   --dsw-specific-* 具体组件（消息气泡/侧栏/输入区/菜单/选择器/tip）
 *   必须两层都接管，否则气泡、侧栏、输入区会回落到 DSH 默认的蓝灰调，
 *   跟 Bloom 色板打架——这正是「换了色还是丑」的根源。
 */

const VARIANTS = ['mist', 'cinnabar', 'petal', 'ripple']
const OTHER_VARIANTS = ['cinnabar', 'petal', 'ripple']
const STORAGE_KEY = 'dsh-bloom-variant'
const AMB_KEY = 'dsh-bloom-ambience'
const PLUGIN_ID = '@kubor/dsh-bloom-theme'

/**
 * 配套壁纸（v0.4.0 氛围层）—— 与四套变体同色系的莫兰迪渐变，16:9。
 * 预设走自托管图床（插件包本体保持轻量、零依赖）；自定义 URL / data: URL
 * 也支持，想完全离线的用户可以填 data: URL 或本机可访问的地址。
 * 原图随仓库分发在 assets/wallpapers/，可自行替换图床。
 */
const WALLPAPERS = {
  mist:     'https://img.webkubor.online/refs/45d47835-cde2-4022-bd4d-5bc729ff8f1f/db267e7f-ba1.jpg',
  cinnabar: 'https://img.webkubor.online/refs/45d47835-cde2-4022-bd4d-5bc729ff8f1f/e17ab8f4-4a4.jpg',
  petal:    'https://img.webkubor.online/refs/45d47835-cde2-4022-bd4d-5bc729ff8f1f/4ac41910-537.jpg',
  ripple:   'https://img.webkubor.online/refs/45d47835-cde2-4022-bd4d-5bc729ff8f1f/1bf5ef4f-d38.jpg',
}

/** 氛围层默认配置：全部关闭 —— Bloom 的默认审美是克制的，氛围层是可选项。 */
const AMB_DEFAULTS = {
  enabled: false,     // 壁纸总开关
  mode: 'auto',       // auto=随变体 | fixed=固定某套 | custom=自定义 URL
  fixed: 'mist',
  custom: '',
  dim: 30,            // 压暗 %，保证正文可读（对比度护栏的一部分）
  glass: true,        // 磨砂玻璃面板
  blur: 16,           // 玻璃模糊强度 px
}

/**
 * Bloom 色板 —— 双轨制（这是从 typora-Bloom-theme 继承来的关键设计，别退回单轨）。
 *
 *   accentL/accentD  「可读轨」：文字、按钮填充、边框。原版注释写得很清楚：
 *                     `Morandi Mist (Blue) - Deepened for better contrast`
 *                     ——它是被刻意加深过的版本，为的是过 WCAG，不是给人看气质的。
 *   morandi          「气质轨」：原版的 --accent-rgb。真正的莫兰迪色（低饱和、发灰），
 *                     只用于大面积氛围渐变，rgba(morandi, 0.05~0.08) 这种极低透明度。
 *
 * 原版 14 处 gradient 全部用气质轨，从不用可读轨铺面。
 * 一旦把 accent 拿去刷大面积，petal 就会从藕粉变成荧光洋红 —— 莫兰迪感就没了。
 *
 * 亮色 accent 的 L 值已按 WCAG AA(4.5:1) 反推校准（底色为各变体的 bgL）：
 *   mist 50%(5.28:1) / cinnabar 55%(4.87:1) 原值达标，保持
 *   petal 64%→58% (3.55:1 → 达标)   ripple 62%→51% (3.02:1 → 达标)
 */
const PALETTE = {
  mist: {
    accentL: 'oklch(50% 0.08 240)',  accentD: 'oklch(72% 0.12 240)',
    morandi: '146, 168, 179',
    bgL: 'oklch(96% 0.01 240)',      bgD: 'oklch(28% 0.02 240)',
    txL: 'oklch(25% 0.02 240)',      txD: 'oklch(96% 0.01 240)',
    sfL: 'oklch(94% 0.01 240)',      sfD: 'oklch(34% 0.02 240)',
    sf2L: 'oklch(91% 0.01 240)',     sf2D: 'oklch(40% 0.02 240)',
  },
  cinnabar: {
    accentL: 'oklch(55% 0.18 25)',   accentD: 'oklch(72% 0.12 25)',
    morandi: '215, 75, 75',
    bgL: 'oklch(97% 0.005 25)',      bgD: 'oklch(28% 0.02 25)',
    txL: 'oklch(25% 0.02 25)',       txD: 'oklch(96% 0.01 25)',
    sfL: 'oklch(95% 0.005 25)',      sfD: 'oklch(34% 0.02 25)',
    sf2L: 'oklch(92% 0.005 25)',     sf2D: 'oklch(40% 0.02 25)',
  },
  petal: {
    accentL: 'oklch(58% 0.22 350)',  accentD: 'oklch(75% 0.18 350)',
    morandi: '232, 133, 155',
    bgL: 'oklch(98% 0.01 350)',      bgD: 'oklch(28% 0.02 350)',
    txL: 'oklch(25% 0.02 354)',      txD: 'oklch(98% 0.01 350)',
    sfL: 'oklch(96% 0.015 350)',     sfD: 'oklch(34% 0.02 350)',
    sf2L: 'oklch(94% 0.015 350)',    sf2D: 'oklch(40% 0.02 350)',
  },
  ripple: {
    accentL: 'oklch(51% 0.12 195)',  accentD: 'oklch(75% 0.12 195)',
    morandi: '95, 168, 178',
    bgL: 'oklch(96% 0.01 195)',      bgD: 'oklch(20% 0.02 195)',
    txL: 'oklch(25% 0.02 195)',      txD: 'oklch(96% 0.01 195)',
    sfL: 'oklch(94% 0.01 195)',      sfD: 'oklch(28% 0.02 195)',
    sf2L: 'oklch(92% 0.01 195)',     sf2D: 'oklch(38% 0.02 195)',
  },
}

const VARIANT_LABELS = {
  mist:     { zh: '雾蓝', en: 'Mist' },
  cinnabar: { zh: '朱砂', en: 'Cinnabar' },
  petal:    { zh: '花瓣', en: 'Petal' },
  ripple:   { zh: '涟漪', en: 'Ripple' },
}

/** oklch 混透明度的简写（在 oklch 空间里混合，色相/彩度不漂移） */
const mix = (c, p) => `color-mix(in oklch, ${c}, transparent ${p}%)`

/**
 * Bloom 自有 token —— 三个变体块共用，是所有「质感」CSS 的唯一色源(SSOT)。
 * 有了这层，COMPONENT_CSS 只需写一份、全部引用 var(--bloom-*)，
 * 不必为 4 个变体 × 明暗各抄一遍。
 *
 * --bloom-morandi   气质轨 RGB 三元组，供 rgba() 做低透明度氛围渐变与冷光
 * --bloom-shadow-*  长距柔和阴影三档（原版 typora 的 --shadow-sm/md/lg）
 * --bloom-hairline  冷光细线：极低透明度的莫兰迪色，用于分割线/描边
 * --bloom-glow      冷光辉：描边外侧的微弱扩散，深色下尤其出高级感
 */
function bloomTokens(p, dark) {
  const tx = dark ? p.txD : p.txL
  const m = p.morandi
  return `
  --bloom-morandi: ${m};
  --bloom-accent: ${dark ? p.accentD : p.accentL};
  /* ⚠️ 阴影在暗色下必须用纯黑，不能用前景色混透明度 ——
     暗色的 --text 是近白，mix 出来的"阴影"会变成一团白雾贴在深色背景上。
     原版 root-*-dark.css 同样是写死 rgba(0,0,0,.4~.6)，只有亮色才用 text 混。 */
  --bloom-shadow-sm: 0 2px 8px ${dark ? 'rgba(0,0,0,0.4)' : mix(tx, 96)};
  --bloom-shadow: 0 10px 30px ${dark ? 'rgba(0,0,0,0.5)' : mix(tx, 94)};
  --bloom-shadow-lg: 0 24px 60px ${dark ? 'rgba(0,0,0,0.6)' : mix(tx, 90)};
  --bloom-hairline: rgba(${m}, ${dark ? 0.3 : 0.3});
  --bloom-hairline-strong: rgba(${m}, ${dark ? 0.55 : 0.5});
  --bloom-glow: rgba(${m}, ${dark ? 0.34 : 0.2});
  --bloom-veil-1: rgba(${m}, ${dark ? 0.2 : 0.13});
  --bloom-veil-2: rgba(${m}, ${dark ? 0.13 : 0.08});
  --bloom-code-bg: rgba(${m}, ${dark ? 0.16 : 0.13});
  --bloom-code-fg: ${dark ? p.txD : p.txL};`
}

/**
 * mist 亮色：完整接管 alias 语义 + specific 组件。
 * 这是骨架 —— 其它变体只覆盖「主色 + 背景调」相关的行。
 */
function mistLight(p) {
  const { accentL: aL, bgL, txL, sfL, sf2L } = p
  return `
/* ─── Bloom · mist 雾蓝 亮色（默认 + body[data-bloom-variant=mist]）─────────── */
body, body[data-bloom-variant="mist"] {${bloomTokens(p, false)}
  --dsw-alias-bg-base: ${bgL};
  --dsw-alias-bg-layer-1: ${bgL};
  --dsw-alias-bg-layer-2: ${sfL};
  --dsw-alias-bg-layer-3: ${sf2L};
  --dsw-alias-bg-overlay: ${sfL};
  --dsw-alias-bg-module-platform: ${sfL};
  --dsw-alias-bg-multi-select: ${sf2L};
  --dsw-alias-bg-skeleton: ${mix(txL, 96)};
  --dsw-alias-bg-mask-1: ${mix(txL, 97)};
  --dsw-alias-bg-mask-2: ${mix(txL, 95)};
  --dsw-alias-bg-mask-3: ${mix(txL, 93)};
  --dsw-alias-bg-mask-drop: ${mix(txL, 88)};
  --dsw-alias-bg-mask-photo: oklch(45% 0.02 240);
  --dsw-alias-label-primary: ${txL};
  --dsw-alias-label-primary-bluish: ${txL};
  --dsw-alias-label-primary-dimmed: ${mix(txL, 25)};
  --dsw-alias-label-primary-foreground: ${bgL};
  --dsw-alias-label-primary-inverted: ${bgL};
  --dsw-alias-label-secondary: ${mix(txL, 35)};
  --dsw-alias-label-tertiary: ${mix(txL, 45)};
  --dsw-alias-label-caption: ${mix(txL, 40)};
  --dsw-alias-label-dimmed: ${mix(txL, 55)};
  --dsw-alias-brand-primary: ${aL};
  --dsw-alias-brand-primary-invert: ${bgL};
  --dsw-alias-brand-text: ${bgL};
  --dsw-alias-border-l1: ${mix(txL, 90)};
  --dsw-alias-border-l2: ${mix(txL, 80)};
  --dsw-alias-border-l3: ${mix(txL, 70)};
  --dsw-alias-border-l4: ${mix(txL, 60)};
  --dsw-alias-border-inverted: ${mix(bgL, 85)};
  --dsw-alias-border-inverted2: ${mix(bgL, 70)};
  --dsw-alias-button-primary-fill: ${aL};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aL}, black 8%);
  --dsw-alias-button-primary-dimmed: ${mix(aL, 85)};
  --dsw-alias-button-tool-bar-fill: ${sfL};
  --dsw-alias-button-tool-bar-fill-invisible: transparent;
  --dsw-alias-button-tool-bar-hover: ${mix(txL, 95)};
  --dsw-alias-button-floating-fill: ${sfL};
  --dsw-alias-button-floating-hover: ${sf2L};
  --dsw-alias-button-elevated-fill: ${bgL};
  --dsw-alias-button-contrast-fill: ${txL};
  --dsw-alias-button-info-fill: ${mix(aL, 90)};
  --dsw-alias-button-info-hover: ${mix(aL, 84)};
  --dsw-alias-button-ghost-active-fill: ${mix(aL, 92)};
  --dsw-alias-button-ghost-active-hover: ${mix(aL, 88)};
  --dsw-alias-button-ghost-active-border: ${mix(aL, 78)};
  --dsw-alias-interactive-bg-hover: ${mix(aL, 92)};
  --dsw-alias-interactive-bg-hover-accent: ${mix(aL, 85)};
  --dsw-alias-interactive-bg-hover-danger: color-mix(in oklch, oklch(60% 0.12 25), transparent 90%);
  --dsw-alias-interactive-bg-hover-solid: ${mix(aL, 88)};
  --dsw-alias-interactive-bg-active: ${mix(aL, 88)};
  --dsw-alias-state-success-primary: oklch(70% 0.1 150);
  --dsw-alias-state-success-secondary: color-mix(in oklch, oklch(70% 0.1 150), transparent 88%);
  --dsw-alias-state-success-tertiary: color-mix(in oklch, oklch(70% 0.1 150), transparent 94%);
  --dsw-alias-state-error-primary: oklch(60% 0.12 25);
  --dsw-alias-state-error-secondary: color-mix(in oklch, oklch(60% 0.12 25), transparent 88%);
  --dsw-alias-state-warn-primary: oklch(75% 0.1 75);
  --dsw-alias-state-warn-secondary: color-mix(in oklch, oklch(75% 0.1 75), transparent 88%);
  --dsw-alias-state-warn-tertiary: color-mix(in oklch, oklch(75% 0.1 75), transparent 94%);
  --dsw-alias-state-warn-label: oklch(40% 0.09 75);
  --dsw-alias-state-business-primary: oklch(62% 0.1 250);
  --dsw-alias-state-business-tertiary: color-mix(in oklch, oklch(62% 0.1 250), transparent 92%);
  /* ⚠️ inline-code 是「背景色」不是文字色 —— DSH 把它 set 到 code 元素的 background。
     曾经按文字色给（亮色 L30% 深色 / 暗色 L88% 浅色），结果亮色深底深字、
     暗色浅底白字（实测 1.2:1，一块刺眼亮斑）。必须给背景值。 */
  --dsw-alias-markdown-inline-code: var(--bloom-code-bg);
  --dsw-alias-markdown-code-block: ${sfL};
  --dsw-alias-markdown-code-block-banner: ${mix(txL, 96)};
  --dsw-alias-markdown-tag: ${mix(aL, 88)};
  --dsw-alias-markdown-placeholder: ${mix(txL, 50)};
  --dsw-alias-markdown-citation: ${mix(txL, 55)};
  --dsw-alias-scrollbar-bg-l1: ${mix(txL, 90)};
  --dsw-alias-scrollbar-bg-l2: ${mix(txL, 80)};
  --dsw-alias-scrollbar-hover-l1: ${mix(txL, 82)};
  --dsw-alias-scrollbar-hover-l2: ${mix(txL, 72)};
  --dsw-alias-toast-bg: oklch(30% 0.02 240);
  --dsw-alias-tooltip-bg: oklch(30% 0.02 240);
  /* specific：消息气泡 / 侧栏 / 输入区 / 菜单 —— 不接管就会回落到 DSH 蓝灰调 */
  --dsw-specific-bubble: color-mix(in oklch, ${bgL}, ${txL} 3%);
  --dsw-specific-bubble-highlight: ${mix(aL, 88)};
  --dsw-specific-input-major: ${bgL};
  --dsw-specific-login-input: ${sfL};
  --dsw-specific-menu: ${sf2L};
  --dsw-specific-selector: ${sfL};
  /* 5% 而不是 2%：2% 的色差在浅色模式下肉眼几乎分不出侧边栏和主区，
     侧边栏就显得没有存在感（配合下方 _sidebarCol 的右侧分界线一起看） */
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bgL}, ${txL} 5%);
  --dsw-specific-sidebar-nav-item-active-accent: ${mix(aL, 86)};
  --dsw-specific-sidebar-nav-item-active: ${mix(aL, 93)};
  --dsw-specific-sidebar-nav-item-hover: ${mix(txL, 95)};
  --dsw-specific-tip: ${mix(aL, 90)};
}
`
}

/** mist 暗色：完整接管（暗色下文字是亮灰、表面是深灰、主色提亮） */
function mistDark(p) {
  const { accentD: aD, bgD, txD, sfD, sf2D } = p
  return `
/* ─── Bloom · mist 暗色 ─────────────────────────────────────────── */
body[data-ds-dark-theme], body[data-ds-dark-theme][data-bloom-variant="mist"] {${bloomTokens(p, true)}
  --dsw-alias-bg-base: ${bgD};
  --dsw-alias-bg-layer-1: ${bgD};
  --dsw-alias-bg-layer-2: ${sfD};
  --dsw-alias-bg-layer-3: ${sf2D};
  --dsw-alias-bg-overlay: ${sfD};
  --dsw-alias-bg-module-platform: ${sfD};
  --dsw-alias-bg-multi-select: ${sf2D};
  --dsw-alias-bg-skeleton: ${mix(txD, 94)};
  --dsw-alias-bg-mask-1: ${mix(txD, 96)};
  --dsw-alias-bg-mask-2: ${mix(txD, 93)};
  --dsw-alias-bg-mask-3: ${mix(txD, 90)};
  --dsw-alias-bg-mask-drop: ${mix(txD, 84)};
  --dsw-alias-bg-mask-photo: oklch(35% 0.02 240);
  --dsw-alias-label-primary: ${txD};
  --dsw-alias-label-primary-bluish: ${txD};
  --dsw-alias-label-primary-dimmed: ${mix(txD, 30)};
  --dsw-alias-label-primary-foreground: ${bgD};
  --dsw-alias-label-primary-inverted: ${bgD};
  --dsw-alias-label-secondary: ${mix(txD, 35)};
  --dsw-alias-label-tertiary: ${mix(txD, 45)};
  /* 层级必须单调递减：secondary > tertiary > caption > dimmed。
     曾经是 35/45/30/35 —— caption 比 secondary 还亮、dimmed 跟 secondary 相同，
     三档信息层级在暗色下塌成一档（亮色是 35/45/40/55，有层次）。 */
  --dsw-alias-label-caption: ${mix(txD, 48)};
  --dsw-alias-label-dimmed: ${mix(txD, 58)};
  --dsw-alias-brand-primary: ${aD};
  --dsw-alias-brand-primary-invert: ${bgD};
  --dsw-alias-brand-text: ${bgD};
  --dsw-alias-border-l1: ${mix(txD, 88)};
  --dsw-alias-border-l2: ${mix(txD, 78)};
  --dsw-alias-border-l3: ${mix(txD, 68)};
  --dsw-alias-border-l4: ${mix(txD, 58)};
  --dsw-alias-border-inverted: ${mix(txD, 85)};
  --dsw-alias-border-inverted2: ${mix(txD, 70)};
  --dsw-alias-button-primary-fill: ${aD};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aD}, white 8%);
  --dsw-alias-button-primary-dimmed: ${mix(aD, 82)};
  --dsw-alias-button-tool-bar-fill: ${sfD};
  --dsw-alias-button-tool-bar-fill-invisible: transparent;
  --dsw-alias-button-tool-bar-hover: ${mix(txD, 92)};
  --dsw-alias-button-floating-fill: ${sfD};
  --dsw-alias-button-floating-hover: ${sf2D};
  --dsw-alias-button-elevated-fill: ${bgD};
  --dsw-alias-button-contrast-fill: ${txD};
  --dsw-alias-button-info-fill: ${mix(aD, 86)};
  --dsw-alias-button-info-hover: ${mix(aD, 78)};
  --dsw-alias-button-ghost-active-fill: ${mix(aD, 88)};
  --dsw-alias-button-ghost-active-hover: ${mix(aD, 82)};
  --dsw-alias-button-ghost-active-border: ${mix(aD, 70)};
  --dsw-alias-interactive-bg-hover: ${mix(aD, 90)};
  --dsw-alias-interactive-bg-hover-accent: ${mix(aD, 84)};
  --dsw-alias-interactive-bg-hover-danger: color-mix(in oklch, oklch(62% 0.15 25), transparent 86%);
  --dsw-alias-interactive-bg-hover-solid: ${mix(aD, 82)};
  --dsw-alias-interactive-bg-active: ${mix(aD, 86)};
  --dsw-alias-state-success-primary: oklch(72% 0.12 150);
  --dsw-alias-state-success-secondary: color-mix(in oklch, oklch(72% 0.12 150), transparent 82%);
  --dsw-alias-state-success-tertiary: color-mix(in oklch, oklch(72% 0.12 150), transparent 90%);
  --dsw-alias-state-error-primary: oklch(62% 0.15 25);
  --dsw-alias-state-error-secondary: color-mix(in oklch, oklch(62% 0.15 25), transparent 82%);
  --dsw-alias-state-warn-primary: oklch(80% 0.12 75);
  --dsw-alias-state-warn-secondary: color-mix(in oklch, oklch(80% 0.12 75), transparent 82%);
  --dsw-alias-state-warn-tertiary: color-mix(in oklch, oklch(80% 0.12 75), transparent 90%);
  --dsw-alias-state-warn-label: oklch(88% 0.1 75);
  --dsw-alias-state-business-primary: oklch(70% 0.12 250);
  --dsw-alias-state-business-tertiary: color-mix(in oklch, oklch(70% 0.12 250), transparent 86%);
  /* 见亮色块同名变量的说明：这是背景色。 */
  --dsw-alias-markdown-inline-code: var(--bloom-code-bg);
  --dsw-alias-markdown-code-block: oklch(24% 0.02 240);
  --dsw-alias-markdown-code-block-banner: ${mix(txD, 94)};
  --dsw-alias-markdown-tag: ${mix(aD, 85)};
  --dsw-alias-markdown-placeholder: ${mix(txD, 40)};
  --dsw-alias-markdown-citation: ${mix(txD, 35)};
  --dsw-alias-scrollbar-bg-l1: ${mix(txD, 86)};
  --dsw-alias-scrollbar-bg-l2: ${mix(txD, 76)};
  --dsw-alias-scrollbar-hover-l1: ${mix(txD, 75)};
  --dsw-alias-scrollbar-hover-l2: ${mix(txD, 65)};
  --dsw-alias-toast-bg: oklch(40% 0.02 240);
  --dsw-alias-tooltip-bg: oklch(40% 0.02 240);
  --dsw-specific-bubble: color-mix(in oklch, ${bgD}, white 3%);
  --dsw-specific-bubble-highlight: ${mix(aD, 82)};
  --dsw-specific-input-major: ${bgD};
  --dsw-specific-login-input: ${sfD};
  --dsw-specific-menu: ${sf2D};
  --dsw-specific-selector: ${sfD};
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bgD}, black 7%);
  --dsw-specific-sidebar-nav-item-active-accent: ${mix(aD, 80)};
  --dsw-specific-sidebar-nav-item-active: ${mix(aD, 88)};
  --dsw-specific-sidebar-nav-item-hover: ${mix(txD, 95)};
  --dsw-specific-tip: ${mix(aD, 84)};
}
`
}

/**
 * 非 mist 变体：只覆盖「主色 + 背景调」相关的行（含 specific 组件），
 * 灰阶骨架、状态色、markdown 色继承 mist —— 变体之间保持同构，只换气质。
 */
function variantBlock(v, dark) {
  const p = PALETTE[v]
  const a = dark ? p.accentD : p.accentL
  const bg = dark ? p.bgD : p.bgL
  const tx = dark ? p.txD : p.txL
  const sf = dark ? p.sfD : p.sfL
  const sf2 = dark ? p.sf2D : p.sf2L
  const sel = dark
    ? `body[data-ds-dark-theme][data-bloom-variant="${v}"]`
    : `body[data-bloom-variant="${v}"]`
  return `
/* ─── Bloom · ${v}${dark ? ' 暗色' : ''}（仅覆盖主色 + 背景调，骨架继承 mist）─────────── */
${sel} {${bloomTokens(p, dark)}
  --dsw-alias-bg-base: ${bg};
  --dsw-alias-bg-layer-1: ${bg};
  --dsw-alias-bg-layer-2: ${sf};
  --dsw-alias-bg-layer-3: ${sf2};
  --dsw-alias-bg-overlay: ${sf};
  --dsw-alias-bg-module-platform: ${sf};
  --dsw-alias-bg-multi-select: ${sf2};
  --dsw-alias-bg-skeleton: ${mix(tx, 95)};
  --dsw-alias-bg-mask-1: ${mix(tx, 97)};
  --dsw-alias-bg-mask-2: ${mix(tx, 95)};
  --dsw-alias-bg-mask-3: ${mix(tx, 93)};
  --dsw-alias-bg-mask-drop: ${mix(tx, 88)};
  --dsw-alias-brand-primary: ${a};
  --dsw-alias-brand-primary-invert: ${bg};
  --dsw-alias-brand-text: ${bg};
  --dsw-alias-button-primary-fill: ${a};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${a}, ${dark ? 'white' : 'black'} 8%);
  --dsw-alias-button-primary-dimmed: ${mix(a, dark ? 82 : 85)};
  --dsw-alias-button-info-fill: ${mix(a, dark ? 86 : 90)};
  --dsw-alias-button-info-hover: ${mix(a, dark ? 78 : 84)};
  --dsw-alias-button-ghost-active-fill: ${mix(a, dark ? 88 : 92)};
  --dsw-alias-button-ghost-active-hover: ${mix(a, dark ? 82 : 88)};
  --dsw-alias-button-ghost-active-border: ${mix(a, dark ? 70 : 78)};
  --dsw-alias-button-tool-bar-fill: ${sf};
  --dsw-alias-button-tool-bar-hover: ${mix(tx, dark ? 92 : 95)};
  --dsw-alias-button-floating-fill: ${sf};
  --dsw-alias-button-floating-hover: ${sf2};
  --dsw-alias-interactive-bg-hover: ${mix(a, dark ? 90 : 92)};
  --dsw-alias-interactive-bg-hover-accent: ${mix(a, dark ? 84 : 85)};
  --dsw-alias-interactive-bg-hover-solid: ${mix(a, dark ? 82 : 88)};
  --dsw-alias-interactive-bg-active: ${mix(a, dark ? 86 : 88)};
  --dsw-alias-markdown-tag: ${mix(a, dark ? 85 : 88)};
  /* 必须逐变体覆盖：否则继承 mist 的蓝灰 hue，ripple/petal 下代码块会跟主色打架 */
  --dsw-alias-markdown-inline-code: var(--bloom-code-bg);
  --dsw-alias-markdown-code-block: ${dark ? `color-mix(in oklch, ${bg}, black 12%)` : sf};
  --dsw-alias-scrollbar-bg-l1: ${mix(tx, dark ? 86 : 90)};
  --dsw-alias-scrollbar-bg-l2: ${mix(tx, dark ? 76 : 80)};
  --dsw-alias-scrollbar-hover-l1: ${mix(tx, dark ? 75 : 82)};
  --dsw-alias-scrollbar-hover-l2: ${mix(tx, dark ? 65 : 72)};
  --dsw-alias-label-primary: ${tx};
  --dsw-alias-label-primary-bluish: ${tx};
  --dsw-alias-label-primary-dimmed: ${mix(tx, dark ? 30 : 25)};
  --dsw-alias-label-primary-foreground: ${bg};
  --dsw-alias-label-secondary: ${mix(tx, dark ? 35 : 35)};
  --dsw-alias-label-tertiary: ${mix(tx, dark ? 45 : 45)};
  --dsw-alias-label-caption: ${mix(tx, dark ? 48 : 40)};
  --dsw-alias-label-dimmed: ${mix(tx, dark ? 58 : 55)};
  --dsw-alias-border-l1: ${mix(tx, dark ? 88 : 90)};
  --dsw-alias-border-l2: ${mix(tx, dark ? 78 : 80)};
  --dsw-alias-border-l3: ${mix(tx, dark ? 68 : 70)};
  --dsw-alias-border-l4: ${mix(tx, dark ? 58 : 60)};
  --dsw-alias-markdown-placeholder: ${mix(tx, dark ? 40 : 50)};
  --dsw-alias-markdown-citation: ${mix(tx, dark ? 35 : 55)};
  --dsw-specific-bubble: color-mix(in oklch, ${bg}, ${tx} ${dark ? 4 : 3}%);
  --dsw-specific-bubble-highlight: ${mix(a, dark ? 82 : 88)};
  --dsw-specific-input-major: ${bg};
  --dsw-specific-login-input: ${sf};
  --dsw-specific-menu: ${sf2};
  --dsw-specific-selector: ${sf};
  /* 4/2% → 7/5%：原值色差太小，侧边栏和主区几乎同一片底色，缺少「面」的区分 */
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bg}, ${dark ? 'black' : tx} ${dark ? 7 : 5}%);
  --dsw-specific-sidebar-nav-item-active-accent: ${mix(a, dark ? 80 : 86)};
  --dsw-specific-sidebar-nav-item-active: ${mix(a, dark ? 88 : 93)};
  --dsw-specific-sidebar-nav-item-hover: ${mix(tx, dark ? 95 : 95)};
  --dsw-specific-tip: ${mix(a, dark ? 84 : 90)};
}
`
}

/** 生成 4 变体 + 亮/暗的完整 CSS。 */
function buildBloomCSS() {
  const blocks = [mistLight(PALETTE.mist), mistDark(PALETTE.mist)]
  for (const v of OTHER_VARIANTS) {
    blocks.push(variantBlock(v, false), variantBlock(v, true))
  }
  return blocks.join('\n')
}

/**
 * 质感层 —— 这是「Bloom 好看」的真正来源，不是色值。
 *
 * 原版 typora-Bloom-theme 的 base-light/base-dark.css 共 2968 行，做的就是这件事：
 * 14 处氛围渐变 + 20 处长距柔影 + 35 处圆角 + 渐变装饰线。只搬色板（root-*.css，89 行）
 * 得到的是「换了色的原界面」，不是 Bloom。
 *
 * 全部用 var(--bloom-*)（见 bloomTokens），所以这份 CSS 只写一遍，4 个变体 × 明暗自动适配。
 *
 * ⚠️ 选择器脆弱性：DSH 用 CSS Modules，类名形如 `wSkVaW_root`（<hash>_<语义名>）。
 * hash 随 DSH 构建变化，语义名稳定，所以这里一律用 [class*="_语义名"] 后缀匹配。
 * DSH 改版导致失配时，效果只会「退回纯色」——不会错位或不可用，属安全降级。
 */
const COMPONENT_CSS = `
/* ═══ 1. 氛围层 ═══════════════════════════════════════════════════
   原版 body 的三层叠加：大尺度径向光晕 + 斜向淡染 + 顶部柔光。
   全部用气质轨(morandi)的极低透明度，这是莫兰迪「灰调通透」的来源。 */
body {
  background-attachment: fixed;
  background-image:
    radial-gradient(1200px circle at 12% 0%, var(--bloom-veil-1), transparent 55%),
    radial-gradient(1000px circle at 88% 8%, var(--bloom-veil-2), transparent 50%),
    linear-gradient(160deg, var(--bloom-veil-2), transparent 55%),
    radial-gradient(900px circle at 100% 100%, var(--bloom-veil-1), transparent 55%);
}

/* 让 body 的氛围层透出来：DSH 这几个全屏容器自带不透明底色会盖住它。
   侧栏与卡片保留自己的 surface 色（原版同样保留），只做描边和光。 */
[class*="_frame"],
[class*="_centerCol"],
[class*="_root"]:has(> [class*="_scrollBody"]),
[class*="_scrollBody"] {
  background-color: transparent !important;
  background-image: none !important;
}

/* ═══ 2. 冷光线条 ═════════════════════════════════════════════════
   细、冷、低透明度的莫兰迪描边 + 极弱外辉。深色下最出效果。 */

/* ═══ 侧栏 ════════════════════════════════════════════════════════
   之前只给了右侧一道竖线，内部还是一整块死板的纯色。补足：顶部氛围淡染、
   会话项冷光态、分组标题层级。 */
[class*="_sidebarCol"] {
  position: relative;
  box-shadow: 1px 0 0 var(--bloom-hairline), 8px 0 32px -10px var(--bloom-glow);
  /* 顶部莫兰迪淡染，跟主区氛围同源，消除"两块拼起来"的割裂感 */
  background-image:
    linear-gradient(180deg, rgba(var(--bloom-morandi), 0.1), transparent 260px),
    radial-gradient(600px circle at 0% 0%, rgba(var(--bloom-morandi), 0.08), transparent 60%);
}

/* 会话条目：hover 冷光淡染，选中态左侧一道主色标记 */
[class*="_sidebarCol"] [role="treeitem"] {
  border-radius: 8px;
  transition: background 0.15s ease;
}
[class*="_sidebarCol"] [role="treeitem"]:hover {
  background: rgba(var(--bloom-morandi), 0.12);
}
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"],
[class*="_sidebarCol"] [class*="_active"] {
  position: relative;
  /* 0.18 → 0.24：选中态要一眼可辨，18% 在氛围渐变上还是太含蓄 */
  background: rgba(var(--bloom-morandi), 0.24);
}
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"] [class*="_title"],
[class*="_sidebarCol"] [class*="_active"] [class*="_title"] {
  font-weight: 500;
}
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"]::before,
[class*="_sidebarCol"] [class*="_active"]::before {
  content: "";
  position: absolute;
  left: 0; top: 50%;
  width: 2px; height: 16px;
  margin-top: -8px;
  border-radius: 999px;
  background: var(--bloom-accent);
  box-shadow: 0 0 8px -1px var(--bloom-glow);
}

/* 新建会话按钮：冷光描边 + 内高光，跟输入卡片同一套语言。
   background 必须一起接管 —— 只改描边的话按钮底色仍是 DSH 原生的
   oklch(0.28 0.02 240)（色相 240 的蓝灰）+ 青色描边，跟本主题任何一个
   莫兰迪变体都不同色系；浅色模式下那块冷蓝尤其跳，看着像没上主题。 */
[class*="_sidebarCol"] button[class*="_newSession"],
[class*="_sidebarCol"] button[class*="_newChat"] {
  background: color-mix(in oklch, var(--bloom-accent) 10%, var(--dsw-specific-sidebar-fill, transparent));
  border: 1px solid var(--bloom-hairline);
  border-radius: 10px;
  box-shadow: inset 0 1px 0 rgba(var(--bloom-morandi), 0.12);
  transition: background 180ms ease, border-color 180ms ease;
}
[class*="_sidebarCol"] button[class*="_newSession"]:hover,
[class*="_sidebarCol"] button[class*="_newChat"]:hover {
  background: color-mix(in oklch, var(--bloom-accent) 18%, var(--dsw-specific-sidebar-fill, transparent));
  border-color: color-mix(in oklch, var(--bloom-accent) 45%, transparent);
}
/* 新建按钮的图标着主色，强化它作为侧栏唯一主 CTA 的地位（文字仍正文色） */
[class*="_sidebarCol"] button[class*="_newSession"] svg,
[class*="_sidebarCol"] button[class*="_newChat"] svg {
  color: var(--bloom-accent);
}

/* 分组标题（工作区 / 未分组）：拉开与条目的层级。
   _sectionLabel 是 DSH 实际用的类名片段（qDHVXG_sectionLabel），
   12px + 字距让它明显是「标签」而不是一行内容。 */
[class*="_sidebarCol"] [class*="_groupLabel"],
[class*="_sidebarCol"] [class*="_sectionTitle"],
[class*="_sidebarCol"] [class*="_sectionLabel"] {
  font-size: 12px;
  letter-spacing: 0.06em;
  color: var(--dsw-alias-label-caption);
}

/* 分区头右侧的搜索/动作图标：默认 60% 亮度降权，hover 才全亮 ——
   和「工作区」标题同排且全亮时，四个元素抢注意力，列表反而不突出。 */
[class*="_sidebarCol"] [class*="_sectionHeader"] [class*="_searchSlot"],
[class*="_sidebarCol"] [class*="_sectionHeader"] [class*="_headerActions"] {
  opacity: 0.6;
  transition: opacity 150ms ease;
}
[class*="_sidebarCol"] [class*="_sectionHeader"] [class*="_searchSlot"]:hover,
[class*="_sidebarCol"] [class*="_sectionHeader"] [class*="_headerActions"]:hover {
  opacity: 1;
}

/* 会话行元信息（时间戳/来源等 _slot）：DSH 默认 0.55 透明度，
   暗色氛围渐变上偏糊，统一提到主题的 secondary 档（明暗自适应）。 */
[class*="_sidebarCol"] [class*="_sessionRow"] [class*="_slot"] {
  color: var(--dsw-alias-label-secondary);
}

/* 会话列表细滚动条：4px、冷光 thumb、hover 才加强。
   系统默认滚动条在 280px 的窄栏里非常抢；DSH 自己只有全局 alias 变量，
   没有给侧栏列表单独收窄。 */
[class*="_sidebarCol"] [class*="_list"]::-webkit-scrollbar { width: 4px; }
[class*="_sidebarCol"] [class*="_list"]::-webkit-scrollbar-track { background: transparent; }
[class*="_sidebarCol"] [class*="_list"]::-webkit-scrollbar-thumb {
  background: color-mix(in oklch, var(--bloom-accent) 30%, transparent);
  border-radius: 999px;
}
[class*="_sidebarCol"] [class*="_list"]::-webkit-scrollbar-thumb:hover {
  background: color-mix(in oklch, var(--bloom-accent) 55%, transparent);
}

/* 侧边栏成「面」：右侧一道冷光分界 + 向内的极淡渐变。
   光靠 sidebar-fill 的底色差不足以让它跟消息区分开 —— 消息区有氛围渐变和气泡，
   侧边栏只有一列文字，不给边界就显得平。分界线用 hairline（比实色 border 轻），
   渐变只在顶部 120px 内，避免整列发灰。 */
[class*="_sidebarCol"] {
  border-right: 1px solid var(--bloom-hairline);
  background-image: linear-gradient(
    180deg,
    color-mix(in oklch, var(--bloom-accent) 4%, transparent),
    transparent 120px
  );
}

/* 底部设置区与会话列表之间补一道分隔，让「设置」不像是最后一条会话 */
[class*="_sidebarCol"] [class*="_footer"],
[class*="_sidebarCol"] [class*="_bottom"] {
  border-top: 1px solid var(--bloom-hairline);
}

/* 顶栏下沿冷光线 —— 标题区与消息流之间的分界，比实色 border 轻。
   只给 tabs 这一条真正的分界线：_header 会同时命中 headerActions /
   headerUtilities 等右上角子容器，给它们加投影会凭空多出几个浮块。 */
div[class*="_tabs"] {
  box-shadow: 0 1px 0 var(--bloom-hairline), 0 6px 20px -12px var(--bloom-glow);
}

/* 排队消息条（输入框上方那条待发送预览）。
   DSH 原样式是「完全透明容器 + 70% 不透明白字」—— 在它自己的纯色底上尚可读，
   但本主题给 body 铺了氛围渐变，背景不再均匀，这条就糊进背景里了。
   这是氛围层带来的副作用，必须由本主题自己补一个实体容器兜住。

   ⚠️ 必须用 :has(> [class*="_preview"]) 收窄，不能裸用 [class*="_dock"]：
   GoalBar（dsh-client-ui-goal）的外层类名也叫「*_dock」，但它是**全宽布局容器**
   （原生 width: calc(100% - 各种 inset)），真正该被看见的条是里面那个限宽居中的
   「*_bar」（max-width: var(--dsh-composer-card-max-width)）。
   裸选择器会把边框+毛玻璃画到那个全宽容器上——实测 dock 1810px 而 bar 只有 748px，
   于是「进行中的目标」左右各露出一大截空壳边框，跟下方输入框完全不对齐。
   QueueDock 一定有「_preview」子元素（就是下一条规则要上色的那个），拿它当判据最稳，
   比写死 QueueDock 的哈希类名（会随 DSH 构建变）可靠。 */
div[class*="_dock"]:has(> [class*="_preview"]) {
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 22%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--bloom-hairline);
  border-radius: 12px;
}
div[class*="_dock"] [class*="_preview"] {
  color: var(--dsw-alias-label-secondary);
}

/* 消息卡 / 工具调用行：只给轻描边，不给阴影 —— 数量多（一次会话 30+ 个），
   加长距阴影会把整个消息流糊成一片。全部限定 div，否则会命中 SVG 元素。 */
/* 工具调用行：常态不描边，hover 才亮起。
   常驻边框有两个毛病：① 同为工具行，可展开的 Bash 有框、Read/Edit 没框，视觉不一致；
   ② 折叠行实测 748×26，画成圆角框又扁又长，且边框贴着内容区边缘而行内图标有内缩，
   看起来像个输入框。保留 transparent 占位是为了 hover 时不发生布局跳动。 */
div[class*="_card"],
div[class*="_toolRow"],
div[class*="_panel"] {
  border-radius: 10px;
  border: 1px solid transparent;
  transition: border-color 0.16s ease, background 0.16s ease;
}
div[class*="_card"]:hover,
div[class*="_toolRow"]:hover {
  border-color: var(--bloom-hairline);
  background: rgba(var(--bloom-morandi), 0.05);
}
/* 展开态：DSH 的终端区（_terminal）自带 1px 边框 + 12px 圆角，
   外层 card 再描一圈就是两个几乎同尺寸的圆角框相套（实测 439px 套 377px）＝框中框。
   展开后连 hover 边框也不要。 */
div[class*="_card"]:has([class*="_terminal"]),
div[class*="_card"]:has(pre),
div[class*="_card"]:has([class*="_terminal"]):hover,
div[class*="_card"]:has(pre):hover {
  border-color: transparent;
  background: transparent;
}

/* 输入卡片：整个界面的视觉主角，给足纸感。
   必须限定在 composer 内 —— 裸的 [class*="_card"] 会命中 30+ 个消息卡片，
   把长距阴影糊得到处都是。 */
div[class*="_composer"] div[class*="_card"] {
  border: 1px solid var(--bloom-hairline);
  border-radius: 16px;
  /* 三层：顶部内高光（模拟光从上方打来）+ 长距柔影 + 外侧冷辉 */
  box-shadow:
    inset 0 1px 0 rgba(var(--bloom-morandi), 0.14),
    var(--bloom-shadow),
    0 0 24px -14px var(--bloom-glow);
  transition: border-color 0.22s ease, box-shadow 0.22s ease;
}
div[class*="_composer"] div[class*="_card"]:focus-within {
  border-color: var(--bloom-hairline-strong);
  box-shadow:
    inset 0 1px 0 rgba(var(--bloom-morandi), 0.2),
    var(--bloom-shadow),
    0 0 0 3px var(--bloom-glow);
}

/* 消息气泡：柔和圆角 + 近距阴影，脱离"贴在背景上"的平面感 */
[class*="_bubble"] {
  border-radius: 14px;
  box-shadow: var(--bloom-shadow-sm);
}

/* ═══ 3. Markdown 排版质感 ═════════════════════════════════════════
   照搬原版手法：标题渐变短横、hr 两端消隐、引用块左侧主色条。 */
[class*="_markdown"] h1,
[class*="_markdown"] h2,
[class*="_markdown"] h3 {
  position: relative;
}
[class*="_markdown"] h1::after,
[class*="_markdown"] h2::after,
[class*="_markdown"] h3::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.34em;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(var(--bloom-morandi), 0.45), transparent);
}
[class*="_markdown"] h1::after { width: 76px; height: 3px; }
[class*="_markdown"] h2::after { width: 56px; }
[class*="_markdown"] h3::after { width: 40px; background: linear-gradient(90deg, rgba(var(--bloom-morandi), 0.28), transparent); }

hr {
  border: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--bloom-hairline-strong), transparent);
}

blockquote {
  border-left: 3px solid rgba(var(--bloom-morandi), 0.55);
  border-radius: 12px;
  background: rgba(var(--bloom-morandi), 0.07);
  box-shadow: var(--bloom-shadow-sm);
}

/* 代码：内联块用莫兰迪淡底（变量已在 alias 层修正为背景色），
   块级代码加冷光描边 + 圆角，消除方角感 */
code {
  border-radius: 6px;
}

/* 代码块：描边/阴影只能给「有实色背景的那一层」——DSH 的结构是
     div.md-code-block（实色底 + 圆角）> div > pre.shiki（背景透明）
   曾经把 border/box-shadow 加在 pre 上：两层各画一个 12px 圆角框 = 框中框，
   而且 pre 背景透明，阴影直接投进容器内部形成一圈脏边。
   md-code-block 是 DSH 的全局类名（非 CSS Modules hash），可以稳定引用。 */
.md-code-block {
  border: 1px solid var(--bloom-hairline);
  box-shadow: var(--bloom-shadow-sm);
  overflow: hidden;
}
.md-code-block pre,
pre.shiki {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}
/* 兜底：不在 md-code-block 里的裸 pre 才自己描边 */
pre:not(.shiki) {
  border-radius: 12px;
}
pre code {
  border-radius: 0;
  background: transparent;
}

/* 表格：严格限定在 [_tableScroll] 容器内，只动 markdown 渲染的聊天表格，
   不影响 DSH 会话列表（Y0dWHa_table）这类其他用途的 <table>。
   DSH 原生规则：th/td 各有一条 border-bottom，th:first-child 与 td:first-child
   的 padding-left:0（让首列对齐正文），空 cell 仍撑出 100px min-width。
   三个肉眼短板：① 表头只有加粗无底色，与主体混淆；② 无列分隔，像列表不像表；
   ③ 空 cell 100px 留白让残缺行（如 P1 状态列空）看着"半残废"。 */
[class*="_tableScroll"] {
  border: 1px solid var(--bloom-hairline);
  border-radius: 10px;
  background: rgba(var(--bloom-morandi), 0.02);
}
/* min-width:100% 而不是 width:100%：
   DSH 原生表格按内容定宽，而 _tableScroll 容器是块级全宽。上面刚给容器加了边框+圆角，
   两边宽度不一致立刻就看得见——实测容器 748px、表格只有 469px，右侧露出 279px 空框，
   表头底色和行分隔线都在半路截断（截图里那种「表格缩在左边」）。
   用 min-width 而非 width 是因为 _tableScroll 本来就是横向滚动容器：
   窄表格撑满对齐边框，宽表格仍能超出并滚动；写 width:100% 会把宽表格压缩换行，
   把这个容器的滚动能力废掉。 */
[class*="_tableScroll"] table {
  border-collapse: separate;
  border-spacing: 0;
  min-width: 100%;
}
[class*="_tableScroll"] th,
[class*="_tableScroll"] td {
  border-color: var(--bloom-hairline) !important;
  border-right-width: 1px;
  border-right-style: solid;
  border-bottom-width: 1px;
}
[class*="_tableScroll"] th:last-child,
[class*="_tableScroll"] td:last-child { border-right: 0; }
[class*="_tableScroll"] tr:last-child th,
[class*="_tableScroll"] tr:last-child td { border-bottom: 0; }
[class*="_tableScroll"] th:first-child,
[class*="_tableScroll"] td:first-child { padding-left: 16px; }
[class*="_tableScroll"] thead th {
  background: rgba(var(--bloom-morandi), 0.10);
  font-weight: 600;
  border-bottom-width: 1px;
  border-bottom-color: var(--bloom-hairline-strong);
  color: var(--dsw-alias-label-secondary, currentColor);
}
[class*="_tableScroll"] tbody tr:hover { background: rgba(var(--bloom-morandi), 0.06); }
/* 空 cell 视觉降权：透明度 0.35，省得缺值列（P1 状态空）显得行"断了一截" */
[class*="_tableScroll"] td:empty { opacity: 0.35; }

/* 选中文本：原版用 accent 混 80%，比 DSH 默认的 85% 更实，能看清 */
::selection {
  background: color-mix(in oklch, var(--bloom-accent), transparent 78%);
}

/* ═══ 4. 裸露的 <think> 标签 ═══════════════════════════════════════
   由 markThinkTags() 打标（见该函数注释：这是 workaround，根因在 LLM 适配层）。
   标签行整行隐藏 —— 实测它们各自独占段落，隐藏不丢内容；
   标签之间的思考内容只降权、不隐藏，用冷光竖线标出，信息仍可读。 */
[data-bloom-think] {
  display: none !important;
}
/* 左侧冷光竖线 + 降低透明度。
   ⚠️ 竖线错位的坑：思考块是一串平铺的兄弟元素（p / ul / ol / h3 / div），各标签
   默认 margin-left 不同（实测 p 被置为 0、ul 为 2px），不强制归零就会让竖线
   错开 2px、连不成一条直线。所以 margin-left 必须 !important 压平。
   另：用背景色块代替竖线会让每段变成一张「卡片」，且色块边缘直接贴住文字，
   观感更差 —— 竖线 + 内边距才是对的做法。 */
[data-bloom-think-body] {
  opacity: 0.62;
  border-left: 2px solid var(--bloom-hairline);
  margin-left: 0 !important;
  padding-left: 14px;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}
[data-bloom-think-body]:hover {
  opacity: 0.92;
  border-left-color: var(--bloom-hairline-strong);
}
/* 列表要保留编号/圆点的缩进，否则 padding 被覆盖后编号会贴到竖线上 */
ul[data-bloom-think-body],
ol[data-bloom-think-body] {
  padding-left: 38px;
}

/* ═══ 5. 无障碍 ═══════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  [class*="_card"],
  .dsh-bloom-switcher,
  .dsh-bloom-switcher .dsh-bloom-swatch {
    transition: none !important;
  }
}
`

/**
 * 氛围层 CSS（v0.4.0）—— 壁纸 + 磨砂玻璃，全部由 body 的 data-* 属性驱动，
 * 默认不生效（data 属性不写就不渲染），关掉即完全回到 v0.3 的纯 Bloom。
 *
 * 壁纸：两个 fixed 层（图 + 压暗纱），z-index:-1 画在 body 背景之上、
 * 应用内容之下；同时必须把 body 自己的氛围渐变和底色清掉，否则会盖住壁纸。
 * 玻璃：只接管「面」级容器（侧栏/气泡/输入卡/菜单/顶栏）——这些容器
 * 已经在 COMPONENT_CSS 里被透明化过背景，这里补半透明底 + backdrop-filter。
 */
const AMBIENCE_CSS = `
/* ═══ 壁纸层 ═══════════════════════════════════════════════════ */
body[data-bloom-wallpaper="on"] {
  background-image: none !important;
  background-color: transparent !important;
}
.dsh-bloom-wallpaper,
.dsh-bloom-wallpaper-veil {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
.dsh-bloom-wallpaper {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
/* 压暗纱：默认 30%（--bloom-dim 由 JS 按设置写入）。亮色主题下用白纱而不是黑纱，
   否则浅色 UI 浮在暗壁纸上会「脏」；纱色随明暗主题走。 */
.dsh-bloom-wallpaper-veil {
  background: rgba(0, 0, 0, var(--bloom-dim, 0.3));
}
body[data-ds-dark-theme] .dsh-bloom-wallpaper-veil {
  background: rgba(0, 0, 0, calc(var(--bloom-dim, 0.3) * 1.25));
}

/* ═══ 磨砂玻璃层 ═══════════════════════════════════════════════ */
/* 只在壁纸开启 + glass 开启时生效：面级容器给半透明底 + backdrop 模糊。
   底色用各自的主题 token 混透明度，色相跟当前变体走，不是死白/死黑。 */
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] [class*="_sidebarCol"],
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] [class*="_bubble"],
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] [class*="_menu"],
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] [class*="_selector"],
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] [class*="_tabs"],
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] [class*="_dock"]:has(> [class*="_preview"]) {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 38%) !important;
  backdrop-filter: blur(var(--bloom-glass-blur, 16px)) saturate(1.15);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 16px)) saturate(1.15);
}
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] [class*="_composer"] div[class*="_card"],
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] .md-code-block,
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] [class*="_tableScroll"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 22%) !important;
  backdrop-filter: blur(var(--bloom-glass-blur, 16px)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 16px)) saturate(1.2);
}
/* 气泡高亮/代码块等小面：更实一点，保证代码可读性优先 */
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] .md-code-block pre,
body[data-bloom-wallpaper="on"][data-bloom-glass="on"] .md-code-block code {
  background: transparent !important;
}
@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-wallpaper, .dsh-bloom-wallpaper-veil { transition: none !important; }
}
`

/** 变体色点：莫兰迪 → 可读色的双轨渐变，两端都有色（渐变到背景色会褪成白） */
const dotStyle = (v) =>
  `background:linear-gradient(135deg, rgb(${PALETTE[v].morandi}) 0%, ${PALETTE[v].accentL} 100%)`

/**
 * 顶栏切换器：下拉式（收起只占一个按钮宽度）。
 *
 * 为什么是下拉而不是 4 个并排色块：并排要 186px 宽，固定在右上角会**完全盖住**
 * DSH 自己的 Session log 按钮（实测两者矩形几乎重合，按钮点不到）——那是功能性 bug，
 * 不是观感问题。收成一个按钮后再挂进 header 工具区，就跟原生控件并排共存。
 *
 * v0.4.0：菜单下半部新增「氛围」区（壁纸 / 玻璃 / 主题包），与变体切换同一下拉。
 */
function buildSwitcherHTML(currentVariant) {
  const amb = readAmbience()
  const options = VARIANTS.map((v) => {
    const on = v === currentVariant
    return `<button type="button" class="dsh-bloom-option" role="option" data-variant="${v}"` +
      ` aria-selected="${on}" data-active="${on}">` +
      `<span class="dsh-bloom-dot" style="${dotStyle(v)}"></span>` +
      `<span class="dsh-bloom-option__name">${VARIANT_LABELS[v].zh}</span>` +
      `<span class="dsh-bloom-option__en">${VARIANT_LABELS[v].en}</span>` +
      `<span class="dsh-bloom-check" aria-hidden="true">✓</span></button>`
  }).join('')
  const wpThumbs = VARIANTS.map((v) =>
    `<button type="button" class="dsh-bloom-wp" data-amb-mode="fixed" data-amb-variant="${v}"` +
    ` title="${VARIANT_LABELS[v].zh}壁纸" style="background-image:url('${WALLPAPERS[v]}')">` +
    `<span class="dsh-bloom-wp__check">✓</span></button>`
  ).join('')
  return `<div class="dsh-bloom-switcher" data-plugin="${PLUGIN_ID}">
  <button type="button" class="dsh-bloom-trigger" aria-haspopup="listbox" aria-expanded="false" title="Bloom 主题">
    <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
    <span class="dsh-bloom-trigger__name">${VARIANT_LABELS[currentVariant].zh}</span>
    <svg class="dsh-bloom-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="dsh-bloom-menu" role="listbox" aria-label="Bloom 主题变体" hidden>
    ${options}
    <div class="dsh-bloom-sep" role="separator"></div>
    <div class="dsh-bloom-amb" data-plugin="${PLUGIN_ID}">
      <div class="dsh-bloom-amb__row">
        <span class="dsh-bloom-amb__label">氛围壁纸</span>
        <input type="checkbox" data-amb="enabled" ${amb.enabled ? 'checked' : ''} aria-label="开启氛围壁纸">
      </div>
      <div class="dsh-bloom-wp-row">
        <button type="button" class="dsh-bloom-wp dsh-bloom-wp--auto" data-amb-mode="auto" title="随变体自动切换"
                data-active="${amb.mode === 'auto'}" aria-pressed="${amb.mode === 'auto'}">
          <span class="dsh-bloom-wp__auto">自动</span><span class="dsh-bloom-wp__check">✓</span>
        </button>
        ${wpThumbs}
        <button type="button" class="dsh-bloom-wp dsh-bloom-wp--custom" data-amb-mode="custom" title="自定义壁纸"
                data-active="${amb.mode === 'custom'}" aria-pressed="${amb.mode === 'custom'}">
          <span class="dsh-bloom-wp__auto">链接</span><span class="dsh-bloom-wp__check">✓</span>
        </button>
      </div>
      <input type="text" class="dsh-bloom-input" data-amb="custom" placeholder="自定义壁纸 URL（http(s) 或 data:）"
             value="${amb.mode === 'custom' ? amb.custom.replace(/"/g, '&quot;') : ''}" spellcheck="false">
      <div class="dsh-bloom-amb__row">
        <span class="dsh-bloom-amb__label">压暗</span>
        <input type="range" data-amb="dim" min="0" max="70" step="5" value="${amb.dim}" aria-label="壁纸压暗程度">
        <span class="dsh-bloom-amb__val">${amb.dim}%</span>
      </div>
      <div class="dsh-bloom-amb__row">
        <span class="dsh-bloom-amb__label">磨砂玻璃</span>
        <input type="checkbox" data-amb="glass" ${amb.glass ? 'checked' : ''} aria-label="磨砂玻璃面板">
      </div>
      <div class="dsh-bloom-amb__row">
        <span class="dsh-bloom-amb__label">模糊</span>
        <input type="range" data-amb="blur" min="4" max="32" step="2" value="${amb.blur}" aria-label="玻璃模糊强度">
        <span class="dsh-bloom-amb__val">${amb.blur}px</span>
      </div>
      <div class="dsh-bloom-amb__row dsh-bloom-amb__row--pack">
        <button type="button" class="dsh-bloom-mini" data-amb="export">导出主题包</button>
        <button type="button" class="dsh-bloom-mini" data-amb="import">导入主题包</button>
        <input type="file" class="dsh-bloom-import-file" accept="application/json,.json" hidden>
      </div>
    </div>
  </div>
</div>`
}

const SWITCHER_CSS = `
.dsh-bloom-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 12px/1.2 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}
/* 兜底形态：挂不进 DSH header 时才浮起来。位置放在 header 下方，
   避开右上角原生控件（Session log 等）—— 决不能再压住它们。 */
.dsh-bloom-switcher[data-floating="true"] {
  position: fixed;
  top: 84px;
  right: 16px;
  z-index: 9999;
}

.dsh-bloom-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 9px;
  border-radius: 9px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,0.08));
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 30%);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  color: var(--dsw-alias-label-secondary, #555);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.dsh-bloom-trigger:hover {
  border-color: var(--bloom-hairline-strong);
  box-shadow: 0 0 14px -6px var(--bloom-glow);
}
.dsh-bloom-trigger:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4a90e2);
  outline-offset: 2px;
}
.dsh-bloom-trigger__name {
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #222);
}
.dsh-bloom-chevron {
  opacity: 0.55;
  transition: transform 0.2s ease;
}
.dsh-bloom-trigger[aria-expanded="true"] .dsh-bloom-chevron { transform: rotate(180deg); }

.dsh-bloom-dot {
  width: 12px; height: 12px;
  border-radius: 999px;
  flex: none;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
}

.dsh-bloom-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 10000;
  min-width: 168px;
  padding: 5px;
  border-radius: 12px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,0.08));
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 12%);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  box-shadow:
    inset 0 1px 0 rgba(var(--bloom-morandi), 0.14),
    var(--bloom-shadow);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dsh-bloom-menu[hidden] { display: none; }

.dsh-bloom-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 9px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #222);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}
.dsh-bloom-option:hover { background: rgba(var(--bloom-morandi), 0.14); }
.dsh-bloom-option:focus,
.dsh-bloom-option:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4a90e2);
  outline-offset: -2px;
  background: rgba(var(--bloom-morandi), 0.14);
}
.dsh-bloom-option[data-active="true"] { background: rgba(var(--bloom-morandi), 0.2); }
.dsh-bloom-option__name { font-weight: 500; }
.dsh-bloom-option__en {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.5;
  letter-spacing: 0.02em;
}
.dsh-bloom-check {
  width: 12px;
  text-align: center;
  opacity: 0;
  color: var(--dsw-alias-brand-primary, #4a90e2);
  font-weight: 700;
}
.dsh-bloom-option[data-active="true"] .dsh-bloom-check { opacity: 1; }

/* ═══ 氛围区（v0.4.0）════════════════════════════════════════════
   与变体选项同在下拉菜单里，用一道分隔线划开。控件全部原生 input，
   只做对齐和配色——不引入任何控件库（保持零依赖）。 */
.dsh-bloom-sep {
  height: 1px;
  margin: 5px 4px;
  background: var(--bloom-hairline, rgba(0,0,0,0.08));
}
.dsh-bloom-amb {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 7px 7px 6px;
}
.dsh-bloom-amb__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
}
.dsh-bloom-amb__label {
  flex: none;
  width: 52px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #666);
}
.dsh-bloom-amb__val {
  flex: none;
  width: 34px;
  font-size: 11px;
  text-align: right;
  color: var(--dsw-alias-label-tertiary, #888);
  font-variant-numeric: tabular-nums;
}
.dsh-bloom-amb input[type="checkbox"] {
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary, #4a90e2);
  width: 15px;
  height: 15px;
  cursor: pointer;
}
.dsh-bloom-amb input[type="range"] {
  flex: 1;
  margin: 0;
  accent-color: var(--dsw-alias-brand-primary, #4a90e2);
  cursor: pointer;
}
.dsh-bloom-wp-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
}
.dsh-bloom-wp {
  position: relative;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,0.12));
  background-size: cover;
  background-position: center;
  cursor: pointer;
  padding: 0;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.dsh-bloom-wp:hover {
  border-color: var(--bloom-hairline-strong);
  transform: translateY(-1px);
}
.dsh-bloom-wp[data-active="true"] {
  border-color: var(--dsw-alias-brand-primary, #4a90e2);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), transparent 70%);
}
.dsh-bloom-wp--auto,
.dsh-bloom-wp--custom {
  background: rgba(var(--bloom-morandi), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.dsh-bloom-wp__auto {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #666);
}
.dsh-bloom-wp__check {
  position: absolute;
  right: 3px;
  bottom: 2px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  opacity: 0;
}
.dsh-bloom-wp[data-active="true"] .dsh-bloom-wp__check { opacity: 1; }
.dsh-bloom-input {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,0.12));
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 20%);
  color: var(--dsw-alias-label-primary, #222);
  font-size: 12px;
  outline: none;
}
.dsh-bloom-input:focus {
  border-color: var(--dsw-alias-brand-primary, #4a90e2);
}
.dsh-bloom-mini {
  flex: 1;
  height: 26px;
  border-radius: 8px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,0.12));
  background: rgba(var(--bloom-morandi), 0.08);
  color: var(--dsw-alias-label-secondary, #666);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.dsh-bloom-mini:hover {
  background: rgba(var(--bloom-morandi), 0.18);
  color: var(--dsw-alias-label-primary, #222);
}

@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-trigger, .dsh-bloom-chevron, .dsh-bloom-option { transition: none !important; }
}

/* 窄屏降级：DSH 顶栏在 < 900px 时空间紧张，隐藏中文名只留色点+chevron，
   避免挤压 Session log 等原生控件。色点本身 12px 渐变辨识度足够。 */
@media (max-width: 900px) {
  .dsh-bloom-trigger__name { display: none; }
  .dsh-bloom-trigger { padding: 0 7px; gap: 4px; }
}
`

/**
 * 收拾裸露的 <think> 标签。
 *
 * ⚠️ 这是 workaround，不是根治。根因在 LLM 适配层：某些模型（如 MiniMax-M3）把思考
 * 内容内联在 content 里输出 <think>…</think>，而 DSH 的推理解析没识别它，于是整段
 * 当普通 markdown 渲染，标签就露在正文里。正解是在 provider 适配层解析成 reasoning
 * 字段，交给 DSH 原生的 ReasoningRow 渲染。
 *
 * 之所以敢在主题层做：实测这些标签**各自独占一个段落元素**（56/56，无一混在正文中），
 * 所以只标记、不改任何文本内容 —— 隐藏它们不会丢字。
 * 只加 data-* 属性，不动 DOM 结构，React 重渲染最多是属性丢失，observer 会补回来。
 */
const THINK_OPEN = '<think>'
const THINK_CLOSE = '</think>'

function markThinkTags() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const tags = []
  let n
  while ((n = walker.nextNode())) {
    const t = (n.nodeValue || '').trim()
    if (t !== THINK_OPEN && t !== THINK_CLOSE) continue
    const el = n.parentElement
    if (!el || el.dataset.bloomThink) continue
    el.dataset.bloomThink = t === THINK_OPEN ? 'open' : 'close'
    tags.push(el)
  }
  if (!tags.length) return
  // 配对：把开闭标签之间的兄弟节点标成思考内容（降权显示，不隐藏 —— 信息不丢）
  for (const el of tags) {
    if (el.dataset.bloomThink !== 'open') continue
    for (let sib = el.nextElementSibling; sib; sib = sib.nextElementSibling) {
      if (sib.dataset.bloomThink === 'close') break
      if (sib.dataset.bloomThink === 'open') break // 未配对，停手
      sib.dataset.bloomThinkBody = 'true'
    }
  }
}

function watchThinkTags() {
  if (window.__dshBloomThinkObserver__) return
  let timer = null
  const schedule = () => {
    // 流式输出会高频触发，节流到 300ms
    if (timer) return
    timer = setTimeout(() => { timer = null; markThinkTags() }, 300)
  }
  const obs = new MutationObserver(schedule)
  obs.observe(document.body, { childList: true, subtree: true, characterData: true })
  window.__dshBloomThinkObserver__ = obs
  markThinkTags()
}

/* ═══ 氛围层状态与渲染 ═══════════════════════════════════════════ */
function readAmbience() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(AMB_KEY) || '{}')
    return { ...AMB_DEFAULTS, ...(raw && typeof raw === 'object' ? raw : {}) }
  } catch { return { ...AMB_DEFAULTS } }
}

function writeAmbience(amb) {
  try { window.localStorage.setItem(AMB_KEY, JSON.stringify(amb)) } catch {}
}

/** 壁纸层 DOM：幂等创建，renderAmbience 只更新样式。 */
function ensureWallpaperLayer() {
  let img = document.querySelector('.dsh-bloom-wallpaper')
  let veil = document.querySelector('.dsh-bloom-wallpaper-veil')
  if (!img) {
    img = document.createElement('div')
    img.className = 'dsh-bloom-wallpaper'
    img.setAttribute('data-plugin', PLUGIN_ID)
    document.body.appendChild(img)
  }
  if (!veil) {
    veil = document.createElement('div')
    veil.className = 'dsh-bloom-wallpaper-veil'
    veil.setAttribute('data-plugin', PLUGIN_ID)
    document.body.appendChild(veil)
  }
  return { img, veil }
}

/** 解析当前应该用的壁纸 URL：custom > fixed > auto(随变体)。 */
function wallpaperUrl(amb, variant) {
  if (amb.mode === 'custom') return amb.custom || WALLPAPERS[variant] || ''
  if (amb.mode === 'fixed') return WALLPAPERS[amb.fixed] || WALLPAPERS[variant] || ''
  return WALLPAPERS[variant] || ''
}

/**
 * 把氛围层状态渲染到 DOM。applyVariant / 设置面板 / 主题包导入都走这里，
 * 保证只有一个写入口（SSOT），body 的 data-* 是唯一事实。
 */
function renderAmbience(variant) {
  const amb = readAmbience()
  const on = amb.enabled && !!wallpaperUrl(amb, variant)
  document.body.dataset.bloomWallpaper = on ? 'on' : 'off'
  document.body.dataset.bloomGlass = (on && amb.glass) ? 'on' : 'off'
  document.body.style.setProperty('--bloom-dim', String(Math.max(0, Math.min(0.8, amb.dim / 100))))
  document.body.style.setProperty('--bloom-glass-blur', String(Math.max(0, Math.min(40, amb.blur))) + 'px')
  if (on) {
    const { img } = ensureWallpaperLayer()
    img.style.backgroundImage = `url("${wallpaperUrl(amb, variant)}")`
  }
  // 面板里的控件状态同步（面板可能还没渲染，安全的可选更新）
  const panel = document.querySelector('.dsh-bloom-menu')
  if (panel) syncAmbiencePanel(panel, amb, variant)
}

function syncAmbiencePanel(panel, amb, variant) {
  const t = (sel) => panel.querySelector(sel)
  const wpToggle = t('[data-amb="enabled"]'); if (wpToggle) wpToggle.checked = amb.enabled
  const dim = t('[data-amb="dim"]'); if (dim) dim.value = amb.dim
  const glass = t('[data-amb="glass"]'); if (glass) glass.checked = amb.glass
  const blur = t('[data-amb="blur"]'); if (blur) blur.value = amb.blur
  const custom = t('[data-amb="custom"]'); if (custom && document.activeElement !== custom) custom.value = amb.mode === 'custom' ? amb.custom : ''
  panel.querySelectorAll('.dsh-bloom-wp').forEach((el) => {
    const m = el.dataset.ambMode
    const v = el.dataset.ambVariant
    const active = m === 'auto' ? amb.mode === 'auto'
      : m === 'custom' ? amb.mode === 'custom'
      : amb.mode === 'fixed' && amb.fixed === v
    el.setAttribute('data-active', String(active))
    el.setAttribute('aria-pressed', String(active))
  })
}

/** 设置面板里所有氛围控件的统一事件入口。 */
function bindAmbiencePanel(panel) {
  const update = (patch) => {
    const amb = { ...readAmbience(), ...patch }
    writeAmbience(amb)
    renderAmbience(readVariant())
  }
  panel.addEventListener('click', (e) => {
    const wp = e.target.closest('.dsh-bloom-wp')
    if (wp) {
      const m = wp.dataset.ambMode
      // 点缩略图 = 用户意图开启壁纸：顺带把总开关打开（只改 mode 不开 enabled
      // 的话，点了没反应——「切换背景主题无效」就是这么来的）。
      update(m === 'auto' ? { enabled: true, mode: 'auto' }
        : m === 'custom' ? { enabled: true, mode: 'custom' }
        : { enabled: true, mode: 'fixed', fixed: wp.dataset.ambVariant })
      return
    }
    if (e.target.closest('[data-amb="export"]')) { exportThemePack(); return }
    if (e.target.closest('[data-amb="import"]')) {
      const input = panel.querySelector('.dsh-bloom-import-file')
      if (input) input.click()
      return
    }
  })
  panel.addEventListener('change', (e) => {
    const el = e.target
    const k = el.dataset && el.dataset.amb
    if (!k) return
    if (k === 'enabled') update({ enabled: el.checked })
    if (k === 'glass') update({ glass: el.checked })
    if (k === 'dim') update({ dim: Number(el.value) || 0 })
    if (k === 'blur') update({ blur: Number(el.value) || 0 })
    if (k === 'custom') {
      // 填了自定义 URL = 意图开启；data: URL 可能超 localStorage 配额（5MB）——
      // 超了就提示并回落预设
      try {
        window.localStorage.setItem(AMB_KEY, JSON.stringify({ ...readAmbience(), enabled: true, mode: 'custom', custom: el.value.trim() }))
        renderAmbience(readVariant())
      } catch {
        el.value = ''
        update({ mode: 'auto' })
        el.placeholder = 'URL 过大，改用 http(s) 链接'
      }
    }
  })
  const file = panel.querySelector('.dsh-bloom-import-file')
  if (file) file.addEventListener('change', () => { importThemePack(file); file.value = '' })
}

/* ═══ 主题包导出 / 导入 ═══════════════════════════════════════════ */
const PACK_VERSION = 1

function exportThemePack() {
  const pack = {
    $schema: 'dsh-bloom-theme-pack',
    packVersion: PACK_VERSION,
    variant: readVariant(),
    ambience: readAmbience(),
    exportedAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `bloom-${pack.variant}-theme.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function importThemePack(fileInput) {
  const file = fileInput.files && fileInput.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const pack = JSON.parse(String(reader.result))
      if (pack.$schema !== 'dsh-bloom-theme-pack') throw new Error('not a bloom theme pack')
      if (VARIANTS.includes(pack.variant)) {
        window.localStorage.setItem(STORAGE_KEY, pack.variant)
        document.body.dataset.bloomVariant = pack.variant
      }
      const amb = pack.ambience
      if (amb && typeof amb === 'object') {
        // 白名单合并：未知字段丢弃，缺省字段回落默认值
        const next = { ...AMB_DEFAULTS }
        for (const k of Object.keys(AMB_DEFAULTS)) {
          if (typeof amb[k] === typeof AMB_DEFAULTS[k]) next[k] = amb[k]
        }
        writeAmbience(next)
      }
      applyVariant(readVariant()) // 变体切换器 UI + 氛围层一起刷新
    } catch {
      alert('主题包格式不对：需要 bloom 导出的 JSON')
    }
  }
  reader.readAsText(file)
}

function applyVariant(variant) {
  if (!VARIANTS.includes(variant)) variant = 'mist'
  document.body.dataset.bloomVariant = variant
  try { window.localStorage.setItem(STORAGE_KEY, variant) } catch {}
  const root = document.querySelector('.dsh-bloom-switcher')
  if (!root) return
  root.querySelectorAll('.dsh-bloom-option').forEach((el) => {
    const on = el.dataset.variant === variant
    el.setAttribute('data-active', String(on))
    el.setAttribute('aria-selected', String(on))
  })
  const name = root.querySelector('.dsh-bloom-trigger__name')
  if (name) name.textContent = VARIANT_LABELS[variant].zh
  const dot = root.querySelector('.dsh-bloom-trigger .dsh-bloom-dot')
  if (dot) dot.setAttribute('style', dotStyle(variant))
  // auto 模式下壁纸跟随变体切换
  renderAmbience(variant)
}

function readVariant() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return VARIANTS.includes(v) ? v : 'mist'
  } catch { return 'mist' }
}

function injectCSS(css, idSuffix) {
  const tagId = PLUGIN_ID + '/' + idSuffix
  if (document.querySelector('style[data-plugin-css="' + tagId + '"]')) return
  const tag = document.createElement('style')
  tag.dataset.plugin = PLUGIN_ID
  tag.dataset.pluginCss = tagId
  tag.textContent = css
  document.head.appendChild(tag)
}

/**
 * 挂载点：优先塞进 DSH 顶栏的工具区，跟 Session log 等原生控件并排。
 *
 * 之前用 position:fixed 浮在右上角，实测矩形与 Session log 按钮几乎完全重合，
 * 把人家整个盖住点不到 —— 浮层永远有压住宿主控件的风险，挂进 DOM 才是根治。
 * 找不到宿主时退回浮动，但位置移到 header 下方（见 [data-floating] 样式）。
 */
function findSwitcherHost() {
  // 必须限定在真顶栏（<header>）内部再找。
  //
  // 侧边栏「工作区」那一行也有个 [class*="_headerActions"] 容器（另一套 CSS Module
  // 前缀，实测 qDHVXG_headerActions vs 顶栏的 wSkVaW_headerActions），而它在 DOM 里
  // 排在顶栏之前 —— 不限定作用域时 document.querySelector 会先命中它，切换器就被
  // prepend 到左边侧边栏去了。新建会话时顶栏子树重建、_headerUtilities 短暂消失，
  // fallback 生效，于是「右上角的切换器跑到左边」。
  const header = document.querySelector('header[class*="_header"]') || document.querySelector('header')
  if (!header) return null
  return header.querySelector('[class*="_headerUtilities"]')
    || header.querySelector('[class*="_headerActions"]')
    || null
}

function closeMenu(root) {
  const menu = root.querySelector('.dsh-bloom-menu')
  const trigger = root.querySelector('.dsh-bloom-trigger')
  if (menu) menu.hidden = true
  if (trigger) trigger.setAttribute('aria-expanded', 'false')
}

function buildSwitcherEl(initialVariant) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = buildSwitcherHTML(initialVariant)
  const el = wrapper.firstElementChild

  const openMenu = () => {
    const menu = el.querySelector('.dsh-bloom-menu')
    const trigger = el.querySelector('.dsh-bloom-trigger')
    menu.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    // 打开时把焦点移到当前选中项，键盘用户立刻知道在哪
    const active = menu.querySelector('.dsh-bloom-option[data-active="true"]')
      || menu.querySelector('.dsh-bloom-option')
    active?.focus()
  }

  el.addEventListener('click', (e) => {
    const trigger = e.target.closest('.dsh-bloom-trigger')
    if (trigger) {
      const menu = el.querySelector('.dsh-bloom-menu')
      if (menu.hidden) openMenu()
      else closeMenu(el)
      return
    }
    const opt = e.target.closest('.dsh-bloom-option')
    if (opt) {
      applyVariant(opt.dataset.variant)
      closeMenu(el)
      el.querySelector('.dsh-bloom-trigger')?.focus()
    }
  })

  el.addEventListener('keydown', (e) => {
    const menu = el.querySelector('.dsh-bloom-menu')
    const trigger = el.querySelector('.dsh-bloom-trigger')
    const options = [...menu.querySelectorAll('.dsh-bloom-option')]
    const idx = options.indexOf(document.activeElement)

    // 氛围区的文本框/滑杆里，键盘交给输入框本身（只保留 Escape 收起）
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      if (e.key === 'Escape') { closeMenu(el); trigger?.focus() }
      return
    }

    // trigger 上的键盘交互：↓/Enter/Space 打开菜单
    if (document.activeElement === trigger && menu.hidden) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openMenu()
      }
      return
    }

    if (menu.hidden) return

    switch (e.key) {
      case 'Escape':
        closeMenu(el)
        trigger?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        options[(idx + 1) % options.length]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        options[(idx - 1 + options.length) % options.length]?.focus()
        break
      case 'Home':
        e.preventDefault()
        options[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        options[options.length - 1]?.focus()
        break
      case 'Enter':
      case ' ':
        if (idx >= 0) {
          e.preventDefault()
          applyVariant(options[idx].dataset.variant)
          closeMenu(el)
          trigger?.focus()
        }
        break
      case 'Tab':
        // Tab 离开菜单时关闭，避免焦点困在隐藏菜单里
        closeMenu(el)
        break
    }
  })

  // 选项做成可聚焦（listbox 语义要求 option 可接收焦点）
  el.querySelectorAll('.dsh-bloom-option').forEach((opt) => {
    opt.setAttribute('tabindex', '-1')
  })

  // 氛围区控件（壁纸/玻璃/主题包）——委托绑定，重挂后随新元素重建
  const menu = el.querySelector('.dsh-bloom-menu')
  if (menu) bindAmbiencePanel(menu)

  // 点击外部关闭。挂 document 上，用 el.contains 判断而不是 blur ——
  // blur 会在点菜单项时先触发，导致选不中。
  document.addEventListener('click', (e) => {
    if (!el.contains(e.target)) closeMenu(el)
  })
  return el
}

function injectSwitcher(initialVariant) {
  injectCSS(SWITCHER_CSS, 'switcher.css')
  const existing = document.querySelector('.dsh-bloom-switcher')
  const host = findSwitcherHost()
  if (existing) {
    // 已存在但宿主出现了（首屏时 header 还没渲染），迁进去
    if (host && !host.contains(existing)) {
      existing.dataset.floating = 'false'
      host.prepend(existing)
    }
    return
  }
  const el = buildSwitcherEl(initialVariant)
  if (host) {
    el.dataset.floating = 'false'
    host.prepend(el)
  } else {
    el.dataset.floating = 'true'
    document.body.appendChild(el)
  }
}

/**
 * DSH 是 SPA，切会话/改布局会重建 header 子树，把切换器一起删掉。
 * 这里监听并重挂 —— 否则切一次会话主题按钮就没了。
 */
function watchSwitcher(variant) {
  if (window.__dshBloomObserver__) return
  const reattach = () => {
    if (!document.body) return
    document.body.dataset.bloomVariant = document.body.dataset.bloomVariant || variant
    injectSwitcher(readVariant())
  }
  const obs = new MutationObserver(() => {
    const el = document.querySelector('.dsh-bloom-switcher')
    const host = findSwitcherHost()
    // 节点没了，或宿主已就绪但切换器还浮着 → 重挂
    if (!el || (host && !host.contains(el))) reattach()
  })
  obs.observe(document.body, { childList: true, subtree: true })
  window.__dshBloomObserver__ = obs
}

/** 顶层立即注入 —— 不依赖 factory materialize（dsh-client-modules 的 lazy CJS 在
 *  没有 import 的情况下 factory 不会被调用，CSS/switcher 永远不跑）。所以：
 * script 一加载就跑（同时给 factory 留 fallback）。 */
;(function() {
  if (typeof document === 'undefined') return
  const variant = readVariant()
  injectCSS(buildBloomCSS(), 'bloom.css')
  injectCSS(COMPONENT_CSS, 'components.css')
  injectCSS(AMBIENCE_CSS, 'ambience.css')
  const boot = () => {
    document.body.dataset.bloomVariant = variant
    injectSwitcher(variant)
    renderAmbience(variant)
    // header 通常晚于脚本渲染 —— 交给 observer 在宿主就绪后迁进去
    watchSwitcher(variant)
    watchThinkTags()
  }
  if (document.body) boot()
  else document.addEventListener('DOMContentLoaded', boot)
})()

/** 开发期自动刷新 —— 仅在本地 localhost 启用，线上用户不受影响。
 *
 * 解决痛点：bloom 插件的 client.js 一旦加载进浏览器就常驻 JS 上下文，
 * 我本地 rsync 部署后页面不会自动拿新代码，必须 hard reload 才能验证。
 *
 * 实现：找到加载本插件的 <script> 标签，HEAD 请求同一 URL，对比
 * Last-Modified / ETag —— 不一致就 location.reload()。?noreload=1 关掉。
 *
 * 不放在 watchSwitcher 里：切换器是可选组件；reload 是纯文件监控，跟切换器无关。
 */
;(function installAutoReload() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  // 仅本地开发；线上用户用 bloom 不该被自动 reload 打断。
  const host = location.hostname
  if (host !== '127.0.0.1' && host !== 'localhost') return
  // 一键关
  if (location.search.includes('noreload=1')) return

  // 找自己：含 bloom 关键字的最后一个 <script src>
  const myUrl = [...document.querySelectorAll('script[src]')]
    .filter(s => s.src.includes('@kubor/dsh-bloom-theme'))
    .map(s => s.src)
    .pop()
  if (!myUrl) return

  let initialKey = null
  const capture = (r) => r.headers.get('etag') || r.headers.get('last-modified') || null

  const check = async () => {
    try {
      const r = await fetch(myUrl, { cache: 'no-store', method: 'HEAD' })
      const key = capture(r)
      if (key === null) return                       // 服务器没给对比依据，跳过
      if (initialKey === null) { initialKey = key; return }
      if (key !== initialKey) location.reload()
    } catch (_) { /* 网络抖动忽略 */ }
  }
  check()                                            // 首次记录基线
  setInterval(check, 3000)                           // 3 秒一次，HEAD 通常 < 1ms
})()

/**
 * 向 DSH 的 client loader 注册。
 *
 * ⚠️ 契约（踩过坑，别再改错地方）：factory 的返回值会被 cordis 当插件 apply，
 * 必须是「函数」或「带 apply 方法的对象」。返回裸 `{}` 会让整个 DSH 启动失败：
 *     invalid plugin, expect function or object with an "apply" method, received object
 * 这个报错跟 lib/index.js 的 ESM 导出格式无关 —— 它发生在浏览器端。
 * 参照实现见 @oil-oil/dsh-vision/lib/client.js 末尾（exports.apply = apply）。
 */
window.__ModuleLoader__.load({
  id: PLUGIN_ID,
  factory: () => {
    const exports = {}
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    exports.apply = function apply() {
      // 顶层 IIFE 已注入；此处兜底：cordis materialize 时再确认一次。
      if (typeof document === 'undefined') return
      const variant = readVariant()
      if (!document.querySelector('style[data-plugin-css="' + PLUGIN_ID + '/bloom.css"]')) {
        injectCSS(buildBloomCSS(), 'bloom.css')
      }
      if (!document.querySelector('style[data-plugin-css="' + PLUGIN_ID + '/components.css"]')) {
        injectCSS(COMPONENT_CSS, 'components.css')
      }
      if (!document.querySelector('style[data-plugin-css="' + PLUGIN_ID + '/ambience.css"]')) {
        injectCSS(AMBIENCE_CSS, 'ambience.css')
      }
      document.body.dataset.bloomVariant = variant
      injectSwitcher(variant)
      renderAmbience(variant)
      watchSwitcher(variant)
      watchThinkTags()
    }

    return exports
  },
})
