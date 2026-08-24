/**
 * 顶栏配色切换器 —— 主题唯一的交互控件。
 *
 * 它挂进 DSH 顶栏工具区（findSwitcherHost），找不到宿主时降级为右上角浮空。
 * 键盘可完整操作（role=radiogroup + aria-checked + 方向键），窄屏隐藏中文名。
 */
import { OTHER_VARIANTS, VARIANT_LABELS, PALETTE } from './palette.js'
import { findSwitcherHost, injectCSS, readVariant } from './dom.js'
import { PLUGIN_ID, PLUGIN_VERSION, STORAGE_KEY } from './meta.js'
import { checkUpdate, refreshUpdateBadge, renderDshUpdate, checkDshLatest } from './version.js'
import { SWITCHER_CSS } from './css/switcher.js'
import { VARIANTS } from './palette.js'

/** 变体色点：莫兰迪 → 可读色的双轨渐变，两端都有色（渐变到背景色会褪成白） */
export const dotStyle = (v) =>
  `background:linear-gradient(135deg, rgb(${PALETTE[v].morandi}) 0%, ${PALETTE[v].accentL} 100%)`

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
  document.body.dataset.bloomVariant = variant
  try { window.localStorage.setItem(STORAGE_KEY, variant) } catch {}
  const root = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
  if (!root) return
  root.querySelectorAll<HTMLElement>('.dsh-bloom-option').forEach((el) => {
    const on = el.dataset.variant === variant
    el.setAttribute('data-active', String(on))
    el.setAttribute('aria-selected', String(on))
  })
  const name = root.querySelector<HTMLElement>('.dsh-bloom-trigger__name')
  if (name) name.textContent = VARIANT_LABELS[variant].zh
  const dot = root.querySelector<HTMLElement>('.dsh-bloom-trigger .dsh-bloom-dot')
  if (dot) dot.setAttribute('style', dotStyle(variant))
}

export function buildSwitcherHTML(currentVariant) {
  const options = VARIANTS.map((v) => {
    const on = v === currentVariant
    return `<button type="button" class="dsh-bloom-option" role="option" data-variant="${v}"` +
      ` aria-selected="${on}" data-active="${on}">` +
      `<span class="dsh-bloom-dot" style="${dotStyle(v)}"></span>` +
      `<span class="dsh-bloom-option__name">${VARIANT_LABELS[v].zh}</span>` +
      `<span class="dsh-bloom-option__en">${VARIANT_LABELS[v].en}</span>` +
      `<span class="dsh-bloom-check" aria-hidden="true">✓</span></button>`
  }).join('')
  return `<div class="dsh-bloom-switcher" data-plugin="${PLUGIN_ID}">
  <button type="button" class="dsh-bloom-trigger" aria-haspopup="listbox" aria-expanded="false" title="Bloom 主题 · v${PLUGIN_VERSION}">
    <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
    <span class="dsh-bloom-trigger__name">${VARIANT_LABELS[currentVariant].zh}</span>
    <svg class="dsh-bloom-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="dsh-bloom-menu" role="listbox" aria-label="Bloom 主题变体" hidden>
    ${options}
    <div class="dsh-bloom-version" role="separator">
      <a class="dsh-bloom-version__name" href="https://github.com/webkubor/dsh-bloom-theme" target="_blank" rel="noopener">Bloom</a>
      <span class="dsh-bloom-version__current">v${PLUGIN_VERSION}</span>
      <span class="dsh-bloom-version__update" hidden></span>
    </div>
    <div class="dsh-bloom-dsh-update" role="separator">
      <div class="dsh-bloom-dsh-row">
        <span class="dsh-bloom-dsh-label">DSH</span>
        <span class="dsh-bloom-dsh-ver" data-dsh-current>—</span>
        <span class="dsh-bloom-dsh-state" data-dsh-state></span>
      </div>
      <div class="dsh-bloom-dsh-row">
        <span class="dsh-bloom-dsh-label">最新</span>
        <span class="dsh-bloom-dsh-ver" data-dsh-latest>检查中…</span>
      </div>
      <div class="dsh-bloom-dsh-actions">
        <button type="button" class="dsh-bloom-dsh-btn" data-act="refresh" title="重新检查 DSH 最新版">↻ 检查</button>
        <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-dsh-btn--primary" data-act="copy" title="复制升级命令到剪贴板">复制升级命令</button>
      </div>
      <div class="dsh-bloom-dsh-hint" data-dsh-hint hidden></div>
    </div>
  </div>
</div>`
}

