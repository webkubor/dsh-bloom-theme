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
 * 设计：mist 完整覆盖（alias 主色 + 灰阶 + 状态 + markdown + specific 组件）;
 *       其它 3 变体覆盖 accent + bg/text/surface + specific 组件（继承 mist 的
 *       灰阶骨架，主色和背景调性变，布局/字号/间距不动）——保持视觉一致性 +
 *       一目了然的主色差异。
 *
 * 变量体系（来自 dsh-client-ui-theme/lib/styles/design-platform.css）：
 *   --dsw-alias-*    语义别名（文字/背景/边框/按钮/状态/markdown/滚动条）
 *   --dsw-specific-* 具体组件（消息气泡/侧栏/输入区/菜单/选择器/tip）
 *   必须两层都接管，否则气泡、侧栏、输入区会回落到 DSH 默认的蓝灰调，
 *   跟 Bloom 色板打架——这正是「换了色还是丑」的根源。
 */


/** package.json 的 immediately 保证 loader 激活；所有页面副作用由 apply 的 effect 持有。 */
import { PLUGIN_ID, PLUGIN_VERSION } from './meta.js'
import { buildBloomCSS } from './tokens.js'
import { COMPONENT_CSS } from './css/component.js'
import { GLASS_CSS } from './css/glass.js'
import { BACKGROUND_CSS } from './css/background.js'
import { BUTTON_CSS } from './css/button.js'
import { ADAPTIVE_CSS } from './css/adaptive.js'
import { SURFACES_CSS } from './css/surfaces.js'
import { applyMotion, injectCSS, readMotion, readVariant, watchThinkTags } from './dom.js'
import { initAppearanceSync, bindHostTheme, type HostThemeService } from './appearance.js'
import { initAmbience } from './ambience.js'
import { initGlassMode } from './glass.js'
import { createBloomComponents, type HostReact } from './ui.js'
import { initTypingGlow } from './typing.js'
import { checkUpdate, setVersionUpdatesActive } from './version.js'
import { teardownBloom } from './teardown.js'
import { collectDiagnostics, copyDiagnostics } from './diagnostics.js'
import { bindBloomInspect } from './inspect.js'
import { tr, LANG_CHANGE_EVENT, bindLocale, DICTS, LOCALE_NS } from './lang.js'

/**
 * 鼠标跟随光斑（v0.15 唯一的亮点）。
 *
 * 性能：mousemove 每秒可能触发 60+ 次，每次写两个 CSS var（CPU 几乎为零，
 * GPU 用 background-position 插值，文本不重绘）。
 * 退出时（变体切换到非 aurora/cinnabar / 切走标签页）解绑监听 —— 不留幽灵。
 */
function watchCursorGlow() {
  if (window.__dshBloomCursorBound__) return
  window.__dshBloomCursorBound__ = true

  let raf = 0
  const write = (x, y) => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      const root = document.documentElement
      root.style.setProperty('--bloom-cursor-x', `${x * 100}%`)
      root.style.setProperty('--bloom-cursor-y', `${y * 100}%`)
    })
  }

  const onMove = (e) => {
    const v = document.body?.dataset.bloomVariant
    if (v !== 'aurora' && v !== 'cinnabar') return
    write(e.clientX / window.innerWidth, e.clientY / window.innerHeight)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.__dshBloomCursorOff__ = () => {
    window.removeEventListener('pointermove', onMove)
    if (raf) cancelAnimationFrame(raf)
    window.__dshBloomCursorBound__ = false
    window.__dshBloomCursorOff__ = undefined
  }
}

function installSkin(): () => void {
  let disposed = false
  const controller = new AbortController()
  const boot = () => {
    if (disposed) return
    const variant = readVariant()
    injectCSS(buildBloomCSS(), 'bloom.css')
    injectCSS(COMPONENT_CSS, 'components.css')
    injectCSS(GLASS_CSS + BACKGROUND_CSS + BUTTON_CSS, 'glass.css')
    injectCSS(ADAPTIVE_CSS + SURFACES_CSS, 'adaptive.css')
    document.body.dataset.bloomVariant = variant
    applyMotion(readMotion())
    initAppearanceSync()
    initAmbience()
    window.__dshBloomGlassOff__ ??= initGlassMode()
    setVersionUpdatesActive(true)
    void checkUpdate(controller.signal)
    watchThinkTags()
    watchCursorGlow()
    window.__BLOOM_DEBUG__ = { dump: collectDiagnostics, copy: () => copyDiagnostics() }
  }
  if (document.body) boot()
  else document.addEventListener('DOMContentLoaded', boot, { once: true })
  return () => {
    disposed = true
    controller.abort()
    document.removeEventListener('DOMContentLoaded', boot)
    teardownBloom()
  }
}

