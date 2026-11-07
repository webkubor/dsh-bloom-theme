/**
 * 顶栏配色切换器 —— 主题唯一的交互控件。
 *
 * 由官方 conversation.header.leading Slot 持有，不查找或改写宿主顶栏。
 * 键盘可完整操作（role=radiogroup + aria-checked + 方向键），窄屏隐藏中文名。
 */
import { FEATURED_VARIANTS, isNewVariant, PALETTE, VARIANTS } from './palette.js'
import { readRotationMinutes, resetRotationTimer, ROTATION_MINUTES, setRotationMinutes, startRotation } from './rotation.js'
import { injectCSS, readVariant } from './dom.js'
import { PLUGIN_ID, PLUGIN_VERSION, STORAGE_KEY } from './meta.js'
import { checkUpdate, refreshUpdateBadge, renderDshUpdate, checkDshLatest } from './version.js'
import { SWITCHER_CSS } from './css/switcher.js'
import { currentIsDark, readStoredMode, setMode, type AppearanceMode } from './appearance.js'
import {
  readGlassMode,
  writeGlassMode,
  effectiveGlassMode,
  type GlassMode,
} from './glass.js'
import { AMBIENCE_PRESETS, readAmbience, writeAmbience, type Scheme } from './ambience.js'
import { readMeteorColorMode, writeMeteorColorMode } from './starlight.js'
import { tr, variantName, variantPoem, getLang, LANG_CHANGE_EVENT } from './lang.js'
import { copyDiagnostics, formatDiagnosticsMarkdown } from './diagnostics.js'
import { buildFeedbackUrl } from './feedback.js'
import { createShareCapture } from './share-capture.js'
import { track, telemetryEnabled, setTelemetryEnabled, type PanelEvent } from './track.js'

/* 「本版更新」内容在构建时由 scripts/bundle.mjs 注入（CHANGELOG.md 里当前版本那一节）；
   tsc 单独编译时该常量不存在，走兜底分支。 */
declare const __BLOOM_CHANGELOG__: { version: string; items: { kind: string; text: string }[] } | undefined
const CHANGELOG = typeof __BLOOM_CHANGELOG__ !== 'undefined' ? __BLOOM_CHANGELOG__ : { version: PLUGIN_VERSION, items: [] }

function escapeHTML(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

/** 「本版更新」：最多 8 条，新功能 / 修复各一个小标签 */
function changelogHTML(): string {
  const tag = (k: string) => k === 'feat' ? tr('新') : k === 'fix' ? tr('修') : tr('优')
  // CHANGELOG 只有中文：非中文界面不展示条目，只留「完整日志」链接，免得英文界面冒出一段中文
  const list = CHANGELOG.items.length && getLang() === 'zh'
    ? `<ul class="dsh-bloom-log__list">${CHANGELOG.items.map((it, i) =>
        `<li class="dsh-bloom-log__item" style="--i:${i}"><span class="dsh-bloom-log__tag" data-kind="${it.kind}">${tag(it.kind)}</span><span>${escapeHTML(it.text)}</span></li>`).join('')}</ul>`
    : ''
  return `<div class="dsh-bloom-log">
        <div class="dsh-bloom-log__head">
          <span class="dsh-bloom-log__title">${tr('本版更新')} · v${CHANGELOG.version}</span>
          <a class="dsh-bloom-log__all" data-track="changelog" href="https://github.com/webkubor/dsh-bloom-theme/releases" target="_blank" rel="noopener">${tr('完整日志')} ›</a>
        </div>
        ${list}
      </div>`
}

/** 变体色点：莫兰迪 → 可读色的双轨渐变，两端都有色（渐变到背景色会褪成白） */
export const poemStyle = (v: string) =>
  `--bloom-poem-a:rgb(${PALETTE[v].morandi});--bloom-poem-b:${PALETTE[v].accentL};--bloom-poem-bd:${PALETTE[v].accentD}`

export const dotStyle = (v) =>
  `background:linear-gradient(135deg, rgb(${PALETTE[v].morandi}) 0%, ${PALETTE[v].accentL} 100%)`

/** 诗句渐变：和色点同一对颜色，深浅两套各给一个变量，由 CSS 按 body 的深色标记挑。 */

/**
 * 顶栏切换器：下拉式（收起只占一个按钮宽度）。
 *
 * 为什么是下拉而不是 4 个并排色块：并排要 186px 宽，固定在右上角会**完全盖住**
 * DSH 自己的 Session log 按钮（实测两者矩形几乎重合，按钮点不到）——那是功能性 bug，
 * 不是观感问题。收成一个按钮后再挂进 header 工具区，就跟原生控件并排共存。
 *
 * v0.5.0：移除「氛围」区（壁纸 / 主题包已删），只留 4 个变体切换。
 *         玻璃为主视觉、默认常开，见 GLASS_CSS。
 */
export function applyVariant(variant) {
  if (!VARIANTS.includes(variant)) variant = 'mist'
  // 应用变体本身的所有副作用（写 body 属性 / 同步下拉胶囊 / 写 localStorage）。
  // 拆出来单独跑，让 View Transition 在它前后各捕一帧：CSS 变量整体替换的
  // 「瞬切」变成整页 cross-fade，让颜色"流过去"。动画时长 / 缓动由
  // css/component.ts 的 ::view-transition-* 控制（320ms）。
  const apply = () => {
    document.body.dataset.bloomVariant = variant
    try { window.localStorage.setItem(STORAGE_KEY, variant) } catch {}
    resetRotationTimer()
    const root = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
    if (!root) return
    root.querySelectorAll<HTMLElement>('.dsh-bloom-option').forEach((el) => {
      const on = el.dataset.variant === variant
      el.setAttribute('data-active', String(on))
      el.setAttribute('aria-selected', String(on))
    })
    const name = root.querySelector<HTMLElement>('.dsh-bloom-trigger__name')
    if (name) name.textContent = variantName(variant)
    const dot = root.querySelector<HTMLElement>('.dsh-bloom-trigger .dsh-bloom-dot')
    if (dot) dot.setAttribute('style', dotStyle(variant))
    // 面板头部也有一份「当前配色」胶囊，不同步就会和列表里的对勾对不上
    const headName = root.querySelector<HTMLElement>('[data-head-name]')
    if (headName) headName.textContent = variantName(variant)
    const headDot = root.querySelector<HTMLElement>('.dsh-bloom-head__current .dsh-bloom-dot')
    if (headDot) headDot.setAttribute('style', dotStyle(variant))
  }
  // View Transitions API（Chrome 111+/Edge/Safari TP）。
  // 不支持时降级为瞬时应用 —— 行为与改前一致，老浏览器照常工作。
  // prefers-reduced-motion 由 css 媒体查询把动画时长清零，不是 JS 拦截。
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(apply)
  } else {
    apply()
  }
}

