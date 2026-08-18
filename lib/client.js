/**
 * dsh-bloom-theme —— 浏览器半侧。
 *
 * 功能：
 *   1. 注入 Bloom 4 主题色 CSS（mist / cinnabar / petal / ripple），通过
 *      body[data-bloom-variant="..."] 切换；默认 mist。
 *   2. 注入顶栏切换器（4 个圆形色块按钮），点击切换 variant 并写 localStorage
 *      （DSH 第三方主题选择是进程内扩展，README 明确：远程浏览器无持久化，
 *       loopback 用 localStorage 是官方姿态）。
 *
 * 配色映射（来自 typora-Bloom-theme root-*.css，oklch）：
 *   mist    (240 蓝灰)   accent 50%0.08 → 暗 72%0.12
 *   cinnabar( 25 朱砂)   accent 55%0.18 → 暗 72%0.12
 *   petal   (350 花瓣)   accent 64%0.22 → 暗 75%0.18
 *   ripple  (195 涟漪)   accent 62%0.12 → 暗 75%0.12
 *
 * 设计：mist 完整覆盖（主色 + 灰阶 + 状态 + markdown）；
 *       其它 3 变体只覆盖 accent + bg/text/surface（继承 mist 的灰阶骨架，
 *       主色和背景调性变，布局/字号/间距不动）——保持视觉一致性 + 一目了然的主色差异。
 */

const VARIANTS = ['mist', 'cinnabar', 'petal', 'ripple']
const STORAGE_KEY = 'dsh-bloom-variant'
const PLUGIN_ID = '@webkubor/dsh-bloom-theme'

// Bloom oklch 色板（每个变体的核心调性）
const PALETTE = {
  // [亮色 accent, 暗色 accent, 亮色 bg, 暗色 bg, 亮色 text, 暗色 text, 亮色 surface, 暗色 surface, 亮色 surface-2, 暗色 surface-2]
  mist:     ['oklch(50% 0.08 240)', 'oklch(72% 0.12 240)', 'oklch(96% 0.01 240)', 'oklch(28% 0.02 240)', 'oklch(25% 0.02 240)', 'oklch(96% 0.01 240)', 'oklch(94% 0.01 240)', 'oklch(34% 0.02 240)', 'oklch(91% 0.01 240)', 'oklch(40% 0.02 240)'],
  cinnabar: ['oklch(55% 0.18 25)',  'oklch(72% 0.12 25)',  'oklch(97% 0.005 25)', 'oklch(28% 0.02 25)',  'oklch(25% 0.02 25)',  'oklch(96% 0.01 25)',  'oklch(95% 0.005 25)', 'oklch(34% 0.02 25)',  'oklch(92% 0.005 25)', 'oklch(40% 0.02 25)'],
  petal:    ['oklch(64% 0.22 350)', 'oklch(75% 0.18 350)', 'oklch(98% 0.01 350)', 'oklch(28% 0.02 350)', 'oklch(25% 0.02 354)', 'oklch(98% 0.01 350)', 'oklch(96% 0.015 350)','oklch(34% 0.02 350)', 'oklch(94% 0.015 350)','oklch(40% 0.02 350)'],
  ripple:   ['oklch(62% 0.12 195)', 'oklch(75% 0.12 195)', 'oklch(96% 0.01 195)', 'oklch(20% 0.02 195)', 'oklch(25% 0.02 195)', 'oklch(96% 0.01 195)', 'oklch(94% 0.01 195)', 'oklch(28% 0.02 195)', 'oklch(92% 0.01 195)', 'oklch(38% 0.02 195)'],
}

const VARIANT_LABELS = {
  mist:     { zh: '雾蓝', en: 'Mist' },
  cinnabar: { zh: '朱砂', en: 'Cinnabar' },
  petal:    { zh: '花瓣', en: 'Petal' },
  ripple:   { zh: '涟漪', en: 'Ripple' },
}

