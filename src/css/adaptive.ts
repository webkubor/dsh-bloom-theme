/**
 * 系统适配层 + 玻璃档位 —— 宿主（DSH）做了的适配，Bloom 一项不落。
 *
 * 来源：2026-11-04 拆 DeepSeek Harness.app 的 41 个 client 包，逐条盘点宿主
 * CSS 里的媒体查询与适配属性，再对照 Bloom 的覆盖情况。Bloom 原来只做了
 * `prefers-reduced-motion`，下面这些都是空白：
 *
 *   1. prefers-reduced-transparency  宿主 ui-layout 把侧栏换成 90% 实底；
 *                                    Bloom 有 10 组毛玻璃，原来一组都不响应。
 *   2. prefers-contrast: more        系统「增加对比度」。
 *   3. forced-colors: active         Windows 高对比主题；宿主 ui-chat 在这里停掉动画。
 *   4. html[data-input-modality]     宿主 ui-theme：鼠标操作时隐藏焦点环。
 *                                    Bloom 的全局 `:focus-visible { … !important }`
 *                                    把它盖掉了 —— 鼠标点一下就冒描边，这是 bug。
 *   5. pointer: coarse               宿主把触屏下的可点行撑到 44px。
 *   6. accent-color / 滚动条变量     宿主原生控件与滚动条都走 token，Bloom 让它们跟配色。
 *   7. overscroll-behavior           宿主滚动面板到底不带动外层。
 *
 * ## 玻璃档位怎么实现的
 *
 * Bloom 的毛玻璃分两类来源：
 *   · 8 处走共享 token `--bloom-glass-blur`（主侧栏、卡片、气泡、选择器…）
 *   · 4 处写死数值（切换器面板 14px、卡片 12px、面板 18px、滚动条 28px）
 *
 * 降级不能只改 token —— 写死的那 4 处不会跟着变；也不能逐条改选择器 ——
 * 侧栏的模糊在 `::before` 伪元素上，作用在宿主元素本身的规则**管不到它**
 * （2026-11-04 实测：改宿主元素的 backdrop-filter，伪元素上的 24px 模糊纹丝不动）。
 *
 * 所以两层都做：token 降级 + 选择器覆盖（含 ::before / ::after）。
 *
 * ## 选择器作用域的坑（改这个文件前先读这段）
 *
 * 作用域前缀只能加**一次**，而且规则体里不能再带 `body[data-bloom-variant]`。
 * 早先版本两边都带，拼出来是
 *     `html body[data-bloom-variant][data-bloom-glass="solid"] body[data-bloom-variant] ...`
 * —— body 套 body，页面上不存在这种结构，整条规则静默失效，
 * 降级看着"没生效"（2026-11-04 实测，连续三轮都栽在这）。
 *
 * 所以这里的做法：**规则体一律不写 body[...]**，作用域由 `scope()` 统一提供。
 */

/**
 * 规则体（相对 body）。
 *
 * 插件自己的元素（.dsh-bloom-menu 等）也在列表里 —— 它们同样在 body 下，
 * 拼上 scope 后一样成立。
 */
const GLASS_RULES = [
  'div[class*="_dock"]:has(> [class*="_preview"])',
  'div[class*="_composer"] div[class*="_card"]::before',
  'div[class*="_bubble"]',
  '[class*="_menu"]:not([class*="_menuAnchor"])',
  '[class*="_selector"]',
  '.dsh-bloom-trigger',
  '.dsh-bloom-menu',
  '.md-code-block',
]

/**
 * 侧栏玻璃挂在 `::before` 上 —— 宿主元素自己不能带 backdrop-filter
 * （glass.ts 里有一整段注释解释为什么：会改掉 fixed 元素的定位基准）。
 * 所以降级必须作用在伪元素上。
 */
const GLASS_PSEUDO = [
  '[class*="_sidebarCol"]::before',
]

/** 装饰层：氛围流线、光标光斑。高对比 / 强制颜色 / 实底档下只会干扰阅读。 */
const DECOR = [
  'body[data-bloom-variant="aurora"]::before',
  'body[data-bloom-variant="aurora"]::after',
  'body[data-bloom-variant="cinnabar"]::after',
]

/**
 * 生成一组选择器。
 *
 * @param scope 作用域前缀（放在最前面），例如 `html body[data-bloom-variant]`。
 * @param rules 规则体（相对 body，不带 body[...]）。
 */
const scope = (scopeSel: string, rules: string[]) =>
  rules.map((r) => `${scopeSel} ${r}`).join(',\n')

