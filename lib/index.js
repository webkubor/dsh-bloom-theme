/**
 * dsh-bloom-theme —— node 半侧。
 * 纯皮肤插件：空 apply 让插件出现在 cordis Loader / host 配置树；
 * 浏览器半侧经 package.json 的 exports["./client"] 由 dsh.client roster 发现并加载。
 */
function apply() {}
export { apply };
