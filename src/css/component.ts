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
   全部用气质轨(morandi)的极低透明度，这是莫兰迪「灰调通透」的来源。

   v0.10.x（owner 反馈「没光感」）：把 veil 换成 aurora-stream 并提高透明度。
   aurora-stream 来自 motion 谱，是每个变体的三色光谱（鼠尾草=草绿系、青金=蓝系），
   透明度从原来的 40% 提高到 55-65%，让"四角色斑"真正能看出来 —— 这是
   "光感"的主要来源，不再靠硬边光带。 */
body {
  background-attachment: fixed;
  background-image:
    /* 顶左：主色光晕（accent，给画面主调） */
    radial-gradient(1400px circle at 6% -4%, color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 80%), transparent 50%),
    /* 顶右：aurora stream 2 —— 异色相，跟主色形成对比 */
    radial-gradient(1100px circle at 100% 8%, color-mix(in oklch, var(--bloom-aurora-stream-2), transparent 50%), transparent 60%),
    /* 底右：aurora stream 3 —— 再一个异色相 */
    radial-gradient(900px circle at 96% 100%, color-mix(in oklch, var(--bloom-aurora-stream-3), transparent 50%), transparent 62%),
    /* 底左：aurora stream 1 —— 四角各一团 */
    radial-gradient(1000px circle at 2% 96%, color-mix(in oklch, var(--bloom-aurora-stream-1), transparent 50%), transparent 60%);
}

/* 让 body 的氛围层透出来：DSH 这几个全屏容器自带不透明底色会盖住它。
   侧栏与卡片保留自己的 surface 色（原版同样保留），只做描边和光。 */
[class*="_frame"],
[class*="_centerCol"],
/* :has() 里不能加子组合器（\`> \`）：实测 DSH 的结构是 _root > _body > _scrollBody，
   scrollBody 是孙子。写成子选择器这条一直没命中 —— 会话区一直盖着
   oklch(0.28 0.02 240) 不透明底，body 的极光在中区完全看不见（这就是
   owner 说「没光感」的真正原因）。 */
[class*="_root"]:has([class*="_scrollBody"]),
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
[class*="_sidebarCol"] {
  /* 宿主那条 0.5px 实线优先级更高，不加 !important 关不掉（实测覆盖后仍是 0.5px） */
  border-right: 0 !important;
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
/* 顶栏 —— 从顶部滑下比从下方滑上更贴「页面打开」的语义 */
[class*="_header"] {
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

/* 输入卡 focus-within 呼吸脉冲 —— 主题色微光，慢速涨落。用 ::after 叠层，
   不动现有玻璃 ::before（z-index:-1，玻璃本身）和 focus-within 的 box-shadow
   （2px 主题色环，已经够锐利了）；我们只给它一个会呼吸的额外外晕。
   composer card 圆角 16px，所以 ::after 圆角 20px、inset -4px 让外晕不切边 */
@keyframes bloom-composer-breathe {
  0%, 100% { opacity: 0; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.014); }
}
div[class*="_composer"] div[class*="_card"]::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  pointer-events: none;
  z-index: -1;
  opacity: 0;
  background: radial-gradient(
    55% 55% at 50% 50%,
    color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%) 0%,
    transparent 70%
  );
  transition: opacity var(--bloom-dur, 200ms) var(--bloom-ease);
}
div[class*="_composer"] div[class*="_card"]:focus-within::after {
  opacity: 1;
  animation: bloom-composer-breathe 2.8s ease-in-out infinite;
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

/* 顶部标题栏下沿：宽 18px 软渐变 —— 不是"线"是"光"。最右 12% 不透明度，向下淡出到透明。 */
[class*="_header"] {
  position: relative;
  border-bottom: 0 !important;
}
[class*="_header"]::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  bottom: 0;
  height: 18px;
  pointer-events: none;
  z-index: 1;
  background: linear-gradient(
    to bottom,
    color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 88%) 0%,
    transparent 100%
  );
}

/* 描边按钮 → 浅底。新会话 / Session 日志 / 本主题切换器三个长得一样，
   一起处理，免得只改自己的显得突兀 */
[class*="_newSession"],
[class*="_sessionLogButton"],
.dsh-bloom-trigger {
  border-color: transparent !important;
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 92%) !important;
  /* transform + box-shadow 也进 transition：§7 hover 抬升要平滑，不能 snap。
     §7 那边只改属性，不重声明 transition —— 避免重复定义打架 */
  transition:
    background var(--bloom-dur-fast, .16s) var(--bloom-ease, ease),
    transform var(--bloom-dur-fast, .16s) var(--bloom-ease, ease),
    box-shadow var(--bloom-dur-fast, .16s) var(--bloom-ease, ease);
}
[class*="_newSession"]:hover,
[class*="_sessionLogButton"]:hover,
.dsh-bloom-trigger:hover {
  background: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 86%) !important;
}

/* 侧栏底部操作区：上边框 → 向上扩散的极淡阴影 */
[class*="_footerActions"] {
  border-top: 0 !important;
  box-shadow: 0 -6px 10px -8px color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 78%);
}
`
