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
import { currentIsDark, initAppearanceSync, readStoredMode, setMode, type AppearanceMode } from './appearance.js'
import { enableFloatingDrag, clearFloatingPos } from './drag.js'
import { VARIANTS } from './palette.js'
import { tr, variantName, variantPoem, langRowHTML, syncLangRow, getLang, setLang, type BloomLang } from './lang.js'

/** 变体色点：莫兰迪 → 可读色的双轨渐变，两端都有色（渐变到背景色会褪成白） */
export const dotStyle = (v) =>
  `background:linear-gradient(135deg, rgb(${PALETTE[v].morandi}) 0%, ${PALETTE[v].accentL} 100%)`

/** 诗句渐变：和色点同一对颜色，深浅两套各给一个变量，由 CSS 按 body 的深色标记挑。 */
export const poemStyle = (v) =>
  `--bloom-poem-a:rgb(${PALETTE[v].morandi});--bloom-poem-b:${PALETTE[v].accentL};--bloom-poem-bd:${PALETTE[v].accentD}`

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
const ICON_VOTE = icon('<rect x="1.9" y="1.9" width="10.2" height="10.2" rx="2.4"/><path d="M4.5 7.1l1.8 1.8 3.3-3.7"/>')
const ICON_CHAT = icon('<path d="M12.1 8.1a1.8 1.8 0 0 1-1.8 1.8H5.6L2.9 12.1V3.7a1.8 1.8 0 0 1 1.8-1.8h5.6a1.8 1.8 0 0 1 1.8 1.8z"/>')
const ICON_SHARE = icon('<circle cx="10.5" cy="3.3" r="1.6"/><circle cx="3.5" cy="7" r="1.6"/><circle cx="10.5" cy="10.7" r="1.6"/><path d="M4.9 6.2l4.2-2.2M4.9 7.8l4.2 2.2"/>')

/** 分享文案：对方原样贴进自己的 DSH 就能装上，不需要再问「怎么装」。
 *
 *  ⚠️ 2026-10-12 改：原文案写死 `--profile web` 和 `~/.dsh/profiles/web/`。那个
 *  profile 已于 2026-10-02 退役，当前宿主是桌面端 app（profile `desktop`，由 app
 *  独占托管，CLI 的 `dsh plugin --profile desktop` 会被直接拒绝）。照原文案操作的人
 *  只会得到一条报错。两条路都写出来：app 里走插件管理，自建 profile 走 CLI 且 profile
 *  名必须自己填（写死任何具体名字都是给一份必然过期的指令）。
 */
const buildShareText = () => [
  tr('Bloom —— DSH 的中国风配色主题：10 套诗词命名的莫兰迪配色，深浅色自适应，顶栏一键切换。'),
  tr('装到你的 DSH：'),
  tr('  · 桌面端 app：在应用内的「插件管理」里搜 dsh-bloom-theme 直接装'),
  tr('    （app 独占托管 desktop profile，CLI 的 dsh plugin --profile desktop 会被拒）'),
  tr('  · 自建 CLI profile：dsh plugin --profile <你的profile名> add dsh-bloom-theme'),
  tr('    然后确认 "dsh-bloom-theme" 在该 profile 的 package.json 的 dsh.profile.bundles 里（plugin add 会自动加），重启 DSH'),
  tr('仓库：https://github.com/webkubor/dsh-bloom-theme'),
].join('\n')

/** 复制分享文案；就地把按钮文字换成「已复制」给反馈（视线在按钮上，改别处等于没反馈）。 */
async function shareInstall(btn: HTMLElement) {
  // 只改文字那个 span —— 直接写 btn.textContent 会把 svg 图标一起擦掉。
  const SHARE_TEXT = buildShareText()
  const slot = btn.querySelector('span') ?? btn
  const label = slot.textContent
  let ok = false
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(SHARE_TEXT); ok = true }
  } catch {}
  if (!ok) {
    const ta = document.createElement('textarea')
    ta.value = SHARE_TEXT; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    try { ok = document.execCommand('copy') } catch {}
    ta.remove()
  }
  slot.textContent = ok ? tr('已复制') : tr('复制失败')
  setTimeout(() => { slot.textContent = label }, 1600)
}