/**
 * 宿主「插件管理」服务句柄 —— 让更新横幅能在**应用内直接更新**，不用终端。
 *
 * 为什么要有（2026-10-31 owner「能不能做到自动更新」）：
 *   横幅原来只有「复制更新命令」。但桌面端 profile 由 Electron 应用独占托管，
 *   `dsh plugin --profile desktop` 会被 CLI 直接拒绝（bin.js:36），
 *   也就是说**桌面端用户复制到的命令必然报错** —— 主按钮是死的。
 *   DSH 把插件管理能力作为普通服务暴露（remote.pluginManager），
 *   installBundle 不允许覆盖已有主题（HMR 下返回 already-installed）。新版宿主
 *   提供 updateBundle(name, version) 来负责卸载、安装和失败恢复；旧宿主没有此
 *   API 时只引导插件管理。结果先解 RemoteResult，再读 PluginUpdateResult.result；
 *   绝不能把 Promise 正常完成或已恢复旧版显示成更新成功。
 *
 * ⚠️ 契约：cordis 的 ctx 是 Proxy，读没在 inject 里声明的服务会直接抛
 *   （2026-10-30 事故）。所以这里一律走 `ctx.inject([...], cb)` 可选注入，
 *   旧版桌面端指向插件管理，非桌面宿主继续提供复制命令。
 */
/** A failure whose text is one of our own dictionary keys; host diagnostics stay verbatim. */
class UpdateFailure extends Error {
  constructor(readonly key: string, readonly localizable: boolean) { super(key) }
}
type UpdateOutcome = {
  application: 'applied' | 'restart-required' | 'failed' | 'cancelled' | 'overridden'
  error?: { code: string; diagnostic?: string }
}
type PluginUpdateResult = { to: string; step: 'check' | 'remove' | 'install'; result: UpdateOutcome; restore?: UpdateOutcome }
type RemoteUpdateResult = { ok: true; value: PluginUpdateResult } | { ok: false; error: { message: string } }
let pluginManager: {
  updateBundle?: (name: string, version: string) => Promise<RemoteUpdateResult>
} | null = null
let layout: { selectPanel(id: string): void } | null = null
let refreshUpdateCapability: (() => void) | undefined

function bindPluginManager(ctx: any) {
  if (typeof ctx?.inject !== 'function') return
  // ⚠️ 两个名字都要声明：cordis 里 `remote.pluginManager` 不会顺带声明父服务 `remote`，
  //   只写后者时 `scope.remote` 会抛 without inject（宿主自己的插件面板也是两个都列）。
  ctx.inject(['remote', 'remote.pluginManager'], (scope: any) => {
    const service = scope?.remote?.pluginManager
    if (service && typeof service.updateBundle === 'function') {
      scope.effect(() => {
        pluginManager = service
        refreshUpdateCapability?.()
        return () => {
          if (pluginManager === service) {
            pluginManager = null
            refreshUpdateCapability?.()
          }
        }
      })
    }
  })
}

/** ── 更新检测：npm 有新版本时提醒老用户 ─────────────────────────────────────
 *
 * 背景：主题插件装在 DSH profile 的 node_modules 里，用户不会主动升级；
 * 发了新版（新变体/修 bug）老用户无感知。这里做被动提醒。
 *
 * 机制（全部浏览器端，零 node 侧依赖）：
 *   1. 「当前版本」来自 PLUGIN_VERSION 常量（scripts/sync-version.mjs 随发版自动同步）
 *   2. 「最新版本」查 https://registry.npmjs.org/dsh-bloom-theme/latest
 *      取响应里的 version 字段。⚠️ 必须用这个端点：npm registry 只有完整
 *      manifest 端点带 CORS 头（access-control-allow-origin: *），精简的
 *      /-/package/<id>/dist-tags 端点不带，浏览器会拦 —— 实测过别改回去。
 *   3. 24h 节流：结果缓存在 localStorage，一天最多查一次（远端浏览器无持久化时降级为每次查）
 *   4. 用户关掉的版本不再弹（新版本号出现后重新弹一次）
 *   5. 一切失败静默：断网/CORS 被拦/registry 抽风都不影响主题本身
 */
