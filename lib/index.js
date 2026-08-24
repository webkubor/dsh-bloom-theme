/**
 * dsh-bloom-theme —— node 半侧（cordis plugin）。
 *
 * 本半侧不做任何业务，只提供一个空 apply 让 DSH 的 cordis-plugin-loader
 * 认得这个包。真正的主题逻辑全在浏览器半侧（见 src/client.ts），
 * 经 package.json 的 exports["./client"] 由 dsh.client roster 加载。
 *
 * dsh 自己 `@deepseek-ai/dsh-client-ui-trajectory` 这类零业务插件用的就是
 * named export 形式：
 *   function apply() {}
 *   export { apply }
 *
 * ── 为什么这里空了 ──
 * v0.5.0~0.7.0 曾在这里注册 `/bloom stats`（读本地 git 出代码统计卡）。
 * 2026-08-24 移除：那块功能的浏览器端展示从来没真正工作过 —— 顶栏卡片想读
 * `/bloom-stats.json`，而**没有任何代码提供过这个端点**（实测 404），于是永远
 * fallback 到硬编码的 STATS_SAMPLE，任何用户看到的都是本仓库的示例数字
 * （3864 行 / 45 文件 / 47 提交，项目名固定 dsh-bloom-theme）。
 *
 * 根本矛盾是浏览器端拿不到本地 git 数据，而主题不引入 client↔node 实时桥。
 * 与其留一个假数据的「统计」，不如删干净 —— 本仓库的定位是配色 + 质感 +
 * 切换器（见 README「一句话」与 CONTRIBUTING「范围边界」）。
 * `npm run check` 的 /bloom 子命令白名单现已收紧为空，防止再长回来。
 */
const name = 'bloom';
function apply() { }
export { apply, name };
