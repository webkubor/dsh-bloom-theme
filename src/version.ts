/**
 * 版本检查：Bloom 自己的 npm 最新版 + DSH 宿主的 rev/最新版。
 *
 * 两条都只读、都带缓存、都静默失败 —— 一个主题插件不该因为网络问题影响 DSH 启动。
 * DSH 侧结果缓存在 sessionStorage 6 小时（DSH_CACHE_TTL_MS）。
 */
import { PLUGIN_ID, PLUGIN_VERSION } from './meta.js'

/** npm 上最新版本（异步拉取，null=未知/失败） */
/**
 * 把一段文本写进 DSH 的主输入框并聚焦，返回是否成功。
 *
 * React 受控组件不认 `el.value = x` —— 必须走原型链上的 setter 再派发 input 事件，
 * 否则 React 的内部 state 不更新，界面上看着有字、发送出去却是空的。
 * contenteditable 走另一条路（DSH 两种实现都可能出现，两边都兜住）。
 */
async function fillMainComposer(text: string): Promise<boolean> {
  // 顺序很重要：DSH 的主输入框是富文本 contenteditable，页面上另有隐藏 textarea。
  // 先查 textarea 会命中那个隐藏的，写进去没人看得见，还会返回 true 把后路堵死
  // （实测点「填入」页面毫无反应）。所以 contenteditable 优先，textarea 只作兜底
  // 且必须可见。
  // 选择器不能写死 ="true"：DSH 的输入框实测是 contenteditable=""（空值也生效），
  // 写死会漏掉它，然后掉进下面的 textarea 兜底，表现成「点了填入没反应」。
  const ce = document.querySelector<HTMLElement>('[contenteditable]:not([contenteditable="false"])')
  if (ce) {
    const selectAll = () => {
      // insertText / paste 都是「替换选区」，不选中就变成追加（实测点两次，
      // 框里成了两条命令首尾相连）。用 Range 精确选中本元素内容，
      // 而不是 execCommand('selectAll') —— 后者在富文本编辑器里实测选不中东西。
      const range = document.createRange()
      range.selectNodeContents(ce)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
    // 关键是这两次 await：Lexical / ProseMirror 这类编辑器在自己的模型里另记一份光标，
    // 靠 document 的 selectionchange 异步同步。同一个 tick 内「改 DOM 选区→马上插入」，
    // 编辑器用的还是它记的旧光标（末尾），结果就是追加而不是替换 —— 实测两次都栽在这里。
    // 让出一个宏任务，等它把选区同步进模型再插。
    ce.focus({ preventScroll: true })
    await new Promise((r) => setTimeout(r, 0))
    selectAll()
    await new Promise((r) => setTimeout(r, 0))
    // 兜底只看 execCommand 的返回值，不比对 textContent —— 编辑器会把
    // `@deepseek-ai/...` 解析成 mention 节点，textContent 跟原文对不上，
    // 拿它当判据会误判成失败、再补一次 paste，框里就成了两条命令（实测）。
    if (!document.execCommand('insertText', false, text)) {
      // 编辑器可能吞掉 insertText，但一定处理 paste。
      selectAll()
      await new Promise((r) => setTimeout(r, 0))
      const dt = new DataTransfer()
      dt.setData('text/plain', text)
      ce.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }))
    }
    return true
  }
  const ta = Array.from(
    document.querySelectorAll<HTMLTextAreaElement>('textarea'),
  ).find((el) => el.offsetParent !== null)
  if (ta) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
    if (!setter) return false
    setter.call(ta, text)
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    ta.focus()
    ta.setSelectionRange(text.length, text.length)
    return true
  }
  return false
}

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
    const r = await fetch('https://registry.npmjs.org/dsh-bloom-theme/latest', { cache: 'no-store' })
    if (!r.ok) return
    const d = await r.json()
    latestVersion = (d && d.version) || null
  } catch { /* 忽略：显示当前版即可 */ }
  refreshUpdateBadge()
}

/* ── DSH 升级检查（宿主管理器优先；否则按当前预发布通道查 npm dist-tag）── */
export let dshLatestVersion: string | null = null

