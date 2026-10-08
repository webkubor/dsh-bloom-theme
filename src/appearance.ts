/**
 * 深浅外观切换 —— 把 DSH 埋在「设置」里的浅色/深色/跟随系统提到顶栏。
 *
 * 为什么做这个（owner 2026-09-10）：切深浅要点开左下角设置面板才够得着，
 * 而这是个高频动作。Bloom 的下拉本来就挂在顶栏，顺手放进去。
 *
 * ## 为什么是代点宿主按钮，不是自己改 body 属性
 *
 * 深浅状态由 DSH 自己持有：body 上只有一个 `data-ds-dark-theme` 标记，
 * localStorage 里没有任何主题键 —— 说明它存在宿主侧（settings/服务端）。
 * 自己 removeAttribute 能立刻变色，但刷新就回退，而且和设置面板里的选中态
 * 对不上，等于制造两个真源。
 *
 * 所以这里只做「入口」：找到设置面板里那三个按钮直接 click，
 * 状态怎么存、怎么持久化，全交给 DSH。它改实现我们跟着变，不用同步。
 *
 * ## 选择器为什么是 [class*="_themeCube"]
 *
 * DSH 的类名带构建 hash（实测 `_8HJdBW_themeCube`），hash 每次发版都可能变。
 * 项目 check 里有一条硬规则「无硬编码 DSH hash 类名，全部走 [class*="_语义名"]」，
 * 这里遵守同一条。
 *
 * ## 按钮是懒渲染的，首次要把面板"叫醒"
 *
 * 这三个按钮跟随设置面板生灭：面板关着就不在 DOM 里（实测开着时 3 个，
 * 关掉后 querySelectorAll 返回 0），所以没法"预热一次然后一直用"，
 * 每次用都得先把面板打开。
 *
 * ## 设置入口本身换过位置（DSH 0.2.0）
 *
 * 原来侧栏底部有一颗写着「设置」的独立按钮（类名带 `_trigger`）。新版本把
 * 设置**收进了账号菜单**：那颗按钮换成了显示头像/账号名的账号入口，点开是
 * 浮层菜单，第一项才是「设置」。
 *
 * 后果是原来那条「找文字是『设置』的 `_trigger` 按钮」的判据永远落空 ——
 * 账号按钮类名一样带 `_trigger`，文字却是账号名。于是 `hasSettingsEntry()`
 * 恒为 false，外观整行（含「模式」标题）被隐藏，表现就是**三个模式 tab 集体消失**。
 *
 * 两条路都留着：认到独立按钮就点它，认到账号入口就先开菜单再点「设置」那一项。
 * 菜单是 portal 到 body 的，菜单项只能在 document 上找。
 */

export type AppearanceMode = 'light' | 'dark' | 'system'

/**
 * 深浅模式的持久化键。
 *
 * 原设计不敢自己改 body 属性（怕刷新回退、怕和设置面板对不上），于是走
 * "代点宿主按钮"路线 —— 结果每次切换都要开一次设置弹窗、切分区、点色块、
 * 再关弹窗。那不是"一键切换"，是给设置面板做了个快捷方式（owner 2026-10-08）。
 *
 * 现在直接改 body 属性（立刻生效），用 localStorage 持久化（刷新不回退），
 * 启动时重放。和设置面板的选中态确实存在双真源，但代价是 1 秒弹窗 vs 几乎
 * 不可能遇到的"两边同时改"，不值得。
 */
const BLOOM_MODE_KEY = 'bloom-appearance-mode'

/** 把深浅模式应用到 body 属性。system 读当前 OS 偏好。 */
function applyMode(mode: AppearanceMode): void {
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.body.toggleAttribute('data-ds-dark-theme', prefersDark)
  } else {
    document.body.toggleAttribute('data-ds-dark-theme', mode === 'dark')
  }
}

