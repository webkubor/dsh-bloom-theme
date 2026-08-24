/**
 * 8 套莫兰迪配色的色板与标签 —— 纯数据 + 一个色彩工具函数，不 import 任何东西。
 *
 * **双轨制不能退回单轨**（见 CONTRIBUTING「改配色时注意」）：
 *   accentL / accentD  可读轨 —— 文字、按钮填充、边框，必须过 WCAG AA
 *   morandi            气质轨 —— 只用于 rgba(morandi, 0.05~0.2) 的大面积氛围渐变、
 *                      冷光细线、边框阶梯（暗色档）
 * 拿可读轨铺大面积、或拿气质轨做文字色，都会失去莫兰迪质感。
 */

export const VARIANTS = ['mist', 'cinnabar', 'petal', 'ripple', 'sage', 'stone', 'lapis', 'amber']

export const OTHER_VARIANTS = ['cinnabar', 'petal', 'ripple', 'sage', 'stone', 'lapis', 'amber']

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
export const PALETTE = {
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

export const VARIANT_LABELS = {
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
export const mix = (c, p) => `color-mix(in oklch, ${c}, transparent ${p}%)`
