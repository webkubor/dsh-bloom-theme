/**
 * 细节配置行 —— 设置页「Bloom 外观」（settings.section）专属内容。
 *
 * 下拉菜单只留「主题 + 模式」，细节配置（质感、背景氛围、流星、自动换色、动效、
 * 版本与更新、诊断、遥测、分享）全部收敛到这里。
 *
 * 事件委托按容器绑定（不是绑死 switcher 根），同一套 HTML 在测试夹具或
 * 设置页里都能跑；状态同步函数从 switcher 复用，避免两处漂移。
 */

/**
 * 设置页图标集 —— 统一描边语言（1.4 线宽、currentColor、16px 视口）。
 *
 * 与顶栏切换器面板里的 chevron 是同一套语言（同一份设计决策：跨区域同源）。
 * 所有图标都带 aria-hidden，文字信息由相邻的标题或 aria-label 提供。
 */
const ICON = {
  glass: '<path d="M2.6 5.2h10.8M2.6 8h10.8M2.6 10.8h10.8M4.6 2.6v10.8M8 2.6v10.8M11.4 2.6v10.8" stroke="currentColor" stroke-width="1" opacity=".85"/>',
  matte: '<rect x="2.4" y="3.4" width="11.2" height="9.2" rx="2" fill="currentColor" opacity=".22"/><rect x="2.4" y="3.4" width="11.2" height="9.2" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/>',
  liquid: '<path d="M8 2.2c2.2 2.6 3.6 4.4 3.6 6a3.6 3.6 0 1 1-7.2 0c0-1.6 1.4-3.4 3.6-6z" fill="currentColor" opacity=".85"/>',
  background: '<rect x="2.2" y="3.2" width="11.6" height="9.6" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M2.2 10.2 5.4 7l2.6 2.4 2.2-1.8 3.6 3" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  meteor: '<path d="M13.4 2.6 6.8 9.2M11.2 4.8l2.6-2.6M9 7l-2.6 2.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="4.6" cy="11.4" r="1.6" fill="currentColor"/>',
  solid: '<circle cx="8" cy="8" r="4.2" fill="currentColor"/>',
  colorful: '<circle cx="6" cy="8" r="3" fill="currentColor" opacity=".85"/><circle cx="10" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.2"/>',
  sparse: '<circle cx="4.4" cy="8" r="1.3" fill="currentColor"/><circle cx="11.6" cy="8" r="1.3" fill="currentColor"/>',
  dense: '<circle cx="4" cy="5.4" r="1.2" fill="currentColor"/><circle cx="8" cy="5.4" r="1.2" fill="currentColor"/><circle cx="12" cy="5.4" r="1.2" fill="currentColor"/><circle cx="6" cy="10.4" r="1.2" fill="currentColor"/><circle cx="10" cy="10.4" r="1.2" fill="currentColor"/>',
  standard: '<circle cx="4.4" cy="8" r="1.3" fill="currentColor"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="11.6" cy="8" r="1.3" fill="currentColor"/>',
  slow: '<path d="M3.4 8h6.2M9.6 5.4 12.6 8l-3 2.6" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  fast: '<path d="M2.6 8h8.2M9.2 5 12.6 8l-3.4 3M12.4 4.4v7.2" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  rotation: '<path d="M13 8a5 5 0 1 1-1.6-3.7" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M12.4 2.4v3h-3" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  motion: '<path d="M2 8h3l2-4 2.2 8L11.4 8H14" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  motionOff: '<path d="M2.6 8h2.2l1.6-3.2 1.9 6.4L10 8h1.6" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45"/><path d="M12.6 3.4 3.4 12.6" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
  /* 氛围预设：每个预设一个专属图形，靠形状区分（颜色由氛围层自己渲染） */
  ambDiagonal: '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M2.4 13.6 13.6 2.4v11.2z" fill="currentColor" opacity=".38"/>',
  ambGalaxy: '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="5" cy="5.4" r=".9" fill="currentColor"/><circle cx="9.6" cy="4.4" r=".7" fill="currentColor" opacity=".8"/><circle cx="11" cy="9" r=".9" fill="currentColor"/><circle cx="6.4" cy="10.4" r=".7" fill="currentColor" opacity=".8"/>',
  ambCorner: '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M13.6 12.8a4 4 0 0 0-4-4" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/>',
  ambStream: '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M2.4 9.6c2.4-2.6 4.4 2.6 6.8 0s4.4 2.6 4.4 2.6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  ambWash: '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="6" cy="6.6" r="2.4" fill="currentColor" opacity=".32"/><circle cx="9.8" cy="9.4" r="2.8" fill="currentColor" opacity=".24"/>',
  ambClear: '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.4 8.2 7.3 10l3.4-3.6" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  ambOff: '<rect x="2.4" y="2.4" width="11.2" height="11.2" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
  /* 「关于 Bloom」组：版本、更新日志、仓库、反馈 —— owner 2026-11-21
     「配置项可以多一点，比如更新日志、GitHub 链接等介绍」。 */
  about: '<circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 7.2v4M8 4.9v.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  changelog: '<rect x="3" y="2.6" width="10" height="10.8" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.6 5.8h4.8M5.6 8h4.8M5.6 10.2h3.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  repo: '<path d="M4.6 5.4v7.2M4.6 5.4a1.4 1.4 0 1 0 0-.1M4.6 5.4h4.2a1.4 1.4 0 0 1 1.4 1.4v5.8M6 8.6h2.8" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  feedback: '<path d="M2.8 5.4a1.8 1.8 0 0 1 1.8-1.8h6.8a1.8 1.8 0 0 1 1.8 1.8v3.8a1.8 1.8 0 0 1-1.8 1.8H7.4L4.6 13V11H4.6a1.8 1.8 0 0 1-1.8-1.8z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>',
} as const

