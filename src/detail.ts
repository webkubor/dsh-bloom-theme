/**
 * 细节配置行 —— 设置页「Bloom 外观」（settings.section）专属内容。
 *
 * 下拉菜单只留「主题 + 模式」，细节配置（质感、背景氛围、流星、自动换色、动效、
 * 版本与更新、诊断、遥测、分享）全部收敛到这里。
 *
 * 事件委托按容器绑定（不是绑死 switcher 根），同一套 HTML 在测试夹具或
 * 设置页里都能跑；状态同步函数从 switcher 复用，避免两处漂移。
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

/** One segmented row per scheme; CSS shows the row matching the host scheme. */
export function ambienceRows(): string {
  return (Object.keys(AMBIENCE_PRESETS) as Scheme[]).map((scheme) => {
    const current = readAmbience(scheme)
    const buttons = AMBIENCE_PRESETS[scheme].map((preset) =>
      `<button type="button" class="dsh-bloom-ambience__btn" data-preset="${preset}" role="radio" aria-checked="${preset === current}" data-active="${preset === current}">${tr(AMBIENCE_LABELS[preset])}</button>`).join('')
    const hint = scheme === 'dark' ? tr('深色背景') : tr('浅色背景')
    return `<div class="dsh-bloom-ambience" data-scheme="${scheme}" role="radiogroup" aria-label="${hint}">${buttons}</div>`
  }).join('')
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
  return `<div class="dsh-bloom-section">${tr('质感')}</div>
    <div class="dsh-bloom-glass" role="group" aria-label="${tr('质感')}">
      <div class="dsh-bloom-glass__choices">
        ${GLASS_MODES.map((mode) => `<button type="button" class="dsh-bloom-glass__choice" data-glass="${mode}">${tr(mode === 'frosted' ? '毛玻璃' : mode === 'matte' ? '磨砂玻璃' : '液态玻璃')}</button>`).join('')}
      </div>
      <p class="dsh-bloom-glass__hint" data-glass-hint hidden></p>
    </div>
    <div class="dsh-bloom-section">${tr('背景')}</div>
    ${ambienceRows()}
    <div class="dsh-bloom-meteor-opt" data-meteor-row="color" role="radiogroup" aria-label="${tr('流星颜色')}">
      <span>${tr('流星颜色')}</span>
      ${(['solid', 'colorful'] as const).map(mode => `<button type="button" data-meteor-color="${mode}" role="radio" aria-checked="${readMeteorColorMode() === mode}" data-active="${readMeteorColorMode() === mode}">${tr(mode === 'solid' ? '纯色' : '彩色')}</button>`).join('')}
    </div>
    <div class="dsh-bloom-meteor-opt" data-meteor-row="density" role="radiogroup" aria-label="${tr('流星密度')}">
      <span>${tr('流星密度')}</span>
      ${METEOR_DENSITIES.map(density => `<button type="button" data-meteor-density="${density}" role="radio" aria-checked="${readMeteorDensity() === density}" data-active="${readMeteorDensity() === density}">${tr(density === 'sparse' ? '稀疏' : density === 'dense' ? '密集' : '标准')}</button>`).join('')}
    </div>
    <div class="dsh-bloom-meteor-opt" data-meteor-row="speed" role="radiogroup" aria-label="${tr('流星速度')}">
      <span>${tr('流星速度')}</span>
      ${METEOR_SPEEDS.map(speed => `<button type="button" data-meteor-speed="${speed}" role="radio" aria-checked="${readMeteorSpeed() === speed}" data-active="${readMeteorSpeed() === speed}">${tr(speed === 'slow' ? '慢' : speed === 'fast' ? '快' : '标准')}</button>`).join('')}
    </div>
    <label class="dsh-bloom-rotation">${tr('自动换色')}
      <select class="dsh-bloom-rotation__select" aria-label="${tr('自动换色')}">
        ${rotationOptions}
      </select>
    </label>
    <div class="dsh-bloom-rotation dsh-bloom-motion-row"><span class="dsh-bloom-rotation__label">${tr('动效')}</span>
      <span class="dsh-bloom-motion-seg">
        <button type="button" class="dsh-bloom-motion-btn" data-motion="on" role="radio" aria-checked="${readMotion()}" data-active="${readMotion()}">${tr('开启')}</button>
        <button type="button" class="dsh-bloom-motion-btn" data-motion="off" role="radio" aria-checked="${!readMotion()}" data-active="${!readMotion()}">${tr('停用')}</button>
      </span>
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
    const glassBtn = target.closest<HTMLElement>('.dsh-bloom-glass__choice[data-glass]')
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
