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

const VARIANTS = ['mist', 'cinnabar', 'petal', 'ripple', 'sage', 'stone', 'lapis', 'amber']
const OTHER_VARIANTS = ['cinnabar', 'petal', 'ripple', 'sage', 'stone', 'lapis', 'amber']
const STORAGE_KEY = 'dsh-bloom-variant'
const PLUGIN_ID = '@kubor/dsh-bloom-theme'
/** 当前装的版本 —— 由 release-please 在 release PR 里连同 package.json 一起 bump
 *  （靠行尾的 x-release-please-version 标记，见 release-please-config.json 的
 *  extra-files）。本地 dev 另有 scripts/sync-version.mjs 做兜底同步。勿手改。 */
const PLUGIN_VERSION = '0.7.0' // x-release-please-version
/** npm 上最新版本（异步拉取，null=未知/失败） */
let latestVersion = null

/**
 * 主视觉（v0.5.0）：玻璃 + 莫兰迪配色 —— 不再有壁纸/氛围层。
 * 面板玻璃化全部由 GLASS_CSS 驱动（半透底 + backdrop blur + 玻璃边缘），
 * 背景是 body 的莫兰迪氛围渐变；方案见文件头部说明 & GLASS_CSS 注释。
 */

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
    motionL: ['oklch(50% 0.08 240)', 'oklch(50% 0.10 210)', 'oklch(50% 0.09 275)'],
    motionD: ['oklch(72% 0.12 240)', 'oklch(74% 0.13 210)', 'oklch(74% 0.11 275)'],
  },
  cinnabar: {
    accentL: 'oklch(55% 0.18 25)',   accentD: 'oklch(72% 0.12 25)',
    morandi: '215, 75, 75',
    bgL: 'oklch(97% 0.005 25)',      bgD: 'oklch(28% 0.02 25)',
    txL: 'oklch(25% 0.02 25)',       txD: 'oklch(96% 0.01 25)',
    sfL: 'oklch(95% 0.005 25)',      sfD: 'oklch(34% 0.02 25)',
    sf2L: 'oklch(92% 0.005 25)',     sf2D: 'oklch(40% 0.02 25)',
    motionL: ['oklch(55% 0.18 25)', 'oklch(55% 0.16 65)', 'oklch(55% 0.15 350)'],
    motionD: ['oklch(72% 0.12 25)', 'oklch(74% 0.14 65)', 'oklch(73% 0.13 350)'],
  },
  petal: {
    accentL: 'oklch(58% 0.22 350)',  accentD: 'oklch(75% 0.18 350)',
    morandi: '232, 133, 155',
    bgL: 'oklch(98% 0.01 350)',      bgD: 'oklch(28% 0.02 350)',
    txL: 'oklch(25% 0.02 354)',      txD: 'oklch(98% 0.01 350)',
    sfL: 'oklch(96% 0.015 350)',     sfD: 'oklch(34% 0.02 350)',
    sf2L: 'oklch(94% 0.015 350)',    sf2D: 'oklch(40% 0.02 350)',
    motionL: ['oklch(58% 0.22 350)', 'oklch(58% 0.17 310)', 'oklch(58% 0.17 20)'],
    motionD: ['oklch(75% 0.18 350)', 'oklch(75% 0.14 310)', 'oklch(76% 0.14 20)'],
  },
  ripple: {
    accentL: 'oklch(51% 0.12 195)',  accentD: 'oklch(75% 0.12 195)',
    morandi: '95, 168, 178',
    bgL: 'oklch(96% 0.01 195)',      bgD: 'oklch(20% 0.02 195)',
    txL: 'oklch(25% 0.02 195)',      txD: 'oklch(96% 0.01 195)',
    sfL: 'oklch(94% 0.01 195)',      sfD: 'oklch(28% 0.02 195)',
    sf2L: 'oklch(92% 0.01 195)',     sf2D: 'oklch(38% 0.02 195)',
    motionL: ['oklch(51% 0.12 195)', 'oklch(51% 0.13 225)', 'oklch(51% 0.11 165)'],
    motionD: ['oklch(75% 0.12 195)', 'oklch(76% 0.14 225)', 'oklch(77% 0.12 165)'],
  },
  /* v0.5.0 新增（源自 typora-Bloom-theme 成功变体）：
     色值由 Typora dist/*.css 的 accent/bg/surface/text 直接转 oklch，hue 对齐原版 */
  sage: {
    accentL: 'oklch(54.1% 0.111 115)',  accentD: 'oklch(71.9% 0.120 115)',
    morandi: '138, 154, 91',
    bgL: 'oklch(97% 0.011 112)',      bgD: 'oklch(20% 0.019 113)',
    txL: 'oklch(25% 0.02 116)',       txD: 'oklch(96% 0.011 118)',
    sfL: 'oklch(94.9% 0.009 113)',    sfD: 'oklch(27.9% 0.02 116)',
    sf2L: 'oklch(91.9% 0.009 113)',   sf2D: 'oklch(34% 0.03 116)',
    motionL: ['oklch(54.1% 0.111 115)', 'oklch(54.1% 0.12 83)', 'oklch(54.1% 0.10 152)'],
    motionD: ['oklch(71.9% 0.120 115)', 'oklch(71.9% 0.13 83)', 'oklch(71.9% 0.11 152)'],
  },
  stone: {
    accentL: 'oklch(49.9% 0.06 29)',   accentD: 'oklch(75% 0.12 30)',
    morandi: '180, 160, 155',
    bgL: 'oklch(95.9% 0.01 25)',      bgD: 'oklch(20.1% 0.019 30)',
    txL: 'oklch(25% 0.02 29)',        txD: 'oklch(95.9% 0.01 25)',
    sfL: 'oklch(94.1% 0.01 33)',      sfD: 'oklch(27.9% 0.02 28)',
    sf2L: 'oklch(91% 0.01 33)',       sf2D: 'oklch(33.9% 0.03 28)',
    motionL: ['oklch(49.9% 0.06 29)', 'oklch(49.9% 0.075 0)', 'oklch(49.9% 0.07 60)'],
    motionD: ['oklch(75% 0.12 30)', 'oklch(75% 0.13 0)', 'oklch(75% 0.11 62)'],
  },
  lapis: {
    accentL: 'oklch(50% 0.13 258)',   accentD: 'oklch(74% 0.10 255)',
    morandi: '47, 98, 172',
    bgL: 'oklch(97.4% 0.006 240)',    bgD: 'oklch(23.1% 0.019 249)',
    txL: 'oklch(23% 0.02 249)',       txD: 'oklch(96.1% 0.008 237)',
    sfL: 'oklch(95.6% 0.008 242)',    sfD: 'oklch(30.1% 0.022 251)',
    sf2L: 'oklch(92.4% 0.013 244)',   sf2D: 'oklch(35.9% 0.025 251)',
    motionL: ['oklch(50% 0.13 258)', 'oklch(50% 0.12 226)', 'oklch(50% 0.11 295)'],
    motionD: ['oklch(74% 0.10 255)', 'oklch(74% 0.11 225)', 'oklch(74% 0.10 292)'],
  },
  amber: {
    accentL: 'oklch(55.5% 0.12 70)',  accentD: 'oklch(75.9% 0.11 70)',
    morandi: '159, 100, 1',
    bgL: 'oklch(97.5% 0.008 74)',     bgD: 'oklch(21.9% 0.021 56)',
    txL: 'oklch(24% 0.02 74)',        txD: 'oklch(96.1% 0.012 75)',
    sfL: 'oklch(95.6% 0.01 82)',      sfD: 'oklch(29.1% 0.023 61)',
    sf2L: 'oklch(93% 0.014 78)',      sf2D: 'oklch(35.2% 0.025 59)',
    motionL: ['oklch(55.5% 0.12 70)', 'oklch(55.5% 0.11 38)', 'oklch(55.5% 0.12 100)'],
    motionD: ['oklch(75.9% 0.11 70)', 'oklch(75.9% 0.12 38)', 'oklch(75.9% 0.11 100)'],
  },
}

const VARIANT_LABELS = {
  mist:     { zh: '雾蓝', en: 'Mist' },
  cinnabar: { zh: '朱砂', en: 'Cinnabar' },
  petal:    { zh: '花瓣', en: 'Petal' },
  ripple:   { zh: '涟漪', en: 'Ripple' },
  sage:     { zh: '鼠尾草', en: 'Sage' },
  stone:    { zh: '暖石', en: 'Stone' },
  lapis:    { zh: '青金', en: 'Lapis' },
  amber:    { zh: '琥珀', en: 'Amber' },
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
  const motion = dark ? p.motionD : p.motionL
  return `
  --bloom-morandi: ${m};
  --bloom-accent: ${dark ? p.accentD : p.accentL};
  --bloom-motion-1: ${motion[0]};
  --bloom-motion-2: ${motion[1]};
  --bloom-motion-3: ${motion[2]};
  /* ⚠️ 阴影在暗色下必须用纯黑，不能用前景色混透明度 ——
     暗色的 --text 是近白，mix 出来的"阴影"会变成一团白雾贴在深色背景上。
     原版 root-*-dark.css 同样是写死 rgba(0,0,0,.4~.6)，只有亮色才用 text 混。 */
  --bloom-shadow-sm: 0 2px 8px ${dark ? 'rgba(0,0,0,0.4)' : mix(tx, 96)};
  --bloom-shadow: 0 10px 30px ${dark ? 'rgba(0,0,0,0.5)' : mix(tx, 94)};
  --bloom-shadow-lg: 0 24px 60px ${dark ? 'rgba(0,0,0,0.6)' : mix(tx, 90)};
  /* DSH 的品牌蓝 #679efe(--dsw-alias-state-business-primary)用在顶栏
     「对话 / 轨迹」tab 的选中文字与下划线等处。主题必须接管它,否则 8 套配色
     切来切去,那条选中下划线永远是蓝的、跟主色打架(用户实拍反馈)。
     注意只接管 alias 层 —— --dsw-static-deepseek-400 是 DSH 的品牌标识色,
     不属于主题可覆盖范围。 */
  --dsw-alias-state-business-primary: ${dark ? p.accentD : p.accentL};
  --bloom-hairline: rgba(${m}, ${dark ? 0.3 : 0.3});
  --bloom-hairline-strong: rgba(${m}, ${dark ? 0.55 : 0.5});
  --bloom-glow: rgba(${m}, ${dark ? 0.34 : 0.2});
  /* v0.5.0：提亮氛围渐变 —— 玻璃面板要透出底色，需要背景更有"存在感"。
     亮色 0.18/0.12、暗色 0.26/0.18，过强会脏，过弱玻璃没东西可透。 */
  --bloom-veil-1: rgba(${m}, ${dark ? 0.26 : 0.18});
  --bloom-veil-2: rgba(${m}, ${dark ? 0.18 : 0.12});
  --bloom-code-bg: rgba(${m}, ${dark ? 0.16 : 0.13});
  --bloom-code-fg: ${dark ? p.txD : p.txL};`
}