/** 描边图标 HTML（统一 16×16 视口、1.4 线宽）。 */
function icon(name: keyof typeof ICON, cls = 'dsh-bloom-row__icon'): string {
  return `<svg class="${cls}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`
}

/**
 * 一张设置卡片 —— 左图标 + 标题 + 右侧控件。
 *
 * 控件右对齐是设置类界面的通用秩序：标题列固定宽度，控件列吸右，
 * 宽面板下不会「内容全堆在左边，右边空一大片」。
 */
function row(iconName: keyof typeof ICON, label: string, control: string, extra = ''): string {
  return `<div class="dsh-bloom-row"${extra}>
    <span class="dsh-bloom-row__lead">${icon(iconName)}<span class="dsh-bloom-row__label">${label}</span></span>
    <span class="dsh-bloom-row__control">${control}</span>
  </div>`
}

/** 分组标题（组内是卡片，组间靠留白分隔）。extra 供条件显示的组使用。 */
function groupTitle(label: string, extra = ''): string {
  return `<div class="dsh-bloom-group"${extra}>${label}</div>`
}

/**
 * 细节行 HTML —— 质感 / 背景 / 流星 / 自动换色 / 动效。
 *
 * ## 重新设计（2026-11-21 · owner「关于设置皮肤的操作界面，你需要重新设计，太丑了」）
 *
 * 原设计的问题（对照 owner 实拍）：
 *   1. **全是文字按钮** —— 质感三选一、流星颜色/密度/速度、动效，全是裸文字
 *      按钮堆叠；「能用图标交互布局解决的，就不要通过文字的形式去解决」。
 *   2. **大片留白** —— 内容挤在设置面板左上角，右侧与下方整片空白。
 *   3. **层级不清** —— 「质感 / 背景」是组标题，但组内控件与组标题长得一样，
 *      分不清哪行属于哪组。
 *
 * 新设计：
 *   · 每个配置项收敛成**一张卡片**：左图标 + 标题 + 右侧控件，控件右对齐
 *     （设置面板是宽栏，标题在上、控件靠右，是设置类界面的通用秩序）。
 *   · 文字型选项改用**图标 + 悬停提示**：质感三档、流星颜色/密度/速度、
 *     动效开关，全部图标化，文字只留给 tooltip 与 aria-label。
 *   · 组与组之间用留白分组，不再靠「小标题 + 换行」硬隔。
 */
import { readRotationMinutes, setRotationMinutes, ROTATION_MINUTES } from './rotation.js'
import { applyMotion, readMotion } from './dom.js'
import {
  effectiveGlassMode,
  GLASS_MODES,
  readGlassMode,
  writeGlassMode,
  type GlassMaterial,
} from './glass.js'
import { AMBIENCE_PRESETS, readAmbience, writeAmbience, type Scheme } from './ambience.js'
import {
  applyMeteorDensity,
  applyMeteorSpeed,
  METEOR_DENSITIES,
  METEOR_SPEEDS,
  readMeteorColorMode,
  readMeteorDensity,
  readMeteorSpeed,
  writeMeteorColorMode,
  writeMeteorDensity,
  writeMeteorSpeed,
  type MeteorColorMode,
  type MeteorDensity,
  type MeteorSpeed,
} from './starlight.js'
import { tr } from './lang.js'
import { changelogHTML, ICON_CHAT, ICON_DIAGNOSE, ICON_SHARE, ICON_STAR } from './markup.js'
import { telemetryEnabled, setTelemetryEnabled, track, type PanelEvent } from './track.js'
import { PLUGIN_VERSION } from './meta.js'

