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
const PLUGIN_ID = '@webkubor/dsh-bloom-theme'

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
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bgL}, ${txL} 2%);
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
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bgD}, black 4%);
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
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bg}, ${dark ? 'black' : tx} ${dark ? 4 : 2}%);
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

/* 侧栏：右侧一道冷光竖线，代替生硬的 border */
[class*="_sidebarCol"] {
  position: relative;
  box-shadow: 1px 0 0 var(--bloom-hairline), 8px 0 32px -10px var(--bloom-glow);
}

/* 顶栏下沿冷光线 —— 标题区与消息流之间的分界，比实色 border 轻。
   只给 tabs 这一条真正的分界线：_header 会同时命中 headerActions /
   headerUtilities 等右上角子容器，给它们加投影会凭空多出几个浮块。 */
div[class*="_tabs"] {
  box-shadow: 0 1px 0 var(--bloom-hairline), 0 6px 20px -12px var(--bloom-glow);
}

/* 消息卡 / 工具调用行：只给轻描边，不给阴影 —— 数量多（一次会话 30+ 个），
   加长距阴影会把整个消息流糊成一片。全部限定 div，否则会命中 SVG 元素。 */
div[class*="_card"],
div[class*="_toolRow"],
div[class*="_panel"] {
  border-radius: 10px;
  border: 1px solid var(--bloom-hairline);
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
pre {
  border-radius: 12px;
  border: 1px solid var(--bloom-hairline);
  box-shadow: var(--bloom-shadow-sm);
}
pre code {
  border-radius: 0;
  background: transparent;
}

/* 表格：横向冷光分隔，去掉重边框 */
table { border-radius: 10px; overflow: hidden; }
th, td { border-color: var(--bloom-hairline) !important; }
thead th {
  background: rgba(var(--bloom-morandi), 0.1);
  border-bottom: 1px solid var(--bloom-hairline-strong) !important;
}

/* 选中文本：原版用 accent 混 80%，比 DSH 默认的 85% 更实，能看清 */
::selection {
  background: color-mix(in oklch, var(--bloom-accent), transparent 78%);
}

/* ═══ 4. 无障碍 ═══════════════════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  [class*="_card"],
  .dsh-bloom-switcher,
  .dsh-bloom-switcher .dsh-bloom-swatch {
    transition: none !important;
  }
}
`

/** 顶栏切换器：4 个圆形色块按钮 + 当前选中高亮。浮动右上角，毛玻璃底。 */
function buildSwitcherHTML(currentVariant) {
  const buttons = VARIANTS.map((v) => {
    const p = PALETTE[v]
    const label = VARIANT_LABELS[v].zh
    const on = v === currentVariant
    // 色块渐变用「莫兰迪 → 可读色」两轨，而不是渐变到背景近白色 ——
    // 后者会让色块右下角褪成白，四个球辨识度只剩左上一半。
    const swatchBg = `linear-gradient(135deg, rgb(${p.morandi}) 0%, ${p.accentL} 100%)`
    return `<button type="button" class="dsh-bloom-swatch" data-variant="${v}"` +
      ` data-active="${on}" role="radio" aria-checked="${on}"` +
      ` aria-label="${label}" title="${label}" style="background:${swatchBg}"></button>`
  }).join('')
  return `<div class="dsh-bloom-switcher" data-plugin="${PLUGIN_ID}">
  <span class="dsh-bloom-switcher__label">Bloom · ${VARIANT_LABELS[currentVariant].zh}</span>
  <div class="dsh-bloom-switcher__row" role="radiogroup" aria-label="Bloom 主题变体">${buttons}</div>
</div>`
}

const SWITCHER_CSS = `
.dsh-bloom-switcher {
  position: fixed;
  top: 10px;
  right: 14px;
  z-index: 9999;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 4px 10px;
  border-radius: 999px;
  /* 透到 28% 毛玻璃才真的有东西可糊 —— 原来只透 6%，blur(10px) 等于白交 */
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 28%);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  /* 冷光描边，跟全局线条语言一致 */
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,0.08));
  /* ⚠️ 不要用 currentColor 做阴影：currentColor 继承自 label-secondary（前景色），
     深色主题下前景≈近白，阴影会变成一圈白色光晕。阴影必须用背景侧的色。 */
  box-shadow: var(--bloom-shadow-sm), 0 0 0 1px rgba(var(--bloom-morandi), 0.06);
  font: 11px/1.2 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--dsw-alias-label-secondary, #555);
  user-select: none;
  cursor: default;
  transition: box-shadow 0.2s, background 0.2s;
}
.dsh-bloom-switcher:hover {
  box-shadow: var(--bloom-shadow), 0 0 0 1px var(--bloom-hairline);
}
.dsh-bloom-switcher__label {
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--dsw-alias-label-primary, #222);
}
.dsh-bloom-switcher__row { display: inline-flex; gap: 5px; align-items: center; }
.dsh-bloom-switcher .dsh-bloom-swatch {
  width: 18px; height: 18px; border-radius: 999px; padding: 0;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s;
}
.dsh-bloom-switcher .dsh-bloom-swatch:hover { transform: scale(1.2); }
.dsh-bloom-switcher .dsh-bloom-swatch[data-active="true"] {
  border-color: var(--dsw-alias-bg-layer-1, #fff);
  box-shadow: 0 0 0 1.5px var(--dsw-alias-brand-primary, #4a90e2);
  transform: scale(1.15);
}
/* 键盘可达：原来写了 outline:none 且无替代，键盘用户完全看不到焦点在哪 */
.dsh-bloom-switcher .dsh-bloom-swatch:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4a90e2);
  outline-offset: 3px;
}
`

function applyVariant(variant) {
  if (!VARIANTS.includes(variant)) variant = 'mist'
  document.body.dataset.bloomVariant = variant
  try { window.localStorage.setItem(STORAGE_KEY, variant) } catch {}
  const root = document.querySelector('.dsh-bloom-switcher')
  if (root) {
    root.querySelectorAll('.dsh-bloom-swatch').forEach((el) => {
      const on = el.dataset.variant === variant
      el.setAttribute('data-active', String(on))
      el.setAttribute('aria-checked', String(on))
    })
    const label = root.querySelector('.dsh-bloom-switcher__label')
    if (label) label.textContent = 'Bloom · ' + VARIANT_LABELS[variant].zh
  }
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

function injectSwitcher(initialVariant) {
  if (document.querySelector('.dsh-bloom-switcher')) return
  injectCSS(SWITCHER_CSS, 'switcher.css')
  const wrapper = document.createElement('div')
  wrapper.innerHTML = buildSwitcherHTML(initialVariant)
  const el = wrapper.firstElementChild
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.dsh-bloom-swatch')
    if (!btn) return
    applyVariant(btn.dataset.variant)
  })
  document.body.appendChild(el)
}

/** 顶层立即注入 —— 不依赖 factory materialize（dsh-client-modules 的 lazy CJS 在
 *  没有 import 的情况下 factory 不会被调用，CSS/switcher 永远不跑）。所以：
 * script 一加载就跑（同时给 factory 留 fallback）。 */
;(function() {
  if (typeof document === 'undefined') return
  const variant = readVariant()
  injectCSS(buildBloomCSS(), 'bloom.css')
  injectCSS(COMPONENT_CSS, 'components.css')
  const boot = () => {
    document.body.dataset.bloomVariant = variant
    injectSwitcher(variant)
  }
  if (document.body) boot()
  else document.addEventListener('DOMContentLoaded', boot)
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
      if (!document.querySelector('.dsh-bloom-switcher')) {
        document.body.dataset.bloomVariant = variant
        injectSwitcher(variant)
      }
    }

    return exports
  },
})