/**
 * mist 亮色：完整接管 alias 语义 + specific 组件。
 * 这是骨架 —— 其它变体只覆盖「主色 + 背景调」相关的行。
 */
/**
 * border 阶梯（l1 最淡 → l4 最强）—— **暗色必须走 morandi 气质轨**。
 *
 * 这是「前景色 token 当背景/边框用」这个反模式的第三次复发（前两次是
 * markdown-inline-code 和 --bloom-shadow，见 DEV_NOTES 2026-08-18）：
 * 暗色的 tx 是近白 oklch(96%)，`mix(tx, 58%)` 得到 42% 不透明的近白 ——
 * 在莫兰迪暗底上就是一圈扎眼的白框（用户实拍反馈：「白色边框很突兀」）。
 *
 * 暗色改用 rgba(morandi, α)：morandi 是中等亮度的低饱和主题色（如 sage
 * 是 138,154,91 灰绿），同样的可见度但不刺眼，且边框跟着变体走色相 ——
 * 这正是 --bloom-hairline 一直在用的思路，只是 border 阶梯漏了。
 * 亮色仍用 mix(tx)：亮色的 tx 是深色，当边框是对的。
 *
 * 抽成一个函数是因为这四行原本在 mistLight / mistDark / variantBlock
 * **三处**各写一遍 —— 本项目已经因为「三处只改了两处」让 ripple/petal
 * 继承过 mist 的错误值（DEV_NOTES 2026-08-18）。现在只有一个真源。
 */
function borderStack(p, dark) {
  const m = p.morandi
  const tx = dark ? p.txD : p.txL
  return dark
    ? `  --dsw-alias-border-l1: rgba(${m}, 0.10);
  --dsw-alias-border-l2: rgba(${m}, 0.18);
  --dsw-alias-border-l3: rgba(${m}, 0.28);
  --dsw-alias-border-l4: rgba(${m}, 0.40);`
    : `  --dsw-alias-border-l1: ${mix(tx, 90)};
  --dsw-alias-border-l2: ${mix(tx, 80)};
  --dsw-alias-border-l3: ${mix(tx, 70)};
  --dsw-alias-border-l4: ${mix(tx, 60)};`
}

/**
 * 次级文字层级（secondary → tertiary → caption → dimmed，依次更弱）。
 *
 * 和 borderStack 一样，这四行原本在 mistLight / mistDark / variantBlock **三处**
 * 各写一遍，而且亮色档的顺序是乱的：caption 给了 40%、比 tertiary 的 45% 更**不**
 * 透明 —— 说明三处分别改过、没人对齐。
 *
 * 亮色档实测（canvas 取真实 sRGB 值算 WCAG，sage 亮色）：
 *   mix(tx, 45) → 3.46:1   mix(tx, 40) → 4.16:1   都够不上 AA 的 4.5:1
 * README 挂着 WCAG AA 徽章，这里必须达标，所以亮色重新分档到 28/32/35/37
 * （反推自 ratio ≥ 4.5 所需的 alpha ≈ 0.63），层级仍单调递减，只是整体压缩。
 *
 * 暗色档原为 35/45/48/58。前三档没问题（≥ 5:1），但 dimmed 的 58%（= 42% 不透明
 * 近白）在 8 个变体的暗底上只有 3.53~3.78 —— 8/8 全部不及格。dimmed 用在时间戳、
 * 「展开其余 N 个会话」这类**有意义**的信息上，不是纯装饰，所以必须达标。
 * 反推 ratio ≥ 4.5 需要 alpha ≈ 0.57，于是整条阶梯上移到 30/35/40/43。
 *
 * 注意保持单调递减 —— 这个档位修过一次「暗色三档塌成一档」
 * （曾是 35/45/30/35，caption 比 secondary 还亮，见 DEV_NOTES 2026-08-18）。
 * 上移后跨度从 23 收窄到 13，层级仍在（alpha 0.70/0.65/0.60/0.57），
 * 但已经没有再压缩的余地了：再靠近就会重演塌成一档。
 */
function labelStack(p, dark) {
  const tx = dark ? p.txD : p.txL
  return dark
    ? `  --dsw-alias-label-secondary: ${mix(tx, 30)};
  --dsw-alias-label-tertiary: ${mix(tx, 35)};
  --dsw-alias-label-caption: ${mix(tx, 40)};
  --dsw-alias-label-dimmed: ${mix(tx, 43)};`
    : `  --dsw-alias-label-secondary: ${mix(tx, 28)};
  --dsw-alias-label-tertiary: ${mix(tx, 32)};
  --dsw-alias-label-caption: ${mix(tx, 35)};
  --dsw-alias-label-dimmed: ${mix(tx, 37)};`
}

/**
 * 三处共用的 --dsw-* token（状态色 / 反色 / toast / tooltip / 遮罩）。
 *
 * 为什么要抽出来：这 22 个 token 原本只在 mistLight / mistDark 定义，
 * **variantBlock 一个都没有** —— 于是除 mist 之外的 7 个变体
 * （cinnabar/petal/ripple/sage/stone/lapis/amber）全部回落到 DSH 原生值：
 * 错误红实测是 DSH 的 #ec1313（4.13:1，够不上 AA），tooltip 是蓝灰
 * oklch(30% 0.02 240)，跟莫兰迪色相完全不搭。
 *
 * 更隐蔽的是 --dsw-alias-state-business-primary：bloomTokens 已把它接管成
 * accent，但 mist 块里还留着旧的蓝色定义 oklch(62% 0.1 250)，同一选择器内
 * 后写的赢 —— 结果「顶栏 tab 选中色跟主题」这个修复在 7 个变体生效、
 * 偏偏 mist（默认变体！）不生效。这类「三处定义漂移」是本仓反复出血的地方，
 * 现在 borderStack / labelStack / sharedDswTokens 三个函数把它收干净了。
 *
 * 状态色顺手修了亮色档对比度（canvas 取真实 sRGB 值实测）：
 *   success oklch(70%) → 2.0:1   warn oklch(75%) → 1.7:1   error oklch(60%) → 2.9:1
 * 三个在亮底上全部不及格，亮色统一压到 45% 左右（≈4.5:1 起）。
 * 暗色档大多本来就有 5~9:1，唯一例外是 error：oklch(62%) 在几个偏亮的暗底变体上
 * 只有 3.74~4.46（mist/cinnabar/petal/lapis/amber 实测），提到 72% 后 16 组全过。
 * 状态色保持红/绿/黄语义色相，不跟 accent 走 —— 「成功」不该因为切了个配色
 * 就变成绿色以外的东西。
 */
function sharedDswTokens(p, dark) {
  const bg = dark ? p.bgD : p.bgL
  const tx = dark ? p.txD : p.txL
  const ok = dark ? 'oklch(72% 0.12 150)' : 'oklch(45% 0.14 150)'
  const err = dark ? 'oklch(72% 0.16 25)' : 'oklch(45% 0.16 25)'
  const warn = dark ? 'oklch(80% 0.12 75)' : 'oklch(45% 0.11 75)'
  const t = (c, pct) => `color-mix(in oklch, ${c}, transparent ${pct}%)`
  return `
  /* 状态色（语义色相固定，明暗分档，两档都过 WCAG AA） */
  --dsw-alias-state-success-primary: ${ok};
  --dsw-alias-state-success-secondary: ${t(ok, dark ? 82 : 88)};
  --dsw-alias-state-success-tertiary: ${t(ok, dark ? 90 : 94)};
  --dsw-alias-state-error-primary: ${err};
  --dsw-alias-state-error-secondary: ${t(err, dark ? 82 : 88)};
  --dsw-alias-state-warn-primary: ${warn};
  --dsw-alias-state-warn-secondary: ${t(warn, dark ? 82 : 88)};
  --dsw-alias-state-warn-tertiary: ${t(warn, dark ? 90 : 94)};
  --dsw-alias-state-warn-label: ${dark ? 'oklch(88% 0.1 75)' : 'oklch(40% 0.09 75)'};
  --dsw-alias-interactive-bg-hover-danger: ${t(err, dark ? 86 : 90)};
  /* business = 主题 accent（bloomTokens 里已接管，这里给 tertiary 配套） */
  --dsw-alias-state-business-tertiary: ${mix(dark ? p.accentD : p.accentL, dark ? 86 : 92)};
  /* 反色 / 浮层 —— 跟着变体的 bg / tx 走，不再是硬编码蓝灰 */
  --dsw-alias-border-inverted: ${mix(bg, dark ? 85 : 85)};
  --dsw-alias-border-inverted2: ${mix(bg, dark ? 70 : 70)};
  --dsw-alias-label-primary-inverted: ${bg};
  --dsw-alias-button-contrast-fill: ${tx};
  --dsw-alias-button-elevated-fill: ${bg};
  --dsw-alias-button-tool-bar-fill-invisible: transparent;
  --dsw-alias-markdown-code-block-banner: ${mix(tx, 96)};
  /* tooltip / toast 两档都要是「深底浅字」：亮色拿 tx 压深，暗色拿 bg 压更深 */
  --dsw-alias-tooltip-bg: color-mix(in oklch, ${dark ? bg : tx}, black ${dark ? 22 : 8}%);
  --dsw-alias-toast-bg: color-mix(in oklch, ${dark ? bg : tx}, black ${dark ? 22 : 8}%);
  --dsw-alias-bg-mask-photo: color-mix(in oklch, ${bg}, black ${dark ? 45 : 30}%);`
}