export const AMBIENCE_LABELS: Record<string, string> = {
  diagonal: '对角漫染', galaxy: '漫天星辰', corner: '角落微光',
  stream: '斜光流转', wash: '水彩晕染', clear: '清透留白', off: '不显示',
}

/** 每个氛围预设一个专属图标（形状区分，颜色由氛围层自己渲染）。 */
const AMBIENCE_ICONS: Record<string, keyof typeof ICON> = {
  diagonal: 'ambDiagonal', galaxy: 'ambGalaxy', corner: 'ambCorner',
  stream: 'ambStream', wash: 'ambWash', clear: 'ambClear', off: 'ambOff',
}

/** 创建已绑定事件的细节行容器（设置页 / 测试夹具共用）。 */
export function buildDetailEl(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'dsh-bloom-detail'
  el.innerHTML = buildDetailRowsHTML()
  bindDetailEvents(el)
  return el
}

/** 细节行 HTML —— 质感 / 背景 / 流星 / 自动换色 / 动效。 */
export function buildDetailRowsHTML(): string {
  const rotationOptions = ROTATION_MINUTES.map((m) =>
    `<option value="${m}"${readRotationMinutes() === m ? ' selected' : ''}>${m === 0 ? tr('关闭自动换色') : tr('每 {0} 分钟', m)}</option>`).join('')

  /* 质感：图标三选一（文字只进 title / aria-label）。
     与面板其余单选行保持同一套 radiogroup 语义：role=radio + aria-checked。 */
  const glassChoices = GLASS_MODES.map((mode) => {
    const ic = mode === 'frosted' ? 'glass' : mode === 'matte' ? 'matte' : 'liquid'
    const label = tr(mode === 'frosted' ? '毛玻璃' : mode === 'matte' ? '磨砂玻璃' : '液态玻璃')
    const on = mode === readGlassMode()
    return `<button type="button" class="dsh-bloom-icon-choice" data-glass="${mode}" role="radio" aria-checked="${on}" data-active="${on}" title="${label}" aria-label="${label}">${icon(ic, 'dsh-bloom-icon-choice__icon')}</button>`
  }).join('')

  /* 背景氛围：两行（浅色 / 深色），每行四个图标，每个预设一个专属图形。 */
  const ambience = (Object.keys(AMBIENCE_PRESETS) as Scheme[]).map((scheme) => {
    const current = readAmbience(scheme)
    const buttons = AMBIENCE_PRESETS[scheme].map((preset) => {
      const label = tr(AMBIENCE_LABELS[preset])
      return `<button type="button" class="dsh-bloom-icon-choice" data-preset="${preset}" role="radio" aria-checked="${preset === current}" data-active="${preset === current}" title="${label}" aria-label="${label}">${icon(AMBIENCE_ICONS[preset], 'dsh-bloom-icon-choice__icon')}</button>`
    }).join('')
    const hint = scheme === 'dark' ? tr('深色背景') : tr('浅色背景')
    return `<div class="dsh-bloom-ambience" data-scheme="${scheme}" role="radiogroup" aria-label="${hint}">${buttons}</div>`
  }).join('')

  const meteorColor = readMeteorColorMode()
  const meteorDensity = readMeteorDensity()
  const meteorSpeed = readMeteorSpeed()
  const motionOn = readMotion()

  return `${groupTitle(tr('质感'))}
    <div class="dsh-bloom-group__body">
      ${row('glass', tr('材质'), `<span class="dsh-bloom-icon-seg" role="radiogroup" aria-label="${tr('质感')}">${glassChoices}</span>`)}
      <p class="dsh-bloom-hint" data-glass-hint hidden></p>
    </div>
    ${groupTitle(tr('背景'))}
    <div class="dsh-bloom-group__body">
      ${row('background', tr('氛围'), `<span class="dsh-bloom-ambience-wrap">${ambience}</span>`)}
    </div>
    ${groupTitle(tr('流星'), ' data-meteor-group')}
    <div class="dsh-bloom-group__body" data-meteor-group>
      ${row('meteor', tr('颜色'), `<span class="dsh-bloom-icon-seg" role="radiogroup" aria-label="${tr('流星颜色')}">
        <button type="button" class="dsh-bloom-icon-choice" data-meteor-color="solid" role="radio" aria-checked="${meteorColor === 'solid'}" data-active="${meteorColor === 'solid'}" title="${tr('纯色')}" aria-label="${tr('纯色')}">${icon('solid', 'dsh-bloom-icon-choice__icon')}</button>
        <button type="button" class="dsh-bloom-icon-choice" data-meteor-color="colorful" role="radio" aria-checked="${meteorColor === 'colorful'}" data-active="${meteorColor === 'colorful'}" title="${tr('彩色')}" aria-label="${tr('彩色')}">${icon('colorful', 'dsh-bloom-icon-choice__icon')}</button>
      </span>`, ' data-meteor-row="color"')}
      ${row('meteor', tr('密度'), `<span class="dsh-bloom-icon-seg" role="radiogroup" aria-label="${tr('流星密度')}">
        <button type="button" class="dsh-bloom-icon-choice" data-meteor-density="sparse" role="radio" aria-checked="${meteorDensity === 'sparse'}" data-active="${meteorDensity === 'sparse'}" title="${tr('稀疏')}" aria-label="${tr('稀疏')}">${icon('sparse', 'dsh-bloom-icon-choice__icon')}</button>
        <button type="button" class="dsh-bloom-icon-choice" data-meteor-density="standard" role="radio" aria-checked="${meteorDensity === 'standard'}" data-active="${meteorDensity === 'standard'}" title="${tr('标准')}" aria-label="${tr('标准')}">${icon('standard', 'dsh-bloom-icon-choice__icon')}</button>
        <button type="button" class="dsh-bloom-icon-choice" data-meteor-density="dense" role="radio" aria-checked="${meteorDensity === 'dense'}" data-active="${meteorDensity === 'dense'}" title="${tr('密集')}" aria-label="${tr('密集')}">${icon('dense', 'dsh-bloom-icon-choice__icon')}</button>
      </span>`, ' data-meteor-row="density"')}
      ${row('meteor', tr('速度'), `<span class="dsh-bloom-icon-seg" role="radiogroup" aria-label="${tr('流星速度')}">
        <button type="button" class="dsh-bloom-icon-choice" data-meteor-speed="slow" role="radio" aria-checked="${meteorSpeed === 'slow'}" data-active="${meteorSpeed === 'slow'}" title="${tr('慢')}" aria-label="${tr('慢')}">${icon('slow', 'dsh-bloom-icon-choice__icon')}</button>
        <button type="button" class="dsh-bloom-icon-choice" data-meteor-speed="standard" role="radio" aria-checked="${meteorSpeed === 'standard'}" data-active="${meteorSpeed === 'standard'}" title="${tr('标准')}" aria-label="${tr('标准')}">${icon('standard', 'dsh-bloom-icon-choice__icon')}</button>
        <button type="button" class="dsh-bloom-icon-choice" data-meteor-speed="fast" role="radio" aria-checked="${meteorSpeed === 'fast'}" data-active="${meteorSpeed === 'fast'}" title="${tr('快')}" aria-label="${tr('快')}">${icon('fast', 'dsh-bloom-icon-choice__icon')}</button>
      </span>`, ' data-meteor-row="speed"')}
    </div>
    ${groupTitle(tr('动效'))}
    <div class="dsh-bloom-group__body">
      ${row('motion', tr('动效'), `<span class="dsh-bloom-icon-seg" role="radiogroup" aria-label="${tr('动效')}">
        <button type="button" class="dsh-bloom-icon-choice" data-motion="on" role="radio" aria-checked="${motionOn}" data-active="${motionOn}" title="${tr('开启')}" aria-label="${tr('开启')}">${icon('motion', 'dsh-bloom-icon-choice__icon')}</button>
        <button type="button" class="dsh-bloom-icon-choice" data-motion="off" role="radio" aria-checked="${!motionOn}" data-active="${!motionOn}" title="${tr('停用')}" aria-label="${tr('停用')}">${icon('motionOff', 'dsh-bloom-icon-choice__icon')}</button>
      </span>`)}
      ${row('rotation', tr('自动换色'), `<select class="dsh-bloom-rotation__select" aria-label="${tr('自动换色')}">${rotationOptions}</select>`)}
    </div>
    ${buildAboutHTML()}`
}