export function buildSwitcherHTML(currentVariant) {
  const options = VARIANTS.map((v) => {
    const on = v === currentVariant
    return `<button type="button" class="dsh-bloom-option" role="option" data-variant="${v}"` +
      ` aria-selected="${on}" data-active="${on}">` +
      `<span class="dsh-bloom-dot" style="${dotStyle(v)}"></span>` +
      `<span class="dsh-bloom-option__name">${variantName(v)}</span>` +
      `<span class="dsh-bloom-option__en" style="${poemStyle(v)}">${variantPoem(v)}</span>` +
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
  <div class="dsh-bloom-menu" role="dialog" aria-label="${tr('Bloom 外观设置')}" hidden>
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
    ${langRowHTML(getLang())}
    <button type="button" class="dsh-bloom-more" aria-expanded="false">
      <span>${tr('版本与更新')}</span>
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
          <button type="button" class="dsh-bloom-dsh-btn" data-act="refresh" title="${tr('重新检查 DSH 最新版')}">↻</button>
          <button type="button" class="dsh-bloom-dsh-btn dsh-bloom-dsh-btn--primary" data-act="copy" title="${tr('检查到可用版本后，把升级命令直接填进下方输入框')}">${tr('填入')}</button>
        </div>
        <div class="dsh-bloom-dsh-row dsh-bloom-dsh-row--latest">
          <span class="dsh-bloom-dsh-label">${tr('最新')}</span>
          <span class="dsh-bloom-dsh-ver" data-dsh-latest>${tr('检查中…')}</span>
        </div>
        <div class="dsh-bloom-dsh-hint" data-dsh-hint hidden></div>
      </div>
    </div>
    <div class="dsh-bloom-foot">
      <a class="dsh-bloom-foot__link" href="https://github.com/webkubor/dsh-bloom-theme/discussions/26" target="_blank" rel="noopener" title="${tr('为你喜欢的配色点赞投票，或提议新色')}">${ICON_VOTE}<span>${tr('配色投票')}</span></a>
      <span class="dsh-bloom-foot__sep" aria-hidden="true">·</span>
      <a class="dsh-bloom-foot__link" href="https://github.com/webkubor/dsh-bloom-theme/issues" target="_blank" rel="noopener" title="${tr('报问题 / 提建议')}">${ICON_CHAT}<span>${tr('反馈')}</span></a>
      <span class="dsh-bloom-foot__sep" aria-hidden="true">·</span>
      <button type="button" class="dsh-bloom-foot__link dsh-bloom-share" title="${tr('复制一段话，对方贴进自己的 DSH 就能装上 Bloom')}">${ICON_SHARE}<span>${tr('分享')}</span></button>
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
    if (body) body.hidden = false
  }
  const name = el.querySelector<HTMLElement>('.dsh-bloom-trigger__name')
  if (name) name.textContent = variantName(variant)
  const trigger = el.querySelector<HTMLElement>('.dsh-bloom-trigger')
  if (trigger) trigger.setAttribute('title', tr('Bloom 主题 · v{0}', PLUGIN_VERSION))
  syncAppearanceRow(el)
  syncLangRow(el)
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
    syncLangRow(el)
    // 打开时把焦点移到当前选中项，键盘用户立刻知道在哪
    const active = menu.querySelector<HTMLElement>('.dsh-bloom-option[data-active="true"]')
      || menu.querySelector<HTMLElement>('.dsh-bloom-option')
    active?.focus()
  }

  el.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('.dsh-bloom-close')) { closeMenu(el); return }
    const share = target.closest<HTMLElement>('.dsh-bloom-share')
    if (share) {
      e.stopPropagation()
      void shareInstall(share)
      return
    }
    const more = target.closest<HTMLElement>('.dsh-bloom-more')
    if (more) {
      // 版本与更新默认收起：日常用不到，摊开会把面板撑长（设计图里它就是一行入口）
      const body = el.querySelector<HTMLElement>('.dsh-bloom-more-body')
      const open = body?.hidden ?? false
      if (body) body.hidden = !open
      more.setAttribute('aria-expanded', String(open))
      return
    }
    const modeBtn = target.closest<HTMLElement>('.dsh-bloom-appearance__btn[data-mode]')
    if (modeBtn) {
      // 直接切 body 属性 + 持久化，零弹窗。同步完成，立刻刷新选中态。
      setMode(modeBtn.dataset.mode as AppearanceMode)
      syncAppearanceRow(el)
      return
    }
    const langBtn = target.closest<HTMLElement>('[data-lang]')
    if (langBtn) {
      // 换语言只影响显示：配色、已存的 variant、颜色对比结论一概不动。
      // stopPropagation 不能省：下面重建菜单会把被点的按钮换掉，等事件冒泡到
      // document 上的「点外部关闭」时 el.contains(target) 已经是 false，菜单会自己关掉。
      e.stopPropagation()
      setLang(langBtn.dataset.lang as BloomLang)
      rerenderMenu(el, readVariant())
      el.querySelector<HTMLElement>(`[data-lang="${getLang()}"]`)?.focus()
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
