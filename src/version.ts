/**
 * 版本检查：Bloom 自己的 npm 最新版 + DSH 宿主的 rev/最新版。
 *
 * 两条都只读、都带缓存、都静默失败 —— 一个主题插件不该因为网络问题影响 DSH 启动。
 * DSH 侧结果缓存在 sessionStorage 6 小时（DSH_CACHE_TTL_MS）。
 */
import { PLUGIN_ID, PLUGIN_VERSION } from './meta.js'

/** npm 上最新版本（异步拉取，null=未知/失败） */
export let latestVersion = null

/**
 * 主视觉（v0.5.0）：玻璃 + 莫兰迪配色 —— 不再有壁纸/氛围层。
 * 面板玻璃化全部由 GLASS_CSS 驱动（半透底 + backdrop blur + 玻璃边缘），
 * 背景是 body 的莫兰迪氛围渐变；方案见文件头部说明 & GLASS_CSS 注释。
 */

/* ═══ 版本 / 更新检测 ═══════════════════════════════════════════ */
/** 从 npm registry 拉最新版，仅作版本对比（离线/网络失败静默，只显示当前版）。 */
export async function checkUpdate() {
  try {
    const r = await fetch('https://registry.npmjs.org/@kubor/dsh-bloom-theme/latest', { cache: 'no-store' })
    if (!r.ok) return
    const d = await r.json()
    latestVersion = (d && d.version) || null
  } catch { /* 忽略：显示当前版即可 */ }
  refreshUpdateBadge()
}

/* ── DSH 升级检查（看 npm latest + 本地 __DSH_BOOT__.rev）── */
export let dshLatestVersion: string | null = null

export let dshCheckPromise: Promise<void> | null = null

export const DSH_CACHE_KEY = 'bloom-dsh-check'

export const DSH_CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h

/** 从 window.__DSH_BOOT__.rev 读当前 DSH 构建 hash（截短 7 字符）。 */
export function readDshCurrentRev(): string | null {
  try {
    const rev = (window as any).__DSH_BOOT__?.rev
    return typeof rev === 'string' ? rev.slice(0, 7) : null
  } catch { return null }
}

/** 从 npm registry 拉 @deepseek-ai/dsh latest（缓存 6h，避免每次开下拉都打网络）。 */
export async function checkDshLatest(force = false): Promise<void> {
  if (!force) {
    try {
      const raw = sessionStorage.getItem(DSH_CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw)
        if (cached?.at && Date.now() - cached.at < DSH_CACHE_TTL_MS && cached.latest) {
          dshLatestVersion = cached.latest
          renderDshUpdate()
          return
        }
      }
    } catch {}
  }
  if (dshCheckPromise) return dshCheckPromise
  dshCheckPromise = (async () => {
    try {
      const r = await fetch('https://registry.npmjs.org/@deepseek-ai/dsh/latest', { cache: 'no-store' })
      if (r.ok) {
        const d = await r.json()
        dshLatestVersion = (d && d.version) || null
        try { sessionStorage.setItem(DSH_CACHE_KEY, JSON.stringify({ at: Date.now(), latest: dshLatestVersion })) } catch {}
      } else {
        dshLatestVersion = null
      }
    } catch {
      dshLatestVersion = null
    } finally {
      dshCheckPromise = null
    }
    renderDshUpdate()
  })()
  return dshCheckPromise
}

/** 把 DSH 当前 rev + npm latest 渲染到下拉区块；绑按钮事件。 */
export function renderDshUpdate() {
  const curEl = document.querySelector<HTMLElement>('[data-dsh-current]')
  const latEl = document.querySelector<HTMLElement>('[data-dsh-latest]')
  const stEl = document.querySelector<HTMLElement>('[data-dsh-state]')
  const hintEl = document.querySelector<HTMLElement>('[data-dsh-hint]')
  if (!curEl || !latEl || !stEl || !hintEl) return

  const cur = readDshCurrentRev() || '?'
  curEl.textContent = cur

  if (dshLatestVersion == null) {
    latEl.textContent = '点击 ↻ 检查'
    stEl.removeAttribute('data-state')
    stEl.textContent = ''
  } else {
    latEl.textContent = dshLatestVersion
    stEl.textContent = '✓ 已是最新'
    stEl.setAttribute('data-state', 'latest')
  }
  hintEl.hidden = true
  hintEl.textContent = ''

  const btnRefresh = document.querySelector<HTMLButtonElement>('[data-act="refresh"]')
  const btnCopy = document.querySelector<HTMLButtonElement>('[data-act="copy"]')
  if (btnRefresh && !btnRefresh.dataset.bloomBound) {
    btnRefresh.dataset.bloomBound = '1'
    btnRefresh.addEventListener('click', async (ev) => {
      ev.stopPropagation()
      stEl.textContent = '检查中…'
      stEl.removeAttribute('data-state')
      btnRefresh.disabled = true
      try { await checkDshLatest(true) } finally { btnRefresh.disabled = false }
    })
  }
  if (btnCopy && !btnCopy.dataset.bloomBound) {
    btnCopy.dataset.bloomBound = '1'
    btnCopy.addEventListener('click', async (ev) => {
      ev.stopPropagation()
      const cmd = 'npm i -g @deepseek-ai/dsh@latest'
      let ok = false
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(cmd)
          ok = true
        }
      } catch {}
      if (!ok) {
        // 降级：临时 textarea
        const ta = document.createElement('textarea')
        ta.value = cmd; ta.style.position = 'fixed'; ta.style.opacity = '0'
        document.body.appendChild(ta); ta.select()
        try { ok = document.execCommand('copy') } catch {}
        ta.remove()
      }
      hintEl.hidden = false
      hintEl.textContent = ok ? `✓ 已复制：${cmd}` : `复制失败，请手动执行：${cmd}`
      setTimeout(() => { hintEl.hidden = true }, 2400)
    })
  }
}

/** 简单版本大小比较：a>b→1, a<b→-1, 相等→0（处理 leading v / 缺段）。 */
export function cmpVersion(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0)
  const pb = String(b).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0, nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

/** 把「↑ 可更新」徽标刷进已渲染的版本区（只在 最新>当前 时亮，切换器重挂后也会被 injectSwitcher 调用）。 */
export function refreshUpdateBadge() {
  if (!latestVersion || cmpVersion(latestVersion, PLUGIN_VERSION) <= 0) return
  const el = document.querySelector<HTMLElement>('.dsh-bloom-version__update')
  if (!el) return
  el.hidden = false
  el.setAttribute('title', '可更新到 v' + latestVersion)
  el.textContent = '↑ v' + latestVersion
}