function mistLight(p) {
  const { accentL: aL, bgL, txL, sfL, sf2L } = p
  return `
/* ─── Bloom · mist 雾蓝 亮色（默认 + body[data-bloom-variant=mist]）─────────── */
body, body[data-bloom-variant="mist"] {${bloomTokens(p, false)}${sharedDswTokens(p, false)}
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
  --dsw-alias-label-primary: ${txL};
  --dsw-alias-label-primary-bluish: ${txL};
  --dsw-alias-label-primary-dimmed: ${mix(txL, 25)};
  --dsw-alias-label-primary-foreground: ${bgL};
${labelStack(p, false)}
  --dsw-alias-brand-primary: ${aL};
  --dsw-alias-brand-primary-invert: ${bgL};
  --dsw-alias-brand-text: ${bgL};
${borderStack(p, false)}
  --dsw-alias-button-primary-fill: ${aL};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aL}, black 8%);
  --dsw-alias-button-primary-dimmed: ${mix(aL, 85)};
  --dsw-alias-button-tool-bar-fill: ${sfL};
  --dsw-alias-button-tool-bar-hover: ${mix(txL, 95)};
  --dsw-alias-button-floating-fill: ${sfL};
  --dsw-alias-button-floating-hover: ${sf2L};
  --dsw-alias-button-info-fill: ${mix(aL, 90)};
  --dsw-alias-button-info-hover: ${mix(aL, 84)};
  --dsw-alias-button-ghost-active-fill: ${mix(aL, 92)};
  --dsw-alias-button-ghost-active-hover: ${mix(aL, 88)};
  --dsw-alias-button-ghost-active-border: ${mix(aL, 78)};
  --dsw-alias-interactive-bg-hover: ${mix(aL, 92)};
  --dsw-alias-interactive-bg-hover-accent: ${mix(aL, 85)};
  --dsw-alias-interactive-bg-hover-solid: ${mix(aL, 88)};
  --dsw-alias-interactive-bg-active: ${mix(aL, 88)};
  /* ⚠️ inline-code 是「背景色」不是文字色 —— DSH 把它 set 到 code 元素的 background。
     曾经按文字色给（亮色 L30% 深色 / 暗色 L88% 浅色），结果亮色深底深字、
     暗色浅底白字（实测 1.2:1，一块刺眼亮斑）。必须给背景值。 */
  --dsw-alias-markdown-inline-code: var(--bloom-code-bg);
  --dsw-alias-markdown-code-block: ${sfL};
  --dsw-alias-markdown-tag: ${mix(aL, 88)};
  --dsw-alias-markdown-placeholder: ${mix(txL, 50)};
  --dsw-alias-markdown-citation: ${mix(txL, 55)};
  --dsw-alias-scrollbar-bg-l1: ${mix(txL, 90)};
  --dsw-alias-scrollbar-bg-l2: ${mix(txL, 80)};
  --dsw-alias-scrollbar-hover-l1: ${mix(txL, 82)};
  --dsw-alias-scrollbar-hover-l2: ${mix(txL, 72)};
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
body[data-ds-dark-theme], body[data-ds-dark-theme][data-bloom-variant="mist"] {${bloomTokens(p, true)}${sharedDswTokens(p, true)}
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
  --dsw-alias-label-primary: ${txD};
  --dsw-alias-label-primary-bluish: ${txD};
  --dsw-alias-label-primary-dimmed: ${mix(txD, 30)};
  --dsw-alias-label-primary-foreground: ${bgD};
  /* 四档由 labelStack() 统一给（层级必须单调递减：
     secondary > tertiary > caption > dimmed）。曾经是 35/45/30/35 ——
     caption 比 secondary 还亮、dimmed 跟 secondary 相同，三档在暗色下塌成一档。 */
${labelStack(p, true)}
  --dsw-alias-brand-primary: ${aD};
  --dsw-alias-brand-primary-invert: ${bgD};
  --dsw-alias-brand-text: ${bgD};
${borderStack(p, true)}
  --dsw-alias-button-primary-fill: ${aD};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aD}, white 8%);
  --dsw-alias-button-primary-dimmed: ${mix(aD, 82)};
  --dsw-alias-button-tool-bar-fill: ${sfD};
  --dsw-alias-button-tool-bar-hover: ${mix(txD, 92)};
  --dsw-alias-button-floating-fill: ${sfD};
  --dsw-alias-button-floating-hover: ${sf2D};
  --dsw-alias-button-info-fill: ${mix(aD, 86)};
  --dsw-alias-button-info-hover: ${mix(aD, 78)};
  --dsw-alias-button-ghost-active-fill: ${mix(aD, 88)};
  --dsw-alias-button-ghost-active-hover: ${mix(aD, 82)};
  --dsw-alias-button-ghost-active-border: ${mix(aD, 70)};
  --dsw-alias-interactive-bg-hover: ${mix(aD, 90)};
  --dsw-alias-interactive-bg-hover-accent: ${mix(aD, 84)};
  --dsw-alias-interactive-bg-hover-solid: ${mix(aD, 82)};
  --dsw-alias-interactive-bg-active: ${mix(aD, 86)};
  /* 见亮色块同名变量的说明：这是背景色。 */
  --dsw-alias-markdown-inline-code: var(--bloom-code-bg);
  --dsw-alias-markdown-code-block: oklch(24% 0.02 240);
  --dsw-alias-markdown-tag: ${mix(aD, 85)};
  --dsw-alias-markdown-placeholder: ${mix(txD, 40)};
  --dsw-alias-markdown-citation: ${mix(txD, 35)};
  --dsw-alias-scrollbar-bg-l1: ${mix(txD, 86)};
  --dsw-alias-scrollbar-bg-l2: ${mix(txD, 76)};
  --dsw-alias-scrollbar-hover-l1: ${mix(txD, 75)};
  --dsw-alias-scrollbar-hover-l2: ${mix(txD, 65)};
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
${sel} {${bloomTokens(p, dark)}${sharedDswTokens(p, dark)}
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
${labelStack(p, dark)}
${borderStack(p, dark)}
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
  /* 用 accent 而不是 morandi：accent 随变体 hue 差异大（雾蓝/丹红/鼠尾草/琥珀…），
     选中态切主题才会「肉眼可见地变色」；morandi 太灰，跨变体几乎看不出差别。
     20% 底 + 高亮文字 + 左侧色条，三层一起才够醒目。 */
  background: color-mix(in oklch, var(--bloom-accent) 20%, transparent);
}
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"] [class*="_title"],
[class*="_sidebarCol"] [class*="_active"] [class*="_title"] {
  font-weight: 500;
  color: color-mix(in oklch, var(--bloom-accent) 55%, var(--dsw-alias-label-primary));
}
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"]::before,
[class*="_sidebarCol"] [class*="_active"]::before {
  content: "";
  position: absolute;
  left: 0; top: 50%;
  width: 3px; height: 18px;
  margin-top: -9px;
  border-radius: 999px;
  background: var(--bloom-accent);
  box-shadow: 0 0 10px -1px var(--bloom-glow);
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

/* 推理中的 “Deep diving…”：DSH 原生 shimmer 直接使用 DeepSeek 静态蓝。
   Bloom 为每个变体提供主色及两种邻近色，做成克制的三色光谱流动：有 Gemini
   式的生命力，但色相始终属于当前主题。以语义后缀而非 CSS Module hash 匹配。 */
[class*="_turnStatus"]:not([class*="_turnStatusClock"]) {
  background-image: linear-gradient(
    110deg,
    var(--bloom-motion-1) 0%,
    var(--bloom-motion-2) 24%,
    var(--bloom-motion-3) 43%,
    var(--bloom-motion-1) 60%,
    var(--bloom-motion-2) 78%,
    var(--bloom-motion-3) 100%
  ) !important;
  background-size: 260% 100% !important;
  animation: bloom-deep-dive-spectrum 3.6s ease-in-out infinite alternate !important;
}
[class*="_turnStatusClock"] {
  color: color-mix(in oklch, var(--bloom-motion-2) 58%, var(--dsw-alias-label-caption)) !important;
  -webkit-text-fill-color: color-mix(in oklch, var(--bloom-motion-2) 58%, var(--dsw-alias-label-caption)) !important;
}
@keyframes bloom-deep-dive-spectrum {
  from { background-position: 100% 0; }
  to { background-position: 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  [class*="_turnStatus"]:not([class*="_turnStatusClock"]) {
    animation: none !important;
    background-position: 50% 0 !important;
  }
}

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

/* ═══ 6. 微交互动效系统（v0.5.0）══════════════════════════════════
   原则（导师批注）：
   ① 只为「状态反馈」动：hover=可点、active=按下、选中=切换；
   ② 统一时长/缓动走 token（反馈 130ms、常规 200ms、大过渡 280ms；
      ease-out 入场、通用 ease），全站一致，否则就是「东一块西一块」；
   ③ 只动 transform/opacity（GPU 合成不动布局），backdrop-filter 很贵不放进 transition；
   ④ prefers-reduced-motion 一律降级成瞬间（无动画）。
   别加「为了炫而炫」的常驻动画——那个会回到「脏/四不像」。 */
body {
  --bloom-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --bloom-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --bloom-dur-fast: 130ms;
  --bloom-dur: 200ms;
  --bloom-dur-slow: 280ms;
}

/* 侧栏会话行：hover 轻微右移 + 淡染（可点暗示），active 按下回弹 */
[class*="_sidebarCol"] [role="treeitem"],
[class*="_sidebarCol"] [class*="_sessionRow"] {
  transition:
    background var(--bloom-dur-fast) var(--bloom-ease),
    transform var(--bloom-dur-fast) var(--bloom-ease);
}
[class*="_sidebarCol"] [role="treeitem"]:hover {
  transform: translateX(2px);
}
[class*="_sidebarCol"] [role="treeitem"]:active { transform: translateX(2px) scale(0.996); }

/* 选中态左侧色条：从左侧滑入（satisfying 的「已锁定」反馈） */
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"]::before,
[class*="_sidebarCol"] [class*="_active"]::before {
  transform-origin: left center;
  animation: bloom-bar-in var(--bloom-dur) var(--bloom-ease-out);
}
@keyframes bloom-bar-in {
  from { transform: scaleY(0); opacity: 0; }
  to { transform: scaleY(1); opacity: 1; }
}

/* 玻璃面板 / 输入卡片 hover：微抬升（只在已有 transition 的元素上加，避免泛化抖动） */
div[class*="_composer"] div[class*="_card"] {
  transition:
    border-color var(--bloom-dur) var(--bloom-ease),
    box-shadow var(--bloom-dur) var(--bloom-ease);
}
div[class*="_composer"] div[class*="_card"]:hover {
  border-color: var(--bloom-hairline-strong);
}

/* 主题自己的按钮：按下微缩（明确「点到了」） */
.dsh-bloom-trigger:active,
.dsh-bloom-option:active,
[class*="_sidebarCol"] button:active { transform: scale(0.985); }

/* ═══ 焦点环兜底：统一成主题色 ═══
   DSH 有些控件（例如设置面板右上角的关闭按钮）没定义自己的 focus 样式，
   于是露出**浏览器默认**的 focus ring —— Chrome 暗色下是一圈亮蓝
   rgb(153,200,255)，跟 8 套莫兰迪配色全都打架（用户实拍反馈里那个蓝圈）。
   注意它不是 DSH 的 token，改 --dsw-* 改不到，只能靠这条兜底。

   用 :focus-visible 而不是 :focus —— 只在键盘导航时出现，鼠标点击不显示，
   这也是 WCAG 2.4.7「焦点可见」的正确做法：焦点依然清晰，只是跟着主题走。 */
:focus-visible {
  outline: 2px solid var(--bloom-accent) !important;
  outline-offset: 2px;
}

/* 重新截图/使用观察时可平滑淡入的低频面板入场（默认不绑到常驻元素上） */
@keyframes bloom-panel-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

/* ④ 无障碍：动效全部降级为瞬间 */
@media (prefers-reduced-motion: reduce) {
  [class*="_sidebarCol"] [role="treeitem"],
  [class*="_sidebarCol"] [class*="_active"]::before,
  .dsh-bloom-switcher, .dsh-bloom-trigger, .dsh-bloom-option, .dsh-bloom-menu,
  [class*="_composer"] div[class*="_card"] {
    animation: none !important;
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
/**
 * 玻璃层（v0.5.0，主视觉）—— 不再有壁纸/氛围层。
 *
 * 背景即 body 的莫兰迪氛围渐变（见 COMPONENT_CSS 第 1 节，已增强）。
 * 玻璃由三件事读出来，缺一不可：
 *   1. 半透底（透明 60~82%）让氛围渐变的色相透过来；
 *   2. backdrop blur + saturate：面板与背景/内容交界产生霜化；
 *   3. 玻璃边缘——顶部亮高光(inset) + 半透描边 + 柔和深色外辉。
 *
 * 明暗两档透明度：暗色面板更实一点（保亮字可读），亮色更透（玻璃感更足）。
 * 全部用 color-mix(theme token, transparent) 而不是死白/死黑，色相跟着变体走。
 */
const GLASS_CSS = `
/* ═══ 顶栏 tab 条：不做玻璃,只留一条发丝底边 ═══════════════════
   这里曾和侧栏/排队条共用「面级玻璃」档位(半透底 + backdrop blur +
   inset 白描边)。但 tab 条只有 27px 高、1400px 宽 —— 那套玻璃在这个尺寸上
   读不出「一块玻璃」,只会变成一条自带底色和白边框的横带,跟下方内容区
   撞出一道突兀的色块边界(用户实拍反馈:「对话和轨迹这里」)。

   玻璃需要面积才成立。窄条带该做的是「分界」而不是「面」,所以只留一条
   morandi 发丝底边,底色完全交给 body 的氛围渐变。 */
div[class*="_tabs"] {
  background-color: transparent !important;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: inset 0 -1px 0 var(--bloom-hairline, rgba(146,168,179,0.3));
}

/* ═══ 面级面板（排队条 / 预览 dock）═══════════════════════════════
   面积大，档位「略实」；顶部亮高光 + 深色外辉让它像一块立起来的玻璃。 */
div[class*="_dock"]:has(> [class*="_preview"]) {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 82%) !important;
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.10),
    0 14px 44px -16px rgba(0,0,0,0.22);
}
body[data-ds-dark-theme] div[class*="_dock"]:has(> [class*="_preview"]) {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 64%) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    0 16px 48px -18px rgba(0,0,0,0.5);
}