export let dshCheckPromise: Promise<void> | null = null

export const DSH_CACHE_KEY = 'bloom-dsh-check-v2'

export const DSH_CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6h

type DshLocalBridge = {
  runtimeVersion?: string
  updateManagedBy?: string
  updateMode?: string
  requestUpdateCheck?: () => void
}

export type DshRuntimeInfo = {
  currentVersion: string | null
  buildRev: string | null
  updateManagedBy: string | null
  updateMode: string | null
  requestUpdateCheck: (() => void) | null
}

type ParsedSemver = {
  core: [number, number, number]
  prerelease: string[]
}

function parseSemver(value: unknown): ParsedSemver | null {
  const match = String(value ?? '').trim().match(
    /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/,
  )
  if (!match) return null
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ? match[4].split('.') : [],
  }
}

export function isSemver(value: unknown): boolean {
  return parseSemver(value) !== null
}

function normalizeSemver(value: unknown): string | null {
  if (!isSemver(value)) return null
  return String(value).trim().replace(/^v/, '')
}

/**
 * 读取宿主运行时信息。桌面壳提供的语义化版本优先；提交 hash 只作为构建号展示，
 * 永远不参与版本大小比较。
 */
/** host 半侧读到的 DSH 版本（见 src/index.ts 的 /api/bloom/dsh-version）。 */
let dshVersionFromHost: string | null = null

/**
 * 向 host 半要一次 DSH 版本号，成功则刷新面板。
 * 浏览器侧只有 7 位 commit rev，拿它没法和 npm 上的 semver 比较。
 */
export async function fetchDshVersionFromHost(): Promise<string | null> {
  try {
    const res = await fetch('/api/bloom/dsh-version', { headers: { accept: 'application/json' } })
    const body = await res.json()
    if (body?.ok === true && typeof body.version === 'string') {
      dshVersionFromHost = body.version
      return dshVersionFromHost
    }
  } catch {}
  return null
}

export function readDshRuntimeInfo(): DshRuntimeInfo {
  try {
    const hostWindow = window as any
    const bridge = (hostWindow.__DSH_LOCAL__ || {}) as DshLocalBridge
    const boot = hostWindow.__DSH_BOOT__ || {}
    const dataVersion = document.documentElement?.dataset?.dshRuntimeVersion
    // host 半读到的排第一 —— 它直接来自 @deepseek-ai/dsh/package.json，是唯一权威来源；
    // 其余几个在实测里要么没有、要么只是 commit rev。
    const currentVersion = [dshVersionFromHost, bridge.runtimeVersion, dataVersion, boot.version, boot.rev]
      .map(normalizeSemver)
      .find(Boolean) || null
    const buildRev = typeof boot.rev === 'string' && /^[0-9a-f]{7,40}$/i.test(boot.rev)
      ? boot.rev.slice(0, 7)
      : null
    const updateManagedBy = typeof bridge.updateManagedBy === 'string' && bridge.updateManagedBy.trim()
      ? bridge.updateManagedBy.trim()
      : null
    return {
      currentVersion,
      buildRev,
      updateManagedBy,
      updateMode: typeof bridge.updateMode === 'string' ? bridge.updateMode : null,
      requestUpdateCheck: typeof bridge.requestUpdateCheck === 'function'
        ? bridge.requestUpdateCheck.bind(bridge)
        : null,
    }
  } catch {
    return {
      currentVersion: null,
      buildRev: null,
      updateManagedBy: null,
      updateMode: null,
      requestUpdateCheck: null,
    }
  }
}

/** 保留旧导出：它现在只代表构建 hash，不再冒充当前版本。 */
export function readDshCurrentRev(): string | null {
  return readDshRuntimeInfo().buildRev
}

/** 按当前版本选择 npm dist-tag，避免 alpha 被 latest/rc 误判为可降级。 */
export function selectDshDistTag(
  distTags: Record<string, unknown>,
  currentVersion: string | null,
): string | null {
  const parsed = parseSemver(currentVersion)
  const prereleaseChannel = parsed?.prerelease[0]
  if (prereleaseChannel && typeof distTags[prereleaseChannel] === 'string') return prereleaseChannel
  if (prereleaseChannel && typeof distTags.next === 'string') return 'next'
  return typeof distTags.latest === 'string' ? 'latest' : null
}

