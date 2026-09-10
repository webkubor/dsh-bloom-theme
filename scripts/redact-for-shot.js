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
 */
;(() => {
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

  return {
    projects: document.querySelectorAll('[class*="_projectRow"]').length,
    sessions: document.querySelectorAll('[class*="_sessionRow"]').length,
    clearedBubbles: bubbles.length,
  }
})()