/* ═══ 侧栏玻璃：backdrop-filter 必须走 ::before，绝不能加在 _sidebarCol 自身 ═══
   ⚠️ 这是本项目踩过的最贵的坑，改这块前先读完。

   backdrop-filter（和 transform / filter / perspective / contain / will-change 一样）
   会让元素成为**其 position:fixed 后代的 containing block**。而 DSH 的**设置面板
   挂在侧栏子树里**（_sidebarCol > … > _footArea > _settingsArea > _overlay），
   它的 overlay 是 fixed + inset:0，本来相对视口铺满、panel 800px 居中。

   一旦 _sidebarCol 自己带 backdrop-filter，那个 fixed 就改为相对 280px 宽的侧栏定位：
   遮罩缩到侧栏那一条，panel 被挤成 279px，detail 区 flex 收缩到 18px ——
   于是中文变成逐字竖排。这个「DSH 的 layout bug」从来不是 DSH 的，是我们自己造的，
   而且为它写了 60 行 modal 改造 CSS、来回改了三轮（详见 DEV_NOTES 2026-08-24）。

   伪元素的 backdrop-filter 只作用于伪元素自己，不改变父元素的 containing block
   资格，所以玻璃观感一致、fixed 后代不受影响。

   ⚠️ 第二个坑（修第一个坑时当场踩的）：**不要给侧栏加 isolation: isolate。**
   它确实不创建 containing block，但会创建 **stacking context** —— overlay 的
   z-index:1000 会被困在侧栏内部，而侧栏自身是 z-index:auto，于是设置面板被
   主聊天区的 composer 画在了上面。两个属性伤的是两件不同的事：
     backdrop-filter → containing block（伤 fixed 的**定位基准**）
     isolation        → stacking context（伤 fixed 的**层叠顺序**）
   所以这里只用 position:relative + z-index:-1：伪元素落在 root 层叠上下文里、
   body 氛围渐变之上、所有正常流内容之下，玻璃该模糊的背景一点没变。

   判据（以后加玻璃时对每个目标问一遍）：
   「这个元素的子树里有 position:fixed 的东西吗？」有 → 玻璃必须走 ::before，
   且不得引入 isolation / transform / filter / contain / will-change。 */
[class*="_sidebarCol"] {
  position: relative;
  background-color: transparent !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.10),
    0 14px 44px -16px rgba(0,0,0,0.22);
}
[class*="_sidebarCol"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 82%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
}
body[data-ds-dark-theme] [class*="_sidebarCol"] {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    0 16px 48px -18px rgba(0,0,0,0.5);
}
body[data-ds-dark-theme] [class*="_sidebarCol"]::before {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 64%);
}

/* v0.6.2: 「对话 / 轨迹」tab 字号上限保护 —— 用户在窄屏 / 浏览器 zoom>100% 下
   反馈 tab 视觉上被放大、撑得过宽。DSH 原生 tab 是 wSkVaW_tab（默认 13px），
   这里兜底 clamp 到 14px，避免任何状态下字号异常撑开。 */
div[class*="_tabs"] button[class*="_tab"],
div[class*="_tabs"] [class*="_tab"] {
  font-size: clamp(13px, 0.9vw, 14px) !important;
  font-weight: 500 !important;
  letter-spacing: normal !important;
  white-space: nowrap !important;
}

/* ═══ 输入卡片（主角）—— 最清晰的一块玻璃，focus 时玻璃边缘点亮 ═══ */
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 84%) !important;
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.35);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.35);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.28),
    inset 0 0 0 1px rgba(255,255,255,0.14),
    0 18px 52px -20px rgba(0,0,0,0.26);
}
body[data-ds-dark-theme] div[class*="_composer"] div[class*="_card"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 66%) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    inset 0 0 0 1px rgba(255,255,255,0.06),
    0 20px 56px -22px rgba(0,0,0,0.55);
}
div[class*="_composer"] div[class*="_card"]:focus-within {
  border-color: rgba(255,255,255,0.24) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.3),
    inset 0 0 0 1px rgba(255,255,255,0.18),
    0 0 0 3px var(--bloom-glow),
    0 18px 52px -20px rgba(0,0,0,0.26) !important;
}
body[data-ds-dark-theme] div[class*="_composer"] div[class*="_card"]:focus-within {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.14),
    inset 0 0 0 1px rgba(255,255,255,0.08),
    0 0 0 3px var(--bloom-glow),
    0 20px 56px -22px rgba(0,0,0,0.55) !important;
}

/* ═══ 消息气泡 —— 柔和玻璃，近距淡影，不压内容 ═══ */
[class*="_bubble"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 78%) !important;
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.25);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.25);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.16),
    inset 0 0 0 1px rgba(255,255,255,0.08),
    0 6px 24px -10px rgba(0,0,0,0.14);
}
body[data-ds-dark-theme] [class*="_bubble"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 62%) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.08),
    inset 0 0 0 1px rgba(255,255,255,0.04),
    0 8px 28px -12px rgba(0,0,0,0.4);
}

/* ═══ 下拉/选择器（覆盖型）—— blur 在这里真正可见 ═══ */
/* v0.6.0 patch: 暗色版从 transparent 52% → 12%（48% → 88% 不透明）。
   v0.6.0 早期设到 22%（78% 不透明）已被 verify 证伪：青金/冷色调 + 亮色聊天内容
   透字仍明显（用户截图「字竖排的 layout bug」整段透出）。现在跟 Bloom 自己的
   下拉（transparent 12%）一致。*/
[class*="_menu"],
[class*="_selector"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 20%) !important;
  backdrop-filter: blur(28px) saturate(1.4);
  -webkit-backdrop-filter: blur(28px) saturate(1.4);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.12),
    0 20px 56px -18px rgba(0,0,0,0.3);
}
body[data-ds-dark-theme] [class*="_menu"],
body[data-ds-dark-theme] [class*="_selector"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #101010), transparent 12%) !important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.1),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    0 24px 64px -20px rgba(0,0,0,0.6);
}

/* ═══ 设置面板：无需任何覆盖 ═══
   这里曾经有 60 行把「279px 窄 drawer」改造成居中 modal 的 CSS，前后改了三轮
   （v0.6.0 修 → v0.6.1 以「不覆盖 DSH 原生 layout」回滚并记为「去官方提 issue」
   → 又改回来）。三轮都白做，因为**前提是错的**：

   实测（2026-08-24，摘掉 Bloom 样式后量的）DSH 原生设置面板本来就是
   800×800 的居中 modal，x=464=(1728-800)/2 精确居中，中文描述 383~398px 正常横排。
   **DSH 没有这个 bug。** 那个「窄 drawer + 中文逐字竖排」是 Bloom 自己造成的回归 ——
   见上方 _sidebarCol 的 ::before 注释：侧栏的 backdrop-filter 把设置面板 overlay
   的 fixed containing block 从视口换成了 280px 的侧栏。

   修根因（玻璃移到伪元素）之后，**布局上**这里一行 CSS 都不需要。

   ── 唯一的例外是下面这条，它改的是颜色而不是布局 ── */

/* 「浅色 / 深色 / 跟随系统」选中态的边框：DSH 用 --dsw-static-neutral-bluish-400
   （#adb2b8）画它。那是 static 层的中性灰阶 —— 绕过了 alias 层，主题的
   --dsw-alias-border-* 改不到它，于是在莫兰迪暗底上留下一圈刺眼的灰白边
   （用户实拍反馈「白色边框很突兀」，而且只有选中那一个特别亮）。

   选中态本该是主题色，这里按 accent 接管。并且**不**整体覆盖
   --dsw-static-neutral-bluish-400 —— static 是 DSH 的基础色阶，全局改会波及
   大量无关组件；只在这个具体组件上纠正，影响面可控。 */
button[class*="_themeCube"][class*="_selected"] {
  border-color: var(--bloom-accent) !important;
}

.md-code-block,
[class*="_tableScroll"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 70%) !important;
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.2);
}
body[data-ds-dark-theme] .md-code-block,
body[data-ds-dark-theme] [class*="_tableScroll"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 56%) !important;
}
.md-code-block pre, .md-code-block code { background: transparent !important; }
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
 * v0.5.0：移除「氛围」区（壁纸 / 主题包已删），只留 4 个变体切换。
 *         玻璃为主视觉、默认常开，见 GLASS_CSS。
 */