/**
 * 「关于 Bloom」组 —— 版本、更新日志、仓库、反馈。
 *
 * 2026-11-21（owner「配置项可以多一点，比如更新日志、GitHub 链接等介绍，
 * 否则显得配置项有点少」）：设置页原先只有外观相关行，读起来像半张卡。
 * 这里补一组纯信息行，把版本与外链放在最自然的位置。
 *
 * 外链一律 target=_blank + rel=noopener noreferrer（宿主设置页可能跑在
 * 受限的 webview 里，noopener 防止新页反向控制本页）。
 */
const REPO_URL = 'https://github.com/webkubor/dsh-bloom-theme'

function buildAboutHTML(): string {
  const link = (href: string, label: string) =>
    `<a class="dsh-bloom-about__link" href="${href}" target="_blank" rel="noopener noreferrer">${label}<span class="dsh-bloom-about__ext" aria-hidden="true">↗</span></a>`
  return `${groupTitle(tr('关于 Bloom'))}
    <div class="dsh-bloom-group__body">
      ${row('about', tr('版本'), `<span class="dsh-bloom-about__ver">v${PLUGIN_VERSION}</span>`)}
      ${row('changelog', tr('更新日志'), link(`${REPO_URL}/releases`, tr('查看更新日志')))}
      ${row('repo', tr('源码仓库'), link(REPO_URL, 'GitHub'))}
      ${row('feedback', tr('反馈问题'), link(`${REPO_URL}/issues/new`, tr('提交问题')))}
    </div>`
}

