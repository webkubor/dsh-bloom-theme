import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
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
/** 切换器读 DSH 版本用的只读端点。 */
const DSH_VERSION_PATH = '/api/bloom/dsh-version';
/**
 * 读出宿主 DSH 的版本号。
 *
 * 浏览器半侧拿不到它 —— `__DSH_BOOT__` 只给得出 7 位 commit rev，于是切换器上
 * 长期显示一串 hash 加「本地版本读不到」（owner 2026-09-15 连续两次指出）。
 * 版本号就在 `@deepseek-ai/dsh/package.json` 里，node 半侧一读即得。
 *
 * 这不违反本仓库「不引入 client↔node 实时桥」的定位：那条说的是 /bloom stats
 * 那种需要持续同步本地 git 状态的功能；读一个静态版本号是一次性的、只读的、
 * 零状态的，和实时桥不是一回事。判断标准是「要不要持续同步」，不是「有没有端点」。
 */
function readDshVersion() {
    try {
        const require = createRequire(import.meta.url);
        const pkgPath = require.resolve('@deepseek-ai/dsh/package.json');
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        if (typeof pkg.version === 'string')
            return { version: pkg.version };
        return { error: 'version field missing or non-string' };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { error: msg };
    }
}
function apply(ctx) {
    ctx.effect?.(() => ctx.webServer?.register({
        kind: 'exact',
        path: DSH_VERSION_PATH,
        handler: (request, response) => {
            if (request.method !== 'GET' && request.method !== 'HEAD') {
                response.writeHead(405, { allow: 'GET, HEAD' });
                response.end();
                return;
            }
            const result = readDshVersion();
            const body = JSON.stringify(result.version !== undefined
                ? { ok: true, version: result.version }
                : { ok: false, reason: result.error ?? 'unknown' });
            response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
            response.end(body);
        }
    }, 'dsh-bloom-theme: dsh version route'));
}
export const inject = ['webServer'];
export { apply, name };