function buildSwitcherHTML(currentVariant) {
  const options = VARIANTS.map((v) => {
    const on = v === currentVariant
    return `<button type="button" class="dsh-bloom-option" role="option" data-variant="${v}"` +
      ` aria-selected="${on}" data-active="${on}">` +
      `<span class="dsh-bloom-dot" style="${dotStyle(v)}"></span>` +
      `<span class="dsh-bloom-option__name">${VARIANT_LABELS[v].zh}</span>` +
      `<span class="dsh-bloom-option__en">${VARIANT_LABELS[v].en}</span>` +
      `<span class="dsh-bloom-check" aria-hidden="true">✓</span></button>`
  }).join('')
  return `<div class="dsh-bloom-switcher" data-plugin="${PLUGIN_ID}">
  <button type="button" class="dsh-bloom-trigger" aria-haspopup="listbox" aria-expanded="false" title="Bloom 主题 · v${PLUGIN_VERSION}">
    <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
    <span class="dsh-bloom-trigger__name">${VARIANT_LABELS[currentVariant].zh}</span>
    <svg class="dsh-bloom-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="dsh-bloom-menu" role="listbox" aria-label="Bloom 主题变体" hidden>
    ${options}
    <div class="dsh-bloom-version" role="separator">
      <a class="dsh-bloom-version__name" href="https://github.com/webkubor/dsh-bloom-theme" target="_blank" rel="noopener">Bloom</a>
      <span class="dsh-bloom-version__current">v${PLUGIN_VERSION}</span>
      <span class="dsh-bloom-version__update" hidden></span>
    </div>
    <div class="dsh-bloom-dsh-update" role="separator">
      <div class="dsh-bloom-dsh-row">
        <span class="dsh-bloom-dsh-label">DSH</span>
        <span class="dsh-bloom-dsh-ver" data-dsh-current>—</span>
        <span class="dsh-bloom-dsh-state" data-dsh-state></span>
      </div>
      <div class="dsh-bloom-dsh-row">
        <span class="dsh-bloom-dsh-label">最新</span>
        <span class="dsh-bloom-dsh-ver" data-dsh-latest>检查中…</span>
      </div>
      <div class="dsh-bloom-dsh-actions">
        <button type="button" class="dsh-bloom-dsh-btn" data-act="refresh" title="重新检查 DSH 最新版">↻ 检查</button>
        <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-dsh-btn--primary" data-act="copy" title="复制升级命令到剪贴板">复制升级命令</button>
      </div>
      <div class="dsh-bloom-dsh-hint" data-dsh-hint hidden></div>
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
  /* v0.6.0 patch: 提到 99999，确保 Bloom 下拉菜单覆盖在 DSH 原生顶栏 tabs
     （"对话 / 轨迹"，z-index 更高）之上，不被截断 */
  z-index: 99999;
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
/* 菜单入场：从右上角 scale+fade 打开（hidden 移除触发；只在打开时播放一次） */
.dsh-bloom-menu { transform-origin: top right; }
@keyframes bloom-menu-in {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: none; }
}
.dsh-bloom-menu:not([hidden]) {
  animation: bloom-menu-in var(--bloom-dur-slow, 280ms) var(--bloom-ease, cubic-bezier(0.2,0.8,0.2,1));
}

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

/* v0.5.0：氛围区（壁纸 / 玻璃 toggle / 主题包控件）已移除，菜单只保留变体列表。 */

/* 版本 / 更新指示（菜单底部）：一眼看到当前版本，有新版亮「↑ vX」 chip */
.dsh-bloom-version {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 6px 9px 2px;
  border-top: 1px solid var(--bloom-hairline, rgba(0,0,0,0.08));
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-version__name {
  font-weight: 600;
  color: var(--dsw-alias-label-secondary, #666);
  text-decoration: none;
}
.dsh-bloom-version__name:hover { color: var(--dsw-alias-brand-primary, #4a90e2); }
.dsh-bloom-version__current { font-variant-numeric: tabular-nums; }
.dsh-bloom-version__update {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 7px;
  border-radius: 999px;
  background: color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), transparent 84%);
  color: var(--dsw-alias-brand-primary, #4a90e2);
  font-weight: 600;
  text-decoration: none;
}
.dsh-bloom-version__update:hover { color: color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), black 15%); }

/* ── DSH 升级检查区块（紧贴 Bloom 版本行下方）── */
.dsh-bloom-dsh-update {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  padding: 6px 9px 7px;
  border-top: 1px solid var(--bloom-hairline, rgba(0,0,0,.06));
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-dsh-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.dsh-bloom-dsh-label {
  flex: 0 0 28px;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-dsh-ver {
  font-weight: 500;
  color: var(--dsw-alias-label-secondary, #555);
  font-family: ui-monospace, SFMono-Regular, 'Menlo', monospace;
  font-size: 10.5px;
}
.dsh-bloom-dsh-state {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in oklch, var(--dsw-alias-label-tertiary, #999), transparent 88%);
  color: var(--dsw-alias-label-secondary, #666);
}
.dsh-bloom-dsh-state[data-state="update"] {
  background: color-mix(in oklch, var(--bloom-accent, #c47b4a), transparent 78%);
  color: var(--bloom-accent, #c47b4a);
  font-weight: 600;
}
/* 状态 chip 的绿/红必须明暗分档 —— oklch(60%) 是「中间亮度」，两头都不够:
   亮底上实测 ≈2.9:1、暗底上 ≈3.4:1，10px 字号更需要对比度。
   亮色压暗到 45%/48%，暗色提亮到 78%/72%，两档都过 AA。 */
.dsh-bloom-dsh-state[data-state="latest"] {
  background: color-mix(in oklch, oklch(45% 0.13 150), transparent 88%);
  color: oklch(45% 0.13 150);
}
.dsh-bloom-dsh-state[data-state="err"] {
  background: color-mix(in oklch, oklch(48% 0.17 28), transparent 88%);
  color: oklch(48% 0.17 28);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-state[data-state="latest"] {
  background: color-mix(in oklch, oklch(78% 0.14 150), transparent 88%);
  color: oklch(78% 0.14 150);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-state[data-state="err"] {
  background: color-mix(in oklch, oklch(72% 0.16 28), transparent 88%);
  color: oklch(72% 0.16 28);
}
.dsh-bloom-dsh-actions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}
.dsh-bloom-dsh-btn {
  flex: 1;
  padding: 4px 8px;
  font: 600 10.5px/1 -apple-system, sans-serif;
  border-radius: 6px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,.08));
  background: transparent;
  color: var(--dsw-alias-label-secondary, #666);
  cursor: pointer;
  transition: background .15s var(--bloom-ease), color .15s var(--bloom-ease), border-color .15s var(--bloom-ease);
}
.dsh-bloom-dsh-btn:hover {
  background: color-mix(in oklch, var(--bloom-accent, #c47b4a) 14%, transparent);
  border-color: color-mix(in oklch, var(--bloom-accent, #c47b4a) 40%, transparent);
  color: var(--dsw-alias-label-primary, #222);
}
/* 主操作按钮改实心 —— 原本是 accent 22% 底 + accent 文字,同色系互叠只有
   4.09:1(10.5px 字)。实心 accent 底 + 反色文字实测 ≈7:1,而且 PALETTE 的
   accent×bg 组合本来就由 contrast-guard 守着 ≥4.5,这条路天然达标。
   它也确实是主操作,视觉上该比「↻ 检查」重。 */
.dsh-bloom-dsh-btn--primary {
  background: var(--bloom-accent, #c47b4a);
  border-color: var(--bloom-accent, #c47b4a);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
.dsh-bloom-dsh-btn--primary:hover {
  background: color-mix(in oklch, var(--bloom-accent, #c47b4a), black 10%);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
.dsh-bloom-dsh-hint {
  margin-top: 4px;
  padding: 4px 6px;
  border-radius: 5px;
  background: color-mix(in oklch, oklch(60% 0.12 150), transparent 90%);
  color: oklch(60% 0.12 150);
  font-size: 10px;
  text-align: center;
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
/* v0.6.1 patch: 更窄的屏（< 1024px）右上角三按钮已经过挤（💎 统计 + Bloom + Session log）。
  彻底隐藏 stats trigger，让 Bloom trigger + Session log 各自有呼吸空间。
  stats 卡片本身 hover 才显示，宽屏下用户已习惯 hover；窄屏下用 menu 顶部的 Bloom v0.6.0
  版本行也能看到当前版本号。 */
@media (max-width: 1024px) {
  .dsh-bloom-stats-trigger { display: none !important; }
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

/* v0.5.0：氛围层（壁纸 / 玻璃开关 / 主题包）整体移除，玻璃改为默认常开。 */

function applyVariant(variant) {
  if (!VARIANTS.includes(variant)) variant = 'mist'
  document.body.dataset.bloomVariant = variant
  try { window.localStorage.setItem(STORAGE_KEY, variant) } catch {}
  const root = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
  if (!root) return
  root.querySelectorAll<HTMLElement>('.dsh-bloom-option').forEach((el) => {
    const on = el.dataset.variant === variant
    el.setAttribute('data-active', String(on))
    el.setAttribute('aria-selected', String(on))
  })
  const name = root.querySelector<HTMLElement>('.dsh-bloom-trigger__name')
  if (name) name.textContent = VARIANT_LABELS[variant].zh
  const dot = root.querySelector<HTMLElement>('.dsh-bloom-trigger .dsh-bloom-dot')
  if (dot) dot.setAttribute('style', dotStyle(variant))
}

function readVariant() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return VARIANTS.includes(v) ? v : 'mist'
  } catch { return 'mist' }
}

function injectCSS(css, idSuffix) {
  const tagId = PLUGIN_ID + '/' + idSuffix
  if (document.querySelector<HTMLElement>('style[data-plugin-css="' + tagId + '"]')) return
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
  const header = document.querySelector<HTMLElement>('header[class*="_header"]') || document.querySelector<HTMLElement>('header')
  if (!header) return null
  return header.querySelector<HTMLElement>('[class*="_headerUtilities"]')
    || header.querySelector<HTMLElement>('[class*="_headerActions"]')
    || null
}

function closeMenu(root: HTMLElement) {
  const menu = root.querySelector<HTMLElement>('.dsh-bloom-menu')
  const trigger = root.querySelector<HTMLElement>('.dsh-bloom-trigger')
  if (menu) menu.hidden = true
  if (trigger) trigger.setAttribute('aria-expanded', 'false')
}

function buildSwitcherEl(initialVariant) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = buildSwitcherHTML(initialVariant)
  const el = wrapper.firstElementChild as HTMLElement

  const openMenu = () => {
    const menu = el.querySelector<HTMLElement>('.dsh-bloom-menu')
    const trigger = el.querySelector<HTMLElement>('.dsh-bloom-trigger')
    // v0.6.1 patch: 互斥——Bloom 下拉打开时立即关闭 stats 浮层（同步，
    // 不走 160ms 延时），避免两个浮层在用户视觉里同时出现互相遮挡
    hideStatsCard()
    menu.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    // 打开时把焦点移到当前选中项，键盘用户立刻知道在哪
    const active = menu.querySelector<HTMLElement>('.dsh-bloom-option[data-active="true"]')
      || menu.querySelector<HTMLElement>('.dsh-bloom-option')
    active?.focus()
  }

  el.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest('.dsh-bloom-trigger')
    if (trigger) {
      const menu = el.querySelector<HTMLElement>('.dsh-bloom-menu')
      if (menu.hidden) openMenu()
      else closeMenu(el)
      return
    }
    const opt = (e.target as HTMLElement).closest('.dsh-bloom-option') as HTMLElement | null
    if (opt) {
      applyVariant(opt.dataset.variant)
      closeMenu(el)
      el.querySelector<HTMLElement>('.dsh-bloom-trigger')?.focus()
      return
    }
  })

  el.addEventListener('keydown', (e: KeyboardEvent) => {
    const menu = el.querySelector<HTMLElement>('.dsh-bloom-menu')
    const trigger = el.querySelector<HTMLElement>('.dsh-bloom-trigger')
    const options = [...menu.querySelectorAll<HTMLElement>('.dsh-bloom-option')]
    const idx = options.indexOf(document.activeElement as HTMLElement)

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
  el.querySelectorAll<HTMLElement>('.dsh-bloom-option').forEach((opt) => {
    opt.setAttribute('tabindex', '-1')
  })

  // 点击外部关闭。挂 document 上，用 el.contains 判断而不是 blur ——
  // blur 会在点菜单项时先触发，导致选不中。
  document.addEventListener('click', (e) => {
    if (!el.contains(e.target as Node)) closeMenu(el)
  })
  return el
}

/* ═══ 版本 / 更新检测 ═══════════════════════════════════════════ */
/** 从 npm registry 拉最新版，仅作版本对比（离线/网络失败静默，只显示当前版）。 */
async function checkUpdate() {
  try {
    const r = await fetch('https://registry.npmjs.org/@kubor/dsh-bloom-theme/latest', { cache: 'no-store' })
    if (!r.ok) return
    const d = await r.json()
    latestVersion = (d && d.version) || null
  } catch { /* 忽略：显示当前版即可 */ }
  refreshUpdateBadge()
}

/* ── DSH 升级检查（看 npm latest + 本地 __DSH_BOOT__.rev）── */
let dshLatestVersion: string | null = null
let dshCheckPromise: Promise<void> | null = null
const DSH_CACHE_KEY = 'bloom-dsh-check'
const DSH_CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h

/** 从 window.__DSH_BOOT__.rev 读当前 DSH 构建 hash（截短 7 字符）。 */
function readDshCurrentRev(): string | null {
  try {
    const rev = (window as any).__DSH_BOOT__?.rev
    return typeof rev === 'string' ? rev.slice(0, 7) : null
  } catch { return null }
}

/** 从 npm registry 拉 @deepseek-ai/dsh latest（缓存 6h，避免每次开下拉都打网络）。 */
async function checkDshLatest(force = false): Promise<void> {
  if (!force) {
    try {
      const raw = sessionStorage.getItem(DSH_CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw)
        if (cached?.at && Date.now() - cached.at < DSH_CACHE_TTL_MS && cached.latest) {
          dshLatestVersion = cached.latest
          renderDshUpdate()
          return
        }
      }
    } catch {}
  }
  if (dshCheckPromise) return dshCheckPromise
  dshCheckPromise = (async () => {
    try {
      const r = await fetch('https://registry.npmjs.org/@deepseek-ai/dsh/latest', { cache: 'no-store' })
      if (r.ok) {
        const d = await r.json()
        dshLatestVersion = (d && d.version) || null
        try { sessionStorage.setItem(DSH_CACHE_KEY, JSON.stringify({ at: Date.now(), latest: dshLatestVersion })) } catch {}
      } else {
        dshLatestVersion = null
      }
    } catch {
      dshLatestVersion = null
    } finally {
      dshCheckPromise = null
    }
    renderDshUpdate()
  })()
  return dshCheckPromise
}

/** 把 DSH 当前 rev + npm latest 渲染到下拉区块；绑按钮事件。 */
function renderDshUpdate() {
  const curEl = document.querySelector<HTMLElement>('[data-dsh-current]')
  const latEl = document.querySelector<HTMLElement>('[data-dsh-latest]')
  const stEl = document.querySelector<HTMLElement>('[data-dsh-state]')
  const hintEl = document.querySelector<HTMLElement>('[data-dsh-hint]')
  if (!curEl || !latEl || !stEl || !hintEl) return

  const cur = readDshCurrentRev() || '?'
  curEl.textContent = cur

  if (dshLatestVersion == null) {
    latEl.textContent = '点击 ↻ 检查'
    stEl.removeAttribute('data-state')
    stEl.textContent = ''
  } else {
    latEl.textContent = dshLatestVersion
    stEl.textContent = '✓ 已是最新'
    stEl.setAttribute('data-state', 'latest')
  }
  hintEl.hidden = true
  hintEl.textContent = ''

  const btnRefresh = document.querySelector<HTMLButtonElement>('[data-act="refresh"]')
  const btnCopy = document.querySelector<HTMLButtonElement>('[data-act="copy"]')
  if (btnRefresh && !btnRefresh.dataset.bloomBound) {
    btnRefresh.dataset.bloomBound = '1'
    btnRefresh.addEventListener('click', async (ev) => {
      ev.stopPropagation()
      stEl.textContent = '检查中…'
      stEl.removeAttribute('data-state')
      btnRefresh.disabled = true
      try { await checkDshLatest(true) } finally { btnRefresh.disabled = false }
    })
  }
  if (btnCopy && !btnCopy.dataset.bloomBound) {
    btnCopy.dataset.bloomBound = '1'
    btnCopy.addEventListener('click', async (ev) => {
      ev.stopPropagation()
      const cmd = 'npm i -g @deepseek-ai/dsh@latest'
      let ok = false
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(cmd)
          ok = true
        }
      } catch {}
      if (!ok) {
        // 降级：临时 textarea
        const ta = document.createElement('textarea')
        ta.value = cmd; ta.style.position = 'fixed'; ta.style.opacity = '0'
        document.body.appendChild(ta); ta.select()
        try { ok = document.execCommand('copy') } catch {}
        ta.remove()
      }
      hintEl.hidden = false
      hintEl.textContent = ok ? `✓ 已复制：${cmd}` : `复制失败，请手动执行：${cmd}`
      setTimeout(() => { hintEl.hidden = true }, 2400)
    })
  }
}

/** 简单版本大小比较：a>b→1, a<b→-1, 相等→0（处理 leading v / 缺段）。 */
function cmpVersion(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0)
  const pb = String(b).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0, nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}
/** 把「↑ 可更新」徽标刷进已渲染的版本区（只在 最新>当前 时亮，切换器重挂后也会被 injectSwitcher 调用）。 */
function refreshUpdateBadge() {
  if (!latestVersion || cmpVersion(latestVersion, PLUGIN_VERSION) <= 0) return
  const el = document.querySelector<HTMLElement>('.dsh-bloom-version__update')
  if (!el) return
  el.hidden = false
  el.setAttribute('title', '可更新到 v' + latestVersion)
  el.textContent = '↑ v' + latestVersion
}

/* ═══ 代码统计卡（悬停预览 + 一键导出 PNG）══════════════════════════
   交互（导师按你的要求重做）：触发点放在配色按钮**左侧**，平时是一个简洁小胶囊；
   鼠标悬停它才浮出卡片预览，移开即收起。数据来自 `/bloom stats --card`，纯浏览器端、
   零依赖（DSH 的 client↔node 实时桥是 TypertRemoteService，vanilla 主题不引入）。 */

const LANG_COLOR: Record<string, string> = {
  TypeScript: '#4b7ea8', JavaScript: '#c9a86a', CSS: '#8f79c4', Markdown: '#7f8c8d',
  JSON: '#9aa06a', YAML: '#a8a0c4', HTML: '#c9777f', Python: '#5a9a8c', Go: '#4e9ab5',
  Vue: '#5aac8a', Shell: '#5a8a7f', SQL: '#6f8ab0', 'C/C++': '#8a9a8a', Rust: '#b57a48', Java: '#c57658',
}

function roundRectPath(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

/** 从当前主题 body 读 CSS 变量（变量挂在 body/变体上，documentElement 读不到，要读 body）。 */
function cssVar(name: string): string {
  return getComputedStyle(document.body).getPropertyValue(name).trim()
}

/** 在 canvas 上画出统计卡（720×460，2x 高清；**跟随当前主题**：accent / bg / 文字全部从主题 token 取）。 */
function drawStatsCard(canvas: HTMLCanvasElement, s: any) {
  const W = 720, H = 460
  const c = canvas.getContext('2d')!
  const scale = 2
  canvas.width = W * scale; canvas.height = H * scale
  c.scale(scale, scale)

  // 主题 token
  const vBg = cssVar('--dsw-alias-bg-layer-1') || '#fff'
  const vBg2 = cssVar('--dsw-alias-bg-layer-2') || vBg
  const vTx = cssVar('--dsw-alias-label-primary') || '#222'
  const vTx2 = cssVar('--dsw-alias-label-secondary') || '#666'
  const vTx3 = cssVar('--dsw-alias-label-tertiary') || '#888'
  const vCap = cssVar('--dsw-alias-label-caption') || '#999'
  const vAccent = cssVar('--bloom-accent') || '#34698c'
  const vHairline = cssVar('--bloom-hairline') || 'rgba(146,168,179,.35)'
  const vHairStrong = cssVar('--bloom-hairline-strong') || vHairline

  // 页面底色：主题 bg-layer-1 渐变（明→暗稍微过渡），加一坨 accent halo
  const bg = c.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, vBg)
  bg.addColorStop(1, vBg2)
  c.fillStyle = bg; c.fillRect(0, 0, W, H)
  const halo = c.createRadialGradient(W * .2, 0, 10, W * .2, 0, W)
  halo.addColorStop(0, vAccent); halo.addColorStop(0.4, 'rgba(0,0,0,0)')
  c.globalAlpha = 0.15
  c.fillStyle = halo; c.fillRect(0, 0, W, H)
  c.globalAlpha = 1

  // 卡片本体：半透明 bg-layer-1（明暗自适应），hairline 描边，柔和外辉
  roundRectPath(c, 30, 26, W - 60, H - 52, 26)
  c.save()
  c.shadowColor = 'rgba(0,0,0,.22)'; c.shadowBlur = 44; c.shadowOffsetY = 18
  c.fillStyle = vBg; c.globalAlpha = 0.88; c.fill(); c.restore()
  c.globalAlpha = 1
  roundRectPath(c, 30, 26, W - 60, H - 52, 26)
  c.strokeStyle = vHairline; c.lineWidth = 1; c.stroke()
  // 顶部内高光（玻璃）
  roundRectPath(c, 31, 27, W - 62, (H - 52) / 2, 25)
  const sheen = c.createLinearGradient(0, 27, 0, 27 + (H - 52) / 2)
  sheen.addColorStop(0, 'rgba(255,255,255,.18)')
  sheen.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = sheen; c.fill()

  const left = 56, top = 66
  // 标题（accent）
  c.fillStyle = vAccent
  c.font = '700 27px -apple-system, "PingFang SC", system-ui, sans-serif'
  c.fillText('🌊 Bloom · 代码统计', left, top)
  // 角标
  const badge = s.activeToday ? '今日活跃' : 'coding'
  c.font = '600 13px -apple-system, sans-serif'
  const bw = c.measureText(badge).width + 26
  roundRectPath(c, W - 60 - bw - 34, top - 20, bw, 24, 12)
  c.fillStyle = vAccent; c.globalAlpha = 0.18; c.fill(); c.globalAlpha = 1
  c.fillStyle = vAccent
  c.fillText(badge, W - 60 - bw - 34 + 13, top - 3)

  // 项目行
  c.fillStyle = vTx2
  c.font = '400 15px ui-monospace, "SF Mono", Menlo, monospace'
  c.fillText(`📦 ${s.project}` + (s.lastCommitted ? `　·　最近提交 ${s.lastCommitted}` : ''), left, top + 40)
  c.strokeStyle = vHairline; c.lineWidth = 1
  c.beginPath(); c.moveTo(left, top + 58); c.lineTo(W - 60 - 26, top + 58); c.stroke()

  // 统计块：半透明 bg-layer-2 + hairline
  const nums: Array<[string, string]> = [
    [String(s.loc ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ','), '代码行'],
    [String(s.files ?? 0), '文件'],
    [String(s.commits ?? 0), '提交'],
    [`${s.streak ?? 0}天`, '连击'],
  ]
  const gx = 10, gw = (W - 112 - gx * 3) / 4
  nums.forEach(([val, label], i) => {
    const x = left + i * (gw + gx), y = top + 78
    roundRectPath(c, x, y, gw, 70, 14)
    c.fillStyle = vBg2; c.globalAlpha = 0.55; c.fill(); c.globalAlpha = 1
    c.strokeStyle = vHairline; c.lineWidth = 1; c.stroke()
    c.fillStyle = vTx
    c.font = '700 27px -apple-system, sans-serif'; c.textBaseline = 'alphabetic'
    c.fillText(val, x + 16, y + 42)
    c.fillStyle = vCap; c.font = '400 13px -apple-system, sans-serif'
    c.fillText(label, x + 16, y + 60)
  })

  // 语言分布
  const langs = Object.entries(s.languages || {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 4)
  const total = s.loc || 1
  if (langs.length) {
    c.fillStyle = vTx3; c.font = '600 13px -apple-system, sans-serif'
    c.fillText('语言分布', left, top + 190)
    let y = top + 218
    for (const [name, n] of langs) {
      const pct = Math.round(((n as number) / total) * 100)
      c.fillStyle = vTx; c.font = '500 14px -apple-system, sans-serif'
      c.fillText(String(name), left, y)
      const bx = left + 88, bh = 14, by = y - 12, bwt = W - 112 - 88 - 40
      roundRectPath(c, bx, by, bwt, bh, 7)
      c.fillStyle = vHairline; c.fill()
      const col = LANG_COLOR[name] || vAccent
      roundRectPath(c, bx, by, Math.max(7, bwt * pct / 100), bh, 7)
      c.fillStyle = col; c.fill()
      c.fillStyle = vCap; c.font = '400 13px -apple-system, sans-serif'
      c.fillText(pct + '%', bx + bwt + 8, y)
      y += 26
    }
  }

  // footer
  c.fillStyle = vTx3; c.font = '400 14px -apple-system, sans-serif'
  c.fillText('Made with Bloom for DSH', left, H - 52)
  c.fillStyle = vAccent; c.font = '700 14px -apple-system, sans-serif'
  c.fillText('⭐ 支持开源', W - 60 - 26 - 90, H - 52)
}

/** 渲染 stats 到 canvas 并转 PNG dataURL（预览 & 导出共用同一张）。 */
function renderCardDataURL(s: any): string {
  const canvas = document.createElement('canvas')
  drawStatsCard(canvas, s)
  return canvas.toDataURL('image/png')
}

/** 一键下载 PNG。 */
function exportStatsPNG(s: any) {
  const canvas = document.createElement('canvas')
  drawStatsCard(canvas, s)
  canvas.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `bloom-stats-${(s.project || 'card').replace(/[^\w-]/g, '_')}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }, 'image/png')
}

