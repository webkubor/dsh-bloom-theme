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
export const GLASS_CSS = `
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
