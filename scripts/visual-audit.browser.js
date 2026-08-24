/**
 * 视觉审计 —— 在真实 DSH 页面里跑的浏览器端脚本。
 *
 * 为什么需要它：`npm run check` 是纯 node 的，算不了 `color-mix()` / `oklch()` 的
 * 最终 sRGB 值，也看不到「半透明面板叠在氛围渐变上之后」的实际对比度。
 * 这类问题只有 CSS 引擎能回答，所以必须在浏览器里跑。
 *
 * 它检查三件事（都是本项目真实出过血的地方，见 DEV_NOTES 2026-08-24）：
 *
 *   1. 文字对比度 —— 沿祖先链把半透明背景逐层叠加求有效底色，再算 WCAG。
 *      修过的坑：亮色 label-tertiary 3.46:1、暗色 label-dimmed 8/8 变体不及格、
 *      状态色亮色档 success 2.0:1 / warn 1.7:1。
 *   2. 暗底上的高亮度边框 —— 「前景色 token 当边框用」这个反模式已复发三次
 *      （inline-code / bloom-shadow / border 阶梯），暗色的 tx 是近白，
 *      mix 出来就是一圈白框。
 *   3. 未被主题接管的 DSH 静态色 —— static 层绕过 alias 层，主题的
 *      --dsw-alias-* 改不到它。品牌蓝 #679efe 曾让 8 套配色的 tab 选中色
 *      永远是蓝的；#adb2b8 曾是设置面板那圈刺眼灰白边。
 *
 * ── 用法 ──
 *
 *   ego-browser nodejs <<'EOF'
 *   await useOrCreateTaskSpace('bloom visual audit')
 *   await openOrReuseTab('http://127.0.0.1:3080', { wait: true })
 *   await js(require('fs').readFileSync('scripts/visual-audit.browser.js','utf8'))
 *   cliLog(JSON.stringify(await js('window.__bloomAudit()'), null, 2))
 *   EOF
 *
 * 注意几个实测得来的坑，改这个脚本时别踩回去：
 *   · 颜色**必须**用 canvas 让浏览器自己转 sRGB。getComputedStyle 返回的是
 *     `oklch(...)` 原样字符串，用 rgb 正则去解析会把 oklch(0.96 0.011 118)
 *     读成 rgb(0.96, 0.011, 118)（一个深蓝色），于是所有对比度都算成 ≈1.0。
 *     canvas 对 oklch 的解析已与 CSS 引擎交叉验证一致。
 *   · 切变体/明暗**不要**只改 body 属性来做运行时扫描。DSH 部分组件的背景
 *     不会跟着重算，会量到上一个变体的残留值，产生一批假阳性
 *     （实测「新会话」按钮 1.02:1、切换器名字 1.86:1，真实切换下都不存在）。
 *     属性切换只可用于**纯 token 层**的检查（auditTokens）。
 *   · `outline-color` 要先看 `outline-style !== 'none'`，否则拿到的是不渲染的值。
 *   · 色板类组件（[class*="_swatch"]）的背景就是被展示的颜色本身，属于内容
 *     而非主题样式，已在静态色检查里排除。
 */