const STATS_SAMPLE: any = {
  project: 'dsh-bloom-theme', loc: 3864, files: 45, commits: 47, streak: 1,
  activeToday: true, lastCommitted: '32 小时前',
  languages: { TypeScript: 2148, Markdown: 910, JSON: 545, YAML: 235 },
}

let statsHideTimer: ReturnType<typeof setTimeout> | undefined
let currentStats: any = STATS_SAMPLE

/** 悬停浮层：在触发点附近弹出卡片预览 + 下载按钮；数据优先 fetch /bloom-stats.json。 */
function showStatsCard(anchor: HTMLElement) {
  let pop = document.getElementById('dsh-bloom-stats-pop')
  if (!pop) {
    pop = document.createElement('div')
    pop.id = 'dsh-bloom-stats-pop'
    pop.innerHTML = `
      <img alt="Bloom 代码统计卡" class="card"/>
      <button data-act="download" title="下载 PNG" class="dl">↓ 下载 PNG</button>`
    document.body.appendChild(pop)
    pop.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-act="download"]')) exportStatsPNG(currentStats)
    })
    // 悬停到浮层不闪关；离开浮层才收起
    pop.addEventListener('mouseenter', () => { clearTimeout(statsHideTimer) })
    pop.addEventListener('mouseleave', () => { hideStatsCard() })
  }
  // 定位到触发点下方偏右（右上角区域）
  const r = anchor.getBoundingClientRect()
  const pwidth = 400
  const x = Math.max(12, r.right - pwidth - 8)
  const y = r.bottom + 10
  pop.style.left = x + 'px'
  pop.style.top = y + 'px'
  pop.style.display = 'block'

  const img = pop.querySelector('img')!
  const load = () => {
    fetch('/bloom-stats.json', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((d) => { currentStats = d as any })
      .catch(() => { currentStats = STATS_SAMPLE })
      .finally(() => { img.src = renderCardDataURL(currentStats) })
  }
  load()
}
/** 收起悬停浮层（带一点延迟，避免移到浮层上时闪烁关闭）。 */
function hideStatsCard() {
  clearTimeout(statsHideTimer)
  statsHideTimer = setTimeout(() => {
    const pop = document.getElementById('dsh-bloom-stats-pop')
    if (pop) pop.style.display = 'none'
  }, 160)
}