export function closeMenu(root: HTMLElement) {
  const menu = root.querySelector<HTMLElement>('.dsh-bloom-menu')
  const trigger = root.querySelector<HTMLElement>('.dsh-bloom-trigger')
  if (menu) menu.hidden = true
  if (trigger) trigger.setAttribute('aria-expanded', 'false')
}

export function buildSwitcherEl(initialVariant) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = buildSwitcherHTML(initialVariant)
  const el = wrapper.firstElementChild as HTMLElement

  const openMenu = () => {
    const menu = el.querySelector<HTMLElement>('.dsh-bloom-menu')
    const trigger = el.querySelector<HTMLElement>('.dsh-bloom-trigger')
    menu.hidden = false
    trigger.setAttribute('aria-expanded', 'true')
    // 打开时把焦点移到当前选中项，键盘用户立刻知道在哪
    const active = menu.querySelector<HTMLElement>('.dsh-bloom-option[data-active="true"]')
      || menu.querySelector<HTMLElement>('.dsh-bloom-option')
    active?.focus()
  }

  el.addEventListener('click', (e) => {
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

    // 氛围区的文本框/滑杆里，键盘交给输入框本身（只保留 Escape 收起）
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
      case 'Tab':
        // Tab 离开菜单时关闭，避免焦点困在隐藏菜单里
        closeMenu(el)
        break
    }
  })

  // 选项做成可聚焦（listbox 语义要求 option 可接收焦点）
  el.querySelectorAll<HTMLElement>('.dsh-bloom-option').forEach((opt) => {
    opt.setAttribute('tabindex', '-1')
  })

  // 点击外部关闭。挂 document 上，用 el.contains 判断而不是 blur ——
  // blur 会在点菜单项时先触发，导致选不中。
  document.addEventListener('click', (e) => {
    if (!el.contains(e.target as Node)) closeMenu(el)
  })
  return el
}

export function injectSwitcher(initialVariant) {
  injectCSS(SWITCHER_CSS, 'switcher.css')
  refreshUpdateBadge()
  renderDshUpdate()
  void checkDshLatest()
  const existing = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
  const host = findSwitcherHost()
  if (existing) {
    // 已存在但宿主出现了（首屏时 header 还没渲染），迁进去
    if (host && !host.contains(existing)) {
      existing.dataset.floating = 'false'
      host.prepend(existing)
    }
    return
  }
  const el = buildSwitcherEl(initialVariant)
  if (host) {
    el.dataset.floating = 'false'
    host.prepend(el)
  } else {
    el.dataset.floating = 'true'
    document.body.appendChild(el)
  }
}

/**
 * DSH 是 SPA，切会话/改布局会重建 header 子树，把切换器一起删掉。
 * 这里监听并重挂 —— 否则切一次会话主题按钮就没了。
 */
export function watchSwitcher(variant) {
  if (window.__dshBloomObserver__) return
  const reattach = () => {
    if (!document.body) return
    document.body.dataset.bloomVariant = document.body.dataset.bloomVariant || variant
    injectSwitcher(readVariant())
  }
  const obs = new MutationObserver(() => {
    const el = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
    const host = findSwitcherHost()
    // 节点没了，或宿主已就绪但切换器还浮着 → 重挂
    if (!el || (host && !host.contains(el))) reattach()
  })
  obs.observe(document.body, { childList: true, subtree: true })
  window.__dshBloomObserver__ = obs
}
