/**
 * 10 套莫兰迪配色的色板与标签 —— 纯数据 + 一个色彩工具函数，不 import 任何东西。
 *
 * **双轨制不能退回单轨**（见 CONTRIBUTING「改配色时注意」）：
 *   accentL / accentD  可读轨 —— 文字、按钮填充、边框，必须过 WCAG AA
 *   morandi            气质轨 —— 只用于 rgba(morandi, 0.05~0.2) 的大面积氛围渐变、
 *                      冷光细线、边框阶梯（暗色档）
 * 拿可读轨铺大面积、或拿气质轨做文字色，都会失去莫兰迪质感。
 */

export const VARIANTS = ['mist', 'cinnabar', 'petal', 'ripple', 'sage', 'stone', 'lapis', 'amber', 'aurora', 'lavender']

export const OTHER_VARIANTS = ['cinnabar', 'petal', 'ripple', 'sage', 'stone', 'lapis', 'amber', 'aurora', 'lavender']

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
 * 亮色 accent 的 L 值已按 WCAG AA(4.5:1) 反推校准（底色为各变体的 bgL）。
 * accent × bg 实测对比度（10 变体 × 明暗，全部 ≥ 4.5:1）——
 * 这一对同时也是主按钮的 fill × dimmed（见 tokens.ts 的 button-primary-dimmed）：
 *
 *   变体       亮色     暗色        变体       亮色     暗色
 *   mist     5.28:1   5.96:1      stone    5.48:1   7.77:1
 *   cinnabar 4.87:1   5.63:1      lapis    5.63:1   7.31:1
 *   petal    4.55:1   6.07:1      amber    4.54:1   7.65:1
 *   ripple   4.61:1   8.51:1      aurora   5.10:1   7.74:1
 *   sage     4.53:1   7.42:1      lavender 5.24:1   6.81:1
 *
 * 最紧的是 sage 亮色 4.53:1 —— 改任何变体的 accentL/bgL 前先重算，
 * 别只看「颜色好不好看」。（此前这段注释停在 petal 3.55 / ripple 3.02，
 * 那是校准**前**的值，且自相矛盾地标着「达标」。）
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
  /* v0.9.0：用户反馈暗色琥珀「过暗、发闷」。
     原版 bgD 21.9% / txD hue 75（暖白），全是 56~75 暖色相、没有冷色衬底，
     整图就「红橙棕一片」。把 bg/sf 提亮一档（保持暖度），让暗色琥珀呼吸出来；
     txD 改成中性微暖，让暖白 vs 暖棕之间还有一丝冷暖差可对比。 */
  amber: {
    accentL: 'oklch(55.5% 0.12 70)',  accentD: 'oklch(78% 0.11 70)',
    morandi: '159, 100, 1',
    bgL: 'oklch(97.5% 0.008 74)',     bgD: 'oklch(26% 0.018 60)',
    txL: 'oklch(24% 0.02 74)',        txD: 'oklch(95% 0.008 70)',
    sfL: 'oklch(95.6% 0.01 82)',      sfD: 'oklch(32% 0.020 60)',
    sf2L: 'oklch(93% 0.014 78)',      sf2D: 'oklch(38% 0.022 60)',
    motionL: ['oklch(55.5% 0.12 70)', 'oklch(55.5% 0.11 38)', 'oklch(55.5% 0.12 100)'],
    motionD: ['oklch(78% 0.11 70)', 'oklch(78% 0.12 38)', 'oklch(78% 0.11 100)'],
  },
  /* v0.12.x：落霞（原「极光」，owner 2026-09-14 反馈「极光颜色不好看」）——
     青绿→蓝→紫的北极光谱整族换成**橙黄系**：明亮金橙（hue 78）为主，
     motion 三色取 78/55/35 的金→橙→珊瑚日落谱，「流线」背景随之变成晚霞。
     与琥珀的区分：琥珀是压暗的棕橙（morandi 159,100,1，C 0.11~0.12），
     落霞提亮一档、彩度更高（morandi 218,158,72，accent C 0.145），读作「金」而非「棕」。
     accent×bg 两档对比度由 contrast-guard 守着，改完必须跑 npm run check。 */
  aurora: {
    accentL: 'oklch(55% 0.145 72)',   accentD: 'oklch(80% 0.13 72)',
    morandi: '218, 158, 72',
    /* v0.12.1：底色去黄（owner 2026-09-15 反馈「视觉不舒服、不高级、有点脏」）。
       原因是**背景自己带色**：bgL 彩度 0.012 @ hue 80 是全套最高，而 hue 80 正是
       芥末黄区，97.5% 亮度下大面积铺开就成了「发黄的旧纸」。同为金橙的琥珀只有
       0.008 @ hue 74，干净得多 —— 差别不在色相在彩度。
       改法：底色系彩度压到 0.004~0.006（回到近中性），色相 80→72 避开黄绿；
       暖色全部集中到 accent 与 motion 上。高级感来自「底色干净、强调克制」，
       不是把主色摊到整个背景上。 */
    bgL: 'oklch(98% 0.004 72)',       bgD: 'oklch(24.5% 0.008 70)',
    txL: 'oklch(24% 0.012 72)',       txD: 'oklch(95% 0.005 72)',
    sfL: 'oklch(96.2% 0.005 72)',     sfD: 'oklch(30.5% 0.01 70)',
    sf2L: 'oklch(93.4% 0.007 72)',    sf2D: 'oklch(36.5% 0.012 70)',
    motionL: ['oklch(55% 0.145 72)', 'oklch(56% 0.15 50)', 'oklch(56% 0.13 32)'],
    motionD: ['oklch(80% 0.13 72)', 'oklch(80% 0.14 50)', 'oklch(80% 0.12 32)'],
  },
  /* v0.12.0：薰衣草 —— 灰调紫。hue 295 卡在 mist(240) 与 petal(350) 中间，
     跟两边都拉得开；彩度压到 0.10~0.11（比 petal 的 0.22 低一半），
     紫一旦上彩度就变霓虹，莫兰迪的紫必须是"蒙了一层灰的紫"。
     motion 三色取 265/295/325，是同一束紫光偏冷偏暖的两侧。 */
  lavender: {
    accentL: 'oklch(52% 0.11 295)',   accentD: 'oklch(75% 0.11 295)',
    morandi: '164, 148, 190',
    bgL: 'oklch(97% 0.012 295)',      bgD: 'oklch(26% 0.02 295)',
    txL: 'oklch(25% 0.02 295)',       txD: 'oklch(96% 0.012 295)',
    sfL: 'oklch(95% 0.014 295)',      sfD: 'oklch(32% 0.022 295)',
    sf2L: 'oklch(92.5% 0.016 295)',   sf2D: 'oklch(38% 0.024 295)',
    motionL: ['oklch(52% 0.11 295)', 'oklch(52% 0.10 265)', 'oklch(53% 0.12 325)'],
    motionD: ['oklch(75% 0.11 295)', 'oklch(75% 0.11 265)', 'oklch(76% 0.12 325)'],
  },
}