;(function () {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 1
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  const cache = new Map()

  /** 任意 CSS 颜色 → sRGB，交给浏览器解析（支持 oklch / color-mix / lab…） */
  function toRgb(c) {
    if (!c || c === 'none') return null
    if (cache.has(c)) return cache.get(c)
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = 'rgba(0,0,0,0)'
    ctx.fillStyle = c
    ctx.fillRect(0, 0, 1, 1)
    const d = ctx.getImageData(0, 0, 1, 1).data
    const v = { r: d[0], g: d[1], b: d[2], a: +(d[3] / 255).toFixed(3) }
    cache.set(c, v)
    return v
  }

  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  const L = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
  const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 })
  const ratio = (a, b) => { const l1 = L(a), l2 = L(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) }

  /** 有效背景：收集祖先链上的背景层，从最底层往上依次叠加 */
  function effBg(el) {
    const stack = []
    let e = el
    while (e) {
      const c = toRgb(getComputedStyle(e).backgroundColor)
      if (c && c.a > 0.01) { stack.push(c); if (c.a >= 0.999) break }
      e = e.parentElement
    }
    const dark = document.body.hasAttribute('data-ds-dark-theme')
    let base = dark ? { r: 14, g: 15, b: 13, a: 1 } : { r: 250, g: 250, b: 248, a: 1 }
    for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base)
    return base
  }

  /** DSH static 层里那些绕过 alias 层、主题改不到的具体色值 */
  const STATIC_COLORS = {
    '103,158,254': '--dsw-static-deepseek-400 品牌蓝',
    '77,107,254': 'deepseek 品牌蓝(深)',
    '173,178,184': '--dsw-static-neutral-bluish-400',
    '153,200,255': '浏览器默认 focus ring',
    '236,19,19': 'DSH 原生错误红 #ec1313',
  }

  /** 运行时审计：扫当前渲染出来的整棵 DOM */
  function auditRendered() {
    const dark = document.body.hasAttribute('data-ds-dark-theme')
    const lowContrast = [], brightBorder = [], staticColor = []
    const seen = new Set()

    for (const el of document.querySelectorAll('*')) {
      const rect = el.getBoundingClientRect()
      if (rect.width < 6 || rect.height < 6) continue
      const s = getComputedStyle(el)
      if (s.visibility === 'hidden' || +s.opacity === 0) continue
      const cls = (String(el.className) || el.tagName).slice(0, 34)
      const ours = /dsh-bloom/.test(cls)

      // ① 文字对比度（只看直接含文本节点的元素，避免把容器算两遍）
      const txt = [...el.childNodes]
        .filter((n) => n.nodeType === 3 && n.textContent.trim())
        .map((n) => n.textContent.trim()).join('')
      if (txt.length >= 2) {
        const fg = toRgb(s.color)
        if (fg) {
          const bg = effBg(el)
          const cr = ratio(over(fg, bg), bg)
          const size = parseFloat(s.fontSize)
          const bold = parseInt(s.fontWeight) >= 700
          const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5
          if (cr < need) {
            const k = cls + '|t|' + s.color
            if (!seen.has(k)) {
              seen.add(k)
              lowContrast.push({ el: cls, text: txt.slice(0, 16), color: s.color, ratio: +cr.toFixed(2), need, size, ours })
            }
          }
        }
      }

      // ② 暗底上的高亮度边框 / outline
      if (dark) {
        for (const side of ['Top', 'Bottom', 'Left', 'Right']) {
          if (s['border' + side + 'Style'] === 'none') continue
          if (parseFloat(s['border' + side + 'Width']) < 0.5) continue
          const c = toRgb(s['border' + side + 'Color'])
          if (!c || c.a <= 0.22) continue
          if (L(over(c, effBg(el.parentElement || document.body))) > 0.5) {
            const k = cls + '|b|' + s['border' + side + 'Color']
            if (!seen.has(k)) { seen.add(k); brightBorder.push({ el: cls, color: s['border' + side + 'Color'], ours }) }
          }
        }
        if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 0.5) {
          const c = toRgb(s.outlineColor)
          if (c && c.a > 0.22 && L(over(c, effBg(el.parentElement || document.body))) > 0.5) {
            const k = cls + '|o|' + s.outlineColor
            if (!seen.has(k)) { seen.add(k); brightBorder.push({ el: cls, prop: 'outline', color: s.outlineColor, ours }) }
          }
        }
      }

      // ③ 未被接管的 DSH 静态色（色板组件除外 —— 那是内容不是样式）
      if (!/_swatch|_colorSystem/.test(cls)) {
        for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'outlineColor', 'fill']) {
          if (prop === 'outlineColor' && s.outlineStyle === 'none') continue
          if (prop === 'borderTopColor' && s.borderTopStyle === 'none') continue
          const c = toRgb(s[prop])
          if (!c || c.a < 0.3) continue
          const key = [c.r, c.g, c.b].join(',')
          if (STATIC_COLORS[key]) {
            const k = cls + '|' + prop + '|' + key
            if (!seen.has(k)) { seen.add(k); staticColor.push({ el: cls, prop, token: STATIC_COLORS[key], ours }) }
          }
        }
      }
    }

    return {
      mode: dark ? 'dark' : 'light',
      variant: document.body.getAttribute('data-bloom-variant'),
      domSize: document.querySelectorAll('*').length,
      lowContrast: lowContrast.sort((a, b) => a.ratio - b.ratio),
      brightBorder,
      staticColor,
    }
  }

  /**
   * Token 层审计：8 变体 × 明暗 = 16 组，检查所有「会被当文字色用」的 token。
   * 这层可以安全地用属性切换（纯 CSS 变量求值，不依赖组件重渲染）。
   */
  function auditTokens() {
    const VARIANTS = ['mist', 'cinnabar', 'petal', 'ripple', 'sage', 'stone', 'lapis', 'amber']
    const TEXT_TOKENS = {
      'state-error-primary': '--dsw-alias-state-error-primary',
      'state-success-primary': '--dsw-alias-state-success-primary',
      'state-warn-primary': '--dsw-alias-state-warn-primary',
      'state-warn-label': '--dsw-alias-state-warn-label',
      accent: '--bloom-accent',
      'label-secondary': '--dsw-alias-label-secondary',
      'label-tertiary': '--dsw-alias-label-tertiary',
      'label-caption': '--dsw-alias-label-caption',
      'label-dimmed': '--dsw-alias-label-dimmed',
    }
    const body = document.body
    const savedVariant = body.getAttribute('data-bloom-variant')
    const savedDark = body.hasAttribute('data-ds-dark-theme')
    const fails = [], rows = []

    for (const v of VARIANTS) {
      for (const dark of [true, false]) {
        body.setAttribute('data-bloom-variant', v)
        dark ? body.setAttribute('data-ds-dark-theme', '') : body.removeAttribute('data-ds-dark-theme')
        const cs = getComputedStyle(body)
        const g = (n) => cs.getPropertyValue(n).trim()
        const bg = toRgb(g('--dsw-alias-bg-base') || g('--dsw-alias-bg-layer-1'))
        const row = { variant: v, mode: dark ? 'dark' : 'light' }

        for (const [name, token] of Object.entries(TEXT_TOKENS)) {
          const cr = +ratio(over(toRgb(g(token)), bg), bg).toFixed(2)
          row[name] = cr
          if (cr < 4.5) fails.push({ variant: v, mode: row.mode, token: name, ratio: cr, need: 4.5 })
        }
        // business 必须已被接管成 accent（曾在 mist 下失效，因为 mist 块留了旧的蓝色定义）
        if (g('--dsw-alias-state-business-primary') !== g('--bloom-accent')) {
          fails.push({ variant: v, mode: row.mode, token: 'state-business-primary 未接管为 accent' })
        }
        // 暗色 border-l4 不得是近白（前景色当边框用的反模式）
        if (dark && L(over(toRgb(g('--dsw-alias-border-l4')), bg)) > 0.5) {
          fails.push({ variant: v, mode: 'dark', token: 'border-l4 过亮（疑似前景色 mix）' })
        }
        // label 四档必须单调递减，否则信息层级塌成一档
        const seq = [row['label-secondary'], row['label-tertiary'], row['label-caption'], row['label-dimmed']]
        if (!(seq[0] > seq[1] && seq[1] > seq[2] && seq[2] > seq[3])) {
          fails.push({ variant: v, mode: row.mode, token: 'label 四档非单调递减', seq })
        }
        rows.push(row)
      }
    }

    body.setAttribute('data-bloom-variant', savedVariant || 'mist')
    savedDark ? body.setAttribute('data-ds-dark-theme', '') : body.removeAttribute('data-ds-dark-theme')

    const minPerToken = {}
    for (const name of Object.keys(TEXT_TOKENS)) minPerToken[name] = Math.min(...rows.map((r) => r[name]))
    return { groups: rows.length, checks: rows.length * Object.keys(TEXT_TOKENS).length, failCount: fails.length, fails, minPerToken }
  }

  /** 自检：扫描器自己必须先算对已知答案，否则它报的 0 问题没有意义 */
  function sanityCheck() {
    const cases = [
      { name: '白字/深底 应≈17', got: +ratio(toRgb('rgb(245,245,245)'), toRgb('rgb(16,16,16)')).toFixed(1), expect: 17.5, tol: 1 },
      { name: '深字/白底 应≈17', got: +ratio(toRgb('rgb(20,20,20)'), toRgb('rgb(250,250,250)')).toFixed(1), expect: 17.7, tol: 1 },
      { name: '灰字/灰底 应≈1.2', got: +ratio(toRgb('rgb(130,130,130)'), toRgb('rgb(120,120,120)')).toFixed(1), expect: 1.2, tol: 0.3 },
      // oklch 必须被正确解析成近白，而不是被当成 rgb(0.96, 0.011, 118)
      { name: 'oklch 近白解析', got: toRgb('oklch(0.96 0.011 118)').r, expect: 241, tol: 4 },
    ]
    const bad = cases.filter((c) => Math.abs(c.got - c.expect) > c.tol)
    return { ok: bad.length === 0, cases, failed: bad }
  }

  window.__bloomAudit = function () {
    const sanity = sanityCheck()
    if (!sanity.ok) return { TRUSTWORTHY: false, sanity, note: '扫描器自检未通过，下面的结果不可信' }
    const tokens = auditTokens()
    const rendered = auditRendered()
    const totalFails = tokens.failCount + rendered.lowContrast.length + rendered.brightBorder.length + rendered.staticColor.length
    return {
      TRUSTWORTHY: true,
      verdict: totalFails === 0 ? 'PASS' : 'FAIL (' + totalFails + ' 项)',
      sanity: 'ok',
      tokenLayer: tokens,
      renderedLayer: rendered,
    }
  }
  window.__bloomAudit.auditTokens = auditTokens
  window.__bloomAudit.auditRendered = auditRendered
})()