/**
 * 版本与更新、诊断、遥测、分享 —— 原下拉菜单「更多」折叠区 + 底栏。
 * 更新徽标（↑ v9.x）挂在 .dsh-bloom-version__update 上，refreshUpdateBadge 会找它。
 */
export function buildMoreHTML(sharePanelId: string): string {
  return `<div class="dsh-bloom-more-body">
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
      <button type="button" class="dsh-bloom-more" aria-expanded="true" title="${tr('版本与更新')}">
        <span class="dsh-bloom-more__name">Bloom</span><span class="dsh-bloom-more__ver">v${PLUGIN_VERSION}</span>
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
    </div>`
}

/**
 * 细节行事件委托 —— 绑在容器上，设置页与测试夹具共用。
 *
 * 细节行内部用 closest + 局部 querySelector 同步选中态，容器是谁都行；
 * 埋点在各自分支里打。
 */
export function bindDetailEvents(el: HTMLElement): () => void {
  const onChange = (e: Event) => {
    const control = (e.target as HTMLElement).closest<HTMLSelectElement>('.dsh-bloom-rotation__select')
    if (control) {
      setRotationMinutes(Number(control.value))
      return
    }
    const box = (e.target as HTMLElement).closest<HTMLInputElement>('.dsh-bloom-telemetry__box')
    if (box) setTelemetryEnabled(box.checked)
  }
  const onClick = (e: Event) => {
    const target = e.target as HTMLElement
    const tracked = target.closest<HTMLElement>('[data-track]')
    if (tracked?.dataset.track) track(tracked.dataset.track as PanelEvent)
    const meteorBtn = target.closest<HTMLButtonElement>('[data-meteor-color]')
    if (meteorBtn) {
      const mode = meteorBtn.dataset.meteorColor
      if (mode === 'solid' || mode === 'colorful') {
        writeMeteorColorMode(mode as MeteorColorMode)
        el.querySelectorAll<HTMLButtonElement>('[data-meteor-color]').forEach(button => {
          const active = button.dataset.meteorColor === mode
          button.dataset.active = String(active)
          button.setAttribute('aria-checked', String(active))
        })
      }
      e.stopPropagation()
      return
    }
    const densityBtn = target.closest<HTMLButtonElement>('[data-meteor-density]')
    if (densityBtn) {
      const density = densityBtn.dataset.meteorDensity
      if (METEOR_DENSITIES.includes(density as MeteorDensity)) {
        writeMeteorDensity(density as MeteorDensity)
        applyMeteorDensity(document, density as MeteorDensity)
        el.querySelectorAll<HTMLButtonElement>('[data-meteor-density]').forEach(button => {
          const active = button.dataset.meteorDensity === density
          button.dataset.active = String(active)
          button.setAttribute('aria-checked', String(active))
        })
      }
      e.stopPropagation()
      return
    }
    const speedBtn = target.closest<HTMLButtonElement>('[data-meteor-speed]')
    if (speedBtn) {
      const speed = speedBtn.dataset.meteorSpeed
      if (METEOR_SPEEDS.includes(speed as MeteorSpeed)) {
        writeMeteorSpeed(speed as MeteorSpeed)
        applyMeteorSpeed(document, speed as MeteorSpeed)
        el.querySelectorAll<HTMLButtonElement>('[data-meteor-speed]').forEach(button => {
          const active = button.dataset.meteorSpeed === speed
          button.dataset.active = String(active)
          button.setAttribute('aria-checked', String(active))
        })
      }
      e.stopPropagation()
      return
    }
    const ambienceBtn = target.closest<HTMLElement>('.dsh-bloom-icon-choice[data-preset]')
    if (ambienceBtn) {
      e.stopPropagation()
      const row = ambienceBtn.closest<HTMLElement>('.dsh-bloom-ambience')
      const scheme = row?.dataset.scheme as Scheme | undefined
      if (row && scheme && writeAmbience(scheme, ambienceBtn.dataset.preset ?? '')) {
        row.querySelectorAll<HTMLElement>('.dsh-bloom-icon-choice[data-preset]').forEach((b) => {
          const on = b === ambienceBtn
          b.dataset.active = String(on)
          b.setAttribute('aria-checked', String(on))
        })
      }
      return
    }
    const motionBtn = target.closest<HTMLButtonElement>('[data-motion]')
    if (motionBtn) {
      e.stopPropagation()
      const on = motionBtn.dataset.motion === 'on'
      applyMotion(on)
      el.querySelectorAll<HTMLButtonElement>('[data-motion]').forEach(b => {
        const active = (b.dataset.motion === 'on') === on
        b.dataset.active = String(active)
        b.setAttribute('aria-checked', String(active))
      })
      return
    }
    const glassBtn = target.closest<HTMLElement>('.dsh-bloom-icon-choice[data-glass]')
    if (glassBtn) {
      const mode = glassBtn.dataset.glass as GlassMaterial
      if ((GLASS_MODES as readonly string[]).includes(mode)) {
        writeGlassMode(mode)
        syncGlassRow(el)
      }
      e.stopPropagation()
      return
    }
  }
  el.addEventListener('change', onChange)
  el.addEventListener('click', onClick)
  syncGlassRow(el)
  return () => {
    el.removeEventListener('change', onChange)
    el.removeEventListener('click', onClick)
  }
}

