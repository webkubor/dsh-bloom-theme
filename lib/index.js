/**
 * dsh-bloom-theme —— node 半侧（cordis plugin）。
 *
 * dsh 通过 `await import()` 加载 lib/index.js，cordis 校验规则（cordis/src/registry.ts）：
 *   - module 自身必须直接是 function，或直接是 `{ apply: function }`
 *   - 即 `module.apply` 是 function；不能用 `{ default: { apply } }`
 *
 * 因此 default export 直接是一个 function，cordis 视为合法插件：
 *   typeof module === 'function' → resolve() 返回 module 本身 → registry 接受。
 *
 * apply 是 no-op（皮肤插件不需要 server 逻辑）；浏览器半侧经 package.json 的
 * exports["./client"] 由 dsh.client roster 加载，独立路径。
 */
function apply() {}
export default apply;