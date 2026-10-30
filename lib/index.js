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
/**
 * 读出宿主 DSH 的版本号。
 *
 * 浏览器半侧拿不到它 —— `__DSH_BOOT__` 只给得出 7 位 commit rev，于是切换器上
 * 长期显示一串 hash 加「本地版本读不到」（owner 2026-09-15 连续两次指出）。
 * 桌面端的应用版本在 app.asar/dsh/package.json；Web/CLI 环境则读取
 * `@deepseek-ai/dsh/package.json`。两者可能不同，不能拿内嵌 DSH 包版本冒充桌面应用版本。
 *
 * 这不违反本仓库「不引入 client↔node 实时桥」的定位：那条说的是 /bloom stats
 * 那种需要持续同步本地 git 状态的功能；读一个静态版本号是一次性的、只读的、
 * 零状态的，和实时桥不是一回事。判断标准是「要不要持续同步」，不是「有没有端点」。
 */
/**
 * 判断宿主是桌面端 app 还是 Web UI / CLI。
 *
 * 判据用**能力**而不是某个字符串常量 —— 那类常量换过名（0.2.0 换过桥，
 * 详见 src/version.ts 的注释）。这里用两个互相独立的证据：
 *   · 进程跑在 .app 里 —— 桌面端由 Electron 启动，execPath 必然含 .app/Contents/
 *   · 桌面运行时清单存在且自称 dsh-desktop-runtime
 * 两者同时成立才算桌面端：单看任一条都可能误判（Electron 也可能跑 CLI 工具，
 * 而 .app 目录也可能只是恰好在磁盘上）。
 */
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
        catch { /* 不是桌面端就当 Web */ }
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
            const body = JSON.stringify(result.version !== undefined
                ? {
                    ok: true,
                    version: result.version,
                    // 宿主形态：desktop = 桌面端 app，web = Web UI / CLI。
                    // 用户装的是哪个版本，这一个字段说了算（2026-10-30 加）。
                    platform: detected.platform,
                }
                : {
                    ok: false,
                    reason: result.error ?? 'unknown',
                    platform: detected.platform,
                });
            response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
            response.end(body);
        }
    }, 'dsh-bloom-theme: dsh version route'));
}
export const inject = ['webServer'];
export { apply, name };