/** 读持久化的深浅模式；无存档或值非法回退 system。 */
export function readStoredMode(): AppearanceMode {
  try {
    const stored = localStorage.getItem(BLOOM_MODE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {}
  return 'system'
}

/**
 * 切换深浅模式 —— 同步、零弹窗。
 *
 * 直接改 body 属性（DSH 的 CSS 靠 `[data-ds-dark-theme]` 切色，Bloom 同理），
 * 持久化到 localStorage，启动时 initAppearanceSync 重放。
 */
export function setMode(mode: AppearanceMode): void {
  applyMode(mode)
  try { localStorage.setItem(BLOOM_MODE_KEY, mode) } catch {}
}

/**
 * 启动时重放持久化的深浅模式；system 模式下监听 OS 偏好变化。
 *
 * ⚠️ 三种模式**都要** applyMode，包括 system —— system 不是「什么都不做」，
 * 它是「读当前 OS 偏好落到 body 上」，那正是它需要执行的那一步。
 * 曾经写成 `if (mode !== 'system') applyMode(mode)`，于是：
 * 用户点「跟随系统」→ 存 system → 重启后从没应用过 OS 偏好，菜单里
 * 「跟随系统」显示选中，实际却是 DSH 恢复的旧值；而 matchMedia 只在
 * **之后**偏好变化时才触发，所以整个会话都跟错。
 * 首次安装（无存档，readStoredMode 回落 system）同样中招。
 * Codex PR #41 / Cursor bugbot 各自独立报了这条（P2）。
 */
export function initAppearanceSync(): void {
  applyMode(readStoredMode())
  // "跟随系统"下 OS 偏好变了要跟着变
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', () => {
    if (readStoredMode() === 'system') applyMode('system')
  })
}

/** 按钮文字 → 模式。DSH 中英文界面都覆盖，认不出的按钮直接忽略。 */
const LABEL_TO_MODE: Array<[RegExp, AppearanceMode]> = [
  [/^浅色|^light/i, 'light'],
  [/^深色|^暗色|^dark/i, 'dark'],
  [/跟随系统|system|auto/i, 'system'],
]

function modeOf(el: Element): AppearanceMode | null {
  const text = (el as HTMLElement).innerText?.trim() || ''
  for (const [re, mode] of LABEL_TO_MODE) if (re.test(text)) return mode
  return null
}

/** 宿主的三个外观按钮。DSH 换了实现就返回空数组，调用方据此隐藏整行。 */
export function findHostButtons(): Map<AppearanceMode, HTMLElement> {
  const out = new Map<AppearanceMode, HTMLElement>()
  for (const el of Array.from(document.querySelectorAll('[class*="_themeCube"]'))) {
    const m = modeOf(el)
    if (m && !out.has(m)) out.set(m, el as HTMLElement)
  }
  return out
}

/** 当前选中的模式：读宿主按钮上的 selected 类，不自己推断 */
export function currentMode(): AppearanceMode | null {
  for (const [mode, el] of findHostButtons()) {
    if (/selected/i.test(el.className?.toString() || '')) return mode
  }
  return null
}

/** 设置入口的判据：文字要**整个**是「设置」，账号名、「更多」都不算。 */
const SETTINGS_LABEL = /^设置$|^settings$/i
/** 设置面板的「通用设置」分区 —— 外观三个色块住在这一节里。 */
const GENERAL_LABEL = /^通用设置$|^通用$|^general$/i

/**
 * 行内文字的第一段。
 *
 * 菜单项尾巴上可能挂着快捷键角标（`aria-hidden` 的一小段 keycap），innerText
 * 照样把它算进来 —— 「设置 ⌘,」按全等匹配会漏掉。取第一行就干净了。
 */
function rowText(el: HTMLElement): string {
  return (el.innerText || '').trim().split('\n')[0].trim()
}

/** 侧栏底部那块入口区。DSH 把设置/账号入口都渲染在里面。 */
function settingsScope(): ParentNode {
  return document.querySelector('[class*="_settingsArea"]') || document
}

/**
 * 老形态：一颗写着「设置」的独立按钮。
 *
 * 必须限定 <button>：`[class*="_trigger"]` 会先命中外层的 triggerRow（一个 DIV），
 * 那层不是可点目标 —— 点它毫无反应，面板不会开。
 * 2026-09-10 实测：elementFromPoint 在该坐标上落在内层 BUTTON.VOzbGW_trigger，
 * 而按 DOM 顺序取到的第一个匹配是它的父 DIV，于是"点了但没反应"。
 */
function findDirectSettingsButton(): HTMLElement | null {
  for (const el of Array.from(settingsScope().querySelectorAll<HTMLElement>('button[class*="_trigger"]'))) {
    if (el.closest('.dsh-bloom-switcher')) continue        // 别把我们自己的触发器当设置
    if (SETTINGS_LABEL.test(rowText(el))) return el
  }
  return null
}

/**
 * 新形态：账号菜单入口（DSH 0.2.0 起）。
 *
 * 判据用 `aria-haspopup="menu"` 而不是类名或文字 —— 账号名、登录态、有无头像
 * 都会改文字，只有"这颗按钮会开一个菜单"是稳定的。
 */
