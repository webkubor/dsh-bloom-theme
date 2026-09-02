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
import { currentIsDark, hasSettingsEntry, setMode, type AppearanceMode } from './appearance.js'
import { enableFloatingDrag, clearFloatingPos } from './drag.js'
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
  // 应用变体本身的所有副作用（写 body 属性 / 同步下拉胶囊 / 写 localStorage）。
  // 拆出来单独跑，让 View Transition 在它前后各捕一帧：CSS 变量整体替换的
  // 「瞬切」变成整页 cross-fade，让颜色"流过去"。动画时长 / 缓动由
  // css/component.ts 的 ::view-transition-* 控制（320ms）。
  const apply = () => {
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
    // 面板头部也有一份「当前配色」胶囊，不同步就会和列表里的对勾对不上
    const headName = root.querySelector<HTMLElement>('[data-head-name]')
    if (headName) headName.textContent = VARIANT_LABELS[variant].zh
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
  <button type="button" class="dsh-bloom-trigger" aria-haspopup="dialog" aria-expanded="false" title="Bloom 主题 · v${PLUGIN_VERSION}">
    <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
    <span class="dsh-bloom-trigger__name">${VARIANT_LABELS[currentVariant].zh}</span>
    <svg class="dsh-bloom-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="dsh-bloom-menu" role="dialog" aria-label="Bloom 外观设置" hidden>
    <div class="dsh-bloom-head">
      <span class="dsh-bloom-head__title">外观</span>
      <span class="dsh-bloom-head__current">
        <span class="dsh-bloom-dot" style="${dotStyle(currentVariant)}"></span>
        <span data-head-name>${VARIANT_LABELS[currentVariant].zh}</span>
      </span>
      <button type="button" class="dsh-bloom-close" aria-label="关闭">✕</button>
    </div>
    <div class="dsh-bloom-section">主题</div>
    <div class="dsh-bloom-options" role="listbox" aria-label="配色">${options}</div>
    <div class="dsh-bloom-section" data-mode-section hidden>模式</div>
    <div class="dsh-bloom-appearance" role="group" aria-label="深浅模式" hidden>
      <div class="dsh-bloom-appearance__seg">
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="light">浅色</button>
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="dark">深色</button>
        <button type="button" class="dsh-bloom-appearance__btn" data-mode="system">跟随系统</button>
      </div>
    </div>
    <button type="button" class="dsh-bloom-more" aria-expanded="false">
      <span>版本与更新</span>
      <svg class="dsh-bloom-more__arrow" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M4 2l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="dsh-bloom-more-body" hidden>
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
          <span class="dsh-bloom-dsh-spacer"></span>
          <button type="button" class="dsh-bloom-dsh-btn" data-act="refresh" title="重新检查 DSH 最新版">↻</button>
          <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-dsh-btn--primary" data-act="copy" title="检查到可用版本后复制精确升级命令">复制</button>
        </div>
        <div class="dsh-bloom-dsh-row dsh-bloom-dsh-row--latest">
          <span class="dsh-bloom-dsh-label">最新</span>
          <span class="dsh-bloom-dsh-ver" data-dsh-latest>检查中…</span>
        </div>
        <div class="dsh-bloom-dsh-hint" data-dsh-hint hidden></div>
      </div>
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

/**
 * 把外观行的选中态与宿主对齐。
 *
 * 每次打开菜单都重读，而不是缓存：用户可能刚从设置面板里改过，
 * 也可能「跟随系统」下系统主题变了 —— 缓存必然对不上。
 * 宿主按钮找不到（DSH 换了实现）就整行隐藏，宁可没有也不要一个点不动的控件。
 */
function syncAppearanceRow(el: HTMLElement) {
  const row = el.querySelector<HTMLElement>('.dsh-bloom-appearance')
  if (!row) return
  // 显隐只看「有没有设置入口」—— 宿主那三个按钮跟随面板生灭，平时不在 DOM 里，
  // 拿它们当判据这行会永远隐藏（2026-09-10 走过这个弯路）。
  const sec = el.querySelector<HTMLElement>('[data-mode-section]')
  const ok = hasSettingsEntry()
  row.hidden = !ok
  if (sec) sec.hidden = !ok      // 标题跟着内容走，不留一个空的「模式」
  if (!ok) return
  // 选中态同理：面板关着读不到 selected 类，用 body 标记推断深浅。
  // 「跟随系统」无法从 body 反推，所以它不标选中 —— 宁可不标，也不标错。
  const dark = currentIsDark()
  for (const btn of Array.from(row.querySelectorAll<HTMLElement>('.dsh-bloom-appearance__btn'))) {
    const m = btn.dataset.mode as AppearanceMode
    const on = (m === 'dark' && dark) || (m === 'light' && !dark)
    btn.dataset.active = String(on)
    btn.setAttribute('aria-pressed', String(on))
  }
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
    syncAppearanceRow(el)
    // 打开时把焦点移到当前选中项，键盘用户立刻知道在哪
    const active = menu.querySelector<HTMLElement>('.dsh-bloom-option[data-active="true"]')
      || menu.querySelector<HTMLElement>('.dsh-bloom-option')
    active?.focus()
  }

  el.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('.dsh-bloom-close')) { closeMenu(el); return }
    const more = target.closest<HTMLElement>('.dsh-bloom-more')
    if (more) {
      // 版本与更新默认收起：日常用不到，摊开会把面板撑长（设计图里它就是一行入口）
      const body = el.querySelector<HTMLElement>('.dsh-bloom-more-body')
      const open = body?.hidden ?? false
      if (body) body.hidden = !open
      more.setAttribute('aria-expanded', String(open))
      return
    }
    const modeBtn = target.closest<HTMLElement>('.dsh-bloom-appearance__btn')
    if (modeBtn) {
      // 代点宿主按钮；点不动就把这行藏起来，不给一个按了没反应的控件
      // 切换要开合宿主面板（异步），完事再回读 body 标记刷新选中态
      void setMode(modeBtn.dataset.mode as AppearanceMode).then(() => syncAppearanceRow(el))
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
  // 把宿主的外观按钮叫醒一次（它们懒渲染，设置面板开过才进 DOM）。
  // 放在初始化而不是「打开菜单时」：唤醒要点宿主的设置按钮，那一下会触发
  // document 的 outside-click 把刚展开的菜单关掉。这里做，用户还没开菜单，
  // 面板在左下角闪一下就过去了，之后按钮常驻、菜单里直接可用。
  const existing = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
  const host = findSwitcherHost()
  if (existing) {
    // 已存在但宿主出现了（首屏时 header 还没渲染），迁进去
    if (host && !host.contains(existing)) {
      existing.dataset.floating = 'false'
      // 迁回 header 前必须清掉浮动坐标：fixed 时代的 left/top 残留在
      // inline-flex 元素上会把它顶出顶栏（#14）
      clearFloatingPos(existing)
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
    // 必须在入 DOM 之后：恢复位置要读 offsetWidth/offsetHeight 做视口夹取
    enableFloatingDrag(el)
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
