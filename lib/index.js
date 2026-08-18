/**
 * dsh-bloom-theme —— node 半侧（cordis plugin）。
 *
 * dsh 用 `await import()` 动态加载 lib/index.js，要求 default export 是
 * function 或 `{ apply: function }`。ESM `export { apply }` 通过 interop
 * 拿到的是 `{ default: { apply } }`，cordis 看 `.apply === undefined` → 报
 * "invalid plugin, expect function or object with an apply method"。
 *
 * 浏览器半侧经 package.json 的 exports["./client"] 由 dsh.client roster
 * 加载；本文件只注册 cordis 节点（no-op），让插件出现在 host 配置树。
 */
function apply() {}

export default { apply };