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
 *
 * v0.5.0 起本半侧额外注册 `/bloom stats`：读取本地 git 仓库，输出可「秀」的
 * 代码统计（文本摘要；`--card` 生成一张自包含 HTML 卡，可另存/打印为图片）。
 */
import { computeStats, renderStatsText, renderStatsCardHTML } from './stats.js';
import { writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
const name = 'bloom';
const inject = ['commands'];
const USAGE = 'Usage: /bloom stats [目录] [--card[=输出路径]]';
/** 解析 `/bloom stats` 的原始输入。 */
function parseCmd(rawInput) {
    const raw = String(rawInput || '').trim();
    const m = raw.match(/^stats\b(.*)$/is);
    const rest = (m ? m[1] : raw).trim();
    let dir = '';
    let writeCard = false;
    let cardPath = '';
    for (const tok of rest.split(/\s+/)) {
        if (!tok)
            continue;
        if (tok === '--card')
            writeCard = true;
        else if (tok.startsWith('--card=')) {
            writeCard = true;
            cardPath = tok.slice('--card='.length);
        }
        else
            dir = tok;
    }
    return { dir, writeCard, cardPath };
}
function apply(ctx) {
    ctx.commands.register({
        name: 'bloom',
        description: 'Bloom 主题 & 一键代码统计卡',
        input: { hint: 'stats [目录] [--card[=输出路径]]' },
        handler: (invocation) => {
            const { dir, writeCard, cardPath } = parseCmd(invocation.rawInput);
            const target = dir || process.cwd();
            let s;
            try {
                s = computeStats(target);
            }
            catch {
                return {
                    kind: 'error',
                    text: `/bloom stats 失败：无法统计 "${target}"（需要是该目录或其子目录下的 git 仓库）。\n${USAGE}`,
                };
            }
            // 默认：纯文本摘要
            if (!writeCard)
                return { kind: 'success', text: renderStatsText(s) };
            // `--card`：生成一张自包含 HTML 卡（可另存 / 浏览器打印导出为图片）
            const out = resolve(s.root, cardPath ? cardPath : join(s.root, 'bloom-stats-card.html'));
            try {
                writeFileSync(out, renderStatsCardHTML(s));
                return {
                    kind: 'success',
                    text: `已生成代码统计卡：\n${out}\n\n用浏览器打开后截图，或「打印 → 另存为 PDF」即可分享。\n${USAGE}`,
                };
            }
            catch {
                return { kind: 'error', text: `写入卡文件失败：${out}\n${USAGE}` };
            }
        },
    });
}
export { apply, inject, name };