/** 生成 4 变体 + 亮/暗的完整 CSS。mist 完整骨架；其余 3 变体只覆盖主色+背景调。 */
function buildBloomCSS() {
  const [aL_m, aD_m, bgL_m, bgD_m, txL_m, txD_m, sfL_m, sfD_m, sf2L_m, sf2D_m] = PALETTE.mist
  const mist = `
/* ─── Bloom · mist 雾蓝（默认 + body[data-bloom-variant=mist]）─────────── */
body, body[data-bloom-variant="mist"] {
  --dsw-alias-bg-base: ${bgL_m};
  --dsw-alias-bg-layer-1: ${bgL_m};
  --dsw-alias-bg-layer-2: ${sfL_m};
  --dsw-alias-bg-layer-3: ${sf2L_m};
  --dsw-alias-bg-overlay: ${sfL_m};
  --dsw-alias-bg-module-platform: ${sfL_m};
  --dsw-alias-bg-multi-select: ${sf2L_m};
  --dsw-alias-bg-skeleton: color-mix(in oklch, ${txL_m}, transparent 96%);
  --dsw-alias-label-primary: ${txL_m};
  --dsw-alias-label-primary-bluish: ${txL_m};
  --dsw-alias-label-primary-dimmed: color-mix(in oklch, ${txL_m}, transparent 25%);
  --dsw-alias-label-secondary: color-mix(in oklch, ${txL_m}, white 35%);
  --dsw-alias-label-tertiary: color-mix(in oklch, ${txL_m}, transparent 45%);
  --dsw-alias-label-caption: color-mix(in oklch, ${txL_m}, transparent 40%);
  --dsw-alias-label-primary-inverted: ${bgL_m};
  --dsw-alias-brand-primary: ${aL_m};
  --dsw-alias-brand-primary-invert: ${bgL_m};
  --dsw-alias-brand-text: ${bgL_m};
  --dsw-alias-border-l1: color-mix(in oklch, ${txL_m}, transparent 90%);
  --dsw-alias-border-l2: color-mix(in oklch, ${txL_m}, transparent 80%);
  --dsw-alias-border-l3: color-mix(in oklch, ${txL_m}, transparent 70%);
  --dsw-alias-border-l4: color-mix(in oklch, ${txL_m}, transparent 60%);
  --dsw-alias-button-primary-fill: ${aL_m};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aL_m}, black 8%);
  --dsw-alias-button-primary-dimmed: color-mix(in oklch, ${aL_m}, transparent 85%);
  --dsw-alias-interactive-bg-hover: color-mix(in oklch, ${aL_m}, transparent 92%);
  --dsw-alias-interactive-bg-hover-accent: color-mix(in oklch, ${aL_m}, transparent 85%);
  --dsw-alias-interactive-bg-active: color-mix(in oklch, ${aL_m}, transparent 88%);
  --dsw-alias-state-success-primary: oklch(70% 0.1 150);
  --dsw-alias-state-error-primary: oklch(60% 0.12 25);
  --dsw-alias-state-warn-primary: oklch(75% 0.1 75);
  --dsw-alias-state-business-primary: oklch(62% 0.1 250);
  --dsw-alias-markdown-inline-code: oklch(30% 0.03 240);
  --dsw-alias-markdown-code-block: ${sfL_m};
  --dsw-alias-markdown-tag: color-mix(in oklch, ${aL_m}, transparent 88%);
  --dsw-alias-markdown-placeholder: color-mix(in oklch, ${txL_m}, transparent 50%);
  --dsw-alias-markdown-citation: color-mix(in oklch, ${txL_m}, transparent 55%);
  --dsw-alias-scrollbar-bg-l1: color-mix(in oklch, ${txL_m}, transparent 90%);
  --dsw-alias-scrollbar-bg-l2: color-mix(in oklch, ${txL_m}, transparent 80%);
  --dsw-alias-toast-bg: oklch(30% 0.02 240);
  --dsw-alias-tooltip-bg: oklch(30% 0.02 240);
}
/* mist 暗色 */
body[data-ds-dark-theme], body[data-ds-dark-theme][data-bloom-variant="mist"] {
  --dsw-alias-bg-base: ${bgD_m};
  --dsw-alias-bg-layer-1: ${bgD_m};
  --dsw-alias-bg-layer-2: ${sfD_m};
  --dsw-alias-bg-layer-3: ${sf2D_m};
  --dsw-alias-bg-overlay: ${sfD_m};
  --dsw-alias-bg-module-platform: ${sfD_m};
  --dsw-alias-bg-multi-select: ${sf2D_m};
  --dsw-alias-label-primary: ${txD_m};
  --dsw-alias-label-secondary: color-mix(in oklch, ${txD_m}, black 65%);
  --dsw-alias-label-tertiary: color-mix(in oklch, ${txD_m}, transparent 30%);
  --dsw-alias-brand-primary: ${aD_m};
  --dsw-alias-brand-primary-invert: ${bgD_m};
  --dsw-alias-border-l1: color-mix(in oklch, ${txD_m}, transparent 88%);
  --dsw-alias-border-l2: color-mix(in oklch, ${txD_m}, transparent 78%);
  --dsw-alias-button-primary-fill: ${aD_m};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aD_m}, white 8%);
  --dsw-alias-state-success-primary: oklch(72% 0.12 150);
  --dsw-alias-state-error-primary: oklch(62% 0.15 25);
  --dsw-alias-markdown-inline-code: oklch(88% 0.02 240);
  --dsw-alias-markdown-code-block: oklch(24% 0.02 240);
  --dsw-alias-toast-bg: oklch(40% 0.02 240);
  --dsw-alias-tooltip-bg: oklch(40% 0.02 240);
}
`
  const other = []
  for (const v of ['cinnabar', 'petal', 'ripple']) {
    const [aL, aD, bgL, bgD, txL, , sfL, sfD, sf2L, sf2D] = PALETTE[v]
    other.push(`
/* ─── Bloom · ${v}（仅覆盖主色 + 背景调，骨架继承 mist）─────────── */
body[data-bloom-variant="${v}"] {
  --dsw-alias-bg-base: ${bgL};
  --dsw-alias-bg-layer-1: ${bgL};
  --dsw-alias-bg-layer-2: ${sfL};
  --dsw-alias-bg-layer-3: ${sf2L};
  --dsw-alias-bg-overlay: ${sfL};
  --dsw-alias-bg-module-platform: ${sfL};
  --dsw-alias-bg-multi-select: ${sf2L};
  --dsw-alias-brand-primary: ${aL};
  --dsw-alias-brand-primary-invert: ${bgL};
  --dsw-alias-button-primary-fill: ${aL};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aL}, black 8%);
  --dsw-alias-button-primary-dimmed: color-mix(in oklch, ${aL}, transparent 85%);
  --dsw-alias-interactive-bg-hover: color-mix(in oklch, ${aL}, transparent 92%);
  --dsw-alias-interactive-bg-hover-accent: color-mix(in oklch, ${aL}, transparent 85%);
  --dsw-alias-interactive-bg-active: color-mix(in oklch, ${aL}, transparent 88%);
  --dsw-alias-markdown-tag: color-mix(in oklch, ${aL}, transparent 88%);
}
body[data-ds-dark-theme][data-bloom-variant="${v}"] {
  --dsw-alias-bg-base: ${bgD};
  --dsw-alias-bg-layer-1: ${bgD};
  --dsw-alias-bg-layer-2: ${sfD};
  --dsw-alias-bg-layer-3: ${sf2D};
  --dsw-alias-bg-overlay: ${sfD};
  --dsw-alias-bg-module-platform: ${sfD};
  --dsw-alias-bg-multi-select: ${sf2D};
  --dsw-alias-brand-primary: ${aD};
  --dsw-alias-brand-primary-invert: ${bgD};
  --dsw-alias-button-primary-fill: ${aD};
  --dsw-alias-button-primary-hover: color-mix(in oklch, ${aD}, white 8%);
  --dsw-alias-markdown-tag: color-mix(in oklch, ${aD}, transparent 85%);
}
`)
  }
  return mist + other.join('\n')
}

