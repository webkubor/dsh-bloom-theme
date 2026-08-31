/**
 * 把色板编译成 CSS 变量 —— 主题的「颜色大脑」。
 *
 * 结构：
 *   bloomTokens       每变体的 --bloom-* 自有 token（质感层的唯一色源 SSOT）
 *   borderStack       border 四档阶梯（暗色必须走 morandi，不能用前景色 mix）
 *   labelStack        次级文字四档（单调递减，两档都过 WCAG AA）
 *   sharedDswTokens   状态色 / 反色 / toast / tooltip（三处共用，防变体漂移）
 *   mistLight/Dark    mist 完整骨架
 *   variantBlock      其余 7 个变体（只覆盖主色 + 背景调，骨架继承 mist）
 *   buildBloomCSS     把上面全部拼成一张样式表
 *
 * 这个文件里的三个 *Stack / sharedDswTokens 函数是**刻意抽出来的**：它们覆盖的
 * token 原本在 mistLight / mistDark / variantBlock 三处各写一遍，漂移过多次
 * （ripple/petal 继承过 mist 的错误值；22 个 token 只在 mist 定义，导致其余
 * 7 个变体回落 DSH 原生值）。详见 DEV_NOTES 2026-08-24。
 */
import { PALETTE, mix } from './palette.js'
import { OTHER_VARIANTS } from './palette.js'

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
export function bloomTokens(p, dark) {
  const tx = dark ? p.txD : p.txL
  const m = p.morandi
  const motion = dark ? p.motionD : p.motionL
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
  --bloom-shadow-sm: 0 2px 8px ${dark ? 'rgba(0,0,0,0.4)' : mix(tx, 96)};
  --bloom-shadow: 0 10px 30px ${dark ? 'rgba(0,0,0,0.5)' : mix(tx, 94)};
  --bloom-shadow-lg: 0 24px 60px ${dark ? 'rgba(0,0,0,0.6)' : mix(tx, 90)};
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
  --bloom-glass-blur: ${dark ? '22px' : '24px'};
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
export function borderStack(p, dark) {
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
export function labelStack(p, dark) {
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
export function sharedDswTokens(p, dark) {
  const bg = dark ? p.bgD : p.bgL
  const tx = dark ? p.txD : p.txL
  const ok = dark ? 'oklch(72% 0.12 150)' : 'oklch(45% 0.14 150)'
  const err = dark ? 'oklch(72% 0.16 25)' : 'oklch(45% 0.16 25)'
  const warn = dark ? 'oklch(80% 0.12 75)' : 'oklch(45% 0.11 75)'
  /**
   * ⚠️ secondary 与 tertiary 的语义**完全不同**，别按名字想当然。
   *
   * 实测 DSH 原生值（禁用 Bloom 样式后读 computed）：
   *   state-error-primary    #f25a5a
   *   state-error-secondary  #f25a5a   ← 和 primary **一模一样**，全饱和
   *   state-success-tertiary rgb(35,60,44)  ← 这才是暗淡背景色
   *
   * 也就是说 `-secondary` 是**全饱和状态色本身**（DSH 拿它当 color-mix 的色源），
   * `-tertiary` 才是背景档。Bloom 起初把两档都当成「淡背景」，写了
   * color-mix(c, transparent 82%)，于是：
   *
   *   .assistantVioletBright { color: color-mix(in srgb,
   *      var(--dsw-alias-brand-primary-…) 60%, var(--dsw-alias-state-error-secondary)) }
   *
   * 轨迹视图的 ASSISTANT 标签被混成半透明，对比度 3.39 → 2.89，**比 DSH 原生还差**。
   * 改成拿 bg 预混后 alpha 恢复 1，但色值被暗背景拖黑，2.89 → 2.70，更差 ——
   * 两次都错在把 secondary 当背景。现在 secondary 直接给全饱和值，对齐 DSH 语义。
   *
   * tertiary 保持 bg 预混（它确实是背景），但比例从 90% 降到 78%：原生
   * success-tertiary 有明显绿调，混 90% bg 只剩 rgb(33,36,20) 几乎无色相。
   *
   * Bloom 自己不消费这几个 token（只定义），所以改它们只影响 DSH 组件的渲染。
   */
  const t = (c, pct) => `color-mix(in oklch, ${c}, ${bg} ${pct}%)`
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
  --dsw-alias-state-warn-label: ${dark ? 'oklch(88% 0.1 75)' : 'oklch(40% 0.09 75)'};
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
  --dsw-alias-bg-mask-photo: color-mix(in oklch, ${bg}, black ${dark ? 45 : 30}%);`
}

export function mistLight(p) {
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
export function mistDark(p) {
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
export function variantBlock(v, dark) {
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
export function buildBloomCSS() {
  const blocks = [mistLight(PALETTE.mist), mistDark(PALETTE.mist)]
  for (const v of OTHER_VARIANTS) {
    blocks.push(variantBlock(v, false), variantBlock(v, true))
  }
  return blocks.join('\n')
}
