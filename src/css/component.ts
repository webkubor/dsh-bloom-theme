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
export const COMPONENT_CSS = `
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