/** 顶栏切换器：4 个圆形色块按钮 + 当前选中高亮。浮动右上角。 */
function buildSwitcherHTML(currentVariant) {
  const buttons = VARIANTS.map((v) => {
    const p = PALETTE[v]
    const label = VARIANT_LABELS[v].zh
    const active = v === currentVariant ? ' data-active="true"' : ''
    return `<button type="button" class="dsh-bloom-swatch" data-variant="${v}"${active} aria-label="${label}" title="${label}" style="background:linear-gradient(135deg, ${p[0]} 0%, ${p[2]} 100%)"></button>`
  }).join('')
  return `<div class="dsh-bloom-switcher" data-plugin="${PLUGIN_ID}">
  <span class="dsh-bloom-switcher__label">Bloom · ${VARIANT_LABELS[currentVariant].zh}</span>
  <div class="dsh-bloom-switcher__row">${buttons}</div>
</div>`
}

const SWITCHER_CSS = `
.dsh-bloom-switcher {
  position: fixed;
  top: 12px;
  right: 16px;
  z-index: 9999;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.92));
  border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,0.08));
  border-radius: 999px;
  font: 12px/1.2 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: var(--dsw-alias-label-secondary, #555);
  box-shadow: 0 2px 12px color-mix(in oklch, currentColor, transparent 92%);
  user-select: none;
  cursor: default;
}
.dsh-bloom-switcher__label { font-weight: 500; color: var(--dsw-alias-label-primary, #222); }
.dsdsh-bloom-switcher__row { display: inline-flex; gap: 6px; }
.dsh-bloom-switcher__row { display: inline-flex; gap: 6px; }
.dsh-bloom-switcher .dsh-bloom-swatch {
  width: 22px; height: 22px; border-radius: 999px; border: 2px solid var(--dsw-alias-bg-layer-1, #fff);
  cursor: pointer; padding: 0; outline: none; transition: transform 0.15s, box-shadow 0.15s;
}
.dsh-bloom-switcher .dsh-bloom-swatch:hover { transform: scale(1.15); }
.dsh-bloom-switcher .dsh-bloom-swatch[data-active="true"] {
  box-shadow: 0 0 0 2px var(--dsw-alias-brand-primary, #4a90e2);
  transform: scale(1.1);
}
`

