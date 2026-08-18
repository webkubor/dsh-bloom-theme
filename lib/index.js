/**
 * dsh-bloom-theme —— node 半侧（cordis plugin）。
 *
 * dsh 自己 `@deepseek-ai/dsh-client-ui-trajectory` 同类零业务插件用 named export：
 *   function apply() {}
 *   export { apply };
 * dsh 的 cordis-plugin-loader 接受 ESM named export 形式。
 *
 * 浏览器半侧经 package.json 的 exports["./client"] 由 dsh.client roster
 * 加载，独立路径。
 */
function apply() {}
export { apply };