/* 触发点：配色按钮左侧的小胶囊 + 悬停预览。 */
const STATS_TRIGGER_CSS = `
.dsh-bloom-stats-trigger{display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 10px;margin-right:2px;
  border-radius:9px;border:1px solid var(--bloom-hairline,rgba(0,0,0,.08));background:color-mix(in oklch,
  var(--dsw-alias-bg-layer-2,#fff),transparent 30%);color:var(--dsw-alias-label-secondary,#555);font:12px/1 -apple-system,
  'PingFang SC',sans-serif;cursor:pointer;transition:border-color .18s var(--bloom-ease),box-shadow .18s var(--bloom-ease)}
.dsh-bloom-stats-trigger:hover{border-color:color-mix(in oklch,var(--bloom-accent,#34698c) 45%,transparent);
  box-shadow:0 0 14px -6px var(--bloom-glow,rgba(146,168,179,.4))}
.dsh-bloom-stats-trigger .ic{font-size:13px}
.dsh-bloom-stats-trigger[data-open="true"]{border-color:color-mix(in oklch,var(--bloom-accent,#34698c) 55%,transparent);
  box-shadow:0 0 0 3px color-mix(in oklch,var(--bloom-accent,#34698c),transparent 78%)}
#dsh-bloom-stats-pop{position:fixed;z-index:2147483600;display:none;width:400px;
  font:14px/1.4 -apple-system,'PingFang SC',sans-serif}
#dsh-bloom-stats-pop .card{display:block;width:100%;border-radius:14px;
  border:1px solid var(--bloom-hairline,rgba(146,168,179,.35));
  box-shadow:0 16px 48px -20px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.12)}
#dsh-bloom-stats-pop .dl{margin-top:10px;width:100%;font:600 12px/1 -apple-system,sans-serif;padding:9px 12px;
  border-radius:10px;border:1px solid var(--bloom-hairline,rgba(146,168,179,.25));
  /* 玻璃：跟卡片玻璃感统一 —— 半透 + 模糊 + 玻璃边缘 + 外辉 */
  background:color-mix(in oklch,var(--dsw-alias-bg-layer-2,#fff) 64%,transparent);
  backdrop-filter:blur(14px) saturate(1.1);
  -webkit-backdrop-filter:blur(14px) saturate(1.1);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 8px 24px -16px rgba(0,0,0,.45);
  color:var(--dsw-alias-label-primary,#333);cursor:pointer;
  transition:background .18s var(--bloom-ease),color .18s var(--bloom-ease),border-color .18s var(--bloom-ease),box-shadow .18s var(--bloom-ease)}
#dsh-bloom-stats-pop .dl:hover{background:color-mix(in oklch,var(--bloom-accent,#34698c) 22%,transparent);
  border-color:color-mix(in oklch,var(--bloom-accent,#34698c) 55%,transparent);
  color:var(--dsw-alias-label-primary);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14),
    0 0 14px -4px color-mix(in oklch,var(--bloom-accent,#34698c) 60%,transparent),
    0 8px 24px -16px rgba(0,0,0,.45)}
@media (prefers-reduced-motion: reduce){#dsh-bloom-stats-pop,.dsh-bloom-stats-trigger{transition:none!important}}
`

/** 在配色切换器左侧插入统计胶囊（幂等、host/浮空都支持），并绑定悬停预览。 */
function injectStatsTrigger(host: HTMLElement | null, switcher: HTMLElement) {
  let btn = document.querySelector<HTMLElement>('.dsh-bloom-stats-trigger')
  if (!btn) {
    btn = document.createElement('button')
    ;(btn as HTMLButtonElement).type = 'button'
    btn.className = 'dsh-bloom-stats-trigger'
    btn.setAttribute('aria-haspopup', 'true')
    btn.innerHTML = '<span class="ic">💎</span><span>统计</span>'
    btn.addEventListener('mouseenter', () => {
      btn!.dataset.open = 'true'
      showStatsCard(btn!)
    })
    btn.addEventListener('mouseleave', () => {
      btn!.dataset.open = 'false'
      hideStatsCard()
    })
    // 悬停到浮层不闪关
    const pop = () => document.getElementById('dsh-bloom-stats-pop')
    document.addEventListener('mouseover', (e) => {
      const p = pop()
      if (p && p.contains(e.target as Node)) clearTimeout(statsHideTimer)
    })
  }
  const inHost = !!host && host.contains(switcher)
  const parent = inHost ? (host as HTMLElement) : document.body
  // 始终把胶囊放到切换器左侧（同父）
  if (btn.parentElement !== parent || btn.nextElementSibling !== switcher) {
    parent.insertBefore(btn, switcher)
  }
  if (inHost) {
    btn.style.position = ''; btn.style.top = ''; btn.style.right = ''; btn.style.zIndex = ''
  } else {
    // 浮空：固定定位到切换器左侧
    setTimeout(() => {
      if (!btn) return
      const sw = switcher.getBoundingClientRect()
      btn.style.position = 'fixed'
      btn.style.top = sw.top + 'px'
      btn.style.right = (window.innerWidth - sw.left + 6) + 'px'
      btn.style.zIndex = '9999'
    }, 0)
  }
  return btn
}