/**
 * 把玻璃档位行同步成当前状态（与 switcher 同一份实现，避免两处漂移）。
 *
 * 三个要点：
 *   1. 选中态标实际生效的档位，auto 时也亮一格；状态文案说明每档改变了什么。
 *   2. 系统降级了但用户没动过时，要**说清楚**：不然用户看到界面变实底，
 *      以为插件坏了。提示语说明「系统已开启降低透明度」，并给出「仍要毛玻璃」的做法。
 *   3. 提示只在系统确实要求降透明、且用户没显式选过档位时出现。
 */
export function syncGlassRow(el: HTMLElement) {
  // 面板里有多个 .dsh-bloom-icon-seg（质感 / 流星颜色 / 密度 / 速度 / 动效），
  // 质感段是**第一个含 data-glass 按钮**的段，不靠顺序猜。
  const seg = Array.from(el.querySelectorAll<HTMLElement>('.dsh-bloom-icon-seg'))
    .find((node) => node.querySelector('[data-glass]'))
  if (!seg) return
  const stored = readGlassMode()
  const effective = effectiveGlassMode()
  const shown = stored === 'auto' ? (effective === 'solid' ? 'liquid' : effective) : stored
  for (const btn of Array.from(seg.querySelectorAll<HTMLElement>('.dsh-bloom-icon-choice[data-glass]'))) {
    const on = btn.dataset.glass === shown
    btn.dataset.active = String(on)
    btn.setAttribute('aria-checked', String(on))
  }
  const hint = el.querySelector<HTMLElement>('[data-glass-hint]')
  if (!hint) return
  const systemDowngraded = effective === 'solid'
  hint.hidden = !systemDowngraded
  if (systemDowngraded) {
    hint.textContent = tr('系统设置已降低透明效果；已保留你的质感选择。')
  }
}