/* 底栏图标：emoji 各家字体形状/基线都不一样，三个挤一排像贴纸（owner 2026-09-15
   「图片位置优化下」）。换成同一套描边 SVG —— 1.4 线宽、13px、currentColor，
   跟面板里的 chevron 同一种语言，颜色也跟着 hover 一起变。 */
const icon = (body: string) =>
  `<svg class="dsh-bloom-foot__icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
const ICON_STAR = icon('<path d="m7 1.3 1.7 3.5 3.8.6-2.8 2.7.7 3.9L7 10.2l-3.4 1.8.7-3.9L1.5 5.4l3.8-.6z"/>')
const ICON_CHAT = icon('<path d="M12.1 8.1a1.8 1.8 0 0 1-1.8 1.8H5.6L2.9 12.1V3.7a1.8 1.8 0 0 1 1.8-1.8h5.6a1.8 1.8 0 0 1 1.8 1.8z"/>')
const ICON_DIAGNOSE = icon('<rect x="2.8" y="2.5" width="8.4" height="9.5" rx="1.6"/><path d="M5 2.5V1.5a.8.8 0 0 1 .8-.8h1.6a.8.8 0 0 1 .8.8v1M5 6h4M5 8.5h2.5"/>')
const ICON_SHARE = icon('<circle cx="10.5" cy="3.3" r="1.6"/><circle cx="3.5" cy="7" r="1.6"/><circle cx="10.5" cy="10.7" r="1.6"/><path d="M4.9 6.2l4.2-2.2M4.9 7.8l4.2 2.2"/>')

/* [LES-33] */
const buildShareText = () => [
  tr('我在用 Bloom：诗意配色与玻璃质感，欢迎试试，也欢迎到仓库点个 Star。'),
  '',
  tr('请帮我安装并启用 DeepSeek Harness 的 Bloom 主题（dsh-bloom-theme）。'),
  tr('请先使用官方 plugin_manager 的 list_bundles 查询，再用 install_bundle 安装 dsh-bloom-theme，并按返回的 application / nextStep 完成和验证。'),
  tr('如果使用自建 CLI profile，请先确认 profile 名称，再运行：'),
  'dsh plugin --profile <profile> add dsh-bloom-theme',
  tr('仓库：https://github.com/webkubor/dsh-bloom-theme'),
].join('\n')

/** 复制分享文案；就地把按钮文字换成「已复制」给反馈（视线在按钮上，改别处等于没反馈）。 */
async function shareInstall(btn: HTMLElement, schedule: (fn: () => void, delay: number) => void) {
  // 只改文字那个 span —— 直接写 btn.textContent 会把 svg 图标一起擦掉。
  const SHARE_TEXT = buildShareText()
  const slot = btn.querySelector('span') ?? btn
  const label = slot.textContent
  let ok = false
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(SHARE_TEXT); ok = true }
  } catch {}
  if (!ok) {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const ta = document.createElement('textarea')
    ta.value = SHARE_TEXT; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    try { ok = document.execCommand('copy') } catch {}
    ta.remove()
    if (previous?.isConnected) previous.focus({ preventScroll: true })
  }
  slot.textContent = ok ? tr('已复制') : tr('复制失败')
  schedule(() => { if (slot.isConnected) slot.textContent = label }, 1600)
  return ok
}

const AMBIENCE_LABELS: Record<string, string> = {
  diagonal: '对角漫染', galaxy: '漫天星辰', corner: '角落微光',
  stream: '斜光流转', wash: '水彩晕染', clear: '清透留白', off: '不显示',
}

/** One segmented row per scheme; CSS shows the row matching the host scheme. */
function ambienceRows(): string {
  return (Object.keys(AMBIENCE_PRESETS) as Scheme[]).map((scheme) => {
    const current = readAmbience(scheme)
    const buttons = AMBIENCE_PRESETS[scheme].map((preset) =>
      `<button type="button" class="dsh-bloom-ambience__btn" data-preset="${preset}" role="radio" aria-checked="${preset === current}" data-active="${preset === current}">${tr(AMBIENCE_LABELS[preset])}</button>`).join('')
    const hint = scheme === 'dark' ? tr('深色背景') : tr('浅色背景')
    return `<div class="dsh-bloom-ambience" data-scheme="${scheme}" role="radiogroup" aria-label="${hint}">${buttons}</div>`
  }).join('')
}

let switcherSerial = 0
export function buildSwitcherHTML(currentVariant) {
  const sharePanelId = `dsh-bloom-share-${++switcherSerial}`
  // Hidden-from-menu legacy colors remain valid in storage; show the active legacy
  // choice until its owner deliberately selects a featured replacement.
  const shown = FEATURED_VARIANTS.includes(currentVariant)
    ? FEATURED_VARIANTS : [currentVariant, ...FEATURED_VARIANTS]
  const rotationOptions = ROTATION_MINUTES.map((m) =>
    `<option value="${m}"${readRotationMinutes() === m ? ' selected' : ''}>${m ? tr('{0} 分钟', m) : tr('关闭自动换色')}</option>`).join('')
  const options = shown.map((v) => {
    const on = v === currentVariant
    return `<button type="button" class="dsh-bloom-option" role="option" data-variant="${v}"` +
      ` aria-selected="${on}" data-active="${on}" title="${variantName(v)} · ${variantPoem(v)}">` +
      `<span class="dsh-bloom-dot" style="${dotStyle(v)}"></span>` +
      `<span class="dsh-bloom-option__name">${variantName(v)}${isNewVariant(v, PLUGIN_VERSION) ? `<span class="dsh-bloom-option__new">${tr('新')}</span>` : ''}</span>` +
      // 诗句紧跟名字、左对齐成一列（2026-11-06）：原来点线引导 + 诗句逐行染本色，
      // 十二行十二种颜色加一排虚点，整列又花又散。颜色身份只交给左边色点。
      `<span class="dsh-bloom-option__en" lang="${getLang()}" style="${poemStyle(v)}">${variantPoem(v)}</span>` +
      `<span class="dsh-bloom-check" aria-hidden="true">✓</span></button>`
  }).join('')
  return `<div class="dsh-bloom-switcher" data-plugin="${PLUGIN_ID}">
  <button type="button" class="dsh-bloom-trigger" aria-haspopup="dialog" aria-expanded="false" title="${tr('Bloom 主题 · v{0}', PLUGIN_VERSION)}">
    <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
    <span class="dsh-bloom-trigger__name">${variantName(currentVariant)}</span>
    <svg class="dsh-bloom-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="dsh-bloom-menu" lang="${getLang()}" role="dialog" aria-label="${tr('Bloom 外观设置')}" hidden>
    <div class="dsh-bloom-head">
      <span class="dsh-bloom-head__title">${tr('外观')}</span>
      <span class="dsh-bloom-head__current">
        <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
        <span data-head-name>${variantName(currentVariant)}</span>
      </span>
      <button type="button" class="dsh-bloom-close" aria-label="${tr('关闭')}">✕</button>
    </div>
    <div class="dsh-bloom-section">${tr('主题')}</div>
    <div class="dsh-bloom-options" role="listbox" aria-label="${tr('配色')}">${options}</div>
    <div class="dsh-bloom-section" data-mode-section hidden>${tr('模式')}</div>
    <div class="dsh-bloom-appearance" role="group" aria-label="${tr('深浅模式')}" hidden>
      <div class="dsh-bloom-appearance__seg">
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="light">${tr('浅色')}</button>
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="dark">${tr('深色')}</button>
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="system">${tr('跟随系统')}</button>
      </div>
    </div>
    <div class="dsh-bloom-section">${tr('质感')}</div>
    <div class="dsh-bloom-glass" role="group" aria-label="${tr('质感')}">
      <div class="dsh-bloom-glass__choices">
        <button type="button" class="dsh-bloom-glass__choice" data-glass="frosted">${tr('毛玻璃')}</button>
        <button type="button" class="dsh-bloom-glass__choice" data-glass="matte">${tr('磨砂玻璃')}</button>
        <button type="button" class="dsh-bloom-glass__choice" data-glass="liquid">${tr('液态玻璃')}</button>
      </div>
      <p class="dsh-bloom-glass__hint" data-glass-hint hidden></p>
    </div>
    <div class="dsh-bloom-section">${tr('背景')}</div>
    ${ambienceRows()}
    <div class="dsh-bloom-meteor-color" role="radiogroup" aria-label="${tr('流星颜色')}">
      <span>${tr('流星颜色')}</span>
      ${(['solid', 'colorful'] as const).map(mode => `<button type="button" data-meteor-color="${mode}" role="radio" aria-checked="${readMeteorColorMode() === mode}" data-active="${readMeteorColorMode() === mode}">${tr(mode === 'solid' ? '纯色' : '彩色')}</button>`).join('')}
    </div>
    <label class="dsh-bloom-rotation">${tr('自动换色')}
      <select class="dsh-bloom-rotation__select" aria-label="${tr('自动换色')}">
        ${rotationOptions}
      </select>
    </label>
    <div class="dsh-bloom-more-body" hidden data-open="false" data-instant="true">
      <div class="dsh-bloom-more-inner">
      ${changelogHTML()}
      <div class="dsh-bloom-version" role="separator">
        <span class="dsh-bloom-version__update" hidden></span>
      </div>
      <div class="dsh-bloom-dsh-update" role="separator">
        <div class="dsh-bloom-dsh-row">
          <span class="dsh-bloom-dsh-label">DSH</span>
          <span class="dsh-bloom-dsh-ver" data-dsh-current>—</span>
          <span class="dsh-bloom-dsh-platform" data-dsh-platform hidden></span>
          <span class="dsh-bloom-dsh-state" data-dsh-state></span>
          <span class="dsh-bloom-dsh-spacer"></span>
          <button type="button" class="dsh-bloom-dsh-btn" data-act="refresh" title="${tr('重新检查 DSH 最新版')}">↻</button>
          <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-dsh-btn--primary" data-act="copy" title="${tr('检查到可用版本后，把升级命令直接填进下方输入框')}">${tr('填入')}</button>
        </div>
        <div class="dsh-bloom-dsh-row dsh-bloom-dsh-row--latest">
          <span class="dsh-bloom-dsh-label">${tr('最新')}</span>
          <span class="dsh-bloom-dsh-ver" data-dsh-latest>${tr('检查中…')}</span>
        </div>
        <div class="dsh-bloom-dsh-hint" data-dsh-hint hidden></div>
        <div class="dsh-bloom-dsh-row">
          <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-diagnose" title="${tr('复制排错诊断信息（在 GitHub 提交 Issue 时粘贴）')}">${ICON_DIAGNOSE}<span>${tr('复制诊断')}</span></button>
          <a class="dsh-bloom-foot__link" data-track="vote" href="https://github.com/webkubor/dsh-bloom-theme/discussions/26" target="_blank" rel="noopener noreferrer">${tr('配色投票')}</a>
        </div>
        <label class="dsh-bloom-telemetry" title="${tr('只上报按钮点击的事件名和版本，不含对话内容')}">
          <input type="checkbox" class="dsh-bloom-telemetry__box" data-telemetry${telemetryEnabled() ? ' checked' : ''}>
          <span class="dsh-bloom-telemetry__box-ui" aria-hidden="true"></span>
          <span class="dsh-bloom-telemetry__text">${tr('发送匿名使用统计')}</span>
        </label>
      </div>
      </div>
    </div>
    <div class="dsh-bloom-foot">
      <button type="button" class="dsh-bloom-more" aria-expanded="false" title="${tr('版本与更新')}">
        <span class="dsh-bloom-more__name">Bloom</span><span class="dsh-bloom-more__ver">v${PLUGIN_VERSION}</span>
        <svg class="dsh-bloom-more__arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M4 2l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="dsh-bloom-foot__links">
        <a class="dsh-bloom-foot__link dsh-bloom-feedback" data-track="feedback" href="https://github.com/webkubor/dsh-bloom-theme/issues/new" target="_blank" rel="noopener noreferrer" title="${tr('填写反馈，自动附上基础诊断')}">${ICON_CHAT}<span>${tr('反馈')}</span></a>
        <a class="dsh-bloom-foot__link dsh-bloom-star" href="https://github.com/webkubor/dsh-bloom-theme" target="_blank" rel="noopener noreferrer" title="${tr('喜欢 Bloom？欢迎去 GitHub 点个 Star')}">${ICON_STAR}<span>${tr('点个星')}</span></a>
        <span class="dsh-bloom-share-wrap">
          <button type="button" class="dsh-bloom-foot__link dsh-bloom-share" aria-expanded="false" aria-controls="${sharePanelId}">${ICON_SHARE}<span>${tr('分享')}</span></button>
          <span id="${sharePanelId}" class="dsh-bloom-share-panel" role="group" aria-label="${tr('分享 Bloom')}" hidden>
            <span class="dsh-bloom-share-intro">${tr('喜欢 Bloom？欢迎分享，也欢迎到仓库点个 Star。')}</span>
            <button type="button" class="dsh-bloom-share-action dsh-bloom-share-install"><span class="dsh-bloom-share-action__title">${tr('复制安装提示词')}</span><span class="dsh-bloom-share-action__hint">${tr('发给 Agent，帮你安装')}</span></button>
            <button type="button" class="dsh-bloom-share-action" data-share-capture="screenshot"><span class="dsh-bloom-share-action__title">${tr('截图分享')}</span><span class="dsh-bloom-share-action__hint">${tr('选择要展示的屏幕、窗口或标签页')}</span></button>
            <button type="button" class="dsh-bloom-share-action" data-share-capture="record"><span class="dsh-bloom-share-action__title">${tr('录制 5 秒')}</span><span class="dsh-bloom-share-action__hint">${tr('记录动态界面，不录制声音')}</span></button>
            <textarea class="dsh-bloom-share-manual" aria-label="${tr('安装提示词')}" readonly hidden></textarea>
            <span class="dsh-bloom-share-status" role="status" aria-live="polite"></span>
            <button type="button" class="dsh-bloom-share-cancel" hidden>${tr('取消')}</button>
            <span class="dsh-bloom-share-result" hidden><button type="button" class="dsh-bloom-share-system" hidden>${tr('分享文件')}</button><a class="dsh-bloom-share-save" download>${tr('保存文件')}</a></span>
          </span>
        </span>
      </span>
    </div>
  </div>