function injectSwitcher(initialVariant) {
  injectCSS(SWITCHER_CSS, 'switcher.css')
  injectCSS(STATS_TRIGGER_CSS, 'stats-trigger.css')
  refreshUpdateBadge()
  renderDshUpdate()
  void checkDshLatest()
  const existing = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
  const host = findSwitcherHost()
  if (existing) {
    // 已存在但宿主出现了（首屏时 header 还没渲染），迁进去
    if (host && !host.contains(existing)) {
      existing.dataset.floating = 'false'
      host.prepend(existing)
      injectStatsTrigger(host, existing)
    } else {
      injectStatsTrigger(host, existing)
    }
    return
  }
  const el = buildSwitcherEl(initialVariant)
  if (host) {
    el.dataset.floating = 'false'
    host.prepend(el)
    injectStatsTrigger(host, el)
  } else {
    el.dataset.floating = 'true'
    document.body.appendChild(el)
    injectStatsTrigger(null, el)
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
    const el = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
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
  injectCSS(GLASS_CSS, 'glass.css')
  const boot = () => {
    document.body.dataset.bloomVariant = variant
    injectSwitcher(variant)
    // header 通常晚于脚本渲染 —— 交给 observer 在宿主就绪后迁进去
    watchSwitcher(variant)
    watchThinkTags()
    checkUpdate()
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

  // DSH 走 module loader 注入，页面上通常没有带包名的 <script src> —— 不去扫 script。
  // 而且 DSH 的 web 服务 HEAD 不返回 etag / content-length，所以直接 GET 自己插件的
  // 官方 URL（${origin}/plugins/<包名>/client.js），对整个 body 算指纹比对：
  // 变了 = 你部署了新版，location.reload()。这套不依赖 import.meta / script 扫描，
  // vanilla 和 ESM 都安全。~85KB / 3s 在本地无所谓；线上不启用（localhost 才生效）。
  const myUrl = `${location.origin}/plugins/${PLUGIN_ID}/client.js`
  let initialKey: string | null = null

  // 极简 FNV-1a 32-bit，避免引 crypto / 异步 SubtleCrypto
  const fnv1a = (s: string) => {
    let h = 2166136261 >>> 0
    for (let i = 0; i < s.length; i++) { h = (h ^ s.charCodeAt(i)) * 16777619 >>> 0 }
    return h.toString(36)
  }

  const check = async () => {
    try {
      const r = await fetch(`${myUrl}?t=${Date.now()}`, { cache: 'no-store' })
      if (!r.ok) return
      const text = await r.text()
      const key = fnv1a(text) + ':' + text.length
      if (initialKey === null) { initialKey = key; return }
      if (key !== initialKey) location.reload()
    } catch (_) { /* 网络抖动忽略 */ }
  }
  check()                                            // 首次记录基线
  setInterval(check, 3000)                           // 3 秒一次
})()

/** ── 更新检测：npm 有新版本时提醒老用户 ─────────────────────────────────────
 *
 * 背景：主题插件装在 ~/.dsh/profiles/web/node_modules 里，用户不会主动升级；
 * 发了新版（新变体/修 bug）老用户无感知。这里做被动提醒。
 *
 * 机制（全部浏览器端，零 node 侧依赖）：
 *   1. 「当前版本」来自 PLUGIN_VERSION 常量（scripts/sync-version.mjs 随发版自动同步）
 *   2. 「最新版本」查 https://registry.npmjs.org/@kubor/dsh-bloom-theme/latest
 *      取响应里的 version 字段。⚠️ 必须用这个端点：npm registry 只有完整
 *      manifest 端点带 CORS 头（access-control-allow-origin: *），精简的
 *      /-/package/<id>/dist-tags 端点不带，浏览器会拦 —— 实测过别改回去。
 *   3. 24h 节流：结果缓存在 localStorage，一天最多查一次（远端浏览器无持久化时降级为每次查）
 *   4. 用户关掉的版本不再弹（新版本号出现后重新弹一次）
 *   5. 一切失败静默：断网/CORS 被拦/registry 抽风都不影响主题本身
 */
;(function installUpdateCheck() {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return

  const REGISTRY = 'https://registry.npmjs.org/' + PLUGIN_ID + '/latest'
  const CHECK_TTL_MS = 24 * 60 * 60 * 1000
  const LS_LAST = 'dsh-bloom-update-check'      // { at, latest } 上次检查
  const LS_DISMISSED = 'dsh-bloom-update-dismissed' // 已关闭的版本号
  const UPDATE_CMD = 'dsh plugin --profile web up ' + PLUGIN_ID + '@latest'
  const RELEASES_URL = 'https://github.com/webkubor/dsh-bloom-theme/releases'
  const zh = (navigator.language || '').toLowerCase().startsWith('zh')

  /** a > b ？（major.minor.patch 数值比；release > prerelease；预发布串比字符串，够用） */
  function isNewer(a, b) {
    const [va, pa] = a.split('-'), [vb, pb] = b.split('-')
    const na = va.split('.').map(Number), nb = vb.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if ((na[i] || 0) !== (nb[i] || 0)) return (na[i] || 0) > (nb[i] || 0)
    }
    if (!pa && pb) return true
    if (pa && !pb) return false
    if (pa && pb) return pa > pb
    return false
  }

  const ls = {
    get(k) { try { return window.localStorage.getItem(k) } catch { return null } },
    set(k, v) { try { window.localStorage.setItem(k, v) } catch {} },
  }

  function showBanner(latest) {
    if (document.getElementById('dsh-bloom-update-banner')) return
    const dismissed = ls.get(LS_DISMISSED)
    if (dismissed === latest) return

    const el = document.createElement('div')
    el.id = 'dsh-bloom-update-banner'
    el.setAttribute('role', 'status')
    el.innerHTML = `
      <style>
        #dsh-bloom-update-banner{position:fixed;right:20px;bottom:20px;z-index:2147483000;
          max-width:340px;padding:14px 16px;border-radius:14px;
          background:var(--bloom-glass-bg,rgba(255,255,255,0.72));
          backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);
          border:1px solid var(--bloom-hairline,rgba(146,168,179,0.35));
          box-shadow:var(--bloom-shadow,0 10px 30px rgba(0,0,0,0.18));
          font:12.5px/1.6 system-ui,-apple-system,'PingFang SC','Segoe UI',sans-serif;
          color:var(--bloom-tx,inherit);animation:bloom-up-in .45s cubic-bezier(.2,.9,.3,1.2)}
        @keyframes bloom-up-in{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
        #dsh-bloom-update-banner a{color:var(--bloom-accent,#34698c);font-weight:600;text-decoration:none}
        #dsh-bloom-update-banner a:hover{text-decoration:underline}
        #dsh-bloom-update-banner code{font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
          display:block;margin:8px 0;padding:6px 8px;border-radius:8px;word-break:break-all;
          background:var(--bloom-code-bg,rgba(146,168,179,0.13));color:var(--bloom-code-fg,inherit)}
        #dsh-bloom-update-banner .bloom-upd-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
        #dsh-bloom-update-banner button{font:12px/1 system-ui,sans-serif;padding:7px 12px;border-radius:9px;
          cursor:pointer;border:1px solid var(--bloom-hairline-strong,rgba(146,168,179,0.55));
          background:transparent;color:var(--bloom-tx,inherit);transition:all .18s}
        #dsh-bloom-update-banner button:hover{border-color:var(--bloom-accent,#34698c);
          color:var(--bloom-accent,#34698c)}
        #dsh-bloom-update-banner button[data-primary]{background:var(--bloom-accent,#34698c);
          color:#fff;border-color:transparent}
        #dsh-bloom-update-banner button[data-primary]:hover{filter:brightness(1.12)}
        #dsh-bloom-update-banner .bloom-upd-x{position:absolute;top:6px;right:8px;border:none!important;
          background:none!important;padding:4px!important;font-size:14px!important;line-height:1!important}
      </style>
      <div class="bloom-upd-x" title="${zh ? '关闭（此版本不再提醒）' : 'Dismiss'}">×</div>
      <div>🌸 <strong>${zh ? 'Bloom 主题有新版本' : 'Bloom theme update'}</strong>
        ${latest} ${zh ? '可用' : 'available'}<span style="opacity:.65">（${zh ? '当前' : 'current'} ${PLUGIN_VERSION}）</span></div>
      <code>${UPDATE_CMD}</code>
      <div class="bloom-upd-actions">
        <button data-primary data-act="copy">${zh ? '复制更新命令' : 'Copy command'}</button>
        <button data-act="open">${zh ? '更新日志' : 'Changelog'}</button>
      </div>`
    el.querySelector<HTMLElement>('.bloom-upd-x').addEventListener('click', () => {
      ls.set(LS_DISMISSED, latest)
      el.remove()
    })
    el.querySelector<HTMLElement>('[data-act="copy"]').addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLElement
      navigator.clipboard?.writeText(UPDATE_CMD).then(() => {
        btn.textContent = zh ? '✓ 已复制' : '✓ Copied'
        setTimeout(() => (btn.textContent = zh ? '复制更新命令' : 'Copy command'), 1600)
      }).catch(() => {})
    })
    el.querySelector<HTMLElement>('[data-act="open"]').addEventListener('click', () => {
      window.open(RELEASES_URL + '/tag/v' + latest, '_blank', 'noopener')
    })
    document.body.appendChild(el)
  }

  function check() {
    // 24h 节流：上次查过且结论是「已是最新」，直接跳过网络请求
    try {
      const last = JSON.parse(ls.get(LS_LAST) || 'null')
      if (last && Date.now() - last.at < CHECK_TTL_MS && last.latest === PLUGIN_VERSION) return
    } catch {}

    const ctrl = typeof AbortController === 'function' ? new AbortController() : null
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 5000) : null

    fetch(REGISTRY, { cache: 'no-store', signal: ctrl?.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((manifest) => {
        const latest = manifest && manifest.version
        if (typeof latest !== 'string') return
        ls.set(LS_LAST, JSON.stringify({ at: Date.now(), latest }))
        if (isNewer(latest, PLUGIN_VERSION)) showBanner(latest)
      })
      .catch(() => {}) // 断网 / 超时 / 被拦 —— 静默，绝不影响主题
      .finally(() => timer && clearTimeout(timer))
  }

  // 不抢首屏：等 DSH 壳渲染完再查
  setTimeout(check, 4000)
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
    const exports: Record<string, unknown> = {}
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    exports.apply = function apply() {
      // 顶层 IIFE 已注入；此处兜底：cordis materialize 时再确认一次。
      if (typeof document === 'undefined') return
      const variant = readVariant()
      if (!document.querySelector<HTMLElement>('style[data-plugin-css="' + PLUGIN_ID + '/bloom.css"]')) {
        injectCSS(buildBloomCSS(), 'bloom.css')
      }
      if (!document.querySelector<HTMLElement>('style[data-plugin-css="' + PLUGIN_ID + '/components.css"]')) {
        injectCSS(COMPONENT_CSS, 'components.css')
      }
      if (!document.querySelector<HTMLElement>('style[data-plugin-css="' + PLUGIN_ID + '/glass.css"]')) {
        injectCSS(GLASS_CSS, 'glass.css')
      }
      document.body.dataset.bloomVariant = variant
      injectSwitcher(variant)
      watchSwitcher(variant)
      watchThinkTags()
    }

    return exports
  },
})
