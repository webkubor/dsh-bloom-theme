/* @kubor/dsh-bloom-theme v0.10.0 —— 由 scripts/bundle.mjs 从 src/*.ts 打包生成，请勿直接编辑。
   源码入口 src/client.ts；改完跑 npm run build。 */
(() => {
  // src/meta.ts
  var STORAGE_KEY = "dsh-bloom-variant";
  var PLUGIN_ID = "@kubor/dsh-bloom-theme";
  var PLUGIN_VERSION = "0.10.0";

  // src/palette.ts
  var VARIANTS = ["mist", "cinnabar", "petal", "ripple", "sage", "stone", "lapis", "amber", "aurora"];
  var OTHER_VARIANTS = ["cinnabar", "petal", "ripple", "sage", "stone", "lapis", "amber", "aurora"];
  var PALETTE = {
    mist: {
      accentL: "oklch(50% 0.08 240)",
      accentD: "oklch(72% 0.12 240)",
      morandi: "146, 168, 179",
      bgL: "oklch(96% 0.01 240)",
      bgD: "oklch(28% 0.02 240)",
      txL: "oklch(25% 0.02 240)",
      txD: "oklch(96% 0.01 240)",
      sfL: "oklch(94% 0.01 240)",
      sfD: "oklch(34% 0.02 240)",
      sf2L: "oklch(91% 0.01 240)",
      sf2D: "oklch(40% 0.02 240)",
      motionL: ["oklch(50% 0.08 240)", "oklch(50% 0.10 210)", "oklch(50% 0.09 275)"],
      motionD: ["oklch(72% 0.12 240)", "oklch(74% 0.13 210)", "oklch(74% 0.11 275)"]
    },
    cinnabar: {
      accentL: "oklch(55% 0.18 25)",
      accentD: "oklch(72% 0.12 25)",
      morandi: "215, 75, 75",
      bgL: "oklch(97% 0.005 25)",
      bgD: "oklch(28% 0.02 25)",
      txL: "oklch(25% 0.02 25)",
      txD: "oklch(96% 0.01 25)",
      sfL: "oklch(95% 0.005 25)",
      sfD: "oklch(34% 0.02 25)",
      sf2L: "oklch(92% 0.005 25)",
      sf2D: "oklch(40% 0.02 25)",
      motionL: ["oklch(55% 0.18 25)", "oklch(55% 0.16 65)", "oklch(55% 0.15 350)"],
      motionD: ["oklch(72% 0.12 25)", "oklch(74% 0.14 65)", "oklch(73% 0.13 350)"]
    },
    petal: {
      accentL: "oklch(58% 0.22 350)",
      accentD: "oklch(75% 0.18 350)",
      morandi: "232, 133, 155",
      bgL: "oklch(98% 0.01 350)",
      bgD: "oklch(28% 0.02 350)",
      txL: "oklch(25% 0.02 354)",
      txD: "oklch(98% 0.01 350)",
      sfL: "oklch(96% 0.015 350)",
      sfD: "oklch(34% 0.02 350)",
      sf2L: "oklch(94% 0.015 350)",
      sf2D: "oklch(40% 0.02 350)",
      motionL: ["oklch(58% 0.22 350)", "oklch(58% 0.17 310)", "oklch(58% 0.17 20)"],
      motionD: ["oklch(75% 0.18 350)", "oklch(75% 0.14 310)", "oklch(76% 0.14 20)"]
    },
    ripple: {
      accentL: "oklch(51% 0.12 195)",
      accentD: "oklch(75% 0.12 195)",
      morandi: "95, 168, 178",
      bgL: "oklch(96% 0.01 195)",
      bgD: "oklch(20% 0.02 195)",
      txL: "oklch(25% 0.02 195)",
      txD: "oklch(96% 0.01 195)",
      sfL: "oklch(94% 0.01 195)",
      sfD: "oklch(28% 0.02 195)",
      sf2L: "oklch(92% 0.01 195)",
      sf2D: "oklch(38% 0.02 195)",
      motionL: ["oklch(51% 0.12 195)", "oklch(51% 0.13 225)", "oklch(51% 0.11 165)"],
      motionD: ["oklch(75% 0.12 195)", "oklch(76% 0.14 225)", "oklch(77% 0.12 165)"]
    },
    /* v0.5.0 新增（源自 typora-Bloom-theme 成功变体）：
       色值由 Typora dist/*.css 的 accent/bg/surface/text 直接转 oklch，hue 对齐原版 */
    sage: {
      accentL: "oklch(54.1% 0.111 115)",
      accentD: "oklch(71.9% 0.120 115)",
      morandi: "138, 154, 91",
      bgL: "oklch(97% 0.011 112)",
      bgD: "oklch(20% 0.019 113)",
      txL: "oklch(25% 0.02 116)",
      txD: "oklch(96% 0.011 118)",
      sfL: "oklch(94.9% 0.009 113)",
      sfD: "oklch(27.9% 0.02 116)",
      sf2L: "oklch(91.9% 0.009 113)",
      sf2D: "oklch(34% 0.03 116)",
      motionL: ["oklch(54.1% 0.111 115)", "oklch(54.1% 0.12 83)", "oklch(54.1% 0.10 152)"],
      motionD: ["oklch(71.9% 0.120 115)", "oklch(71.9% 0.13 83)", "oklch(71.9% 0.11 152)"]
    },
    stone: {
      accentL: "oklch(49.9% 0.06 29)",
      accentD: "oklch(75% 0.12 30)",
      morandi: "180, 160, 155",
      bgL: "oklch(95.9% 0.01 25)",
      bgD: "oklch(20.1% 0.019 30)",
      txL: "oklch(25% 0.02 29)",
      txD: "oklch(95.9% 0.01 25)",
      sfL: "oklch(94.1% 0.01 33)",
      sfD: "oklch(27.9% 0.02 28)",
      sf2L: "oklch(91% 0.01 33)",
      sf2D: "oklch(33.9% 0.03 28)",
      motionL: ["oklch(49.9% 0.06 29)", "oklch(49.9% 0.075 0)", "oklch(49.9% 0.07 60)"],
      motionD: ["oklch(75% 0.12 30)", "oklch(75% 0.13 0)", "oklch(75% 0.11 62)"]
    },
    lapis: {
      accentL: "oklch(50% 0.13 258)",
      accentD: "oklch(74% 0.10 255)",
      morandi: "47, 98, 172",
      bgL: "oklch(97.4% 0.006 240)",
      bgD: "oklch(23.1% 0.019 249)",
      txL: "oklch(23% 0.02 249)",
      txD: "oklch(96.1% 0.008 237)",
      sfL: "oklch(95.6% 0.008 242)",
      sfD: "oklch(30.1% 0.022 251)",
      sf2L: "oklch(92.4% 0.013 244)",
      sf2D: "oklch(35.9% 0.025 251)",
      motionL: ["oklch(50% 0.13 258)", "oklch(50% 0.12 226)", "oklch(50% 0.11 295)"],
      motionD: ["oklch(74% 0.10 255)", "oklch(74% 0.11 225)", "oklch(74% 0.10 292)"]
    },
    /* v0.9.0：用户反馈暗色琥珀「过暗、发闷」。
       原版 bgD 21.9% / txD hue 75（暖白），全是 56~75 暖色相、没有冷色衬底，
       整图就「红橙棕一片」。把 bg/sf 提亮一档（保持暖度），让暗色琥珀呼吸出来；
       txD 改成中性微暖，让暖白 vs 暖棕之间还有一丝冷暖差可对比。 */
    amber: {
      accentL: "oklch(55.5% 0.12 70)",
      accentD: "oklch(78% 0.11 70)",
      morandi: "159, 100, 1",
      bgL: "oklch(97.5% 0.008 74)",
      bgD: "oklch(26% 0.018 60)",
      txL: "oklch(24% 0.02 74)",
      txD: "oklch(95% 0.008 70)",
      sfL: "oklch(95.6% 0.01 82)",
      sfD: "oklch(32% 0.020 60)",
      sf2L: "oklch(93% 0.014 78)",
      sf2D: "oklch(38% 0.022 60)",
      motionL: ["oklch(55.5% 0.12 70)", "oklch(55.5% 0.11 38)", "oklch(55.5% 0.12 100)"],
      motionD: ["oklch(78% 0.11 70)", "oklch(78% 0.12 38)", "oklch(78% 0.11 100)"]
    },
    /* v0.9.0：极光 —— 北极光的青绿 → 蓝 → 紫光谱，莫兰迪化后压低彩度。
       主色走 165 hue 的青绿（极光最典型的颜色），motion 三色取光谱
       165/210/300，正好是「流线」与 deep-dive 渐变要用的流动色源。 */
    aurora: {
      accentL: "oklch(50% 0.10 165)",
      accentD: "oklch(75% 0.12 165)",
      morandi: "134, 186, 160",
      bgL: "oklch(96% 0.015 165)",
      bgD: "oklch(24% 0.02 165)",
      txL: "oklch(25% 0.02 165)",
      txD: "oklch(96% 0.015 165)",
      sfL: "oklch(94% 0.015 165)",
      sfD: "oklch(30% 0.022 165)",
      sf2L: "oklch(91.5% 0.018 165)",
      sf2D: "oklch(36% 0.024 165)",
      motionL: ["oklch(50% 0.10 165)", "oklch(50% 0.11 210)", "oklch(52% 0.11 300)"],
      motionD: ["oklch(75% 0.12 165)", "oklch(75% 0.12 210)", "oklch(75% 0.12 300)"]
    }
  };
  var VARIANT_LABELS = {
    mist: { zh: "雾蓝", en: "Mist" },
    cinnabar: { zh: "朱砂", en: "Cinnabar" },
    petal: { zh: "花瓣", en: "Petal" },
    ripple: { zh: "涟漪", en: "Ripple" },
    sage: { zh: "鼠尾草", en: "Sage" },
    stone: { zh: "暖石", en: "Stone" },
    lapis: { zh: "青金", en: "Lapis" },
    amber: { zh: "琥珀", en: "Amber" },
    aurora: { zh: "极光", en: "Aurora" }
  };
  var mix = (c, p) => `color-mix(in oklch, ${c}, transparent ${p}%)`;

  // src/tokens.ts
  function bloomTokens(p, dark) {
    const tx = dark ? p.txD : p.txL;
    const m = p.morandi;
    const motion = dark ? p.motionD : p.motionL;
    return `
  --bloom-morandi: ${m};
  --bloom-accent: ${dark ? p.accentD : p.accentL};
  --bloom-motion-1: ${motion[0]};
  --bloom-motion-2: ${motion[1]};
  --bloom-motion-3: ${motion[2]};
  /* v0.9.0：极光流线光带色 —— 从 motion 谱取色，混透明度降饱和后做丝带渐变。
     透明度低是故意的：流线是大尺度、低饱和的氛围效果，不是主色块。
     aurora 变体的 motion 谱是 165/210/300 → 青绿→蓝→紫，正好是北极光。 */
  --bloom-aurora-stream-1: color-mix(in oklch, ${motion[0]}, transparent ${dark ? 40 : 60}%);
  --bloom-aurora-stream-2: color-mix(in oklch, ${motion[1]}, transparent ${dark ? 40 : 60}%);
  --bloom-aurora-stream-3: color-mix(in oklch, ${motion[2]}, transparent ${dark ? 40 : 60}%);
  /* ⚠️ 阴影在暗色下必须用纯黑，不能用前景色混透明度 ——
     暗色的 --text 是近白，mix 出来的"阴影"会变成一团白雾贴在深色背景上。
     原版 root-*-dark.css 同样是写死 rgba(0,0,0,.4~.6)，只有亮色才用 text 混。 */
  --bloom-shadow-sm: 0 2px 8px ${dark ? "rgba(0,0,0,0.4)" : mix(tx, 96)};
  --bloom-shadow: 0 10px 30px ${dark ? "rgba(0,0,0,0.5)" : mix(tx, 94)};
  --bloom-shadow-lg: 0 24px 60px ${dark ? "rgba(0,0,0,0.6)" : mix(tx, 90)};
  /* DSH 的品牌蓝 #679efe(--dsw-alias-state-business-primary)用在顶栏
     「对话 / 轨迹」tab 的选中文字与下划线等处。主题必须接管它,否则 8 套配色
     切来切去,那条选中下划线永远是蓝的、跟主色打架(用户实拍反馈)。
     注意只接管 alias 层 —— --dsw-static-deepseek-400 是 DSH 的品牌标识色,
     不属于主题可覆盖范围。 */
  --dsw-alias-state-business-primary: ${dark ? p.accentD : p.accentL};
  /* 玻璃模糊半径 —— glass.ts 里 10 处 backdrop-filter 都读它。
     之前只写了 var(--bloom-glass-blur, 24px) 却从未定义,fallback 一直生效所以
     视觉没问题,但这个变量是**死的**:想统一调玻璃质感根本改不到。定义出来之后
     它才真的是一个可调参数(暗色略薄一点,深色面板本就更"实"、不需要那么重的糊)。 */
  --bloom-glass-blur: ${dark ? "22px" : "24px"};
  --bloom-hairline: rgba(${m}, ${dark ? 0.3 : 0.3});
  --bloom-hairline-strong: rgba(${m}, ${dark ? 0.55 : 0.5});
  --bloom-glow: rgba(${m}, ${dark ? 0.34 : 0.2});
  --bloom-code-bg: rgba(${m}, ${dark ? 0.16 : 0.13});
  --bloom-code-fg: ${dark ? p.txD : p.txL};`;
  }
  function borderStack(p, dark) {
    const m = p.morandi;
    const tx = dark ? p.txD : p.txL;
    return dark ? `  --dsw-alias-border-l1: rgba(${m}, 0.10);
  --dsw-alias-border-l2: rgba(${m}, 0.18);
  --dsw-alias-border-l3: rgba(${m}, 0.28);
  --dsw-alias-border-l4: rgba(${m}, 0.40);` : `  --dsw-alias-border-l1: ${mix(tx, 90)};
  --dsw-alias-border-l2: ${mix(tx, 80)};
  --dsw-alias-border-l3: ${mix(tx, 70)};
  --dsw-alias-border-l4: ${mix(tx, 60)};`;
  }
  function labelStack(p, dark) {
    const tx = dark ? p.txD : p.txL;
    return dark ? `  --dsw-alias-label-secondary: ${mix(tx, 30)};
  --dsw-alias-label-tertiary: ${mix(tx, 35)};
  --dsw-alias-label-caption: ${mix(tx, 40)};
  --dsw-alias-label-dimmed: ${mix(tx, 43)};` : `  --dsw-alias-label-secondary: ${mix(tx, 28)};
  --dsw-alias-label-tertiary: ${mix(tx, 32)};
  --dsw-alias-label-caption: ${mix(tx, 35)};
  --dsw-alias-label-dimmed: ${mix(tx, 37)};`;
  }
  function sharedDswTokens(p, dark) {
    const bg = dark ? p.bgD : p.bgL;
    const tx = dark ? p.txD : p.txL;
    const ok = dark ? "oklch(72% 0.12 150)" : "oklch(45% 0.14 150)";
    const err = dark ? "oklch(72% 0.16 25)" : "oklch(45% 0.16 25)";
    const warn = dark ? "oklch(80% 0.12 75)" : "oklch(45% 0.11 75)";
    const t = (c, pct) => `color-mix(in oklch, ${c}, ${bg} ${pct}%)`;
    return `
  /* 状态色（语义色相固定，明暗分档，两档都过 WCAG AA） */
  --dsw-alias-state-success-primary: ${ok};
  --dsw-alias-state-success-secondary: ${ok};
  --dsw-alias-state-success-tertiary: ${t(ok, dark ? 78 : 88)};
  --dsw-alias-state-error-primary: ${err};
  --dsw-alias-state-error-secondary: ${err};
  --dsw-alias-state-warn-primary: ${warn};
  --dsw-alias-state-warn-secondary: ${warn};
  --dsw-alias-state-warn-tertiary: ${t(warn, dark ? 78 : 88)};
  --dsw-alias-state-warn-label: ${dark ? "oklch(88% 0.1 75)" : "oklch(40% 0.09 75)"};
  /* interactive-bg-* 是明确的**背景**语义，保持 transparent 混 —— 它要叠在各种
     底色上（行 hover、按钮 hover），预混 bg 反而会在非 bg 底色上露出色块。 */
  --dsw-alias-interactive-bg-hover-danger: ${mix(err, dark ? 86 : 90)};
  /* business = 主题 accent（bloomTokens 里已接管，这里给 tertiary 配套） */
  --dsw-alias-state-business-tertiary: ${t(dark ? p.accentD : p.accentL, dark ? 78 : 88)};
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
  --dsw-alias-bg-mask-photo: color-mix(in oklch, ${bg}, black ${dark ? 45 : 30}%);`;
  }
  function mistLight(p) {
    const { accentL: aL, bgL, txL, sfL, sf2L } = p;
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
  /* dimmed 的官方语义是「主按钮填充上的文字色」，与 fill 反向——
     官方亮色 fill=neutral-bluish-1000(#0f1115) / dimmed=neutral-bluish-100(#ebeef2)，
     官方暗色 fill=neutral-bluish-50(#f9fafb) / dimmed=neutral-bluish-750(#43454a)。
     曾误当作「accent 淡化」写成 mix(accent, 85)，于是任何按官方语义把它用作
     文字色的插件（如 @opendsh/dsh-plugin-scheduled-tasks 的 .dshst-btn-primary
     与 .dshst-tab-active）都得到「accent 文字叠在 accent 填充上」→ 对比度趋 0，
     按钮字不可见（#16）。
     这里取 bg 而非 label 类 token 是刻意的：fill 是 accent，而 accent 与 bg 在
     明暗之间反向翻转（亮色 accent 中深 / bg 浅，暗色 accent 亮 / bg 深），
     两个主题都成立；bloom 内 label-primary-foreground 与 brand-primary-invert
     早已用同一个值表达「品牌色块上的前景」，此处复用，不新造颜色。 */
  --dsw-alias-button-primary-dimmed: ${bgL};
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
`;
  }
  function mistDark(p) {
    const { accentD: aD, bgD, txD, sfD, sf2D } = p;
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
  /* 见亮色段说明：fill 上的文字色，与 fill 反向（#16） */
  --dsw-alias-button-primary-dimmed: ${bgD};
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
`;
  }
  function variantBlock(v, dark) {
    const p = PALETTE[v];
    const a = dark ? p.accentD : p.accentL;
    const bg = dark ? p.bgD : p.bgL;
    const tx = dark ? p.txD : p.txL;
    const sf = dark ? p.sfD : p.sfL;
    const sf2 = dark ? p.sf2D : p.sf2L;
    const sel = dark ? `body[data-ds-dark-theme][data-bloom-variant="${v}"]` : `body[data-bloom-variant="${v}"]`;
    return `
/* ─── Bloom · ${v}${dark ? " 暗色" : ""}（仅覆盖主色 + 背景调，骨架继承 mist）─────────── */
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
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${a}, ${dark ? "white" : "black"} 8%);
  /* 见亮色段说明：fill 上的文字色，与 fill 反向（#16） */
  --dsw-alias-button-primary-dimmed: ${bg};
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
  --dsw-specific-sidebar-fill: color-mix(in oklch, ${bg}, ${dark ? "black" : tx} ${dark ? 7 : 5}%);
  --dsw-specific-sidebar-nav-item-active-accent: ${mix(a, dark ? 80 : 86)};
  --dsw-specific-sidebar-nav-item-active: ${mix(a, dark ? 88 : 93)};
  --dsw-specific-sidebar-nav-item-hover: ${mix(tx, dark ? 95 : 95)};
  --dsw-specific-tip: ${mix(a, dark ? 84 : 90)};
}
`;
  }
  function buildBloomCSS() {
    const blocks = [mistLight(PALETTE.mist), mistDark(PALETTE.mist)];
    for (const v of OTHER_VARIANTS) {
      blocks.push(variantBlock(v, false), variantBlock(v, true));
    }
    return blocks.join("\n");
  }

  // src/css/component.ts
  var COMPONENT_CSS = `
/* ═══ 1. 氛围层 ═══════════════════════════════════════════════════
   原版 body 的三层叠加：大尺度径向光晕 + 斜向淡染 + 顶部柔光。
   全部用气质轨(morandi)的极低透明度，这是莫兰迪「灰调通透」的来源。

   v0.10.x（owner 反馈「没光感」）：把 veil 换成 aurora-stream 并提高透明度。
   aurora-stream 来自 motion 谱，是每个变体的三色光谱（鼠尾草=草绿系、青金=蓝系），
   透明度从原来的 40% 提高到 55-65%，让"四角色斑"真正能看出来 —— 这是
   "光感"的主要来源，不再靠硬边光带。 */
body {
  /* 抽成变量：输入区那块不透明底板要原样复刻同一份氛围（见 §1.5），
     两处必须逐字一致，否则底部会出现一道色阶。 */
  --bloom-ambience:
    /* 顶左：主色光晕（accent，给画面主调） */
    radial-gradient(1400px circle at 6% -4%, color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 80%), transparent 50%),
    /* 顶右：aurora stream 2 —— 异色相，跟主色形成对比 */
    radial-gradient(1100px circle at 100% 8%, color-mix(in oklch, var(--bloom-aurora-stream-2), transparent 50%), transparent 60%),
    /* 底右：aurora stream 3 —— 再一个异色相 */
    radial-gradient(900px circle at 96% 100%, color-mix(in oklch, var(--bloom-aurora-stream-3), transparent 50%), transparent 62%),
    /* 底左：aurora stream 1 —— 四角各一团 */
    radial-gradient(1000px circle at 2% 96%, color-mix(in oklch, var(--bloom-aurora-stream-1), transparent 50%), transparent 60%);
  background-attachment: fixed;
  background-image: var(--bloom-ambience);
}

/* ═══ 1.5 输入区底板：让氛围一路铺到窗口底边 ═══════════════════════
 *
 * owner 反馈「底部有种戛然而止的感觉」。实测原因：DSH 给 _composerSeat 铺了
 *   linear-gradient(transparent 0, oklch(0.28 0.02 25) 36px)
 * ——36px 内从透明冲到**不透明**，之后 90px 全是死板一块。氛围的左右色差
 * 在 y=721 还有 13 级，到 y=757 直接归零，窗口最下面 1/5 是块死色。
 *
 * 修法不是把它改透明（它要盖住滚到输入框背后的正文），而是**在这块不透明
 * 底板上原样重画一遍氛围**：同一份 --bloom-ambience + background-attachment:
 * fixed，光斑相对视口定位，于是和 body 那层严丝合缝地接上。
 *
 * 为什么要走 ::before + mask 而不是直接给 seat 叠背景：直接叠的话，渐变
 * 顶部那段半透明区域会**同时**透出 body 的氛围和自己画的氛围，双份叠加，
 * 实测顶端亮了 20 级。改成 ::before 承载「不透明底 + 氛围」整体，再用
 * mask 做同一条 56px 淡入 —— 淡入区里 ::before 本身是半透的，透出来的
 * 只有 body 那一份，不会重复。实测纵向逐行色差 0-1 级，无缝。
 *
 * ⚠️ 只用 position:absolute + z-index:-1，不引入 backdrop-filter / transform /
 * isolation —— seat 的子树里有 conversation.input.overlay 注入的 fixed 元素，
 * 判据同 glass.ts 侧栏那段。seat 自身是 position:sticky，已经是定位元素，
 * 不需要也不要去改它的 position。 */
/* 宿主那条是 .wSkVaW_root[data-phase="active"] .wSkVaW_composerSeat，特异度
   (0,3,0)；这里必须写满三段才压得过（(0,3,1)），少一段就还是它赢。 */
body[data-bloom-variant] [class*="_root"] [class*="_composerSeat"] {
  background-image: none;
}
body[data-bloom-variant] [class*="_root"] [class*="_composerSeat"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: var(--dsw-alias-bg-layer-1, #101010);
  background-image: var(--bloom-ambience);
  background-attachment: fixed;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
  mask-image: linear-gradient(to bottom, transparent 0, #000 56px);
}

/* 让 body 的氛围层透出来：DSH 这几个全屏容器自带不透明底色会盖住它。
   侧栏与卡片保留自己的 surface 色（原版同样保留），只做描边和光。 */
body[data-bloom-variant] [class*="_frame"],
body[data-bloom-variant] [class*="_centerCol"],
/* :has() 里不能加子组合器（\`> \`）：实测 DSH 的结构是 _root > _body > _scrollBody，
   scrollBody 是孙子。写成子选择器这条一直没命中 —— 会话区一直盖着
   oklch(0.28 0.02 240) 不透明底，body 的极光在中区完全看不见（这就是
   owner 说「没光感」的真正原因）。 */
body[data-bloom-variant] [class*="_root"]:has([class*="_scrollBody"]),
body[data-bloom-variant] [class*="_scrollBody"] {
  background-color: transparent;
  background-image: none;
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

/* 会话条目：圆角 + 过渡。hover / 选中的着色统一在 §6「会话行」那一处，
   这里不再重复一遍（曾经两处各写一遍 6% 和 7%，靠 !important 决定谁赢，
   等于用 !important 压自己人）。 */
[class*="_sidebarCol"] [role="treeitem"],
[class*="_sidebarCol"] [class*="_sessionRow"] {
  border-radius: 8px;
  transition: background 0.15s ease;
}
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"] [class*="_title"],
[class*="_sidebarCol"] [class*="_active"] [class*="_title"],
[class*="_sidebarCol"] [class*="_selected"] [class*="_title"] {
  font-weight: 500;
  color: var(--dsw-alias-label-primary);
}
/* v0.10.x（owner 反馈「脏」）：左侧 3px 蓝竖条是脏点 —— 莫兰迪克制不应有这种色块。
   删掉 ::before。选中感靠 bg 的 8% 染色传达。 */

/* 新建会话按钮：极淡底色，无 border，文字与图标都用主文字色（owner 反馈「脏」——
   之前 accent 色的 svg + accent 染色 bg + hairline border 三层叠，跟莫兰迪"统一克制"冲突）。
   现在的按钮只靠 5% accent 染色跟会话行区分，没有色块、没有边框、没有彩色文字。 */
[class*="_sidebarCol"] button[class*="_newSession"],
[class*="_sidebarCol"] button[class*="_newChat"] {
  background: color-mix(in oklch, var(--bloom-accent) 5%, transparent);
  border: 0;
  border-radius: 10px;
  transition: background 180ms ease;
}
[class*="_sidebarCol"] button[class*="_newSession"]:hover,
[class*="_sidebarCol"] button[class*="_newChat"]:hover {
  background: color-mix(in oklch, var(--bloom-accent) 12%, transparent);
}
/* 图标和文字都用主色 —— 不让 accent 出现在按钮上，跟莫兰迪统一 */
[class*="_sidebarCol"] button[class*="_newSession"] svg,
[class*="_sidebarCol"] button[class*="_newChat"] svg {
  color: var(--dsw-alias-label-primary);
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
   渐变只在顶部 120px 内，避免整列发灰。

   v0.10.x（owner 反馈「没层次感」）：之前光带 1px + 18% alpha 在截图里几乎
   看不见，侧栏和背景完全融成一片。这里两层：① 内部底色 4% accent 给容器
   自己的"色"，与 body 区分；② 顶部 120px 氛围染。右侧冷光线交给下面的
   ::after / ::before 双层（线 + 光晕），因为 box-shadow inset 会被 glass.ts
   的 _sidebarCol 规则覆盖掉（cascade 顺序），改用伪元素才不会被吃掉。 */
body[data-bloom-variant] [class*="_sidebarCol"] {
  /* 宿主那条 0.5px 实线优先级更高，不加 !important 关不掉（实测覆盖后仍是 0.5px） */
  border-right: 0;
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 96%);
  background-image: linear-gradient(
    180deg,
    color-mix(in oklch, var(--bloom-accent) 6%, transparent),
    transparent 120px
  );
  background-repeat: no-repeat;
  background-position: left top;
  background-size: 100% 100%;
}
/* 侧栏右缘的冷光交给 glass.ts 的 box-shadow（向外投）——
   这里曾用 ::after 画一条 18px 渐变，但侧栏 overflow:hidden，伪元素只能落在
   容器内侧，看上去是「向内发光」，owner 反馈很奇怪。box-shadow 的外阴影不受
   自身 overflow 裁剪，是唯一能真正往外散的做法。 */

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
    0 0 0 2px var(--bloom-glow);
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
body[data-bloom-variant] [class*="_tableScroll"] th,
body[data-bloom-variant] [class*="_tableScroll"] td {
  border-color: var(--bloom-hairline);
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
body[data-bloom-variant] [class*="_turnStatus"]:not([class*="_turnStatusClock"]) {
  background-image: linear-gradient(
    110deg,
    var(--bloom-motion-1) 0%,
    var(--bloom-motion-2) 24%,
    var(--bloom-motion-3) 43%,
    var(--bloom-motion-1) 60%,
    var(--bloom-motion-2) 78%,
    var(--bloom-motion-3) 100%
  );
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

/* ── 侧栏：去分割线，靠间距 + 极淡光感分组（owner 2026-09-10）──
 *
 * 反馈原话：「基本取消分割线，用行间距和浅色交替分组」「取消网格，增加当前行
 * 左侧粉色短竖条」「现在已经不流行通过 border 去做切割了，要不然就是很淡的
 * 边框线加光感流动或者是阴影，比硬的边框好看得多」。
 *
 * 所以这里一条实线都不画：分组之间用外边距拉开，组标题下方给一道
 * 极淡的渐隐光带（左浓右透，像一束扫过的光），比 1px 实线柔和得多。
 */
[class*="_sidebarCol"] [class*="_groupSection"] + [class*="_groupSection"] {
  margin-top: 10px;
}
[class*="_sidebarCol"] [class*="_projectRow"] {
  position: relative;
}
/* 组标题下的光带：从左侧主题色渐隐到透明，不是一条等宽的线 */
[class*="_sidebarCol"] [class*="_projectRow"]::after {
  content: '';
  position: absolute;
  left: 10px; right: 10px; bottom: 0;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(
    to right,
    color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 72%) 0%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%) 38%,
    transparent 100%
  );
}

/* 会话行：圆角 + hover 淡染，靠留白区分，不描边不画网格 */
[class*="_sidebarCol"] [class*="_sessionRow"] {
  position: relative;
  border-radius: 8px;
}
[class*="_sidebarCol"] [class*="_sessionRow"]:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 93%);
}

/* 当前行：只染色，不画条不画框（owner 反馈「脏」）
   之前有左侧 3px 蓝竖条 + inset 1px 边框 + 25% accent 实色底，三个都是脏点。
   现在只留一个 8% 的极淡 accent 染色，跟 hover 区分用细微浓淡差。

   这里不需要 !important（2026-09-10 实测推翻了原注释）：DSH 那条是
   .YDXeBa_sessionRow.YDXeBa_selected { background: var(--dsw-alias-interactive-bg-hover) }，
   特异度 (0,2,0) 且不带 !important，而本条 (0,3,0) 本来就赢；更何况
   --dsw-alias-interactive-bg-hover 早已被 tokens.ts 覆写成本主题的 accent，
   压根不是"固定蓝色"。 */
[class*="_sidebarCol"] [class*="_sessionRow"][class*="_selected"],
[class*="_sidebarCol"] [class*="_sessionRow"][class*="_active"],
[class*="_sidebarCol"] [class*="_sessionRow"][aria-selected="true"],
[class*="_sidebarCol"] [role="treeitem"][aria-selected="true"] {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
}

/* v0.10.x：左色条 + bloom-bar-in 动画整体删除（owner 反馈「脏」）。
   没有 ::before 了，bloom-bar-in keyframe 也跟着删。 */

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

/* ═══ 6.5 空状态视觉锚点 (v0.10.x) ═══════════════════════════════════
 *
 * owner 反馈「没层次感」：空状态下「探索未至之境」一行字飘在苍白画布上，
 * 眼睛找不到着陆位置。这里在 scrollBody 没有气泡时（即空状态），在中央
 * 投一团主题色光晕 + 慢呼吸，给视觉一个焦点。光晕跟 message 流重叠的
 * 概率低（消息堆在顶部），不会污染正常态。
 *
 * selector 限制条件：\`:not(:has([class*="_bubble"]))\` 确保只在没消息时出现；
 * 有消息时这条规则不匹配，::before 不渲染。\`:has()\` Chrome 105+/Safari 15.4+。 */
[class*="_scrollBody"] { position: relative; }
[class*="_scrollBody"]:not(:has([class*="_bubble"]))::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    42% 32% at 50% 48%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 86%) 0%,
    color-mix(in oklch, var(--bloom-aurora-stream-2), transparent 92%) 35%,
    transparent 68%
  );
  animation: bloom-anchor-breathe 4.2s ease-in-out infinite;
}
@keyframes bloom-anchor-breathe {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.05); }
}

/* ═══ 7. 全站统一入场系统 (v0.10.x) ═════════════════════════════════
 *
 * owner 反馈：「除了深度求索中的文字有动效外，别的几乎是没有任何吸引到我的动画」
 * ——所以这一节专门把页面"活起来"：消息气泡/工具行/侧栏/顶栏首次入场都走
 * 同一条 keyframe，长度/缓动全走 §6 的 token；只动 opacity + transform，
 * prefers-reduced-motion 下由下方媒体查询清零。
 *
 * 为什么用 \`animation\` 而不是 transition + \`:not([hidden])\`：
 *   后者在 React 里反复 toggle hidden 时 transition 不会重新计算；
 *   且「元素插入」这件事 transition 表达不了。\`animation\` 在元素 mount 那一刻
 *   唯一一次触发，正好对应「第一次出现在视野中」的语义；React 重渲染复用
 *   DOM 节点时也不会重放，不会污染正常状态切换。
 */
@keyframes bloom-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
@keyframes bloom-fade-down {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: none; }
}

/* 消息气泡 / 工具调用行 / 滚动体内的卡片 —— 整页停留时间最长的地方。
   \`:not(:has(...))\` 排除含终端 / 代码块的卡：它们是「展开后才有」的元素，
   跟着外层一起进，单独动会让代码块在父卡里飘。
   !important 必要：DSH 在这些元素上有自己的 \`animation\`（比如呼吸 loader），
   后注入的会赢；用 !important 让 Bloom 的入场动画压过它。 */
[class*="_bubble"],
div[class*="_toolRow"],
div[class*="_scrollBody"] > div[class*="_card"]:not(:has([class*="_terminal"])):not(:has(pre)) {
  animation: bloom-fade-up 420ms var(--bloom-ease-out) backwards !important;
}
/* 侧栏会话行：页面打开时整组淡入（一次性，不是循环） */
[class*="_sidebarCol"] [role="treeitem"] {
  animation: bloom-fade-up 320ms var(--bloom-ease-out) backwards !important;
}
/* 顶栏 —— 从顶部滑下比从下方滑上更贴「页面打开」的语义。
   :has(> _tabs) 是"真顶栏"的唯一判据，见下方 §去硬边框 里的说明。 */
[class*="_header"]:has(> [class*="_tabs"]) {
  animation: bloom-fade-down 420ms var(--bloom-ease-out) backwards !important;
}
/* 顶栏三按钮入场（newSession / sessionLog / Bloom trigger）：
   transform / box-shadow 加到原 transition 里 —— 原来 WIP 只 transition 了
   background，加 lift 不需要新 transition 字段，hover 时一并平滑 */
[class*="_newSession"],
[class*="_sessionLogButton"],
.dsh-bloom-trigger {
  animation: bloom-fade-down 320ms var(--bloom-ease-out) backwards !important;
}
[class*="_newSession"]:hover,
[class*="_sessionLogButton"]:hover,
.dsh-bloom-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px -6px var(--bloom-glow);
}

/* ═══ 输入卡三态 ═══════════════════════════════════════════════════
 * owner 要的是"输入框会说话"（2026-09-10）：
 *   静置   —— 光晕边框慢呼吸（还活着，在等你）
 *   聚焦   —— 同一条呼吸，节奏收紧一倍（跟手）
 *   执行中 —— 流光沿边框流转（它在跑）
 *
 * 两个 @property 是必需的：普通自定义属性在 keyframes 里只会**离散跳变**，
 * 声明了 syntax 浏览器才真正插值。--bloom-halo 推 glass.ts 里那圈主题色
 * 外晕的浓度（阴影本体写在那边，这里只给数值）；--bloom-spin 推 conic
 * 渐变的起始角。
 *
 * 「执行中」的判据是 :has([class*="_pending"])：uV2eYG_pending 是 DSH 自己的
 * 待处理指示点（8px 圆点 + 1s 脉冲），只在跑的时候渲染进输入卡 —— idle 态
 * 实测 DOM 里查不到。比按 aria-label="停止" 判稳（那个会随界面语言变）。 */
@property --bloom-halo { syntax: '<number>'; initial-value: 0.5; inherits: false; }
@property --bloom-spin { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

@keyframes bloom-halo-breathe {
  0%, 100% { --bloom-halo: 0.3; }
  50%      { --bloom-halo: 0.85; }
}
@keyframes bloom-ring-spin {
  to { --bloom-spin: 360deg; }
}

body[data-bloom-variant] div[class*="_composer"] div[class*="_card"] {
  animation: bloom-halo-breathe 5.2s ease-in-out infinite;
}
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]:focus-within {
  animation-duration: 2.6s;
}

/* 执行中：1.5px 的一圈环，conic 起始角在转，看上去像一束光绕着卡边跑。
   mask 两层 + exclude 把实心圆角矩形挖成环，padding 就是环的粗细。
   角度停留在 52%~90% 这一段，所以任一时刻只有约三分之一圈是亮的 ——
   亮满一整圈就成了跑马灯，不是"流光"。 */
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]:has([class*="_pending"])::after {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: 18px;
  padding: 1.5px;
  pointer-events: none;
  background: conic-gradient(
    from var(--bloom-spin),
    transparent 0 52%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 20%) 70%,
    color-mix(in oklch, var(--bloom-motion-2, #6b8f71), transparent 45%) 80%,
    transparent 90% 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: bloom-ring-spin 2.6s linear infinite;
}
/* 跑起来时呼吸让位给流光 —— 两套动效同时在同一块边上跑会互相打架 */
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]:has([class*="_pending"]) {
  --bloom-halo: 0.7;
  animation: none;
}

/* View Transition：主题切换时整页 cross-fade，让颜色"流过去"而不是瞬切。
   只有浏览器支持 \`document.startViewTransition\` 时才触发（switcher.ts 里
   调），这里只控动画时长 / 缓动；不支持和 reduced-motion 一起由下方兜底
   清零。 */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 320ms;
  animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* ④ 无障碍：动效全部降级为瞬间 */
@media (prefers-reduced-motion: reduce) {
  [class*="_sidebarCol"] [role="treeitem"],
  [class*="_sidebarCol"] [class*="_active"]::before,
  .dsh-bloom-switcher, .dsh-bloom-trigger, .dsh-bloom-option, .dsh-bloom-menu,
  [class*="_composer"] div[class*="_card"],
  [class*="_composer"] div[class*="_card"]::after,
  [class*="_composer"] div[class*="_card"]:has([class*="_pending"])::after,
  [class*="_bubble"],
  div[class*="_toolRow"],
  div[class*="_scrollBody"] > div[class*="_card"],
  [class*="_newSession"], [class*="_sessionLogButton"],
  [class*="_scrollBody"]:not(:has([class*="_bubble"]))::before,
  ::view-transition-old(root), ::view-transition-new(root) {
    animation: none !important;
    transition: none !important;
  }
}

/* ══ 去硬边框：全站统一换成光带 / 浅底 / 阴影（owner 2026-09-10）══
 *
 * 原话：「现在已经不流行通过 border 去做切割了，要不然就是很淡的边框线加光感
 * 流动或者是阴影，比硬的边框好看得多」；以及「不能光靠我一个一个说」。
 *
 * 所以全页扫了一遍 border-width > 0 的元素（39 处 / 9 类），按类别统一处理。
 * 消息气泡与输入卡不在此列 —— 它们的边由 glass.ts 的玻璃体系管，动了会破相。
 */

/* 顶部标题栏下沿：跟侧栏右缘同一套做法 —— box-shadow 往外投的辉光，
 * 不是伪元素画的带。
 *
 * 为什么不用 ::after：伪元素被自身盒子裁在里面，渐变最浓的一端就是一条
 * 硬边（实拍 y=58 处 207→189 一跳）。box-shadow 的外阴影画在 border-box
 * 之外、由 blur 自然收尾，两头都没有边。offset 与 spread 同量（24/-24）
 * 保证光只往下走，不糊到左右和顶上。
 *
 * ⚠️ 选择器必须是 :has(> [class*="_tabs"])，不能只写 [class*="_header"]。
 * 后者在实际 DOM 里匹配 5 个元素，其中 4 个是**小按钮组**
 * （wSkVaW_headerActions 68px、wSkVaW_headerUtilities 208px、
 *   bhn1Oq_headerActions 60px、_2ctAZa_header 24px），二三十像素高的盒子
 * 挂上 18px 光带就是一小段悬空横带 —— owner 反馈"像被玻璃劈开"
 * （2026-09-10 实拍：药丸组下沿 y=43 一条硬边，色差 191→209）。
 * 而真顶栏 wSkVaW_header 反而没吃到：它自带 ::after 是 0.5px 线，
 * 跟我们 (0,1,0) 平手、后注入者赢。:has() 把特异度提到 (0,2,0)，
 * 既只命中真顶栏，又压得过宿主那条硬线。 */
body[data-bloom-variant] [class*="_header"]:has(> [class*="_tabs"]) {
  position: relative;
  border-bottom: 0;
  /* 强度实测定档：45% 时边界跳变 32 级、仍读成一条线；78% 跳变 10 级，
     只剩"上面比下面亮一点"的错觉，这才是分隔而不是分割。 */
  box-shadow: 0 28px 48px -28px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
}
body[data-bloom-variant] [class*="_header"]:has(> [class*="_tabs"])::after {
  /* 宿主那条 0.5px 硬线关掉，交给上面的辉光 */
  display: none;
}

/* 描边按钮 → 浅底。新会话 / Session 日志 / 本主题切换器三个长得一样，
   一起处理，免得只改自己的显得突兀 */
body[data-bloom-variant] [class*="_newSession"],
body[data-bloom-variant] [class*="_sessionLogButton"],
body[data-bloom-variant] .dsh-bloom-trigger {
  border-color: transparent;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
  /* transform + box-shadow 也进 transition：§7 hover 抬升要平滑，不能 snap。
     §7 那边只改属性，不重声明 transition —— 避免重复定义打架 */
  transition:
    background var(--bloom-dur-fast, .16s) var(--bloom-ease, ease),
    transform var(--bloom-dur-fast, .16s) var(--bloom-ease, ease),
    box-shadow var(--bloom-dur-fast, .16s) var(--bloom-ease, ease);
}
body[data-bloom-variant] [class*="_newSession"]:hover,
body[data-bloom-variant] [class*="_sessionLogButton"]:hover,
body[data-bloom-variant] .dsh-bloom-trigger:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 86%);
}

/* 侧栏底部操作区：上边框 → 向上扩散的极淡阴影 */
body[data-bloom-variant] [class*="_footerActions"] {
  border-top: 0;
  box-shadow: 0 -6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
}
`;

  // src/css/glass.ts
  var GLASS_CSS = `
/* ═══ 极光流线（v0.9.0，仅 aurora 变体）═══════════════════════════
   用户要的「流线」—— body 背后挂两条斜向渐变丝带，transform 缓慢漂移 +
   blur 软化，做出北极光帘幕的视差感。
   用 ::before 而非改 body background 的原因：动 body 的 background-image
   每帧重绘整个 viewport；伪元素独立合成层，transform 走 GPU，便宜得多。
   z-index:-1 + position:fixed —— body 的背景透传规则下，负 z-index 落在根
   堆叠上下文的负层，画在 body 背景之上、应用内容之下。
   颜色走 --bloom-aurora-stream-1/2/3（在 tokens.ts 由 motion 谱混透明得到），
   切到 aurora 变体时呈现青绿→蓝→紫的北极光，其它变体保持原样不显示。 */
body[data-bloom-variant="aurora"]::before {
  content: '';
  position: fixed;
  inset: -40%;
  z-index: -1;
  pointer-events: none;
  background-image:
    linear-gradient(115deg,
      transparent 38%, var(--bloom-aurora-stream-1) 50%, transparent 62%),
    linear-gradient(70deg,
      transparent 32%, var(--bloom-aurora-stream-2) 46%, transparent 60%),
    radial-gradient(60% 40% at 50% 60%,
      var(--bloom-aurora-stream-3), transparent 70%);
  background-size: 220% 220%, 260% 240%, 100% 100%;
  background-position: 25% 30%, 80% 15%, 50% 50%;
  background-repeat: no-repeat;
  filter: blur(60px) saturate(1.2);
  opacity: 0.6;
  transform: translate3d(0, 0, 0);
  animation: bloom-aurora-drift 28s ease-in-out infinite alternate;
  will-change: transform, background-position;
}
@keyframes bloom-aurora-drift {
  from { transform: translate3d(-2.5%, -1.5%, 0); background-position: 25% 30%, 80% 15%, 50% 50%; }
  to   { transform: translate3d(3%, 2%, 0);      background-position: 65% 55%, 35% 45%, 55% 45%; }
}
@media (prefers-reduced-motion: reduce) {
  body[data-bloom-variant="aurora"]::before {
    animation: none !important;
    transform: none !important;
    opacity: 0.4 !important;
  }
}

/* ═══ 顶栏 tab 条：不做玻璃,只留一条发丝底边 ═══════════════════
   这里曾和侧栏/排队条共用「面级玻璃」档位(半透底 + backdrop blur +
   inset 白描边)。但 tab 条只有 27px 高、1400px 宽 —— 那套玻璃在这个尺寸上
   读不出「一块玻璃」,只会变成一条自带底色和白边框的横带,跟下方内容区
   撞出一道突兀的色块边界(用户实拍反馈:「对话和轨迹这里」)。

   玻璃需要面积才成立。窄条带该做的是「分界」而不是「面」,所以只留一条
   morandi 发丝底边,底色完全交给 body 的氛围渐变。 */
body[data-bloom-variant] div[class*="_tabs"] {
  background-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: inset 0 -1px 0 var(--bloom-hairline, rgba(146,168,179,0.3));
}

/* ═══ 面级面板（排队条 / 预览 dock）═══════════════════════════════
   面积大，档位「略实」；顶部亮高光 + 深色外辉让它像一块立起来的玻璃。 */
body[data-bloom-variant] div[class*="_dock"]:has(> [class*="_preview"]) {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 82%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.10),
    0 14px 44px -16px rgba(0,0,0,0.22);
}
body[data-ds-dark-theme] div[class*="_dock"]:has(> [class*="_preview"]) {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 64%);
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
   且不得引入 isolation / transform / filter / contain / will-change。
   输入卡的 conversation.input.overlay 槽也会注入 fixed 元素（如 dsh-convmap），
   必须遵守同一判据，不能把滤镜放回卡片本体（issue #15）。 */
body[data-bloom-variant] [class*="_sidebarCol"] {
  position: relative;
  /* v0.10.x：之前 transparent !important 让侧栏和 body 完全同色，没有容器感。
     改成带 accent tint 的底色 —— 6% accent 混进 bg-layer-1，肉眼能看出
     "这块区域有自己的颜色"，但又不至于抢内容。 */
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), var(--dsw-alias-bg-layer-1, #fff) 94%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.10),
    /* 右缘冷光必须走 box-shadow：侧栏 overflow:hidden，伪元素画的光带只能落在
       容器内侧，看上去是「向内发光」（owner 2026-09-10 反馈）；外阴影不受自身
       overflow 裁剪，是唯一真正往外散的做法。offset 与 spread 同量（24/-24），
       让光只出现在右侧，不糊到上下边。 */
    24px 0 40px -24px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 45%),
    0 14px 44px -16px rgba(0,0,0,0.22);
}
body[data-bloom-variant] [class*="_sidebarCol"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  /* 玻璃层也带一点 accent tint —— 和上面的底色呼应 */
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), var(--dsw-alias-bg-layer-1, #fff) 88%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.3);
}
body[data-ds-dark-theme] [class*="_sidebarCol"] {
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), var(--dsw-alias-bg-layer-1, #101010) 92%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.10),
    inset 0 0 0 1px rgba(255,255,255,0.05),
    24px 0 40px -24px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 35%),
    0 16px 48px -18px rgba(0,0,0,0.5);
}
body[data-ds-dark-theme] [class*="_sidebarCol"]::before {
  background-color: color-mix(in oklch, var(--bloom-accent, #6b8f71), var(--dsw-alias-bg-layer-1, #101010) 82%);
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

/* ═══ 输入卡片（主角）—— 最清晰的一块玻璃，focus 时玻璃边缘点亮 ═══
   v0.9.0: 用户反馈边框「粗粗的」——
     原因不是 1px hairline 本身粗，而是 COMPONENT_CSS 给的 border: 1px solid var(--bloom-hairline)
     又叠了 GLASS_CSS 的 inset 0 0 0 1px rgba(255,255,255,...) 内白圈，
     1px 外框 + 1px 内圈 = 视觉上等于 2px 的厚边框；focus-within 再加 3px 的
     --bloom-glow 光环就更肥。
   修复：去掉 inset 0 0 0 1px 那圈内白线，只保留顶部 1px 高光（玻璃边沿）
     和外阴影；focus 环 3px -> 2px，颜色用 accent x 25% 收敛到主题色相，
     远看像一根细线而不是一圈光晕。border 本身仍走 COMPONENT_CSS 的 hairline。 */
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"] {
  position: relative;
  background-color: transparent;
  /* v0.10.x（owner 反馈「没层次感」）：阴影只完成"功能"没完成"戏剧"。
     单层远影 + 顶部内高光只是让卡片不和背景撞色，不让卡片"提起来"。
     三层叠：① 顶部内高光（光从上方来）；② 紧贴的硬短影（贴着卡边的
     0.5px 影，像把卡片按下去一点弹回来的感觉）；③ 远散的长距柔影
     （把卡片安放在画布上）；④ 主题色 tint 外晕（"这张卡属于这里"——
     莫兰迪主题自己的颜色，不是死的灰黑阴影）。 */
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.28),
    0 1px 2px -1px rgba(0, 0, 0, 0.18),
    0 18px 52px -20px rgba(0,0,0,0.26),
    /* 外晕浓度由 --bloom-halo 驱动（component.ts §7 的呼吸动画在推它）：
       halo=0.73 时等于原来的 78%，0.3 时淡到 91%，0.85 时浓到 74.5%。 */
    0 0 48px -16px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent calc(100% - var(--bloom-halo, 0.73) * 30%));
}
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 84%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.35);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.35);
}
body[data-ds-dark-theme] div[class*="_composer"] div[class*="_card"] {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 1px 2px -1px rgba(0, 0, 0, 0.5),
    0 20px 56px -22px rgba(0,0,0,0.55),
    0 0 64px -20px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent calc(100% - var(--bloom-halo, 0.7) * 40%));
}
body[data-ds-dark-theme] div[class*="_composer"] div[class*="_card"]::before {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 66%);
}
body[data-bloom-variant] div[class*="_composer"] div[class*="_card"]:focus-within {
  border-color: var(--bloom-hairline-strong);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.3),
    0 1px 2px -1px rgba(0, 0, 0, 0.18),
    0 0 0 2px color-mix(in oklch, var(--bloom-accent) 25%, transparent),
    0 18px 52px -20px rgba(0,0,0,0.26),
    0 0 56px -16px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 74%);
}
body[data-ds-dark-theme] div[class*="_composer"] div[class*="_card"]:focus-within {
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.14),
    0 1px 2px -1px rgba(0, 0, 0, 0.5),
    0 0 0 2px color-mix(in oklch, var(--bloom-accent) 28%, transparent),
    0 20px 56px -22px rgba(0,0,0,0.55),
    0 0 72px -20px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 68%);
}

/* ═══ 消息气泡 —— 柔和玻璃，近距淡影，不压内容 ═══ */
body[data-bloom-variant] [class*="_bubble"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 78%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.25);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.25);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.16),
    inset 0 0 0 1px rgba(255,255,255,0.08),
    0 6px 24px -10px rgba(0,0,0,0.14);
}
body[data-ds-dark-theme] [class*="_bubble"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 62%);
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
body[data-bloom-variant] [class*="_menu"],
body[data-bloom-variant] [class*="_selector"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff), transparent 20%);
  backdrop-filter: blur(28px) saturate(1.4);
  -webkit-backdrop-filter: blur(28px) saturate(1.4);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.12),
    0 20px 56px -18px rgba(0,0,0,0.3);
}
body[data-ds-dark-theme] [class*="_menu"],
body[data-ds-dark-theme] [class*="_selector"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #101010), transparent 12%);
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

/* DSH 拿**前景色 token 当边框色**用的地方（第二例）。设置面板 Agent 预设的
   选中卡片写的是 border-color: var(--dsw-alias-label-primary) —— 那是正文文字色，
   Bloom 在暗色下给它 oklch(0.96 …) 近白，于是选中卡围了一圈刺眼白边。
   选中态本该是主题色。hover 态同样拿 label-dimmed 当边框，一并换成发丝线。 */
body[data-bloom-variant] [class*="_cardActive"] {
  border-color: var(--bloom-accent);
}
body[data-bloom-variant] [class*="_card"]:hover:not([class*="_cardActive"]) {
  border-color: var(--bloom-hairline-strong);
}

/* 「浅色 / 深色 / 跟随系统」选中态的边框：DSH 用 --dsw-static-neutral-bluish-400
   （#adb2b8）画它。那是 static 层的中性灰阶 —— 绕过了 alias 层，主题的
   --dsw-alias-border-* 改不到它，于是在莫兰迪暗底上留下一圈刺眼的灰白边
   （用户实拍反馈「白色边框很突兀」，而且只有选中那一个特别亮）。

   选中态本该是主题色，这里按 accent 接管。并且**不**整体覆盖
   --dsw-static-neutral-bluish-400 —— static 是 DSH 的基础色阶，全局改会波及
   大量无关组件；只在这个具体组件上纠正，影响面可控。 */
body[data-bloom-variant] button[class*="_themeCube"][class*="_selected"] {
  border-color: var(--bloom-accent);
}

body[data-bloom-variant] .md-code-block,
body[data-bloom-variant] [class*="_tableScroll"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff), transparent 70%);
  backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.2);
  -webkit-backdrop-filter: blur(var(--bloom-glass-blur, 24px)) saturate(1.2);
}
body[data-ds-dark-theme] .md-code-block,
body[data-ds-dark-theme] [class*="_tableScroll"] {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #101010), transparent 56%);
}
body[data-bloom-variant] .md-code-block pre,
body[data-bloom-variant] .md-code-block code { background: transparent; }

/* ═══ 表格内部分隔线加强（v0.9.0）用户截图反馈列线几乎不可见 ═══
   原 CSS 用 var(--bloom-hairline)（莫兰迪 30% alpha）做列分隔，
   在深色氛围渐变上几乎消失，看起来像没线的「列表」。提到
   hairline-strong（55% alpha）并给 thead 加一档淡底，列与行都立起来。 */
body[data-bloom-variant] [class*="_tableScroll"] th,
body[data-bloom-variant] [class*="_tableScroll"] td {
  border-color: var(--bloom-hairline-strong);
}
[class*="_tableScroll"] thead th {
  background: rgba(var(--bloom-morandi), 0.10);
}
body[data-ds-dark-theme] [class*="_tableScroll"] thead th {
  background: rgba(var(--bloom-morandi), 0.08);
}
[class*="_tableScroll"] tbody tr:nth-child(even) td {
  background: rgba(var(--bloom-morandi), 0.03);
}
body[data-ds-dark-theme] [class*="_tableScroll"] tbody tr:nth-child(even) td {
  background: rgba(var(--bloom-morandi), 0.04);
}
`;

  // src/dom.ts
  var THINK_OPEN = "<think>";
  var THINK_CLOSE = "</think>";
  function markThinkTags() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const tags = [];
    let n;
    while (n = walker.nextNode()) {
      const t = (n.nodeValue || "").trim();
      if (t !== THINK_OPEN && t !== THINK_CLOSE) continue;
      const el = n.parentElement;
      if (!el || el.dataset.bloomThink) continue;
      el.dataset.bloomThink = t === THINK_OPEN ? "open" : "close";
      tags.push(el);
    }
    if (!tags.length) return;
    for (const el of tags) {
      if (el.dataset.bloomThink !== "open") continue;
      for (let sib = el.nextElementSibling; sib; sib = sib.nextElementSibling) {
        if (sib.dataset.bloomThink === "close") break;
        if (sib.dataset.bloomThink === "open") break;
        sib.dataset.bloomThinkBody = "true";
      }
    }
  }
  function watchThinkTags() {
    if (window.__dshBloomThinkObserver__) return;
    let timer = null;
    const schedule = () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        markThinkTags();
      }, 300);
    };
    const obs = new MutationObserver(schedule);
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.__dshBloomThinkObserver__ = obs;
    markThinkTags();
  }
  function readVariant() {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      return VARIANTS.includes(v) ? v : "mist";
    } catch {
      return "mist";
    }
  }
  function injectCSS(css, idSuffix) {
    const tagId = PLUGIN_ID + "/" + idSuffix;
    if (document.querySelector('style[data-plugin-css="' + tagId + '"]')) return;
    const tag = document.createElement("style");
    tag.dataset.plugin = PLUGIN_ID;
    tag.dataset.pluginCss = tagId;
    tag.textContent = css;
    document.head.appendChild(tag);
  }
  function findSwitcherHost() {
    const header = document.querySelector('header[class*="_header"]') || document.querySelector("header");
    if (!header) return null;
    return header.querySelector('[class*="_headerUtilities"]') || header.querySelector('[class*="_headerActions"]') || null;
  }

  // src/version.ts
  var latestVersion = null;
  async function checkUpdate() {
    try {
      const r = await fetch("https://registry.npmjs.org/@kubor/dsh-bloom-theme/latest", { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      latestVersion = d && d.version || null;
    } catch {
    }
    refreshUpdateBadge();
  }
  var dshLatestVersion = null;
  var dshCheckPromise = null;
  var DSH_CACHE_KEY = "bloom-dsh-check";
  var DSH_CACHE_TTL_MS = 6 * 60 * 60 * 1e3;
  function readDshCurrentRev() {
    try {
      const rev = window.__DSH_BOOT__?.rev;
      return typeof rev === "string" ? rev.slice(0, 7) : null;
    } catch {
      return null;
    }
  }
  async function checkDshLatest(force = false) {
    if (!force) {
      try {
        const raw = sessionStorage.getItem(DSH_CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached?.at && Date.now() - cached.at < DSH_CACHE_TTL_MS && cached.latest) {
            dshLatestVersion = cached.latest;
            renderDshUpdate();
            return;
          }
        }
      } catch {
      }
    }
    if (dshCheckPromise) return dshCheckPromise;
    dshCheckPromise = (async () => {
      try {
        const r = await fetch("https://registry.npmjs.org/@deepseek-ai/dsh/latest", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          dshLatestVersion = d && d.version || null;
          try {
            sessionStorage.setItem(DSH_CACHE_KEY, JSON.stringify({ at: Date.now(), latest: dshLatestVersion }));
          } catch {
          }
        } else {
          dshLatestVersion = null;
        }
      } catch {
        dshLatestVersion = null;
      } finally {
        dshCheckPromise = null;
      }
      renderDshUpdate();
    })();
    return dshCheckPromise;
  }
  function renderDshUpdate() {
    const curEl = document.querySelector("[data-dsh-current]");
    const latEl = document.querySelector("[data-dsh-latest]");
    const stEl = document.querySelector("[data-dsh-state]");
    const hintEl = document.querySelector("[data-dsh-hint]");
    if (!curEl || !latEl || !stEl || !hintEl) return;
    const cur = readDshCurrentRev() || "?";
    curEl.textContent = cur;
    if (dshLatestVersion == null) {
      latEl.textContent = "点击 ↻ 检查";
      stEl.removeAttribute("data-state");
      stEl.textContent = "";
    } else {
      latEl.textContent = dshLatestVersion;
      stEl.textContent = "✓ 已是最新";
      stEl.setAttribute("data-state", "latest");
    }
    hintEl.hidden = true;
    hintEl.textContent = "";
    const btnRefresh = document.querySelector('[data-act="refresh"]');
    const btnCopy = document.querySelector('[data-act="copy"]');
    if (btnRefresh && !btnRefresh.dataset.bloomBound) {
      btnRefresh.dataset.bloomBound = "1";
      btnRefresh.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const label = btnRefresh.textContent;
        btnRefresh.textContent = "检查中";
        btnRefresh.disabled = true;
        stEl.textContent = "检查中…";
        stEl.removeAttribute("data-state");
        try {
          await checkDshLatest(true);
        } finally {
          btnRefresh.disabled = false;
          btnRefresh.textContent = label;
        }
      });
    }
    if (btnCopy && !btnCopy.dataset.bloomBound) {
      btnCopy.dataset.bloomBound = "1";
      btnCopy.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const cmd = "npm i -g @deepseek-ai/dsh@latest";
        let ok = false;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(cmd);
            ok = true;
          }
        } catch {
        }
        if (!ok) {
          const ta = document.createElement("textarea");
          ta.value = cmd;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try {
            ok = document.execCommand("copy");
          } catch {
          }
          ta.remove();
        }
        const label = btnCopy.dataset.bloomLabel || btnCopy.textContent;
        btnCopy.dataset.bloomLabel = label;
        btnCopy.textContent = ok ? "✓ 已复制" : "✗ 复制失败";
        btnCopy.classList.add(ok ? "is-done" : "is-fail");
        clearTimeout(+(btnCopy.dataset.bloomTimer || 0));
        const t = setTimeout(() => {
          btnCopy.textContent = label;
          btnCopy.classList.remove("is-done", "is-fail");
          hintEl.hidden = true;
        }, 1800);
        btnCopy.dataset.bloomTimer = String(t);
        hintEl.hidden = false;
        hintEl.textContent = ok ? `✓ 已复制：${cmd}` : `复制失败，请手动执行：${cmd}`;
      });
    }
  }
  function cmpVersion(a, b) {
    const pa = String(a).replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
    const pb = String(b).replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < 3; i++) {
      const na = pa[i] || 0, nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  }
  function refreshUpdateBadge() {
    if (!latestVersion || cmpVersion(latestVersion, PLUGIN_VERSION) <= 0) return;
    const el = document.querySelector(".dsh-bloom-version__update");
    if (!el) return;
    el.hidden = false;
    el.setAttribute("title", "可更新到 v" + latestVersion);
    el.textContent = "↑ v" + latestVersion;
  }

  // src/css/switcher.ts
  var SWITCHER_CSS = `
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
  /* 触摸设备上拖动不要连带滚页面 */
  touch-action: none;
}
/* 浮动形态可拖动（#14）：这个形态钉在固定坐标上，会压住什么取决于用户
   装了哪些插件（报告里是侧边栏展开后顶部那排按钮）。给 grab 光标是为了
   让「它挡住我了」的人第一反应就是把它拖开；点击打开菜单照旧可用。 */
.dsh-bloom-switcher[data-floating="true"] .dsh-bloom-trigger { cursor: grab; }
.dsh-bloom-switcher[data-dragging="true"] .dsh-bloom-trigger { cursor: grabbing; }
.dsh-bloom-switcher[data-dragging="true"] .dsh-bloom-trigger { transition: none; }
/* 拖到屏幕左半边时菜单改左对齐，否则 right:0 的菜单会伸出视口 */
.dsh-bloom-switcher[data-menu-side="left"] .dsh-bloom-menu { left: 0; right: auto; }

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
  width: 14px; height: 14px;
  border-radius: 999px;
  flex: none;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
}

/* ── 面板头部：标题 + 当前配色胶囊 + 关闭（按 owner 2026-09-10 的设计图） ── */
.dsh-bloom-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 10px;
  /* 用阴影代替分隔线：硬线在圆角面板里显得生硬、没有过渡（owner 2026-09-10）。
     一道极浅的向下扩散阴影同样能分出层次，边界是渐隐的。 */
  box-shadow: 0 6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
}
.dsh-bloom-head__title { font-size: 14px; font-weight: 600; color: var(--dsw-alias-label-primary, #222); }
.dsh-bloom-head__current {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: auto;
  padding: 3px 10px;
  border-radius: 999px;
  /* 浅色底代替描边：一圈线在头部会和标题争视觉重量 */
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
  font-size: 12px;
}
.dsh-bloom-close {
  appearance: none; border: 0; background: transparent; cursor: pointer;
  color: var(--dsw-alias-label-tertiary, #999);
  font-size: 13px; line-height: 1; padding: 4px; border-radius: 6px;
}
.dsh-bloom-close:hover { background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 90%); }

/* 分组标题：「主题」「模式」—— 弱化的小标题，把长列表切成两块 */
.dsh-bloom-section {
  padding: 10px 14px 4px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-section[hidden] { display: none; }

/* 「版本与更新 ›」：默认收起，日常用不到的信息不占版面 */
.dsh-bloom-more {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  width: 100%; appearance: none; border: 0; background: transparent; cursor: pointer;
  margin-top: 8px; padding: 9px 14px;
  box-shadow: 0 -6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
  font: inherit; font-size: 12px;
  color: var(--dsw-alias-label-secondary, #777);
}
.dsh-bloom-more:hover { color: var(--dsw-alias-label-primary, #222); }
.dsh-bloom-more[aria-expanded="true"] .dsh-bloom-more__arrow { transform: rotate(90deg); }
.dsh-bloom-more__arrow { transition: transform .16s ease; }
.dsh-bloom-more-body[hidden] { display: none; }

.dsh-bloom-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  /* v0.6.0 patch: 提到 99999，确保 Bloom 下拉菜单覆盖在 DSH 原生顶栏 tabs
     （"对话 / 轨迹"，z-index 更高）之上，不被截断 */
  z-index: 99999;
  min-width: 236px;
  padding: 0 0 6px;
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
  padding: 8px 14px;
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
/* 外观切换（浅色/深色/跟随）——分段控件，跟变体列表用同一条分隔线语言 */
/* 模式分段控件：等宽三格，外面一圈细框（设计图的样子）。
   这里不再自带分隔线和标题 —— 标题由 .dsh-bloom-section 提供。 */
.dsh-bloom-appearance {
  padding: 0 14px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #777);
}
.dsh-bloom-appearance[hidden] { display: none; }
.dsh-bloom-appearance__seg {
  display: flex;
  width: 100%;                 /* 撑满面板宽度，里面三个按钮才能真正三等分
                                  （inline-flex 时宽度被内容决定，"跟随系统"四个字
                                  把那格撑到别人的两倍） */
  /* 整条用一层浅底当容器，不描边；选中项靠更实的底色浮起来 —— 
     线框 + 格间竖线在小尺寸下线太多，显得脏 */
  padding: 3px;
  border-radius: 9px;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 94%);
}
.dsh-bloom-appearance__btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  flex: 1;                     /* 三等分 */
  padding: 7px 4px;
  cursor: pointer;
  line-height: 1.7;
  white-space: nowrap;         /* 「浅色」被折成两行就是少了这一条 */
  text-align: center;
  transition: background-color .14s ease, color .14s ease;
}
.dsh-bloom-appearance__btn[hidden] { display: none; }
.dsh-bloom-appearance__btn { border-radius: 7px; }
.dsh-bloom-appearance__btn:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%);
}
/* 选中态用主题强调色，和上方变体的选中打勾是同一套视觉权重 */
.dsh-bloom-appearance__btn[data-active="true"] {
  background: var(--dsw-alias-bg-layer-1, #fff);
  color: var(--bloom-accent, #6b8f71);
  font-weight: 600;
  box-shadow: 0 1px 3px -1px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 70%);
}
.dsh-bloom-appearance__btn:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: -2px;
}

.dsh-bloom-version {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 6px 14px 2px;
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
/* 版本区：两行封顶（当前+按钮 / 最新），按钮收进第一行右侧。
   原来是三行——版本、最新、两个大按钮各占一行，菜单被撑得很长（owner 反馈"太拥挤"）。 */
.dsh-bloom-dsh-spacer { flex: 1; }
.dsh-bloom-dsh-row--latest { opacity: .72; }
.dsh-bloom-dsh-update {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
  padding: 2px 14px 6px;
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
/* 下拉只有 180px 宽,actions 区实际可用 150px。两个按钮原本都 flex:1 平分 73px,
   而「复制升级命令」6 字 × 10.5px + 左右 padding ≈ 79px —— 装不下就折成两行,
   加上 line-height:1 两行字直接贴在一起。修法三件套:
     · 文案缩到「复制命令」(完整说明进 title)
     · white-space: nowrap 兜底 —— 以后换文案/换字号也不会再折行
     · 宽度按内容分配:次要按钮取内容宽,主按钮吃掉剩余空间 */
.dsh-bloom-dsh-btn {
  flex: 0 0 auto;
  white-space: nowrap;
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
  flex: 1 1 auto;
  background: var(--bloom-accent, #c47b4a);
  border-color: var(--bloom-accent, #c47b4a);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
.dsh-bloom-dsh-btn--primary:hover {
  background: color-mix(in oklch, var(--bloom-accent, #c47b4a), black 10%);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
/* 复制成功/失败的就地反馈态。点击的是按钮,反馈就出现在按钮上 ——
   原先只在下方另起一行 10px 小字,而点击时视线在按钮上,极易整个错过。 */
.dsh-bloom-dsh-btn.is-done {
  background: oklch(45% 0.13 150);
  border-color: oklch(45% 0.13 150);
  color: #fff;
}
.dsh-bloom-dsh-btn.is-fail {
  background: oklch(45% 0.16 25);
  border-color: oklch(45% 0.16 25);
  color: #fff;
}
body[data-ds-dark-theme] .dsh-bloom-dsh-btn.is-done {
  background: oklch(72% 0.14 150);
  border-color: oklch(72% 0.14 150);
  color: oklch(18% 0.02 150);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-btn.is-fail {
  background: oklch(72% 0.16 25);
  border-color: oklch(72% 0.16 25);
  color: oklch(18% 0.02 25);
}
/* 按压反馈 —— 之前点下去毫无变化,连「点到了」都要靠猜 */
.dsh-bloom-dsh-btn:active { transform: scale(0.97); }
.dsh-bloom-dsh-btn:disabled { opacity: 0.6; cursor: default; }

/* hint 的绿必须明暗分档:oklch(60%) 是「中间亮度」,实测在暗色菜单底上只有
   3.3:1(而且是 10px 字)。这与 state chip 那次是同一个硬编码色值,当时漏了这处。 */
.dsh-bloom-dsh-hint {
  margin-top: 4px;
  padding: 4px 6px;
  border-radius: 5px;
  background: color-mix(in oklch, oklch(45% 0.13 150), transparent 90%);
  color: oklch(45% 0.13 150);
  font-size: 10px;
  text-align: center;
}
body[data-ds-dark-theme] .dsh-bloom-dsh-hint {
  background: color-mix(in oklch, oklch(78% 0.14 150), transparent 88%);
  color: oklch(78% 0.14 150);
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
`;

  // src/appearance.ts
  var LABEL_TO_MODE = [
    [/^浅色|^light/i, "light"],
    [/^深色|^暗色|^dark/i, "dark"],
    [/跟随系统|system|auto/i, "system"]
  ];
  function modeOf(el) {
    const text = el.innerText?.trim() || "";
    for (const [re, mode] of LABEL_TO_MODE) if (re.test(text)) return mode;
    return null;
  }
  function findHostButtons() {
    const out = /* @__PURE__ */ new Map();
    for (const el of Array.from(document.querySelectorAll('[class*="_themeCube"]'))) {
      const m = modeOf(el);
      if (m && !out.has(m)) out.set(m, el);
    }
    return out;
  }
  function findSettingsTrigger() {
    const scope = document.querySelector('[class*="_settingsArea"]') || document;
    for (const el of Array.from(scope.querySelectorAll('button[class*="_trigger"]'))) {
      if (el.closest(".dsh-bloom-switcher")) continue;
      if (/^设置$|^settings$/i.test((el.innerText || "").trim())) return el;
    }
    return null;
  }
  function hasSettingsEntry() {
    return !!findSettingsTrigger();
  }
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function setMode(mode) {
    const settings = findSettingsTrigger();
    if (!settings) return false;
    const already = findHostButtons().get(mode);
    if (already) {
      already.click();
      return true;
    }
    settings.click();
    let target;
    for (let i = 0; i < 10; i++) {
      await sleep(50);
      target = findHostButtons().get(mode);
      if (target) break;
    }
    if (target) target.click();
    await sleep(260);
    settings.click();
    return !!target;
  }
  function currentIsDark() {
    return document.body.hasAttribute("data-ds-dark-theme");
  }

  // src/drag.ts
  var POS_KEY = `${STORAGE_KEY}-float-pos`;
  var DRAG_THRESHOLD = 4;
  var MARGIN = 8;
  function clampPos(p, w, h, vw, vh) {
    return {
      left: Math.min(Math.max(p.left, MARGIN), Math.max(MARGIN, vw - w - MARGIN)),
      top: Math.min(Math.max(p.top, MARGIN), Math.max(MARGIN, vh - h - MARGIN))
    };
  }
  function readPos() {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      return typeof p?.left === "number" && typeof p?.top === "number" ? p : null;
    } catch {
      return null;
    }
  }
  function savePos(p) {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(p));
    } catch {
    }
  }
  function apply(el, p) {
    el.style.left = `${p.left}px`;
    el.style.top = `${p.top}px`;
    el.style.right = "auto";
    el.dataset.menuSide = p.left + el.offsetWidth / 2 > window.innerWidth / 2 ? "right" : "left";
  }
  function clearFloatingPos(el) {
    el.style.left = el.style.top = el.style.right = "";
    delete el.dataset.menuSide;
  }
  function enableFloatingDrag(el) {
    if (el.dataset.dragBound === "true") return;
    el.dataset.dragBound = "true";
    const restore = () => {
      const saved = readPos();
      if (!saved) return;
      apply(el, clampPos(saved, el.offsetWidth, el.offsetHeight, window.innerWidth, window.innerHeight));
    };
    restore();
    window.addEventListener("resize", () => {
      if (el.dataset.floating === "true") restore();
    });
    let start = null;
    let moved = false;
    el.addEventListener("pointerdown", (e) => {
      if (el.dataset.floating !== "true") return;
      if (e.button !== 0) return;
      if (e.target.closest(".dsh-bloom-menu")) return;
      const r = el.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
      moved = false;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (!moved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      moved = true;
      el.dataset.dragging = "true";
      apply(el, clampPos(
        { left: start.left + dx, top: start.top + dy },
        el.offsetWidth,
        el.offsetHeight,
        window.innerWidth,
        window.innerHeight
      ));
    });
    const finish = (e) => {
      if (!start) return;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      start = null;
      delete el.dataset.dragging;
      if (!moved) return;
      const r = el.getBoundingClientRect();
      savePos({ left: r.left, top: r.top });
    };
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
    el.addEventListener("click", (e) => {
      if (!moved) return;
      moved = false;
      e.stopPropagation();
      e.preventDefault();
    }, true);
  }

  // src/switcher.ts
  var dotStyle = (v) => `background:linear-gradient(135deg, rgb(${PALETTE[v].morandi}) 0%, ${PALETTE[v].accentL} 100%)`;
  function applyVariant(variant) {
    if (!VARIANTS.includes(variant)) variant = "mist";
    const apply2 = () => {
      document.body.dataset.bloomVariant = variant;
      try {
        window.localStorage.setItem(STORAGE_KEY, variant);
      } catch {
      }
      const root = document.querySelector(".dsh-bloom-switcher");
      if (!root) return;
      root.querySelectorAll(".dsh-bloom-option").forEach((el) => {
        const on = el.dataset.variant === variant;
        el.setAttribute("data-active", String(on));
        el.setAttribute("aria-selected", String(on));
      });
      const name = root.querySelector(".dsh-bloom-trigger__name");
      if (name) name.textContent = VARIANT_LABELS[variant].zh;
      const dot = root.querySelector(".dsh-bloom-trigger .dsh-bloom-dot");
      if (dot) dot.setAttribute("style", dotStyle(variant));
      const headName = root.querySelector("[data-head-name]");
      if (headName) headName.textContent = VARIANT_LABELS[variant].zh;
      const headDot = root.querySelector(".dsh-bloom-head__current .dsh-bloom-dot");
      if (headDot) headDot.setAttribute("style", dotStyle(variant));
    };
    if (typeof document.startViewTransition === "function") {
      document.startViewTransition(apply2);
    } else {
      apply2();
    }
  }
  function buildSwitcherHTML(currentVariant) {
    const options = VARIANTS.map((v) => {
      const on = v === currentVariant;
      return `<button type="button" class="dsh-bloom-option" role="option" data-variant="${v}" aria-selected="${on}" data-active="${on}"><span class="dsh-bloom-dot" style="${dotStyle(v)}"></span><span class="dsh-bloom-option__name">${VARIANT_LABELS[v].zh}</span><span class="dsh-bloom-option__en">${VARIANT_LABELS[v].en}</span><span class="dsh-bloom-check" aria-hidden="true">✓</span></button>`;
    }).join("");
    return `<div class="dsh-bloom-switcher" data-plugin="${PLUGIN_ID}">
  <button type="button" class="dsh-bloom-trigger" aria-haspopup="dialog" aria-expanded="false" title="Bloom 主题 · v${PLUGIN_VERSION}">
    <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
    <span class="dsh-bloom-trigger__name">${VARIANT_LABELS[currentVariant].zh}</span>
    <svg class="dsh-bloom-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="dsh-bloom-menu" role="dialog" aria-label="Bloom 外观设置" hidden>
    <div class="dsh-bloom-head">
      <span class="dsh-bloom-head__title">外观</span>
      <span class="dsh-bloom-head__current">
        <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
        <span data-head-name>${VARIANT_LABELS[currentVariant].zh}</span>
      </span>
      <button type="button" class="dsh-bloom-close" aria-label="关闭">✕</button>
    </div>
    <div class="dsh-bloom-section">主题</div>
    <div class="dsh-bloom-options" role="listbox" aria-label="配色">${options}</div>
    <div class="dsh-bloom-section" data-mode-section hidden>模式</div>
    <div class="dsh-bloom-appearance" role="group" aria-label="深浅模式" hidden>
      <div class="dsh-bloom-appearance__seg">
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="light">浅色</button>
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="dark">深色</button>
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="system">跟随系统</button>
      </div>
    </div>
    <button type="button" class="dsh-bloom-more" aria-expanded="false">
      <span>版本与更新</span>
      <svg class="dsh-bloom-more__arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M4 2l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="dsh-bloom-more-body" hidden>
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
          <span class="dsh-bloom-dsh-spacer"></span>
          <button type="button" class="dsh-bloom-dsh-btn" data-act="refresh" title="重新检查 DSH 最新版">↻</button>
          <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-dsh-btn--primary" data-act="copy" title="复制升级命令：npm i -g @deepseek-ai/dsh@latest">复制</button>
        </div>
        <div class="dsh-bloom-dsh-row dsh-bloom-dsh-row--latest">
          <span class="dsh-bloom-dsh-label">最新</span>
          <span class="dsh-bloom-dsh-ver" data-dsh-latest>检查中…</span>
        </div>
        <div class="dsh-bloom-dsh-hint" data-dsh-hint hidden></div>
      </div>
    </div>
  </div>
</div>`;
  }
  function closeMenu(root) {
    const menu = root.querySelector(".dsh-bloom-menu");
    const trigger = root.querySelector(".dsh-bloom-trigger");
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }
  function syncAppearanceRow(el) {
    const row = el.querySelector(".dsh-bloom-appearance");
    if (!row) return;
    const sec = el.querySelector("[data-mode-section]");
    const ok = hasSettingsEntry();
    row.hidden = !ok;
    if (sec) sec.hidden = !ok;
    if (!ok) return;
    const dark = currentIsDark();
    for (const btn of Array.from(row.querySelectorAll(".dsh-bloom-appearance__btn"))) {
      const m = btn.dataset.mode;
      const on = m === "dark" && dark || m === "light" && !dark;
      btn.dataset.active = String(on);
      btn.setAttribute("aria-pressed", String(on));
    }
  }
  function buildSwitcherEl(initialVariant) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildSwitcherHTML(initialVariant);
    const el = wrapper.firstElementChild;
    const openMenu = () => {
      const menu = el.querySelector(".dsh-bloom-menu");
      const trigger = el.querySelector(".dsh-bloom-trigger");
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      syncAppearanceRow(el);
      const active = menu.querySelector('.dsh-bloom-option[data-active="true"]') || menu.querySelector(".dsh-bloom-option");
      active?.focus();
    };
    el.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest(".dsh-bloom-close")) {
        closeMenu(el);
        return;
      }
      const more = target.closest(".dsh-bloom-more");
      if (more) {
        const body = el.querySelector(".dsh-bloom-more-body");
        const open = body?.hidden ?? false;
        if (body) body.hidden = !open;
        more.setAttribute("aria-expanded", String(open));
        return;
      }
      const modeBtn = target.closest(".dsh-bloom-appearance__btn");
      if (modeBtn) {
        void setMode(modeBtn.dataset.mode).then(() => syncAppearanceRow(el));
        return;
      }
      const trigger = e.target.closest(".dsh-bloom-trigger");
      if (trigger) {
        const menu = el.querySelector(".dsh-bloom-menu");
        if (menu.hidden) openMenu();
        else closeMenu(el);
        return;
      }
      const opt = e.target.closest(".dsh-bloom-option");
      if (opt) {
        applyVariant(opt.dataset.variant);
        closeMenu(el);
        el.querySelector(".dsh-bloom-trigger")?.focus();
        return;
      }
    });
    el.addEventListener("keydown", (e) => {
      const menu = el.querySelector(".dsh-bloom-menu");
      const trigger = el.querySelector(".dsh-bloom-trigger");
      const options = [...menu.querySelectorAll(".dsh-bloom-option")];
      const idx = options.indexOf(document.activeElement);
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          closeMenu(el);
          trigger?.focus();
        }
        return;
      }
      if (document.activeElement === trigger && menu.hidden) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openMenu();
        }
        return;
      }
      if (menu.hidden) return;
      switch (e.key) {
        case "Escape":
          closeMenu(el);
          trigger?.focus();
          break;
        case "ArrowDown":
          e.preventDefault();
          options[(idx + 1) % options.length]?.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          options[(idx - 1 + options.length) % options.length]?.focus();
          break;
        case "Home":
          e.preventDefault();
          options[0]?.focus();
          break;
        case "End":
          e.preventDefault();
          options[options.length - 1]?.focus();
          break;
        case "Enter":
        case " ":
          if (idx >= 0) {
            e.preventDefault();
            applyVariant(options[idx].dataset.variant);
            closeMenu(el);
            trigger?.focus();
          }
          break;
        case "Tab":
          closeMenu(el);
          break;
      }
    });
    el.querySelectorAll(".dsh-bloom-option").forEach((opt) => {
      opt.setAttribute("tabindex", "-1");
    });
    document.addEventListener("click", (e) => {
      if (!el.contains(e.target)) closeMenu(el);
    });
    return el;
  }
  function injectSwitcher(initialVariant) {
    injectCSS(SWITCHER_CSS, "switcher.css");
    refreshUpdateBadge();
    renderDshUpdate();
    void checkDshLatest();
    const existing = document.querySelector(".dsh-bloom-switcher");
    const host = findSwitcherHost();
    if (existing) {
      if (host && !host.contains(existing)) {
        existing.dataset.floating = "false";
        clearFloatingPos(existing);
        host.prepend(existing);
      }
      return;
    }
    const el = buildSwitcherEl(initialVariant);
    if (host) {
      el.dataset.floating = "false";
      host.prepend(el);
    } else {
      el.dataset.floating = "true";
      document.body.appendChild(el);
      enableFloatingDrag(el);
    }
  }
  function watchSwitcher(variant) {
    if (window.__dshBloomObserver__) return;
    const reattach = () => {
      if (!document.body) return;
      document.body.dataset.bloomVariant = document.body.dataset.bloomVariant || variant;
      injectSwitcher(readVariant());
    };
    const obs = new MutationObserver(() => {
      const el = document.querySelector(".dsh-bloom-switcher");
      const host = findSwitcherHost();
      if (!el || host && !host.contains(el)) reattach();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    window.__dshBloomObserver__ = obs;
  }

  // src/client.ts
  (function() {
    if (typeof document === "undefined") return;
    const variant = readVariant();
    injectCSS(buildBloomCSS(), "bloom.css");
    injectCSS(COMPONENT_CSS, "components.css");
    injectCSS(GLASS_CSS, "glass.css");
    const boot = () => {
      document.body.dataset.bloomVariant = variant;
      injectSwitcher(variant);
      watchSwitcher(variant);
      watchThinkTags();
      checkUpdate();
    };
    if (document.body) boot();
    else document.addEventListener("DOMContentLoaded", boot);
  })();
  (function installAutoReload() {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const host = location.hostname;
    if (host !== "127.0.0.1" && host !== "localhost") return;
    if (location.search.includes("noreload=1")) return;
    const myUrl = `${location.origin}/plugins/${PLUGIN_ID}/client.js`;
    let initialKey = null;
    const fnv1a = (s) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h = (h ^ s.charCodeAt(i)) * 16777619 >>> 0;
      }
      return h.toString(36);
    };
    const check = async () => {
      try {
        const r = await fetch(`${myUrl}?t=${Date.now()}`, { cache: "no-store" });
        if (!r.ok) return;
        const text = await r.text();
        const key = fnv1a(text) + ":" + text.length;
        if (initialKey === null) {
          initialKey = key;
          return;
        }
        if (key !== initialKey) location.reload();
      } catch (_) {
      }
    };
    check();
    setInterval(check, 3e3);
  })();
  (function installUpdateCheck() {
    if (typeof window === "undefined" || typeof fetch !== "function") return;
    const REGISTRY = "https://registry.npmjs.org/" + PLUGIN_ID + "/latest";
    const CHECK_TTL_MS = 24 * 60 * 60 * 1e3;
    const LS_LAST = "dsh-bloom-update-check";
    const LS_DISMISSED = "dsh-bloom-update-dismissed";
    const updateCmd = (v) => "dsh plugin --profile web add " + PLUGIN_ID + "@" + v;
    const RELEASES_URL = "https://github.com/webkubor/dsh-bloom-theme/releases";
    const zh = (navigator.language || "").toLowerCase().startsWith("zh");
    function isNewer(a, b) {
      const [va, pa] = a.split("-"), [vb, pb] = b.split("-");
      const na = va.split(".").map(Number), nb = vb.split(".").map(Number);
      for (let i = 0; i < 3; i++) {
        if ((na[i] || 0) !== (nb[i] || 0)) return (na[i] || 0) > (nb[i] || 0);
      }
      if (!pa && pb) return true;
      if (pa && !pb) return false;
      if (pa && pb) return pa > pb;
      return false;
    }
    const ls = {
      get(k) {
        try {
          return window.localStorage.getItem(k);
        } catch {
          return null;
        }
      },
      set(k, v) {
        try {
          window.localStorage.setItem(k, v);
        } catch {
        }
      }
    };
    function showBanner(latest) {
      if (document.getElementById("dsh-bloom-update-banner")) return;
      const dismissed = ls.get(LS_DISMISSED);
      if (dismissed === latest) return;
      const el = document.createElement("div");
      el.id = "dsh-bloom-update-banner";
      el.setAttribute("role", "status");
      el.innerHTML = `
      <style>
        /* ⚠️ 这里的颜色**只准用真实存在的 token**。
           原先写的是 var(--bloom-glass-bg, rgba(255,255,255,0.72)) 和
           var(--bloom-tx, inherit) —— 这两个变量**从来没被定义过**，于是：
             背景 fallback 成 rgba(255,255,255,0.72)（一个「亮色」假设的浅白底）
             文字 fallback 成 inherit（继承 DSH 暗色主题的近白色）
           浅白底 + 近白字，实测标题 1.62:1、命令框 1.93:1、「（当前 x.y.z）」
           叠了 opacity:.65 只剩 1.38:1 —— 不是「有点淡」，是几乎不可读。

           这块样式是内联 <style>，不在 src/css/ 里，所以 CSS 常量白名单和视觉审计
           都没扫到它 —— 它烂了很久没人发现，正因为它躲在闸门外面。
           现在一律走 --dsw-alias-* / --bloom-*（都是 tokens.ts 里真实定义的，
           且已按明暗分档），不再自造变量名。 */
        #dsh-bloom-update-banner{position:fixed;right:20px;bottom:20px;z-index:2147483000;
          max-width:340px;padding:14px 16px;border-radius:14px;
          background:color-mix(in oklch,var(--dsw-alias-bg-layer-1,#fff),transparent 12%);
          backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);
          border:1px solid var(--bloom-hairline,rgba(146,168,179,0.35));
          box-shadow:var(--bloom-shadow,0 10px 30px rgba(0,0,0,0.18));
          font:12.5px/1.6 system-ui,-apple-system,'PingFang SC','Segoe UI',sans-serif;
          color:var(--dsw-alias-label-primary,#222);animation:bloom-up-in .45s cubic-bezier(.2,.9,.3,1.2)}
        @keyframes bloom-up-in{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
        #dsh-bloom-update-banner a{color:var(--bloom-accent,#34698c);font-weight:600;text-decoration:none}
        #dsh-bloom-update-banner a:hover{text-decoration:underline}
        #dsh-bloom-update-banner code{font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
          display:block;margin:8px 0;padding:6px 8px;border-radius:8px;word-break:break-all;
          background:var(--bloom-code-bg,rgba(146,168,179,0.13));
          color:var(--dsw-alias-label-primary,#222)}
        /* 次要信息用 label-secondary 这个**已按明暗分档且过 AA** 的 token，
           不再用 opacity 硬压 —— opacity 会把对比度再乘一次，1.62 直接掉到 1.38。 */
        #dsh-bloom-update-banner .bloom-upd-cur{color:var(--dsw-alias-label-secondary,#666)}
        #dsh-bloom-update-banner .bloom-upd-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
        #dsh-bloom-update-banner button{font:12px/1 system-ui,sans-serif;padding:7px 12px;border-radius:9px;
          cursor:pointer;border:1px solid var(--bloom-hairline-strong,rgba(146,168,179,0.55));
          background:transparent;color:var(--dsw-alias-label-primary,#222);transition:all .18s}
        #dsh-bloom-update-banner button:hover{border-color:var(--bloom-accent,#34698c);
          color:var(--bloom-accent,#34698c)}
        #dsh-bloom-update-banner button:active{transform:scale(.97)}
        /* 主按钮:accent 底 + label-primary-foreground(即 bg 色)文字。
           PALETTE 的 accent×bg 组合本来就由 contrast-guard 守着 ≥4.5,这条路天然达标;
           原先写死 color:#fff,在亮色档的 accent 上只有 2.3:1。 */
        #dsh-bloom-update-banner button[data-primary]{background:var(--bloom-accent,#34698c);
          color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent}
        #dsh-bloom-update-banner button[data-primary]:hover{filter:brightness(1.12)}
        #dsh-bloom-update-banner .bloom-upd-x{position:absolute;top:6px;right:8px;border:none!important;
          background:none!important;padding:4px!important;font-size:14px!important;line-height:1!important}
      </style>
      <div class="bloom-upd-x" title="${zh ? "关闭（此版本不再提醒）" : "Dismiss"}">×</div>
      <div>🌸 <strong>${zh ? "Bloom 主题有新版本" : "Bloom theme update"}</strong>
        ${latest} ${zh ? "可用" : "available"}<span class="bloom-upd-cur">（${zh ? "当前" : "current"} ${PLUGIN_VERSION}）</span></div>
      <code>${updateCmd(latest)}</code>
      <div class="bloom-upd-actions">
        <button data-primary data-act="copy">${zh ? "复制更新命令" : "Copy command"}</button>
        <button data-act="open">${zh ? "更新日志" : "Changelog"}</button>
      </div>`;
      el.querySelector(".bloom-upd-x").addEventListener("click", () => {
        ls.set(LS_DISMISSED, latest);
        el.remove();
      });
      el.querySelector('[data-act="copy"]').addEventListener("click", (e) => {
        const btn = e.currentTarget;
        navigator.clipboard?.writeText(updateCmd(latest)).then(() => {
          btn.textContent = zh ? "✓ 已复制" : "✓ Copied";
          setTimeout(() => btn.textContent = zh ? "复制更新命令" : "Copy command", 1600);
        }).catch(() => {
        });
      });
      el.querySelector('[data-act="open"]').addEventListener("click", () => {
        window.open(RELEASES_URL + "/tag/v" + latest, "_blank", "noopener");
      });
      document.body.appendChild(el);
    }
    function check() {
      try {
        const last = JSON.parse(ls.get(LS_LAST) || "null");
        if (last && Date.now() - last.at < CHECK_TTL_MS && last.latest === PLUGIN_VERSION) return;
      } catch {
      }
      const ctrl = typeof AbortController === "function" ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), 5e3) : null;
      fetch(REGISTRY, { cache: "no-store", signal: ctrl?.signal }).then((r) => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))).then((manifest) => {
        const latest = manifest && manifest.version;
        if (typeof latest !== "string") return;
        ls.set(LS_LAST, JSON.stringify({ at: Date.now(), latest }));
        if (isNewer(latest, PLUGIN_VERSION)) showBanner(latest);
      }).catch(() => {
      }).finally(() => timer && clearTimeout(timer));
    }
    setTimeout(check, 4e3);
  })();
  window.__ModuleLoader__.load({
    id: PLUGIN_ID,
    factory: () => {
      const exports = {};
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      exports.apply = function apply2() {
        if (typeof document === "undefined") return;
        const variant = readVariant();
        if (!document.querySelector('style[data-plugin-css="' + PLUGIN_ID + '/bloom.css"]')) {
          injectCSS(buildBloomCSS(), "bloom.css");
        }
        if (!document.querySelector('style[data-plugin-css="' + PLUGIN_ID + '/components.css"]')) {
          injectCSS(COMPONENT_CSS, "components.css");
        }
        if (!document.querySelector('style[data-plugin-css="' + PLUGIN_ID + '/glass.css"]')) {
          injectCSS(GLASS_CSS, "glass.css");
        }
        document.body.dataset.bloomVariant = variant;
        injectSwitcher(variant);
        watchSwitcher(variant);
        watchThinkTags();
      };
      return exports;
    }
  });
})();