</div>`
}

const closeShareSessions = new WeakMap<HTMLElement, () => void>()
export function closeMenu(root: HTMLElement) {
  closeShareSessions.get(root)?.()
  const menu = root.querySelector<HTMLElement>('.dsh-bloom-menu')
  const trigger = root.querySelector<HTMLElement>('.dsh-bloom-trigger')
  if (menu) {
    menu.hidden = true
    menu.classList.remove('is-entering')
  }
  if (trigger) trigger.setAttribute('aria-expanded', 'false')
}

/**
 * 播放入场动画 —— 必须可重播。
 *
 * 只靠 CSS 的 `.is-entering { animation }` 不行：同一个元素第二次拿到这个类时，
 * 动画已经处于结束态，浏览器认为「没有变化」就不重播，表现是第一次开有动画、
 * 后面几次硬弹出来。所以要先摘类、强制一次重排把动画状态清掉，再加回来。
 *
 * `void el.offsetWidth` 是这里的关键：读布局属性会强制同步重排，
 * 浏览器必须在重排前把「没有 animation」这一帧确定下来，动画才会真的重来。
 */
function playEnter(menu: HTMLElement) {
  menu.classList.remove('is-entering')
  void menu.offsetWidth
  menu.classList.add('is-entering')
}

/**
 * 「版本与更新」展开/收起。
 *
 * 用 data-open 驱动 CSS 的 grid-template-rows 过渡（0fr ↔ 1fr），
 * 高度自己撑开、不需要测量，也不会像 display 切换那样「瞬间跳一下」。
 * `hidden` 只用于无障碍与首帧（屏幕阅读器不该读到收起的内容）。
 */
function setMoreOpen(root: HTMLElement, open: boolean) {
  const more = root.querySelector<HTMLElement>('.dsh-bloom-more')
  const body = root.querySelector<HTMLElement>('.dsh-bloom-more-body')
  if (!more || !body) return
  body.dataset.instant = 'false'
  body.hidden = false
  body.dataset.open = String(open)
  more.setAttribute('aria-expanded', String(open))
  if (!open) {
    // 收起动画跑完再真正 hidden，否则内容会在滑动中途消失
    window.setTimeout(() => {
      if (body.dataset.open !== 'true') body.hidden = true
    }, 300)
  }
}

/**
 * 换语言后重建面板文字。
 *
 * 不逐节点打补丁：面板文案全部来自 buildSwitcherHTML 的模板，逐个替换要么漏一处，
 * 要么在模板改动之后悄悄失效。整块重建更短也更可靠 —— 事件是委托在根节点上的，
 * 换掉内层不影响监听器。开合状态（菜单、版本区块）手动带过去，用户不该看见闪一下。
 */
function rerenderMenu(el: HTMLElement, variant: string) {
  const holder = document.createElement('div')
  holder.innerHTML = buildSwitcherHTML(variant)
  const fresh = holder.querySelector<HTMLElement>('.dsh-bloom-menu')
  const cur = el.querySelector<HTMLElement>('.dsh-bloom-menu')
  // 版本区块展开与否也要带过去：新模板里它默认收起
  const moreWasOpen = el.querySelector<HTMLElement>('.dsh-bloom-more')?.getAttribute('aria-expanded') === 'true'
  if (fresh && cur) {
    fresh.hidden = cur.hidden
    cur.replaceWith(fresh)
  }
  if (moreWasOpen) {
    const more = el.querySelector<HTMLElement>('.dsh-bloom-more')
    const body = el.querySelector<HTMLElement>('.dsh-bloom-more-body')
    if (more) more.setAttribute('aria-expanded', 'true')
    if (body) {
      // 重画时不能播展开动画（用户没做展开动作，只是换了语言）
      body.dataset.instant = 'true'
      body.hidden = false
      body.dataset.open = 'true'
    }
  }
  const name = el.querySelector<HTMLElement>('.dsh-bloom-trigger__name')
  if (name) name.textContent = variantName(variant)
  const trigger = el.querySelector<HTMLElement>('.dsh-bloom-trigger')
  if (trigger) trigger.setAttribute('title', tr('Bloom 主题 · v{0}', PLUGIN_VERSION))
  syncAppearanceRow(el)
  fresh?.querySelectorAll<HTMLElement>('.dsh-bloom-option').forEach((opt) => opt.setAttribute('tabindex', '-1'))
  refreshUpdateBadge()
  // DSH 版本区是从缓存画的，重建后补一次，否则会停在「检查中…」
  renderDshUpdate()
}

/**
 * 把外观行的选中态与宿主对齐。
 *
 * 每次打开菜单都重读，而不是缓存：用户可能刚从设置面板里改过，
 * 也可能「跟随系统」下系统主题变了 —— 缓存必然对不上。
 *
 * 不再看 hasSettingsEntry —— setMode 已经改成直接切 body 属性（零弹窗），
 * 不再依赖设置面板里的宿主按钮，这行永远可点。
 */
function syncAppearanceRow(el: HTMLElement) {
  const row = el.querySelector<HTMLElement>('.dsh-bloom-appearance')
  if (!row) return
  const sec = el.querySelector<HTMLElement>('[data-mode-section]')
  row.hidden = false
  if (sec) sec.hidden = false
  // 用持久化的模式标选中态（system 也能标），而不是从 body 反推深浅。
  const stored = readStoredMode()
  for (const btn of Array.from(row.querySelectorAll<HTMLElement>('.dsh-bloom-appearance__btn'))) {
    const on = btn.dataset.mode === stored
    btn.dataset.active = String(on)
    btn.setAttribute('aria-pressed', String(on))
  }
}

/**
 * 把玻璃档位行同步成当前状态。
 *
 * 三个要点：
 *   1. 选中态标实际生效的档位，auto 时也亮一格；状态文案说明每档改变了什么。
 *   2. 系统降级了但用户没动过时，要**说清楚**：不然用户看到界面变实底，
 *      以为插件坏了。提示语说明「系统已开启降低透明度」，并给出「仍要毛玻璃」的做法。
 *   3. 提示只在系统确实要求降透明、且用户没显式选过档位时出现。
 */
function syncGlassRow(el: HTMLElement) {
  const row = el.querySelector<HTMLElement>('.dsh-bloom-glass')
  if (!row) return
  const stored = readGlassMode()
  const effective = effectiveGlassMode()
  const shown = stored === 'auto' ? (effective === 'solid' ? 'liquid' : effective) : stored
  for (const btn of Array.from(row.querySelectorAll<HTMLElement>('.dsh-bloom-glass__choice'))) {
    const on = btn.dataset.glass === shown
    btn.dataset.active = String(on)
    btn.setAttribute('aria-pressed', String(on))
  }
  const hint = row.querySelector<HTMLElement>('[data-glass-hint]')
  if (!hint) return
  const systemDowngraded = effective === 'solid'
  hint.hidden = !systemDowngraded
  if (systemDowngraded) {
    hint.textContent = tr('系统设置已降低透明效果；已保留你的质感选择。')
  }
}

const switcherCleanups = new Map<HTMLElement, () => void>()

/** Remove document/window listeners as well as detached switchers after SPA navigation. */
function disposeSwitcher(el: HTMLElement) {
  switcherCleanups.get(el)?.()
  switcherCleanups.delete(el)
}

export function cleanupSwitcher() {
  for (const el of switcherCleanups.keys()) disposeSwitcher(el)
}

export function buildSwitcherEl(initialVariant) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = buildSwitcherHTML(initialVariant)
  const el = wrapper.firstElementChild as HTMLElement
  const capture = createShareCapture()
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let disposed = false
  let shareFile: File | undefined
  let shareUrl: string | undefined
  let shareRequest = 0
  const schedule = (fn: () => void, delay: number) => {
    if (disposed) return
    const timer = setTimeout(() => { timers.delete(timer); fn() }, delay)
    timers.add(timer)
  }
  const releaseShareFile = () => {
    if (shareUrl) URL.revokeObjectURL(shareUrl)
    shareUrl = undefined
    shareFile = undefined
  }
  const closeShare = () => {
    shareRequest++
    capture.cancel()
    releaseShareFile()
    const panel = el.querySelector<HTMLElement>('.dsh-bloom-share-panel')
    if (panel) panel.hidden = true
    el.querySelector<HTMLElement>('.dsh-bloom-share')?.setAttribute('aria-expanded', 'false')
    const status = el.querySelector<HTMLElement>('.dsh-bloom-share-status')
    if (status) status.textContent = ''
    const result = el.querySelector<HTMLElement>('.dsh-bloom-share-result')
    if (result) result.hidden = true
    const manual = el.querySelector<HTMLTextAreaElement>('.dsh-bloom-share-manual')
    if (manual) { manual.value = ''; manual.hidden = true }
    const cancel = el.querySelector<HTMLButtonElement>('.dsh-bloom-share-cancel')
    if (cancel) cancel.hidden = true
    el.querySelectorAll<HTMLButtonElement>('[data-share-capture]').forEach(button => { button.disabled = false })
  }
  closeShareSessions.set(el, closeShare)
  const shareStatus = (message: string) => {
    const status = el.querySelector<HTMLElement>('.dsh-bloom-share-status')
    if (status) status.textContent = message
  }
  const showShareFile = (file: File) => {
    releaseShareFile()
    shareFile = file
    const result = el.querySelector<HTMLElement>('.dsh-bloom-share-result')
    const save = el.querySelector<HTMLAnchorElement>('.dsh-bloom-share-save')
    const system = el.querySelector<HTMLButtonElement>('.dsh-bloom-share-system')
    if (!result || !save || !system) return
    try { shareUrl = URL.createObjectURL(file) } catch {}
    save.hidden = !shareUrl
    if (shareUrl) { save.href = shareUrl; save.download = file.name }
    let canShare = false
    try { canShare = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] }) } catch {}
    system.hidden = !canShare
    result.hidden = !canShare && !shareUrl
    shareStatus(result.hidden ? tr('无法准备文件，请检查浏览器权限') : canShare ? tr('文件已准备好，可分享或保存') : tr('文件已准备好，保存后即可分享'))
  }
  const startCapture = (kind: 'screenshot' | 'record') => {
    releaseShareFile()
    const result = el.querySelector<HTMLElement>('.dsh-bloom-share-result')
    if (result) result.hidden = true
    const request = ++shareRequest
    el.querySelectorAll<HTMLButtonElement>('[data-share-capture]').forEach(button => { button.disabled = true })
    const cancel = el.querySelector<HTMLButtonElement>('.dsh-bloom-share-cancel')
    if (cancel) { cancel.hidden = false; cancel.focus({ preventScroll: true }) }
    shareStatus(kind === 'record' ? tr('请选择屏幕、窗口或标签页，将录制 5 秒且不录音') : tr('请选择要截图的屏幕、窗口或标签页'))
    const pending = kind === 'record' ? capture.record() : capture.screenshot()
    void pending.then(outcome => {
      if (disposed || request !== shareRequest || !el.isConnected) return
      el.querySelectorAll<HTMLButtonElement>('[data-share-capture]').forEach(button => { button.disabled = false })
      const cancel = el.querySelector<HTMLButtonElement>('.dsh-bloom-share-cancel')
      if (cancel) cancel.hidden = true
      if (outcome.kind === 'success') { showShareFile(outcome.file); return }
      const captureFailed = tr('无法打开屏幕选择器或完成捕获，可能是宿主不支持、系统权限受限或已取消；可使用系统截图或录屏工具')
      const messages: Record<string, string> = {
        cancelled: tr('已取消'), denied: captureFailed,
        unsupported: tr('当前环境不支持直接截图或录屏'), busy: tr('请先结束当前操作'),
        ended: tr('屏幕共享已结束'), failed: captureFailed,
      }
      shareStatus(messages[outcome.kind] ?? messages.failed)
    }).catch(() => {
      if (disposed || request !== shareRequest || !el.isConnected) return
      el.querySelectorAll<HTMLButtonElement>('[data-share-capture]').forEach(button => { button.disabled = false })
      const cancel = el.querySelector<HTMLButtonElement>('.dsh-bloom-share-cancel')
      if (cancel) cancel.hidden = true
      shareStatus(tr('无法打开屏幕选择器或完成捕获，可能是宿主不支持、系统权限受限或已取消；可使用系统截图或录屏工具'))
    })
  }

  // 语言现在是 DSH 的偏好（locale.preference）。在 DSH 设置里换语言时，
  // 面板要跟着重画 —— 否则会出现「DSH 是中文、面板还是英文」的割裂。
  // 监听挂在 window 上：面板可能被替换掉，但事件源始终在。
  const onLanguageChange = () => {
    closeShare()
    if (el.isConnected) rerenderMenu(el, readVariant())
  }
  window.addEventListener(LANG_CHANGE_EVENT, onLanguageChange)

  startRotation(applyVariant)
  const openMenu = () => {
    const wanted = readVariant()
    const options = el.querySelectorAll<HTMLElement>('.dsh-bloom-option')
    const currentlyShown = [...options].map((opt) => opt.dataset.variant)
    const expected = FEATURED_VARIANTS.includes(wanted) ? FEATURED_VARIANTS : [wanted, ...FEATURED_VARIANTS]
    if (expected.some((v, i) => v !== currentlyShown[i]) || currentlyShown.length !== expected.length) rerenderMenu(el, wanted)
    const menu = el.querySelector<HTMLElement>('.dsh-bloom-menu')
    const trigger = el.querySelector<HTMLElement>('.dsh-bloom-trigger')
    menu.hidden = false
    // 每次打开都重播入场：不这么做，第二次之后就是硬弹出来
    playEnter(menu)
    trigger.setAttribute('aria-expanded', 'true')
    syncAppearanceRow(el)
    syncGlassRow(el)
      // 打开时把焦点移到当前选中项，键盘用户立刻知道在哪
    const active = menu.querySelector<HTMLElement>('.dsh-bloom-option[data-active="true"]')
      || menu.querySelector<HTMLElement>('.dsh-bloom-option')
    active?.focus()
  }

  el.addEventListener('change', (e) => {
    const control = (e.target as HTMLElement).closest<HTMLSelectElement>('.dsh-bloom-rotation__select')
    if (control) { setRotationMinutes(Number(control.value)); return }
    const box = (e.target as HTMLElement).closest<HTMLInputElement>('.dsh-bloom-telemetry__box')
    if (box) {
      setTelemetryEnabled(box.checked)
    }
  })

  el.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    // 埋点：链接用 data-track 声明；按钮在各自分支里打。sendBeacon 不阻塞跳转。
    const tracked = target.closest<HTMLElement>('[data-track]')
    if (tracked?.dataset.track) track(tracked.dataset.track as PanelEvent)
    if (target.closest('.dsh-bloom-close')) { closeMenu(el); return }
    const meteorBtn = target.closest<HTMLButtonElement>('[data-meteor-color]')
    if (meteorBtn) {
      const mode = meteorBtn.dataset.meteorColor
      if (mode === 'solid' || mode === 'colorful') {
        writeMeteorColorMode(mode)
        el.querySelectorAll<HTMLButtonElement>('[data-meteor-color]').forEach(button => {
          const active = button.dataset.meteorColor === mode
          button.dataset.active = String(active)
          button.setAttribute('aria-checked', String(active))
        })
      }
      e.stopPropagation()
      return
    }
    const ambienceBtn = target.closest<HTMLElement>('.dsh-bloom-ambience__btn')
    if (ambienceBtn) {
      e.stopPropagation()
      const row = ambienceBtn.closest<HTMLElement>('.dsh-bloom-ambience')
      const scheme = row?.dataset.scheme as Scheme | undefined
      if (row && scheme && writeAmbience(scheme, ambienceBtn.dataset.preset ?? '')) {
        row.querySelectorAll<HTMLElement>('.dsh-bloom-ambience__btn').forEach((b) => {
          const on = b === ambienceBtn
          b.dataset.active = String(on)
          b.setAttribute('aria-checked', String(on))
        })
      }
      return
    }
    const diagnose = target.closest<HTMLElement>('.dsh-bloom-diagnose')
    if (diagnose) {
      e.stopPropagation()
      track('diagnose')
      void copyDiagnostics(diagnose)
      return
    }
    const feedback = target.closest<HTMLAnchorElement>('.dsh-bloom-feedback')
    if (feedback) {
      try { feedback.href = buildFeedbackUrl(formatDiagnosticsMarkdown(), getLang()) } catch {}
      return
    }
    const install = target.closest<HTMLElement>('.dsh-bloom-share-install')
    if (install) {
      e.stopPropagation()
      void shareInstall(install, schedule).then(ok => {
        if (ok || disposed || !install.isConnected) return
        const manual = el.querySelector<HTMLTextAreaElement>('.dsh-bloom-share-manual')
        if (manual) { manual.value = buildShareText(); manual.hidden = false; manual.focus(); manual.select() }
        shareStatus(tr('复制失败，请手动复制'))
      })
      return
    }
    const cancelCapture = target.closest<HTMLButtonElement>('.dsh-bloom-share-cancel')
    if (cancelCapture) { e.stopPropagation(); closeShare(); el.querySelector<HTMLElement>('.dsh-bloom-share')?.focus(); return }
    const captureAction = target.closest<HTMLButtonElement>('[data-share-capture]')
    if (captureAction) {
      e.stopPropagation()
      if (captureAction.dataset.shareCapture === 'screenshot' || captureAction.dataset.shareCapture === 'record') startCapture(captureAction.dataset.shareCapture)
      return
    }
    const systemShare = target.closest<HTMLButtonElement>('.dsh-bloom-share-system')
    if (systemShare && shareFile && typeof navigator.share === 'function') {
      e.stopPropagation()
      try {
        void navigator.share({ files: [shareFile], title: 'Bloom' }).catch(error => {
          if (!disposed) shareStatus(error instanceof Error && error.name === 'AbortError' ? tr('已取消') : tr('无法分享，请先保存文件'))
        })
      } catch { shareStatus(tr('无法分享，请先保存文件')) }
      return
    }
    const share = target.closest<HTMLElement>('.dsh-bloom-share')
    if (share) {
      e.stopPropagation()
      const panel = el.querySelector<HTMLElement>('.dsh-bloom-share-panel')
      if (!panel) return
      if (!panel.hidden) closeShare()
      else { track('share'); panel.hidden = false; share.setAttribute('aria-expanded', 'true') }
      return
    }
    const more = target.closest<HTMLElement>('.dsh-bloom-more')
    if (more) {
      // 版本与更新默认收起：日常用不到，摊开会把面板撑长（设计图里它就是一行入口）
      // 展开走 grid-template-rows 过渡（同框滑动），不再 hidden 硬切
      const nowOpen = more.getAttribute('aria-expanded') === 'true'
      if (!nowOpen) track('version-open')
      setMoreOpen(el, !nowOpen)
      return
    }
    const modeBtn = target.closest<HTMLElement>('.dsh-bloom-appearance__btn[data-mode]')
    if (modeBtn) {
      // 直接切 body 属性 + 持久化，零弹窗。同步完成，立刻刷新选中态。
      setMode(modeBtn.dataset.mode as AppearanceMode)
      syncAppearanceRow(el)
      return
    }
    const glassBtn = target.closest<HTMLElement>('.dsh-bloom-glass__choice[data-glass]')
    if (glassBtn) {
      // 玻璃档位：写 localStorage + 落到 body 属性上，CSS 立刻生效。
      writeGlassMode(glassBtn.dataset.glass as GlassMode)
      syncGlassRow(el)
      return
    }
    const trigger = (e.target as HTMLElement).closest('.dsh-bloom-trigger')
    if (trigger) {
      const menu = el.querySelector<HTMLElement>('.dsh-bloom-menu')
      if (menu.hidden) openMenu()
      else closeMenu(el)
      return
    }
    const opt = (e.target as HTMLElement).closest('.dsh-bloom-option') as HTMLElement | null
    if (opt) {
      applyVariant(opt.dataset.variant)
      closeMenu(el)
      el.querySelector<HTMLElement>('.dsh-bloom-trigger')?.focus()
      return
    }
  })

  el.addEventListener('keydown', (e: KeyboardEvent) => {
    const menu = el.querySelector<HTMLElement>('.dsh-bloom-menu')
    const trigger = el.querySelector<HTMLElement>('.dsh-bloom-trigger')
    const options = [...menu.querySelectorAll<HTMLElement>('.dsh-bloom-option')]
    const idx = options.indexOf(document.activeElement as HTMLElement)
    const meteorChoice = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('[data-meteor-color]') : null
    if (meteorChoice && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      const other = el.querySelector<HTMLButtonElement>(`[data-meteor-color="${meteorChoice.dataset.meteorColor === 'solid' ? 'colorful' : 'solid'}"]`)
      if (other) { e.preventDefault(); other.click(); other.focus() }
      return
    }
    const sharePanel = el.querySelector<HTMLElement>('.dsh-bloom-share-panel')
    const shareTrigger = el.querySelector<HTMLElement>('.dsh-bloom-share')
    if (sharePanel && !sharePanel.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeShare(); shareTrigger?.focus(); return }
      const withinShare = e.target instanceof Element && (sharePanel.contains(e.target) || e.target === shareTrigger)
      if (withinShare && !(e.target instanceof HTMLTextAreaElement) && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        const actions = [...sharePanel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea:not([hidden])')].filter(node => node.getClientRects().length > 0)
        if (actions.length) {
          e.preventDefault()
          const index = actions.indexOf(document.activeElement as HTMLElement)
          actions[e.key === 'ArrowDown' ? (index + 1) % actions.length : (index <= 0 ? actions.length - 1 : index - 1)]?.focus()
        }
        return
      }
    }

    // 面板内的表单控件里，键盘交给控件本身（只保留 Escape 收起）
    // ⚠️ 自动换色是 <select>：方向键 / Home / End 必须留给下拉框，
    // 否则用户用键盘调整间隔时焦点会被配色列表抢走。
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      || e.target instanceof HTMLSelectElement) {
      if (e.key === 'Escape') { closeMenu(el); trigger?.focus() }
      return
    }

    // trigger 上的键盘交互：↓/Enter/Space 打开菜单
    if (document.activeElement === trigger && menu.hidden) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openMenu()
      }
      return
    }

    if (menu.hidden) return

    switch (e.key) {
      case 'Escape':
        closeMenu(el)
        trigger?.focus()
        break
      case 'ArrowDown':
        e.preventDefault()
        options[(idx + 1) % options.length]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        options[(idx - 1 + options.length) % options.length]?.focus()
        break
      case 'Home':
        e.preventDefault()
        options[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        options[options.length - 1]?.focus()
        break
      case 'Enter':
      case ' ':
        if (idx >= 0) {
          e.preventDefault()
          applyVariant(options[idx].dataset.variant)
          closeMenu(el)
          trigger?.focus()
        }
        break
      case 'Tab': {
        // Keep all controls reachable. Only close when Tab leaves the dialog boundary.
        const stops = Array.from(menu.querySelectorAll<HTMLElement>('button:not([disabled]), select, a[href], [tabindex="0"]'))
          .filter((node) => node.tabIndex >= 0 && node.getClientRects().length > 0)
        const edge = e.shiftKey ? stops[0] : stops[stops.length - 1]
        if (document.activeElement === edge) {
          e.preventDefault()
          closeMenu(el)
          trigger?.focus()
        }
        break
      }
    }
  })

  // 选项做成可聚焦（listbox 语义要求 option 可接收焦点）
  el.querySelectorAll<HTMLElement>('.dsh-bloom-option').forEach((opt) => {
    opt.setAttribute('tabindex', '-1')
  })

  // 点击外部关闭。挂 document 上，用 el.contains 判断而不是 blur ——
  // blur 会在点菜单项时先触发，导致选不中。
  const onOutsideClick = (e: MouseEvent) => {
    if (!el.contains(e.target as Node)) closeMenu(el)
  }
  document.addEventListener('click', onOutsideClick)
  switcherCleanups.set(el, () => {
    disposed = true
    closeShare()
    capture.dispose()
    closeShareSessions.delete(el)
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
    window.removeEventListener(LANG_CHANGE_EVENT, onLanguageChange)
    document.removeEventListener('click', onOutsideClick)
  })
  return el
}

/** Mount only into the container provided by our React Slot component. */
export function mountSwitcher(host: HTMLElement, anchor: HTMLElement): () => void {
  injectCSS(SWITCHER_CSS, 'switcher.css')
  const el = buildSwitcherEl(readVariant())
  el.dataset.slotted = 'true'
  host.append(el)
  const trigger = el.querySelector<HTMLElement>('.dsh-bloom-trigger')!
  // Measure only Bloom's own anchor. No host selectors or DOM reparenting.
  let last = ''
  let size = ''
  const position = () => {
    const measured = `${trigger.offsetWidth}|${trigger.offsetHeight}`
    if (measured !== size) {
      size = measured
      anchor.style.width = `${trigger.offsetWidth}px`
      anchor.style.height = `${trigger.offsetHeight}px`
    }
    const box = anchor.getBoundingClientRect()
    const covered = Array.from(document.querySelectorAll<HTMLElement>('dialog[open], [role="dialog"][aria-modal="true"]'))
      .some(modal => !el.contains(modal) && modal.getClientRects().length > 0 && getComputedStyle(modal).visibility !== 'hidden')
    const key = `${box.left}|${box.top}|${box.width}|${box.height}|${window.innerHeight}|${covered}`
    if (key === last) return
    last = key
    // A hidden anchor has no box: hide the widget rather than pinning it to 0,0.
    el.style.visibility = box.width && box.height && !covered ? 'visible' : 'hidden'
    if (covered) closeMenu(el)
    el.style.left = `${box.left}px`
    el.style.top = `${box.top}px`
    el.style.setProperty('--bloom-menu-max-h', `${Math.max(160, window.innerHeight - box.bottom - 18)}px`)
  }
  position()
  // The anchor can move without resizing (sidebar collapse, sibling width), so track its own rect per frame.
  let frame = 0
  const track = () => { position(); frame = requestAnimationFrame(track) }
  frame = requestAnimationFrame(track)
  const observer = new ResizeObserver(position)
  observer.observe(anchor)
  observer.observe(trigger)
  window.addEventListener('resize', position)
  window.addEventListener('scroll', position, true)
  refreshUpdateBadge()
  renderDshUpdate()
  void checkDshLatest()
  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    window.removeEventListener('resize', position)
    window.removeEventListener('scroll', position, true)
    disposeSwitcher(el)
    el.remove()
    anchor.style.removeProperty('width')
    anchor.style.removeProperty('height')
  }
}
