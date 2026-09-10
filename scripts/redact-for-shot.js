/**
 * 截图脱敏（开发用，不随 npm 包分发）。
 *
 * 为什么需要它：展示图里的侧栏会把**真实工作区**一览无余 —— 项目名、会话标题、
 * 时间戳。这些图会进 README 和 GitHub Release，等于把私有项目清单公开发布。
 * 2026-09-10 owner 明确要求：「之后你截图不要暴露太多我的项目信息」。
 *
 * 用法（ego-browser / Playwright 里都一样，截图**之前**注入）：
 *   await js(fs.readFileSync('scripts/redact-for-shot.js', 'utf8'))
 *
 * 假数据沿用 README 里已有那套（my-app / design-system / Refactor auth flow …），
 * 换一套会让新旧展示图对不上号。
 *
 * 只改 DOM 文本，不写 localStorage、不发请求 —— 刷新即恢复。
 *
 * **它是闸门，不是工具**：结尾会拿脱敏前记下的真名反查整页，还有残留就抛错，
 * 让 js() 调用直接失败 —— 调用方拿不到返回值，也就走不到截图那一步。
 * 别用 try/catch 包住它继续截图。
 */
;(() => {
  // 脱敏**前**先把真名记下来 —— 下面收尾时要拿它反查有没有漏网的。
  // 用现场读到的真名当断言依据（而不是维护一份写死的黑名单），
  // 换台机器、换个工作区都不用改这份脚本。
  const TARGETS = '[class*="_sidebarCol"] [class*="_projectRow"], [class*="_sidebarCol"] [class*="_sessionRow"],'
    + ' [class*="_workspaceLabel"], [class*="_header"] [class*="_title"]'
  const targetEls = [...document.querySelectorAll(TARGETS)]
  const firstLine = (el) => (el.innerText || '').trim().split('\n')[0].trim()

  // 界面自带的固定文案（"新会话""设置""工作区"…）也可能正好等于某个会话标题。
  // 它们不是隐私，而且脱敏后照样留在页面上 —— 不排掉就会把断言变成必然误报。
  // 判据是"这段文字在脱敏目标之外也出现过"，不写死名单，换语言/换版本都不用改。
  const chrome = new Set()
  document.querySelectorAll('body *').forEach((el) => {
    if (el.children.length) return
    if (targetEls.some((t) => t === el || t.contains(el))) return
    const t = (el.textContent || '').trim()
    if (t) chrome.add(t)
  })

  const realNames = new Set()
  targetEls.forEach((el) => {
    const t = firstLine(el)
    // 太短的（"…"、时间戳）留着会误报，长度门槛卡在 3
    if (t.length >= 3 && !chrome.has(t)) realNames.add(t)
  })

  const PROJECTS = ['my-app', 'design-system', 'api-server', 'docs-site', 'playground', 'sandbox']
  const SESSIONS = [
    'Refactor auth flow', 'Add dark mode toggle', 'Fix pagination bug',
    'Update dependencies', 'Write API docs', 'Improve error handling',
    'Optimize bundle size', 'Migrate to v2',
  ]

  const setText = (el, text) => {
    // 只换纯文本节点，保留图标 / 徽标 / 时间戳那些兄弟节点
    const t = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim())
    if (t) t.textContent = text
    else el.textContent = text
  }

  const pick = (arr, i) => arr[i % arr.length]

  // 侧栏项目名
  document.querySelectorAll('[class*="_sidebarCol"] [class*="_projectRow"]').forEach((row, i) => {
    const label = row.querySelector('[class*="_projectText"], [class*="_title"]') || row
    setText(label, pick(PROJECTS, i))
  })

  // 侧栏会话标题
  document.querySelectorAll('[class*="_sidebarCol"] [class*="_sessionRow"]').forEach((row, i) => {
    const label = row.querySelector('[class*="_title"]') || row
    setText(label, pick(SESSIONS, i))
  })

  // 顶栏当前会话标题
  document.querySelectorAll('[class*="_header"] [class*="_title"]').forEach((el, i) => {
    setText(el, pick(SESSIONS, i))
  })

  // 输入卡上方那枚"当前工作区"胶囊 —— 它不在侧栏里，很容易漏
  // （2026-09-10 第一版脱敏就漏了它，侧栏全假、这里还写着真项目名）
  document.querySelectorAll('[class*="_workspaceLabel"]').forEach((el) => setText(el, PROJECTS[0]))

  // 正文：展示图一律用空会话（hero 态）。万一带了消息，这里兜底清掉 ——
  // 消息内容比项目名敏感得多（代码片段、路径、内部系统名都在里面）。
  const bubbles = document.querySelectorAll('[class*="_bubble"], [class*="_scrollBody"] [class*="_markdown"]')
  bubbles.forEach((b) => { b.textContent = '' })

  // ⛔ 自校验：漏网就**抛错**，不是返回一个没人看的 warning。
  // 这条是这份脚本存在的意义 —— 靠人记得"还要检查一遍"是不可靠的，
  // v0.11.0 那次就是每一处都想到了、唯独漏了输入卡上的工作区胶囊。
  // 抛错会让 js() 调用失败，调用方拿不到结果、走不到截图那一步。
  const page = document.body.innerText
  const leaked = [...realNames].filter((n) => page.includes(n))
  if (leaked.length) {
    throw new Error(
      '[redact-for-shot] 脱敏不完整，以下真实名称仍出现在页面上：'
      + JSON.stringify(leaked)
      + ' —— 说明有新的 DOM 位置没被覆盖。补上对应选择器再截图，不要手动绕过这个断言。',
    )
  }

  // 结果同时挂到 window：某些执行环境（如 ego-browser 的 js()）会把整段源码
  // 再包一层 IIFE，导致这里的返回值被丢掉。调用方读 window.__bloomRedact 更稳。
  const result = {
    ok: true,
    projects: document.querySelectorAll('[class*="_projectRow"]').length,
    sessions: document.querySelectorAll('[class*="_sessionRow"]').length,
    clearedBubbles: bubbles.length,
    verifiedAgainst: realNames.size,
  }
  window.__bloomRedact = result
  return result
})()
