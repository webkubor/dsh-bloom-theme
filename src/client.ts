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


/** 顶层立即注入 —— 不依赖 factory materialize（dsh-client-modules 的 lazy CJS 在
 *  没有 import 的情况下 factory 不会被调用，CSS/switcher 永远不跑）。所以：
 * script 一加载就跑（同时给 factory 留 fallback）。 */
import { PLUGIN_ID, PLUGIN_VERSION } from './meta.js'
import { buildBloomCSS } from './tokens.js'
import { COMPONENT_CSS } from './css/component.js'
import { GLASS_CSS } from './css/glass.js'
import { injectCSS, readVariant, watchThinkTags } from './dom.js'
import { injectSwitcher, watchSwitcher } from './switcher.js'
import { checkUpdate } from './version.js'

;(function() {
  if (typeof document === 'undefined') return
  const variant = readVariant()
  injectCSS(buildBloomCSS(), 'bloom.css')
  injectCSS(COMPONENT_CSS, 'components.css')
  injectCSS(GLASS_CSS, 'glass.css')
  const boot = () => {
    document.body.dataset.bloomVariant = variant
    injectSwitcher(variant)
    // header 通常晚于脚本渲染 —— 交给 observer 在宿主就绪后迁进去
    watchSwitcher(variant)
    watchThinkTags()
    checkUpdate()
  }
  if (document.body) boot()
  else document.addEventListener('DOMContentLoaded', boot)
})()

/** 开发期自动刷新 —— 仅在本地 localhost 启用，线上用户不受影响。
 *
 * 解决痛点：bloom 插件的 client.js 一旦加载进浏览器就常驻 JS 上下文，
 * 我本地 rsync 部署后页面不会自动拿新代码，必须 hard reload 才能验证。
 *
 * 实现：找到加载本插件的 <script> 标签，HEAD 请求同一 URL，对比
 * Last-Modified / ETag —— 不一致就 location.reload()。?noreload=1 关掉。
 *
 * 不放在 watchSwitcher 里：切换器是可选组件；reload 是纯文件监控，跟切换器无关。
 */
;(function installAutoReload() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  // 仅本地开发；线上用户用 bloom 不该被自动 reload 打断。
  const host = location.hostname
  if (host !== '127.0.0.1' && host !== 'localhost') return
  // 一键关
  if (location.search.includes('noreload=1')) return

  // DSH 走 module loader 注入，页面上通常没有带包名的 <script src> —— 不去扫 script。
  // 而且 DSH 的 web 服务 HEAD 不返回 etag / content-length，所以直接 GET 自己插件的
  // 官方 URL（${origin}/plugins/<包名>/client.js），对整个 body 算指纹比对：
  // 变了 = 你部署了新版，location.reload()。这套不依赖 import.meta / script 扫描，
  // vanilla 和 ESM 都安全。~85KB / 3s 在本地无所谓；线上不启用（localhost 才生效）。
  const myUrl = `${location.origin}/plugins/${PLUGIN_ID}/client.js`
  let initialKey: string | null = null

  // 极简 FNV-1a 32-bit，避免引 crypto / 异步 SubtleCrypto
  const fnv1a = (s: string) => {
    let h = 2166136261 >>> 0
    for (let i = 0; i < s.length; i++) { h = (h ^ s.charCodeAt(i)) * 16777619 >>> 0 }
    return h.toString(36)
  }

  const check = async () => {
    try {
      const r = await fetch(`${myUrl}?t=${Date.now()}`, { cache: 'no-store' })
      if (!r.ok) return
      const text = await r.text()
      const key = fnv1a(text) + ':' + text.length
      if (initialKey === null) { initialKey = key; return }
      if (key !== initialKey) location.reload()
    } catch (_) { /* 网络抖动忽略 */ }
  }
  check()                                            // 首次记录基线
  setInterval(check, 3000)                           // 3 秒一次
})()