function findAccountLauncher(): HTMLElement | null {
  for (const el of Array.from(settingsScope().querySelectorAll<HTMLElement>('button[aria-haspopup="menu"]'))) {
    if (el.closest('.dsh-bloom-switcher')) continue
    return el
  }
  return null
}

/** 账号菜单里那一项「设置」。菜单 portal 到 body，不能在 settingsScope 里找。 */
function findSettingsMenuItem(): HTMLElement | null {
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[role="menu"] button[role="menuitem"]'))) {
    if (SETTINGS_LABEL.test(rowText(el))) return el
  }
  return null
}

/** 有没有设置入口 —— 外观行的显隐判据（两种形态任一成立就算有） */
export function hasSettingsEntry(): boolean {
  return !!(findDirectSettingsButton() ?? findAccountLauncher())
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * 轮询等一个东西出现。
 *
 * 面板和菜单都是 React 异步渲染的，点完只能等；先查一次再睡，命中时不花时间。
 */
async function waitFor<T>(pick: () => T | null, tries = 12, gap = 50): Promise<T | null> {
  for (let i = 0; i < tries; i++) {
    const hit = pick()
    if (hit) return hit
    await sleep(gap)
  }
  return null
}

/** 打开设置面板。返回有没有成功把面板叫出来。 */
async function openSettingsPanel(): Promise<boolean> {
  const direct = findDirectSettingsButton()
  if (direct) { direct.click(); return true }

  const launcher = findAccountLauncher()
  if (!launcher) return false
  launcher.click()
  const item = await waitFor(findSettingsMenuItem)
  if (!item) return false
  item.click()
  return true
}

/**
 * 把面板切到「通用设置」分区。
 *
 * 登录后账号分区 order=-10，面板默认落在它上面，而外观三个色块在通用分区里 ——
 * 不切过去就永远数不到按钮（这一节只在面板刚打开时需要，面板已开着且在通用
 * 分区时 navCell 上的 aria-current 已是 true，直接返回）。
 */
function ensureGeneralSection(): void {
  // 用和 closeSettingsPanel 同一个具体选择器 —— `[role="dialog"]` 可能撞上
  // 其他弹层（Toast、确认框），拿到的不是设置面板，切分区就白切。
  const dialog =
    document.querySelector<HTMLElement>('[role="dialog"][data-shortcut-modal="settings"]') ||
    document.querySelector<HTMLElement>('[role="dialog"]')
  if (!dialog) return
  for (const cell of Array.from(dialog.querySelectorAll<HTMLElement>('button'))) {
    if (!GENERAL_LABEL.test(rowText(cell))) continue
    if (cell.getAttribute('aria-current') === 'true') return
    cell.click()
    return
  }
}

/**
 * 关掉设置面板。
 *
 * 面板自带关闭按钮（在 dialog 内的 `button[class*="_close"]`，两种形态都有），
 * 点它最稳。找不到才退回 Escape —— 面板的 useModalLayer 挂在 document 上收
 * Escape，事件从 document 派发不会经过我们的菜单，两者不会互相干扰。
 */
function closeSettingsPanel(): void {
  try {
    const dialog =
      document.querySelector<HTMLElement>('[role="dialog"][data-shortcut-modal="settings"]') ||
      document.querySelector<HTMLElement>('[role="dialog"]')
    const close = dialog?.querySelector<HTMLElement>('button[class*="_close"]')
    if (close) { close.click(); return }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  } catch { /* 面板已关或 DOM 变了，不值得为关面板抛异常 */ }
}

/**
 * 拿到宿主按钮；没有就开一下设置面板把它们叫出来，再关回去。
 *
 * 代价是面板在屏幕中间闪一下；换来的是深浅状态永远跟宿主一致，不用猜它把主题
 * 存在哪（不在 localStorage，body 上只有一个标记位）。失败返回空表 —— 调用方
 * 据此隐藏整行，不给一个点不动的控件。
 */
export async function ensureHostButtons(): Promise<Map<AppearanceMode, HTMLElement>> {
  let found = findHostButtons()
  if (found.size > 0) return found
  if (!(await openSettingsPanel())) return found

  ensureGeneralSection()
  const cubes = await waitFor(() => {
    const m = findHostButtons()
    return m.size > 0 ? m : null
  })
  closeSettingsPanel()
  return cubes ?? new Map()
}

/** 当前深浅：读 body 上的标记。 */
export function currentIsDark(): boolean {
  return document.body.hasAttribute('data-ds-dark-theme')
}
