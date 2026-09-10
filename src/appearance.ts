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
 * 这三个按钮**页面刚加载时不在 DOM 里**（实测 querySelectorAll 数量为 0），
 * 设置面板打开过一次之后才出现 —— 而且此后一直留着，关掉面板也在。
 *
 * 所以 ensureHostButtons() 在找不到时会开一下设置面板再关上。代价是面板
 * 在左下角闪一下；换来的是深浅状态永远跟宿主一致，不用猜它把主题存在哪
 * （不在 localStorage，body 上只有一个标记位）。
 *
 * ⚠️ 我第一次测这件事时把结论搞反了：当时手动开过设置面板，再去测"关掉后还在不在"，
 * 于是得出"常驻 DOM"。干净页面上重测才发现首次是 0 个。测环境要干净。
 */

export type AppearanceMode = 'light' | 'dark' | 'system'

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

/** 设置面板的触发器。按文字认，不认 hash 类名。 */
function findSettingsTrigger(): HTMLElement | null {
  // 必须限定 <button>：`[class*="_trigger"]` 会先命中外层的 triggerRow（一个 DIV），
  // 那层不是可点目标 —— 点它毫无反应，面板不会开。
  // 2026-09-10 实测：elementFromPoint 在该坐标上落在内层 BUTTON.VOzbGW_trigger，
  // 而按 DOM 顺序取到的第一个匹配是它的父 DIV，于是"点了但没反应"。
  const scope = document.querySelector('[class*="_settingsArea"]') || document
  for (const el of Array.from(scope.querySelectorAll<HTMLElement>('button[class*="_trigger"]'))) {
    if (el.closest('.dsh-bloom-switcher')) continue        // 别把我们自己的触发器当设置
    if (/^设置$|^settings$/i.test((el.innerText || '').trim())) return el
  }
  return null
}

/** 有没有设置入口 —— 外观行的显隐判据（按钮本身平时不在 DOM） */
export function hasSettingsEntry(): boolean { return !!findSettingsTrigger() }

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * 拿到宿主按钮；没有就开一下设置面板把它们叫出来，再关回去。
 *
 * 面板开合各点一次同一个触发器。全程最多约 400ms，失败就返回空表 ——
 * 调用方据此隐藏整行，不给一个点不动的控件。
 */
export async function ensureHostButtons(): Promise<Map<AppearanceMode, HTMLElement>> {
  let found = findHostButtons()
  if (found.size > 0) return found

  const settings = findSettingsTrigger()
  if (!settings) return found

  settings.click()
  for (let i = 0; i < 8; i++) {                 // 最多等 400ms
    await sleep(50)
    found = findHostButtons()
    if (found.size > 0) break
  }
  // 关回去：面板是用户没主动打开的，不该留在屏幕上
  settings.click()
  return found
}

/**
 * 切到某个模式：开设置面板 → 点对应按钮 → 关面板。
 *
 * 必须每次都开一次：这些按钮**跟随面板生灭**，面板一关就从 DOM 里移除
 * （2026-09-10 实测：开着时 3 个，关掉后 querySelectorAll 返回 0）。
 * 所以没法"预热一次然后一直用"。
 */
export async function setMode(mode: AppearanceMode): Promise<boolean> {
  const settings = findSettingsTrigger()
  if (!settings) return false

  const already = findHostButtons().get(mode)
  if (already) { already.click(); return true }   // 面板恰好开着

  settings.click()
  let target: HTMLElement | undefined
  for (let i = 0; i < 10; i++) {
    await sleep(50)
    target = findHostButtons().get(mode)
    if (target) break
  }
  if (target) target.click()
  // 点完要给宿主留出应用主题的时间再关面板：只等 40ms 会把变更打断，
  // 表现成"点了没反应"。2026-09-10 实测对比 —— 面板开着手动点立刻生效，
  // 走这条路径却切不过去，差别只在这个等待。
  await sleep(260)
  settings.click()          // 关回去：面板是我们替用户开的，不该留在屏幕上
  return !!target
}

/** 当前深浅：面板通常关着（读不到按钮选中态），改用 body 上的标记推断。 */
export function currentIsDark(): boolean {
  return document.body.hasAttribute('data-ds-dark-theme')
}