/** ── 更新检测：npm 有新版本时提醒老用户 ─────────────────────────────────────
 *
 * 背景：主题插件装在 ~/.dsh/profiles/web/node_modules 里，用户不会主动升级；
 * 发了新版（新变体/修 bug）老用户无感知。这里做被动提醒。
 *
 * 机制（全部浏览器端，零 node 侧依赖）：
 *   1. 「当前版本」来自 PLUGIN_VERSION 常量（scripts/sync-version.mjs 随发版自动同步）
 *   2. 「最新版本」查 https://registry.npmjs.org/@kubor/dsh-bloom-theme/latest
 *      取响应里的 version 字段。⚠️ 必须用这个端点：npm registry 只有完整
 *      manifest 端点带 CORS 头（access-control-allow-origin: *），精简的
 *      /-/package/<id>/dist-tags 端点不带，浏览器会拦 —— 实测过别改回去。
 *   3. 24h 节流：结果缓存在 localStorage，一天最多查一次（远端浏览器无持久化时降级为每次查）
 *   4. 用户关掉的版本不再弹（新版本号出现后重新弹一次）
 *   5. 一切失败静默：断网/CORS 被拦/registry 抽风都不影响主题本身
 */
;(function installUpdateCheck() {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return

  const REGISTRY = 'https://registry.npmjs.org/' + PLUGIN_ID + '/latest'
  const CHECK_TTL_MS = 24 * 60 * 60 * 1000
  const LS_LAST = 'dsh-bloom-update-check'      // { at, latest } 上次检查
  const LS_DISMISSED = 'dsh-bloom-update-dismissed' // 已关闭的版本号
  const UPDATE_CMD = 'dsh plugin --profile web up ' + PLUGIN_ID + '@latest'
  const RELEASES_URL = 'https://github.com/webkubor/dsh-bloom-theme/releases'
  const zh = (navigator.language || '').toLowerCase().startsWith('zh')

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

  function showBanner(latest) {
    if (document.getElementById('dsh-bloom-update-banner')) return
    const dismissed = ls.get(LS_DISMISSED)
    if (dismissed === latest) return

    const el = document.createElement('div')
    el.id = 'dsh-bloom-update-banner'
    el.setAttribute('role', 'status')
    el.innerHTML = `
      <style>
        #dsh-bloom-update-banner{position:fixed;right:20px;bottom:20px;z-index:2147483000;
          max-width:340px;padding:14px 16px;border-radius:14px;
          background:var(--bloom-glass-bg,rgba(255,255,255,0.72));
          backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);
          border:1px solid var(--bloom-hairline,rgba(146,168,179,0.35));
          box-shadow:var(--bloom-shadow,0 10px 30px rgba(0,0,0,0.18));
          font:12.5px/1.6 system-ui,-apple-system,'PingFang SC','Segoe UI',sans-serif;
          color:var(--bloom-tx,inherit);animation:bloom-up-in .45s cubic-bezier(.2,.9,.3,1.2)}
        @keyframes bloom-up-in{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
        #dsh-bloom-update-banner a{color:var(--bloom-accent,#34698c);font-weight:600;text-decoration:none}
        #dsh-bloom-update-banner a:hover{text-decoration:underline}
        #dsh-bloom-update-banner code{font:11px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
          display:block;margin:8px 0;padding:6px 8px;border-radius:8px;word-break:break-all;
          background:var(--bloom-code-bg,rgba(146,168,179,0.13));color:var(--bloom-code-fg,inherit)}
        #dsh-bloom-update-banner .bloom-upd-actions{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
        #dsh-bloom-update-banner button{font:12px/1 system-ui,sans-serif;padding:7px 12px;border-radius:9px;
          cursor:pointer;border:1px solid var(--bloom-hairline-strong,rgba(146,168,179,0.55));
          background:transparent;color:var(--bloom-tx,inherit);transition:all .18s}
        #dsh-bloom-update-banner button:hover{border-color:var(--bloom-accent,#34698c);
          color:var(--bloom-accent,#34698c)}
        #dsh-bloom-update-banner button[data-primary]{background:var(--bloom-accent,#34698c);
          color:#fff;border-color:transparent}
        #dsh-bloom-update-banner button[data-primary]:hover{filter:brightness(1.12)}
        #dsh-bloom-update-banner .bloom-upd-x{position:absolute;top:6px;right:8px;border:none!important;
          background:none!important;padding:4px!important;font-size:14px!important;line-height:1!important}
      </style>
      <div class="bloom-upd-x" title="${zh ? '关闭（此版本不再提醒）' : 'Dismiss'}">×</div>
      <div>🌸 <strong>${zh ? 'Bloom 主题有新版本' : 'Bloom theme update'}</strong>
        ${latest} ${zh ? '可用' : 'available'}<span style="opacity:.65">（${zh ? '当前' : 'current'} ${PLUGIN_VERSION}）</span></div>
      <code>${UPDATE_CMD}</code>
      <div class="bloom-upd-actions">
        <button data-primary data-act="copy">${zh ? '复制更新命令' : 'Copy command'}</button>
        <button data-act="open">${zh ? '更新日志' : 'Changelog'}</button>
      </div>`
    el.querySelector<HTMLElement>('.bloom-upd-x').addEventListener('click', () => {
      ls.set(LS_DISMISSED, latest)
      el.remove()
    })
    el.querySelector<HTMLElement>('[data-act="copy"]').addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLElement
      navigator.clipboard?.writeText(UPDATE_CMD).then(() => {
        btn.textContent = zh ? '✓ 已复制' : '✓ Copied'
        setTimeout(() => (btn.textContent = zh ? '复制更新命令' : 'Copy command'), 1600)
      }).catch(() => {})
    })
    el.querySelector<HTMLElement>('[data-act="open"]').addEventListener('click', () => {
      window.open(RELEASES_URL + '/tag/v' + latest, '_blank', 'noopener')
    })
    document.body.appendChild(el)
  }

  function check() {
    // 24h 节流：上次查过且结论是「已是最新」，直接跳过网络请求
    try {
      const last = JSON.parse(ls.get(LS_LAST) || 'null')
      if (last && Date.now() - last.at < CHECK_TTL_MS && last.latest === PLUGIN_VERSION) return
    } catch {}

    const ctrl = typeof AbortController === 'function' ? new AbortController() : null
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 5000) : null

    fetch(REGISTRY, { cache: 'no-store', signal: ctrl?.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
      .then((manifest) => {
        const latest = manifest && manifest.version
        if (typeof latest !== 'string') return
        ls.set(LS_LAST, JSON.stringify({ at: Date.now(), latest }))
        if (isNewer(latest, PLUGIN_VERSION)) showBanner(latest)
      })
      .catch(() => {}) // 断网 / 超时 / 被拦 —— 静默，绝不影响主题
      .finally(() => timer && clearTimeout(timer))
  }

  // 不抢首屏：等 DSH 壳渲染完再查
  setTimeout(check, 4000)
})()

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
  factory: () => {
    const exports: Record<string, unknown> = {}
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    exports.apply = function apply() {
      // 顶层 IIFE 已注入；此处兜底：cordis materialize 时再确认一次。
      if (typeof document === 'undefined') return
      const variant = readVariant()
      if (!document.querySelector<HTMLElement>('style[data-plugin-css="' + PLUGIN_ID + '/bloom.css"]')) {
        injectCSS(buildBloomCSS(), 'bloom.css')
      }
      if (!document.querySelector<HTMLElement>('style[data-plugin-css="' + PLUGIN_ID + '/components.css"]')) {
        injectCSS(COMPONENT_CSS, 'components.css')
      }
      if (!document.querySelector<HTMLElement>('style[data-plugin-css="' + PLUGIN_ID + '/glass.css"]')) {
        injectCSS(GLASS_CSS, 'glass.css')
      }
      document.body.dataset.bloomVariant = variant
      injectSwitcher(variant)
      watchSwitcher(variant)
      watchThinkTags()
    }

    return exports
  },
})
