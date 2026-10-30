import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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
function detectPlatform() {
    const appMarker = '.app/Contents/';
    const appIndex = process.execPath.indexOf(appMarker);
    if (process.platform === 'darwin' && appIndex !== -1) {
        try {
            const appRoot = process.execPath.slice(0, appIndex + '.app'.length);
            const runtimePath = join(appRoot, 'Contents/Resources/app.asar/dsh/package.json');
            const runtime = JSON.parse(readFileSync(runtimePath, 'utf8'));
            if (runtime.name === '@deepseek-ai/dsh-desktop-runtime' && typeof runtime.version === 'string') {
                return { platform: 'desktop', desktopVersion: runtime.version };
            }
        }
        catch { /* 清单读不出来 —— 形态未知，交给浏览器侧兜底 */ }
        return { platform: 'unknown' };
    }
    return { platform: 'web' };
}
function readDshVersion(detected) {
    try {
        // 桌面宿主由 Electron 启动：它的 fs 可读取 app.asar 内的文件。
        // 内嵌的 @deepseek-ai/dsh 包可能比桌面应用落后（实测 rc.5 桌面端旧端点报 rc.3），
        // 版本提示必须读取桌面运行时清单；读不到时才沿用原来的 npm 包版本。
        if (detected.desktopVersion)
            return { version: detected.desktopVersion };
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
            const detected = detectPlatform();
            const result = readDshVersion(detected);
            // 形态未知时**不下发** platform：浏览器侧还能用桌面桥兜底。
            // 下发一个错的 'web' 反而会把桌面端标成 Web（Codex PR #72 P2）。
            const platform = detected.platform === 'unknown' ? {} : { platform: detected.platform };
            const body = JSON.stringify(result.version !== undefined
                ? { ok: true, version: result.version, ...platform }
                : { ok: false, reason: result.error ?? 'unknown', ...platform });
            response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
            response.end(body);
        }
    }, 'dsh-bloom-theme: dsh version route'));
}
export const inject = ['webServer'];
export { apply, name };