export const VARIANT_LABELS = {
  // 中文名一律「两字 · 中国风 · 有出处」，且必须对得上实际色相（owner 2026-09-15 定）。
  // key 全部保持不动 —— key 写进了用户的本地偏好，改 key 等于把人家选好的主题弄丢。
  //
  // poem 是配色右侧那一列：原来放英文名（Mist/Cinnabar…），对中文用户没有信息量
  // （owner：「后面的英文没啥意义，不如一句诗词呢」）。换成该色的出处诗句后，
  // 中国风就从名字渗进了界面本身。en 保留给英文 locale。
  mist:     { zh: '黛蓝', en: 'Mist',      poem: '山色有无中' },   // hue 240 · 王维《汉江临泛》
  cinnabar: { zh: '朱砂', en: 'Cinnabar',  poem: '日出江花红胜火' },   // hue 25  · 白居易《忆江南》
  petal:    { zh: '桃夭', en: 'Petal',     poem: '灼灼其华' },     // hue 350 ·《诗经·周南·桃夭》
  ripple:   { zh: '天青', en: 'Ripple',    poem: '雨过天青云破处' },   // hue 195 · 宋徽宗品汝窑语
  sage:     { zh: '竹青', en: 'Sage',      poem: '绿竹猗猗' },     // hue 115 ·《诗经·卫风·淇奥》
  stone:    { zh: '赭石', en: 'Stone',     poem: '秋山敛余照' },   // hue 29  · 王维《木兰柴》
  lapis:    { zh: '青金', en: 'Lapis',     poem: '碧海青天夜夜心' },   // hue 258 · 李商隐《嫦娥》
  amber:    { zh: '琥珀', en: 'Amber',     poem: '玉碗盛来琥珀光' },   // hue 70  · 李白《客中行》
  aurora:   { zh: '落霞', en: 'Afterglow', poem: '落霞与孤鹜齐飞' },   // hue 72  · 王勃《滕王阁序》
  lavender: { zh: '青莲', en: 'Lavender',  poem: '清水出芙蓉' },   // hue 295 · 李白《经乱离后天恩流夜郎》
}

/** oklch 混透明度的简写（在 oklch 空间里混合，色相/彩度不漂移） */
export const mix = (c, p) => `color-mix(in oklch, ${c}, transparent ${p}%)`