function installUpdateCheck(host: HTMLElement) {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return
  let disposed = false
  const controller = new AbortController()
  const timers = new Set<ReturnType<typeof setTimeout>>()
  const later = (fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer)
      if (!disposed) fn()
    }, ms)
    timers.add(timer)
    return timer
  }

  const REGISTRY = 'https://registry.npmjs.org/' + PLUGIN_ID + '/latest'
  const CHECK_TTL_MS = 24 * 60 * 60 * 1000
  const LS_LAST = 'dsh-bloom-update-check'      // { at, latest } 上次检查
  const LS_DISMISSED = 'dsh-bloom-update-dismissed' // 已关闭的版本号
  /**
   * 升级命令 —— **必须带具体版本号，不能用 @latest**。
   *
   * 这条命令是给用户复制去执行的，装不上新版比不提示更糟。逐个实测过
   * （都在真实 profile 上跑，版本刚发布几分钟）：
   *
   *   up  <pkg>@latest      「Already up to date」，原地不动          ✗
   *   up -L <pkg>           同样原地不动                              ✗
   *   add <pkg>@latest      时好时坏 —— 取决于 lockfile 当时的状态    ✗
   *   add <pkg>@0.8.7       每次都真的装上（downloaded 1, added 1）   ✓
   *
   * 排查时排除了三个方向：不是 registry 传播延迟（直连 / npm view / pnpm view
   * 三处 dist-tags 都已是新版）、不是 packument 缓存（缓存目录压根不存在，
   * 删了也没变化）、也不是 minimumReleaseAge（显式版本号能装上同一个版本）。
   * 真正的原因是 pnpm 优先复用 lockfile 里已有的解析结果：
   * lock 里记着 `specifier: ^0.8.6 / version: 0.8.6`，`@latest` 就被判定为
   * 「已满足」而跳过。
   *
   * 带上具体版本号一次绕开全部：不依赖 pnpm 怎么解析 latest、不受 lock 影响，
   * 而且对用户更明确 —— 命令里写的版本号和横幅标题里那个是同一个。
   */
  // ⚠️ 2026-10-12 改：profile 名原来写死 `web`。该 profile 已于 2026-10-02 退役，
   // 当前宿主是桌面端 app（profile `desktop`，app 独占托管、CLI 会被拒）—— 这条命令
   // 复制出去执行必然报错。这里给占位符：具体 profile 名由用户按自己实际的填，
   // 桌面端用户则改走 app 的插件管理（下方 release 说明里已指向 Release 页）。
  const updateCmd = (v) => tr('dsh plugin --profile <你的profile名> add ') + PLUGIN_ID + '@' + v
  const RELEASES_URL = 'https://github.com/webkubor/dsh-bloom-theme/releases'

  /** a > b ？（major.minor.patch 数值比；release > prerelease；预发布串比字符串，够用） */
  function isNewer(a, b) {
    const [va, pa] = a.split('-'), [vb, pb] = b.split('-')
    const na = va.split('.').map(Number), nb = vb.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if ((na[i] || 0) !== (nb[i] || 0)) return (na[i] || 0) > (nb[i] || 0)
    }
    if (!pa && pb) return true
    if (pa && !pb) return false
    if (pa && pb) return pa > pb
    return false
  }

  const ls = {
    get(k) { try { return window.localStorage.getItem(k) } catch { return null } },
    set(k, v) { try { window.localStorage.setItem(k, v) } catch {} },
  }

  const isDesktopHost = () => typeof (window as any).dshDesktop !== 'undefined'
    || typeof (window as any).dshDesktopBoot !== 'undefined'
    || location.protocol === 'dsh-app:' || /Electron/i.test(navigator.userAgent)
  let bannerVersion: string | null = null
  let outcome: { kind: 'available' | 'installing' | 'installed' | 'failed'; version?: string; restart?: boolean; reason?: string; localizableReason?: boolean } = { kind: 'available' }
  const refreshCapability = () => {
    if (outcome.kind === 'available' && bannerVersion && document.getElementById('dsh-bloom-update-banner')) showBanner(bannerVersion, true)
  }
  refreshUpdateCapability = refreshCapability
  const onLanguageChange = () => {
    if (bannerVersion && document.getElementById('dsh-bloom-update-banner')) showBanner(bannerVersion, true)
  }
  window.addEventListener(LANG_CHANGE_EVENT, onLanguageChange)

  function showBanner(latest, refresh = false) {
    if (disposed || !document.body) return
    const existing = document.getElementById('dsh-bloom-update-banner')
    if (existing && !refresh) return
    const dismissed = ls.get(LS_DISMISSED)
    if (dismissed === latest) return

    const isDesktop = isDesktopHost()
    // Only the replacement API can update an installed bundle; legacy installBundle cannot.
    const canUpdate = !!pluginManager?.updateBundle
    const canOpenPlugins = typeof layout?.selectPanel === 'function'

    if (bannerVersion !== latest) outcome = { kind: 'available' }
    bannerVersion = latest
    const el = existing || document.createElement('div')
    el.id = 'dsh-bloom-update-banner'
    el.setAttribute('role', 'status')
    el.innerHTML = `
      <style>
        /* ⚠️ 这里的颜色**只准用真实存在的 token**。
           原先写的是 var(--bloom-glass-bg, rgba(255,255,255,0.72)) 和
           var(--bloom-tx, inherit) —— 这两个变量**从来没被定义过**，于是：
             背景 fallback 成 rgba(255,255,255,0.72)（一个「亮色」假设的浅白底）
             文字 fallback 成 inherit（继承 DSH 暗色主题的近白色）
           浅白底 + 近白字，实测标题 1.62:1、命令框 1.93:1、「（当前 x.y.z）」
           叠了 opacity:.65 只剩 1.38:1 —— 不是「有点淡」，是几乎不可读。

           这块样式是内联 <style>，不在 src/css/ 里，所以 CSS 常量白名单和视觉审计
           都没扫到它 —— 它烂了很久没人发现，正因为它躲在闸门外面。
           现在一律走 --dsw-alias-* / --bloom-*（都是 tokens.ts 里真实定义的，
           且已按明暗分档），不再自造变量名。 */
        #dsh-bloom-update-banner{position:fixed;right:20px;bottom:20px;z-index:2147483000;
          max-width:340px;padding:14px 16px;border-radius:14px;
          background:color-mix(in oklch,var(--dsw-alias-bg-layer-1,#fff),transparent 12%);
          backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);
          border:1px solid var(--bloom-hairline,rgba(146,168,179,0.35));
          box-shadow:var(--bloom-shadow,0 10px 30px rgba(0,0,0,0.18));
          font:12.5px/1.6 system-ui,-apple-system,'PingFang SC','Segoe UI',sans-serif;
          color:var(--dsw-alias-label-primary,#222);animation:bloom-up-in .45s cubic-bezier(.2,.9,.3,1.2)}
        @keyframes bloom-up-in{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
        #dsh-bloom-update-banner a{color:var(--bloom-accent,#34698c);font-weight:600;text-decoration:none}
        #dsh-bloom-update-banner a:hover{text-decoration:underline}
        #dsh-bloom-update-banner code{font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
          display:block;margin:8px 0;padding:6px 8px;border-radius:8px;word-break:break-all;
          background:var(--bloom-code-bg,rgba(146,168,179,0.13));
          color:var(--dsw-alias-label-primary,#222)}
        #dsh-bloom-update-banner code[hidden]{display:none}
        /* 次要信息用 label-secondary 这个**已按明暗分档且过 AA** 的 token，
           不再用 opacity 硬压 —— opacity 会把对比度再乘一次，1.62 直接掉到 1.38。 */
        #dsh-bloom-update-banner .bloom-upd-cur{color:var(--dsw-alias-label-secondary,#666)}
        #dsh-bloom-update-banner .bloom-upd-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
        #dsh-bloom-update-banner button{font:12px/1 system-ui,sans-serif;padding:7px 12px;border-radius:9px;
          cursor:pointer;border:1px solid var(--bloom-hairline-strong,rgba(146,168,179,0.55));
          background:transparent;color:var(--dsw-alias-label-primary,#222);transition:all .18s}
        #dsh-bloom-update-banner button:hover{border-color:var(--bloom-accent,#34698c);
          color:var(--bloom-accent,#34698c)}
        #dsh-bloom-update-banner button:active{transform:scale(.97)}
        /* 主按钮:accent 底 + label-primary-foreground(即 bg 色)文字。
           PALETTE 的 accent×bg 组合本来就由 ui-craft 守着 ≥4.5,这条路天然达标;
           原先写死 color:#fff,在亮色档的 accent 上只有 2.3:1。 */
        #dsh-bloom-update-banner button[data-primary]{background:var(--bloom-accent,#34698c);
          color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent}
        #dsh-bloom-update-banner button[data-primary]:hover{filter:brightness(1.12)}
        #dsh-bloom-update-banner .bloom-upd-x{position:absolute;top:6px;right:8px;border:none!important;
          background:none!important;padding:4px!important;font-size:14px!important;line-height:1!important}
      </style>
      <div class="bloom-upd-x" title="${tr('关闭（此版本不再提醒）')}">×</div>
      <div class="bloom-upd-body">🌸 <strong>${tr('Bloom 主题有新版本')}</strong>
        ${latest} ${tr('可用')}<span class="bloom-upd-cur">（${tr('当前')} ${PLUGIN_VERSION}）</span></div>
      ${canUpdate
        ? `<div class="bloom-upd-hint" style="font-size:11px;line-height:1.4;margin:6px 0 2px;color:var(--dsw-alias-label-secondary,#666);padding:4px 8px;border-radius:6px;background:var(--bloom-code-bg,rgba(146,168,179,0.13))">${tr('在应用内点「立即更新」即可，无需终端命令')}</div>`
        : isDesktop
          ? `<div class="bloom-upd-hint" style="font-size:11px;line-height:1.4;margin:6px 0 2px;color:var(--dsw-alias-label-secondary,#666);padding:4px 8px;border-radius:6px;background:var(--bloom-code-bg,rgba(146,168,179,0.13))">${tr('当前宿主不支持一键更新，请在侧栏「插件」管理中查看')}</div>`
          : ''}
      <code${canUpdate || isDesktop ? ' hidden' : ''}></code>
      <div class="bloom-upd-actions">
        ${canUpdate
          ? `<button data-primary data-act="install">${tr('立即更新')}</button>
             <button data-act="open">${tr('更新日志')}</button>`
          : isDesktop
            ? `${canOpenPlugins ? `<button data-primary data-act="plugins">${tr('打开插件管理')}</button>` : ''}
               <button data-act="open">${tr('更新日志')}</button>`
            : `<button data-primary data-act="copy">${tr('复制更新命令')}</button>
               <button data-act="open">${tr('更新日志')}</button>`}
      </div>`
    el.querySelector('code').textContent = updateCmd(latest)
    el.querySelector<HTMLElement>('.bloom-upd-x').addEventListener('click', () => {
      ls.set(LS_DISMISSED, latest)
      el.remove()
    })
    el.querySelector<HTMLElement>('[data-act="plugins"]')?.addEventListener('click', () => {
      layout?.selectPanel('plugins')
    })
    el.querySelector<HTMLElement>('[data-act="copy"]')?.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLElement
      navigator.clipboard?.writeText(updateCmd(latest)).then(() => {
        if (disposed) return
        btn.textContent = tr('✓ 已复制')
        later(() => (btn.textContent = tr('复制更新命令')), 1600)
      }).catch(() => {})
    })
    el.querySelector<HTMLElement>('[data-act="install"]')?.addEventListener('click', async (e) => {
      const btn = e.currentTarget as HTMLButtonElement
      if (btn.disabled) return
      if (outcome.kind === 'installing') return
      outcome = { kind: 'installing' }
      btn.disabled = true
      btn.textContent = tr('更新中…')
      try {
        const response = await pluginManager?.updateBundle?.(PLUGIN_ID, latest)
        if (disposed) return
        // Remote calls wrap PluginUpdateResult in { ok, value }; the manager reports
        // its own ChangeResult inside `result`, and a settled Promise alone proves nothing.
        if (response?.ok === false) throw new UpdateFailure(response.error.message, false)
        if (!response || response.ok !== true) throw new UpdateFailure('宿主未返回有效的更新结果', true)
        const update = response.value
        if (!update?.result) throw new UpdateFailure('宿主未返回有效的更新结果', true)
        const result = update.result
        if (result.error) throw new UpdateFailure(result.error.code + (result.error.diagnostic ? '：' + result.error.diagnostic : ''), false)
        if (result.application === 'cancelled') throw new UpdateFailure('更新已取消，当前版本保持不变', true)
        if (result.application === 'overridden') throw new UpdateFailure('安装配置被覆盖，请在「插件」管理中检查', true)
        if (result.application !== 'applied' && result.application !== 'restart-required') throw new UpdateFailure('宿主未确认更新成功', true)
        if (update.step !== 'install' || update.to !== latest || update.restore) throw new UpdateFailure('宿主未确认更新成功', true)
        const needRestart = result.application === 'restart-required'
        outcome = { kind: 'installed', version: latest, restart: needRestart }
        const current = document.getElementById('dsh-bloom-update-banner')
        if (current) showInstalled(current, latest, needRestart)
      } catch (error) {
        if (disposed) return
        const failure = error instanceof UpdateFailure
          ? error : new UpdateFailure(error instanceof Error ? error.message : String(error), false)
        outcome = { kind: 'failed', reason: failure.key, localizableReason: failure.localizable }
        const current = document.getElementById('dsh-bloom-update-banner')
        if (current) showInstallFailed(current, latest, failure.key, failure.localizable)
      }
    })
    el.querySelector<HTMLElement>('[data-act="open"]').addEventListener('click', () => {
      window.open(RELEASES_URL + '/tag/v' + latest, '_blank', 'noopener')
    })
    host.appendChild(el)
    if (outcome.kind === 'installing') {
      const button = el.querySelector<HTMLButtonElement>('[data-act="install"]')
      if (button) { button.disabled = true; button.textContent = tr('更新中…') }
    } else if (outcome.kind === 'installed') showInstalled(el, outcome.version || latest, !!outcome.restart)
    else if (outcome.kind === 'failed') showInstallFailed(el, latest, outcome.reason || '', !!outcome.localizableReason)
  }

  /** Reflect the manager's activation result without claiming that page reload loads host modules. */
  function showInstalled(el: HTMLElement, version: string, needRestart: boolean) {
    const body = el.querySelector<HTMLElement>('.bloom-upd-body')
    const actions = el.querySelector<HTMLElement>('.bloom-upd-actions')
    if (!body || !actions) return
    el.querySelector('.bloom-upd-hint')?.remove()
    body.textContent = needRestart
      ? tr`已更新到 v${version}，需要重启 DSH 才生效`
      : tr`已更新到 v${version}`
    actions.innerHTML = `<button data-act="dismiss">${tr('稍后')}</button>`
    actions.querySelector<HTMLElement>('[data-act="dismiss"]')?.addEventListener('click', () => el.remove())
  }

  /** Report the host result honestly; desktop users must not get a CLI command that their profile rejects. */
  function showInstallFailed(el: HTMLElement, version: string, reason: string, localizable: boolean) {
    const body = el.querySelector<HTMLElement>('.bloom-upd-body')
    const actions = el.querySelector<HTMLElement>('.bloom-upd-actions')
    if (!body || !actions) return
    el.querySelector('.bloom-upd-hint')?.remove()
    body.style.whiteSpace = 'pre-line'
    const detail = localizable ? tr(reason) : reason
    body.textContent = tr`应用内更新失败：${detail}`
      + (isDesktopHost() ? '\n' + tr('请在侧栏「插件」管理中检查更新；桌面端无需执行终端命令') : '')
    actions.innerHTML = `<button data-act="retry">${tr('重试')}</button>`
      + (isDesktopHost() ? '' : `<button data-act="copy">${tr('复制更新命令')}</button>`)
      + `<button data-act="open">${tr('更新日志')}</button>`
    actions.querySelector<HTMLElement>('[data-act="retry"]')?.addEventListener('click', () => {
      outcome = { kind: 'available' }
      el.remove()
      showBanner(version)
    })
    actions.querySelector<HTMLElement>('[data-act="copy"]')?.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLElement
      navigator.clipboard?.writeText(updateCmd(version)).then(() => {
        if (disposed) return
        btn.textContent = tr('✓ 已复制')
        later(() => (btn.textContent = tr('复制更新命令')), 1600)
      }).catch(() => {})
    })
    actions.querySelector<HTMLElement>('[data-act="open"]')?.addEventListener('click', () => {
      window.open(RELEASES_URL + '/tag/v' + version, '_blank', 'noopener')
    })
  }

  function check() {
    // 24h 节流：上次查过且结论是「已是最新」，直接跳过网络请求
    try {
      const last = JSON.parse(ls.get(LS_LAST) || 'null')
      if (last && Date.now() - last.at < CHECK_TTL_MS && last.latest === PLUGIN_VERSION) return
    } catch {}

    if (disposed) return
    const timer = later(() => controller.abort(), 5000)

    fetch(REGISTRY, { cache: 'no-store', signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((manifest) => {
        if (disposed) return
        const latest = manifest && manifest.version
        if (typeof latest !== 'string') return
        ls.set(LS_LAST, JSON.stringify({ at: Date.now(), latest }))
        if (isNewer(latest, PLUGIN_VERSION)) showBanner(latest)
      })
      .catch(() => {}) // 断网 / 超时 / 被拦 —— 静默，绝不影响主题
      .finally(() => { clearTimeout(timer); timers.delete(timer) })
  }

  // 不抢首屏：等 DSH 壳渲染完再查
  later(check, 4000)
  return () => {
    disposed = true
    controller.abort()
    for (const timer of timers) clearTimeout(timer)
    timers.clear()
    window.removeEventListener(LANG_CHANGE_EVENT, onLanguageChange)
    if (refreshUpdateCapability === refreshCapability) refreshUpdateCapability = undefined
    document.getElementById('dsh-bloom-update-banner')?.remove()
  }
}

/**
 * 把本插件的语言接到 DSH 的 locale 服务上。
 *
 * 这是「体系配置走 DSH」的落地点，做两件事（只读，不改 DSH 的语言目录）：
 *
 *  1. 注册词条 `{zh, en}`（key 是中文原文）。zh 必须是全量恒等表 ——
 *     DSH 的回落链是「当前语言 → 声明 fallback → en」，zh 缺一条就会在中文
 *     界面里漏出英文。
 *  2. `bindLocale` 绑定 + 订阅变化：在 DSH 设置里换语言，面板立刻跟着换。
 *
 * 宿主没提供 locale 服务时（旧版 DSH / 单测 / 独立运行）安静跳过，
 * 退回 lang.ts 里那套本地判断 —— 面板不能因为拿不到服务就整块消失。
 *
 * ⚠️ 契约（2026-10-30 事故，别再改回 `ctx.locale`）：
 * cordis 的 ctx 是 Proxy，**读一个没在 inject 里声明的服务会直接抛**
 * `cannot get property "locale" without inject` —— 连 `ctx?.locale` 都会抛，
 * 可选链和 try/catch 包后面的调用都救不了（抛在取值这一步）。
 * apply 一抛，web boot 报 `dsh-bloom-theme: failed`，整个桌面端起不来。
 *
 * 两种合法写法：
 *   A. 顶层 `exports.inject = ['locale']` —— 硬依赖，locale 不在时整个插件挂起，
 *      皮肤也不会注入。皮肤插件不该这样。
 *   B. `ctx.inject(['locale'], scope => …)` —— 可选依赖（本实现）。皮肤照常注入，
 *      locale 就绪时才绑定；locale 卸载时 scope 内的 effect 自动回收。
 * 门禁：`node ../scripts/dsh-dev.mjs check` 用真 cordis 内核跑 apply，会拦住 A/B 以外的写法。
 */
function bindLocaleToHost(ctx) {
  if (typeof ctx?.inject !== 'function') return
  ctx.inject(['locale'], (scope) => attachLocale(scope))
}

/** 在已声明 locale 的 scope 里接线 —— 这里读 `scope.locale` 是合法的。 */
function attachLocale(ctx) {
  const locale = ctx.locale
  if (!locale || typeof locale.bind !== 'function') return
  ctx.effect?.(() => {
    try {
      return locale.register(LOCALE_NS, DICTS) ?? (() => {})
    } catch {
      // 宿主的 locale 服务与预期不一致（旧版 DSH 的 register 签名不同、
      // 或词条已被注册）。皮肤插件没有资格让宿主起不来：注册不了就注册不了，
      // 面板退回本地语言判断。
      // （注：2026-10-30 那次启动失败**不是**这里抛的，是读 ctx.locale 时没声明 inject，
      //   见 bindLocaleToHost 上方的契约说明。）
      return () => {}
    }
  }, 'dsh-bloom-theme: dictionaries')
  let unbindLocale: (() => void) | undefined
  try {
    unbindLocale = bindLocale(locale)
  } catch {
    // register 没成时 bind 一个未注册的 ns 是下一个会抛的点；
    // translate 留空，tr() 退回 key（中文原文）。
  }
  if (unbindLocale) {
    ctx.effect?.(() => unbindLocale, 'dsh-bloom-theme: bind locale')
  }
  ctx.effect?.(
    () => {
      try {
        return locale.subscribe?.(() => {
          try {
            window.dispatchEvent(new Event(LANG_CHANGE_EVENT))
          } catch {}
        }) ?? (() => {})
      } catch {
        return () => {}
      }
    },
    'dsh-bloom-theme: follow locale',
  )
}

/**
 * 接上宿主的 theme 服务 —— 深浅状态归它持有。
 *
 * 宿主 `dsh-client-ui-theme` 提供 `ctx.theme`（ThemeRuntime）：
 *   · `getTheme()` → 不可变快照
 *   · `setTheme('light'|'dark'|'system')` → 唯一的偏好写入口，宿主自己持久化
 *   · `register()` / `overrideTokens()` → 主题与 token 覆盖层
 *
 * 有了它，面板的深浅行就不再自己改 body 属性（v0.23.0 之前那样做等于造第二个
 * 真源：宿主下一次 theme/change 会无声覆盖插件写的值）。
 *
 * ⚠️ `ctx.theme` 是**可选**依赖：
 *   - 顶层 `exports.inject = ['theme']` 会让整个插件在老宿主上挂起 —— 皮肤不该这样。
 *   - 走 `ctx.inject(['theme'], cb)`：theme 就绪时接上，不可用时退回旧路径
 *     （appearance.ts 里自己写 body 属性），深浅切换仍然可用。
 *
 * 契约参考同仓 client.ts 里 locale 的处理，理由与风险见那里的注释。
 */
function bindThemeToHost(ctx) {
  if (typeof ctx?.inject !== 'function') return
  ctx.inject(['theme'], (scope) => {
    const service = scope?.theme
    if (!service || typeof service.setTheme !== 'function') return
    scope.effect?.(() => {
      const release = bindHostTheme(service as HostThemeService)
      // theme 服务晚到时，重新对齐一次深浅（首屏不闪）。
      initAppearanceSync()
      return release
    }, 'dsh-bloom-theme: host theme')
  })
}

/**
 * 向 DSH 的 client loader 注册。
 *
 * ⚠️ 契约（踩过坑，别再改错地方）：factory 的返回值会被 cordis 当插件 apply，
 * 必须是「函数」或「带 apply 方法的对象」。返回裸 `{}` 会让整个 DSH 启动失败：
 *     invalid plugin, expect function or object with an "apply" method, received object
 * 这个报错跟 lib/index.js 的 ESM 导出格式无关 —— 它发生在浏览器端。
 * 参照实现见 @oil-oil/dsh-vision/lib/client.js 末尾（exports.apply = apply）。
 */
window.__ModuleLoader__.load({
  id: PLUGIN_ID,
  factory: (require: (name: string) => unknown) => {
    const React = require('react') as HostReact
    const { Switcher, Decorations } = createBloomComponents(React, installUpdateCheck)
    const exports: Record<string, unknown> = {}
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    exports.inject = ['slots']
    exports.apply = function apply(ctx) {
      if (typeof document === 'undefined') return
      // 语言是体系配置，走 DSH 的 locale 服务 —— 必须在任何 tr() 渲染之前接上。
      bindLocaleToHost(ctx)
      // 深浅状态交给 DSH 的 theme 服务持有，面板只做入口。
      bindThemeToHost(ctx)
      // 接上宿主的插件管理服务：横幅据此提供「应用内一键更新」。
      bindPluginManager(ctx)
      ctx.inject(['layout'], (scope) => {
        scope.effect(() => {
          const service = scope.layout
          layout = service
          refreshUpdateCapability?.()
          return () => {
            if (layout === service) {
              layout = null
              refreshUpdateCapability?.()
            }
          }
        }, 'dsh-bloom-theme: plugin navigation')
      })
      ctx.effect(() => installSkin(), 'dsh-bloom-theme: skin')
      bindBloomInspect(ctx)
      ctx.slots.inject('conversation.session.header.corner', () => ctx.slots.register({
        name: 'conversation.session.header.corner',
      }, Switcher))
      ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay', id: 'dsh-bloom-theme.decorations', order: -100,
      }, Decorations))
      ctx.effect?.(() => initTypingGlow(), 'dsh-bloom-theme: typing glow')
    }

    return exports
  },
})
