export const SWITCHER_CSS = `
.dsh-bloom-slot { display: inline-block; flex: none; }
.dsh-bloom-overlay { pointer-events: none; }
.dsh-bloom-overlay #dsh-bloom-update-banner { pointer-events: auto; }
.dsh-bloom-switcher[data-slotted="true"] { --bloom-menu-max-h: calc(100vh - 80px); position: fixed; pointer-events: auto; z-index: 80; }
.dsh-bloom-switcher[data-slotted="true"] .dsh-bloom-menu { left: 0; right: auto; max-width: calc(100vw - 96px); max-height: var(--bloom-menu-max-h, calc(100vh - 80px)); overflow-y: auto; overscroll-behavior: contain; }
.dsh-bloom-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
  font: 12px/1.2 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
  /* The macOS/Windows frameless header must let its own controls receive clicks. */
  -webkit-app-region: no-drag;
}
.dsh-bloom-switcher * { -webkit-app-region: no-drag; }

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
/* 色点是这身皮肤的「配色样本」，不能只是一块平涂 —— 它是用户判断「这个配色长什么样」
   的唯一依据。给它玻璃质感：顶部一道内高光（球面反光）+ 底部柔光晕（离开发光面）。
   跟整套皮肤的玻璃语言一致，而不是十个平涂小方块。
 *
 * ⚠️ 不要在这里用 color-mix 配 var(--bloom-morandi)：
 * --bloom-morandi 存的是 RGB 三元组（"146, 168, 179"，供 rgba(var(...)) 用），
 * 不是色值 —— 塞进 oklch 语法非法，**整条 box-shadow 一起失效**（computed 变 none）。
 * 实测踩过：规则命中、优先级也对，但画面上一点影子都没有。
 * （--bloom-accent 才是色值，可以用 color-mix。） */
.dsh-bloom-option .dsh-bloom-dot {
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.38),
    inset 0 -1px 1px rgba(0, 0, 0, 0.14),
    0 0 0 1px rgba(146, 168, 179, 0.22),
    0 1px 4px rgba(0, 0, 0, 0.22);
  transition: box-shadow var(--bloom-dur-fast, 130ms) var(--bloom-ease, cubic-bezier(0.2,0.8,0.2,1));
}
.dsh-bloom-option:hover .dsh-bloom-dot,
.dsh-bloom-option[data-active="true"] .dsh-bloom-dot {
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.45),
    inset 0 -1px 1px rgba(0, 0, 0, 0.14),
    0 0 0 1px rgba(146, 168, 179, 0.38),
    0 2px 7px rgba(0, 0, 0, 0.28);
}

/* 面板头部：标题、配色胶囊与关闭按钮 */
.dsh-bloom-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 10px;
  /* 使用柔和微阴影替代硬边框分割，形成平滑过渡 */
  box-shadow: 0 6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
}
/* 有新版时的小红点：徽标本体在「版本与更新」折叠区里，默认看不见，
   所以在触发器和那一行入口各点一个 6px 圆点。用 accent 而不是红色 ——
   这是"有更新"不是"出错了"，莫兰迪主题里一点纯红会非常突兀。 */
.dsh-bloom-switcher[data-bloom-update] .dsh-bloom-trigger::after,
.dsh-bloom-switcher[data-bloom-update] .dsh-bloom-more::after {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--bloom-accent, #6b8f71);
  box-shadow: 0 0 6px -1px var(--bloom-glow);
  flex: 0 0 auto;
}
.dsh-bloom-switcher[data-bloom-update] .dsh-bloom-trigger::after {
  margin-left: 1px;
}
.dsh-bloom-switcher[data-bloom-update] .dsh-bloom-more::after {
  margin-left: 4px;
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

/* 底栏：版本信息与快捷功能区保持单行布局 */
.dsh-bloom-more {
  display: inline-flex; align-items: center; gap: 5px;
  appearance: none; border: 0; background: transparent; cursor: pointer;
  padding: 0;
  font: inherit; font-size: 11px; line-height: 1;
  color: var(--dsw-alias-label-tertiary, #999);
  transition: color .15s ease;
}
.dsh-bloom-more__name { font-weight: 600; color: var(--dsw-alias-label-secondary, #777); }
.dsh-bloom-more__ver { font-variant-numeric: tabular-nums; }
.dsh-bloom-more:hover, .dsh-bloom-more:hover .dsh-bloom-more__name { color: var(--dsw-alias-label-primary, #222); }
.dsh-bloom-more:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: 2px;
  border-radius: 4px;
}
.dsh-bloom-more[aria-expanded="true"] .dsh-bloom-more__arrow { transform: rotate(-90deg); }
.dsh-bloom-more__arrow { transition: transform .16s ease; }
.dsh-bloom-more-body[hidden] { display: none; }

.dsh-bloom-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  /* v0.6.0 patch: 提到 99999，确保 Bloom 下拉菜单覆盖在 DSH 原生顶栏 tabs
     （"对话 / 轨迹"，z-index 更高）之上，不被截断 */
  z-index: 99999;
  /* v0.12.x: 236 → 312。最宽的是「版本与更新」里的 DSH 检查行：
     label 28 + 版本号 63 + 状态 chip 62 + 两个按钮 92 + 5×gap 30 = 275，
     加左右 padding 28 ≈ 303 —— 236px 时 flex 把没有 nowrap 的状态 chip
     压到 min-content（1 字宽），「版本未知」被折成竖排字（owner 2026-09-14
     实拍反馈「下面怎么就变窄了」）。宽度按最宽内容实算留出余量。 */
  min-width: 312px;
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
/* 菜单入场：从右上角 scale+fade 打开。
 *
 * ⚠️ 重播靠的是 JS 里的 playEnter()（见 switcher.ts）：先摘掉 .is-entering、
 * 读一次 offsetWidth 强制重排、再加回来。只靠 :not([hidden]) 这个选择器不行 ——
 * 同一个元素第二次显示时，animation 已经处于结束态，浏览器不会重播，
 * 表现就是「第一次打开有动画，后面几次都是硬弹出来」。 */
.dsh-bloom-menu { transform-origin: top right; }
/* 面板入场动画：12px 弹性位移与微缩放回弹 */
@keyframes bloom-menu-in {
  from { opacity: 0; transform: translateY(-12px) scale(0.96); }
  to { opacity: 1; transform: none; }
}
.dsh-bloom-menu.is-entering {
  animation: bloom-menu-in 320ms var(--bloom-ease-back, cubic-bezier(0.34,1.56,0.64,1));
}

/* 逐行错峰滑入 —— whale-widget / wallpaper-engine 那种「有产品感」的关键手法：
   不是整块一起淡入，而是条列依次落位，观感上是一次有节奏的展开而不是一次闪烁。
   纯 CSS 实现（nth-child 给延迟），不需要 rAF、不需要 JS 量高度。

   animation-fill-mode: backwards 是必须的：延迟期间元素要先停在起始态（透明），
   否则会出现「先整块亮一下、再逐行重播」的鬼影。 */
@keyframes bloom-row-in {
  from { opacity: 0; transform: translateY(-7px); }
  to { opacity: 1; transform: none; }
}
.dsh-bloom-menu.is-entering .dsh-bloom-option,
.dsh-bloom-menu.is-entering .dsh-bloom-section,
.dsh-bloom-menu.is-entering .dsh-bloom-appearance {
  animation: bloom-row-in 240ms var(--bloom-ease-out, cubic-bezier(0.22,1,0.36,1)) backwards;
}
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(1) { animation-delay: 30ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(2) { animation-delay: 42ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(3) { animation-delay: 54ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(4) { animation-delay: 66ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(5) { animation-delay: 78ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(6) { animation-delay: 90ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(7) { animation-delay: 102ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(8) { animation-delay: 114ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(9) { animation-delay: 126ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(10) { animation-delay: 138ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(11) { animation-delay: 150ms; }
.dsh-bloom-menu.is-entering .dsh-bloom-option:nth-child(12) { animation-delay: 162ms; }
/* 色块之后的区段跟着最后一档走，形成「一行一行落下来、再整体收尾」的节奏 */
.dsh-bloom-menu.is-entering .dsh-bloom-section,
.dsh-bloom-menu.is-entering .dsh-bloom-appearance { animation-delay: 174ms; }

/* 「版本与更新」展开：同框上下滑动（对齐 whale-widget 的做法）。
 * 不用 display:none 硬切 —— 高度用 grid-template-rows 0fr→1fr 过渡，
 * 容器高度自然撑开，内部内容整块 translateY 滑入，末段带一点回弹。 */
.dsh-bloom-more-body {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    grid-template-rows var(--bloom-dur-slow, 280ms) var(--bloom-ease-back, cubic-bezier(0.34,1.56,0.64,1)),
    opacity var(--bloom-dur, 200ms) var(--bloom-ease-out, cubic-bezier(0.22,1,0.36,1)),
    transform var(--bloom-dur-slow, 280ms) var(--bloom-ease-back, cubic-bezier(0.34,1.56,0.64,1));
}
.dsh-bloom-more-body > * { min-height: 0; overflow: hidden; }
.dsh-bloom-more-body[data-open="true"] {
  grid-template-rows: 1fr;
  opacity: 1;
  transform: none;
}
/* 首帧之前不能有过渡：否则初始渲染会从 0fr 播一次莫名其妙的展开 */
.dsh-bloom-more-body[data-instant="true"] { transition: none; }

.dsh-bloom-rotation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 14px;
  color: var(--dsw-alias-label-secondary, #555);
}
.dsh-bloom-rotation__select {
  font: inherit;
  color: var(--dsw-alias-label-primary, #222);
  background: var(--dsw-alias-bg-layer-2, #fff);
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,.15));
  border-radius: 6px;
  padding: 4px 6px;
}
.dsh-bloom-rotation__select:focus-visible {
  outline: 2px solid var(--bloom-accent, #34698c);
  outline-offset: 2px;
}

.dsh-bloom-options {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dsh-bloom-option {
  /* 稳妥的单行 Grid：button 不依赖 Chromium 的 subgrid，
     各列尺寸严格固定，诗句自适应占满中间，右侧勾选绝不折行。 */
  display: grid;
  grid-template-columns: 14px 44px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 34px;
  padding: 0 12px;
  box-sizing: border-box;
}
.dsh-bloom-menu[lang="en"] .dsh-bloom-option {
  grid-template-columns: 14px 5.75em minmax(0, 1fr) 14px;
}
.dsh-bloom-option {
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
/* [LES-30] */
.dsh-bloom-option:focus-visible {
  --dsw-focus-ring-color: color-mix(in oklch, var(--bloom-accent, #34698c) 62%, transparent);
  outline: 2px solid var(--dsw-focus-ring-color);
  outline-offset: -2px;
  background: rgba(var(--bloom-morandi), 0.14);
}
/* 选中态：淡底 + 一道柔的内描边。之前只有 background，在玻璃面板上整行像被涂了
 * 一块颜色，和相邻行之间没有「这一行被选中」的边界感。 */
.dsh-bloom-option[data-active="true"] {
  background: rgba(var(--bloom-morandi), 0.2);
  box-shadow:
    inset 0 0 0 1px color-mix(in oklch, var(--bloom-accent, #34698c) 26%, transparent),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}
.dsh-bloom-option[data-active="true"]:focus-visible {
  --dsw-focus-ring-color: color-mix(in oklch, var(--bloom-accent, #34698c) 78%, transparent);
  box-shadow: none;
}
/* 「新」小标签（本版新上的配色）：只占一个字宽，贴在名字后面。
   用 accent 色不抢行焦点；悬停整行时不变化，它是个状态不是按钮。 */
.dsh-bloom-option__new {
  display: inline-block;
  vertical-align: 2px;
  margin-left: 5px;
  font-size: 9px;
  font-weight: 500;
  line-height: 1.5;
  padding: 0 3px;
  border-radius: 3px;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 16%, transparent);
  color: color-mix(in oklch, var(--bloom-accent, #6b8f71) 78%, var(--dsw-alias-label-primary, #222));
}
.dsh-bloom-option__name {
  font-weight: 500;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 保留每一行诗句对应配色的渐变；起笔使用可读的次级正文色。
   不再整行叠透明度，避免原本达标的 accent 与背景再次混合后变淡。 */
.dsh-bloom-option__en {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
  letter-spacing: 0.04em;
  font-family: 'Songti SC', 'STSong', 'Source Han Serif SC', 'Noto Serif SC', serif;
  background-image: linear-gradient(100deg, var(--dsw-alias-label-secondary, #666) 0%, color-mix(in oklab, var(--bloom-poem-b) 45%, var(--dsw-alias-label-secondary, #666)) 70%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 1;
  transition: opacity var(--bloom-dur-fast, 130ms) var(--bloom-ease, cubic-bezier(0.2,0.8,0.2,1));
}
/* 西文诗句：收一档字号、去字距、斜体，完整句在行 title 里。 */
.dsh-bloom-option__en:not(:lang(zh)) {
  font-size: 11.5px;
  letter-spacing: 0.01em;
  font-family: 'Iowan Old Style', 'Palatino', Georgia, serif;
  font-style: italic;
}
body[data-ds-dark-theme] .dsh-bloom-option__en {
  background-image: linear-gradient(100deg, var(--dsw-alias-label-secondary, #bbb) 0%, color-mix(in oklab, var(--bloom-poem-bd) 45%, var(--dsw-alias-label-primary, #eee)) 70%);
  opacity: 1;
}
.dsh-bloom-option:hover .dsh-bloom-option__en,
.dsh-bloom-option[data-active="true"] .dsh-bloom-option__en {
  opacity: 1;
}
/* 选中那一行让渐变缓缓流过，跟「深度求索中…」同一种语言 —— 只给一行，
   十行一起流会变成灯箱。 */
.dsh-bloom-option[data-active="true"] .dsh-bloom-option__en {
  background-size: 220% 100%;
  animation: dsh-bloom-poem-flow 4.2s ease-in-out infinite;
}
@keyframes dsh-bloom-poem-flow {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-option[data-active="true"] .dsh-bloom-option__en { animation: none; }
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

/* 玻璃质感行：结构与深浅模式行一致（同一套分段控件），多一行说明文字。
 * 说明只在系统要求降透明时才出现，所以默认不占位。 */
.dsh-bloom-glass {
  padding: 0 14px 2px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #777);
}
.dsh-bloom-glass__hint {
  margin: 7px 2px 2px;
  font-size: 11px;
  line-height: 1.55;
  color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-glass__hint[hidden] { display: none; }
/* [LES-33][LES-36] */
.dsh-bloom-glass__choices { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 6px; }
.dsh-bloom-glass__choice {
  appearance: none;
  min-width: 0;
  min-height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,.1));
  border-radius: 10px;
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 80%, transparent);
  color: var(--dsw-alias-label-secondary, #555);
  font: inherit;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  transition: border-color .18s, background-color .18s, box-shadow .18s, transform .18s;
}
.dsh-bloom-glass__choice:hover { transform: translateY(-2px); border-color: var(--bloom-hairline-strong); }
.dsh-bloom-glass__choice[data-active="true"] {
  color: var(--dsw-alias-label-primary, #222);
  font-weight: 600;
  border-color: color-mix(in oklch, var(--bloom-accent, #6b8f71) 60%, transparent);
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 8%, var(--dsw-alias-bg-layer-1, #fff));
  box-shadow: none;
}
.dsh-bloom-glass__choice:focus-visible { outline: 2px solid var(--bloom-accent, #6b8f71); outline-offset: 2px; }
.dsh-bloom-glass__sample {
  position: relative;
  display: block;
  width: 44px;
  height: 30px;
  border-radius: 6px;
  overflow: hidden;
  /* 底纹：深色条纹 + 亮色缝隙，两种主题下都清晰。
     三档共用同一张底纹，差别只在玻璃怎么处理它。 */
  background: repeating-linear-gradient(115deg,
    var(--bloom-accent, #6b8f71) 0 2px,
    color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 88%, var(--bloom-accent, #6b8f71)) 2px 6px);
}
.dsh-bloom-glass__sample::before {
  content: '';
  position: absolute;
  inset: 5px 4px 4px 7px;
  border-radius: 4px;
  box-shadow: inset 0 1px 0 color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 80%, transparent), 0 3px 5px -2px rgba(0,0,0,.25);
}
/* [LES-27] */
.dsh-bloom-glass__choice[data-glass="liquid"] .dsh-bloom-glass__sample::before {
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 22%, transparent);
  border: 1px solid color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 60%, transparent);
  -webkit-backdrop-filter: blur(.5px) url("#dsh-bloom-liquid-lens") saturate(1.2);
  backdrop-filter: blur(.5px) url("#dsh-bloom-liquid-lens") saturate(1.2);
}
/* 磨砂：条纹糊成一片均匀雾面。
   模糊给到 6px —— 小样只有 44px 宽，模糊太小就看不出散射（深色下尤其）。 */
.dsh-bloom-glass__choice[data-glass="matte"] .dsh-bloom-glass__sample::before {
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 48%, transparent);
  border: 1px solid color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 34%, transparent);
  -webkit-backdrop-filter: blur(6px) saturate(1.05);
  backdrop-filter: blur(6px) saturate(1.05);
}
/* [LES-36] */
.dsh-bloom-glass__choice[data-glass="matte"] .dsh-bloom-glass__sample::after {
  content: '';
  position: absolute;
  inset: 5px 4px 4px 7px;
  border-radius: 4px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E");
  background-repeat: repeat;
  pointer-events: none;
}
.dsh-bloom-glass__choice[data-glass="frosted"] .dsh-bloom-glass__sample::before {
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 30%, transparent);
  border: 1px solid color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 40%, transparent);
  -webkit-backdrop-filter: blur(5px) saturate(1.15);
  backdrop-filter: blur(5px) saturate(1.15);
}
.dsh-bloom-glass__description {
  margin: 7px 2px 0;
  font-size: 11px;
  line-height: 1.4;
  min-height: 16px;
  color: var(--dsw-alias-label-secondary, #777);
}
@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-glass__choice { transition: none; }
  .dsh-bloom-glass__choice:hover { transform: none; }
}
@media (forced-colors: active) {
  .dsh-bloom-glass__choice[data-active="true"] { border: 2px solid Highlight; }
  .dsh-bloom-glass__sample { forced-color-adjust: none; }
}
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

/* 氛围分段：深浅各一行，只显示与宿主当前深浅一致的那行 */
body[data-ds-dark-theme] .dsh-bloom-ambience[data-scheme="light"],
body:not([data-ds-dark-theme]) .dsh-bloom-ambience[data-scheme="dark"] { display: none; }
.dsh-bloom-ambience {
  display: flex;
  width: 100%;
  padding: 3px;
  border-radius: 9px;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 94%);
  gap: 2px;
  margin-top: 6px;
  box-sizing: border-box;
}
.dsh-bloom-ambience__btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  flex: 1;
  padding: 5px 2px;
  cursor: pointer;
  line-height: 1.5;
  white-space: nowrap;
  text-align: center;
  font-size: 11.5px;
  border-radius: 7px;
  transition: background-color var(--bloom-dur-fast) var(--bloom-ease), color var(--bloom-dur-fast) var(--bloom-ease);
}
.dsh-bloom-ambience__btn:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: -2px;
}
.dsh-bloom-ambience__btn:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 90%);
}
.dsh-bloom-ambience__btn[data-active="true"] {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: var(--bloom-accent, inherit);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
body[data-ds-dark-theme] .dsh-bloom-ambience__btn[data-active="true"] {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 22%, #1a1a1c);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* The color choice belongs to the meteor background only. */
.dsh-bloom-meteor-color { display: none; align-items: center; gap: 6px; margin: 6px 3px 0; font-size: 11.5px; }
body[data-ds-dark-theme][data-bloom-ambience-dark="galaxy"] .dsh-bloom-meteor-color { display: flex; }
.dsh-bloom-meteor-color > span { margin-right: auto; color: var(--dsw-alias-label-secondary, inherit); }
.dsh-bloom-meteor-color button { border: 0; border-radius: 7px; padding: 5px 10px; color: inherit; background: transparent; font: inherit; cursor: pointer; }
.dsh-bloom-meteor-color button[data-active="true"] { color: var(--bloom-accent, inherit); background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 22%, #1a1a1c); }
.dsh-bloom-meteor-color button:focus-visible { outline: 2px solid var(--bloom-accent, #6b8f71); outline-offset: -2px; }

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
/* display:inline-flex 会压掉 [hidden] 的 display:none —— 没有新版时这里
   原本留着一颗空胶囊（截图里版本行右侧那条灰短线）。 */
.dsh-bloom-version__update[hidden] { display: none; }
/* 版本行现在只剩「↑ 可更新」徽标（名字和版本号已在底栏），没新版时整行不占位 */
.dsh-bloom-version:not(:has(.dsh-bloom-version__update:not([hidden]))) { display: none; }
.dsh-bloom-version__update:hover { color: color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), black 15%); }


/* ── 本版更新（CHANGELOG 注入）─────────────────────────────────
   展开体里的第一块。条目按 --i 错峰入场（每条 18ms），读起来像一行行落下，
   而不是一次全亮。 */
.dsh-bloom-log {
  /* 和 .dsh-bloom-version / DSH 行同一套 14px 左右内边距，不然贴边 */
  padding: 6px 14px 8px;
  border-bottom: 1px solid var(--bloom-hairline, rgba(0,0,0,.08));
  margin-bottom: 6px;
}
.dsh-bloom-log__head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 8px; margin-bottom: 6px;
}
.dsh-bloom-log__title {
  font-size: 11px; font-weight: 600; letter-spacing: .02em;
  color: var(--dsw-alias-label-secondary, #777);
}
.dsh-bloom-log__all {
  font-size: 10.5px; color: var(--dsw-alias-label-tertiary, #999);
  text-decoration: none; white-space: nowrap;
  transition: color .15s ease;
}
.dsh-bloom-log__all:hover { color: var(--bloom-accent, #6b8f71); text-decoration: underline; }
.dsh-bloom-log__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.dsh-bloom-log__item {
  display: flex; gap: 6px; align-items: flex-start;
  font-size: 11px; line-height: 1.45;
  color: var(--dsw-alias-label-secondary, #777);
  animation: dsh-bloom-log-in .26s var(--bloom-ease, ease) both;
  animation-delay: calc(var(--i, 0) * 18ms);
}
@keyframes dsh-bloom-log-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}
.dsh-bloom-log__tag {
  flex: 0 0 auto; margin-top: 1px;
  font-size: 9.5px; line-height: 1.5; padding: 0 4px; border-radius: 3px;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71) 16%, transparent);
  color: color-mix(in oklch, var(--bloom-accent, #6b8f71) 78%, var(--dsw-alias-label-primary, #222));
}
.dsh-bloom-log__tag[data-kind="fix"] {
  background: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 9%, transparent);
  color: var(--dsw-alias-label-secondary, #777);
}
@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-log__item { animation: none; }
}

/* ── 遥测开关 ──────────────────────────────────────────────── */
.dsh-bloom-telemetry {
  display: flex; align-items: center; gap: 6px;
  margin-top: 8px; cursor: pointer; width: fit-content;
  font-size: 11px; color: var(--dsw-alias-label-tertiary, #999);
}
.dsh-bloom-telemetry__box {
  position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;
}
.dsh-bloom-telemetry__box-ui {
  width: 22px; height: 12px; border-radius: 6px; flex: 0 0 auto;
  background: var(--dsw-alias-label-primary, #222);
  opacity: .16; position: relative;
  transition: opacity .18s ease, background .18s ease;
}
.dsh-bloom-telemetry__box-ui::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #fff;
  transition: transform .18s var(--bloom-ease, ease);
}
.dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui {
  background: var(--bloom-accent, #6b8f71); opacity: .85;
}
.dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui::after { transform: translateX(10px); }
.dsh-bloom-telemetry__box:focus-visible + .dsh-bloom-telemetry__box-ui {
  outline: 2px solid var(--bloom-accent, #6b8f71); outline-offset: 2px;
}
.dsh-bloom-telemetry:hover .dsh-bloom-telemetry__text { color: var(--dsw-alias-label-secondary, #777); }

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
  white-space: nowrap;
}
/* 状态 chip：绝不允许折行 —— 折行后 flex-shrink 会把它压到 1 字宽，
   「版本未知」变成竖排字。推右交给 .dsh-bloom-dsh-spacer（flex:1），
   不再用 margin-left:auto，两份「吃光自由空间」会互相抵消语义。 */
.dsh-bloom-dsh-state {
  /* 原来 flex:none —— 报错原文一长就不肯缩，把同一行的「检查 / 填入」挤出面板
     （2026-11-04 截图：中文下「填入」被裁掉一半）。改成可缩 + 省略号，全文在 title。 */
  flex: 0 1 auto;
  min-width: 0;
  max-width: 132px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in oklch, var(--dsw-alias-label-tertiary, #999), transparent 88%);
  color: var(--dsw-alias-label-secondary, #666);
}
/* 没有状态时（检查中）chip 只剩背景，截图里是「DSH —」后面一条灰短线 */
.dsh-bloom-dsh-state:empty { display: none; }
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
.dsh-bloom-dsh-state[data-state="managed"],
.dsh-bloom-dsh-state[data-state="ahead"] {
  background: color-mix(in oklch, var(--dsw-alias-brand-primary, #4a90e2), transparent 88%);
  color: var(--dsw-alias-brand-primary, #4a90e2);
}
.dsh-bloom-dsh-state[data-state="err"] {
  background: color-mix(in oklch, oklch(48% 0.17 28), transparent 88%);
  color: oklch(48% 0.17 28);
}
/* 宿主形态标签（桌面端 / Web）：与状态 chip 同风格，但用中性色 ——
   它不是「有更新」那种状态提示，只是告诉用户自己装的是哪一版宿主。
   对比度同状态 chip 的明暗分档：亮色 45%、暗色 78%，都过 AA。 */
.dsh-bloom-dsh-platform {
  flex: none;
  white-space: nowrap;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in oklch, oklch(45% 0.06 250), transparent 88%);
  color: oklch(45% 0.06 250);
}
.dsh-bloom-dsh-platform[data-platform="desktop"] {
  background: color-mix(in oklch, oklch(45% 0.13 150), transparent 88%);
  color: oklch(45% 0.13 150);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-platform {
  background: color-mix(in oklch, oklch(78% 0.05 250), transparent 88%);
  color: oklch(78% 0.05 250);
}
body[data-ds-dark-theme] .dsh-bloom-dsh-platform[data-platform="desktop"] {
  background: color-mix(in oklch, oklch(78% 0.14 150), transparent 88%);
  color: oklch(78% 0.14 150);
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
/* 菜单 min-width 312px 时 actions 区实际可用 ≈ 284px。两个按钮原本都 flex:1
   平分,而「复制升级命令」6 字 × 10.5px + 左右 padding 装不下就折成两行,
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
/* 主按钮按内容宽度，不再吃满剩余空间：查到版本前它是禁用的，
   原来却是一大块实心 accent，比真正有用的信息还抢眼。禁用时退回描边样式。 */
.dsh-bloom-dsh-btn--primary { flex: 0 0 auto; }
.dsh-bloom-dsh-btn--primary:disabled {
  background: transparent;
  border-color: var(--bloom-hairline, rgba(0,0,0,.08));
  color: var(--dsw-alias-label-tertiary, #999);
}

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

/* 底栏作为分享面板的定位边界，使面板始终贴齐菜单右侧。 */
.dsh-bloom-foot {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 2px;
  padding: 7px 14px 9px;
  font-size: 11px;
  box-shadow: 0 -6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 82%);
}
.dsh-bloom-foot__link {
  color: var(--dsw-alias-label-secondary, #777);
  text-decoration: none;
  transition: color .15s ease;
  /* 「分享」是 button（要跑复制逻辑），其余是 a —— 这里把 button 的默认样式抹平，
     两种标签在这一行必须长得一模一样。 */
  border: 0;
  padding: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}
.dsh-bloom-foot__link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  line-height: 1;
}
.dsh-bloom-foot__icon {
  width: 13px;
  height: 13px;
  flex: 0 0 auto;
  opacity: .78;
}
.dsh-bloom-foot__link:hover { color: var(--bloom-accent, #6b8f71); }
.dsh-bloom-foot__link:hover .dsh-bloom-foot__icon { opacity: 1; }
.dsh-bloom-foot__link:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: 2px;
  border-radius: 4px;
}
/* 底栏一行装「版本入口 + 三个快链」，任何语言都不许折行（英文原文案曾把投票挤成两行） */
.dsh-bloom-foot__links { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px 12px; min-width: 0; }
.dsh-bloom-more { white-space: nowrap; }
.dsh-bloom-foot__link { min-height: 28px; white-space: nowrap; }
.dsh-bloom-share-panel[hidden] { display: none; }
.dsh-bloom-share-panel {
  position: absolute;
  right: 14px;
  bottom: calc(100% + 4px);
  z-index: 2;
  box-sizing: border-box;
  width: min(280px, calc(100% - 28px));
  max-height: min(300px, calc(var(--bloom-menu-max-h, 100vh) - 56px));
  overflow-y: auto;
  padding: 5px;
  border: 1px solid var(--bloom-hairline, rgba(0,0,0,.16));
  border-radius: 10px;
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 94%, transparent);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  color: var(--dsw-alias-label-primary, #222);
  box-shadow: var(--bloom-shadow, 0 8px 24px rgba(0,0,0,.18));
  white-space: normal;
}
body[data-ds-dark-theme] .dsh-bloom-share-panel {
  background: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #252528) 94%, transparent);
  color: var(--dsw-alias-label-primary, #f2f2f2);
}
.dsh-bloom-share-action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  width: 100%;
  min-height: 44px;
  padding: 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.dsh-bloom-share-intro { display: block; padding: 7px 8px 5px; color: var(--dsw-alias-label-secondary, #666); font-size: 11px; line-height: 1.4; }
.dsh-bloom-share-action:hover:not(:disabled) { background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 88%); }
.dsh-bloom-share-action:disabled { opacity: .55; cursor: default; }
.dsh-bloom-share-action:focus-visible, .dsh-bloom-share-result button:focus-visible, .dsh-bloom-share-result a:focus-visible, .dsh-bloom-share-cancel:focus-visible, .dsh-bloom-share-manual:focus-visible {
  outline: 2px solid var(--bloom-accent, #6b8f71);
  outline-offset: -2px;
}
.dsh-bloom-share-action__title { font-size: 12px; font-weight: 600; }
.dsh-bloom-share-action__hint { font-size: 11px; line-height: 1.35; color: var(--dsw-alias-label-secondary, #555); overflow-wrap: anywhere; }
body[data-ds-dark-theme] .dsh-bloom-share-action__hint { color: var(--dsw-alias-label-secondary, #c3c3c3); }
.dsh-bloom-share-status { display: block; padding: 5px 8px; color: var(--dsw-alias-label-secondary, #666); font-size: 11px; line-height: 1.4; }
.dsh-bloom-share-status:empty { display: none; }
.dsh-bloom-share-cancel { display: inline-flex; align-items: center; min-height: 28px; margin: 0 8px 6px; padding: 0; border: 0; background: none; color: var(--bloom-accent, #6b8f71); font: inherit; cursor: pointer; }
.dsh-bloom-share-cancel[hidden] { display: none; }
.dsh-bloom-share-manual { box-sizing: border-box; width: 100%; min-height: 92px; padding: 7px; resize: vertical; color: var(--dsw-alias-label-primary, #222); background: var(--dsw-alias-bg-layer-1, #fff); border: 1px solid var(--bloom-hairline); border-radius: 6px; font: inherit; }
.dsh-bloom-share-manual[hidden] { display: none; }
.dsh-bloom-share-result { display: flex; align-items: center; gap: 8px; padding: 4px 8px 8px; font-size: 11px; line-height: 1.4; }
.dsh-bloom-share-result button, .dsh-bloom-share-result a { min-height: 28px; display: inline-flex; align-items: center; border: 0; padding: 0; background: none; color: var(--bloom-accent, #6b8f71); font: inherit; text-decoration: none; cursor: pointer; }
.dsh-bloom-share-result [hidden] { display: none; }
.dsh-bloom-share-result[hidden] { display: none; }
@media (prefers-contrast: more), (forced-colors: active) {
  html body .dsh-bloom-share-panel { background: Canvas; color: CanvasText; border-color: CanvasText; -webkit-backdrop-filter: none; backdrop-filter: none; }
}
@media (prefers-reduced-transparency: reduce) {
  html body:not([data-bloom-glass]) .dsh-bloom-share-panel { background: var(--dsw-alias-bg-layer-1, #fff); -webkit-backdrop-filter: none; backdrop-filter: none; }
}

@media (prefers-reduced-motion: reduce) {
  .dsh-bloom-trigger, .dsh-bloom-chevron, .dsh-bloom-option { transition: none !important; }
  /* 设计约束④：减弱动效时一律瞬间到位，不留任何位移/回弹 */
  .dsh-bloom-menu.is-entering { animation: none; }
  .dsh-bloom-menu.is-entering .dsh-bloom-option,
  .dsh-bloom-menu.is-entering .dsh-bloom-section,
  .dsh-bloom-menu.is-entering .dsh-bloom-appearance { animation: none; }
  .dsh-bloom-more-body { transition: none; transform: none; }
}

/* 窄屏降级：DSH 顶栏在 < 900px 时空间紧张，隐藏中文名只留色点+chevron，
   避免挤压 Session log 等原生控件。色点本身 12px 渐变辨识度足够。 */
@media (max-width: 900px) {
  .dsh-bloom-trigger__name { display: none; }
  .dsh-bloom-trigger { padding: 0 7px; gap: 4px; }
}
`