/**
 * 磨砂颗粒 —— 「柔和」档的签名。
 *
 * 只调透明度和模糊，三档在浅色主题下会收敛成同一个样子（实测：侧栏都是淡紫，
 * 输入卡都发白，2026-11-05）。真正能一眼分开的是**表面结构**，所以柔和档
 * 加一层极淡的噪点 —— 真实磨砂玻璃的表面就是这个质感，不是「更透明一点」。
 *
 * 深浅色用不同方向：浅色是黑色细点（压住高光），深色是白色细点（提亮暗面）。
 * 强度都极低（3~5%），不影响文字对比度。
 */
const GRAIN_LIGHT = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")"
const GRAIN_DARK = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' fill='%23fff' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")"

/** 需要铺颗粒的表面（宿主元素 + 伪元素各一份）。 */
const GRAIN_TARGETS = [
  'div[class*="_composer"] div[class*="_card"]::before',
  'div[class*="_bubble"]',
  'div[class*="_dock"]:has(> [class*="_preview"])',
  '[class*="_sidebarCol"]::before',
  '.dsh-bloom-menu',
  '.dsh-bloom-trigger',
  '[class*="_menu"]:not([class*="_menuAnchor"])',
  '[class*="_selector"]',
  '.md-code-block',
]

/**
 * 「实底」—— 哑光、无透光、边缘清晰。
 *
 * 跟通透档的结构差异（这才是三档能一眼分开的根本）：
 *   · 底色 100% 不透明，不再有氛围渐变透过来
 *   · 边缘是一条**清晰可见的实线**，而不是柔和的渐隐
 *   · 阴影收紧贴面，没有环境光晕
 *   · 文字与底色直接对比，不再隔着模糊层
 *
 * @param scopeSel 作用域前缀。
 */
const solidSurfaces = (scopeSel: string) => `
${scope(scopeSel, [...GLASS_RULES, ...GLASS_PSEUDO])} {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}
${scope(scopeSel, ['div[class*="_composer"] div[class*="_card"]::before', 'div[class*="_bubble"]', 'div[class*="_dock"]:has(> [class*="_preview"])', '.md-code-block'])} {
  background-color: var(--dsw-alias-bg-layer-1, #fff);
}
${scope(scopeSel, ['.dsh-bloom-menu', '.dsh-bloom-trigger', '[class*="_menu"]:not([class*="_menuAnchor"])', '[class*="_selector"]'])} {
  background-color: var(--dsw-alias-bg-layer-2, #fff);
}
${scope(scopeSel, ['[class*="_sidebarCol"]', '[class*="_sidebarCol"]::before'])} {
  background-color: var(--dsw-alias-bg-layer-1, #fff);
}
${scope(scopeSel, ['div[class*="_composer"] div[class*="_card"]::before', 'div[class*="_bubble"]', 'div[class*="_dock"]:has(> [class*="_preview"])'])} {
  /* 脆边：一条实线勾出形状，阴影收紧贴面。 */
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--bloom-accent, #6b8f71) 26%, transparent), 0 1px 3px -1px rgba(0,0,0,0.16);
}
${scope(scopeSel, ['.dsh-bloom-menu', '.dsh-bloom-trigger'])} {
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--bloom-accent, #6b8f71) 30%, transparent), 0 2px 6px -2px rgba(0,0,0,0.2);
}
${scope(scopeSel, ['[class*="_sidebarCol"]'])} {
  box-shadow: inset -1px 0 0 color-mix(in oklch, var(--bloom-accent, #6b8f71) 30%, transparent);
}
`

/**
 * 「柔和」—— 磨砂半透：表面有细微颗粒，透光被柔化，文字更稳。
 *
 * 与通透档的结构差异：
 *   · 模糊半径减半、饱和度压低 —— 背后的颜色不再那么跳
 *   · 表面铺一层噪点 —— 「磨砂」这个质感来源
 *   · 顶沿高光弱化到几乎看不出，阴影变中性
 *
 * @param scopeSel 作用域前缀。
 */