/** 从 npm registry 拉匹配当前通道的 DSH 版本（缓存 6h）。 */
export async function checkDshLatest(force = false): Promise<void> {
  const runtime = readDshRuntimeInfo()
  if (runtime.updateManagedBy) {
    dshLatestVersion = null
    renderDshUpdate()
    return
  }
  if (!force) {
    try {
      const raw = sessionStorage.getItem(DSH_CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw)
        if (cached?.at
          && Date.now() - cached.at < DSH_CACHE_TTL_MS
          && cached.latest
          && cached.currentVersion === runtime.currentVersion) {
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
      const r = await fetch(
        // ⚠️ 不能用 registry 的 /-/package/<pkg>/dist-tags 端点：它**不带 CORS 头**，
        // 浏览器里直接 `Failed to fetch`（2026-09-10 在 DSH 页面实测；同域下
        // /<pkg>/latest 与 /<pkg> 都正常）。而 checkDshLatest 是静默失败的，
        // 坏了不会报错，只会永远停在「点击 ↻ 检查」。
        // 改用简版 packument：同一条能过 CORS 的路径，加 install-v1 的 Accept
        // 头把响应从 119KB 压到 94KB，dist-tags 就在里面。
        'https://registry.npmjs.org/@deepseek-ai/dsh',
        { cache: 'no-store', headers: { Accept: 'application/vnd.npm.install-v1+json' } },
      )
      if (r.ok) {
        const packument = await r.json()
        const distTags = (packument && packument['dist-tags']) || {}
        const tag = selectDshDistTag(distTags, runtime.currentVersion)
        const selected = tag ? distTags?.[tag] : null
        dshLatestVersion = typeof selected === 'string' ? selected : null
        try {
          sessionStorage.setItem(DSH_CACHE_KEY, JSON.stringify({
            at: Date.now(),
            latest: dshLatestVersion,
            currentVersion: runtime.currentVersion,
            tag,
          }))
        } catch {}
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

/** 把宿主版本和对应更新通道渲染到下拉区块；绑按钮事件。 */
export function renderDshUpdate() {
  const root = document.querySelector<HTMLElement>('.dsh-bloom-dsh-update')
  const curEl = document.querySelector<HTMLElement>('[data-dsh-current]')
  const latEl = document.querySelector<HTMLElement>('[data-dsh-latest]')
  const stEl = document.querySelector<HTMLElement>('[data-dsh-state]')
  const hintEl = document.querySelector<HTMLElement>('[data-dsh-hint]')
  if (!root || !curEl || !latEl || !stEl || !hintEl) return

  const runtime = readDshRuntimeInfo()
  const cur = runtime.currentVersion || runtime.buildRev || '?'
  curEl.textContent = cur

  // 首次渲染时浏览器侧只有 commit rev；异步向 host 半要一次真版本号，到了就重画。
  // 只问一次 —— 版本号在运行期不会变。
  if (!runtime.currentVersion && dshVersionFromHost === null) {
    void fetchDshVersionFromHost().then((v) => { if (v) renderDshUpdate() })
  }

  const btnRefresh = document.querySelector<HTMLButtonElement>('[data-act="refresh"]')
  const btnCopy = document.querySelector<HTMLButtonElement>('[data-act="copy"]')

  if (runtime.updateManagedBy) {
    root.dataset.updateManagedBy = runtime.updateManagedBy
    latEl.textContent = '由桌面端检查'
    stEl.textContent = `${runtime.updateManagedBy} 管理更新`
    stEl.setAttribute('data-state', 'managed')
    hintEl.hidden = true
    hintEl.textContent = ''
    if (btnRefresh) {
      btnRefresh.hidden = false
      btnRefresh.disabled = runtime.requestUpdateCheck == null
      btnRefresh.textContent = '检查更新'
      btnRefresh.title = runtime.requestUpdateCheck
        ? `由 ${runtime.updateManagedBy} 检查官方更新`
        : `请在 ${runtime.updateManagedBy} 中检查更新`
    }
    if (btnCopy) {
      btnCopy.hidden = true
      btnCopy.disabled = true
    }
  } else {
    delete root.dataset.updateManagedBy
    if (btnRefresh) {
      btnRefresh.hidden = false
      btnRefresh.disabled = false
      btnRefresh.textContent = '↻ 检查'
      btnRefresh.title = '重新检查 DSH 最新版'
    }
    if (btnCopy) {
      btnCopy.hidden = false
      btnCopy.disabled = dshLatestVersion == null
      btnCopy.title = dshLatestVersion
        ? `复制升级命令到剪贴板：npm i -g @deepseek-ai/dsh@${dshLatestVersion}`
        : '检查到可用版本后复制精确升级命令'
    }

    if (dshLatestVersion == null) {
      latEl.textContent = '点击 ↻ 检查'
      stEl.removeAttribute('data-state')
      stEl.textContent = ''
    } else if (!runtime.currentVersion) {
      // 浏览器半侧读不到 DSH 的本地版本号（它在 node_modules 的 package.json 里，
      // 而本主题按设计不引入 client↔node 桥 —— 见 src/index.ts 里 /bloom stats 的教训）。
      // 这不是错误，是能力边界：不该标红成 err，也不该说「版本未知」装作在比较。
      // 如实说读不到，并且不妨碍「填入」升级命令 —— 那条路不需要知道当前版本。
      latEl.textContent = dshLatestVersion
      stEl.textContent = '本地版本读不到'
      stEl.setAttribute('data-state', 'warn')
    } else {
      latEl.textContent = dshLatestVersion
      const comparison = cmpVersion(dshLatestVersion, runtime.currentVersion)
      if (comparison > 0) {
        stEl.textContent = '↑ 可更新'
        stEl.setAttribute('data-state', 'update')
      } else if (comparison < 0) {
        stEl.textContent = '当前版本较新'
        stEl.setAttribute('data-state', 'ahead')
      } else {
        stEl.textContent = '✓ 已是最新'
        stEl.setAttribute('data-state', 'latest')
      }
    }
    hintEl.hidden = true
    hintEl.textContent = ''
  }

  if (btnRefresh && !btnRefresh.dataset.bloomBound) {
    btnRefresh.dataset.bloomBound = '1'
    btnRefresh.addEventListener('click', async (ev) => {
      ev.stopPropagation()
      // 就地反馈：按钮自己变「检查中」。原先只改上方的 state 文字 —— 而点击时
      // 视线在按钮上，改别处等于没反馈。「检查中」刻意用 3 字与「↻ 检查」同宽，
      // 避免按钮宽度跳动挤压旁边的主按钮。
      const label = btnRefresh.textContent
      btnRefresh.textContent = '检查中'
      btnRefresh.disabled = true
      stEl.textContent = '检查中…'
      stEl.removeAttribute('data-state')
      const liveRuntime = readDshRuntimeInfo()
      if (liveRuntime.updateManagedBy) {
        liveRuntime.requestUpdateCheck?.()
        btnRefresh.disabled = liveRuntime.requestUpdateCheck == null
        btnRefresh.textContent = '检查更新'
        renderDshUpdate()
        return
      }
      try { await checkDshLatest(true) } finally {
        btnRefresh.disabled = false
        btnRefresh.textContent = label
      }
    })
  }
  if (btnCopy && !btnCopy.dataset.bloomBound) {
    btnCopy.dataset.bloomBound = '1'
    btnCopy.addEventListener('click', async (ev) => {
      ev.stopPropagation()
      const liveRuntime = readDshRuntimeInfo()
      if (liveRuntime.updateManagedBy) {
        liveRuntime.requestUpdateCheck?.()
        return
      }
      if (!dshLatestVersion) return
      // 填进去的是**给 AI 的一句话**，不是裸命令 —— 那个框是对话框，
      // 收到一行 `npm i -g ...` 它并不知道你要它干嘛（owner 2026-09-15 指出）。
      // 带上意图和命令，AI 才能直接执行并回报结果。
      const cmd = `帮我把 DSH 升级到 ${dshLatestVersion}，执行：npm i -g @deepseek-ai/dsh@${dshLatestVersion}`
      // 一步到位：直接把这句话填进 DSH 的主输入框，用户回车就能跑
      // （owner 2026-09-15：「最好一步到位，点击后把更新命令输入到主输入框」）。
      // 复制到剪贴板只做了一半 —— 人还得自己找到输入框再粘一次。
      let ok = await fillMainComposer(cmd)
      // 填不进去（找不到输入框 / DSH 换了实现）才退回复制，功能不至于消失。
      if (!ok) {
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(cmd)
            ok = true
          }
        } catch {}
        if (!ok) {
          const ta = document.createElement('textarea')
          ta.value = cmd; ta.style.position = 'fixed'; ta.style.opacity = '0'
          document.body.appendChild(ta); ta.select()
          try { ok = document.execCommand('copy') } catch {}
          ta.remove()
        }
      }
      // 就地反馈：按钮自己变「✓ 已复制」并染成成功色 —— 用户点的是按钮，
      // 反馈就该出现在按钮上。下方那行 hint 仍保留（它带完整命令，便于手动执行），
      // 但不再是唯一的反馈渠道。
      // 「✓ 已复制」与「复制命令」都是 4 个字符宽，替换时布局不跳。
      const label = btnCopy.dataset.bloomLabel || btnCopy.textContent
      btnCopy.dataset.bloomLabel = label
      btnCopy.textContent = ok ? '✓ 已填入' : '✗ 失败'
      btnCopy.classList.add(ok ? 'is-done' : 'is-fail')
      clearTimeout(+(btnCopy.dataset.bloomTimer || 0))
      const t = setTimeout(() => {
        btnCopy.textContent = label
        btnCopy.classList.remove('is-done', 'is-fail')
        hintEl.hidden = true
      }, 1800)
      btnCopy.dataset.bloomTimer = String(t)

      hintEl.hidden = false
      hintEl.textContent = ok ? `✓ 已复制：${cmd}` : `复制失败，请手动执行：${cmd}`
    })
  }
}

/** SemVer 比较：正确处理 alpha / beta / rc；无效输入视为相等。 */
export function cmpVersion(a, b) {
  const pa = parseSemver(a)
  const pb = parseSemver(b)
  if (!pa || !pb) return 0
  for (let i = 0; i < 3; i++) {
    const na = pa.core[i], nb = pb.core[i]
    if (na > nb) return 1
    if (na < nb) return -1
  }
  if (pa.prerelease.length === 0 && pb.prerelease.length === 0) return 0
  if (pa.prerelease.length === 0) return 1
  if (pb.prerelease.length === 0) return -1
  const length = Math.max(pa.prerelease.length, pb.prerelease.length)
  for (let i = 0; i < length; i++) {
    const left = pa.prerelease[i]
    const right = pb.prerelease[i]
    if (left == null) return -1
    if (right == null) return 1
    if (left === right) continue
    const leftNumeric = /^\d+$/.test(left)
    const rightNumeric = /^\d+$/.test(right)
    if (leftNumeric && rightNumeric) return Number(left) > Number(right) ? 1 : -1
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1
    return left > right ? 1 : -1
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
  // 徽标本体躺在「版本与更新」折叠区里，日常是收起的 —— 只写这一处等于
  // 没人看得见（2026-09-10 owner 问"发新版用户知道吗"时发现：自更新检查
  // 一直在跑，但提示要点开面板再展开一层才露出来）。所以往上冒两级：
  // 切换器根节点打标记，CSS 在触发器和「版本与更新」那行各点一个小圆点。
  const root = document.querySelector<HTMLElement>('.dsh-bloom-switcher')
  if (root) root.dataset.bloomUpdate = latestVersion
  const trigger = document.querySelector<HTMLElement>('.dsh-bloom-trigger')
  if (trigger) trigger.title = 'Bloom 主题 · v' + PLUGIN_VERSION + '（可更新到 v' + latestVersion + '）'
}
