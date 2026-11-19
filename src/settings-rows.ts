/**
 * 「Bloom 外观」设置页的行结构 —— 给宽栏用的卡片分组，不是下拉菜单的行。
 *
 * 为什么不直接搬下拉的行：那些行是为窄栏设计的（标题与控件挤在一行、
 * 圆角 7px、上下 padding 4px）。搬进设置面板后每行都像被拉扁的表单控件，
 * 没有分组、没有留白、看不出哪几项属于一组。
 *
 * 结构：
 *   .dsh-bloom-card            一组设置（卡片）
 *     .dsh-bloom-card__head    组标题 + 说明
 *     .dsh-bloom-card__row     一项设置：标题在左，控件在右
 *   宽度敏感的行（流星三档）单独成组，因为它们是 radiogroup。
 */
import { tr } from './lang.js'
import {
  GLASS_MODES,
  effectiveGlassMode,
  readGlassMode,
  systemPrefersReducedTransparency,
  type GlassMaterial,
} from './glass.js'
import {
  METEOR_DENSITIES,
  METEOR_SPEEDS,
  readMeteorColorMode,
  readMeteorDensity,
  readMeteorSpeed,
} from './starlight.js'
import { readRotationMinutes, ROTATION_MINUTES } from './rotation.js'
import { readAmbience, AMBIENCE_PRESETS, type Scheme } from './ambience.js'
import { readMotion } from './dom.js'

const GLASS_LABEL: Record<GlassMaterial, string> = {
  frosted: '毛玻璃',
  matte: '磨砂玻璃',
  liquid: '液态玻璃',
}
const DENSITY_LABEL: Record<string, string> = { sparse: '稀疏', standard: '标准', dense: '密集' }
const SPEED_LABEL: Record<string, string> = { slow: '慢', standard: '标准', fast: '快' }

export const AMBIENCE_LABELS: Record<string, string> = {
  diagonal: '对角漫染', galaxy: '漫天星辰', corner: '角落微光',
  stream: '斜光流转', wash: '水彩晕染', clear: '清透留白', off: '不显示',
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!
))

/** 一个设置项：左标题 + 右控件。 */
function row(label: string, control: string, hint?: string): string {
  return `<div class="dsh-bloom-card__row">
      <div class="dsh-bloom-card__label">
        <span class="dsh-bloom-card__name">${esc(label)}</span>
        ${hint ? `<span class="dsh-bloom-card__hint">${esc(hint)}</span>` : ''}
      </div>
      <div class="dsh-bloom-card__control">${control}</div>
    </div>`
}

/** 分段按钮组（radio 语义）。 */
function segment(
  group: string,
  attr: string,
  items: { value: string; label: string; active: boolean }[],
): string {
  return `<div class="dsh-bloom-seg" role="radiogroup" aria-label="${esc(group)}">
      ${items.map((it) => `<button type="button" class="dsh-bloom-seg__btn" ${attr}="${it.value}" role="radio" aria-checked="${it.active}" data-active="${it.active}">${esc(it.label)}</button>`).join('')}
    </div>`
}

/** 背景预设（深浅各一套，只显示当前 scheme 那套）。 */
function ambienceControl(): string {
  const schemes: Scheme[] = ['light', 'dark']
  return schemes.map((scheme) => {
    const current = readAmbience(scheme)
    const btns = AMBIENCE_PRESETS[scheme].map((preset) =>
      `<button type="button" class="dsh-bloom-seg__btn dsh-bloom-seg__btn--swatch" data-preset="${preset}" role="radio" aria-checked="${preset === current}" data-active="${preset === current}" data-preset-label="${esc(AMBIENCE_LABELS[preset])}"><span class="dsh-bloom-swatch" data-swatch="${preset}" aria-hidden="true"></span><span class="dsh-bloom-seg__label">${esc(AMBIENCE_LABELS[preset])}</span></button>`).join('')
    return `<div class="dsh-bloom-ambience" data-scheme="${scheme}" role="radiogroup" aria-label="${scheme === 'dark' ? esc(tr('深色背景')) : esc(tr('浅色背景'))}" hidden="${scheme !== 'light'}">${btns}</div>`
  }).join('')
}

/** 设置页的完整 HTML。 */
export function buildSettingsHTML(): string {
  const glass = effectiveGlassMode()
  const glassHint = glass === 'frosted' && systemPrefersReducedTransparency()
    ? tr('系统开启了「减少透明度」，已自动使用磨砂玻璃')
    : ''
  const rotationOptions = ROTATION_MINUTES.map((m) =>
    `<option value="${m}"${readRotationMinutes() === m ? ' selected' : ''}>${m === 0 ? tr('关闭自动换色') : tr('每 {0} 分钟', m)}</option>`).join('')
  const motion = readMotion()

  return `
  <div class="dsh-bloom-settings">
    <header class="dsh-bloom-settings__head">
      <h2 class="dsh-bloom-settings__title">${esc(tr('Bloom 外观'))}</h2>
      <p class="dsh-bloom-settings__sub">${esc(tr('质感、背景与动效。改完即时生效。'))}</p>
    </header>

    <section class="dsh-bloom-card">
      <div class="dsh-bloom-card__head">
        <h3 class="dsh-bloom-card__title">${esc(tr('质感'))}</h3>
      </div>
      ${row(tr('材质'), segment(tr('质感'), 'data-glass', (Object.keys(GLASS_MODES) as GlassMaterial[]).map((m) => ({
        value: m, label: tr(GLASS_LABEL[m]), active: m === glass,
      }))), glassHint)}
    </section>

    <section class="dsh-bloom-card">
      <div class="dsh-bloom-card__head">
        <h3 class="dsh-bloom-card__title">${esc(tr('背景'))}</h3>
      </div>
      ${row(tr('效果'), ambienceControl())}
    </section>

    <section class="dsh-bloom-card" data-meteor-card hidden>
      <div class="dsh-bloom-card__head">
        <h3 class="dsh-bloom-card__title">${esc(tr('流星'))}</h3>
        <span class="dsh-bloom-card__badge">${esc(tr('仅深色'))}</span>
      </div>
      ${row(tr('颜色'), segment(tr('流星颜色'), 'data-meteor-color', [
        { value: 'solid', label: tr('纯色'), active: readMeteorColorMode() === 'solid' },
        { value: 'colorful', label: tr('彩色'), active: readMeteorColorMode() === 'colorful' },
      ]))}
      ${row(tr('密度'), segment(tr('流星密度'), 'data-meteor-density', METEOR_DENSITIES.map((d) => ({
        value: d, label: tr(DENSITY_LABEL[d]), active: d === readMeteorDensity(),
      }))))}
      ${row(tr('速度'), segment(tr('流星速度'), 'data-meteor-speed', METEOR_SPEEDS.map((s) => ({
        value: s, label: tr(SPEED_LABEL[s]), active: s === readMeteorSpeed(),
      }))))}
    </section>

    <section class="dsh-bloom-card">
      <div class="dsh-bloom-card__head">
        <h3 class="dsh-bloom-card__title">${esc(tr('动效'))}</h3>
      </div>
      ${row(tr('自动换色'), `<select class="dsh-bloom-select dsh-bloom-rotation__select" aria-label="${esc(tr('自动换色'))}">${rotationOptions}</select>`)}
      ${row(tr('界面动效'), segment(tr('动效'), 'data-motion', [
        { value: 'on', label: tr('开启'), active: motion },
        { value: 'off', label: tr('停用'), active: !motion },
      ]))}
    </section>
  </div>`
}