const softSurfaces = (scopeSel: string) => `
${scopeSel} {
  --bloom-glass-blur: 8px;
}
${scope(scopeSel, [...GLASS_RULES, ...GLASS_PSEUDO, '.md-code-block'])} {
  -webkit-backdrop-filter: blur(8px) saturate(1.05);
  backdrop-filter: blur(8px) saturate(1.05);
}
${scope(scopeSel, ['div[class*="_composer"] div[class*="_card"]::before', 'div[class*="_bubble"]', 'div[class*="_dock"]:has(> [class*="_preview"])', '[class*="_sidebarCol"]::before', '.md-code-block'])} {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-1, #fff) 87%, transparent);
}
${scope(scopeSel, ['.dsh-bloom-menu', '.dsh-bloom-trigger', '[class*="_menu"]:not([class*="_menuAnchor"])', '[class*="_selector"]'])} {
  background-color: color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff) 91%, transparent);
}
${scope(scopeSel, ['div[class*="_composer"] div[class*="_card"]::before', 'div[class*="_bubble"]', 'div[class*="_dock"]:has(> [class*="_preview"])'])} {
  box-shadow: inset 0 1px 0 color-mix(in oklch, var(--dsw-alias-label-primary, #222) 8%, transparent), 0 5px 16px -10px rgba(0,0,0,0.2);
}
${scope(scopeSel, ['.dsh-bloom-menu', '.dsh-bloom-trigger'])} {
  box-shadow: inset 0 1px 0 color-mix(in oklch, var(--dsw-alias-label-primary, #222) 7%, transparent), 0 6px 18px -12px rgba(0,0,0,0.22);
}
/* 颗粒：浅色压高光、深色提暗面 */
${scope(scopeSel, GRAIN_TARGETS)} {
  background-image: ${GRAIN_LIGHT};
  background-repeat: repeat;
}
${scope(scopeSel + ' body[data-ds-dark-theme]', GRAIN_TARGETS)} {
  background-image: ${GRAIN_DARK};
}
`

/** 用户档位的作用域（带 html 前缀提高权重，本文件最后注入，同权重也赢）。 */
const USER_SOFT = 'html body[data-bloom-variant][data-bloom-glass="soft"]'
const USER_SOLID = 'html body[data-bloom-variant][data-bloom-glass="solid"]'