function applyVariant(variant) {
  if (!VARIANTS.includes(variant)) variant = 'mist'
  document.body.dataset.bloomVariant = variant
  try { window.localStorage.setItem(STORAGE_KEY, variant) } catch {}
  const root = document.querySelector('.dsh-bloom-switcher')
  if (root) {
    root.querySelectorAll('.dsh-bloom-swatch').forEach((el) => {
      el.setAttribute('data-active', el.dataset.variant === variant ? 'true' : 'false')
    })
    const label = root.querySelector('.dsh-bloom-switcher__label')
    if (label) label.textContent = 'Bloom · ' + VARIANT_LABELS[variant].zh
  }
}

function readVariant() {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    return VARIANTS.includes(v) ? v : 'mist'
  } catch { return 'mist' }
}

function injectCSS(css, idSuffix) {
  const tagId = PLUGIN_ID + '/' + idSuffix
  if (document.querySelector('style[data-plugin-css="' + tagId + '"]')) return
  const tag = document.createElement('style')
  tag.dataset.plugin = PLUGIN_ID
  tag.dataset.pluginCss = tagId
  tag.textContent = css
  document.head.appendChild(tag)
}

function injectSwitcher(initialVariant) {
  if (document.querySelector('.dsh-bloom-switcher')) return
  injectCSS(SWITCHER_CSS, 'switcher.css')
  const wrapper = document.createElement('div')
  wrapper.innerHTML = buildSwitcherHTML(initialVariant)
  const el = wrapper.firstElementChild
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.dsh-bloom-swatch')
    if (!btn) return
    applyVariant(btn.dataset.variant)
  })
  document.body.appendChild(el)
}

window.__ModuleLoader__.load({
  id: PLUGIN_ID + '/client',
  factory: (require) => {
    if (typeof document === 'undefined') return {}
    const variant = readVariant()
    injectCSS(buildBloomCSS(), 'bloom.css')
    const boot = () => {
      document.body.dataset.bloomVariant = variant
      injectSwitcher(variant)
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot)
    } else {
      boot()
    }
    return {}
  },
})