export const ADAPTIVE_CSS = `
/* ═══ 0. 用户自选的玻璃档位（优先级高于系统降级）══════════════════════
   body[data-bloom-glass="soft"]  柔和：模糊半径减半、饱和度调低
   body[data-bloom-glass="solid"] 实底：去掉模糊与透明
   属性不存在 = 用户没动过 = 跟随系统（见下面第 1 条）。 */
${softSurfaces(USER_SOFT)}
${solidSurfaces(USER_SOLID)}
/* 通透：这一档的签名是「高透毛玻璃 + 顶沿高光」。
   去掉 0.25.0 过于浮夸的彩色环境投影（避免在桃夭/朱砂等色下在窗口底部和边缘糊出一坨高饱和彩带）。
   保持深浅自然收敛的中性柔影与晶莹微高光。 */
${scope('html body[data-bloom-variant][data-bloom-glass="glass"]', ['.dsh-bloom-menu', '.dsh-bloom-trigger'])} {
  box-shadow: inset 0 1px 0 color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff) 82%, transparent), inset 0 0 0 1px color-mix(in oklch, var(--bloom-accent, #6b8f71) 16%, transparent), 0 12px 32px -12px rgba(0,0,0,0.28);
}
${scope('html body[data-bloom-variant][data-bloom-glass="glass"]', ['div[class*="_composer"] div[class*="_card"]::before', 'div[class*="_bubble"]', 'div[class*="_dock"]:has(> [class*="_preview"])'])} {
  box-shadow: inset 0 1px 0 color-mix(in oklch, var(--dsw-alias-bg-layer-2, #fff) 55%, transparent), 0 8px 24px -10px rgba(0,0,0,0.32);
}
${scope('html body[data-bloom-variant][data-bloom-glass="glass"]', ['[class*="_sidebarCol"]'])} {
  box-shadow: inset -1px 0 0 color-mix(in oklch, var(--bloom-hairline, #6b8f71) 30%, transparent), 12px 0 28px -14px rgba(0,0,0,0.25);
}

/* ═══ 1. 降低透明度（macOS 辅助功能「降低透明度」/ Windows「透明效果」关）═══
   只在用户**没有**显式选过档位时降级（body 上没有 data-bloom-glass 属性）——
   用户显式选择优先于系统偏好。选了实底的用户本来就是奔着实底来的，
   系统再说一次也没必要推翻；选了通透的用户是明确要毛玻璃的。
   降级目标是实底，跟宿主在同一天候下的处理一致。 */
@media (prefers-reduced-transparency: reduce) {
${solidSurfaces('html body[data-bloom-variant]:not([data-bloom-glass])')}
}

/* ═══ 2. 增强对比度（macOS「增加对比度」）═══════════════════════════════
   同样去掉透明；再把氛围渐变撤掉、发丝描边加深、焦点环加粗。 */
@media (prefers-contrast: more) {
${solidSurfaces('html body[data-bloom-variant]:is([data-bloom-glass], :not([data-bloom-glass]))')}
  html body[data-bloom-variant] {
    --bloom-hairline: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 45%, transparent) !important;
    --bloom-hairline-strong: color-mix(in oklch, var(--dsw-alias-label-primary, #222) 65%, transparent) !important;
    background-image: none !important;
  }
  html ${DECOR.join(',\n  html ')} { display: none !important; }
  html :focus-visible { outline-width: 3px !important; }
}

/* ═══ 3. 强制颜色（Windows 高对比主题）═══════════════════════════════════
   浏览器会强制替换颜色，但渐变、模糊、光斑照样画 —— 撤掉。
   自绘的开关、选中态改用系统色关键字，才能在高对比下读出「开/关」「选中」。
   配色色点是**信息**（告诉你这套是什么颜色），保留原色。 */
@media (forced-colors: active) {
${scope('html body[data-bloom-variant]', [...GLASS_RULES, ...GLASS_PSEUDO])} {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }
  html body[data-bloom-variant] { background-image: none !important; }
  html ${DECOR.join(',\n  html ')} { display: none !important; }
  html body[data-bloom-typing="true"] div[class*="_composer"] div[class*="_card"]::after { display: none !important; }
  .dsh-bloom-option[data-active="true"] { outline: 2px solid Highlight; outline-offset: -2px; }
  .dsh-bloom-check { color: Highlight; }
  .dsh-bloom-appearance__btn[data-active="true"] { outline: 2px solid Highlight; outline-offset: -2px; }
  .dsh-bloom-telemetry__box-ui {
    forced-color-adjust: none;
    background: Canvas;
    border: 1px solid ButtonText;
  }
  .dsh-bloom-telemetry__box-ui::after { forced-color-adjust: none; background: ButtonText; }
  .dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui { background: Highlight; border-color: Highlight; }
  .dsh-bloom-telemetry__box:checked + .dsh-bloom-telemetry__box-ui::after { background: HighlightText; }
  .dsh-bloom-dot { forced-color-adjust: none; }
  html :focus-visible { outline-color: Highlight !important; }
}

/* ═══ 4. 鼠标操作不显示焦点环（对齐宿主 ui-theme）═══════════════════════
   宿主在 html 上标 data-input-modality=pointer，并在这时把焦点环设成透明。
   Bloom 的全局 :focus-visible 带 !important，原来把宿主这条盖掉了。

   做法跟宿主一致，但改用**变量**：宿主是
       html[data-input-modality=pointer] body :focus-visible:not(:read-write) {
         --dsw-focus-ring-color: transparent; outline-color: #0000;
       }
   我们若直接写死 outline-color，会盖掉宿主的主题色焦点环；改成只把
   --dsw-focus-ring-color 置为 transparent，让 outline-color 走宿主变量 ——
   键盘操作时宿主换主题色，我们跟着换。
   输入框（:read-write）不在 :not() 里：在打字的地方焦点永远要看得见。 */
html[data-input-modality="pointer"] body :focus-visible:not(:read-write) {
  --dsw-focus-ring-color: transparent !important;
}

/* ═══ 5. 触屏（对齐宿主：可点行至少 44px）═══════════════════════════════ */
@media (pointer: coarse) {
  .dsh-bloom-option,
  .dsh-bloom-appearance__btn,
  .dsh-bloom-dsh-btn,
  .dsh-bloom-foot__link,
  .dsh-bloom-rotation__select { min-height: 44px; }
}

/* ═══ 6. 原生控件与滚动条跟配色 ═══════════════════════════════════════
   宿主的复选框、单选、进度条认 accent-color；滚动条认 --dsh-scrollbar-*。
   不设的话它们停在宿主品牌蓝，跟莫兰迪配色打架。 */
body[data-bloom-variant] {
  accent-color: var(--bloom-accent);
  --dsh-scrollbar-thumb: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 70%);
  --dsh-scrollbar-thumb-hover: color-mix(in oklch, var(--bloom-accent, #6b8f71), transparent 45%);
}

/* ═══ 7. 菜单滚到底不带动外层（对齐宿主滚动面板）═══════════════════════ */
.dsh-bloom-menu { overscroll-behavior: contain; }

/* ═══ 8. 打印（对齐宿主：打印时撤掉装饰层）══════════════════════════════
   宿主在 print 下撤自己的装饰；Bloom 的氛围渐变、毛玻璃、侧栏光带
   打印出来是整页色块 —— 费墨还盖字。打印只要内容。 */
@media print {
  html body[data-bloom-variant] { background: none !important; background-image: none !important; }
  html ${DECOR.join(',\n  html ')} { display: none !important; }
  ${scope('html body[data-bloom-variant]', [...GLASS_RULES, ...GLASS_PSEUDO])} {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }
  html .dsh-bloom-trigger,
  html .dsh-bloom-menu { display: none !important; }
}
`
